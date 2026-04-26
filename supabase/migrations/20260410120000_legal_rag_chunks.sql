-- RAG: legal knowledge chunks + eval cases (OpenAI text-embedding-3-small, 1536 dims)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.legal_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_key TEXT UNIQUE NOT NULL,
  title TEXT,
  jurisdiction TEXT NOT NULL DEFAULT 'RI',
  topic TEXT NOT NULL,
  source_name TEXT,
  source_url TEXT,
  source_type TEXT,
  chunk_text TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  citation_strength TEXT DEFAULT 'low',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS legal_chunks_jurisdiction_idx ON public.legal_chunks (jurisdiction);
CREATE INDEX IF NOT EXISTS legal_chunks_topic_idx ON public.legal_chunks (topic);
-- After seeding, add for scale: USING hnsw (embedding vector_cosine_ops)

CREATE TABLE IF NOT EXISTS public.eval_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_key TEXT UNIQUE NOT NULL,
  user_query TEXT NOT NULL,
  expected_topics TEXT[] DEFAULT '{}',
  ideal_answer TEXT NOT NULL,
  safe_response TEXT,
  risk_level TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.legal_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eval_cases ENABLE ROW LEVEL SECURITY;

-- Service role only (app uses SUPABASE_SERVICE_ROLE_KEY for seed + retrieve)
CREATE POLICY "Service role legal_chunks" ON public.legal_chunks FOR ALL USING (false);
CREATE POLICY "Service role eval_cases" ON public.eval_cases FOR ALL USING (false);

-- Optional: allow authenticated read of chunks for future client-side tools (commented)
-- CREATE POLICY "auth read legal_chunks" ON public.legal_chunks FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.match_legal_chunks(
  query_embedding vector(1536),
  match_count INT DEFAULT 5,
  filter_jurisdiction TEXT DEFAULT 'RI'
)
RETURNS TABLE (
  id UUID,
  chunk_key TEXT,
  title TEXT,
  topic TEXT,
  source_name TEXT,
  source_url TEXT,
  chunk_text TEXT,
  tags TEXT[],
  similarity DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.chunk_key,
    c.title,
    c.topic,
    c.source_name,
    c.source_url,
    c.chunk_text,
    c.tags,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.legal_chunks c
  WHERE c.jurisdiction = filter_jurisdiction
    AND c.embedding IS NOT NULL
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

/**
 * Formats match_legal_chunks rows for injection into Ermi / chat system prompts.
 * Fetch matches from POST /api/retrieve or call match_legal_chunks server-side.
 */
export type LegalChunkMatch = {
  title?: string | null;
  topic?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  chunk_text?: string | null;
  similarity?: number | null;
};

export function buildRetrievalContextBlock(matches: LegalChunkMatch[], maxChars = 12000): string {
  if (!matches?.length) {
    return '(No retrieved context.)';
  }
  const parts = matches.map((m, i) => {
    const title = m.title || 'Untitled';
    const topic = m.topic || 'general';
    const src = m.source_name || 'Unknown source';
    const body = (m.chunk_text || '').slice(0, 4000);
    return `[Source ${i + 1}]\nTitle: ${title}\nTopic: ${topic}\nSource: ${src}\nText:\n${body}`;
  });
  let out = parts.join('\n\n---\n\n');
  if (out.length > maxChars) out = out.slice(0, maxChars) + '\n…(truncated)';
  return out;
}

/**
 * RAG fetch flow used by both the legacy chat path and the LangGraph
 * Research agent. Behaves identically to the original `fetchRagContext`
 * inside `pages/api/chat.ts`; the function lives here so both call sites can
 * share it without duplication.
 *
 * Never logs the query text — only `feature` + circuit metadata.
 */

import { createClient } from '@supabase/supabase-js';
import { embedText } from '@/lib/embeddings/openai';
import { buildRetrievalContextBlock } from '@/lib/rag/buildRetrievalContext';
import {
  CIRCUIT_CONFIG,
  CIRCUIT_NAMES,
  circuitIsOpen,
  circuitRecordFailure,
  circuitRecordSuccess,
} from '@/lib/circuitBreaker';
import { createLogger } from '@/lib/logger';
import { withRetry } from '@/lib/resilience';

export type RagOutcome =
  | { kind: 'found'; block: string; matchCount: number }
  | {
      kind: 'missing';
      reason: 'no_matches' | 'config_missing' | 'circuit_open' | 'embed_failed' | 'rpc_failed';
      degraded: boolean;
      circuitOpen: boolean;
    };

export async function fetchRagContext(query: string, requestId: string): Promise<RagOutcome> {
  const name = CIRCUIT_NAMES.RAG_PIPELINE;
  const cfg = CIRCUIT_CONFIG[name];

  if (circuitIsOpen(name, cfg)) {
    createLogger(requestId).warn('rag_skipped_circuit_open', { feature: 'chat' });
    return { kind: 'missing', reason: 'circuit_open', degraded: true, circuitOpen: true };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !process.env.OPENAI_API_KEY) {
    return { kind: 'missing', reason: 'config_missing', degraded: false, circuitOpen: false };
  }

  let embedding: number[];
  try {
    embedding = await embedText(query, { requestId });
  } catch {
    circuitRecordFailure(name, cfg, requestId);
    return { kind: 'missing', reason: 'embed_failed', degraded: true, circuitOpen: false };
  }

  try {
    const result = await withRetry(
      async () => {
        const sb = createClient(url, key);
        const { data, error } = await sb.rpc('match_legal_chunks', {
          query_embedding: embedding,
          match_count: 5,
          filter_jurisdiction: 'RI',
        });
        if (error) throw new Error(error.message || 'match_legal_chunks');
        return data ?? [];
      },
      { maxAttempts: 2 },
    );
    circuitRecordSuccess(name, requestId);
    if (!result.length) {
      return { kind: 'missing', reason: 'no_matches', degraded: false, circuitOpen: false };
    }
    return { kind: 'found', block: buildRetrievalContextBlock(result), matchCount: result.length };
  } catch {
    circuitRecordFailure(name, cfg, requestId);
    return { kind: 'missing', reason: 'rpc_failed', degraded: true, circuitOpen: false };
  }
}

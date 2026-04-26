import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { embedText } from '@/lib/embeddings/openai';
import { checkRateLimit, ipFromRequest } from '@/lib/rateLimit';
import {
  getClientTraceIdFromPagesApi,
  getRequestIdFromPagesApi,
  logApiFlow,
  serializeErrorSafe,
} from '@/lib/logger';
import {
  CIRCUIT_CONFIG,
  CIRCUIT_NAMES,
  circuitIsOpen,
  circuitRecordFailure,
  circuitRecordSuccess,
} from '@/lib/circuitBreaker';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const started = Date.now();
  const requestId = getRequestIdFromPagesApi(req);
  const clientTraceId = getClientTraceIdFromPagesApi(req);

  const flow = (args: {
    outcome: 'success' | 'client_error' | 'rate_limited' | 'server_error';
    status_code: number;
    error?: unknown;
    match_count?: number;
    jurisdiction?: string;
    retrieve_top_k?: number;
  }) => {
    const base = {
      kind: 'api_flow' as const,
      request_id: requestId,
      route: '/api/retrieve',
      feature: 'rag_retrieve',
      user_id: null as string | null,
      outcome: args.outcome,
      status_code: args.status_code,
      duration_ms: Date.now() - started,
      client_trace_id: clientTraceId,
      match_count: args.match_count,
      jurisdiction: args.jurisdiction,
      retrieve_top_k: args.retrieve_top_k,
    };
    if (args.error) {
      const s = serializeErrorSafe(args.error);
      logApiFlow({
        ...base,
        error_type: s.error_type,
        error_code: s.error_code,
        error_message_safe: s.error_message_safe,
      });
    } else {
      logApiFlow(base);
    }
  };

  if (req.method !== 'POST') {
    flow({ outcome: 'client_error', status_code: 405 });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rl = checkRateLimit(`retrieve:${ipFromRequest(req)}`, { maxRequests: 15, windowMs: 60_000 });
  if (!rl.allowed) {
    flow({ outcome: 'rate_limited', status_code: 429 });
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  if (!supabaseUrl || !serviceKey) {
    flow({ outcome: 'server_error', status_code: 503 });
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const { query, jurisdiction = 'RI', topK = 5 } = req.body as {
      query?: string;
      jurisdiction?: string;
      topK?: number;
    };

    if (!query || typeof query !== 'string' || !query.trim()) {
      flow({
        outcome: 'client_error',
        status_code: 400,
        jurisdiction: String(jurisdiction),
        retrieve_top_k: Math.min(Math.max(Number(topK) || 5, 1), 20),
      });
      return res.status(400).json({ error: 'query is required' });
    }

    const queryTrim = query.trim();
    const k = Math.min(Math.max(Number(topK) || 5, 1), 20);
    const j = String(jurisdiction);
    const ragName = CIRCUIT_NAMES.RAG_PIPELINE;
    const ragCfg = CIRCUIT_CONFIG[ragName];

    if (circuitIsOpen(ragName, ragCfg)) {
      flow({
        outcome: 'success',
        status_code: 200,
        match_count: 0,
        jurisdiction: j,
        retrieve_top_k: k,
      });
      return res.status(200).json({
        query: queryTrim,
        matches: [],
        degraded: true,
        circuit_open: true,
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    let queryEmbedding: number[];
    try {
      queryEmbedding = await embedText(queryTrim, { requestId });
    } catch (e) {
      circuitRecordFailure(ragName, ragCfg, requestId);
      flow({
        outcome: 'success',
        status_code: 200,
        match_count: 0,
        jurisdiction: j,
        retrieve_top_k: k,
        error: e,
      });
      return res.status(200).json({
        query: queryTrim,
        matches: [],
        degraded: true,
      });
    }

    const { data, error } = await supabase.rpc('match_legal_chunks', {
      query_embedding: queryEmbedding,
      match_count: k,
      filter_jurisdiction: jurisdiction,
    });

    if (error) {
      circuitRecordFailure(ragName, ragCfg, requestId);
      flow({
        outcome: 'success',
        status_code: 200,
        match_count: 0,
        error: new Error(error.message || 'rpc_error'),
        jurisdiction: j,
        retrieve_top_k: k,
      });
      return res.status(200).json({
        query: queryTrim,
        matches: [],
        degraded: true,
      });
    }

    const matches = data ?? [];
    circuitRecordSuccess(ragName, requestId);
    flow({
      outcome: 'success',
      status_code: 200,
      match_count: matches.length,
      jurisdiction: j,
      retrieve_top_k: k,
    });

    return res.status(200).json({
      query: queryTrim,
      matches,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    circuitRecordFailure(CIRCUIT_NAMES.RAG_PIPELINE, CIRCUIT_CONFIG[CIRCUIT_NAMES.RAG_PIPELINE], requestId);
    flow({ outcome: 'server_error', status_code: 500, error: e });
    return res.status(500).json({ error: msg });
  }
}

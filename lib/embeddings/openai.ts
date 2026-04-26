/**
 * OpenAI text-embedding-3-small (1536 dimensions). Used by /api/retrieve and seed scripts.
 * Set OPENAI_API_KEY in env.
 */
import { createLogger, serializeErrorSafe } from '@/lib/logger';
import { fetchWithTimeout, withRetry, HttpError } from '@/lib/resilience';

const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_TIMEOUT_MS = 10_000;
const EMBED_MAX_ATTEMPTS = 2;

export type EmbedTextOptions = {
  /** Correlate embedding failures with api_flow — never logs input text. */
  requestId?: string;
};

export async function embedText(text: string, opts?: EmbedTextOptions): Promise<number[]> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  try {
    return await withRetry(
      async () => {
        const res = await fetchWithTimeout(
          'https://api.openai.com/v1/embeddings',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: EMBED_MODEL,
              input: text.slice(0, 8000),
            }),
          },
          EMBED_TIMEOUT_MS,
        );
        if (!res.ok) {
          const err = await res.text();
          throw new HttpError(res.status, `OpenAI embeddings failed: ${res.status} ${err.slice(0, 500)}`);
        }
        const data = (await res.json()) as { data: { embedding: number[] }[] };
        const emb = data.data[0]?.embedding;
        if (!emb?.length) {
          throw new Error('OpenAI embeddings: empty embedding');
        }
        return emb;
      },
      { maxAttempts: EMBED_MAX_ATTEMPTS },
    );
  } catch (err) {
    if (opts?.requestId) {
      const s = serializeErrorSafe(err);
      createLogger(opts.requestId).warn('openai_embedding_failed', {
        feature: 'embeddings',
        ...s,
      });
    }
    throw err;
  }
}

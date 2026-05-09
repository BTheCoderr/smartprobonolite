import { z } from 'zod';

/** Allowed opaque recipient-link tokens (path segments — conservative charset). */
const TOKEN_PATTERN = /^[A-Za-z0-9._~-]{10,512}$/;

export type RecipientSessionSafePayload = {
  headline?: string;
  bodyText?: string;
  sharedAtIso?: string;
};

export type RecipientSessionViewModel =
  | { kind: 'invalid_token' }
  | { kind: 'unconfigured' }
  | { kind: 'not_found' }
  | { kind: 'upstream_error' }
  | { kind: 'ok'; data: RecipientSessionSafePayload };

const RecipientPayloadInnerSchema = z.object({
  headline: z.string().max(240).optional(),
  bodyText: z.string().max(8000).optional(),
  sharedAtIso: z.string().max(48).optional(),
});

function sanitizePayload(input: z.infer<typeof RecipientPayloadInnerSchema>): RecipientSessionSafePayload {
  const headline = input.headline?.trim() || undefined;
  const bodyText = input.bodyText?.trim() || undefined;
  const sharedAtIso = input.sharedAtIso?.trim() || undefined;
  return { headline, bodyText, sharedAtIso };
}

function parseRecipientPayload(json: unknown): RecipientSessionSafePayload | null {
  const wrapped = z.object({ recipientView: RecipientPayloadInnerSchema }).safeParse(json);
  if (wrapped.success) {
    return sanitizePayload(wrapped.data.recipientView);
  }
  const flat = RecipientPayloadInnerSchema.safeParse(json);
  if (flat.success) {
    return sanitizePayload(flat.data);
  }
  return null;
}

/**
 * Validates URL token segment. Does not log raw tokens.
 */
export function validateRecipientSessionToken(raw: string | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!TOKEN_PATTERN.test(trimmed)) return null;
  return trimmed;
}

function buildUpstreamUrl(token: string): string | null {
  const template = process.env.POCKETBUDDY_RECIPIENT_SESSION_API_TEMPLATE?.trim();
  if (!template) return null;
  const encoded = encodeURIComponent(token);
  if (template.includes('%TOKEN%')) {
    return template.split('%TOKEN%').join(encoded);
  }
  const base = template.replace(/\/+$/, '');
  return `${base}/${encoded}`;
}

/**
 * Server-only: fetch recipient-facing session copy from your PocketBuddy backend when configured.
 * If POCKETBUDDY_RECIPIENT_SESSION_API_TEMPLATE is unset, returns `unconfigured` (privacy-safe shell UI).
 */
export async function loadRecipientSessionView(token: string): Promise<RecipientSessionViewModel> {
  const url = buildUpstreamUrl(token);
  if (!url) {
    return { kind: 'unconfigured' };
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12_000);

  try {
    const secret = process.env.POCKETBUDDY_RECIPIENT_SESSION_API_SECRET?.trim();
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      return { kind: 'not_found' };
    }

    if (!res.ok) {
      return { kind: 'upstream_error' };
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return { kind: 'upstream_error' };
    }

    const parsed = parseRecipientPayload(json);
    if (!parsed) {
      return { kind: 'upstream_error' };
    }

    return { kind: 'ok', data: parsed };
  } catch {
    return { kind: 'upstream_error' };
  } finally {
    clearTimeout(t);
  }
}

import { supabaseAdmin } from '@/lib/supabaseClient';
import {
  getAdminEmailsFromEnv,
  isInternalApiDevUnscopedAllowed,
} from '@/lib/internal/adminEmailsEnv';

export const ADMIN_EMAILS = getAdminEmailsFromEnv();

export type InternalUserInfo = { id: string; email: string; role: string } | null;

/** How internal diagnostics APIs are secured when a request succeeds. */
export type InternalDiagnosticsAccessMode = 'admin_allowlist' | 'dev_unscoped_override';

export function getInternalDiagnosticsAccessMode(): InternalDiagnosticsAccessMode {
  return ADMIN_EMAILS.length > 0 ? 'admin_allowlist' : 'dev_unscoped_override';
}

export async function resolveInternalUser(headers: Headers): Promise<InternalUserInfo> {
  if (!supabaseAdmin) return null;
  const auth = headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(auth.slice(7));
    if (!user) return null;

    let role = 'free';
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan_tier')
      .eq('id', user.id)
      .single();
    if (profile?.plan_tier) role = profile.plan_tier;

    const email = user.email?.toLowerCase() ?? '';
    if (ADMIN_EMAILS.includes(email)) role = 'admin';

    return { id: user.id, email, role };
  } catch {
    return null;
  }
}

export type InternalDiagGate =
  | { ok: true; user: InternalUserInfo }
  | { ok: false; reason: 'internal_disabled' | 'forbidden' };

/** Safe client-facing strings for 403 responses (no secrets). */
export function messageForInternalGateFailure(reason: 'internal_disabled' | 'forbidden'): string {
  if (reason === 'internal_disabled') {
    return 'Internal diagnostics are not enabled. Set ADMIN_EMAILS or INTERNAL_API_ALLOW_UNSCOPED=true for local development only.';
  }
  return 'Forbidden';
}

/**
 * Internal /api/internal/* routes:
 * - If ADMIN_EMAILS is non-empty: only those emails (with valid Bearer) may access.
 * - If ADMIN_EMAILS is empty: access is denied unless INTERNAL_API_ALLOW_UNSCOPED=true (dev only);
 *   then any authenticated Supabase user may access.
 */
export async function gateInternalDiagnostics(headers: Headers): Promise<InternalDiagGate> {
  const user = await resolveInternalUser(headers);

  if (ADMIN_EMAILS.length > 0) {
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return { ok: false, reason: 'forbidden' };
    }
    return { ok: true, user };
  }

  if (!isInternalApiDevUnscopedAllowed()) {
    return { ok: false, reason: 'internal_disabled' };
  }

  if (!user) {
    return { ok: false, reason: 'forbidden' };
  }

  return { ok: true, user };
}

import { supabaseAdmin } from '@/lib/supabaseClient';

export type LawyerLeadPayload = {
  email?: string;
  full_name?: string;
  firm_name?: string;
  firm_size?: string;
  use_case?: string;
  message?: string;
  source?: string;
};

function strField(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

export async function insertLawyerLead(body: unknown): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabaseAdmin) {
    return { ok: false, message: 'Server misconfigured' };
  }

  const b =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const emailRaw = b.email;
  if (typeof emailRaw !== 'string' || !emailRaw.includes('@')) {
    return { ok: false, message: 'Valid email required' };
  }

  const email = emailRaw.trim().slice(0, 320);
  const full_name = strField(b.full_name, 200);
  const firm_name = strField(b.firm_name, 200);
  const firm_size = strField(b.firm_size, 120);
  const use_case = strField(b.use_case, 500);
  const message = strField(b.message, 2000);
  const source = strField(b.source, 120) ?? 'for-lawyers';

  const { error } = await supabaseAdmin.from('lawyer_leads').insert({
    email,
    full_name,
    firm_name,
    firm_size,
    use_case,
    message,
    source,
  });

  if (error) {
    console.error('lawyer_leads insert', error);
    return { ok: false, message: 'Could not save submission' };
  }

  return { ok: true };
}

import { supabase } from '@/lib/supabaseClient';

/** Optional client-generated id for correlating browser → API logs (server still prefers middleware x-request-id when present). */
export function clientTraceHeaders(): Record<string, string> {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return { 'X-Client-Trace-Id': crypto.randomUUID() };
  }
  return {};
}

/**
 * Build headers with Authorization bearer token from the current Supabase session.
 * Returns plain Content-Type headers if no session is available.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...clientTraceHeaders(),
  };
  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return headers;
}

export type ErmiHandoffSource =
  | 'document'
  | 'expungement'
  | 'output'
  | 'tools'
  | 'generate'
  | string;

export type ErmiHandoffPayload = {
  source: ErmiHandoffSource;
  /** Plain text for the model (keep concise; server also caps length). */
  text: string;
};

const STORAGE_KEY = 'spb:ermi-handoff:v1';

export function setErmiHandoff(payload: ErmiHandoffPayload) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

/** Read and remove handoff (one-shot navigation into chat/tools). */
export function consumeErmiHandoff(): ErmiHandoffPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw) as ErmiHandoffPayload;
    if (!parsed || typeof parsed.text !== 'string') return null;
    return {
      source: typeof parsed.source === 'string' ? parsed.source : 'tools',
      text: parsed.text,
    };
  } catch {
    return null;
  }
}

/** Peek without consuming (e.g. to show a badge). */
export function peekErmiHandoff(): ErmiHandoffPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ErmiHandoffPayload;
    if (!parsed || typeof parsed.text !== 'string') return null;
    return { source: parsed.source ?? 'tools', text: parsed.text };
  } catch {
    return null;
  }
}

export function clearErmiHandoff() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const UPLOAD_KEY = 'spb:free-upload-count';
const DAY_MS = 86400000;

function todayBucket(): string {
  return String(Math.floor(Date.now() / DAY_MS));
}

export function getFreeUploadCountToday(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(UPLOAD_KEY);
    if (!raw) return 0;
    const { day, count } = JSON.parse(raw) as { day: string; count: number };
    if (day !== todayBucket()) return 0;
    return typeof count === 'number' ? count : 0;
  } catch {
    return 0;
  }
}

export function incrementFreeUploadCount(): void {
  if (typeof window === 'undefined') return;
  const day = todayBucket();
  const prev = getFreeUploadCountToday();
  try {
    window.localStorage.setItem(UPLOAD_KEY, JSON.stringify({ day, count: prev + 1 }));
  } catch {
    // ignore
  }
}

/** Free anonymous / free-tier daily document uploads before upgrade prompt. */
export const FREE_DAILY_UPLOAD_LIMIT = 5;

export function canFreeUpload(): boolean {
  return getFreeUploadCountToday() < FREE_DAILY_UPLOAD_LIMIT;
}

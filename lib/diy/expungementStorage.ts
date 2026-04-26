import type { ExpungementData } from './expungementTypes';
import { DEFAULT_EXPUNGEMENT } from './expungementTypes';

const KEY = 'spb:diy-expungement:v1';

export function loadExpungement(): ExpungementData {
  if (typeof window === 'undefined') return { ...DEFAULT_EXPUNGEMENT };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_EXPUNGEMENT };
    const parsed = JSON.parse(raw) as Partial<ExpungementData>;
    return { ...DEFAULT_EXPUNGEMENT, ...parsed };
  } catch {
    return { ...DEFAULT_EXPUNGEMENT };
  }
}

export function saveExpungement(data: ExpungementData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearExpungement() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

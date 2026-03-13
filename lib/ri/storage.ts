import type { IntakeData } from './types';
import { EMBEDDED_MATERIALS } from './embeddedMaterials';

const INTAKE_KEY = 'spb:ri-eviction:intake:v1';
const MATERIALS_KEY = 'spb:ri-eviction:materials:v1';

export type StoredMaterial = {
  id: string;
  title: string;
  extractedText: string;
  addedAtIso: string;
};

export function loadIntake(): IntakeData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(INTAKE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IntakeData;
  } catch {
    return null;
  }
}

export function saveIntake(data: IntakeData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INTAKE_KEY, JSON.stringify(data));
}

export function clearIntake() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(INTAKE_KEY);
}

export function loadMaterials(): StoredMaterial[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MATERIALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredMaterial[];
  } catch {
    return [];
  }
}

export function saveMaterials(materials: StoredMaterial[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
}

export function upsertMaterial(material: StoredMaterial) {
  const existing = loadMaterials();
  const next = [material, ...existing.filter((m) => m.id !== material.id)].slice(0, 10);
  saveMaterials(next);
}

export function clearMaterials() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MATERIALS_KEY);
}

/** Materials to use for grounding citations. Uses localStorage uploads if any; otherwise embedded RI materials. */
export function getMaterialsForGrounding(): StoredMaterial[] {
  const fromStorage = loadMaterials();
  if (fromStorage.length > 0) return fromStorage;
  return EMBEDDED_MATERIALS.filter((m) => m.extractedText && m.extractedText.length > 0).map(
    (m, i) =>
      ({
        id: `embedded-${i}`,
        title: m.title,
        extractedText: m.extractedText,
        addedAtIso: new Date(0).toISOString(),
      }) as StoredMaterial
  );
}


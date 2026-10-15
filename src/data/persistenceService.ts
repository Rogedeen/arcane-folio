// =============================================================================
// PERSISTENCE SERVICE — V3
// localStorage ile otomatik kayıt/yükleme.
// Sayfa yenilenince tüm veriler korunur.
// =============================================================================

import type { FullCharacter } from '../types/character';
import type { AppPreferences } from '../types/app';
import { DEFAULT_PREFERENCES } from '../types/app';

const KEYS = {
  CHARACTERS: 'dnd_v3_characters',
  PREFERENCES: 'dnd_v3_preferences',
  CAMPAIGN: 'dnd_v3_campaign',
} as const;

// --- Yardımcı Fonksiyonlar ---

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[persistence] localStorage yazma hatası:', err);
  }
}

// --- Karakter İşlemleri ---

export function loadCharacters(): FullCharacter[] {
  return safeGet<FullCharacter[]>(KEYS.CHARACTERS, []);
}

export function saveCharacters(characters: FullCharacter[]): void {
  safeSet(KEYS.CHARACTERS, characters);
}

export function saveCharacter(character: FullCharacter): FullCharacter[] {
  const all = loadCharacters();
  const idx = all.findIndex((c) => c.id === character.id);
  const updated = { ...character, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = updated;
  } else {
    all.push(updated);
  }
  saveCharacters(all);
  return all;
}

export function deleteCharacter(id: string): FullCharacter[] {
  const all = loadCharacters().filter((c) => c.id !== id);
  saveCharacters(all);
  return all;
}

export function getCharacterById(id: string): FullCharacter | null {
  return loadCharacters().find((c) => c.id === id) ?? null;
}

// --- Tercihler ---

export function loadPreferences(): AppPreferences {
  return safeGet<AppPreferences>(KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

export function savePreferences(prefs: Partial<AppPreferences>): AppPreferences {
  const current = loadPreferences();
  const merged = { ...current, ...prefs };
  safeSet(KEYS.PREFERENCES, merged);
  return merged;
}

// --- Export / Import ---

export function exportCharacterAsJSON(character: FullCharacter): void {
  const blob = new Blob([JSON.stringify(character, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name.replace(/\s+/g, '_')}_karakter.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importCharacterFromJSON(
  file: File
): Promise<FullCharacter | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as FullCharacter;
        // Basit doğrulama
        if (data && data.id && data.name && data.class) {
          // Yeni ID ver ki çakışmasın
          data.id = `imported-${Date.now()}`;
          data.updatedAt = new Date().toISOString();
          resolve(data);
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    reader.readAsText(file);
  });
}

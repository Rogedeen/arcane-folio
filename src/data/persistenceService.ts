// =============================================================================
// PERSISTENCE SERVICE — V3 (DIP REFACTORED)
// IStorageAdapter üzerinden soyutlanmış kalıcılık katmanı.
// Sayfa yenilenince tüm veriler korunur.
// =============================================================================

import type { FullCharacter } from '../types/character';
import type { AppPreferences } from '../types/app';
import type { Campaign } from '../types/campaign';
import { DEFAULT_PREFERENCES } from '../types/app';
import type { IStorageAdapter } from '../services/storage/IStorageAdapter';
import { LocalStorageAdapter } from '../services/storage/LocalStorageAdapter';

const KEYS = {
  CHARACTERS: 'dnd_v3_characters',
  PREFERENCES: 'dnd_v3_preferences',
  CAMPAIGN: 'dnd_v3_campaign',
} as const;

let storageAdapter: IStorageAdapter = new LocalStorageAdapter();

export function setStorageAdapter(adapter: IStorageAdapter): void {
  storageAdapter = adapter;
}

export function getStorageAdapter(): IStorageAdapter {
  return storageAdapter;
}

// --- Karakter İşlemleri ---

export function sanitizeCharacter(char: FullCharacter): FullCharacter {
  const c = { ...char };
  // 1. Para birimi başlangıcı
  if (!c.currency) {
    c.currency = { cp: 0, sp: 0, gp: 15 };
  }

  // 2. Kuşanılmamış fazlalık zırh/kalkan/silah temizliği:
  if (c.inventory && c.inventory.length > 2) {
    const weaponNames = (c.weapons || []).map((w) => w.name.toLowerCase());
    const equippedArmorName = c.equippedArmor?.name?.toLowerCase();

    const filtered = c.inventory.filter((item) => {
      // Zırh kontrolü: Karakterin aktif kuşanılmış zırhı varsa sadece onu tut, diğerlerini çantadan at
      if (item.type === 'armor') {
        return equippedArmorName ? item.name.toLowerCase().includes(equippedArmorName) : Boolean(item.equipped);
      }
      // Kalkan kontrolü: Sadece hasShield true ise kalkanı tut
      if (item.type === 'shield' || item.slug === 'shield') {
        return Boolean(c.hasShield);
      }
      // Silah kontrolü: Karakterin silah listesinde varsa tut
      if (item.type === 'weapon') {
        return weaponNames.length > 0
          ? weaponNames.some((wn) => item.name.toLowerCase().includes(wn) || wn.includes(item.name.toLowerCase()))
          : Boolean(item.equipped);
      }
      // İksir ve temel kamp ekipmanları tutulur
      if (item.type === 'potion' || item.type === 'gear') return true;
      return true;
    });

    if (filtered.length > 0) {
      c.inventory = filtered;
    }
  }

  return c;
}

export function loadCharacters(): FullCharacter[] {
  const chars = storageAdapter.getItem<FullCharacter[]>(KEYS.CHARACTERS, []);
  return chars.map(sanitizeCharacter);
}

export function saveCharacters(characters: FullCharacter[]): void {
  storageAdapter.setItem(KEYS.CHARACTERS, characters.map(sanitizeCharacter));
}

export function saveCharacter(character: FullCharacter): FullCharacter[] {
  const all = loadCharacters();
  const sanitized = sanitizeCharacter(character);
  const idx = all.findIndex((c) => c.id === sanitized.id);
  const updated = { ...sanitized, updatedAt: new Date().toISOString() };
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
  return storageAdapter.getItem<AppPreferences>(KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

export function savePreferences(prefs: Partial<AppPreferences>): AppPreferences {
  const current = loadPreferences();
  const merged = { ...current, ...prefs };
  storageAdapter.setItem(KEYS.PREFERENCES, merged);
  return merged;
}

// --- Kampanya / Sefer Kalıcılığı ---

export function loadCampaign(): Campaign | null {
  return storageAdapter.getItem<Campaign | null>(KEYS.CAMPAIGN, null);
}

export function saveCampaign(campaign: Campaign): Campaign {
  storageAdapter.setItem(KEYS.CAMPAIGN, campaign);
  return campaign;
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

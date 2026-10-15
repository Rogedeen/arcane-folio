import { ItemData, SpellData } from '../types/content';
import { open5eClient } from './open5eClient';
import { INITIAL_ITEMS, INITIAL_SPELLS } from './sampleContent';

const spellModules = import.meta.glob('../../content/spells/**/*.json', { eager: true });
const itemModules = import.meta.glob('../../content/items/**/*.json', { eager: true });

function extractJsonModule<T>(moduleValue: unknown): T {
  const candidate = moduleValue as { default?: T };
  return (candidate.default ?? moduleValue) as T;
}

function safeLocalSpells(): SpellData[] {
  try {
    const spells = Object.values(spellModules)
      .map((mod) => extractJsonModule<SpellData>(mod))
      .filter((sp) => Boolean(sp?.slug && sp?.name))
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
    return spells.length > 0 ? spells : INITIAL_SPELLS;
  } catch {
    return INITIAL_SPELLS;
  }
}

function safeLocalItems(): ItemData[] {
  try {
    const items = Object.values(itemModules)
      .map((mod) => extractJsonModule<ItemData>(mod))
      .filter((it) => Boolean(it?.slug && it?.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    return items.length > 0 ? items : INITIAL_ITEMS;
  } catch {
    return INITIAL_ITEMS;
  }
}

const LOCAL_SPELLS = safeLocalSpells();
const LOCAL_ITEMS = safeLocalItems();

function filterLocalSpells(spells: SpellData[], query: string): SpellData[] {
  const q = query.trim().toLowerCase();
  if (!q) return spells;
  return spells.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
}

function filterLocalItems(items: ItemData[], query: string): ItemData[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.type.toLowerCase().includes(q));
}

class ContentService {
  getInitialSpells(): SpellData[] {
    return [...LOCAL_SPELLS];
  }

  getInitialItems(): ItemData[] {
    return [...LOCAL_ITEMS];
  }

  async getSpells(query: string = ''): Promise<SpellData[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return this.getInitialSpells();
    }

    const localResults = filterLocalSpells(LOCAL_SPELLS, trimmed);
    if (localResults.length > 0) {
      return localResults;
    }

    const apiResults = await open5eClient.searchSpells(trimmed);
    if (apiResults.data && apiResults.data.length > 0) {
      return apiResults.data;
    }
    return localResults;
  }

  async getItems(query: string = ''): Promise<ItemData[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return this.getInitialItems();
    }

    const localResults = filterLocalItems(LOCAL_ITEMS, trimmed);
    if (localResults.length > 0) {
      return localResults;
    }

    const apiResults = await open5eClient.searchItems(trimmed);
    if (apiResults.data && apiResults.data.length > 0) {
      return apiResults.data;
    }
    return localResults;
  }
}

export const contentService = new ContentService();

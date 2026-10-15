import { SpellData, ItemData } from '../types/content';

export interface Open5eSearchResult {
  count: number;
  results: Array<{
    slug: string;
    name: string;
    desc: string;
    type?: string;
    level?: string;
    school?: string;
    range?: string;
  }>;
}

class Open5eClient {
  private baseUrl = 'https://api.open5e.com/v2';

  private withTimeout(ms: number = 2500): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller;
  }

  private toSpellData(r: any): SpellData {
    return {
      slug: r.slug || r.key || r.name?.toLowerCase().replace(/\s+/g, '-'),
      name: r.name || 'Unknown Spell',
      level: r.level_int !== undefined ? r.level_int : (parseInt(r.level, 10) || 0),
      school: r.school || 'Evocation',
      castingTime: r.casting_time || r.castingTime || '1 action',
      range: r.range || '60 feet',
      components: r.components || 'V, S',
      duration: r.duration || 'Instantaneous',
      description: r.desc || '',
      classes: Array.isArray(r.classes) ? r.classes : [],
      prepared: false,
      source: 'Open5e',
      source_ref: r.document?.name || r.document__name || 'Open5e API',
      license: 'Open Gaming / Open5e'
    };
  }

  private toItemData(r: any): ItemData {
    const normalizedType = String(r.type || '').toLowerCase();
    const mappedType: ItemData['type'] = normalizedType.includes('armor')
      ? 'armor'
      : normalizedType.includes('shield')
        ? 'shield'
        : normalizedType.includes('weapon')
          ? 'weapon'
          : normalizedType.includes('scroll')
            ? 'scroll'
            : normalizedType.includes('potion')
              ? 'potion'
              : 'gear';

    return {
      slug: r.slug || r.key || r.name?.toLowerCase().replace(/\s+/g, '-'),
      name: r.name || 'Unknown Item',
      type: mappedType,
      weight: typeof r.weight === 'number' ? r.weight : 1,
      cost: r.cost || r.rarity || 'Unknown',
      description: r.desc || r.description || '',
      properties: Array.isArray(r.properties) ? r.properties : [],
      quantity: 1,
      equipped: false,
      source: 'Open5e',
      source_ref: r.document?.name || r.document__name || 'Open5e API',
      license: 'Open Gaming / Open5e'
    };
  }

  private async fetchResults(path: string): Promise<any[]> {
    const controller = this.withTimeout(2500);
    const res = await fetch(`${this.baseUrl}${path}`, { signal: controller.signal });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return Array.isArray(data.results) ? data.results : [];
  }

  /**
   * Büyüleri Open5e API'sinden arar veya yerel SRD'den filtreler
   */
  async searchSpells(query: string = ''): Promise<SpellData[]> {
    if (!query) {
      return [];
    }

    try {
      const results = await this.fetchResults(`/spells/?search=${encodeURIComponent(query)}&limit=25`);
      return results.map((r) => this.toSpellData(r));
    } catch {
      return [];
    }
  }

  /**
   * Eşyaları Open5e API'sinden arar veya yerel SRD'den filtreler
   */
  async searchItems(query: string = ''): Promise<ItemData[]> {
    if (!query) {
      return [];
    }

    try {
      const primary = await this.fetchResults(`/equipment/?search=${encodeURIComponent(query)}&limit=25`);
      if (primary.length > 0) {
        return primary.map((r) => this.toItemData(r));
      }

      const fallback = await this.fetchResults(`/magicitems/?search=${encodeURIComponent(query)}&limit=25`);
      return fallback.map((r) => this.toItemData(r));
    } catch {
      return [];
    }
  }
}

export const open5eClient = new Open5eClient();

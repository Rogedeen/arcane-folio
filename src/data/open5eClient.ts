import { SpellData, ItemData } from '../types/content';
import { INITIAL_SPELLS, INITIAL_ITEMS } from './sampleContent';

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
  private baseUrl = 'https://api.open5e.com/v1';

  /**
   * Büyüleri Open5e API'sinden arar veya yerel SRD'den filtreler
   */
  async searchSpells(query: string = ''): Promise<SpellData[]> {
    if (!query) {
      return INITIAL_SPELLS;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout

      const res = await fetch(`${this.baseUrl}/spells/?search=${encodeURIComponent(query)}&limit=25`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results.map((r: any) => ({
            slug: r.slug,
            name: r.name,
            level: r.level_int !== undefined ? r.level_int : (parseInt(r.level, 10) || 0),
            school: r.school || 'Evocation',
            castingTime: r.casting_time || '1 action',
            range: r.range || '60 feet',
            components: r.components || 'V, S',
            duration: r.duration || 'Instantaneous',
            description: r.desc || '',
            prepared: false
          }));
        }
      }
    } catch {
      // Network hatası veya timeout durumunda yerel zengin veri seti kullanılır
    }

    // Yerel filtreleme fallback
    const q = query.toLowerCase();
    return INITIAL_SPELLS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }

  /**
   * Eşyaları Open5e API'sinden arar veya yerel SRD'den filtreler
   */
  async searchItems(query: string = ''): Promise<ItemData[]> {
    if (!query) {
      return INITIAL_ITEMS;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${this.baseUrl}/magicitems/?search=${encodeURIComponent(query)}&limit=25`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results.map((r: any) => ({
            slug: r.slug,
            name: r.name,
            type: r.type?.toLowerCase().includes('armor') ? 'armor' : r.type?.toLowerCase().includes('weapon') ? 'weapon' : 'gear',
            weight: 1,
            cost: r.rarity || 'Common',
            quantity: 1,
            equipped: false
          }));
        }
      }
    } catch {
      // Yerel fallback
    }

    const q = query.toLowerCase();
    return INITIAL_ITEMS.filter(
      (i) => i.name.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)
    );
  }
}

export const open5eClient = new Open5eClient();

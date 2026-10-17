/**
 * D&D 5e Büyü Kapasitesi ve Hazırlık / Öğrenme Kuralları
 * Referans: SRD 5.1 & 2014 Player's Handbook
 *
 * 1. Prepared Casters:
 *    - Wizard: Level + INT mod (min 1)
 *    - Cleric: Level + WIS mod (min 1)
 *    - Druid: Level + WIS mod (min 1)
 *    - Paladin: floor(Level / 2) + CHA mod (min 1, 2. seviyede başlar)
 *
 * 2. Known Casters (Büyü Hazırlamaz, Sabit Sayıda Bilir):
 *    - Bard: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22]
 *    - Sorcerer: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15]
 *    - Warlock: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
 *    - Ranger: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]
 *
 * 3. 1/3 Casters (Fighter Eldritch Knight, Rogue Arcane Trickster):
 *    - 3. seviyede başlar: [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]
 */

export type SpellcastingModel = 'prepared' | 'known' | 'pact' | 'none';

// Known Spells tabloları (Seviye 1 - 20)
const BARD_KNOWN_SPELLS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
const SORCERER_KNOWN_SPELLS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
const WARLOCK_KNOWN_SPELLS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
const RANGER_KNOWN_SPELLS = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];
const ONE_THIRD_CASTER_KNOWN = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];

export interface SpellCapacityInfo {
  model: SpellcastingModel;
  maxCount: number;
  labelTr: string;
  labelEn: string;
}

function normalizeClassKey(cls: string): string {
  const lower = (cls || '').toLowerCase();
  if (lower.includes('wizard') || lower.includes('büyücü')) return 'wizard';
  if (lower.includes('cleric') || lower.includes('rahip') || lower.includes('ruhban')) return 'cleric';
  if (lower.includes('druid')) return 'druid';
  if (lower.includes('sorcerer') || lower.includes('sihirbaz')) return 'sorcerer';
  if (lower.includes('bard') || lower.includes('ozan')) return 'bard';
  if (lower.includes('warlock') || lower.includes('efsun')) return 'warlock';
  if (lower.includes('paladin')) return 'paladin';
  if (lower.includes('ranger') || lower.includes('kolcu')) return 'ranger';
  if (lower.includes('fighter') || lower.includes('savaşçı')) return 'fighter';
  if (lower.includes('rogue') || lower.includes('hırsız')) return 'rogue';
  return lower;
}

export function getSpellcastingModel(charClass: string, subclass?: string): SpellcastingModel {
  const c = normalizeClassKey(charClass);
  const sc = (subclass || '').toLowerCase().replace(/[-_]/g, ' ');

  if (['wizard', 'cleric', 'druid', 'paladin'].includes(c)) {
    return 'prepared';
  }
  if (c === 'warlock') {
    return 'pact';
  }
  if (['bard', 'sorcerer', 'ranger'].includes(c)) {
    return 'known';
  }
  if (
    sc.includes('eldritch knight') ||
    sc.includes('arcane trickster') ||
    sc.includes('şövalye') ||
    sc.includes('düzenbaz')
  ) {
    return 'known';
  }

  return 'none';
}

/**
 * Karakterin sınıfı, seviyesi ve casting modifier'ına göre hazırlayabileceği / bilebileceği
 * büyü adedini hesaplar.
 */
export function calculateSpellCapacity(
  charClass: string,
  level: number,
  castingModifier: number,
  subclass?: string
): SpellCapacityInfo {
  const c = normalizeClassKey(charClass);
  const sc = (subclass || '').toLowerCase().replace(/[-_]/g, ' ');
  const clampedLevel = Math.max(1, Math.min(20, level));
  const model = getSpellcastingModel(charClass, subclass);

  if (model === 'prepared') {
    if (c === 'paladin') {
      const maxCount = clampedLevel < 2 ? 0 : Math.max(1, Math.floor(clampedLevel / 2) + castingModifier);
      return {
        model: 'prepared',
        maxCount,
        labelTr: 'Hazırlanan Büyüler',
        labelEn: 'Prepared Spells'
      };
    }
    // Wizard, Cleric, Druid
    const maxCount = Math.max(1, clampedLevel + castingModifier);
    return {
      model: 'prepared',
      maxCount,
      labelTr: 'Hazırlanan Büyüler',
      labelEn: 'Prepared Spells'
    };
  }

  if (model === 'pact') {
    // Warlock
    const maxCount = WARLOCK_KNOWN_SPELLS[clampedLevel - 1];
    return {
      model: 'pact',
      maxCount,
      labelTr: 'Bilinen Büyüler (Pact)',
      labelEn: 'Spells Known (Pact)'
    };
  }

  if (model === 'known') {
    let maxCount = 0;
    if (c === 'bard') {
      maxCount = BARD_KNOWN_SPELLS[clampedLevel - 1];
    } else if (c === 'sorcerer') {
      maxCount = SORCERER_KNOWN_SPELLS[clampedLevel - 1];
    } else if (c === 'ranger') {
      maxCount = RANGER_KNOWN_SPELLS[clampedLevel - 1];
    } else if (
      sc.includes('eldritch knight') ||
      sc.includes('arcane trickster') ||
      sc.includes('şövalye') ||
      sc.includes('düzenbaz')
    ) {
      maxCount = ONE_THIRD_CASTER_KNOWN[clampedLevel - 1];
    }

    return {
      model: 'known',
      maxCount,
      labelTr: 'Bilinen Büyüler',
      labelEn: 'Spells Known'
    };
  }

  return {
    model: 'none',
    maxCount: 0,
    labelTr: 'Büyü Yok',
    labelEn: 'No Spells'
  };
}

/**
 * Geriye dönük uyumluluk (Legacy helper):
 * Eğer sınıf belirtilmezse klasik Wizard hazırlık formülünü (Level + Modifier) döndürür.
 */
export function calculateMaxPreparedSpells(
  level: number,
  castingModifier: number,
  charClass?: string,
  subclass?: string
): number {
  if (charClass) {
    return calculateSpellCapacity(charClass, level, castingModifier, subclass).maxCount;
  }
  return Math.max(1, level + castingModifier);
}


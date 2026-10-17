import { CharacterClass } from '../types/character';
import { SpellSlotTier } from '../types/resources';

// Full Caster Slot Tablosu (SRD 5.1 sf. 15-55)
// Seviye 1-20 için [1. seviye slot, 2. seviye, ..., 9. seviye]
const FULL_CASTER_TABLE: number[][] = [
  [2],                         // 1
  [3],                         // 2
  [4, 2],                      // 3
  [4, 3],                      // 4
  [4, 3, 2],                   // 5
  [4, 3, 3],                   // 6
  [4, 3, 3, 1],                // 7
  [4, 3, 3, 2],                // 8
  [4, 3, 3, 3, 1],             // 9
  [4, 3, 3, 3, 2],             // 10
  [4, 3, 3, 3, 2, 1],          // 11
  [4, 3, 3, 3, 2, 1],          // 12
  [4, 3, 3, 3, 2, 1, 1],       // 13
  [4, 3, 3, 3, 2, 1, 1],       // 14
  [4, 3, 3, 3, 2, 1, 1, 1],    // 15
  [4, 3, 3, 3, 2, 1, 1, 1],    // 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // 20
];

// Half Caster Slot Tablosu (Paladin, Ranger) (SRD 5.1 sf. 31, 36)
const HALF_CASTER_TABLE: number[][] = [
  [],                          // 1 (yok)
  [2],                         // 2
  [3],                         // 3
  [3],                         // 4
  [4, 2],                      // 5
  [4, 2],                      // 6
  [4, 3],                      // 7
  [4, 3],                      // 8
  [4, 3, 2],                   // 9
  [4, 3, 2],                   // 10
  [4, 3, 3],                   // 11
  [4, 3, 3],                   // 12
  [4, 3, 3, 1],                // 13
  [4, 3, 3, 1],                // 14
  [4, 3, 3, 2],                // 15
  [4, 3, 3, 2],                // 16
  [4, 3, 3, 3, 1],             // 17
  [4, 3, 3, 3, 1],             // 18
  [4, 3, 3, 3, 2],             // 19
  [4, 3, 3, 3, 2],             // 20
];

// Warlock Pact Magic Tablosu [Slot Sayısı, Slot Seviyesi] (SRD 5.1 sf. 47)
const WARLOCK_TABLE: [number, number][] = [
  [1, 1], // 1
  [2, 1], // 2
  [2, 2], // 3
  [2, 2], // 4
  [2, 3], // 5
  [2, 3], // 6
  [2, 4], // 7
  [2, 4], // 8
  [2, 5], // 9
  [2, 5], // 10
  [3, 5], // 11
  [3, 5], // 12
  [3, 5], // 13
  [3, 5], // 14
  [3, 5], // 15
  [3, 5], // 16
  [4, 5], // 17
  [4, 5], // 18
  [4, 5], // 19
  [4, 5], // 20
];

// 1/3 Caster Slot Tablosu (Eldritch Knight, Arcane Trickster) (SRD 5.1 sf. 27, 40)
// Seviye 1-20 için [1. slot, 2. slot, 3. slot, 4. slot]
const ONE_THIRD_CASTER_TABLE: number[][] = [
  [],           // 1
  [],           // 2
  [2],          // 3
  [3],          // 4
  [3],          // 5
  [3],          // 6
  [4, 2],       // 7
  [4, 2],       // 8
  [4, 2],       // 9
  [4, 3],       // 10
  [4, 3],       // 11
  [4, 3],       // 12
  [4, 3, 2],    // 13
  [4, 3, 2],    // 14
  [4, 3, 2],    // 15
  [4, 3, 3],    // 16
  [4, 3, 3],    // 17
  [4, 3, 3],    // 18
  [4, 3, 3, 1], // 19
  [4, 3, 3, 1], // 20
];

export function getSpellSlotsForLevel(
  charClass: CharacterClass | string,
  level: number,
  subclass?: string
): Record<number, SpellSlotTier> {
  const result: Record<number, SpellSlotTier> = {};
  const clampedLevel = Math.max(1, Math.min(20, level));
  const c = charClass.toLowerCase();
  const sc = (subclass || '').toLowerCase().replace(/[-_]/g, ' ');

  const isFullCaster = ['wizard', 'sorcerer', 'cleric', 'druid', 'bard'].includes(c);
  const isHalfCaster = ['paladin', 'ranger'].includes(c);
  const isWarlock = c === 'warlock';
  const isOneThirdCaster =
    sc.includes('eldritch knight') ||
    sc.includes('arcane trickster') ||
    sc.includes('şövalye') ||
    sc.includes('düzenbaz');

  if (isFullCaster) {
    const row = FULL_CASTER_TABLE[clampedLevel - 1];
    row.forEach((count, idx) => {
      const tier = idx + 1;
      result[tier] = { tier, total: count, expended: 0 };
    });
  } else if (isHalfCaster) {
    const row = HALF_CASTER_TABLE[clampedLevel - 1];
    row.forEach((count, idx) => {
      const tier = idx + 1;
      result[tier] = { tier, total: count, expended: 0 };
    });
  } else if (isWarlock) {
    const [count, slotLevel] = WARLOCK_TABLE[clampedLevel - 1];
    result[slotLevel] = { tier: slotLevel, total: count, expended: 0 };
  } else if (isOneThirdCaster) {
    const row = ONE_THIRD_CASTER_TABLE[clampedLevel - 1] || [];
    row.forEach((count, idx) => {
      const tier = idx + 1;
      result[tier] = { tier, total: count, expended: 0 };
    });
  }

  return result;
}

/**
 * Karakterin sınıfı, alt sınıfı ve seviyesine göre hazırlayabileceği / öğrenebileceği
 * MAKSİMUM büyü yuvası seviyesini hesaplar (0 - 9).
 * Örn: 3. seviye Fighter (Eldritch Knight) -> 1
 * 3. seviye Wizard -> 2
 * 5. seviye Wizard -> 3
 * 17. seviye Wizard -> 9
 */
export function getMaxSpellLevelForCharacter(
  charClass: string,
  subclass?: string,
  level: number = 1
): number {
  const c = charClass.toLowerCase();
  const sc = (subclass || '').toLowerCase();
  const clampedLevel = Math.max(1, Math.min(20, level));

  // Full Casters (Wizard, Cleric, Druid, Sorcerer, Bard)
  if (['wizard', 'cleric', 'druid', 'sorcerer', 'bard'].includes(c)) {
    return Math.min(9, Math.ceil(clampedLevel / 2));
  }

  // Warlock (Pact Magic - En fazla 5. seviye slot)
  if (c === 'warlock') {
    return Math.min(5, Math.ceil(clampedLevel / 2));
  }

  // Half Casters (Paladin, Ranger - 2. seviyede başlar)
  if (['paladin', 'ranger'].includes(c)) {
    if (clampedLevel < 2) return 0;
    return Math.min(5, Math.ceil(clampedLevel / 4));
  }

  // One-Third Casters (Eldritch Knight Fighter, Arcane Trickster Rogue - 3. seviyede başlar)
  const normalizedSc = sc.replace(/[-_]/g, ' ');
  if (
    normalizedSc.includes('eldritch knight') ||
    normalizedSc.includes('arcane trickster') ||
    normalizedSc.includes('şövalye') ||
    normalizedSc.includes('düzenbaz')
  ) {
    if (clampedLevel < 3) return 0;
    if (clampedLevel < 7) return 1;
    if (clampedLevel < 13) return 2;
    if (clampedLevel < 19) return 3;
    return 4;
  }

  // Büyücü olmayan sınıflar
  return 0;
}

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

export function getSpellSlotsForLevel(
  charClass: CharacterClass,
  level: number
): Record<number, SpellSlotTier> {
  const result: Record<number, SpellSlotTier> = {};
  const clampedLevel = Math.max(1, Math.min(20, level));

  const isFullCaster = ['wizard', 'sorcerer', 'cleric', 'druid', 'bard'].includes(charClass);
  const isHalfCaster = ['paladin', 'ranger'].includes(charClass);
  const isWarlock = charClass === 'warlock';

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
  }

  return result;
}

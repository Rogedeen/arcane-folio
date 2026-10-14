import { CharacterClass } from '../types/character';

export interface ClassHitDieInfo {
  maxDie: number;
  avgIncrease: number;
  dieString: string;
}

export const CLASS_HIT_DICE: Record<CharacterClass, ClassHitDieInfo> = {
  barbarian: { maxDie: 12, avgIncrease: 7, dieString: 'd12' },
  fighter: { maxDie: 10, avgIncrease: 6, dieString: 'd10' },
  paladin: { maxDie: 10, avgIncrease: 6, dieString: 'd10' },
  ranger: { maxDie: 10, avgIncrease: 6, dieString: 'd10' },
  bard: { maxDie: 8, avgIncrease: 5, dieString: 'd8' },
  cleric: { maxDie: 8, avgIncrease: 5, dieString: 'd8' },
  druid: { maxDie: 8, avgIncrease: 5, dieString: 'd8' },
  monk: { maxDie: 8, avgIncrease: 5, dieString: 'd8' },
  rogue: { maxDie: 8, avgIncrease: 5, dieString: 'd8' },
  warlock: { maxDie: 8, avgIncrease: 5, dieString: 'd8' },
  sorcerer: { maxDie: 6, avgIncrease: 4, dieString: 'd6' },
  wizard: { maxDie: 6, avgIncrease: 4, dieString: 'd6' }
};

/**
 * D&D 5e Maksimum Can Puanı (HP) Hesaplayıcı
 * Referans: SRD 5.1 sf. 12 "Hit Points and Hit Dice"
 * Seviye 1: Max Can Zarı + CON Modifikatörü
 * Seviye 2+: Her seviye için (Sabit Ortalama + CON Modifikatörü, min 1)
 */
export function calculateMaxHp(
  charClass: CharacterClass,
  level: number,
  conModifier: number,
  isHillDwarf: boolean = false
): number {
  const hitDie = CLASS_HIT_DICE[charClass];
  const dwarfBonus = isHillDwarf ? 1 : 0;

  // Seviye 1 HP
  const level1Hp = Math.max(1, hitDie.maxDie + conModifier + dwarfBonus);
  if (level <= 1) {
    return level1Hp;
  }

  // Sonraki seviyeler (seviye 2 - level)
  const subsequentLevelIncrease = Math.max(1, hitDie.avgIncrease + conModifier + dwarfBonus);
  const totalHp = level1Hp + (level - 1) * subsequentLevelIncrease;

  return totalHp;
}

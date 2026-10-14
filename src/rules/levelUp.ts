import { calculateProficiencyBonus } from './proficiency';
import { getSubclassUnlockLevel } from './subclasses';

export interface LevelUpResult {
  newLevel: number;
  newProficiencyBonus: number;
  hpIncrease: number;
  newMaxHp: number;
  unlockedSubclass: boolean;
  unlockedASI: boolean;
}

export const CLASS_HIT_DICE: Record<string, number> = {
  barbarian: 12,
  fighter: 10,
  paladin: 10,
  ranger: 10,
  cleric: 8,
  druid: 8,
  monk: 8,
  rogue: 8,
  bard: 8,
  warlock: 8,
  sorcerer: 6,
  wizard: 6
};

/**
 * Bir sonraki seviyede ortalama can artışını hesaplar
 * Kural: Math.floor(hitDie / 2) + 1 + conModifier (Minimum 1 HP)
 */
export function calculateAverageHpIncrease(charClass: string, conModifier: number): number {
  const die = CLASS_HIT_DICE[charClass.toLowerCase()] || 8;
  const avg = Math.floor(die / 2) + 1;
  return Math.max(1, avg + conModifier);
}

/**
 * Seviye ASI (Ability Score Improvement) kazandırıyor mu kontrolü
 * Fighter: 4, 6, 8, 12, 14, 16, 19
 * Rogue: 4, 8, 10, 12, 16, 19
 * Diğerleri: 4, 8, 12, 16, 19
 */
export function isAsiLevel(charClass: string, targetLevel: number): boolean {
  const cls = charClass.toLowerCase();
  if (cls === 'fighter') {
    return [4, 6, 8, 12, 14, 16, 19].includes(targetLevel);
  }
  if (cls === 'rogue') {
    return [4, 8, 10, 12, 16, 19].includes(targetLevel);
  }
  return [4, 8, 12, 16, 19].includes(targetLevel);
}

/**
 * Karakteri bir seviye atlatır
 */
export function performLevelUp(
  currentLevel: number,
  charClass: string,
  currentMaxHp: number,
  conModifier: number,
  customHpIncrease?: number
): LevelUpResult {
  if (currentLevel >= 20) {
    throw new Error('Maksimum seviyeye (20) zaten ulaşıldı.');
  }

  const newLevel = currentLevel + 1;
  const hpInc = customHpIncrease !== undefined
    ? Math.max(1, customHpIncrease + conModifier)
    : calculateAverageHpIncrease(charClass, conModifier);

  const newMaxHp = currentMaxHp + hpInc;
  const newProficiencyBonus = calculateProficiencyBonus(newLevel);
  const unlockLevel = getSubclassUnlockLevel(charClass);
  const unlockedSubclass = newLevel === unlockLevel;
  const unlockedASI = isAsiLevel(charClass, newLevel);

  return {
    newLevel,
    newProficiencyBonus,
    hpIncrease: hpInc,
    newMaxHp,
    unlockedSubclass,
    unlockedASI
  };
}

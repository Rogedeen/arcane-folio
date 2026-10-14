import { CharacterClass, ArmorItem } from '../types/character';

export interface ArmorClassParams {
  charClass: CharacterClass;
  dexModifier: number;
  conModifier: number;
  wisModifier: number;
  armor?: ArmorItem;
  hasShield?: boolean;
}

/**
 * D&D 5e Zırh Sınıfı (Armor Class - AC) Hesaplayıcı
 * Referans: SRD 5.1 sf. 9, 26, 62–64 "Armor and Shields"
 */
export function calculateArmorClass(params: ArmorClassParams): number {
  const { charClass, dexModifier, conModifier, wisModifier, armor, hasShield = false } = params;
  const shieldBonus = hasShield ? 2 : 0;

  // Zırh kuşanılmışsa
  if (armor) {
    if (armor.type === 'light') {
      return armor.baseAc + dexModifier + shieldBonus;
    }
    if (armor.type === 'medium') {
      const allowedDex = Math.min(dexModifier, armor.maxDexBonus ?? 2);
      return armor.baseAc + allowedDex + shieldBonus;
    }
    if (armor.type === 'heavy') {
      return armor.baseAc + shieldBonus;
    }
  }

  // Zırhsız (Unarmored) durumlar
  if (charClass === 'barbarian') {
    // Barbarian: 10 + DEX + CON (kalkan takabilir)
    return 10 + dexModifier + conModifier + shieldBonus;
  }

  if (charClass === 'monk' && !hasShield) {
    // Monk: 10 + DEX + WIS (kalkan takamaz)
    return 10 + dexModifier + wisModifier;
  }

  // Standart zırhsız: 10 + DEX + (Kalkan varsa +2)
  return 10 + dexModifier + shieldBonus;
}

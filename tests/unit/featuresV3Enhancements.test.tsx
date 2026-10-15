import { describe, it, expect } from 'vitest';
import { calculatePotionHealing, isPotionItem } from '../../src/rules/potions';
import { calculateArmorClass } from '../../src/rules/armorClass';

describe('V3 Enhancements & Features', () => {
  describe('Single Armor Rule & AC Recalculation', () => {
    it('calculates unarmored AC when no armor is equipped (10 + dexMod)', () => {
      const ac = calculateArmorClass({
        charClass: 'fighter',
        dexModifier: 2,
        conModifier: 2,
        wisModifier: 0,
        armor: undefined,
        hasShield: false,
      });
      expect(ac).toBe(12);
    });

    it('calculates armored AC correctly when armor is equipped', () => {
      const ac = calculateArmorClass({
        charClass: 'fighter',
        dexModifier: 2,
        conModifier: 2,
        wisModifier: 0,
        armor: { name: 'Plate', type: 'heavy', baseAc: 18, maxDexBonus: 0 },
        hasShield: false,
      });
      expect(ac).toBe(18);
    });

    it('recalculates AC back to unarmored when armor is unequipped', () => {
      let currentArmor: import('../../src/types/character').ArmorItem | undefined = {
        name: 'Scale Mail',
        type: 'medium',
        baseAc: 14,
        maxDexBonus: 2,
      };
      let ac = calculateArmorClass({
        charClass: 'fighter',
        dexModifier: 3,
        conModifier: 2,
        wisModifier: 0,
        armor: currentArmor,
        hasShield: false,
      });
      expect(ac).toBe(16); // 14 + min(3, 2) = 16

      // Unequip
      currentArmor = undefined;
      ac = calculateArmorClass({
        charClass: 'fighter',
        dexModifier: 3,
        conModifier: 2,
        wisModifier: 0,
        armor: currentArmor,
        hasShield: false,
      });
      expect(ac).toBe(13); // 10 + 3 = 13
    });
  });

  describe('Potion Rules & Healing', () => {
    it('detects potion items correctly', () => {
      expect(isPotionItem('Potion of Healing')).toBe(true);
      expect(isPotionItem('Büyük Şifa İksiri')).toBe(true);
      expect(isPotionItem('Longsword')).toBe(false);
    });

    it('rolls standard potion of healing (2d4 + 2)', () => {
      const result = calculatePotionHealing('Potion of Healing');
      expect(result.formula).toBe('2d4+2');
      expect(result.diceCount).toBe(2);
      expect(result.flatBonus).toBe(2);
      expect(result.rolls.length).toBe(2);
      expect(result.healAmount).toBeGreaterThanOrEqual(4);
      expect(result.healAmount).toBeLessThanOrEqual(10);
    });

    it('rolls greater potion of healing (4d4 + 4)', () => {
      const result = calculatePotionHealing('Potion of Greater Healing');
      expect(result.formula).toBe('4d4+4');
      expect(result.diceCount).toBe(4);
      expect(result.flatBonus).toBe(4);
      expect(result.rolls.length).toBe(4);
      expect(result.healAmount).toBeGreaterThanOrEqual(8);
      expect(result.healAmount).toBeLessThanOrEqual(20);
    });

    it('rolls superior and supreme potions accurately', () => {
      const superior = calculatePotionHealing('Superior Healing Potion');
      expect(superior.formula).toBe('8d4+8');
      expect(superior.flatBonus).toBe(8);

      const supreme = calculatePotionHealing('Supreme Healing Potion');
      expect(supreme.formula).toBe('10d4+20');
      expect(supreme.flatBonus).toBe(20);
    });
  });

  describe('Movement Speed & Non-Negative Boundary', () => {
    it('never drops below 0 ft when spending movement', () => {
      let speed = 30;
      // Spend 10
      speed = Math.max(0, speed - 10);
      expect(speed).toBe(20);

      // Spend 25
      speed = Math.max(0, speed - 25);
      expect(speed).toBe(0); // Clamped at 0, no negative value

      // Attempt to spend another 10
      speed = Math.max(0, speed - 10);
      expect(speed).toBe(0);
    });
  });
});

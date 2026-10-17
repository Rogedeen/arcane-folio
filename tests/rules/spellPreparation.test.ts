import { describe, it, expect } from 'vitest';
import { calculateMaxPreparedSpells } from '../../src/rules/spellPreparation';

describe('Büyü Hazırlama Sınırı Kuralları [SRD 5.1 sf. 53 Preparing Spells]', () => {
  it('Seviye 5 ve INT mod +3 olan Wizard en fazla 8 büyü hazırlayabilmelidir [SRD 5.1 sf. 53]', () => {
    // 5 + 3 = 8
    expect(calculateMaxPreparedSpells(5, 3)).toBe(8);
  });

  it('Seviye 1 ve mod 0 olan karakter en az 1 büyü hazırlayabilmelidir [SRD 5.1 sf. 53]', () => {
    // 1 + 0 = 1
    expect(calculateMaxPreparedSpells(1, 0)).toBe(1);
  });

  it('Negatif modifikatör durumunda minimum 1 büyü hazırlanabilir [SRD 5.1 sf. 53]', () => {
    // 1 + (-2) = -1 => min 1
    expect(calculateMaxPreparedSpells(1, -2)).toBe(1);
  });

  describe('D&D 5e Sınıf Büyü Kapasiteleri (calculateSpellCapacity)', () => {
    it('Paladin: Seviye 1 iken 0 büyü, Seviye 6 ve CHA +3 iken floor(6/2)+3 = 6 büyü hazırlar', () => {
      const paladinLvl1 = calculateMaxPreparedSpells(1, 3, 'paladin');
      expect(paladinLvl1).toBe(0);

      const paladinLvl6 = calculateMaxPreparedSpells(6, 3, 'paladin');
      expect(paladinLvl6).toBe(6);
    });

    it('Warlock (Pact Magic): Seviye 1=2, Seviye 5=6, Seviye 20=15 bilinen büyüye sahiptir', () => {
      expect(calculateMaxPreparedSpells(1, 3, 'warlock')).toBe(2);
      expect(calculateMaxPreparedSpells(5, 4, 'warlock')).toBe(6);
      expect(calculateMaxPreparedSpells(20, 5, 'warlock')).toBe(15);
    });

    it('Sorcerer (Known Caster): Seviye 1=2, Seviye 5=6, Seviye 20=15 bilinen büyüye sahiptir', () => {
      expect(calculateMaxPreparedSpells(1, 3, 'sorcerer')).toBe(2);
      expect(calculateMaxPreparedSpells(5, 4, 'sorcerer')).toBe(6);
      expect(calculateMaxPreparedSpells(20, 5, 'sorcerer')).toBe(15);
    });

    it('Bard (Known Caster): Seviye 1=4, Seviye 10=14, Seviye 20=22 bilinen büyüye sahiptir', () => {
      expect(calculateMaxPreparedSpells(1, 3, 'bard')).toBe(4);
      expect(calculateMaxPreparedSpells(10, 4, 'bard')).toBe(14);
      expect(calculateMaxPreparedSpells(20, 5, 'bard')).toBe(22);
    });

    it('1/3 Caster (Eldritch Knight): Seviye 1-2=0, Seviye 3=3, Seviye 7=5, Seviye 20=13', () => {
      expect(calculateMaxPreparedSpells(2, 2, 'fighter', 'eldritch-knight')).toBe(0);
      expect(calculateMaxPreparedSpells(3, 2, 'fighter', 'eldritch-knight')).toBe(3);
      expect(calculateMaxPreparedSpells(7, 2, 'fighter', 'eldritch-knight')).toBe(5);
      expect(calculateMaxPreparedSpells(20, 3, 'fighter', 'eldritch-knight')).toBe(13);
    });
  });
});

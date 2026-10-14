import { describe, it, expect } from 'vitest';
import { calculateArmorClass } from '../../src/rules/armorClass';

describe('Zırh Sınıfı (AC) Hesaplama Kuralları [SRD 5.1 sf. 9, 62–64 Armor and Shields]', () => {
  it('Standart zırhsız karakter: 10 + DEX mod [SRD 5.1 sf. 9]', () => {
    // DEX 14 (+2 mod) => 10 + 2 = 12
    expect(calculateArmorClass({
      charClass: 'fighter',
      dexModifier: 2,
      conModifier: 1,
      wisModifier: 0
    })).toBe(12);
  });

  it('Standart zırhsız karakter kalkan taktığında +2 AC almalı [SRD 5.1 sf. 62]', () => {
    // 10 + 2 (DEX) + 2 (Kalkan) = 14
    expect(calculateArmorClass({
      charClass: 'fighter',
      dexModifier: 2,
      conModifier: 1,
      wisModifier: 0,
      hasShield: true
    })).toBe(14);
  });

  it('Barbarian Unarmored Defense: 10 + DEX mod + CON mod [SRD 5.1 sf. 9]', () => {
    // DEX 14 (+2), CON 16 (+3) => 10 + 2 + 3 = 15
    expect(calculateArmorClass({
      charClass: 'barbarian',
      dexModifier: 2,
      conModifier: 3,
      wisModifier: 0
    })).toBe(15);

    // Barbarian kalkan takabilir: 15 + 2 = 17
    expect(calculateArmorClass({
      charClass: 'barbarian',
      dexModifier: 2,
      conModifier: 3,
      wisModifier: 0,
      hasShield: true
    })).toBe(17);
  });

  it('Monk Unarmored Defense: 10 + DEX mod + WIS mod (Kalkansız) [SRD 5.1 sf. 26]', () => {
    // DEX 16 (+3), WIS 14 (+2) => 10 + 3 + 2 = 15
    expect(calculateArmorClass({
      charClass: 'monk',
      dexModifier: 3,
      conModifier: 1,
      wisModifier: 2
    })).toBe(15);
  });

  it('Hafif Zırh: Taban AC + DEX mod (Sınırsız) [SRD 5.1 sf. 63]', () => {
    // Leather Armor (Taban 11) + DEX 16 (+3) => 14
    expect(calculateArmorClass({
      charClass: 'rogue',
      dexModifier: 3,
      conModifier: 0,
      wisModifier: 0,
      armor: { type: 'light', baseAc: 11 }
    })).toBe(14);
  });

  it('Orta Zırh: Taban AC + DEX mod (Maksimum +2) [SRD 5.1 sf. 63]', () => {
    // Scale Mail (Taban 14) + DEX 18 (+4) => 14 + min(4, 2) = 16
    expect(calculateArmorClass({
      charClass: 'cleric',
      dexModifier: 4,
      conModifier: 1,
      wisModifier: 3,
      armor: { type: 'medium', baseAc: 14, maxDexBonus: 2 }
    })).toBe(16);
  });

  it('Ağır Zırh: Taban AC (DEX eklenmez) [SRD 5.1 sf. 63]', () => {
    // Plate Armor (Taban 18) + DEX 14 (+2) => 18
    expect(calculateArmorClass({
      charClass: 'paladin',
      dexModifier: 2,
      conModifier: 2,
      wisModifier: 1,
      armor: { type: 'heavy', baseAc: 18 }
    })).toBe(18);

    // Plate Armor (18) + Kalkan (+2) = 20
    expect(calculateArmorClass({
      charClass: 'paladin',
      dexModifier: 2,
      conModifier: 2,
      wisModifier: 1,
      armor: { type: 'heavy', baseAc: 18 },
      hasShield: true
    })).toBe(20);
  });
});

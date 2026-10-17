import { describe, it, expect } from 'vitest';
import { calculateWeaponAttack, calculateSpellAttackAndDC } from '../../src/rules/weaponAttacks';

describe('D&D 5e Silah Saldırı ve Hasar Motoru [SRD 5.1 sf. 74-77]', () => {
  it('Melee Weapon (Longsword): STR mod ve PB saldırıya eklenir, yalnızca STR mod hasara eklenir', () => {
    const calc = calculateWeaponAttack(
      {
        name: 'Longsword',
        damageDice: '1d8',
        damageType: 'Slashing',
        properties: ['Versatile']
      },
      3, // strMod
      1, // dexMod
      2, // profBonus
      true
    );

    expect(calc.abilityUsed).toBe('str');
    expect(calc.attackBonus).toBe(5); // 3 STR + 2 PB
    expect(calc.damageBonus).toBe(3); // 3 STR
    expect(calc.damageFormula).toBe('1d8+3');
  });

  it('Finesse Weapon (Rapier): Karakterin DEX değeri STR değerinden yüksekse otomatik DEX seçer', () => {
    const calc = calculateWeaponAttack(
      {
        name: 'Rapier',
        damageDice: '1d8',
        damageType: 'Piercing',
        properties: ['Finesse']
      },
      1, // strMod
      4, // dexMod
      3, // profBonus
      true
    );

    expect(calc.abilityUsed).toBe('dex');
    expect(calc.attackBonus).toBe(7); // 4 DEX + 3 PB
    expect(calc.damageBonus).toBe(4); // 4 DEX
    expect(calc.damageFormula).toBe('1d8+4');
  });

  it('Ranged Weapon (Longbow): Daima DEX kullanılır', () => {
    const calc = calculateWeaponAttack(
      {
        name: 'Longbow',
        damageDice: '1d8',
        damageType: 'Piercing',
        properties: ['Ammunition', 'Heavy', 'Two-Handed'],
        range: '150/600 ft'
      },
      4, // strMod
      2, // dexMod
      2, // profBonus
      true
    );

    expect(calc.abilityUsed).toBe('dex');
    expect(calc.attackBonus).toBe(4); // 2 DEX + 2 PB
    expect(calc.damageBonus).toBe(2);
    expect(calc.damageFormula).toBe('1d8+2');
  });

  it('Two-Weapon Fighting (İkincil El Kuralı): Fighting style yoksa ikincil el hasarına mod eklenmez', () => {
    const offHandWithoutStyle = calculateWeaponAttack(
      {
        name: 'Shortsword (Off-hand)',
        damageDice: '1d6',
        damageType: 'Piercing',
        properties: ['Finesse', 'Light'],
        isOffHand: true,
        hasTwoWeaponFightingStyle: false
      },
      2,
      4,
      3,
      true
    );

    expect(offHandWithoutStyle.attackBonus).toBe(7); // Saldırıya hala 4 DEX + 3 PB eklenir
    expect(offHandWithoutStyle.damageBonus).toBe(0); // Hasara stat eklenmez!
    expect(offHandWithoutStyle.damageFormula).toBe('1d6');

    // Fighting style varsa hasara da eklenir
    const offHandWithStyle = calculateWeaponAttack(
      {
        name: 'Shortsword (Off-hand)',
        damageDice: '1d6',
        damageType: 'Piercing',
        properties: ['Finesse', 'Light'],
        isOffHand: true,
        hasTwoWeaponFightingStyle: true
      },
      2,
      4,
      3,
      true
    );

    expect(offHandWithStyle.damageBonus).toBe(4);
    expect(offHandWithStyle.damageFormula).toBe('1d6+4');
  });

  it('Versatile Weapon: İki elle tutulduğunda 1d10 hasar zarı işletir', () => {
    const versatileTwoHanded = calculateWeaponAttack(
      {
        name: 'Longsword',
        damageDice: '1d8',
        versatileDamageDice: '1d10',
        damageType: 'Slashing',
        properties: ['Versatile'],
        isTwoHandedVersatile: true
      },
      3,
      1,
      2,
      true
    );

    expect(versatileTwoHanded.damageDice).toBe('1d10');
    expect(versatileTwoHanded.damageFormula).toBe('1d10+3');
  });

  it('Büyü Saldırısı ve DC Hesabı: PB + Casting Mod ve 8 + PB + Casting Mod', () => {
    const spellStats = calculateSpellAttackAndDC(4, 3); // +4 Casting Mod (INT/WIS/CHA), +3 PB
    expect(spellStats.spellAttackBonus).toBe(7);
    expect(spellStats.spellSaveDC).toBe(15);
  });
});

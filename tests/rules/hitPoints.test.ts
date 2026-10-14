import { describe, it, expect } from 'vitest';
import { calculateMaxHp } from '../../src/rules/hitPoints';

describe('Can Puanı (HP) Hesaplama Kuralları [SRD 5.1 sf. 12 Hit Points and Hit Dice]', () => {
  it('Seviye 1 Barbarian (d12, CON mod +3) HP: 15 olmalı [SRD 5.1 sf. 12]', () => {
    // 1. seviyede maksimum can zarı + CON mod: 12 + 3 = 15
    expect(calculateMaxHp('barbarian', 1, 3)).toBe(15);
  });

  it('Seviye 5 Barbarian (d12, CON mod +3) HP: 55 olmalı [SRD 5.1 sf. 12]', () => {
    // Seviye 1: 12 + 3 = 15
    // Seviye 2-5 (4 seviye): 4 * (7 + 3) = 40
    // Toplam: 15 + 40 = 55
    expect(calculateMaxHp('barbarian', 5, 3)).toBe(55);
  });

  it('Seviye 1 Wizard (d6, CON mod +2) HP: 8 olmalı [SRD 5.1 sf. 12]', () => {
    // 6 + 2 = 8
    expect(calculateMaxHp('wizard', 1, 2)).toBe(8);
  });

  it('Seviye 3 Fighter (d10, CON mod +1) HP: 25 olmalı [SRD 5.1 sf. 12]', () => {
    // Seviye 1: 10 + 1 = 11
    // Seviye 2-3 (2 seviye): 2 * (6 + 1) = 14
    // Toplam: 11 + 14 = 25
    expect(calculateMaxHp('fighter', 3, 1)).toBe(25);
  });

  it('Hill Dwarf ırkı ek +1 HP/seviye bonusu almalı [SRD 5.1 sf. 4 Hill Dwarf]', () => {
    // Seviye 1 Cleric (d8, CON mod +2) + Hill Dwarf (+1) = 8 + 2 + 1 = 11
    expect(calculateMaxHp('cleric', 1, 2, true)).toBe(11);
    // Seviye 3 Cleric (d8, CON mod +2) + Hill Dwarf
    // Seviye 1: 11
    // Seviye 2-3: 2 * (5 + 2 + 1) = 16 => Toplam: 27
    expect(calculateMaxHp('cleric', 3, 2, true)).toBe(27);
  });

  it('Negatif CON durumunda seviye başı artış en az 1 olmalı [SRD 5.1 sf. 12]', () => {
    // Seviye 2 Wizard (d6, sabit 4), CON mod -4 => 4 + (-4) = 0 => kural gereği min 1 artar
    // Seviye 1: 6 + (-4) = 2
    // Seviye 2: 2 + 1 = 3
    expect(calculateMaxHp('wizard', 2, -4)).toBe(3);
  });
});

import { describe, it, expect } from 'vitest';
import {
  calculateConcentrationDC,
  startConcentration,
  checkConcentrationLossOnCondition
} from '../../src/rules/concentration';

describe('D&D 5e Konsantrasyon Kuralları [SRD 5.1 sf. 54 Concentration]', () => {
  it('Hasar alındığında DC = max(10, floor(damage / 2)) kuralı işletilmelidir', () => {
    // 10 hasar alındığında DC = max(10, 5) = 10
    expect(calculateConcentrationDC(10)).toBe(10);

    // 15 hasar alındığında DC = max(10, 7) = 10
    expect(calculateConcentrationDC(15)).toBe(10);

    // 22 hasar alındığında DC = max(10, 11) = 11
    expect(calculateConcentrationDC(22)).toBe(11);

    // 45 hasar alındığında DC = max(10, 22) = 22
    expect(calculateConcentrationDC(45)).toBe(22);
  });

  it('Yeni bir konsantrasyon büyüsü atıldığında önceki konsantrasyon otomatik bozulmalıdır', () => {
    const spell1 = { slug: 'bless', name: 'Bless', level: 1 };
    const { newConcentration } = startConcentration(null, spell1);
    expect(newConcentration.spellName).toBe('Bless');

    const spell2 = { slug: 'hold-person', name: 'Hold Person', level: 2 };
    const result = startConcentration(newConcentration, spell2);

    expect(result.previousBrokenSpellName).toBe('Bless');
    expect(result.newConcentration.spellName).toBe('Hold Person');
  });

  it('Karakterin HP 0 olduğunda veya Incapacitated/Unconscious durumuna düştüğünde konsantrasyon bozulmalıdır', () => {
    expect(checkConcentrationLossOnCondition([], 0)).toBe(true);
    expect(checkConcentrationLossOnCondition(['incapacitated'], 25)).toBe(true);
    expect(checkConcentrationLossOnCondition(['unconscious'], 25)).toBe(true);
    expect(checkConcentrationLossOnCondition(['poisoned'], 25)).toBe(false);
  });
});

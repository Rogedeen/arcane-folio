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
});

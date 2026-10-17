import { describe, it, expect } from 'vitest';
import {
  calculateCarryingCapacity,
  calculateTotalWeight,
  isEncumbered,
  getDetailedEncumbranceStatus,
  checkArmorStrengthRequirement
} from '../../src/rules/inventory';
import { ItemData } from '../../src/types/content';

describe('Envanter ve Taşıma Kapasitesi Kuralları [SRD 5.1 sf. 60 Lifting and Carrying]', () => {
  it('STR 15 olan bir karakterin taşıma kapasitesi 225 lbs olmalıdır (STR x 15) [SRD 5.1 sf. 60]', () => {
    expect(calculateCarryingCapacity(15)).toBe(225);
  });

  it('STR 10 olan karakterin taşıma kapasitesi 150 lbs olmalıdır [SRD 5.1 sf. 60]', () => {
    expect(calculateCarryingCapacity(10)).toBe(150);
  });

  it('Eşyaların toplam ağırlığı miktar x birim ağırlık olarak toplanmalıdır', () => {
    const items: ItemData[] = [
      { slug: 'longsword', name: 'Longsword', type: 'weapon', cost: '15 gp', weight: 3, description: '', quantity: 2, source: 'SRD 5.1', source_ref: '', license: 'CC-BY-4.0' },
      { slug: 'shield', name: 'Shield', type: 'shield', cost: '10 gp', weight: 6, description: '', quantity: 1, source: 'SRD 5.1', source_ref: '', license: 'CC-BY-4.0' },
      { slug: 'torch', name: 'Torch', type: 'gear', cost: '1 cp', weight: 1, description: '', quantity: 5, source: 'SRD 5.1', source_ref: '', license: 'CC-BY-4.0' }
    ];
    // 3*2 + 6*1 + 1*5 = 6 + 6 + 5 = 17 lbs
    expect(calculateTotalWeight(items)).toBe(17);
  });

  it('Ağırlık taşıma kapasitesini aştığında aşırı yüklü (encumbered) sayılmalıdır [SRD 5.1 sf. 60]', () => {
    // STR 10 => 150 lbs kapasite
    expect(isEncumbered(10, 140)).toBe(false);
    expect(isEncumbered(10, 150)).toBe(false);
    expect(isEncumbered(10, 151)).toBe(true);
  });

  describe('Standart Taşıma Kapasitesi Kuralı [SRD 5.1 sf. 60 - Varsayılan]', () => {
    it('STR 15 olan karakter 78.5 lbs veya 225 lbs altındayken yüksüz (unencumbered) olmalı ve 0 ceza almalıdır', () => {
      const normal = getDetailedEncumbranceStatus(15, 78.5);
      expect(normal.tier).toBe('unencumbered');
      expect(normal.speedPenalty).toBe(0);
      expect(normal.hasDisadvantageOnChecks).toBe(false);

      const maxLimit = getDetailedEncumbranceStatus(15, 225);
      expect(maxLimit.tier).toBe('unencumbered');
      expect(maxLimit.speedPenalty).toBe(0);

      const over = getDetailedEncumbranceStatus(15, 226);
      expect(over.tier).toBe('over-capacity');
      expect(over.speedPenalty).toBe(20);
      expect(over.hasDisadvantageOnChecks).toBe(true);
    });
  });

  describe('Variant Encumbrance Kuralları [PHB sf. 176 - Opsiyonel]', () => {
    it('STR 10 karakter için useVariant=true iken 50 lb üzeri Encumbered (-10 ft), 100 lb üzeri Heavily Encumbered (-20 ft + dezavantaj), 150 üzeri Over Capacity', () => {
      // Unencumbered
      const unenc = getDetailedEncumbranceStatus(10, 45, true);
      expect(unenc.tier).toBe('unencumbered');
      expect(unenc.speedPenalty).toBe(0);

      // Encumbered (> 50 lb)
      const enc = getDetailedEncumbranceStatus(10, 60, true);
      expect(enc.tier).toBe('encumbered');
      expect(enc.speedPenalty).toBe(10);
      expect(enc.hasDisadvantageOnChecks).toBe(false);

      // Heavily Encumbered (> 100 lb)
      const heavy = getDetailedEncumbranceStatus(10, 110, true);
      expect(heavy.tier).toBe('heavily-encumbered');
      expect(heavy.speedPenalty).toBe(20);
      expect(heavy.hasDisadvantageOnChecks).toBe(true);

      // Over capacity (> 150 lb)
      const over = getDetailedEncumbranceStatus(10, 155, true);
      expect(over.tier).toBe('over-capacity');
      expect(over.speedPenalty).toBe(30);
    });
  });

  describe('Zırh Güç Gereksinimi [SRD 5.1 sf. 62]', () => {
    it('Plate Armor için STR 15 gerekir, STR 14 olan karakterin hızı 10 ft düşer', () => {
      const plateCheck = checkArmorStrengthRequirement(14, 'Plate Armor');
      expect(plateCheck.meetsRequirement).toBe(false);
      expect(plateCheck.speedPenalty).toBe(10);
      expect(plateCheck.requiredStr).toBe(15);

      const plateMet = checkArmorStrengthRequirement(16, 'Plate Armor');
      expect(plateMet.meetsRequirement).toBe(true);
      expect(plateMet.speedPenalty).toBe(0);
    });

    it('Chain Mail için STR 13 gerekir, STR 10 olan karakterin hızı 10 ft düşer', () => {
      const chainCheck = checkArmorStrengthRequirement(10, 'Chain Mail');
      expect(chainCheck.meetsRequirement).toBe(false);
      expect(chainCheck.speedPenalty).toBe(10);
      expect(chainCheck.requiredStr).toBe(13);
    });
  });
});

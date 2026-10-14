import { describe, it, expect } from 'vitest';
import { calculateCarryingCapacity, calculateTotalWeight, isEncumbered } from '../../src/rules/inventory';
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
});

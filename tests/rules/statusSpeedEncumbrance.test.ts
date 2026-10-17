import { describe, it, expect } from 'vitest';
import { computeCharacterAdvantageState } from '../../src/rules/statusAnalysis';
import { getDetailedEncumbranceStatus } from '../../src/rules/inventory';
import type { ItemData } from '../../src/types/content';

describe('Durum, Yük (Encumbrance) ve Hız Cezası Kuralları', () => {
  it('STR 15 karakter 78.5 lb taşırken (kapasite 225 lbs) standart kuralla yüksüz olmalı ve hız cezası almamalıdır', () => {
    const enc = getDetailedEncumbranceStatus(15, 78.5);
    expect(enc.tier).toBe('unencumbered');
    expect(enc.speedPenalty).toBe(0);

    const status = computeCharacterAdvantageState({
      charClass: 'fighter',
      strScore: 15,
      inventory: [{ slug: 'bag', name: 'Sırt Çantası', type: 'gear', cost: '2 gp', weight: 78.5, quantity: 1, properties: [], description: 'Çanta', source: 'SRD 5.1', source_ref: 'PHB', license: 'CC-BY-4.0' }],
      conditions: []
    });

    // 225 lbs kapasite içinde olduğu için gereksiz uyarı veya hız cezası olmamalıdır
    const encTag = status.tags.find((t) => t.id.startsWith('encumbrance-'));
    expect(encTag).toBeUndefined();
    expect(status.speedPenalty).toBe(0);
  });

  it('STR 10 karakter kapasitesi olan 150 lbs sınırını aştığında (160 lb) Kapasite Aşıldı uyarısı ve hız cezası almalıdır', () => {
    const enc = getDetailedEncumbranceStatus(10, 160);
    expect(enc.tier).toBe('over-capacity');
    expect(enc.speedPenalty).toBe(20);

    const status = computeCharacterAdvantageState({
      charClass: 'druid',
      strScore: 10,
      inventory: [{ slug: 'excess-weight', name: 'Aşırı Yük Eşyası', type: 'gear', cost: '10 gp', weight: 160, quantity: 1, properties: [], description: 'Ağır ganimet sandığı', source: 'SRD 5.1', source_ref: 'PHB', license: 'CC-BY-4.0' }],
      conditions: []
    });

    const encTag = status.tags.find((t) => t.id === 'encumbrance-over-capacity');
    expect(encTag).toBeDefined();
    expect(encTag?.labelTr).toBe('Kapasite Aşıldı');
    expect(status.speedPenalty).toBe(20);
    expect(status.hasStrDexCheckDisadvantage).toBe(true);
  });

  it('STR 10 olan Druid, STR 13 gerektiren Zincir Zırh (Chain Mail) kuşandığında hız cezası -10 ft almalı ve büyü yapması engellenmelidir', () => {
    const chainMail: ItemData = {
      slug: 'chain-mail',
      name: 'Zincir Zırh',
      type: 'armor',
      cost: '75 gp',
      weight: 55,
      description: 'Ağır zırh',
      properties: ['heavy'],
      quantity: 1,
      equipped: true,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'CC-BY-4.0'
    };

    const status = computeCharacterAdvantageState({
      charClass: 'druid',
      strScore: 10,
      inventory: [chainMail],
      conditions: []
    });

    // 1. Yetkisiz Zırh: Büyü engellendi ve dezavantaj
    expect(status.isSpellcastingBlocked).toBe(true);
    expect(status.hasStrDexCheckDisadvantage).toBe(true);

    // 2. Yetersiz Güç (Zırh Hız Cezası: STR 10 < 13): Hız düşüşü -10 ft
    const armorStrTag = status.tags.find((t) => t.id.startsWith('armor-str-penalty'));
    expect(armorStrTag).toBeDefined();
    expect(status.speedPenalty).toBeGreaterThanOrEqual(10);
  });
});

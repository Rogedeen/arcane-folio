import { describe, it, expect } from 'vitest';
import { computeCharacterAdvantageState } from '../../src/rules/statusAnalysis';
import { getDetailedEncumbranceStatus } from '../../src/rules/inventory';
import type { ItemData } from '../../src/types/content';

describe('Durum, Yük (Encumbrance) ve Hız Cezası Kuralları', () => {
  it('STR 10 karakter 45 lb taşırken yüksüz (unencumbered) olmalı ve hız cezası 0 olmalıdır', () => {
    const enc = getDetailedEncumbranceStatus(10, 45);
    expect(enc.tier).toBe('unencumbered');
    expect(enc.speedPenalty).toBe(0);

    const status = computeCharacterAdvantageState({
      charClass: 'druid',
      strScore: 10,
      inventory: [{ slug: 'bag', name: 'Sırt Çantası', type: 'gear', cost: '2 gp', weight: 45, quantity: 1, properties: [], description: 'Çanta', source: 'SRD 5.1', source_ref: 'PHB', license: 'CC-BY-4.0' }],
      conditions: []
    });

    // Ağır yük olmamasına rağmen gereksiz uyarı etiketi OLMAMALIDIR
    const encTag = status.tags.find((t) => t.id.startsWith('encumbrance-'));
    expect(encTag).toBeUndefined();
    expect(status.speedPenalty).toBe(0);
  });

  it('STR 10 karakter 60 lb taşırken "Yüklü" olmalı ve -10 ft hız cezası almalıdır (Ağır Yük değil, Yüklü)', () => {
    const enc = getDetailedEncumbranceStatus(10, 60);
    expect(enc.tier).toBe('encumbered');
    expect(enc.speedPenalty).toBe(10);

    const status = computeCharacterAdvantageState({
      charClass: 'druid',
      strScore: 10,
      inventory: [{ slug: 'heavy-bag', name: 'Ağır Çanta', type: 'gear', cost: '2 gp', weight: 60, quantity: 1, properties: [], description: 'Ağır çanta', source: 'SRD 5.1', source_ref: 'PHB', license: 'CC-BY-4.0' }],
      conditions: []
    });

    const encTag = status.tags.find((t) => t.id === 'encumbrance-encumbered');
    expect(encTag).toBeDefined();
    expect(encTag?.labelTr).toBe('Yüklü'); // 'Ağır Yük' değil, 'Yüklü' olmalı
    expect(status.speedPenalty).toBe(10);
  });

  it('STR 10 karakter 110 lb taşırken "Ağır Yük" (Heavily Encumbered) olmalı ve -20 ft hız cezası + dezavantaj almalıdır', () => {
    const enc = getDetailedEncumbranceStatus(10, 110);
    expect(enc.tier).toBe('heavily-encumbered');
    expect(enc.speedPenalty).toBe(20);

    const status = computeCharacterAdvantageState({
      charClass: 'druid',
      strScore: 10,
      inventory: [{ slug: 'very-heavy-bag', name: 'Çok Ağır Çanta', type: 'gear', cost: '2 gp', weight: 110, quantity: 1, properties: [], description: 'Çok ağır çanta', source: 'SRD 5.1', source_ref: 'PHB', license: 'CC-BY-4.0' }],
      conditions: []
    });

    const encTag = status.tags.find((t) => t.id === 'encumbrance-heavily-encumbered');
    expect(encTag).toBeDefined();
    expect(encTag?.labelTr).toBe('Ağır Yük');
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

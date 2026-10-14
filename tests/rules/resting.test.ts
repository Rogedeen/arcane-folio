import { describe, it, expect } from 'vitest';
import { performShortRest, performLongRest } from '../../src/rules/resting';
import { ResourceState } from '../../src/types/resources';

const createMockResourceState = (): ResourceState => ({
  currentHp: 12,
  maxHp: 30,
  tempHp: 5,
  hitDiceAvailable: 4,
  totalHitDice: 4,
  hitDieType: 'd8',
  spellSlots: {
    1: { tier: 1, total: 4, expended: 3 },
    2: { tier: 2, total: 2, expended: 2 }
  },
  pactMagic: {
    slotLevel: 2,
    total: 2,
    expended: 2
  }
});

describe('Dinlenme Mekanikleri [SRD 5.1 sf. 78 Resting]', () => {
  it('Kısa Dinlenme (Short Rest): Harcanan zar kadar can yenilenir, Warlock slotları sıfırlanır [SRD 5.1 sf. 78]', () => {
    const state = createMockResourceState();
    // 2 zar harcandı, toplam 11 HP kazanıldı
    const afterShortRest = performShortRest(state, 2, 11);

    expect(afterShortRest.currentHp).toBe(23); // 12 + 11 = 23
    expect(afterShortRest.hitDiceAvailable).toBe(2); // 4 - 2 = 2
    expect(afterShortRest.tempHp).toBe(5); // Temp HP kısa dinlenmede silinmez
    expect(afterShortRest.pactMagic?.expended).toBe(0); // Pact magic kısa dinlenmede yenilenir
    expect(afterShortRest.spellSlots[1].expended).toBe(3); // Normal büyü slotları kısa dinlenmede yenilenmez
  });

  it('Uzun Dinlenme (Long Rest): Can tamamen dolar, Temp HP silinir, tüm büyü slotları yenilenir [SRD 5.1 sf. 78]', () => {
    const state = createMockResourceState();
    state.hitDiceAvailable = 1; // 3 zar harcanmış durumda

    const afterLongRest = performLongRest(state);

    expect(afterLongRest.currentHp).toBe(30); // Max HP'ye dolar
    expect(afterLongRest.tempHp).toBe(0); // Temp HP sıfırlanır
    expect(afterLongRest.spellSlots[1].expended).toBe(0); // Slotlar sıfırlanır
    expect(afterLongRest.spellSlots[2].expended).toBe(0);
    expect(afterLongRest.pactMagic?.expended).toBe(0);
    // Can zarı: Harcanan 3 zar, toplam zar 4, yarısı en az 2 zar geri kazanılır: 1 + 2 = 3
    expect(afterLongRest.hitDiceAvailable).toBe(3);
  });
});

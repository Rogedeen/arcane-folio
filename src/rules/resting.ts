import { ResourceState } from '../types/resources';

/**
 * D&D 5e Kısa Dinlenme (Short Rest)
 * Referans: SRD 5.1 sf. 78 "Resting: Short Rest"
 */
export function performShortRest(
  state: ResourceState,
  hitDiceSpent: number,
  rolledHpTotal: number
): ResourceState {
  const actualDiceSpent = Math.min(state.hitDiceAvailable, Math.max(0, hitDiceSpent));
  const newHp = Math.min(state.maxHp, state.currentHp + Math.max(0, rolledHpTotal));

  // Warlock pact magic kısa dinlenmede tamamen yenilenir
  const newPactMagic = state.pactMagic
    ? { ...state.pactMagic, expended: 0 }
    : undefined;

  return {
    ...state,
    currentHp: newHp,
    hitDiceAvailable: state.hitDiceAvailable - actualDiceSpent,
    pactMagic: newPactMagic
  };
}

/**
 * D&D 5e Uzun Dinlenme (Long Rest)
 * Referans: SRD 5.1 sf. 78 "Resting: Long Rest"
 */
export function performLongRest(state: ResourceState): ResourceState {
  // Harcanan büyü slotlarının tümünü sıfırla
  const resetSpellSlots: Record<number, { tier: number; total: number; expended: number }> = {};
  for (const [tier, slot] of Object.entries(state.spellSlots)) {
    resetSpellSlots[Number(tier)] = {
      ...slot,
      expended: 0
    };
  }

  // Can zarlarının yarısını (en az 1) geri kazan
  const regainedDice = Math.max(1, Math.floor(state.totalHitDice / 2));
  const newHitDice = Math.min(state.totalHitDice, state.hitDiceAvailable + regainedDice);

  return {
    ...state,
    currentHp: state.maxHp, // Can tamamen dolar
    tempHp: 0,             // Geçici can sıfırlanır
    hitDiceAvailable: newHitDice,
    spellSlots: resetSpellSlots,
    pactMagic: state.pactMagic ? { ...state.pactMagic, expended: 0 } : undefined
  };
}

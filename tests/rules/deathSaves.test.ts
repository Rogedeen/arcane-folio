import { describe, it, expect } from 'vitest';
import { processDeathSaveRoll, applyDamageWhileDying, INITIAL_DEATH_SAVES } from '../../src/rules/deathSaves';

describe('SRD 5.1 Death Saving Throws Rules Engine', () => {
  it('rolls a natural 20 and immediately regains 1 HP', () => {
    const res = processDeathSaveRoll(20, INITIAL_DEATH_SAVES);
    expect(res.regainedHp).toBe(1);
    expect(res.isStable).toBe(true);
    expect(res.isDead).toBe(false);
  });

  it('rolls a natural 1 and incurs 2 failures', () => {
    const res = processDeathSaveRoll(1, INITIAL_DEATH_SAVES);
    expect(res.failures).toBe(2);
    expect(res.isDead).toBe(false);

    // Another 1 kills the character (total 3 failures)
    const deadRes = processDeathSaveRoll(1, res);
    expect(deadRes.failures).toBe(3);
    expect(deadRes.isDead).toBe(true);
  });

  it('accumulates 3 successes and becomes stable', () => {
    let state = INITIAL_DEATH_SAVES;
    state = processDeathSaveRoll(12, state); // +1
    expect(state.successes).toBe(1);
    state = processDeathSaveRoll(15, state); // +2
    expect(state.successes).toBe(2);
    state = processDeathSaveRoll(10, state); // +3
    expect(state.successes).toBe(3);
    expect(state.isStable).toBe(true);
  });

  it('adds failure when taking damage while dying', () => {
    const state = applyDamageWhileDying(INITIAL_DEATH_SAVES, false);
    expect(state.failures).toBe(1);

    const critState = applyDamageWhileDying(state, true); // +2
    expect(critState.failures).toBe(3);
    expect(critState.isDead).toBe(true);
  });
});

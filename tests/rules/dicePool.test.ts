import { describe, it, expect } from 'vitest';
import { executeDicePoolRoll } from '../../src/components/DiceTray';

describe('Multi-Dice Pool Roller', () => {
  it('rolls 4d6 correctly with sum between 4 and 24', () => {
    const res = executeDicePoolRoll({ d4: 0, d6: 4, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 });
    expect(res.diceRolls).toHaveLength(4);
    expect(res.totalSum).toBeGreaterThanOrEqual(4);
    expect(res.totalSum).toBeLessThanOrEqual(24);
    expect(res.formula).toBe('4d6');
  });

  it('rolls mixed pool 2d8 + 1d20 with modifier +3', () => {
    const res = executeDicePoolRoll(
      { d4: 0, d6: 0, d8: 2, d10: 0, d12: 0, d20: 1, d100: 0 },
      3
    );
    expect(res.diceRolls).toHaveLength(3);
    expect(res.formula).toBe('2d8 + 1d20 + 3');
    // Minimum 1+1+1 + 3 = 6
    expect(res.totalSum).toBeGreaterThanOrEqual(6);
  });
});

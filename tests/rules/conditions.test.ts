import { describe, it, expect } from 'vitest';
import { getCondition, getAllConditions, isMovementBlocked } from '../../src/rules/conditions';

describe('SRD 5.1 Conditions Rules Engine', () => {
  it('contains all 15 SRD conditions', () => {
    const conditions = getAllConditions();
    expect(conditions.length).toBe(15);
  });

  it('correctly reports movement block for paralyzed, stunned or grappled', () => {
    expect(isMovementBlocked(['paralyzed'])).toBe(true);
    expect(isMovementBlocked(['grappled'])).toBe(true);
    expect(isMovementBlocked(['blinded'])).toBe(false);
  });

  it('correctly provides disadvantage on attack rolls for poisoned and blinded', () => {
    const blinded = getCondition('blinded');
    const poisoned = getCondition('poisoned');
    expect(blinded?.givesDisadvantageOnAttacks).toBe(true);
    expect(poisoned?.givesDisadvantageOnAttacks).toBe(true);
  });

  it('correctly flags advantage to attackers for paralyzed, restrained and stunned', () => {
    const paralyzed = getCondition('paralyzed');
    const restrained = getCondition('restrained');
    expect(paralyzed?.givesAdvantageToAttackers).toBe(true);
    expect(restrained?.givesAdvantageToAttackers).toBe(true);
  });
});

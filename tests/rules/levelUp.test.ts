import { describe, it, expect } from 'vitest';
import { calculateAverageHpIncrease, isAsiLevel, performLevelUp } from '../../src/rules/levelUp';

describe('SRD 5.1 Level Up Rules Engine', () => {
  it('calculates average HP increase correctly: Fighter d10 (avg 6) + CON mod 2 = 8', () => {
    const inc = calculateAverageHpIncrease('fighter', 2);
    expect(inc).toBe(8); // floor(10/2) + 1 + 2 = 6 + 2 = 8
  });

  it('calculates average HP increase for Wizard d6 (avg 4) + CON mod 1 = 5', () => {
    const inc = calculateAverageHpIncrease('wizard', 1);
    expect(inc).toBe(5); // floor(6/2) + 1 + 1 = 4 + 1 = 5
  });

  it('detects ASI levels for Fighter at 4, 6, 8, etc.', () => {
    expect(isAsiLevel('fighter', 4)).toBe(true);
    expect(isAsiLevel('fighter', 6)).toBe(true);
    expect(isAsiLevel('fighter', 5)).toBe(false);
  });

  it('performs level up from Level 2 to Level 3, unlocking subclass for Fighter', () => {
    const res = performLevelUp(2, 'fighter', 20, 2);
    expect(res.newLevel).toBe(3);
    expect(res.newProficiencyBonus).toBe(2);
    expect(res.unlockedSubclass).toBe(true);
    expect(res.newMaxHp).toBe(28); // 20 + 8
  });

  it('updates proficiency bonus from +2 to +3 when leveling up from 4 to 5', () => {
    const res = performLevelUp(4, 'fighter', 36, 2);
    expect(res.newLevel).toBe(5);
    expect(res.newProficiencyBonus).toBe(3);
  });

  it('prevents leveling beyond level 20', () => {
    expect(() => performLevelUp(20, 'fighter', 150, 2)).toThrow(/Maksimum seviye/);
  });
});

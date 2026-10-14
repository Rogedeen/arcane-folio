import { describe, it, expect } from 'vitest';
import { getSubclassForClass, getSubclassUnlockLevel } from '../../src/rules/subclasses';

describe('SRD 5.1 Subclasses Rules Engine', () => {
  it('unlocks Cleric and Sorcerer subclasses at Level 1', () => {
    expect(getSubclassUnlockLevel('cleric')).toBe(1);
    expect(getSubclassUnlockLevel('sorcerer')).toBe(1);
    expect(getSubclassUnlockLevel('warlock')).toBe(1);
  });

  it('unlocks Wizard and Druid subclasses at Level 2', () => {
    expect(getSubclassUnlockLevel('wizard')).toBe(2);
    expect(getSubclassUnlockLevel('druid')).toBe(2);
  });

  it('unlocks Fighter, Barbarian, Rogue subclasses at Level 3', () => {
    expect(getSubclassUnlockLevel('fighter')).toBe(3);
    expect(getSubclassUnlockLevel('barbarian')).toBe(3);
    expect(getSubclassUnlockLevel('rogue')).toBe(3);
  });

  it('retrieves correct subclass details for Fighter (Champion)', () => {
    const champ = getSubclassForClass('fighter');
    expect(champ).toBeDefined();
    expect(champ?.name).toBe('Champion');
    expect(champ?.features.some((f) => f.name === 'Improved Critical')).toBe(true);
  });
});

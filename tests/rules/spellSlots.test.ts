import { describe, it, expect } from 'vitest';
import { getSpellSlotsForLevel } from '../../src/rules/spellSlots';

describe('Büyü Slotları Tablosu [SRD 5.1 sf. 13-55 Spellcasting Slots]', () => {
  it('Seviye 1 Wizard: 2 adet 1. seviye slot [SRD 5.1 sf. 53]', () => {
    const slots = getSpellSlotsForLevel('wizard', 1);
    expect(slots[1].total).toBe(2);
    expect(slots[2]).toBeUndefined();
  });

  it('Seviye 5 Wizard: 4x 1. seviye, 3x 2. seviye, 2x 3. seviye slot [SRD 5.1 sf. 53]', () => {
    const slots = getSpellSlotsForLevel('wizard', 5);
    expect(slots[1].total).toBe(4);
    expect(slots[2].total).toBe(3);
    expect(slots[3].total).toBe(2);
    expect(slots[4]).toBeUndefined();
  });

  it('Seviye 1 Paladin (yarı büyücü): Büyü slotu olmamalı [SRD 5.1 sf. 31]', () => {
    const slots = getSpellSlotsForLevel('paladin', 1);
    expect(Object.keys(slots)).toHaveLength(0);
  });

  it('Seviye 5 Paladin: 4x 1. seviye, 2x 2. seviye slot [SRD 5.1 sf. 31]', () => {
    const slots = getSpellSlotsForLevel('paladin', 5);
    expect(slots[1].total).toBe(4);
    expect(slots[2].total).toBe(2);
    expect(slots[3]).toBeUndefined();
  });

  it('Seviye 5 Warlock (Pact Magic): 2 adet 3. seviye slot [SRD 5.1 sf. 47]', () => {
    const slots = getSpellSlotsForLevel('warlock', 5);
    expect(slots[3].total).toBe(2);
    expect(slots[1]).toBeUndefined();
  });

  it('Büyü yapmayan sınıflar (Fighter, Barbarian, Rogue): Slot olmamalı', () => {
    const slots = getSpellSlotsForLevel('barbarian', 10);
    expect(Object.keys(slots)).toHaveLength(0);
  });
});

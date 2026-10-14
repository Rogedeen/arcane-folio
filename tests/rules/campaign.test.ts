import { describe, it, expect } from 'vitest';
import {
  generateInviteCode,
  isValidInviteCode,
  canModifyPartyMember,
  sortMembersByPassivePerception,
  applyMemberDamageOrHealing
} from '../../src/rules/campaignRules';
import { PartyMember } from '../../src/types/campaign';

describe('Campaign Rules and Permissions Engine', () => {
  it('generates a valid 6-character alphanumeric invite code', () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(6);
    expect(isValidInviteCode(code)).toBe(true);
  });

  it('rejects invalid invite codes', () => {
    expect(isValidInviteCode('ABC')).toBe(false); // too short
    expect(isValidInviteCode('TOOLONGCODE')).toBe(false);
    expect(isValidInviteCode('ABC-12')).toBe(false); // special char
  });

  it('grants DM permission to modify any party member', () => {
    expect(canModifyPartyMember('dm', 'member-123')).toBe(true);
  });

  it('restricts player from modifying other members', () => {
    expect(canModifyPartyMember('player', 'member-123', 'member-456')).toBe(false);
    expect(canModifyPartyMember('player', 'member-123', 'member-123')).toBe(true);
  });

  it('sorts party members by passive perception in descending order', () => {
    const members: PartyMember[] = [
      { id: '1', name: 'Fighter', charClass: 'fighter', level: 3, currentHp: 28, maxHp: 28, tempHp: 0, ac: 16, passivePerception: 11, passiveInvestigation: 10, stats: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 }, activeConditions: [], playerName: 'Ahmet' },
      { id: '2', name: 'Cleric', charClass: 'cleric', level: 3, currentHp: 24, maxHp: 24, tempHp: 0, ac: 18, passivePerception: 15, passiveInvestigation: 12, stats: { str: 14, dex: 10, con: 14, int: 10, wis: 16, cha: 12 }, activeConditions: [], playerName: 'Mehmet' },
      { id: '3', name: 'Rogue', charClass: 'rogue', level: 3, currentHp: 21, maxHp: 21, tempHp: 0, ac: 14, passivePerception: 17, passiveInvestigation: 14, stats: { str: 10, dex: 18, con: 12, int: 14, wis: 14, cha: 12 }, activeConditions: [], playerName: 'Can' }
    ];

    const sorted = sortMembersByPassivePerception(members);
    expect(sorted[0].name).toBe('Rogue'); // 17
    expect(sorted[1].name).toBe('Cleric'); // 15
    expect(sorted[2].name).toBe('Fighter'); // 11
  });

  it('correctly applies damage absorbing Temp HP first then HP', () => {
    const member: PartyMember = {
      id: '1',
      name: 'Fighter',
      charClass: 'fighter',
      level: 3,
      currentHp: 28,
      maxHp: 28,
      tempHp: 5,
      ac: 16,
      passivePerception: 11,
      passiveInvestigation: 10,
      stats: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 },
      activeConditions: [],
      playerName: 'Ahmet'
    };

    // 8 damage against 5 Temp HP and 28 HP -> 0 Temp HP and 25 HP
    const damaged = applyMemberDamageOrHealing(member, 8, false);
    expect(damaged.tempHp).toBe(0);
    expect(damaged.currentHp).toBe(25);
  });

  it('correctly applies healing capped at maxHp', () => {
    const member: PartyMember = {
      id: '1',
      name: 'Fighter',
      charClass: 'fighter',
      level: 3,
      currentHp: 20,
      maxHp: 28,
      tempHp: 0,
      ac: 16,
      passivePerception: 11,
      passiveInvestigation: 10,
      stats: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 },
      activeConditions: [],
      playerName: 'Ahmet'
    };

    const healed = applyMemberDamageOrHealing(member, 15, true);
    expect(healed.currentHp).toBe(28); // capped at 28
  });
});

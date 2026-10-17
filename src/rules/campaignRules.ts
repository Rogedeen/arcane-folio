import { PartyMember, UserRole } from '../types/campaign';

/**
 * 6 Haneli Rastgele Davet Kodu Üretir
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Davet kodunun geçerliliğini denetler
 */
export function isValidInviteCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim().toUpperCase();
  const regex = /^[A-Z0-9]{6}$/;
  return regex.test(clean);
}

/**
 * DM yetki kontrolü
 */
export function canModifyPartyMember(userRole: UserRole, targetMemberId: string, currentUserId?: string): boolean {
  if (userRole === 'dm') {
    return true;
  }
  return currentUserId !== undefined && targetMemberId === currentUserId;
}

/**
 * Parti üyelerini Pasif Algıya (Passive Perception) göre sıralar (DM Gizlilik/Tuzak kontrolü için)
 */
export function sortMembersByPassivePerception(members: PartyMember[]): PartyMember[] {
  return [...members].sort((a, b) => b.passivePerception - a.passivePerception);
}

/**
 * Üyenin canını günceller
 */
export function applyMemberDamageOrHealing(member: PartyMember, amount: number, isHealing: boolean): PartyMember {
  let newHp = member.currentHp;
  let newTempHp = member.tempHp;

  if (isHealing) {
    newHp = Math.min(member.maxHp, newHp + amount);
  } else {
    let remainingDamage = amount;
    if (newTempHp > 0) {
      if (remainingDamage <= newTempHp) {
        newTempHp -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= newTempHp;
        newTempHp = 0;
      }
    }
    newHp = Math.max(0, newHp - remainingDamage);
  }

  return {
    ...member,
    currentHp: newHp,
    tempHp: newTempHp
  };
}

/**
 * FullCharacter nesnesini DM paneli PartyMember yapısına dönüştürür.
 * Becerileri, statları, AC'yi ve pasif algıyı tam ve doğru hesaplar.
 */
export function characterToPartyMember(char: any, acValue: number): PartyMember {
  const level = char.level || 1;
  const profBonus = Math.floor((level - 1) / 4) + 2;
  const baseStats = char.baseAbilities || char.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const wisMod = getMod(baseStats.wis || 10);
  const intMod = getMod(baseStats.int || 10);

  const profSkills = char.proficientSkills || [];
  const expertSkills = char.expertSkills || [];

  const isPerceptionProf = profSkills.includes('perception');
  const isPerceptionExpert = expertSkills.includes('perception');
  const isInvestigationProf = profSkills.includes('investigation');
  const isInvestigationExpert = expertSkills.includes('investigation');

  const perceptionBonus = isPerceptionExpert ? profBonus * 2 : isPerceptionProf ? profBonus : 0;
  const investigationBonus = isInvestigationExpert ? profBonus * 2 : isInvestigationProf ? profBonus : 0;

  const passivePerception = 10 + wisMod + perceptionBonus;
  const passiveInvestigation = 10 + intMod + investigationBonus;

  // Tüm 18 beceriyi hesapla
  const skillMods: Record<string, number> = {};
  const abilityMap: Record<string, 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'> = {
    athletics: 'str',
    acrobatics: 'dex',
    sleight_of_hand: 'dex',
    stealth: 'dex',
    arcana: 'int',
    history: 'int',
    investigation: 'int',
    nature: 'int',
    religion: 'int',
    animal_handling: 'wis',
    insight: 'wis',
    medicine: 'wis',
    perception: 'wis',
    survival: 'wis',
    deception: 'cha',
    intimidation: 'cha',
    performance: 'cha',
    persuasion: 'cha',
  };

  Object.entries(abilityMap).forEach(([skillId, ab]) => {
    const abMod = getMod(baseStats[ab] || 10);
    const isP = profSkills.includes(skillId);
    const isE = expertSkills.includes(skillId);
    const add = isE ? profBonus * 2 : isP ? profBonus : 0;
    skillMods[skillId] = abMod + add;
  });

  return {
    id: char.id,
    name: char.name,
    charClass: `${char.class || 'Adventurer'}${char.subclass ? ` (${char.subclass})` : ''}`,
    level: char.level || 1,
    currentHp: char.currentHp ?? 10,
    maxHp: char.maxHp ?? 10,
    tempHp: char.tempHp ?? 0,
    ac: acValue,
    passivePerception,
    passiveInvestigation,
    stats: {
      str: baseStats.str || 10,
      dex: baseStats.dex || 10,
      con: baseStats.con || 10,
      int: baseStats.int || 10,
      wis: baseStats.wis || 10,
      cha: baseStats.cha || 10,
    },
    activeConditions: char.activeConditions || [],
    playerName: char.playerName || 'Oyuncu',
    skillModifiers: skillMods,
    proficientSkills: profSkills,
    expertSkills: expertSkills,
  };
}

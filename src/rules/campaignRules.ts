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

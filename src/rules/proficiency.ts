/**
 * D&D 5e Ustalık Bonusu (Proficiency Bonus) Hesaplayıcı
 * Referans: SRD 5.1 sf. 15 "Proficiency Bonus"
 * Seviye 1-4: +2, 5-8: +3, 9-12: +4, 13-16: +5, 17-20: +6
 * Formül: floor((level - 1) / 4) + 2
 */
export function calculateProficiencyBonus(level: number): number {
  if (level < 1) {
    return 2;
  }
  const bonus = Math.floor((level - 1) / 4) + 2;
  return Math.min(Math.max(bonus, 2), 6);
}

/**
 * D&D 5e Yetenek Skoru Modifikatörü Hesaplayıcı
 * Referans: SRD 5.1 sf. 76 "Ability Scores and Modifiers"
 * Formül: floor((skor - 10) / 2)
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

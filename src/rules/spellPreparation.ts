/**
 * D&D 5e Büyü Hazırlama Sınırı
 * Referans: SRD 5.1 sf. 53 "Preparing and Casting Spells"
 * Formül: max(1, seviye + zeka/ilim modifikatörü)
 */

export function calculateMaxPreparedSpells(level: number, castingModifier: number): number {
  return Math.max(1, level + castingModifier);
}

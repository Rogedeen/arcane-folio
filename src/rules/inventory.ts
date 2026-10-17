import { ItemData } from '../types/content';

/**
 * D&D 5e Taşıma Kapasitesi ve Ağırlık Kuralları
 * Referans: SRD 5.1 sf. 60 "Lifting and Carrying"
 */

export function calculateCarryingCapacity(strScore: number): number {
  return Math.max(1, strScore) * 15;
}

export function calculateTotalWeight(items: ItemData[]): number {
  return items.reduce((sum, it) => sum + it.weight * it.quantity, 0);
}

export function isEncumbered(strScore: number, totalWeight: number): boolean {
  return totalWeight > calculateCarryingCapacity(strScore);
}

export type EncumbranceTier = 'unencumbered' | 'encumbered' | 'heavily-encumbered' | 'over-capacity';

export interface EncumbranceStatus {
  tier: EncumbranceTier;
  speedPenalty: number; // ft cinsinden hız düşüşü
  hasDisadvantageOnChecks: boolean; // STR, DEX, CON testlerine dezavantaj
  maxCapacity: number;
}

/**
 * Variant Encumbrance Kuralı (SRD 5.1 / PHB sf. 176):
 * - Toplam ağırlık > STR * 5 lb: Encumbered (-10 ft hız)
 * - Toplam ağırlık > STR * 10 lb: Heavily Encumbered (-20 ft hız, STR/DEX/CON testlerine dezavantaj)
 * - Toplam ağırlık > STR * 15 lb: Over Capacity (Taşıma sınırı aşıldı, hareket edilemez)
 */
export function getDetailedEncumbranceStatus(strScore: number, totalWeight: number): EncumbranceStatus {
  const safeStr = Math.max(1, strScore);
  const maxCapacity = safeStr * 15;

  if (totalWeight > maxCapacity) {
    return {
      tier: 'over-capacity',
      speedPenalty: 30, // Hareketsiz / 0 ft
      hasDisadvantageOnChecks: true,
      maxCapacity
    };
  }

  if (totalWeight > safeStr * 10) {
    return {
      tier: 'heavily-encumbered',
      speedPenalty: 20,
      hasDisadvantageOnChecks: true,
      maxCapacity
    };
  }

  if (totalWeight > safeStr * 5) {
    return {
      tier: 'encumbered',
      speedPenalty: 10,
      hasDisadvantageOnChecks: false,
      maxCapacity
    };
  }

  return {
    tier: 'unencumbered',
    speedPenalty: 0,
    hasDisadvantageOnChecks: false,
    maxCapacity
  };
}

/**
 * Zırh Güç Gereksinimi Kuralı (SRD 5.1 sf. 62 "Armor and Shields"):
 * Karakterin STR skoru zırhın gereksiniminden düşükse, karakterin hızı 10 fit düşer.
 * Örn: Chain Mail (STR 13), Splint (STR 15), Plate (STR 15).
 */
export function checkArmorStrengthRequirement(
  strScore: number,
  armorNameOrSlug: string
): { meetsRequirement: boolean; speedPenalty: number; requiredStr: number } {
  const name = armorNameOrSlug.toLowerCase();
  let requiredStr = 0;

  if (
    (name.includes('plate') || name.includes('plaka')) &&
    !name.includes('breastplate') &&
    !name.includes('half plate') &&
    !name.includes('göğüslük') &&
    !name.includes('yarım plaka')
  ) {
    requiredStr = 15;
  } else if (name.includes('splint') || name.includes('şerit')) {
    requiredStr = 15;
  } else if (name.includes('chain mail') || name.includes('zincir zırh') || name.includes('zincir')) {
    requiredStr = 13;
  }

  if (requiredStr > 0 && strScore < requiredStr) {
    return {
      meetsRequirement: false,
      speedPenalty: 10,
      requiredStr
    };
  }

  return {
    meetsRequirement: true,
    speedPenalty: 0,
    requiredStr
  };
}


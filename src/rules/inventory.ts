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

// =============================================================================
// POTION RULES HELPER (SRD 5.1)
// Potion of Healing, Greater, Superior, Supreme kuralları ve zar hesaplamaları.
// =============================================================================

export interface PotionRollResult {
  formula: string;
  diceCount: number;
  diceSides: number;
  flatBonus: number;
  rolls: number[];
  healAmount: number;
}

export function isPotionItem(nameOrType: string): boolean {
  const lower = nameOrType.toLowerCase();
  return lower.includes('potion') || lower.includes('iksir') || lower.includes('şifa') || lower.includes('healing');
}

export function calculatePotionHealing(name: string): PotionRollResult {
  const lower = name.toLowerCase();

  let diceCount = 2;
  const diceSides = 4;
  let flatBonus = 2;
  let formula = '2d4+2';

  if (lower.includes('supreme')) {
    diceCount = 10;
    flatBonus = 20;
    formula = '10d4+20';
  } else if (lower.includes('superior')) {
    diceCount = 8;
    flatBonus = 8;
    formula = '8d4+8';
  } else if (lower.includes('greater') || lower.includes('büyük')) {
    diceCount = 4;
    flatBonus = 4;
    formula = '4d4+4';
  }

  const rolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < diceCount; i++) {
    const val = Math.floor(Math.random() * diceSides) + 1;
    rolls.push(val);
    sum += val;
  }

  const healAmount = sum + flatBonus;

  return {
    formula,
    diceCount,
    diceSides,
    flatBonus,
    rolls,
    healAmount,
  };
}

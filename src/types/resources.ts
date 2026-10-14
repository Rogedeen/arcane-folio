export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface SpellSlotTier {
  tier: number; // 1 - 9
  total: number;
  expended: number;
}

export interface ResourceState {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hitDiceAvailable: number;
  totalHitDice: number;
  hitDieType: string;
  spellSlots: Record<number, SpellSlotTier>;
  pactMagic?: {
    slotLevel: number;
    total: number;
    expended: number;
  };
}

export interface DiceRollResult {
  id: string;
  dieType: DieType;
  value: number;
  timestamp: string;
  isCrit: boolean; // d20'de 20
  isFumble: boolean; // d20'de 1
}

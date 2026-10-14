export interface SpellData {
  slug: string;
  name: string;
  level: number; // 0 - 9
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[];
  prepared?: boolean;
  source: string;
  source_ref: string;
  license: string;
}

export interface ItemData {
  slug: string;
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'gear' | 'potion' | 'scroll';
  cost: string;
  weight: number; // in lbs
  description: string;
  properties?: string[];
  equipped?: boolean;
  quantity: number;
  source: string;
  source_ref: string;
  license: string;
}

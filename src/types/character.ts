export type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type CharacterClass = 
  | 'barbarian' | 'bard' | 'cleric' | 'druid' | 'fighter' 
  | 'monk' | 'paladin' | 'ranger' | 'rogue' | 'sorcerer' 
  | 'warlock' | 'wizard';

export type CharacterRace = 
  | 'human' | 'elf' | 'dwarf' | 'halfling' 
  | 'dragonborn' | 'gnome' | 'half-elf' | 'half-orc' | 'tiefling';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface ArmorItem {
  name?: string;
  type: 'light' | 'medium' | 'heavy';
  baseAc: number;
  maxDexBonus?: number;
}

export interface Character {
  id: string;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  level: number; // 1 - 20
  baseAbilities: AbilityScores;
  equippedArmor?: ArmorItem;
  hasShield: boolean;
}

export interface DerivedStats {
  abilityScores: AbilityScores;
  modifiers: Record<AbilityName, number>;
  proficiencyBonus: number;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  hitDice: string;
  passivePerception: number;
}

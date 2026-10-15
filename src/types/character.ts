// =============================================================================
// CHARACTER TYPE DEFINITIONS — V3
// Genişletilmiş karakter modeli: karakter galerisi, HP state, proficiency, vb.
// =============================================================================

export type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type CharacterClass =
  | 'barbarian' | 'bard' | 'cleric' | 'druid' | 'fighter'
  | 'monk' | 'paladin' | 'ranger' | 'rogue' | 'sorcerer'
  | 'warlock' | 'wizard';

export type CharacterRace =
  | 'human' | 'elf' | 'dwarf' | 'halfling'
  | 'dragonborn' | 'gnome' | 'half-elf' | 'half-orc' | 'tiefling';

export type Background =
  | 'acolyte' | 'charlatan' | 'criminal' | 'entertainer' | 'folk-hero'
  | 'guild-artisan' | 'hermit' | 'noble' | 'outlander' | 'sage'
  | 'sailor' | 'soldier' | 'urchin' | 'custom';

export type Ruleset = '2014' | '2024';
export type Language = 'tr' | 'en';

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

export interface WeaponItem {
  id: string;
  name: string;
  damage: string;       // örn: '1d8', '2d6'
  damageType: string;   // örn: 'slashing', 'piercing'
  properties: string[]; // örn: ['versatile', 'finesse']
  range?: string;       // örn: '5 ft' veya '80/320 ft'
  abilityUsed: AbilityName; // saldırı için kullanılan stat
}

// V3: Karakter galerisi için zenginleştirilmiş model
export interface FullCharacter {
  // Kimlik
  id: string;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  subclass?: string;
  background: Background | string;
  level: number;           // 1 - 20
  experience?: number;
  alignment?: string;
  playerName?: string;
  avatarColor?: string;    // Renk kodu, avatar için

  // Stat'lar
  baseAbilities: AbilityScores;
  proficientSkills: string[];
  proficientSavingThrows: string[];

  // Ekipman & Envanter
  inventory?: import('./content').ItemData[];
  equippedArmor?: ArmorItem;
  hasShield: boolean;
  weapons: WeaponItem[];

  // Canlı durum (oyun sırasında değişen)
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hitDiceAvailable: number;
  spellSlots?: Record<number, { total: number; expended: number }>;
  activeConditions: string[];
  deathSaves?: { successes: number; failures: number };

  // Meta
  ruleset: Ruleset;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Geriye dönük uyumluluk için — mevcut CharacterCreator kullanıyor
export interface Character {
  id: string;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  level: number;
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
  passiveInvestigation: number;
  initiative: number;
  speed: number;
}

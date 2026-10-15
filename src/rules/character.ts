import { Character, DerivedStats, AbilityScores, AbilityName, CharacterRace } from '../types/character';
import { calculateModifier } from './abilityScores';
import { calculateProficiencyBonus } from './proficiency';
import { calculateMaxHp, CLASS_HIT_DICE } from './hitPoints';
import { calculateArmorClass } from './armorClass';

export const RACE_ABILITY_BONUSES: Record<CharacterRace, Partial<AbilityScores>> = {
  human: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
  elf: { dex: 2, int: 1 }, // Standard High Elf variant
  dwarf: { con: 2, wis: 1 }, // Hill Dwarf variant (+1 HP/level)
  halfling: { dex: 2, cha: 1 }, // Lightfoot Halfling
  dragonborn: { str: 2, cha: 1 },
  gnome: { int: 2, con: 1 }, // Rock Gnome
  'half-elf': { cha: 2, dex: 1, con: 1 },
  'half-orc': { str: 2, con: 1 },
  tiefling: { cha: 2, int: 1 }
};

export const RACE_SPEED: Record<CharacterRace, number> = {
  human: 30,
  elf: 30,
  dwarf: 25,
  halfling: 25,
  dragonborn: 30,
  gnome: 25,
  'half-elf': 30,
  'half-orc': 30,
  tiefling: 30,
};

/**
 * Karakter modelinden türetilmiş değerleri (DerivedStats) hesaplayan saf fonksiyon
 */
export function calculateDerivedStats(character: Character): DerivedStats {
  const racialBonuses = RACE_ABILITY_BONUSES[character.race] || {};

  const finalAbilities: AbilityScores = {
    str: character.baseAbilities.str + (racialBonuses.str ?? 0),
    dex: character.baseAbilities.dex + (racialBonuses.dex ?? 0),
    con: character.baseAbilities.con + (racialBonuses.con ?? 0),
    int: character.baseAbilities.int + (racialBonuses.int ?? 0),
    wis: character.baseAbilities.wis + (racialBonuses.wis ?? 0),
    cha: character.baseAbilities.cha + (racialBonuses.cha ?? 0)
  };

  const modifiers: Record<AbilityName, number> = {
    str: calculateModifier(finalAbilities.str),
    dex: calculateModifier(finalAbilities.dex),
    con: calculateModifier(finalAbilities.con),
    int: calculateModifier(finalAbilities.int),
    wis: calculateModifier(finalAbilities.wis),
    cha: calculateModifier(finalAbilities.cha)
  };

  const proficiencyBonus = calculateProficiencyBonus(character.level);
  const isHillDwarf = character.race === 'dwarf';
  const maxHp = calculateMaxHp(character.class, character.level, modifiers.con, isHillDwarf);

  const armorClass = calculateArmorClass({
    charClass: character.class,
    dexModifier: modifiers.dex,
    conModifier: modifiers.con,
    wisModifier: modifiers.wis,
    armor: character.equippedArmor,
    hasShield: character.hasShield
  });

  const hitDice = `${character.level}${CLASS_HIT_DICE[character.class].dieString}`;
  const passivePerception = 10 + modifiers.wis;
  const passiveInvestigation = 10 + modifiers.int;
  const initiative = modifiers.dex;
  const speed = RACE_SPEED[character.race] ?? 30;

  return {
    abilityScores: finalAbilities,
    modifiers,
    proficiencyBonus,
    maxHp,
    currentHp: maxHp,
    armorClass,
    hitDice,
    passivePerception,
    passiveInvestigation,
    initiative,
    speed,
  };
}

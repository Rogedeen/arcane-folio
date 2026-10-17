/**
 * D&D 5e Saldırı ve Hasar Hesaplama Motoru
 * Referans: SRD 5.1 sf. 74-77 ("Making an Attack", "Damage and Healing", "Two-Weapon Fighting")
 */

export interface WeaponAttackConfig {
  name: string;
  damageDice: string; // örn: "1d8", "1d6", "2d6"
  damageType: string; // örn: "Slashing", "Piercing", "Bludgeoning"
  properties?: string[]; // örn: ["Finesse", "Versatile", "Light", "Ranged"]
  range?: string; // örn: "5 ft", "20/60 ft"
  isOffHand?: boolean; // Two-Weapon Fighting ile ikincil el saldırısı mı?
  hasTwoWeaponFightingStyle?: boolean; // Fighting Style: Two-Weapon Fighting var mı?
  isTwoHandedVersatile?: boolean; // Versatile silahı iki elle mi tutuyor?
  versatileDamageDice?: string; // örn: "1d10"
}

export interface AttackDamageCalculation {
  abilityUsed: 'str' | 'dex';
  abilityMod: number;
  profBonus: number;
  attackBonus: number; // Attack Roll modifier: abilityMod + (isProficient ? profBonus : 0)
  damageBonus: number; // Damage Roll modifier: abilityMod (veya off-hand kuralına göre 0)
  damageDice: string; // 1d8 veya versatile için 1d10
  damageFormula: string; // örn: "1d8+3" veya "1d6" (off-hand ise)
}

/**
 * Bir silah için D&D 5e kurallarına uygun saldırı bonusu ve hasar formülü hesaplar.
 */
export function calculateWeaponAttack(
  config: WeaponAttackConfig,
  strMod: number,
  dexMod: number,
  profBonus: number,
  isProficient: boolean = true
): AttackDamageCalculation {
  const props = (config.properties || []).map((p) => p.toLowerCase());
  const isFinesse = props.some((p) => p.includes('finesse'));
  const isRanged = props.some((p) => p.includes('range')) || (config.range && !config.range.startsWith('5 ft'));

  // Stat Belirleme:
  // 1. Ranged silahlar: DEX kullanır (Darts gibi Finesse ranged hariç DEX/STR)
  // 2. Finesse silahlar: max(STR, DEX)
  // 3. Normal Melee silahlar: STR
  let abilityUsed: 'str' | 'dex' = 'str';
  let abilityMod = strMod;

  if (isFinesse) {
    if (dexMod >= strMod) {
      abilityUsed = 'dex';
      abilityMod = dexMod;
    } else {
      abilityUsed = 'str';
      abilityMod = strMod;
    }
  } else if (isRanged) {
    abilityUsed = 'dex';
    abilityMod = dexMod;
  } else {
    abilityUsed = 'str';
    abilityMod = strMod;
  }

  // Saldırı Bonusu (To Hit): Ability Mod + (Proficient ? PB : 0)
  const attackBonus = abilityMod + (isProficient ? profBonus : 0);

  // Hasar Bonusu:
  // Two-Weapon Fighting Kuralı: İkincil el saldırısı ise ve Fighting Style yoksa ability bonus eklenmez (yalnızca negatifse eklenir - D&D 5e RAW: yetenek hasara eklenmez).
  let damageBonus = abilityMod;
  if (config.isOffHand && !config.hasTwoWeaponFightingStyle) {
    damageBonus = abilityMod < 0 ? abilityMod : 0;
  }

  // Versatile hasar zarı
  let dice = config.damageDice;
  if (config.isTwoHandedVersatile && config.versatileDamageDice) {
    dice = config.versatileDamageDice;
  }

  const sign = damageBonus > 0 ? `+${damageBonus}` : damageBonus < 0 ? `${damageBonus}` : '';
  const damageFormula = `${dice}${sign}`;

  return {
    abilityUsed,
    abilityMod,
    profBonus: isProficient ? profBonus : 0,
    attackBonus,
    damageBonus,
    damageDice: dice,
    damageFormula
  };
}

/**
 * Büyü Saldırı Bonusu (Spell Attack Roll) ve DC Hesaplama
 * Referans: SRD 5.1 sf. 53
 */
export function calculateSpellAttackAndDC(
  castingModifier: number,
  profBonus: number
): { spellAttackBonus: number; spellSaveDC: number } {
  return {
    spellAttackBonus: castingModifier + profBonus,
    spellSaveDC: 8 + castingModifier + profBonus
  };
}

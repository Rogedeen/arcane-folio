/**
 * D&D 5e Ustalık Bonusu (Proficiency Bonus) Hesaplayıcı
 * Referans: SRD 5.1 sf. 15 "Proficiency Bonus"
 * Seviye 1-4: +2, 5-8: +3, 9-12: +4, 13-16: +5, 17-20: +6
 * Formül: floor((level - 1) / 4) + 2
 */
export function calculateProficiencyBonus(level: number): number {
  if (level < 1) {
    return 2;
  }
  const bonus = Math.floor((level - 1) / 4) + 2;
  return Math.min(Math.max(bonus, 2), 6);
}

export type ArmorProficiencyCategory = 'light' | 'medium' | 'heavy' | 'shield';
export type WeaponProficiencyCategory = 'simple' | 'martial' | string;

export interface ClassProficiencyRules {
  armor: ArmorProficiencyCategory[];
  weapons: {
    simple: boolean;
    martial: boolean;
    specific?: string[]; // örn: ['longsword', 'rapier', 'shortsword', 'hand crossbow']
  };
}

export const CLASS_PROFICIENCY_MAP: Record<string, ClassProficiencyRules> = {
  barbarian: {
    armor: ['light', 'medium', 'shield'],
    weapons: { simple: true, martial: true }
  },
  bard: {
    armor: ['light'],
    weapons: { simple: true, martial: false, specific: ['longsword', 'rapier', 'shortsword', 'hand crossbow'] }
  },
  cleric: {
    armor: ['light', 'medium', 'shield'],
    weapons: { simple: true, martial: false }
  },
  druid: {
    armor: ['light', 'medium', 'shield'],
    weapons: {
      simple: false,
      martial: false,
      specific: ['club', 'dagger', 'dart', 'javelin', 'mace', 'quarterstaff', 'scimitar', 'sickle', 'sling', 'spear']
    }
  },
  fighter: {
    armor: ['light', 'medium', 'heavy', 'shield'],
    weapons: { simple: true, martial: true }
  },
  monk: {
    armor: [],
    weapons: { simple: true, martial: false, specific: ['shortsword'] }
  },
  paladin: {
    armor: ['light', 'medium', 'heavy', 'shield'],
    weapons: { simple: true, martial: true }
  },
  ranger: {
    armor: ['light', 'medium', 'shield'],
    weapons: { simple: true, martial: true }
  },
  rogue: {
    armor: ['light'],
    weapons: { simple: true, martial: false, specific: ['hand crossbow', 'longsword', 'rapier', 'shortsword'] }
  },
  sorcerer: {
    armor: [],
    weapons: { simple: false, martial: false, specific: ['dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'] }
  },
  warlock: {
    armor: ['light'],
    weapons: { simple: true, martial: false }
  },
  wizard: {
    armor: [],
    weapons: { simple: false, martial: false, specific: ['dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'] }
  }
};

/**
 * Karakterin verilen zırh veya kalkanı yetkin olarak giyip giyemeyeceğini belirler.
 * D&D 5e SRD 5.1 sf. 62: Yetkin olunmayan zırh giyildiğinde büyü kesinlikle yapılamaz,
 * STR ve DEX kontrollerinde, saldırılarda ve kurtarma zarlarında dezavantaj oluşur.
 */
export function checkArmorProficiency(
  charClass: string,
  armorType: string,
  armorName: string
): { isProficient: boolean; reasonTr: string; reasonEn: string } {
  const c = charClass.toLowerCase();
  const rules = CLASS_PROFICIENCY_MAP[c];
  if (!rules) return { isProficient: true, reasonTr: '', reasonEn: '' };

  const normType = armorType.toLowerCase();
  const normName = armorName.toLowerCase();

  let targetCategory: ArmorProficiencyCategory | null = null;
  if (normType.includes('shield') || normName.includes('shield') || normName.includes('kalkan')) {
    targetCategory = 'shield';
  } else if (
    normType.includes('heavy') ||
    normType.includes('ağır') ||
    normName.includes('plate') ||
    normName.includes('chain mail') ||
    normName.includes('splint') ||
    normName.includes('ring mail') ||
    normName.includes('zincir') ||
    normName.includes('plaka') ||
    normName.includes('şerit zırh') ||
    normName.includes('halka zırh')
  ) {
    targetCategory = 'heavy';
  } else if (
    normType.includes('medium') ||
    normType.includes('orta') ||
    normName.includes('hide') ||
    normName.includes('scale') ||
    normName.includes('breastplate') ||
    normName.includes('half plate') ||
    normName.includes('pullu') ||
    normName.includes('kösele') ||
    normName.includes('göğüslük') ||
    normName.includes('yarım plaka')
  ) {
    targetCategory = 'medium';
  } else if (
    normType.includes('light') ||
    normType.includes('hafif') ||
    normName.includes('leather') ||
    normName.includes('padded') ||
    normName.includes('deri') ||
    normName.includes('dolgulu')
  ) {
    targetCategory = 'light';
  }

  if (!targetCategory) {
    return { isProficient: true, reasonTr: '', reasonEn: '' };
  }

  const isProficient = rules.armor.includes(targetCategory);
  if (!isProficient) {
    const categoryTr = targetCategory === 'shield' ? 'Kalkan' : targetCategory === 'heavy' ? 'Ağır Zırh' : targetCategory === 'medium' ? 'Orta Zırh' : 'Hafif Zırh';
    const categoryEn = targetCategory === 'shield' ? 'Shield' : `${targetCategory} armor`;
    return {
      isProficient: false,
      reasonTr: `${charClass.toUpperCase()} sınıfı ${categoryTr} yetkinliğine sahip değildir. Kuşanırsanız BÜYÜ YAPAMAZ ve STR/DEX zarlarında dezavantaj alırsınız.`,
      reasonEn: `${charClass.toUpperCase()} is not proficient with ${categoryEn}. Wearing it prevents spellcasting and imposes disadvantage on STR/DEX checks and saves.`
    };
  }

  return { isProficient: true, reasonTr: '', reasonEn: '' };
}

/**
 * Karakterin verilen silahı yetkin olarak kullanıp kullanamayacağını kontrol eder.
 */
export function checkWeaponProficiency(
  charClass: string,
  weaponNameOrSlug: string,
  isMartial: boolean = false
): { isProficient: boolean; reasonTr: string; reasonEn: string } {
  const c = charClass.toLowerCase();
  const rules = CLASS_PROFICIENCY_MAP[c];
  if (!rules) return { isProficient: true, reasonTr: '', reasonEn: '' };

  const norm = weaponNameOrSlug.toLowerCase().replace(/[-_]/g, ' ');

  // Sınıf martial silahlara yetkinse ve silah martial ise
  if (rules.weapons.martial) return { isProficient: true, reasonTr: '', reasonEn: '' };

  // Sınıf simple silahlara yetkinse ve silah simple ise
  if (rules.weapons.simple && !isMartial) return { isProficient: true, reasonTr: '', reasonEn: '' };

  // Özel yetkinlik listesinde var mı?
  if (rules.weapons.specific && rules.weapons.specific.some((spec) => norm.includes(spec))) {
    return { isProficient: true, reasonTr: '', reasonEn: '' };
  }

  return {
    isProficient: false,
    reasonTr: `${charClass.toUpperCase()} sınıfı "${weaponNameOrSlug}" için silah ustalığına sahip değildir. Saldırı zarlarınıza Ustalık Bonusu (+PB) eklenemez.`,
    reasonEn: `${charClass.toUpperCase()} lacks proficiency with "${weaponNameOrSlug}". Proficiency Bonus (+PB) will not be added to attack rolls.`
  };
}


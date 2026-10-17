/**
 * SRD 5.1 Standart Beceriler (Skills) ve Pasif Skorlar
 */

export interface SkillDefinition {
  id: string;
  name: string;
  nameTr: string;
  ability: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  description: string;
}

export const SKILLS: SkillDefinition[] = [
  // STR
  { id: 'athletics', name: 'Athletics', nameTr: 'Atletizm', ability: 'str', description: 'Tırmanma, zıplama ve yüzme gibi fiziksel güç zorlukları.' },
  // DEX
  { id: 'acrobatics', name: 'Acrobatics', nameTr: 'Akrobasi', ability: 'dex', description: 'Denge sağlama, takla atma ve kıvrak hareketler.' },
  { id: 'sleight_of_hand', name: 'Sleight of Hand', nameTr: 'El Çabukluğu', ability: 'dex', description: 'Hırsızlık, gizleme ve el çabukluğu numaraları.' },
  { id: 'stealth', name: 'Stealth', nameTr: 'Gizlilik', ability: 'dex', description: 'Ses çıkarmadan ilerleme ve gölgelerde saklanma.' },
  // INT
  { id: 'arcana', name: 'Arcana', nameTr: 'Büyü Bilgisi', ability: 'int', description: 'Büyüsel gelenekler, büyülü eşyalar ve düzlemler.' },
  { id: 'history', name: 'History', nameTr: 'Tarih', ability: 'int', description: 'Tarihi olaylar, efsaneler, kadim krallıklar.' },
  { id: 'investigation', name: 'Investigation', nameTr: 'İnceleme', ability: 'int', description: 'İpuçlarını birleştirme, gizli bölmeleri ve detayları bulma.' },
  { id: 'nature', name: 'Nature', nameTr: 'Doğa', ability: 'int', description: 'Bitkiler, hayvanlar, hava durumu ve doğal araziler.' },
  { id: 'religion', name: 'Religion', nameTr: 'Din', ability: 'int', description: 'Tanrılar, dini ritüeller, tapınaklar ve semboller.' },
  // WIS
  { id: 'animal_handling', name: 'Animal Handling', nameTr: 'Hayvan Terbiyesi', ability: 'wis', description: 'Vahşi veya evcil hayvanları sakinleştirme ve anlama.' },
  { id: 'insight', name: 'Insight', nameTr: 'Sezgi', ability: 'wis', description: 'Birinin yalan söylediğini veya gerçek niyetini anlama.' },
  { id: 'medicine', name: 'Medicine', nameTr: 'Tıp', ability: 'wis', description: 'Yaralıyı stabilize etme, hastalıkları teşhis etme.' },
  { id: 'perception', name: 'Perception', nameTr: 'Algı', ability: 'wis', description: 'Çevredeki sesleri, hareketleri ve gizlenmiş tehlikeleri fark etme.' },
  { id: 'survival', name: 'Survival', nameTr: 'Hayatta Kalma', ability: 'wis', description: 'İz sürme, yiyecek/su bulma, vahşi doğada yön bulma.' },
  // CHA
  { id: 'deception', name: 'Deception', nameTr: 'Aldatma', ability: 'cha', description: 'Yalan söyleme, kılık değiştirme ve yanıltma.' },
  { id: 'intimidation', name: 'Intimidation', nameTr: 'Gözdağı', ability: 'cha', description: 'Tehdit ve fiziksel varlıkla korkutma.' },
  { id: 'performance', name: 'Performance', nameTr: 'Performans', ability: 'cha', description: 'Müzik, dans, tiyatro ve seyirciyi eğlendirme.' },
  { id: 'persuasion', name: 'Persuasion', nameTr: 'İkna', ability: 'cha', description: 'Diplomasi, nezaket ve mantıklı argümanlarla etkileme.' }
];

/**
 * Beceri Modifikatörünü Hesaplar
 */
export function calculateSkillModifier(
  abilityModifier: number,
  isProficient: boolean,
  proficiencyBonus: number,
  expertise: boolean = false
): number {
  if (expertise) {
    return abilityModifier + proficiencyBonus * 2;
  }
  if (isProficient) {
    return abilityModifier + proficiencyBonus;
  }
  return abilityModifier;
}

/**
 * Pasif Algı Hesaplar: 10 + WIS mod (+ Ustalık)
 */
export function calculatePassivePerception(
  wisModifier: number,
  isProficient: boolean,
  proficiencyBonus: number
): number {
  return 10 + calculateSkillModifier(wisModifier, isProficient, proficiencyBonus);
}

/**
 * Pasif İnceleme Hesaplar: 10 + INT mod (+ Ustalık)
 */
export function calculatePassiveInvestigation(
  intModifier: number,
  isProficient: boolean,
  proficiencyBonus: number
): number {
  return 10 + calculateSkillModifier(intModifier, isProficient, proficiencyBonus);
}

/**
 * SRD 5.1 & PHB 2014 Alt Sınıflar (Subclasses)
 * Modüler mimari: Alt sınıf seçimi büyü yeteneklerini (Eldritch Knight, Arcane Trickster) açabilir.
 */

export interface SubclassFeature {
  level: number;
  name: string;
  description: string;
}

export interface SubclassDefinition {
  id: string;
  classId: string;
  name: string;
  nameTr: string;
  unlockLevel: number;
  isSpellcaster?: boolean;
  spellcastingAbility?: 'int' | 'wis' | 'cha';
  description: string;
  features: SubclassFeature[];
}

export const SUBCLASSES: Record<string, SubclassDefinition> = {
  // SAVAŞÇI (FIGHTER)
  champion: {
    id: 'champion',
    classId: 'fighter',
    name: 'Champion',
    nameTr: 'Şampiyon (Champion)',
    unlockLevel: 3,
    description: 'Saf fiziksel güç ve ölümcül kritik vuruş uzmanı.',
    features: [
      { level: 3, name: 'Improved Critical', description: 'Silah saldırılarınız 19 veya 20 zarında kritik vuruş yapar.' },
      { level: 7, name: 'Remarkable Athlete', description: 'Ustalığınız olmayan STR, DEX veya CON kontrollerine yarım ustalık eklersiniz.' },
      { level: 10, name: 'Additional Fighting Style', description: 'İkinci bir Dövüş Stili seçeneği kazanırsınız.' }
    ]
  },
  battleMaster: {
    id: 'battleMaster',
    classId: 'fighter',
    name: 'Battle Master',
    nameTr: 'Savaş Ustası (Battle Master)',
    unlockLevel: 3,
    description: 'Savaş meydanını taktik manevralar ve üstünlük zarları (Superiority Dice) ile kontrol eder.',
    features: [
      { level: 3, name: 'Combat Superiority', description: '4 adet d8 Üstünlük Zarı (Superiority Die) kazanırsınız. Kısa veya uzun dinlenmede yenilenir.' },
      { level: 3, name: 'Maneuvers (Manevralar)', description: 'Trip Attack (düşmanı yere serme), Riposte (ıskalayana anında karşı saldırı) ve Precision Attack manevralarını öğrenirsiniz.' },
      { level: 7, name: 'Know Your Enemy', description: '1 dakika gözlemlediğiniz düşmanın statlarını analiz edersiniz.' }
    ]
  },
  eldritchKnight: {
    id: 'eldritchKnight',
    classId: 'fighter',
    name: 'Eldritch Knight',
    nameTr: 'Uğursuz Şövalye (Eldritch Knight)',
    unlockLevel: 3,
    isSpellcaster: true,
    spellcastingAbility: 'int',
    description: 'Kılıç ustalığını kadim büyü enerjileri ve kalkan büyüleriyle birleştiren savaşçı.',
    features: [
      { level: 3, name: 'Büyücülük (Spellcasting)', description: 'Zeka tabanlı büyü yuvaları kazanır, Evocation ve Abjuration okullarından Wizard büyüleri yapabilirsiniz.' },
      { level: 3, name: 'Weapon Bond (Silah Bağı)', description: 'Silahınızla ruhani bir bağ kurarsınız. Silahınız asla elinizden düşürülemez ve 1 bonus aksiyonla elinize ışınlanır.' },
      { level: 7, name: 'War Magic', description: 'Bir cantrip yaptıktan sonra bonus eylemle tek bir silah saldırısı gerçekleştirebilirsiniz.' }
    ]
  },

  // HIRSIZ (ROGUE)
  thief: {
    id: 'thief',
    classId: 'rogue',
    name: 'Thief',
    nameTr: 'Hırsız (Thief)',
    unlockLevel: 3,
    description: 'Çeviklik, tırmanma, kilit açma ve cep hırsızlığında rakipsiz uzman.',
    features: [
      { level: 3, name: 'Fast Hands', description: 'Bonus aksiyon ile el çabukluğu, kilit açma veya eşya kullanma aksiyonu alabilirsiniz.' },
      { level: 3, name: 'Second-Story Work', description: 'Tırmanma ekstra hareket maliyeti istemez ve koşarak atlama mesafeniz artar.' }
    ]
  },
  assassin: {
    id: 'assassin',
    classId: 'rogue',
    name: 'Assassin',
    nameTr: 'Suikastçı (Assassin)',
    unlockLevel: 3,
    description: 'Gizlenerek tek vuruşta ölümcül sürpriz darbeler indiren gölge avcısı.',
    features: [
      { level: 3, name: 'Assassinate', description: 'Henüz turunu oynamamış düşmanlara saldırırken avantajınız olur. Gafil avlanan (surprised) her vuruş otomatik KRİTİK olur!' },
      { level: 3, name: 'Bonus Proficiencies', description: 'Kılık değiştirme kiti ve zehir kiti ustalığı kazanırsınız.' }
    ]
  },
  arcaneTrickster: {
    id: 'arcaneTrickster',
    classId: 'rogue',
    name: 'Arcane Trickster',
    nameTr: 'Büyübaz Düzenbaz (Arcane Trickster)',
    unlockLevel: 3,
    isSpellcaster: true,
    spellcastingAbility: 'int',
    description: 'İllüzyon ve büyü marifetleriyle kilitleri uzaktan açan ve düşmanları şaşırtan düzenbaz.',
    features: [
      { level: 3, name: 'Büyücülük (Spellcasting)', description: 'Zeka tabanlı büyü yuvaları kazanır, İllüzyon ve Büyüleme (Enchantment) büyüleri yapabilirsiniz.' },
      { level: 3, name: 'Mage Hand Legerdemain', description: 'Görünmez Mage Hand elinizle 30 ft uzaktan cep hırsızlığı yapabilir ve tuzakları uzaktan çözebilirsiniz.' }
    ]
  },

  // BÜYÜCÜ (WIZARD)
  evocation: {
    id: 'evocation',
    classId: 'wizard',
    name: 'School of Evocation',
    nameTr: 'Yıkım Okulu (Evocation)',
    unlockLevel: 2,
    isSpellcaster: true,
    spellcastingAbility: 'int',
    description: 'Yıkıcı elementel enerjileri manipüle etmede usta ilimci.',
    features: [
      { level: 2, name: 'Evocation Savant', description: 'Evocation büyülerini kopyalamak için gereken altın ve süre yarıya iner.' },
      { level: 2, name: 'Sculpt Spells', description: 'Alan etkili yıkıcı büyülerin dostlarınızı vurmasını engelleyen koruyucu cepler açarsınız.' },
      { level: 6, name: 'Potent Cantrip', description: 'Kurtarma zarı başarılı olsa bile cantripleriniz hedefi yarım hasar ile vurur.' }
    ]
  },
  abjuration: {
    id: 'abjuration',
    classId: 'wizard',
    name: 'School of Abjuration',
    nameTr: 'Koruma Okulu (Abjuration)',
    unlockLevel: 2,
    isSpellcaster: true,
    spellcastingAbility: 'int',
    description: 'Zırhlar, kalkanlar ve büyü bozucularla müttefiklerini her tehlikeden koruyan bilge.',
    features: [
      { level: 2, name: 'Arcane Ward', description: 'Her abjuration büyüsü yaptığınızda büyü seviyenizin 2 katı + INT kadar hasar soğuran sihirli bir kalkan kazanırsınız.' },
      { level: 6, name: 'Projected Ward', description: 'Arcane Ward kalkanınızı 30 ft yakındaki bir dostunuzu korumak için reaksiyon olarak fırlatırsınız.' }
    ]
  },

  // BARBAR (BARBARIAN)
  berserker: {
    id: 'berserker',
    classId: 'barbarian',
    name: 'Berserker',
    nameTr: 'Çılgın Savaşçı (Berserker)',
    unlockLevel: 3,
    description: 'Öfkesini kontrolsüz bir şiddete dönüştüren vahşi savaşçı.',
    features: [
      { level: 3, name: 'Frenzy', description: 'Öfkelendiğinizde her tur bonus aksiyon ile fazladan yakın dövüş saldırısı yapabilirsiniz.' },
      { level: 6, name: 'Mindless Rage', description: 'Öfkeliyken büyülenemez ve korkutulamazsınız.' }
    ]
  },
  totemWarrior: {
    id: 'totemWarrior',
    classId: 'barbarian',
    name: 'Path of the Totem Warrior',
    nameTr: 'Totem Savaşçısı (Totem Warrior)',
    unlockLevel: 3,
    description: 'Ayı, kartal veya kurt ruhlarıyla bağ kurarak doğaüstü dayanıklılık kazanan savaşçı.',
    features: [
      { level: 3, name: 'Spirit Seeker', description: 'Beast Sense ve Speak with Animals büyülerini ritüel olarak yapabilirsiniz.' },
      { level: 3, name: 'Totem Spirit (Ayı Ruhu)', description: 'Öfkeliyken Psişik hasar hariç dünyadaki TÜM hasar türlerine karşı direnç kazanırsınız.' }
    ]
  },

  // RAHİP (CLERIC)
  life: {
    id: 'life',
    classId: 'cleric',
    name: 'Life Domain',
    nameTr: 'Yaşam Alanı (Life Domain)',
    unlockLevel: 1,
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    description: 'Pozitif enerjinin koruyucusu ve üstün iyileştirici.',
    features: [
      { level: 1, name: 'Disciple of Life', description: 'Kullandığınız iyileştirme büyüleri hedefe fazladan 2 + büyü seviyesi kadar can verir.' },
      { level: 2, name: 'Preserve Life', description: 'Kanalize ilahi güç ile yaralı müttefiklerinizi yarı cana kadar anında iyileştirirsiniz.' }
    ]
  },
  warDomain: {
    id: 'warDomain',
    classId: 'cleric',
    name: 'War Domain',
    nameTr: 'Savaş Alanı (War Domain)',
    unlockLevel: 1,
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    description: 'Tanrısının kutsal gazabını savaş çekiçleri ve zırhlarla indiren ruhani şövalye.',
    features: [
      { level: 1, name: 'War Priest', description: 'Saldırı eylemi yaptığınızda bonus aksiyon ile fazladan bir yakın dövüş saldırısı yapabilirsiniz.' },
      { level: 2, name: 'Guided Strike', description: 'Kanalize güç harcayarak bir saldırı zarına +10 ilahi isabet bonusu eklersiniz.' }
    ]
  },

  // PALADİN (PALADIN)
  devotion: {
    id: 'devotion',
    classId: 'paladin',
    name: 'Oath of Devotion',
    nameTr: 'Bağlılık Yemini (Devotion)',
    unlockLevel: 3,
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    description: 'Adalet, erdem ve şövalyelik andı içmiş kutsal savaşçı.',
    features: [
      { level: 3, name: 'Sacred Weapon', description: 'Kanalize güç ile silahınıza Karizma modifikatörünüz kadar saldırı bonusu ve ışık eklersiniz.' }
    ]
  },
  vengeance: {
    id: 'vengeance',
    classId: 'paladin',
    name: 'Oath of Vengeance',
    nameTr: 'İntikam Yemini (Vengeance)',
    unlockLevel: 3,
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    description: 'Kötülük yapanları acımasızca avlayıp adaleti kılıcıyla getiren intikamcı.',
    features: [
      { level: 3, name: 'Vow of Enmity', description: 'Bonus aksiyonla seçtiğiniz bir hedefe karşı 1 dakika boyunca tüm saldırı zarlarınızda AVANTAJ elde edersiniz.' },
      { level: 7, name: 'Relentless Avenger', description: 'Fırsat saldırısı ile vurduğunuzda hızınızın yarısı kadar peşinden koşabilirsiniz.' }
    ]
  },

  // OZAN (BARD)
  lore: {
    id: 'lore',
    classId: 'bard',
    name: 'College of Lore',
    nameTr: 'Bilgi Koleji (College of Lore)',
    unlockLevel: 3,
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    description: 'Kadim sırları ve her alandan bilgiyi toplayan araştırmacı ozan.',
    features: [
      { level: 3, name: 'Cutting Words', description: 'Ozan ilhamınızı düşmanın saldırı veya hasar zarını düşürmek için reaksiyon olarak harcarsınız.' },
      { level: 6, name: 'Additional Magical Secrets', description: 'Herhangi bir sınıftan istediğiniz 2 büyüyü öğrenirsiniz.' }
    ]
  },

  // DRUİD (DRUID)
  land: {
    id: 'land',
    classId: 'druid',
    name: 'Circle of the Land',
    nameTr: 'Toprak Çemberi (Land)',
    unlockLevel: 2,
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    description: 'Doğanın ve kadim elementlerin büyülerini koruyan bilge druid.',
    features: [
      { level: 2, name: 'Natural Recovery', description: 'Kısa dinlenme sırasında büyü seviyesi toplamı druid seviyenizin yarısı kadar slot geri kazanırsınız.' }
    ]
  },
  moon: {
    id: 'moon',
    classId: 'druid',
    name: 'Circle of the Moon',
    nameTr: 'Ay Çemberi (Circle of the Moon)',
    unlockLevel: 2,
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    description: 'Devasa vahşi hayvan formlarına (Wild Shape) bürünerek ön saflarda savaşan druid.',
    features: [
      { level: 2, name: 'Combat Wild Shape', description: 'Wild Shape formuna bonus aksiyon olarak geçebilir ve can yenilemek için büyü slotu yakabilirsiniz.' },
      { level: 2, name: 'Circle Forms', description: 'CR 1 olan tehlikeli yırtıcı hayvanlara (Kahverengi Ayı vb.) dönüşebilirsiniz.' }
    ]
  },

  // KEŞİŞ (MONK)
  openHand: {
    id: 'openHand',
    classId: 'monk',
    name: 'Way of the Open Hand',
    nameTr: 'Açık El Yolu (Open Hand)',
    unlockLevel: 3,
    description: 'Bedenini ve Ki enerjisini kusursuz silaha çeviren keşiş.',
    features: [
      { level: 3, name: 'Open Hand Technique', description: 'Flurry of Blows ile vurduğunuz rakibi yere serer, 15 ft iter veya reaksiyon almasını engellersiniz.' }
    ]
  },

  // SORCERER
  draconic: {
    id: 'draconic',
    classId: 'sorcerer',
    name: 'Draconic Bloodline',
    nameTr: 'Ejderha Soyu (Draconic)',
    unlockLevel: 1,
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    description: 'Damarlarında kadim ejderhaların büyüsü ve pulları dolaşan büyücü.',
    features: [
      { level: 1, name: 'Dragon Ancestor & Resilience', description: 'Her seviyede +1 maksimum HP ve zırhsızken AC = 13 + DEX kazanırsınız.' }
    ]
  },

  // WARLOCK
  fiend: {
    id: 'fiend',
    classId: 'warlock',
    name: 'The Fiend',
    nameTr: 'İblis Paktı (The Fiend)',
    unlockLevel: 1,
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    description: 'Alt cehennemlerin karanlık efendileriyle anlaşma yapmış büyücü.',
    features: [
      { level: 1, name: "Dark One's Blessing", description: 'Bir düşmanı 0 HP\'ye düşürdüğünüzde Karizma Mod + Warlock Seviyesi kadar geçici can (Temp HP) kazanırsınız.' }
    ]
  },

  // KORUCU (RANGER)
  hunter: {
    id: 'hunter',
    classId: 'ranger',
    name: 'Hunter',
    nameTr: 'Avcı (Hunter)',
    unlockLevel: 3,
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    description: 'Devleri, sürüleri ve canavarları avlamada uzmanlaşmış iz sürücü.',
    features: [
      { level: 3, name: "Hunter's Prey", description: 'Colossus Slayer ile zaten yaralı hedefe her tur 1d8 ekstra hasar verirsiniz.' }
    ]
  }
};

/** Sınıfa ait tüm alt sınıfları döner */
export function getSubclassesForClass(classId: string): SubclassDefinition[] {
  return Object.values(SUBCLASSES).filter(
    (s) => s.classId.toLowerCase() === classId.toLowerCase()
  );
}

/** İlk eşleşen alt sınıfı döner (geriye dönük uyumluluk) */
export function getSubclassForClass(classId: string): SubclassDefinition | undefined {
  return Object.values(SUBCLASSES).find((s) => s.classId.toLowerCase() === classId.toLowerCase());
}

/** Alt sınıfın kilit açılma seviyesini döner (Cleric/Sorcerer/Warlock için 1, Druid/Wizard için 2, diğerleri 3) */
export function getSubclassUnlockLevel(classId: string): number {
  const list = getSubclassesForClass(classId);
  return list.length > 0 ? list[0].unlockLevel : 3;
}

/** Bir alt sınıfın veya alt sınıf adının büyücülük açıp açmadığını kontrol eder */
export function isCasterSubclass(subclassIdOrName?: string): boolean {
  if (!subclassIdOrName) return false;
  const lower = subclassIdOrName.toLowerCase();
  if (lower.includes('eldritch knight') || lower.includes('arcane trickster')) {
    return true;
  }
  const match = Object.values(SUBCLASSES).find(
    (s) => s.id.toLowerCase() === lower || s.name.toLowerCase() === lower || s.nameTr.toLowerCase() === lower
  );
  return !!match?.isSpellcaster;
}

/**
 * SRD 5.1 Alt Sınıflar (Subclasses)
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
  description: string;
  features: SubclassFeature[];
}

export const SUBCLASSES: Record<string, SubclassDefinition> = {
  champion: {
    id: 'champion',
    classId: 'fighter',
    name: 'Champion',
    nameTr: 'Şampiyon',
    unlockLevel: 3,
    description: 'Saf fiziksel güç ve ölümcül kritik vuruş uzmanı.',
    features: [
      { level: 3, name: 'Improved Critical', description: 'Silah saldırılarınız 19 veya 20 zarında kritik vuruş yapar.' },
      { level: 7, name: 'Remarkable Athlete', description: 'Ustalığınız olmayan STR, DEX veya CON kontrollerine yarım ustalık eklersiniz.' },
      { level: 10, name: 'Additional Fighting Style', description: 'İkinci bir Dövüş Stili seçeneği kazanırsınız.' }
    ]
  },
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
  evocation: {
    id: 'evocation',
    classId: 'wizard',
    name: 'School of Evocation',
    nameTr: 'Yıkım Okulu (Evocation)',
    unlockLevel: 2,
    description: 'Yıkıcı elementel enerjileri manipüle etmede usta ilimci.',
    features: [
      { level: 2, name: 'Evocation Savant', description: 'Evocation büyülerini kopyalamak için gereken altın ve süre yarıya iner.' },
      { level: 2, name: 'Sculpt Spells', description: 'Alan etkili yıkıcı büyülerin dostlarınızı vurmasını engelleyen koruyucu cepler açarsınız.' },
      { level: 6, name: 'Potent Cantrip', description: 'Kurtarma zarı başarılı olsa bile cantripleriniz hedefi yarım hasar ile vurur.' }
    ]
  },
  thief: {
    id: 'thief',
    classId: 'rogue',
    name: 'Thief',
    nameTr: 'Hırsız',
    unlockLevel: 3,
    description: 'Çeviklik, tırmanma, kilit açma ve cep hırsızlığında rakipsiz uzman.',
    features: [
      { level: 3, name: 'Fast Hands', description: 'Bonus aksiyon ile el çabukluğu, kilit açma veya eşya kullanma aksiyonu alabilirsiniz.' },
      { level: 3, name: 'Second-Story Work', description: 'Tırmanma ekstra hareket maliyeti istemez ve koşarak atlama mesafeniz artar.' }
    ]
  },
  life: {
    id: 'life',
    classId: 'cleric',
    name: 'Life Domain',
    nameTr: 'Yaşam Alanı (Life Domain)',
    unlockLevel: 1,
    description: 'Pozitif enerjinin koruyucusu ve üstün iyileştirici.',
    features: [
      { level: 1, name: 'Disciple of Life', description: 'Kullandığınız iyileştirme büyüleri hedefe fazladan 2 + büyü seviyesi kadar can verir.' },
      { level: 2, name: 'Preserve Life', description: 'Kanalize ilahi güç ile yaralı müttefiklerinizi yarı cana kadar anında iyileştirirsiniz.' }
    ]
  },
  hunter: {
    id: 'hunter',
    classId: 'ranger',
    name: 'Hunter',
    nameTr: 'Avcı',
    unlockLevel: 3,
    description: 'Devleri, sürüleri ve canavarları avlamada uzmanlaşmış iz sürücü.',
    features: [
      { level: 3, name: "Hunter's Prey", description: 'Colossus Slayer ile zaten yaralı hedefe her tur 1d8 ekstra hasar verirsiniz.' }
    ]
  },
  devotion: {
    id: 'devotion',
    classId: 'paladin',
    name: 'Oath of Devotion',
    nameTr: 'Bağlılık Yemini',
    unlockLevel: 3,
    description: 'Adalet, erdem ve şövalyelik andı içmiş kutsal savaşçı.',
    features: [
      { level: 3, name: 'Sacred Weapon', description: 'Kanalize güç ile silahınıza Karizma modifikatörünüz kadar saldırı bonusu ve ışık eklersiniz.' }
    ]
  },
  lore: {
    id: 'lore',
    classId: 'bard',
    name: 'College of Lore',
    nameTr: 'Bilgi Koleji (Lore)',
    unlockLevel: 3,
    description: 'Kadim sırları ve her alandan bilgiyi toplayan araştırmacı ozan.',
    features: [
      { level: 3, name: 'Cutting Words', description: 'Ozan ilhamınızı düşmanın saldırı veya hasar zarını düşürmek için reaksiyon olarak harcarsınız.' }
    ]
  },
  land: {
    id: 'land',
    classId: 'druid',
    name: 'Circle of the Land',
    nameTr: 'Toprak Çemberi',
    unlockLevel: 2,
    description: 'Doğanın ve kadim elementlerin büyülerini koruyan bilge druid.',
    features: [
      { level: 2, name: 'Natural Recovery', description: 'Kısa dinlenme sırasında büyü seviyesi toplamı druid seviyenizin yarısı kadar slot geri kazanırsınız.' }
    ]
  },
  openHand: {
    id: 'openHand',
    classId: 'monk',
    name: 'Way of the Open Hand',
    nameTr: 'Açık El Yolu',
    unlockLevel: 3,
    description: 'Bedenini ve Ki enerjisini kusursuz silaha çeviren keşiş.',
    features: [
      { level: 3, name: 'Open Hand Technique', description: 'Flurry of Blows ile vurduğunuz rakibi yere serer, 15 ft iter veya reaksiyon almasını engellersiniz.' }
    ]
  },
  draconic: {
    id: 'draconic',
    classId: 'sorcerer',
    name: 'Draconic Bloodline',
    nameTr: 'Ejderha Soyu',
    unlockLevel: 1,
    description: 'Damarlarında kadim ejderhaların büyüsü ve pulları dolaşan büyücü.',
    features: [
      { level: 1, name: 'Dragon Ancestor & Resilience', description: 'Her seviyede +1 maksimum HP ve zırhsızken AC = 13 + DEX kazanırsınız.' }
    ]
  },
  fiend: {
    id: 'fiend',
    classId: 'warlock',
    name: 'The Fiend',
    nameTr: 'İblis Paktı',
    unlockLevel: 1,
    description: 'Alt cehennemlerin karanlık efendileriyle anlaşma yapmış büyücü.',
    features: [
      { level: 1, name: "Dark One's Blessing", description: 'Bir düşmanı 0 HP\'ye düşürdüğünüzde Karizma Mod + Warlock Seviyesi kadar geçici can (Temp HP) kazanırsınız.' }
    ]
  }
};

export function getSubclassForClass(classId: string): SubclassDefinition | undefined {
  return Object.values(SUBCLASSES).find((s) => s.classId.toLowerCase() === classId.toLowerCase());
}

export function getSubclassUnlockLevel(classId: string): number {
  const sc = getSubclassForClass(classId);
  return sc ? sc.unlockLevel : 3;
}

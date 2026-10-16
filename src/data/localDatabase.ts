// =============================================================================
// LOCAL DATABASE SERVICE (OFFLINE-FIRST CODEX DATABASE)
// Canavarları, eşyaları ve büyüleri yerel veritabanında saklar ve indeksler.
// API'den çekilen tüm veriler kalıcı olarak veritabanına eklenir.
// =============================================================================

import type { CreatureData } from './open5eClient';
import type { ItemData } from '../types/content';
import { open5eClient } from './open5eClient';
import { INITIAL_ITEMS } from './sampleContent';

const DB_KEYS = {
  MONSTERS: 'af5e_db_monsters_v1',
  ITEMS: 'af5e_db_items_v1',
  SPELLS: 'af5e_db_spells_v1',
  LAST_SYNC: 'af5e_db_last_sync',
} as const;

// -----------------------------------------------------------------------------
// STANDART SRD 5.1 CANAVAR VERİTABANI (TAM STATBLOK VE AKSİYONLARLA)
// -----------------------------------------------------------------------------
export const PRELOADED_MONSTERS: CreatureData[] = [
  {
    slug: 'bandit',
    name: 'Bandit (Haydut)',
    type: 'humanoid (any race)',
    size: 'Medium',
    alignment: 'any non-lawful alignment',
    challengeRating: '1/8',
    armorClass: 12,
    hitPoints: 11,
    speed: '30 ft.',
    str: 11,
    dex: 12,
    con: 12,
    int: 10,
    wis: 10,
    cha: 10,
    senses: 'Passive Perception 10',
    languages: 'any one language (usually Common)',
    description: 'Yollarda pusu kuran, ganimet arayan acımasız haydut.',
    source: 'SRD 5.1',
    actions: [
      {
        name: 'Scimitar (Pala)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +3, erişim 5 ft., bir hedef. İsabet: 4 (1d6 + 1) kesici hasar.',
        attack_bonus: 3,
        damage_dice: '1d6+1',
      },
      {
        name: 'Light Crossbow (Hafif Arbalet)',
        desc: 'Menzilli Silah Saldırısı: İsabet +3, menzil 80/320 ft., bir hedef. İsabet: 5 (1d8 + 1) delici hasar.',
        attack_bonus: 3,
        damage_dice: '1d8+1',
      },
    ],
  },
  {
    slug: 'bandit-captain',
    name: 'Bandit Captain (Haydut Başı)',
    type: 'humanoid (any race)',
    size: 'Medium',
    alignment: 'any non-lawful alignment',
    challengeRating: '2',
    armorClass: 15,
    hitPoints: 65,
    speed: '30 ft.',
    str: 15,
    dex: 16,
    con: 14,
    int: 14,
    wis: 11,
    cha: 14,
    senses: 'Passive Perception 10',
    languages: 'any two languages',
    description: 'Bir haydut çetesine liderlik eden deneyimli ve kurnaz savaşçı.',
    source: 'SRD 5.1',
    actions: [
      {
        name: 'Multiattack (Çoklu Saldırı)',
        desc: 'Haydut Kaptanı üç yakın dövüş saldırısı yapar: ikisi pala (scimitar) ve biri hançer (dagger) ile. Veya iki menzilli hançer saldırısı yapar.',
      },
      {
        name: 'Scimitar (Pala)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +5, erişim 5 ft., bir hedef. İsabet: 6 (1d6 + 3) kesici hasar.',
        attack_bonus: 5,
        damage_dice: '1d6+3',
      },
      {
        name: 'Dagger (Hançer)',
        desc: 'Yakın Dövüş veya Menzilli Silah Saldırısı: İsabet +5, erişim 5 ft. veya menzil 20/60 ft., bir hedef. İsabet: 5 (1d4 + 3) delici hasar.',
        attack_bonus: 5,
        damage_dice: '1d4+3',
      },
    ],
    reactions: [
      {
        name: 'Parry (Savuşturma)',
        desc: 'Kaptan, görebildiği bir düşmanın yakın dövüş saldırısına karşı reaksiyon harcayarak Zırh Sınıfına +2 ekler.',
      },
    ],
  },
  {
    slug: 'basilisk',
    name: 'Basilisk (Taşlaştıran Kertenkele)',
    type: 'monstrosity',
    size: 'Medium',
    alignment: 'unaligned',
    challengeRating: '3',
    armorClass: 15,
    hitPoints: 52,
    speed: '20 ft.',
    str: 16,
    dex: 8,
    con: 15,
    int: 2,
    wis: 8,
    cha: 7,
    senses: 'Darkvision 60 ft., Passive Perception 9',
    languages: '—',
    description: 'Gözlerinin içine bakan canlıları taşa çevirebilen sekiz bacaklı korkunç sürüngen.',
    source: 'SRD 5.1',
    specialAbilities: [
      {
        name: 'Petrifying Gaze (Taşlaştıran Bakış)',
        desc: 'Basilisk ile 30 fit mesafede turlayan ve göz teması kuran yaratık DC 12 Constitution kurtarma zarı atmalıdır. Başarısız olursa kısıtlanır (restrained). İkinci başarısızlıkta kalıcı taşa dönüşür.',
      },
    ],
    actions: [
      {
        name: 'Bite (Isırık)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +5, erişim 5 ft., bir hedef. İsabet: 10 (2d6 + 3) delici hasar artı 7 (2d6) zehir hasarı.',
        attack_bonus: 5,
        damage_dice: '2d6+3+2d6',
      },
    ],
  },
  {
    slug: 'berserker',
    name: 'Berserker (Çılgın Savaşçı)',
    type: 'humanoid (any race)',
    size: 'Medium',
    alignment: 'any chaotic alignment',
    challengeRating: '2',
    armorClass: 13,
    hitPoints: 67,
    speed: '30 ft.',
    str: 16,
    dex: 12,
    con: 17,
    int: 9,
    wis: 11,
    cha: 9,
    senses: 'Passive Perception 10',
    languages: 'any one language (usually Common)',
    description: 'Savaş naralarıyla gözü dönmüş şekilde düşmanın üzerine atılan vahşi dövüşçü.',
    source: 'SRD 5.1',
    specialAbilities: [
      {
        name: 'Reckless (Pervasız Saldırı)',
        desc: 'Turunun başında pervasızca saldırmayı seçebilir. Kendi saldırılarına avantaj kazanır ancak sonraki turuna kadar düşmanların ona karşı saldırıları da avantajlı olur.',
      },
    ],
    actions: [
      {
        name: 'Greataxe (Büyük Balta)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +5, erişim 5 ft., bir hedef. İsabet: 9 (1d12 + 3) kesici hasar.',
        attack_bonus: 5,
        damage_dice: '1d12+3',
      },
    ],
  },
  {
    slug: 'bugbear',
    name: 'Bugbear (Hortlak Ayı)',
    type: 'humanoid (goblinoid)',
    size: 'Medium',
    alignment: 'chaotic evil',
    challengeRating: '1',
    armorClass: 16,
    hitPoints: 27,
    speed: '30 ft.',
    str: 15,
    dex: 14,
    con: 13,
    int: 8,
    wis: 11,
    cha: 9,
    senses: 'Darkvision 60 ft., Passive Perception 10',
    languages: 'Common, Goblin',
    skills: { Stealth: 6, Survival: 2 },
    description: 'Gölgelerden sinsice saldıran, uzun kollu ve kaslı goblinoid yağmacı.',
    source: 'SRD 5.1',
    specialAbilities: [
      {
        name: 'Brute (Gaddar Güç)',
        desc: 'Yakın dövüş silah saldırısı vurduğunda fazladan bir zar hasar ekler (Morningstar ile 2d8 vurur).',
      },
      {
        name: 'Surprise Attack (Baskın Saldırısı)',
        desc: 'Şaşırtılmış (surprised) bir hedefe ilk turunda vurduğunda fazladan 7 (2d6) hasar verir.',
      },
    ],
    actions: [
      {
        name: 'Morningstar (Gürz)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +4, erişim 5 ft., bir hedef. İsabet: 11 (2d8 + 2) delici hasar.',
        attack_bonus: 4,
        damage_dice: '2d8+2',
      },
      {
        name: 'Javelin (Cirit)',
        desc: 'Yakın Dövüş veya Menzilli Silah Saldırısı: İsabet +4, erişim 5 ft. veya menzil 30/120 ft., bir hedef. İsabet: 9 (2d6 + 2) delici hasar.',
        attack_bonus: 4,
        damage_dice: '2d6+2',
      },
    ],
  },
  {
    slug: 'brown-bear',
    name: 'Brown Bear (Bozayı)',
    type: 'beast',
    size: 'Large',
    alignment: 'unaligned',
    challengeRating: '1',
    armorClass: 11,
    hitPoints: 34,
    speed: '40 ft., climb 30 ft.',
    str: 19,
    dex: 10,
    con: 16,
    int: 2,
    wis: 13,
    cha: 7,
    senses: 'Passive Perception 13',
    languages: '—',
    skills: { Perception: 3 },
    description: 'Kuzey ormanlarının ve mağaralarının devasa pençeli yırtıcısı.',
    source: 'SRD 5.1',
    specialAbilities: [
      {
        name: 'Keen Smell (Keskin Koku Alma)',
        desc: 'Bozayı, kokuya dayalı Wisdom (Perception) kontrollerinde avantaja sahiptir.',
      },
    ],
    actions: [
      {
        name: 'Multiattack (Çoklu Saldırı)',
        desc: 'Bozayı iki saldırı yapar: biri ısırık (bite), diğeri pençe (claws) ile.',
      },
      {
        name: 'Bite (Isırık)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +5, erişim 5 ft., bir hedef. İsabet: 8 (1d8 + 4) delici hasar.',
        attack_bonus: 5,
        damage_dice: '1d8+4',
      },
      {
        name: 'Claws (Pençeler)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +5, erişim 5 ft., bir hedef. İsabet: 11 (2d6 + 4) kesici hasar.',
        attack_bonus: 5,
        damage_dice: '2d6+4',
      },
    ],
  },
  {
    slug: 'black-dragon-wyrmling',
    name: 'Black Dragon Wyrmling (Kara Ejderha Yavrusu)',
    type: 'dragon',
    size: 'Medium',
    alignment: 'chaotic evil',
    challengeRating: '2',
    armorClass: 17,
    hitPoints: 33,
    speed: '30 ft., fly 60 ft., swim 30 ft.',
    str: 15,
    dex: 14,
    con: 13,
    int: 10,
    wis: 11,
    cha: 13,
    senses: 'Blindsight 10 ft., Darkvision 60 ft., Passive Perception 14',
    languages: 'Draconic',
    damageImmunities: 'Acid (Asit)',
    description: 'Bataklıklarda avlanan, asit nefesi püskürten genç kara ejderha.',
    source: 'SRD 5.1',
    specialAbilities: [
      {
        name: 'Amphibious (Amfibi)',
        desc: 'Hem karada hem de suyun altında nefes alabilir.',
      },
    ],
    actions: [
      {
        name: 'Bite (Isırık)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +4, erişim 5 ft., bir hedef. İsabet: 7 (1d10 + 2) delici hasar artı 2 (1d4) asit hasarı.',
        attack_bonus: 4,
        damage_dice: '1d10+2+1d4',
      },
      {
        name: 'Acid Breath (Asit Nefesi - Recharge 5-6)',
        desc: 'Ejderha 15 fitlik bir hat boyunca asit püskürtür. Alandaki her yaratık DC 11 Dexterity kurtarma zarı atmalıdır; başarısızlıkta 22 (5d8) asit hasarı, başarıda yarı hasar alır.',
        damage_dice: '5d8',
      },
    ],
  },
  {
    slug: 'goblin',
    name: 'Goblin',
    type: 'humanoid (goblinoid)',
    size: 'Small',
    alignment: 'neutral evil',
    challengeRating: '1/4',
    armorClass: 15,
    hitPoints: 7,
    speed: '30 ft.',
    str: 8,
    dex: 14,
    con: 10,
    int: 10,
    wis: 8,
    cha: 8,
    senses: 'Darkvision 60 ft., Passive Perception 9',
    languages: 'Common, Goblin',
    skills: { Stealth: 6 },
    description: 'Mağara ve harabelerde yaşayan küçük, kurnaz ve sinsi yaratık.',
    source: 'SRD 5.1',
    specialAbilities: [
      {
        name: 'Nimble Escape (Çevik Kaçış)',
        desc: 'Goblin her turunda bonus action olarak Ayrılma (Disengage) veya Saklanma (Hide) aksiyonu alabilir.',
      },
    ],
    actions: [
      {
        name: 'Scimitar (Pala)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +4, erişim 5 ft., bir hedef. İsabet: 5 (1d6 + 2) kesici hasar.',
        attack_bonus: 4,
        damage_dice: '1d6+2',
      },
      {
        name: 'Shortbow (Kısa Yay)',
        desc: 'Menzilli Silah Saldırısı: İsabet +4, menzil 80/320 ft., bir hedef. İsabet: 5 (1d6 + 2) delici hasar.',
        attack_bonus: 4,
        damage_dice: '1d6+2',
      },
    ],
  },
  {
    slug: 'orc',
    name: 'Orc',
    type: 'humanoid (orc)',
    size: 'Medium',
    alignment: 'chaotic evil',
    challengeRating: '1/2',
    armorClass: 13,
    hitPoints: 15,
    speed: '30 ft.',
    str: 16,
    dex: 12,
    con: 16,
    int: 7,
    wis: 11,
    cha: 10,
    senses: 'Darkvision 60 ft., Passive Perception 10',
    languages: 'Common, Orc',
    skills: { Intimidation: 2 },
    description: 'Savaş tanrılarına tapan, iri cüsseli vahşi akıncı.',
    source: 'SRD 5.1',
    specialAbilities: [
      {
        name: 'Aggressive (Saldırgan Atılım)',
        desc: 'Bonus action olarak görebildiği bir düşmana doğru tam hızına kadar hareket edebilir.',
      },
    ],
    actions: [
      {
        name: 'Greataxe (Büyük Balta)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +5, erişim 5 ft., bir hedef. İsabet: 9 (1d12 + 3) kesici hasar.',
        attack_bonus: 5,
        damage_dice: '1d12+3',
      },
      {
        name: 'Javelin (Cirit)',
        desc: 'Menzilli Silah Saldırısı: İsabet +5, menzil 30/120 ft., bir hedef. İsabet: 6 (1d6 + 3) delici hasar.',
        attack_bonus: 5,
        damage_dice: '1d6+3',
      },
    ],
  },
  {
    slug: 'skeleton',
    name: 'Skeleton (İskelet)',
    type: 'undead',
    size: 'Medium',
    alignment: 'lawful evil',
    challengeRating: '1/4',
    armorClass: 13,
    hitPoints: 13,
    speed: '30 ft.',
    str: 10,
    dex: 14,
    con: 15,
    int: 6,
    wis: 8,
    cha: 5,
    senses: 'Darkvision 60 ft., Passive Perception 9',
    languages: 'understands languages it knew in life but cannot speak',
    damageVulnerabilities: 'Bludgeoning (Ezici)',
    damageImmunities: 'Poison (Zehir)',
    conditionImmunities: 'Exhaustion, Poisoned',
    description: 'Büyüyle diriltilmiş, efendisinin emirlerine körü körüne uyan kemik yığını.',
    source: 'SRD 5.1',
    actions: [
      {
        name: 'Shortsword (Kısa Kılıç)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +4, erişim 5 ft., bir hedef. İsabet: 5 (1d6 + 2) delici hasar.',
        attack_bonus: 4,
        damage_dice: '1d6+2',
      },
      {
        name: 'Shortbow (Kısa Yay)',
        desc: 'Menzilli Silah Saldırısı: İsabet +4, menzil 80/320 ft., bir hedef. İsabet: 5 (1d6 + 2) delici hasar.',
        attack_bonus: 4,
        damage_dice: '1d6+2',
      },
    ],
  },
  {
    slug: 'ogre',
    name: 'Ogre (Dev Yamyam)',
    type: 'giant',
    size: 'Large',
    alignment: 'chaotic evil',
    challengeRating: '2',
    armorClass: 11,
    hitPoints: 59,
    speed: '40 ft.',
    str: 19,
    dex: 8,
    con: 16,
    int: 5,
    wis: 7,
    cha: 7,
    senses: 'Darkvision 60 ft., Passive Perception 8',
    languages: 'Common, Giant',
    description: 'Büyük ağaç gövdelerini sopa olarak kullanan aptal ama muazzam güçlü dev.',
    source: 'SRD 5.1',
    actions: [
      {
        name: 'Greatclub (Dev Tokmak)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +6, erişim 5 ft., bir hedef. İsabet: 13 (2d8 + 4) ezici hasar.',
        attack_bonus: 6,
        damage_dice: '2d8+4',
      },
      {
        name: 'Javelin (Dev Cirit)',
        desc: 'Menzilli Silah Saldırısı: İsabet +6, menzil 30/120 ft., bir hedef. İsabet: 11 (2d6 + 4) delici hasar.',
        attack_bonus: 6,
        damage_dice: '2d6+4',
      },
    ],
  },
  {
    slug: 'young-red-dragon',
    name: 'Young Red Dragon (Genç Kırmızı Ejderha)',
    type: 'dragon',
    size: 'Large',
    alignment: 'chaotic evil',
    challengeRating: '10',
    armorClass: 18,
    hitPoints: 178,
    speed: '40 ft., climb 40 ft., fly 80 ft.',
    str: 23,
    dex: 10,
    con: 21,
    int: 14,
    wis: 11,
    cha: 19,
    senses: 'Blindsight 30 ft., Darkvision 120 ft., Passive Perception 18',
    languages: 'Common, Draconic',
    skills: { Perception: 8, Stealth: 4 },
    damageImmunities: 'Fire (Ateş)',
    description: 'Volkanik dağların zirvesinde altın istifleyen zalim ve kibirli kırmızı ejderha.',
    source: 'SRD 5.1',
    actions: [
      {
        name: 'Multiattack (Üçlü Saldırı)',
        desc: 'Ejderha üç saldırı yapar: biri ısırık (bite) ve ikisi pençe (claws) ile.',
      },
      {
        name: 'Bite (Isırık)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +10, erişim 10 ft., bir hedef. İsabet: 17 (2d10 + 6) delici hasar artı 3 (1d6) ateş hasarı.',
        attack_bonus: 10,
        damage_dice: '2d10+6+1d6',
      },
      {
        name: 'Claw (Pençe)',
        desc: 'Yakın Dövüş Silah Saldırısı: İsabet +10, erişim 5 ft., bir hedef. İsabet: 13 (2d6 + 6) kesici hasar.',
        attack_bonus: 10,
        damage_dice: '2d6+6',
      },
      {
        name: 'Fire Breath (Ateş Nefesi - Recharge 5-6)',
        desc: 'Ejderha 30 fitlik bir koni şeklinde alev püskürtür. Alandaki her yaratık DC 17 Dexterity kurtarma zarı atmalıdır; başarısızlıkta 56 (16d6) ateş hasarı, başarıda yarı hasar alır.',
        damage_dice: '16d6',
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// VERİTABANI YÖNETİCİSİ (LOCAL DATABASE CLIENT)
// -----------------------------------------------------------------------------
class LocalDatabase {
  private monstersCache: CreatureData[] | null = null;
  private itemsCache: ItemData[] | null = null;

  // Tüm canavarları yükle (Preloaded + LocalStorage + Open5e)
  getAllMonsters(): CreatureData[] {
    if (this.monstersCache) return this.monstersCache;

    try {
      const stored = localStorage.getItem(DB_KEYS.MONSTERS);
      if (stored) {
        const parsed = JSON.parse(stored) as CreatureData[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Preloaded ile merge et (slug bazında tekil)
          const map = new Map<string, CreatureData>();
          PRELOADED_MONSTERS.forEach((m) => map.set(m.slug, m));
          parsed.forEach((m) => map.set(m.slug, m));
          this.monstersCache = Array.from(map.values());
          return this.monstersCache;
        }
      }
    } catch {
      // LocalStorage hatası olursa preloaded dön
    }

    this.monstersCache = [...PRELOADED_MONSTERS];
    return this.monstersCache;
  }

  // Canavar Ara (İsme göre: örn 'b' yazınca 'b' ile başlayanlar en başta)
  searchMonsters(query: string): CreatureData[] {
    const q = query.trim().toLowerCase();
    const all = this.getAllMonsters();
    if (!q) return all;

    const startsWith: CreatureData[] = [];
    const contains: CreatureData[] = [];

    for (const m of all) {
      const nameLower = m.name.toLowerCase();
      if (nameLower.startsWith(q)) {
        startsWith.push(m);
      } else if (nameLower.includes(q) || m.type.toLowerCase().includes(q)) {
        contains.push(m);
      }
    }

    return [...startsWith, ...contains];
  }

  // Yeni canavarları veritabanına ekle / güncelle
  saveMonsters(newMonsters: CreatureData[]): void {
    const current = this.getAllMonsters();
    const map = new Map<string, CreatureData>();
    current.forEach((m) => map.set(m.slug, m));
    newMonsters.forEach((m) => map.set(m.slug, m));

    this.monstersCache = Array.from(map.values());
    try {
      localStorage.setItem(DB_KEYS.MONSTERS, JSON.stringify(this.monstersCache));
    } catch (e) {
      console.warn('[LocalDatabase] Monsters save to localStorage failed:', e);
    }
  }

  // Tüm eşyaları yükle
  getAllItems(): ItemData[] {
    if (this.itemsCache) return this.itemsCache;

    try {
      const stored = localStorage.getItem(DB_KEYS.ITEMS);
      if (stored) {
        const parsed = JSON.parse(stored) as ItemData[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, ItemData>();
          INITIAL_ITEMS.forEach((it) => map.set(it.slug, it));
          parsed.forEach((it) => map.set(it.slug, it));
          this.itemsCache = Array.from(map.values());
          return this.itemsCache;
        }
      }
    } catch {
      // ignore
    }

    this.itemsCache = [...INITIAL_ITEMS];
    return this.itemsCache;
  }

  // Eşya Ara (Anlık ve sıralı arama)
  searchItems(query: string, typeFilter?: string): ItemData[] {
    const q = query.trim().toLowerCase();
    const all = this.getAllItems();

    let filtered = all;
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter((i) => i.type === typeFilter);
    }

    if (!q) return filtered;

    const startsWith: ItemData[] = [];
    const contains: ItemData[] = [];

    for (const item of filtered) {
      const nameLower = item.name.toLowerCase();
      if (nameLower.startsWith(q)) {
        startsWith.push(item);
      } else if (nameLower.includes(q) || item.description?.toLowerCase().includes(q)) {
        contains.push(item);
      }
    }

    return [...startsWith, ...contains];
  }

  // Yeni eşyaları veritabanına ekle
  saveItems(newItems: ItemData[]): void {
    const current = this.getAllItems();
    const map = new Map<string, ItemData>();
    current.forEach((i) => map.set(i.slug, i));
    newItems.forEach((i) => map.set(i.slug, i));

    this.itemsCache = Array.from(map.values());
    try {
      localStorage.setItem(DB_KEYS.ITEMS, JSON.stringify(this.itemsCache));
    } catch (e) {
      console.warn('[LocalDatabase] Items save failed:', e);
    }
  }

  // Arka planda Open5e'den tüm canavarları ve eşyaları çekip DB'ye senkronize etme
  async syncFromOpen5e(): Promise<void> {
    try {
      // 1. Canavarları çek
      const creatureRes = await open5eClient.searchCreatures('', undefined, 50);
      if (creatureRes.data && creatureRes.data.length > 0) {
        this.saveMonsters(creatureRes.data);
      }

      // 2. Eşyaları çek
      const itemRes = await open5eClient.searchItems('a', 50);
      if (itemRes.data && itemRes.data.length > 0) {
        this.saveItems(itemRes.data);
      }

      localStorage.setItem(DB_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (err) {
      console.warn('[LocalDatabase] Background sync encountered an error:', err);
    }
  }
}

export const localDatabase = new LocalDatabase();

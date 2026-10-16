// =============================================================================
// STARTER EQUIPMENT KITS (D&D 5E SRD 5.1 COMPLIANT)
// Karakter yaratıldığında tüm oyun kataloğunu değil,
// yalnızca seçilen sınıf ve geçmişe ait başlangıç teçhizatını verir.
// =============================================================================

import type { ItemData } from '../types/content';
import type { CharacterClass, WeaponItem, ArmorItem } from '../types/character';

export interface StarterKitResult {
  inventory: ItemData[];
  weapons: WeaponItem[];
  equippedArmor?: ArmorItem;
  hasShield: boolean;
}

export function getStarterKitForClass(
  charClass: CharacterClass,
  chosenArmor?: ArmorItem,
  hasShield: boolean = false
): StarterKitResult {
  const commonPack: ItemData[] = [
    {
      slug: 'backpack',
      name: 'Sırt Çantası (Backpack)',
      type: 'gear',
      weight: 5,
      cost: '2 gp',
      description: '1 fit küp / 30 libre hacminde sağlam deri sırt çantası.',
      properties: ['container'],
      quantity: 1,
      equipped: false,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'OGL / CC-BY-4.0',
    },
    {
      slug: 'bedroll',
      name: 'Uyku Tulumu (Bedroll)',
      type: 'gear',
      weight: 7,
      cost: '1 gp',
      description: 'Yolculuklarda kamp yapmak için yün dolgulu tulum.',
      properties: [],
      quantity: 1,
      equipped: false,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'OGL / CC-BY-4.0',
    },
    {
      slug: 'rations-5',
      name: 'Yol Azığı (Rations, 5 gün)',
      type: 'gear',
      weight: 10,
      cost: '2.5 gp',
      description: 'Kurutulmuş et, peksimet ve yemişlerden oluşan 5 günlük gıda.',
      properties: [],
      quantity: 5,
      equipped: false,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'OGL / CC-BY-4.0',
    },
    {
      slug: 'waterskin',
      name: 'Matara (Waterskin)',
      type: 'gear',
      weight: 5,
      cost: '2 sp',
      description: '4 pint (yaklaşık 2 litre) temiz su alan su matarası.',
      properties: [],
      quantity: 1,
      equipped: false,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'OGL / CC-BY-4.0',
    },
    {
      slug: 'torches-3',
      name: 'Meşale (Torch x3)',
      type: 'gear',
      weight: 3,
      cost: '3 cp',
      description: '1 saat boyunca 20 fit parlak, ilave 20 fit loş ışık yayar.',
      properties: [],
      quantity: 3,
      equipped: false,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'OGL / CC-BY-4.0',
    },
    {
      slug: 'potion-of-healing',
      name: 'Potion of Healing',
      type: 'potion',
      weight: 0.5,
      cost: '50 gp',
      description: 'İçildiğinde 2d4 + 2 can puanı yenileyen kırmızı parıltılı şifa iksiri.',
      properties: ['consumable', 'magical'],
      quantity: 1,
      equipped: false,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'OGL / CC-BY-4.0',
    },
    {
      slug: 'pouch-gold',
      name: 'Para Kesesi (10 GP)',
      type: 'gear',
      weight: 1,
      cost: '10 gp',
      description: 'Maceralara başlamak için 10 altın sikke.',
      properties: [],
      quantity: 10,
      equipped: false,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'OGL / CC-BY-4.0',
    },
  ];

  const inventory: ItemData[] = [...commonPack];
  const weapons: WeaponItem[] = [];

  // Sınıfa göre başlangıç silahları ve zırhı
  switch (charClass) {
    case 'fighter':
    case 'paladin': {
      inventory.push({
        slug: 'longsword',
        name: 'Uzunkılıç (Longsword)',
        type: 'weapon',
        weight: 3,
        cost: '15 gp',
        description: '1d8 kesici hasar veren çok yönlü (versatile 1d10) şövalye kılıcı.',
        properties: ['versatile'],
        quantity: 1,
        equipped: true,
        source: 'SRD 5.1',
        source_ref: 'PHB',
        license: 'OGL / CC-BY-4.0',
      });
      weapons.push({
        id: 'w-longsword',
        name: 'Uzunkilic (Longsword)',
        damage: '1d8',
        damageType: 'slashing',
        properties: ['versatile'],
        range: '5 ft',
        abilityUsed: 'str',
      });
      if (hasShield) {
        inventory.push({
          slug: 'shield',
          name: 'Kalkan (Shield)',
          type: 'shield',
          weight: 6,
          cost: '10 gp',
          description: '+2 Zırh Sınıfı sağlayan kalkan.',
          properties: ['shield'],
          quantity: 1,
          equipped: true,
          source: 'SRD 5.1',
          source_ref: 'PHB',
          license: 'OGL / CC-BY-4.0',
        });
      }
      break;
    }

    case 'rogue': {
      inventory.push({
        slug: 'rapier',
        name: 'Meç (Rapier)',
        type: 'weapon',
        weight: 2,
        cost: '25 gp',
        description: '1d8 delici hasar veren incelikli (finesse) kılıç.',
        properties: ['finesse'],
        quantity: 1,
        equipped: true,
        source: 'SRD 5.1',
        source_ref: 'PHB',
        license: 'OGL / CC-BY-4.0',
      });
      inventory.push({
        slug: 'dagger-pair',
        name: 'Hançer (Dagger)',
        type: 'weapon',
        weight: 1,
        cost: '2 gp',
        description: '1d4 delici hasar, fırlatılabilir (range 20/60).',
        properties: ['finesse', 'light', 'thrown'],
        quantity: 2,
        equipped: true,
        source: 'SRD 5.1',
        source_ref: 'PHB',
        license: 'OGL / CC-BY-4.0',
      });
      inventory.push({
        slug: 'thieves-tools',
        name: 'Hırsız Aletleri (Thieves Tools)',
        type: 'gear',
        weight: 1,
        cost: '25 gp',
        description: 'Kilit açma ve tuzak etkisizleştirme kiti.',
        properties: [],
        quantity: 1,
        equipped: false,
        source: 'SRD 5.1',
        source_ref: 'PHB',
        license: 'OGL / CC-BY-4.0',
      });
      weapons.push(
        {
          id: 'w-rapier',
          name: 'Mec (Rapier)',
          damage: '1d8',
          damageType: 'piercing',
          properties: ['finesse'],
          range: '5 ft',
          abilityUsed: 'dex',
        },
        {
          id: 'w-dagger',
          name: 'Hancer (Dagger)',
          damage: '1d4',
          damageType: 'piercing',
          properties: ['finesse', 'thrown'],
          range: '20/60 ft',
          abilityUsed: 'dex',
        }
      );
      break;
    }

    case 'wizard':
    case 'sorcerer':
    case 'warlock': {
      inventory.push({
        slug: 'quarterstaff',
        name: 'Asa (Quarterstaff)',
        type: 'weapon',
        weight: 4,
        cost: '2 sp',
        description: '1d6 ezici hasar (versatile 1d8).',
        properties: ['versatile'],
        quantity: 1,
        equipped: true,
        source: 'SRD 5.1',
        source_ref: 'PHB',
        license: 'OGL / CC-BY-4.0',
      });
      inventory.push({
        slug: 'arcane-focus',
        name: 'Büyü Odağı (Arcane Focus Wand)',
        type: 'gear',
        weight: 1,
        cost: '10 gp',
        description: 'Maddi bileşeni olmayan büyüler için asa/kristal odak.',
        properties: ['focus'],
        quantity: 1,
        equipped: true,
        source: 'SRD 5.1',
        source_ref: 'PHB',
        license: 'OGL / CC-BY-4.0',
      });
      weapons.push({
        id: 'w-quarterstaff',
        name: 'Asa (Quarterstaff)',
        damage: '1d6',
        damageType: 'bludgeoning',
        properties: ['versatile'],
        range: '5 ft',
        abilityUsed: 'str',
      });
      break;
    }

    case 'barbarian': {
      inventory.push({
        slug: 'greataxe',
        name: 'Büyük Balta (Greataxe)',
        type: 'weapon',
        weight: 7,
        cost: '30 gp',
        description: '1d12 kesici hasar veren ağır, iki elli savaş baltası.',
        properties: ['heavy', 'two-handed'],
        quantity: 1,
        equipped: true,
        source: 'SRD 5.1',
        source_ref: 'PHB',
        license: 'OGL / CC-BY-4.0',
      });
      weapons.push({
        id: 'w-greataxe',
        name: 'Buyuk Balta (Greataxe)',
        damage: '1d12',
        damageType: 'slashing',
        properties: ['heavy', 'two-handed'],
        range: '5 ft',
        abilityUsed: 'str',
      });
      break;
    }

    default: {
      inventory.push({
        slug: 'mace',
        name: 'Gürz (Mace)',
        type: 'weapon',
        weight: 4,
        cost: '5 gp',
        description: '1d6 ezici hasar.',
        properties: [],
        quantity: 1,
        equipped: true,
        source: 'SRD 5.1',
        source_ref: 'PHB',
        license: 'OGL / CC-BY-4.0',
      });
      weapons.push({
        id: 'w-mace',
        name: 'Gurz (Mace)',
        damage: '1d6',
        damageType: 'bludgeoning',
        properties: [],
        range: '5 ft',
        abilityUsed: 'str',
      });
    }
  }

  // Zırh seçildiyse envantere ekle ve kuşan
  if (chosenArmor) {
    const armorName = chosenArmor.name ?? (chosenArmor.type === 'heavy' ? 'Ağır Zırh' : chosenArmor.type === 'medium' ? 'Orta Zırh' : 'Deri Zırh');
    inventory.push({
      slug: `armor-${armorName.toLowerCase().replace(/\s+/g, '-')}`,
      name: armorName,
      type: 'armor',
      weight: chosenArmor.type === 'heavy' ? 55 : chosenArmor.type === 'medium' ? 45 : 10,
      cost: chosenArmor.type === 'heavy' ? '1500 gp' : chosenArmor.type === 'medium' ? '50 gp' : '10 gp',
      description: `${armorName} (${chosenArmor.type} armor, AC ${chosenArmor.baseAc}).`,
      properties: [chosenArmor.type],
      quantity: 1,
      equipped: true,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'OGL / CC-BY-4.0',
    });
  }

  return {
    inventory,
    weapons,
    equippedArmor: chosenArmor,
    hasShield,
  };
}

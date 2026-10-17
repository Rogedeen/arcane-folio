/**
 * D&D 5e Otomatik Game-Icons.net ve Tema Eşleştirme Motoru
 * Büyü okulları, eşya türleri ve aksiyonlar için renk, gölge ve ikon eşleştirmesi yapar.
 */

export interface IconThemeConfig {
  iconName: string; // Game-Icons slug'ı (örn: "fire-ball", "broadsword")
  iconColor: string; // Hex veya CSS renk değeri
  bgGradient: string; // Çerçeve içindeki radial degrade
  borderColor: string; // Çerçeve kenarlık rengi
  glowColor: string; // Parlama / gölge rengi
}

// Büyü Okulu Temaları (D&D 5e Resmi Ekolleri)
export const SPELL_SCHOOL_THEMES: Record<string, { iconColor: string; bgGradient: string; borderColor: string; glowColor: string; defaultIcon: string }> = {
  evocation: {
    iconColor: '#f59e0b',
    bgGradient: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(180, 83, 9, 0.08) 100%)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    defaultIcon: 'fire-ball'
  },
  abjuration: {
    iconColor: '#38bdf8',
    bgGradient: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(14, 116, 144, 0.08) 100%)',
    borderColor: 'rgba(56, 189, 248, 0.5)',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    defaultIcon: 'shield-reflect'
  },
  necromancy: {
    iconColor: '#10b981',
    bgGradient: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 95, 70, 0.08) 100%)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    defaultIcon: 'death-skull'
  },
  conjuration: {
    iconColor: '#a855f7',
    bgGradient: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(107, 33, 168, 0.08) 100%)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    defaultIcon: 'portal'
  },
  transmutation: {
    iconColor: '#ea580c',
    bgGradient: 'radial-gradient(circle, rgba(234, 88, 12, 0.25) 0%, rgba(154, 52, 18, 0.08) 100%)',
    borderColor: 'rgba(234, 88, 12, 0.5)',
    glowColor: 'rgba(234, 88, 12, 0.35)',
    defaultIcon: 'transmutation'
  },
  enchantment: {
    iconColor: '#ec4899',
    bgGradient: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(157, 23, 77, 0.08) 100%)',
    borderColor: 'rgba(236, 72, 153, 0.5)',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    defaultIcon: 'hypersonic-eye'
  },
  illusion: {
    iconColor: '#818cf8',
    bgGradient: 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, rgba(55, 48, 163, 0.08) 100%)',
    borderColor: 'rgba(129, 140, 248, 0.5)',
    glowColor: 'rgba(129, 140, 248, 0.35)',
    defaultIcon: 'sparkles'
  },
  divination: {
    iconColor: '#2dd4bf',
    bgGradient: 'radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, rgba(15, 118, 110, 0.08) 100%)',
    borderColor: 'rgba(45, 212, 191, 0.5)',
    glowColor: 'rgba(45, 212, 191, 0.35)',
    defaultIcon: 'crystal-ball'
  }
};

// Eşya Türü Temaları
export const ITEM_TYPE_THEMES: Record<string, { iconColor: string; bgGradient: string; borderColor: string; glowColor: string; defaultIcon: string }> = {
  weapon: {
    iconColor: '#e2e8f0',
    bgGradient: 'radial-gradient(circle, rgba(226, 232, 240, 0.2) 0%, rgba(71, 85, 105, 0.08) 100%)',
    borderColor: 'rgba(226, 232, 240, 0.4)',
    glowColor: 'rgba(226, 232, 240, 0.25)',
    defaultIcon: 'broadsword'
  },
  shield: {
    iconColor: '#c89b3c',
    bgGradient: 'radial-gradient(circle, rgba(200, 155, 60, 0.25) 0%, rgba(120, 53, 15, 0.08) 100%)',
    borderColor: 'rgba(200, 155, 60, 0.5)',
    glowColor: 'rgba(200, 155, 60, 0.35)',
    defaultIcon: 'round-shield'
  },
  armor: {
    iconColor: '#94a3b8',
    bgGradient: 'radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, rgba(51, 65, 85, 0.08) 100%)',
    borderColor: 'rgba(148, 163, 184, 0.5)',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    defaultIcon: 'breastplate'
  },
  potion: {
    iconColor: '#ef4444',
    bgGradient: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(153, 27, 27, 0.08) 100%)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    defaultIcon: 'potion-ball'
  },
  gear: {
    iconColor: '#d4a373',
    bgGradient: 'radial-gradient(circle, rgba(212, 163, 115, 0.25) 0%, rgba(113, 63, 18, 0.08) 100%)',
    borderColor: 'rgba(212, 163, 115, 0.5)',
    glowColor: 'rgba(212, 163, 115, 0.3)',
    defaultIcon: 'backpack'
  },
  scroll: {
    iconColor: '#fde047',
    bgGradient: 'radial-gradient(circle, rgba(253, 224, 71, 0.25) 0%, rgba(133, 77, 14, 0.08) 100%)',
    borderColor: 'rgba(253, 224, 71, 0.5)',
    glowColor: 'rgba(253, 224, 71, 0.35)',
    defaultIcon: 'scroll-unfurled'
  }
};

// Belirli Büyü ve Eşyalar için Özel İkon Eşlemeleri (Override Listesi)
const SPECIFIC_SLUG_ICONS: Record<string, string> = {
  // Büyüler
  'fireball': 'fireball',
  'fire-bolt': 'fire-ray',
  'magic-missile': 'spark-spirit',
  'shield': 'magic-shield',
  'misty-step': 'foot-trip',
  'cure-wounds': 'healing',
  'healing-word': 'heart-plus',
  'scorching-ray': 'sunbeams',
  'acid-splash': 'acid-blob',
  'blade-ward': 'sword-brandish',
  'mage-hand': 'grab',
  'counterspell': 'spell-book',
  'lightning-bolt': 'lightning-arc',
  'thunderwave': 'sonic-shout',
  'sleep': 'sleepy',
  'bless': 'aura',
  'hold-person': 'shackles',
  // Silahlar & Eşyalar
  'longsword': 'broadsword',
  'shortsword': 'gladius',
  'dagger': 'dagger-rose',
  'rapier': 'rapier',
  'shortbow': 'bowman',
  'longbow': 'hunting-bow',
  'heavy-crossbow': 'crossbow',
  'greataxe': 'battle-axe',
  'chain-mail': 'chain-mail',
  'plate-armor': 'breastplate',
  'potion-of-healing': 'health-potion',
  'rope-hempen': 'coil-pack',
  'torch': 'torch',
  'rations-1-day': 'bread'
};

/**
 * Verilen büyü veya eşya için Game-Icons ikon adını ve temasını otomatik üretir.
 */
export function resolveIconTheme(
  category: 'spell' | 'item' | 'action',
  schoolOrType: string,
  slug?: string
): IconThemeConfig {
  const normSlug = (slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const normKey = (schoolOrType || '').toLowerCase().trim();

  // 1. Özel slug eşleşmesi varsa onu al
  const customIcon = SPECIFIC_SLUG_ICONS[normSlug];

  if (category === 'spell') {
    const theme = SPELL_SCHOOL_THEMES[normKey] || SPELL_SCHOOL_THEMES.evocation;
    return {
      iconName: customIcon || theme.defaultIcon,
      iconColor: theme.iconColor,
      bgGradient: theme.bgGradient,
      borderColor: theme.borderColor,
      glowColor: theme.glowColor
    };
  }

  // Eşya veya Aksiyon
  const theme = ITEM_TYPE_THEMES[normKey] || ITEM_TYPE_THEMES.weapon;
  return {
    iconName: customIcon || theme.defaultIcon,
    iconColor: theme.iconColor,
    bgGradient: theme.bgGradient,
    borderColor: theme.borderColor,
    glowColor: theme.glowColor
  };
}

/**
 * Iconify SVG CDN URL'si üretir.
 * Örnek: https://api.iconify.design/game-icons:fire-ball.svg?color=%23f59e0b
 */
export function getGameIconSvgUrl(iconName: string, hexColor?: string): string {
  const cleanName = iconName.startsWith('game-icons:') ? iconName.slice(11) : iconName;
  const colorParam = hexColor ? `?color=${encodeURIComponent(hexColor)}` : '';
  return `https://api.iconify.design/game-icons:${cleanName}.svg${colorParam}`;
}

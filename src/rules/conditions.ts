/**
 * SRD 5.1 Standart Durumlar (Conditions)
 */

export interface ConditionDefinition {
  id: string;
  name: string;
  nameTr: string;
  icon: string;
  description: string;
  effects: string[];
  speedZero?: boolean;
  givesDisadvantageOnAttacks?: boolean;
  givesAdvantageToAttackers?: boolean;
}

export const CONDITIONS: Record<string, ConditionDefinition> = {
  blinded: {
    id: 'blinded',
    name: 'Blinded',
    nameTr: 'Kör',
    icon: '🙈',
    description: 'Kör bir yaratık göremez ve görüş gerektiren yetenek kontrollerinde otomatik başarısız olur.',
    effects: [
      'Görüş gerektiren yetenek kontrollerinde otomatik başarısızlık.',
      'Yaratığın saldırı zarları dezavantajlıdır.',
      'Yaratığa karşı yapılan saldırı zarları avantajlıdır.'
    ],
    givesDisadvantageOnAttacks: true,
    givesAdvantageToAttackers: true
  },
  charmed: {
    id: 'charmed',
    name: 'Charmed',
    nameTr: 'Büyülenmiş',
    icon: '💖',
    description: 'Büyülenmiş yaratık kendisini büyüleyene saldıramaz veya zararlı etkiler hedefleyemez.',
    effects: [
      'Büyüleyene saldıramaz veya zararlı yetenek kullanamaz.',
      'Büyüleyenin sosyal etkileşim kontrolleri avantajlıdır.'
    ]
  },
  deafened: {
    id: 'deafened',
    name: 'Deafened',
    nameTr: 'Sağır',
    icon: '🙉',
    description: 'Sağır bir yaratık duyamaz ve işitme gerektiren yetenek kontrollerinde otomatik başarısız olur.',
    effects: ['İşitme gerektiren yetenek kontrollerinde otomatik başarısızlık.']
  },
  frightened: {
    id: 'frightened',
    name: 'Frightened',
    nameTr: 'Korkmuş',
    icon: '😱',
    description: 'Korku kaynağı görüş alanında olduğu sürece yetenek kontrolleri ve saldırı zarları dezavantajlıdır.',
    effects: [
      'Korku kaynağı görüş alanındayken saldırı ve kontroller dezavantajlıdır.',
      'Korku kaynağına doğru isteyerek yaklaşamaz.'
    ],
    givesDisadvantageOnAttacks: true
  },
  grappled: {
    id: 'grappled',
    name: 'Grappled',
    nameTr: 'Yakalanamış (Güreş)',
    icon: '🤼',
    description: 'Yakalanan yaratığın hızı 0 olur ve hız bonuslarından faydalanamaz.',
    effects: ['Hareket hızı 0 olur.'],
    speedZero: true
  },
  incapacitated: {
    id: 'incapacitated',
    name: 'Incapacitated',
    nameTr: 'Etkisiz Hale Gelmiş',
    icon: '😵',
    description: 'Etkisiz bir yaratık aksiyon (action) veya reaksiyon (reaction) alamaz.',
    effects: ['Aksiyon veya reaksiyon kullanamaz.']
  },
  invisible: {
    id: 'invisible',
    name: 'Invisible',
    nameTr: 'Görünmez',
    icon: '👻',
    description: 'Görünmez bir yaratık büyü veya özel duyular olmadan görülemez.',
    effects: [
      'Saldırı zarları avantajlıdır.',
      'Yaratığa karşı yapılan saldırı zarları dezavantajlıdır.'
    ]
  },
  paralyzed: {
    id: 'paralyzed',
    name: 'Paralyzed',
    nameTr: 'Felçli',
    icon: '⚡',
    description: 'Felçli yaratık etkisizdir, hareket edemez veya konuşamaz.',
    effects: [
      'Etkisizdir (aksiyon/reaksiyon yok).',
      'Hareket edemez (Hız 0).',
      'STR ve DEX kurtarma zarlarında otomatik başarısız olur.',
      'Yaratığa yapılan saldırılar avantajlıdır.',
      '5 ft içinden yapılan her isabetli vuruş kritik vuruştur.'
    ],
    speedZero: true,
    givesAdvantageToAttackers: true
  },
  petrified: {
    id: 'petrified',
    name: 'Petrified',
    nameTr: 'Taşlaşmış',
    icon: '🗿',
    description: 'Yaratık cansız katı bir maddeye (genelde taşa) dönüşmüştür.',
    effects: [
      'Hız 0, aksiyon alamaz.',
      'Tüm hasarlara karşı dirençlidir, zehir ve hastalığa bağışıktır.',
      'STR ve DEX kurtarma zarlarında otomatik başarısızlık.'
    ],
    speedZero: true,
    givesAdvantageToAttackers: true
  },
  poisoned: {
    id: 'poisoned',
    name: 'Poisoned',
    nameTr: 'Zehirlenmiş',
    icon: '🤢',
    description: 'Zehirlenmiş bir yaratığın saldırı zarları ve yetenek kontrolleri dezavantajlıdır.',
    effects: ['Saldırı zarları ve yetenek kontrolleri dezavantajlıdır.'],
    givesDisadvantageOnAttacks: true
  },
  prone: {
    id: 'prone',
    name: 'Prone',
    nameTr: 'Yere Serilmiş',
    icon: '🧎',
    description: 'Yere serilmiş yaratığın tek hareket seçeneği sürünmektir veya ayağa kalkmaktır.',
    effects: [
      'Ayağa kalkmak hareket hızının yarısını harcar.',
      'Yaratığın saldırı zarları dezavantajlıdır.',
      '5 ft içindeki saldırganlar avantaja sahiptir; 5 ft ötesindekiler dezavantaja sahiptir.'
    ],
    givesDisadvantageOnAttacks: true
  },
  restrained: {
    id: 'restrained',
    name: 'Restrained',
    nameTr: 'Kısıtlanmış / Bağlanmış',
    icon: '🕸️',
    description: 'Kısıtlanmış bir yaratığın hızı 0 olur.',
    effects: [
      'Hız 0.',
      'Saldırı zarları dezavantajlıdır.',
      'Yaratığa yapılan saldırılar avantajlıdır.',
      'DEX kurtarma zarları dezavantajlıdır.'
    ],
    speedZero: true,
    givesDisadvantageOnAttacks: true,
    givesAdvantageToAttackers: true
  },
  stunned: {
    id: 'stunned',
    name: 'Stunned',
    nameTr: 'Sersemlemiş',
    icon: '💫',
    description: 'Sersemlemiş yaratık etkisizdir, hareket edemez ve kekeleyerek konuşabilir.',
    effects: [
      'Aksiyon veya reaksiyon alamaz.',
      'Hız 0.',
      'STR ve DEX kurtarma zarlarında otomatik başarısızlık.',
      'Yaratığa yapılan saldırılar avantajlıdır.'
    ],
    speedZero: true,
    givesAdvantageToAttackers: true
  },
  unconscious: {
    id: 'unconscious',
    name: 'Unconscious',
    nameTr: 'Bilinçsiz / Baygın',
    icon: '💤',
    description: 'Bilinçsiz yaratık etkisizdir, hareket edemez ve etrafından habersizdir.',
    effects: [
      'Yere düşer (Prone).',
      'Hız 0, aksiyon yok.',
      'STR ve DEX kurtarma zarlarında otomatik başarısızlık.',
      'Yaratığa yapılan saldırılar avantajlıdır.',
      '5 ft içinden yapılan isabetler otomatik kritik vuruştur.'
    ],
    speedZero: true,
    givesAdvantageToAttackers: true
  },
  exhaustion: {
    id: 'exhaustion',
    name: 'Exhaustion',
    nameTr: 'Tükenmişlik',
    icon: '😫',
    description: 'Tükenmişlik seviyeleri (1-6) birikerek ölümcül etkilere yol açar.',
    effects: [
      'Seviye 1: Yetenek kontrollerinde dezavantaj.',
      'Seviye 2: Hız yarıya iner.',
      'Seviye 3: Saldırı ve kurtarma zarlarında dezavantaj.',
      'Seviye 4: Maksimum HP yarıya iner.',
      'Seviye 5: Hız 0.',
      'Seviye 6: Ölüm.'
    ]
  }
};

export function getCondition(conditionId: string): ConditionDefinition | undefined {
  return CONDITIONS[conditionId.toLowerCase()];
}

export function getAllConditions(): ConditionDefinition[] {
  return Object.values(CONDITIONS);
}

export function isMovementBlocked(activeConditions: string[]): boolean {
  return activeConditions.some((c) => CONDITIONS[c.toLowerCase()]?.speedZero === true);
}

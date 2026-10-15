/**
 * SRD 5.1 & PHB 2014 Hünerler (Feats) Tanımları
 */

export interface FeatDefinition {
  id: string;
  name: string;
  nameTr: string;
  prerequisite?: string;
  description: string;
  abilityBonus?: {
    abilities: Array<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'>;
    amount: number;
  };
  features: string[];
}

export const FEATS: FeatDefinition[] = [
  {
    id: 'great-weapon-master',
    name: 'Great Weapon Master',
    nameTr: 'Usta Ağır Silahşor',
    description: 'Ağır silahlarla devasa yıkıcı darbeler indirmede uzmansınız.',
    features: [
      'Kritik vuruş yaptığınızda veya bir yaratığı 0 HP\'ye düşürdüğünüzde bonus aksiyon ile fazladan 1 yakın dövüş saldırısı yapabilirsiniz.',
      'Ağır bir silahla saldırırken, saldırı zarına -5 ceza almayı seçebilir; isabet halinde +10 ekstra hasar verirsiniz.'
    ]
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    nameTr: 'Keskin Nişancı',
    description: 'Menzilli silahlarda mesafe ve siper tanımayan ölümcül isabet.',
    features: [
      'Maksimum menzilde ateş etmek saldırı zarlarınıza dezavantaj vermez.',
      'Menzilli silah saldırılarınız yarım veya üç çeyrek siperleri (cover) yok sayar.',
      'Saldırı zarına -5 ceza alarak isabet halinde +10 menzilli hasar vurabilirsiniz.'
    ]
  },
  {
    id: 'war-caster',
    name: 'War Caster',
    nameTr: 'Savaş Büyücüsü',
    description: 'Savaşın tam ortasında büyü yapma ve konsantrasyonu koruma uzmanlığı.',
    features: [
      'Hasar aldığınızda konsantrasyonu korumak için attığınız Dayanıklılık (CON) kurtarma zarlarında avantaj kazanırsınız.',
      'İki elinizde de silah veya kalkan varken bile somatik (el hareketleri) büyü bileşenlerini gerçekleştirebilirsiniz.',
      'Bir düşman sizden uzaklaşırken fırsat saldırısı (opportunity attack) yerine 1 eylem süreli bir büyü fırlatabilirsiniz.'
    ]
  },
  {
    id: 'alert',
    name: 'Alert',
    nameTr: 'Teyakkuz (Alert)',
    description: 'Tehlikeyi her an sezen olağanüstü refleksler.',
    features: [
      'İnisiyatif zarlarınıza +5 bonus kazanırsınız.',
      'Bilinciniz yerindeyken asla gafil avlanamazsınız (cannot be surprised).',
      'Görmediğiniz gizli yaratıklar size saldırırken avantaj elde edemez.'
    ]
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    nameTr: 'Gözcü Muhafız',
    description: 'Düşmanların yanınızdan geçip müttefiklerinize ulaşmasına asla izin vermezsiniz.',
    features: [
      'Fırsat saldırısı ile bir yaratığa vurduğunuzda, yaratığın hareket hızı turun sonuna kadar 0 olur.',
      'Yaratıklar Geri Çekilme (Disengage) eylemi yapsalar dahi sizden fırsat saldırısı alırlar.',
      '5 ft yakınınızdaki bir müttefiğe saldıran düşmana reaksiyon olarak yakın dövüş saldırısı yapabilirsiniz.'
    ]
  },
  {
    id: 'lucky',
    name: 'Lucky',
    nameTr: 'Şans Meleği (Lucky)',
    description: 'Kaderin akışını lehine çeviren doğaüstü bir şans.',
    features: [
      'Günde 3 şans puanına sahip olursunuz.',
      'Herhangi bir saldırı, yetenek kontrolü veya kurtarma zarı attığınızda bir şans puanı harcayarak fazladan 1d20 atıp istediğinizi seçebilirsiniz.',
      'Size saldıran bir düşmanın saldırı zarına karşı bir şans puanı harcayarak düşmanın zarını yeniden attırabilirsiniz.'
    ]
  },
  {
    id: 'tough',
    name: 'Tough',
    nameTr: 'Çetin Ceviz (Tough)',
    description: 'Fiziksel dayanıklılığınız efsanevi boyutlardadır.',
    features: [
      'Bu hüneri aldığınızda maksimum can puanınız mevcut seviyenizin 2 katı kadar artar.',
      'Bundan sonra atladığınız her seviyede ek olarak +2 maksimum can puanı kazanırsınız.'
    ]
  },
  {
    id: 'mobile',
    name: 'Mobile',
    nameTr: 'Mobil (Çevik Hareket)',
    description: 'Savaş meydanında hızla süzülen rakipsiz akıcılık.',
    features: [
      'Hareket hızınız 10 ft artar.',
      'Koşma (Dash) eylemi yaptığınızda zorlu zeminler (difficult terrain) o tur boyunca hareketinizi yavaşlatmaz.',
      'Bir yaratığa yakın dövüş saldırısı yaptığınızda (vursanız da ıskalasanız da), o yaratık o turun sonuna kadar size karşı fırsat saldırısı yapamaz.'
    ]
  },
  {
    id: 'fey-touched',
    name: 'Fey Touched',
    nameTr: 'Peri Dokunuşu (Fey Touched)',
    description: 'Peri diyarlarının büyüsüyle kutsanmış zihin.',
    abilityBonus: {
      abilities: ['int', 'wis', 'cha'],
      amount: 1
    },
    features: [
      'Zeka, Bilgelik veya Karizma skorunuzdan birini 1 artırırsınız.',
      'Misty Step büyüsünü ve seçeceğiniz 1. seviye bir büyüyü öğrenir; her uzun dinlenmede bir kez büyü yuvası harcamadan yapabilirsiniz.'
    ]
  },
  {
    id: 'resilient',
    name: 'Resilient',
    nameTr: 'Dirençli (Resilient)',
    description: 'Zayıf bir yönünüzü çelik gibi bir dirence dönüştürürsünüz.',
    features: [
      'Seçeceğiniz herhangi bir yetenek skorunu 1 artırırsınız.',
      'Seçtiğiniz yeteneğin Kurtarma Zarlarına (Saving Throw) Ustalık Bonusu (Proficiency) kazanırsınız.'
    ]
  }
];

export function getFeatById(id: string): FeatDefinition | undefined {
  return FEATS.find((f) => f.id.toLowerCase() === id.toLowerCase());
}

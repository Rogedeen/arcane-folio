// =============================================================================
// I18N DICTIONARY & LOCALIZATION ENGINE
// Tam Türkçe / Full English Sözlük ve Çeviri Fonksiyonları
// =============================================================================

export type AppLanguage = 'tr' | 'en';

export interface TranslationDictionary {
  // Navigation & Header
  appTitle: string;
  returnHome: string;
  themeParchment: string;
  themeDungeon: string;
  themeAria: string;
  langSwitchAria: string;
  
  // Roles & Badges
  roleSheet: string;
  roleDm: string;
  roleCreator: string;
  roleGallery: string;
  
  // Home Hub
  hubTitle: string;
  activeCharacter: string;
  openActiveSheet: string;
  levelShort: string;
  
  // Hub Cards
  hubCardSheetTitle: string;
  hubCardSheetDescActive: string;
  hubCardSheetDescEmpty: string;
  hubCardSheetBtnActive: string;
  hubCardSheetBtnEmpty: string;
  
  hubCardDmTitle: string;
  hubCardDmDesc: string;
  hubCardDmBtn: string;
  
  hubCardCreatorTitle: string;
  hubCardCreatorDesc: string;
  hubCardCreatorBtn: string;
  
  hubCardGalleryTitle: string;
  hubCardGalleryDescCount: string;
  hubCardGalleryDescEmpty: string;
  hubCardGalleryBtnCount: string;
  hubCardGalleryBtnEmpty: string;
  
  // Character Sheet Header
  joinCampaign: string;
  joinedCampaign: string;
  combatModeOn: string;
  combatModeOff: string;
  shortRest: string;
  longRest: string;
  locked: string;
  unlocked: string;
  
  // Join Modal
  joinModalTitle: string;
  joinModalDesc: string;
  joinModalPlaceholder: string;
  joinModalBtn: string;
  joinModalClose: string;
  joinModalInvalid: string;
  joinModalSuccess: string;
  
  // Combat HUD
  proficiencyBonus: string;
  speed: string;
  walking: string;
  initiative: string;
  armorClass: string;
  inspiration: string;
  spendInspiration: string;
  hitPoints: string;
  healBtn: string;
  dmgBtn: string;
  
  // Sheet Tabs
  tabActions: string;
  tabInventory: string;
  tabSpells: string;
  tabFeatures: string;
  tabLevelUp: string;
  tabBackground: string;
  tabNotes: string;
  tabConditions: string;
  
  // Saving Throws & Senses
  savingThrowsHeader: string;
  sensesHeader: string;
  passivePerception: string;
  passiveInvestigation: string;
  passiveInsight: string;
  darkvision: string;
  proficienciesHeader: string;
  armorProf: string;
  weaponsProf: string;
  toolsProf: string;
  languagesProf: string;
  skillsHeader: string;
  searchSkillPlaceholder: string;
  
  // Combat Mode Panel
  actionTitle: string;
  actionUsed: string;
  actionReady: string;
  bonusActionTitle: string;
  bonusActionUsed: string;
  bonusActionReady: string;
  reactionTitle: string;
  reactionUsed: string;
  reactionReady: string;
  movementTitle: string;
  spend5ft: string;
  spend10ft: string;
  resetMovement: string;
  endTurnBtn: string;
  endTurnToast: string;
  
  // Ability Names (Short & Long)
  str: string;
  dex: string;
  con: string;
  int: string;
  wis: string;
  cha: string;
  strength: string;
  dexterity: string;
  constitution: string;
  intelligence: string;
  wisdom: string;
  charisma: string;
  
  // DM & Campaign Screen
  dmPartyOverview: string;
  dmCombatTracker: string;
  dmTitle: string;
  dmSubTitle: string;
  dmSyncLive: string;
  dmInviteCode: string;
  dmCopyCode: string;
  dmCopied: string;
  dmRegenCode: string;
  dmJoinOtherTitle: string;
  dmJoinBtn: string;
  dmJoinPlaceholder: string;
  dmInvalidCode: string;
  dmRoleDm: string;
  dmRolePlayer: string;

  // Footer
  footerSub: string;
  footerLegal: string;
}

export const translations: Record<AppLanguage, TranslationDictionary> = {
  tr: {
    // Navigation & Header
    appTitle: 'ARCANEFOLIO 5E',
    returnHome: '← Ana Sayfa',
    themeParchment: '📜 Parşömen',
    themeDungeon: '🌘 Zindan',
    themeAria: 'Tema Değiştir',
    langSwitchAria: 'Dili Değiştir (Language Switcher)',
    
    // Roles & Badges
    roleSheet: '🛡️ Oyuncu Masası',
    roleDm: '👑 Zindan Efendisi (DM)',
    roleCreator: '🧙 Karakter Yaratım',
    roleGallery: '🧝 Karakter Koleksiyonu',
    
    // Home Hub
    hubTitle: 'ARCANEFOLIO 5E',
    activeCharacter: 'AKTİF KARAKTER',
    openActiveSheet: '📜 Kâğıdı Aç →',
    levelShort: 'Svye',
    
    // Hub Cards
    hubCardSheetTitle: 'Oyuncu Masası & Karakter Kağıdı',
    hubCardSheetDescActive: '— Canlı zar atımı, envanter, büyüler ve sefere katılım.',
    hubCardSheetDescEmpty: 'Aktif bir karakter kağıdını açıp oyuna katılın veya koleksiyondan bir kahraman seçin.',
    hubCardSheetBtnActive: 'Karakter Masasına Gir →',
    hubCardSheetBtnEmpty: 'Karakter Seç →',
    
    hubCardDmTitle: 'Zindan Efendisi (DM Kokpiti)',
    hubCardDmDesc: 'Sefer oluştur, davet kodu ile oyuncularını masana topla, canlı parti can barlarını ve canavar karşılaşmalarını yönet.',
    hubCardDmBtn: 'DM Masasını Aç →',
    
    hubCardCreatorTitle: 'Karakter Yarat (Sihirbaz)',
    hubCardCreatorDesc: 'SRD 5.1 kural motoruyla ırk, sınıf, statlar ve başlangıç eşyalarıyla sıfırdan yeni bir kahraman inşa et.',
    hubCardCreatorBtn: 'Yeni Kahraman Yarat →',
    
    hubCardGalleryTitle: 'Karakterlerim & Koleksiyon',
    hubCardGalleryDescCount: 'kayıtlı karakter. Seç, düzenle, sil veya yedekle.',
    hubCardGalleryDescEmpty: 'Kayıtlı karakterlerinizi burada listeleyin ve yönetin.',
    hubCardGalleryBtnCount: 'Karakteri Gör →',
    hubCardGalleryBtnEmpty: 'Koleksiyonu Aç →',
    
    // Character Sheet Header
    joinCampaign: 'Sefere Katıl',
    joinedCampaign: 'Sefer',
    combatModeOn: 'SAVAŞ MODU (AÇIK)',
    combatModeOff: 'SAVAŞ MODU',
    shortRest: 'KISA DİNLENME',
    longRest: 'UZUN DİNLENME',
    locked: '🔒 Kilitli',
    unlocked: '🔓 Duzenle',
    
    // Join Modal
    joinModalTitle: '🏰 DM Seferine Katıl',
    joinModalDesc: 'DM\'inizin size verdiği 6 haneli davet kodunu girerek karakterinizin canını ve durumunu DM ekranına canlı bağlayın.',
    joinModalPlaceholder: 'Örn: DRG924',
    joinModalBtn: 'Katıl 🚀',
    joinModalClose: 'Kapat',
    joinModalInvalid: 'Lütfen 6 haneli geçerli davet kodu girin (örn: DRG924).',
    joinModalSuccess: 'Sefere bağlandı',
    
    // Combat HUD
    proficiencyBonus: 'USTALIK',
    speed: 'HIZ',
    walking: 'YÜRÜME',
    initiative: 'İNİSİYATİF',
    armorClass: 'ZIRH SINIFI',
    inspiration: 'İLHAM',
    spendInspiration: 'Harca (-1)',
    hitPoints: 'CAN PUANI',
    healBtn: 'İYİLEŞ',
    dmgBtn: 'HASAR',
    
    // Sheet Tabs
    tabActions: '⚔️ EYLEMLER',
    tabInventory: '🎒 ENVANTER',
    tabSpells: '📜 BÜYÜLER',
    tabFeatures: '⚡ ÖZELLİKLER',
    tabLevelUp: '🏆 SEVİYE ATLA',
    tabBackground: '📜 GEÇMİŞ',
    tabNotes: '📝 NOTLAR',
    tabConditions: '⚡ DURUMLAR',
    
    // Saving Throws & Senses
    savingThrowsHeader: 'KURTARMA ZARLARI',
    sensesHeader: 'DUYULAR & ALGI',
    passivePerception: 'Pasif Algı (Perception):',
    passiveInvestigation: 'Pasif İnceleme (Investigation):',
    passiveInsight: 'Pasif Sezgi (Insight):',
    darkvision: '🌙 Karanlıkta Görme: 60 ft.',
    proficienciesHeader: 'EĞİTİMLER & YETKİNLİKLER',
    armorProf: 'Zırh:',
    weaponsProf: 'Silahlar:',
    toolsProf: 'Aletler:',
    languagesProf: 'Diller:',
    skillsHeader: 'BECERİLER (SKILLS)',
    searchSkillPlaceholder: 'Ara...',
    
    // Combat Mode Panel
    actionTitle: 'STANDART EYLEM',
    actionUsed: 'Kullanıldı',
    actionReady: 'Hazır',
    bonusActionTitle: 'BONUS EYLEM',
    bonusActionUsed: 'Kullanıldı',
    bonusActionReady: 'Hazır',
    reactionTitle: 'TEPKİ (REACTION)',
    reactionUsed: 'Kullanıldı',
    reactionReady: 'Hazır',
    movementTitle: 'HAREKET',
    spend5ft: '5 ft Harca',
    spend10ft: '10 ft Harca',
    resetMovement: 'Hareketi Yenile',
    endTurnBtn: 'Turu Bitir',
    endTurnToast: 'Tur tamamlandı! Eylemler ve hareket yenilendi.',
    
    // Ability Names
    str: 'GÜÇ',
    dex: 'ÇEV',
    con: 'DAY',
    int: 'ZEK',
    wis: 'BİL',
    cha: 'KAR',
    strength: 'Güç',
    dexterity: 'Çeviklik',
    constitution: 'Dayanıklılık',
    intelligence: 'Zeka',
    wisdom: 'Bilgelik',
    charisma: 'Karizma',
    
    // DM & Campaign Screen
    dmPartyOverview: 'Parti Genel Bakış',
    dmCombatTracker: 'Savaş Modu & İnisiyatif Takipçisi',
    dmTitle: 'Ejderha Mızrağı Seferi',
    dmSubTitle: 'Yönetici: Zindan Efendisi (DM) | Davet Kodu ve Canlı Parti Takibi',
    dmSyncLive: 'Canlı Senkronize (Realtime Aktif)',
    dmInviteCode: 'KAMPANYA DAVET KODU',
    dmCopyCode: '📋 Kopyala',
    dmCopied: '✓ Kopyalandı!',
    dmRegenCode: '🔄 Yenile',
    dmJoinOtherTitle: 'FARKLI BİR KAMPANYAYA KATIL',
    dmJoinBtn: 'Katıl 🚀',
    dmJoinPlaceholder: 'Örn: ARC842',
    dmInvalidCode: 'Geçersiz davet kodu! 6 haneli alfasayısal kod giriniz.',
    dmRoleDm: '🧙‍♂️ DM Modu',
    dmRolePlayer: '🛡️ Oyuncu Modu',

    // Footer
    footerSub: 'ArcaneFolio 5e • 5. Edisyon Masaüstü Rol Yapma Portali',
    footerLegal: 'ArcaneFolio 5e, Wizards of the Coast\'un Hayran İçerik Politikası kapsamında geliştirilmiş bağımsız, kâr amacı gütmeyen bir hayran içeriğidir. Kural seti ve referans verileri, System Reference Document 5.1 (SRD 5.1) ve Open5e veri tabanından alınmıştır. Wizards of the Coast LLC tarafından desteklenmemekte veya onaylanmamaktadır.',
  },
  en: {
    // Navigation & Header
    appTitle: 'ARCANEFOLIO 5E',
    returnHome: '← Home Hub',
    themeParchment: '📜 Parchment',
    themeDungeon: '🌘 Dungeon',
    themeAria: 'Toggle Theme',
    langSwitchAria: 'Switch Language (Dil Değiştir)',
    
    // Roles & Badges
    roleSheet: '🛡️ Player Sheet',
    roleDm: '👑 Dungeon Master (DM)',
    roleCreator: '🧙 Character Creator',
    roleGallery: '🧝 Character Roster',
    
    // Home Hub
    hubTitle: 'ARCANEFOLIO 5E',
    activeCharacter: 'ACTIVE HERO',
    openActiveSheet: '📜 Open Sheet →',
    levelShort: 'Lvl',
    
    // Hub Cards
    hubCardSheetTitle: 'Player Sheet & Dashboard',
    hubCardSheetDescActive: '— Realtime dice rolling, inventory, spellbook, and campaign synchronization.',
    hubCardSheetDescEmpty: 'Open your active character sheet or select an adventurer from your roster.',
    hubCardSheetBtnActive: 'Enter Player Sheet →',
    hubCardSheetBtnEmpty: 'Select Character →',
    
    hubCardDmTitle: 'Dungeon Master (DM Cockpit)',
    hubCardDmDesc: 'Create a campaign, invite players with a join code, track live HP bars, passive perception radar, and run encounters.',
    hubCardDmBtn: 'Open DM Cockpit →',
    
    hubCardCreatorTitle: 'Character Builder (Wizard)',
    hubCardCreatorDesc: 'Build a new hero step-by-step using SRD 5.1 rules with races, classes, abilities, and starting equipment.',
    hubCardCreatorBtn: 'Create New Hero →',
    
    hubCardGalleryTitle: 'Character Roster & Storage',
    hubCardGalleryDescCount: 'saved characters. Select, edit, export, or manage your adventurers.',
    hubCardGalleryDescEmpty: 'Browse, manage, and store your roster of heroes here.',
    hubCardGalleryBtnCount: 'View Heroes →',
    hubCardGalleryBtnEmpty: 'Open Roster →',
    
    // Character Sheet Header
    joinCampaign: 'Join Campaign',
    joinedCampaign: 'Campaign',
    combatModeOn: 'COMBAT MODE (ON)',
    combatModeOff: 'COMBAT MODE',
    shortRest: 'SHORT REST',
    longRest: 'LONG REST',
    locked: '🔒 Locked',
    unlocked: '🔓 Edit Mode',
    
    // Join Modal
    joinModalTitle: '🏰 Join DM Campaign',
    joinModalDesc: 'Enter the 6-character campaign invite code provided by your DM to link your character sheet and stats in real-time.',
    joinModalPlaceholder: 'E.g.: DRG924',
    joinModalBtn: 'Join 🚀',
    joinModalClose: 'Close',
    joinModalInvalid: 'Please enter a valid 6-character invite code (e.g., DRG924).',
    joinModalSuccess: 'Connected to campaign',
    
    // Combat HUD
    proficiencyBonus: 'PROFICIENCY',
    speed: 'SPEED',
    walking: 'WALKING',
    initiative: 'INITIATIVE',
    armorClass: 'ARMOR CLASS',
    inspiration: 'INSPIRATION',
    spendInspiration: 'Spend (-1)',
    hitPoints: 'HIT POINTS',
    healBtn: 'HEAL',
    dmgBtn: 'DMG',
    
    // Sheet Tabs
    tabActions: '⚔️ ACTIONS',
    tabInventory: '🎒 INVENTORY',
    tabSpells: '📜 SPELLS',
    tabFeatures: '⚡ FEATURES',
    tabLevelUp: '🏆 LEVEL UP',
    tabBackground: '📜 BACKGROUND',
    tabNotes: '📝 NOTES',
    tabConditions: '⚡ CONDITIONS',
    
    // Saving Throws & Senses
    savingThrowsHeader: 'SAVING THROWS',
    sensesHeader: 'SENSES',
    passivePerception: 'Passive Perception:',
    passiveInvestigation: 'Passive Investigation:',
    passiveInsight: 'Passive Insight:',
    darkvision: '🌙 Darkvision: 60 ft.',
    proficienciesHeader: 'PROFICIENCIES & TRAINING',
    armorProf: 'Armor:',
    weaponsProf: 'Weapons:',
    toolsProf: 'Tools:',
    languagesProf: 'Languages:',
    skillsHeader: 'SKILLS',
    searchSkillPlaceholder: 'Search...',
    
    // Combat Mode Panel
    actionTitle: 'STANDARD ACTION',
    actionUsed: 'Used',
    actionReady: 'Ready',
    bonusActionTitle: 'BONUS ACTION',
    bonusActionUsed: 'Used',
    bonusActionReady: 'Ready',
    reactionTitle: 'REACTION',
    reactionUsed: 'Used',
    reactionReady: 'Ready',
    movementTitle: 'MOVEMENT',
    spend5ft: 'Spend 5 ft',
    spend10ft: 'Spend 10 ft',
    resetMovement: 'Reset Speed',
    endTurnBtn: 'End Turn',
    endTurnToast: 'Turn finished! Actions and movement refreshed.',
    
    // Ability Names
    str: 'STR',
    dex: 'DEX',
    con: 'CON',
    int: 'INT',
    wis: 'WIS',
    cha: 'CHA',
    strength: 'Strength',
    dexterity: 'Dexterity',
    constitution: 'Constitution',
    intelligence: 'Intelligence',
    wisdom: 'Wisdom',
    charisma: 'Charisma',
    
    // DM & Campaign Screen
    dmPartyOverview: 'Party Overview',
    dmCombatTracker: 'Combat & Initiative Tracker',
    dmTitle: 'Dragonlance Campaign',
    dmSubTitle: 'Dungeon Master (DM) Console | Invite Code & Live Party Tracker',
    dmSyncLive: 'Live Sync Active (Realtime)',
    dmInviteCode: 'CAMPAIGN INVITE CODE',
    dmCopyCode: '📋 Copy Code',
    dmCopied: '✓ Copied!',
    dmRegenCode: '🔄 New Code',
    dmJoinOtherTitle: 'JOIN ANOTHER CAMPAIGN',
    dmJoinBtn: 'Join 🚀',
    dmJoinPlaceholder: 'e.g. ARC842',
    dmInvalidCode: 'Invalid invite code! Please enter a 6-character code.',
    dmRoleDm: '🧙‍♂️ DM Mode',
    dmRolePlayer: '🛡️ Player Mode',

    // Footer
    footerSub: 'ArcaneFolio 5e • 5th Edition TTRPG Companion Portal',
    footerLegal: 'ArcaneFolio 5e is unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. Rule content is derived from the System Reference Document 5.1 (SRD 5.1) licensed under CC-BY-4.0 and Open5e. Not approved or endorsed by Wizards of the Coast LLC.',
  },
};

export function getTranslation(lang: AppLanguage = 'tr'): TranslationDictionary {
  return translations[lang] || translations.tr;
}

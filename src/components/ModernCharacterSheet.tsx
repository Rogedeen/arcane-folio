// =============================================================================
// MODERN CHARACTER SHEET V3 (REMASTERED — CLEAN ARCHITECTURE & SOLID ORCHESTRATOR)
// 21st.dev 'Red Dark' & D&D Beyond 1:1 Bento Dashboard
//
// MİMARİ:
// - SheetHeader: Portre, Karakter kimliği, Dinlenme, Stat Kilidi, Savaş Modu geçişi
// - SheetEmergencyDeathBanner & CinematicDeathSaves: Ölüm Eşiği & 3D zarlar
// - CombatHudRow: 6 Yetenek Skoru Rozetleri, AC, İnisiyatif, Hız, İlham, Can Barı
// - CombatModePanel: Taktiksel eylem, bonus action, tepki ve hareket takibi
// - LeftColumnCards: SavingThrowsCard, SensesCard, ProficienciesCard, DeathSaves
// - SkillsListCard: A-Z 18 Beceri Listesi (Arama filtreli, tıkla-at)
// - Right Column Tabs: ActionsTabContent, Spellbook, FeaturesTabContent, InventoryManager,
//                      LevelUpModal, BackgroundTabContent, NotesTabContent, ConditionsTracker
// =============================================================================

import React, { useState, useEffect } from 'react';
import { calculateModifier } from '../rules/abilityScores';
import { calculateProficiencyBonus } from '../rules/proficiency';
import { calculatePassivePerception, calculatePassiveInvestigation } from '../rules/skills';
import { calculateArmorClass } from '../rules/armorClass';
import { characterToPartyMember } from '../rules/campaignRules';
import { InventoryManager } from './InventoryManager';
import { Spellbook } from './Spellbook';
import { ConditionsTracker } from './ConditionsTracker';
import { LevelUpModal } from './LevelUpModal';
import { DeathSaves } from './DeathSaves';
import { CinematicDeathSaves } from './CinematicDeathSaves';
import { useCharacter } from '../context/CharacterContext';
import { useReference } from '../context/ReferenceContext';
import { soundEffects } from '../utils/soundEffects';
import { syncService } from '../data/syncService';
import { isCasterSubclass } from '../rules/subclasses';
import { getTranslation } from '../utils/i18n';
import type { FullCharacter, AbilityName, ArmorItem, WeaponItem } from '../types/character';
import type { ItemData } from '../types/content';

// Subcomponents
import { SheetHeader } from './sheet/SheetHeader';
import { SheetQuickToast, type QuickToastData } from './sheet/SheetQuickToast';
import { SheetEmergencyDeathBanner } from './sheet/SheetEmergencyDeathBanner';
import { CombatModePanel } from './sheet/CombatModePanel';
import { CombatHudRow } from './sheet/CombatHudRow';
import { SavingThrowsCard, SensesCard, ProficienciesCard } from './sheet/LeftColumnCards';
import { SkillsListCard } from './sheet/SkillsListCard';
import { ActionsTabContent, type ActionSubPill } from './sheet/ActionsTabContent';
import { FeaturesTabContent } from './sheet/FeaturesTabContent';
import { BackgroundTabContent } from './sheet/BackgroundTabContent';
import { NotesTabContent } from './sheet/NotesTabContent';
import { StatusAdvantageBanner } from './sheet/StatusAdvantageBanner';
import { computeCharacterAdvantageState } from '../rules/statusAnalysis';
import { getSpellSlotsForLevel } from '../rules/spellSlots';

const DEMO_CHARACTER: FullCharacter = {
  id: 'demo-char',
  name: 'Kaelen Karaçekiç',
  race: 'human',
  class: 'fighter',
  subclass: 'Champion',
  background: 'soldier',
  level: 3,
  baseAbilities: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 },
  proficientSkills: ['athletics', 'intimidation', 'survival'],
  proficientSavingThrows: ['str', 'con'],
  equippedArmor: { name: 'Scale Mail', type: 'medium', baseAc: 14, maxDexBonus: 2 },
  hasShield: true,
  weapons: [
    { id: 'w1', name: 'Uzunkilic (Longsword)', damage: '1d8', damageType: 'slashing', properties: ['versatile'], range: '5 ft', abilityUsed: 'str' },
    { id: 'w2', name: 'Hancer (Dagger)', damage: '1d4', damageType: 'piercing', properties: ['finesse', 'thrown'], range: '20/60 ft', abilityUsed: 'dex' },
  ],
  inventory: [
    {
      slug: 'scale-mail',
      name: 'Scale Mail',
      type: 'armor',
      weight: 45,
      cost: '50 gp',
      description: 'Orta zırh, taban AC 14.',
      properties: ['medium'],
      quantity: 1,
      equipped: true,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'OGL / CC-BY-4.0',
    },
    {
      slug: 'shield',
      name: 'Shield',
      type: 'shield',
      weight: 6,
      cost: '10 gp',
      description: '+2 AC kalkan.',
      properties: ['shield'],
      quantity: 1,
      equipped: true,
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
      description: '2d4 + 2 can iyileştirir.',
      properties: ['consumable'],
      quantity: 1,
      equipped: false,
      source: 'SRD 5.1',
      source_ref: 'PHB',
      license: 'OGL / CC-BY-4.0',
    },
  ],
  currentHp: 28,
  maxHp: 28,
  tempHp: 0,
  hitDiceAvailable: 3,
  spellSlots: {},
  activeConditions: [],
  deathSaves: { successes: 0, failures: 0 },
  inspiration: 1,
  ruleset: '2014',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

type SheetTab = 'actions' | 'spells' | 'inventory' | 'conditions' | 'features' | 'background' | 'notes';

export const ModernCharacterSheet: React.FC = () => {
  const {
    activeCharacter,
    updateHp,
    updateConditions,
    updateDeathSaves,
    updateInspiration,
    saveCharacter,
    state,
  } = useCharacter();

  const t = getTranslation(state.preferences.language || 'tr');

  const character = activeCharacter ?? DEMO_CHARACTER;
  const isDemo = !activeCharacter;

  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<SheetTab>('actions');
  const [actionSubPill, setActionSubPill] = useState<ActionSubPill>('all');
  const [customHpInput, setCustomHpInput] = useState<string>('');

  // Sinematik Ölüm Ekranı Kapatılıp Kağıda Dönüldü mü?
  const [isDeathDismissed, setIsDeathDismissed] = useState<boolean>(false);

  // Savaş Modu (Combat Mode) & Eylem Sayacı
  const [combatMode, setCombatMode] = useState<boolean>(false);
  const [actionUsed, setActionUsed] = useState<boolean>(false);
  const [bonusActionUsed, setBonusActionUsed] = useState<boolean>(false);
  const [reactionUsed, setReactionUsed] = useState<boolean>(false);
  const baseSpeed = 30; // ft
  const [remainingSpeed, setRemainingSpeed] = useState<number>(baseSpeed);

  // Savaş Sisi (Fog of War) Canavar Hedefleri
  const [monsterTargets, setMonsterTargets] = useState<import('./sheet/CombatModePanel').MonsterTargetFog[]>([]);

  // Hızlı Zar Bildirim Toast'ı
  const [quickToast, setQuickToast] = useState<QuickToastData | null>(null);

  // Silah bazlı dönüştürmeli hasar zarı animasyonu state'i (2d6 -> 10 -> [10] 2d6)
  const [damageAnimState, setDamageAnimState] = useState<
    Record<string, { isRolling: boolean; labelText: string; ghostVal: string | null }>
  >({});

  const { openReference } = useReference();

  // HP 0'dan yukarı çıkarsa ölüm penceresi kapatma durumunu sıfırla
  useEffect(() => {
    if (character.currentHp > 0) {
      setIsDeathDismissed(false);
    }
  }, [character.currentHp]);

  const profBonus = calculateProficiencyBonus(character.level);

  const strMod = calculateModifier(character.baseAbilities.str);
  const dexMod = calculateModifier(character.baseAbilities.dex);
  const conMod = calculateModifier(character.baseAbilities.con);
  const intMod = calculateModifier(character.baseAbilities.int);
  const wisMod = calculateModifier(character.baseAbilities.wis);
  const chaMod = calculateModifier(character.baseAbilities.cha);

  const passivePerception = calculatePassivePerception(
    wisMod,
    character.proficientSkills.includes('perception'),
    profBonus
  );

  const passiveInvestigation = calculatePassiveInvestigation(
    intMod,
    character.proficientSkills.includes('investigation'),
    profBonus
  );

  const passiveInsight = 10 + wisMod + (character.proficientSkills.includes('insight') ? profBonus : 0);

  const ac = calculateArmorClass({
    charClass: character.class,
    dexModifier: dexMod,
    conModifier: conMod,
    wisModifier: wisMod,
    armor: character.equippedArmor,
    hasShield: character.hasShield,
  });

  // Karakter Durum, Yetkinlik ve Avantaj/Dezavantaj Durumu
  const advantageStatus = computeCharacterAdvantageState({
    charClass: character.class,
    strScore: character.baseAbilities.str,
    inventory: character.inventory ?? [],
    conditions: character.activeConditions ?? [],
  });

  // Karakter Büyü Yuvaları (Spell Slots) State'i
  const [spellSlots, setSpellSlots] = useState(() =>
    getSpellSlotsForLevel(character.class, character.level, character.subclass)
  );

  // Sefer Kodu State'i (DM'in Seferine Katılma)
  const [joinedCampaignCode, setJoinedCampaignCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('arcane_player_campaign') || null;
    }
    return null;
  });

  const handlePlayerJoinCampaign = (inviteCode: string) => {
    setJoinedCampaignCode(inviteCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arcane_player_campaign', inviteCode);
    }
    const memberPayload = characterToPartyMember(character, ac);
    // DM'in ekranına canlı üye olarak yayınla
    syncService.broadcast({
      type: 'MEMBER_JOIN',
      campaignId: inviteCode,
      senderRole: 'player',
      payload: memberPayload,
      timestamp: new Date().toISOString(),
    });
  };

  // Oyuncu bir sefere katılmışsa ve statlarında/seviyesinde/canında değişiklik olursa DM ekranına otomatik senkronize et
  useEffect(() => {
    if (!joinedCampaignCode) return;
    const memberPayload = characterToPartyMember(character, ac);
    syncService.broadcast({
      type: 'MEMBER_UPDATE',
      campaignId: joinedCampaignCode,
      senderRole: 'player',
      payload: memberPayload,
      timestamp: new Date().toISOString(),
    });
  }, [
    joinedCampaignCode,
    character.level,
    character.class,
    character.subclass,
    character.currentHp,
    character.maxHp,
    character.tempHp,
    character.baseAbilities,
    character.proficientSkills,
    character.activeConditions,
    ac,
  ]);

  // DM Encounter senkronizasyonu dinleyicisi
  useEffect(() => {
    const unsub = syncService.subscribe((event) => {
      if (event.type === 'ENCOUNTER_UPDATE' && event.payload) {
        if (event.payload.combatActive !== undefined) {
          setCombatMode(Boolean(event.payload.combatActive));
        }
        if (Array.isArray(event.payload.monsterTargets)) {
          setMonsterTargets(event.payload.monsterTargets);
        }
        if (
          event.payload.currentTurnName &&
          event.payload.currentTurnName.toLowerCase() === character.name.toLowerCase()
        ) {
          setActionUsed(false);
          setBonusActionUsed(false);
          setReactionUsed(false);
          setRemainingSpeed(baseSpeed);
          soundEffects.playCritSound();
          setQuickToast({
            text: `⚔️ Sıra Sende (${character.name})! Eylemlerini ve hareketini kullanabilirsin.`,
          });
          setTimeout(() => setQuickToast(null), 8000);
        }
      }
    });
    return unsub;
  }, [character.name]);

  const isSpellcaster =
    ['cleric', 'druid', 'wizard', 'sorcerer', 'warlock', 'bard', 'paladin', 'ranger'].includes(
      character.class.toLowerCase()
    ) || isCasterSubclass(character.subclass);

  // Kağıt Üzerinden Zar Atma (8 saniye ekranda kalır, net d20 ve modifikasyon)
  const rollCheck = (label: string, mod: number) => {
    soundEffects.playDiceRollSound();
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + mod;
    const isCrit = d20 === 20;
    const isFumble = d20 === 1;

    if (isCrit) soundEffects.playCritSound();

    const text = `${label}: d20 [${d20}] ${mod >= 0 ? `+ ${mod}` : `- ${Math.abs(mod)}`} = ${total}`;
    setQuickToast({ text, label, d20, mod, total, isCrit, isFumble });

    setTimeout(() => {
      setQuickToast((curr) => (curr?.text === text ? null : curr));
    }, 8000);

    syncService.broadcastDiceRoll({
      id: `check-${Date.now()}`,
      label: `${character.name} • ${label}`,
      diceRolls: [{ die: 'd20', value: d20, isCrit, isFumble }],
      modifier: mod,
      totalSum: total,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      formula: `1d20${mod >= 0 ? `+${mod}` : mod}`,
      hasCrit20: isCrit,
      hasFumble1: isFumble,
    });
  };

  // Hasar zarı animasyonlu atışı
  const handleAnimatedDamageRoll = (weapon: WeaponItem, abilityMod: number) => {
    soundEffects.playDiceRollSound();
    const wId = weapon.id;
    const defaultLabel = `${weapon.damage}+${abilityMod}`;

    setDamageAnimState((prev) => ({
      ...prev,
      [wId]: { isRolling: true, labelText: '🎲...', ghostVal: prev[wId]?.ghostVal ?? null },
    }));

    setTimeout(() => {
      const match = weapon.damage.match(/^(\d+)d(\d+)$/);
      let sum = abilityMod;
      const rolls: number[] = [];
      if (match) {
        const count = parseInt(match[1], 10);
        const sides = parseInt(match[2], 10);
        for (let i = 0; i < count; i++) {
          const r = Math.floor(Math.random() * sides) + 1;
          rolls.push(r);
          sum += r;
        }
      } else {
        sum += 4;
        rolls.push(4);
      }

      setDamageAnimState((prev) => ({
        ...prev,
        [wId]: { isRolling: false, labelText: `${sum}!`, ghostVal: prev[wId]?.ghostVal ?? null },
      }));

      setTimeout(() => {
        setDamageAnimState((prev) => ({
          ...prev,
          [wId]: { isRolling: false, labelText: defaultLabel, ghostVal: String(sum) },
        }));
      }, 1400);

      const formulaStr = `${weapon.damage}${abilityMod >= 0 ? `+${abilityMod}` : abilityMod}`;
      setQuickToast({
        text: `${weapon.name} Hasarı: [${rolls.join('+')}]${abilityMod >= 0 ? `+${abilityMod}` : abilityMod} = ${sum} (${weapon.damageType})`,
      });
      setTimeout(() => setQuickToast(null), 4000);

      syncService.broadcastDiceRoll({
        id: `dmg-${Date.now()}`,
        label: `${character.name} • ${weapon.name} Hasarı`,
        diceRolls: rolls.map((v) => ({ die: weapon.damage, value: v })),
        modifier: abilityMod,
        totalSum: sum,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formula: formulaStr,
      });
    }, 600);
  };

  // Envanterden kuşanma / çıkarma yapıldığında AC ve Silahları senkronize et
  const handleInventoryChange = (newInventory: ItemData[]) => {
    const equippedArmorItem = newInventory.find(
      (i) => i.equipped && i.type === 'armor'
    );

    let newArmor: ArmorItem | undefined = undefined;
    if (equippedArmorItem) {
      const lower = equippedArmorItem.name.toLowerCase();
      let type: 'light' | 'medium' | 'heavy' = 'light';
      let baseAc = 11;
      let maxDexBonus: number | undefined = undefined;

      if (lower.includes('plate') || lower.includes('chain mail') || lower.includes('splint') || lower.includes('ring mail')) {
        type = 'heavy';
        baseAc = lower.includes('plate') ? 18 : 16;
        maxDexBonus = 0;
      } else if (lower.includes('scale') || lower.includes('breastplate') || lower.includes('half plate') || lower.includes('hide')) {
        type = 'medium';
        baseAc = lower.includes('half') ? 15 : 14;
        maxDexBonus = 2;
      } else {
        type = 'light';
        baseAc = lower.includes('studded') ? 12 : 11;
      }

      newArmor = { name: equippedArmorItem.name, type, baseAc, maxDexBonus };
    }

    const hasShield = newInventory.some(
      (i) => i.equipped && (i.type === 'shield' || i.name.toLowerCase().includes('shield'))
    );

    const equippedWeapons = newInventory.filter(
      (i) => i.equipped && i.type === 'weapon'
    );

    const updatedWeapons = equippedWeapons.map((w) => {
      const lower = w.name.toLowerCase();
      let damage = '1d6';
      let damageType = 'slashing';
      let abilityUsed: AbilityName = 'str';

      if (lower.includes('greatsword') || lower.includes('maul')) {
        damage = '2d6';
      } else if (lower.includes('greataxe')) {
        damage = '1d12';
      } else if (lower.includes('longsword') || lower.includes('battleaxe')) {
        damage = '1d8';
      } else if (lower.includes('dagger')) {
        damage = '1d4';
        damageType = 'piercing';
        abilityUsed = 'dex';
      } else if (lower.includes('bow')) {
        damage = '1d8';
        damageType = 'piercing';
        abilityUsed = 'dex';
      }

      return {
        id: `inv-${w.slug}`,
        name: w.name,
        damage,
        damageType,
        properties: w.properties || [],
        range: lower.includes('bow') ? '80/320 ft' : '5 ft',
        abilityUsed,
      };
    });

    saveCharacter({
      ...character,
      inventory: newInventory,
      equippedArmor: newArmor,
      hasShield,
      weapons: updatedWeapons.length > 0 ? updatedWeapons : character.weapons,
    });
  };

  // İksir Kullanımı (Potion Usage) & Can Yenileme
  const handleUsePotion = (
    item: ItemData,
    healAmount: number,
    formula: string,
    rolls: number[]
  ) => {
    const newHp = Math.min(character.maxHp, character.currentHp + healAmount);
    if (!isDemo) {
      updateHp(newHp);
    }

    const toastMsg = `🧪 ${item.name} içildi! [${rolls.join(' + ')}] = +${healAmount} Can Yenilendi (${newHp}/${character.maxHp} HP)`;
    setQuickToast({
      text: toastMsg,
      total: healAmount,
    });
    setTimeout(() => {
      setQuickToast((curr) => (curr?.text === toastMsg ? null : curr));
    }, 8000);

    syncService.broadcastDiceRoll({
      id: `potion-${Date.now()}`,
      label: `${character.name} • ${item.name} Şifası`,
      diceRolls: rolls.map((v) => ({ die: 'd4', value: v })),
      modifier: 0,
      totalSum: healAmount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      formula,
    });
  };

  // Savaşçı: Second Wind
  const handleSecondWind = () => {
    soundEffects.playDiceRollSound();
    const roll = Math.floor(Math.random() * 10) + 1;
    const healAmount = roll + character.level;
    const nextHp = Math.min(character.maxHp, character.currentHp + healAmount);
    handleHpUpdate(nextHp);

    const text = `💨 İkinci Nefes (Second Wind): 1d10 (${roll}) + ${character.level} = +${healAmount} HP Kazandın!`;
    setQuickToast({ text });
    setTimeout(() => setQuickToast((curr) => (curr?.text === text ? null : curr)), 4500);
  };

  const handleHpUpdate = (newHp: number, newTemp?: number) => {
    if (isDemo) return;
    updateHp(newHp, newTemp);
  };

  const handleQuickHpAdjust = (delta: number, isHealing: boolean) => {
    const nextHp = isHealing
      ? Math.min(character.maxHp, character.currentHp + Math.abs(delta))
      : Math.max(0, character.currentHp - Math.abs(delta));
    handleHpUpdate(nextHp);
  };

  const handleApplyCustomHp = (isHealing: boolean) => {
    const val = parseInt(customHpInput, 10);
    if (!isNaN(val) && val > 0) {
      handleQuickHpAdjust(val, isHealing);
      setCustomHpInput('');
    }
  };

  const handleStatChange = (stat: keyof typeof character.baseAbilities, delta: number) => {
    if (isLocked || isDemo) return;
    const current = character.baseAbilities[stat];
    const next = Math.max(1, Math.min(30, current + delta));
    saveCharacter({
      ...character,
      baseAbilities: { ...character.baseAbilities, [stat]: next },
    });
  };

  // Dinlenme Aksiyonları
  const handleShortRest = () => {
    soundEffects.playDiceRollSound();
    const hitDieRoll = Math.floor(Math.random() * 10) + 1 + conMod;
    const nextHp = Math.min(character.maxHp, character.currentHp + Math.max(1, hitDieRoll));
    handleHpUpdate(nextHp);

    // Warlock Pact Magic slotları Kısa Dinlenmede tamamen dolar!
    if (character.class.toLowerCase() === 'warlock') {
      const resetWarlock = getSpellSlotsForLevel('warlock', character.level, character.subclass);
      setSpellSlots(resetWarlock);
    }

    setQuickToast({
      text: `🏕️ Kısa Dinlenme: 1 Can Zarı atıldı (+${hitDieRoll} HP).${character.class.toLowerCase() === 'warlock' ? ' Warlock büyü slotları tamamen doldu!' : ''} HP: ${nextHp}/${character.maxHp}`
    });
    setTimeout(() => setQuickToast(null), 4000);
  };

  const handleLongRest = () => {
    soundEffects.playCritSound();
    handleHpUpdate(character.maxHp, 0);

    // Uzun Dinlenmede tüm büyü slotları tamamen dolar!
    const resetAllSlots = getSpellSlotsForLevel(character.class, character.level, character.subclass);
    setSpellSlots(resetAllSlots);

    setQuickToast({ text: `🌅 Uzun Dinlenme: Tüm can puanları ve büyü yuvaları yenilendi! (${character.maxHp}/${character.maxHp} HP)` });
    setTimeout(() => setQuickToast(null), 4500);
  };

  return (
    <div id="modern-character-sheet-container" className="dndbeyond-sheet-container">
      {/* Sinematik Ölüm Eşiği (HP = 0) Modu */}
      <CinematicDeathSaves
        currentHp={character.currentHp}
        initialSuccesses={character.deathSaves?.successes ?? 0}
        initialFailures={character.deathSaves?.failures ?? 0}
        isDismissed={isDeathDismissed}
        onDismiss={() => setIsDeathDismissed(true)}
        onSavesChange={(s, f) => {
          if (!isDemo) updateDeathSaves(s, f);
        }}
        onRegainHp={(hp) => {
          if (!isDemo) updateHp(hp);
          setIsDeathDismissed(false);
        }}
      />

      {/* 0 HP Acil Durum / Ölüm Ekranına Dönüş Banner'ı */}
      <SheetEmergencyDeathBanner
        currentHp={character.currentHp}
        isDismissed={isDeathDismissed}
        successes={character.deathSaves?.successes ?? 0}
        failures={character.deathSaves?.failures ?? 0}
        onReopen={() => setIsDeathDismissed(false)}
      />

      {/* Demo Uyarısı */}
      {isDemo && (
        <div className="sheet-demo-banner" role="alert">
          ⚠️ Demo modu — Aktif karakter seçilmedi.{' '}
          <strong>Karakterlerim</strong> sekmesinden bir karakter seç veya yeni bir tane oluştur.
        </div>
      )}

      {/* Hızlı Zar Bildirim Banner'ı (D&D Beyond Toast Style - 8s) */}
      <SheetQuickToast toast={quickToast} onDismiss={() => setQuickToast(null)} />

      {/* 1. ÜST HEADER: Portre, Karakter kimliği, Dinlenme, Stat Kilidi & Sefere Katıl */}
      <SheetHeader
        character={character}
        combatMode={combatMode}
        onToggleCombatMode={() => setCombatMode(!combatMode)}
        onShortRest={handleShortRest}
        onLongRest={handleLongRest}
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        onJoinCampaign={handlePlayerJoinCampaign}
        joinedCampaignCode={joinedCampaignCode}
      />

      {/* 🛡️ AKTİF DURUMLAR & AVANTAJ / DEZAVANTAJ BANNER'I */}
      <StatusAdvantageBanner
        status={advantageStatus}
        onRemoveCondition={(condId: string) => {
          if (!isDemo) {
            const nextConditions = (character.activeConditions || []).filter(
              (c: string) => c.toLowerCase() !== condId.toLowerCase()
            );
            saveCharacter({ ...character, activeConditions: nextConditions });
          }
        }}
      />

      {/* 2. SAVAŞ & STAT ROZETLERİ BANDI */}
      <CombatHudRow
        character={character}
        speedPenalty={advantageStatus.speedPenalty}
        strMod={strMod}
        dexMod={dexMod}
        conMod={conMod}
        intMod={intMod}
        wisMod={wisMod}
        chaMod={chaMod}
        profBonus={profBonus}
        ac={ac}
        isLocked={isLocked}
        customHpInput={customHpInput}
        onChangeCustomHpInput={setCustomHpInput}
        onApplyCustomHp={handleApplyCustomHp}
        onStatChange={handleStatChange}
        onRollCheck={rollCheck}
        onUpdateInspiration={(count) => {
          if (!isDemo) updateInspiration(count);
        }}
      />

      {/* SAVAŞ MODU PANELİ (Eylemler, Bonus Action, Tepki ve Hareket Takibi) */}
      <CombatModePanel
        combatMode={combatMode}
        actionUsed={actionUsed}
        onToggleAction={() => setActionUsed(!actionUsed)}
        bonusActionUsed={bonusActionUsed}
        onToggleBonusAction={() => setBonusActionUsed(!bonusActionUsed)}
        reactionUsed={reactionUsed}
        onToggleReaction={() => setReactionUsed(!reactionUsed)}
        remainingSpeed={remainingSpeed}
        baseSpeed={baseSpeed}
        onSpendSpeed={(amt) => setRemainingSpeed((s) => Math.max(0, s - amt))}
        onResetSpeed={() => setRemainingSpeed(baseSpeed)}
        monsterTargets={monsterTargets}
        onEndTurn={() => {
          soundEffects.playDiceRollSound();
          setActionUsed(false);
          setBonusActionUsed(false);
          setReactionUsed(false);
          setRemainingSpeed(baseSpeed);
          setQuickToast({
            text: `🔄 Tur tamamlandı! Eylemler ve hareket (${baseSpeed} ft) tazelendi.`,
          });
          setTimeout(() => setQuickToast(null), 5000);
        }}
      />

      {/* 3. BENTO 3-COLUMN ANA GÖVDE */}
      <div className="dndbeyond-bento-grid">
        {/* SOL SÜTUN: KURTARMA ZARLARI, DUYULAR & USTALIKLAR */}
        <aside className="dndbeyond-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SavingThrowsCard
            character={character}
            strMod={strMod}
            dexMod={dexMod}
            conMod={conMod}
            intMod={intMod}
            wisMod={wisMod}
            chaMod={chaMod}
            profBonus={profBonus}
            onRollCheck={rollCheck}
          />

          <SensesCard
            passivePerception={passivePerception}
            passiveInvestigation={passiveInvestigation}
            passiveInsight={passiveInsight}
          />

          <ProficienciesCard />

          {/* Ölüm Kurtarma Zarları Widget'ı — YALNIZCA ÖLÜM EŞİĞİNDE (HP <= 0) GÖRÜNÜR */}
          {character.currentHp <= 0 && (
            <div className="dndbeyond-card" id="death-saves-card-container">
              <div className="dndbeyond-card-header">DEATH SAVES (Ölüm Zarları)</div>
              <DeathSaves
                currentHp={character.currentHp}
                initialSuccesses={character.deathSaves?.successes ?? 0}
                initialFailures={character.deathSaves?.failures ?? 0}
                onSavesChange={(s, f) => {
                  if (!isDemo) updateDeathSaves(s, f);
                }}
              />
            </div>
          )}
        </aside>

        {/* ORTA SÜTUN: ALFABETİK 18 BECERİ MATRİSİ */}
        <SkillsListCard
          character={character}
          strMod={strMod}
          dexMod={dexMod}
          conMod={conMod}
          intMod={intMod}
          wisMod={wisMod}
          chaMod={chaMod}
          profBonus={profBonus}
          onRollCheck={rollCheck}
        />

        {/* SAĞ SÜTUN: SEKMELER */}
        <main className="dndbeyond-right-col" id="sheet-tabs-main">
          <nav className="dndbeyond-pills-nav" id="dndbeyond-pills-tab-nav">
            <button
              id="tab-btn-actions"
              className={`dndbeyond-pill-tab ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              {t.tabActions}
            </button>
            <button
              id="tab-btn-inventory"
              className={`dndbeyond-pill-tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              {t.tabInventory} ({character.inventory?.length ?? 0})
            </button>
            <button
              id="tab-btn-spells"
              className={`dndbeyond-pill-tab ${activeTab === 'spells' ? 'active' : ''}`}
              onClick={() => setActiveTab('spells')}
            >
              {isSpellcaster ? t.tabSpells : t.tabFeatures}
            </button>
            <button
              id="tab-btn-features"
              className={`dndbeyond-pill-tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              {t.tabLevelUp}
            </button>
            <button
              id="tab-btn-background"
              className={`dndbeyond-pill-tab ${activeTab === 'background' ? 'active' : ''}`}
              onClick={() => setActiveTab('background')}
            >
              {t.tabBackground}
            </button>
            <button
              id="tab-btn-notes"
              className={`dndbeyond-pill-tab ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              {t.tabNotes}
            </button>
            <button
              id="tab-btn-conditions"
              className={`dndbeyond-pill-tab ${activeTab === 'conditions' ? 'active' : ''}`}
              onClick={() => setActiveTab('conditions')}
            >
              {t.tabConditions}
            </button>
          </nav>

          {/* 1. ACTIONS SEKMESİ */}
          {activeTab === 'actions' && (
            <ActionsTabContent
              weapons={character.weapons}
              strMod={strMod}
              dexMod={dexMod}
              profBonus={profBonus}
              damageAnimState={damageAnimState}
              actionSubPill={actionSubPill}
              onChangeActionSubPill={setActionSubPill}
              onRollCheck={rollCheck}
              onAnimatedDamageRoll={handleAnimatedDamageRoll}
              onOpenReference={openReference}
            />
          )}

          {/* 2. SPELLS / CLASS FEATURES SEKMESİ */}
          {activeTab === 'spells' && (
            <div id="tab-content-spells">
              {isSpellcaster ? (
                <Spellbook
                  level={character.level}
                  castingModifier={intMod}
                  charClass={character.class}
                  subclass={character.subclass}
                  initialSpellSlots={spellSlots}
                  onSpellSlotsChange={(updated) => setSpellSlots(updated)}
                />
              ) : (
                <FeaturesTabContent character={character} onSecondWind={handleSecondWind} />
              )}
            </div>
          )}

          {/* 3. INVENTORY SEKMESİ */}
          {activeTab === 'inventory' && (
            <div id="tab-content-inventory">
              <InventoryManager
                strScore={character.baseAbilities.str}
                charClass={character.class}
                inventory={character.inventory ?? []}
                currency={character.currency ?? { cp: 0, sp: 0, gp: 15 }}
                onCurrencyChange={(newCurr) => {
                  if (!isDemo) {
                    saveCharacter({ ...character, currency: newCurr });
                  }
                }}
                onInventoryChange={handleInventoryChange}
                onUsePotion={handleUsePotion}
              />
            </div>
          )}

          {/* 4. LEVEL UP & FEATURES SEKMESİ */}
          {activeTab === 'features' && (
            <div id="tab-content-features" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <LevelUpModal
                initialLevel={character.level}
                charClass={character.class}
                initialMaxHp={character.maxHp}
                conModifier={conMod}
                currentAbilities={character.baseAbilities}
                currentSubclass={character.subclass}
                currentFeats={character.feats}
                currentBackstory={character.backstory}
                onDetailedLevelUpApplied={(payload) => {
                  if (!isDemo) {
                    saveCharacter({
                      ...character,
                      level: payload.level,
                      maxHp: payload.maxHp,
                      currentHp: Math.min(character.currentHp, payload.maxHp),
                      subclass: payload.subclass || character.subclass,
                      baseAbilities: payload.abilities,
                      feats: payload.feats,
                      backstory: payload.backstory,
                    });
                  }
                }}
                onLevelUpApplied={(newLvl, newHp, subc) => {
                  if (!isDemo) {
                    saveCharacter({
                      ...character,
                      level: newLvl,
                      maxHp: newHp,
                      currentHp: Math.min(character.currentHp, newHp),
                      subclass: subc || character.subclass,
                    });
                  }
                }}
              />

              {/* Feats & Özellik Rozetleri */}
              {character.feats && character.feats.length > 0 && (
                <div className="dndbeyond-card">
                  <div className="dndbeyond-card-header">KAZANILAN HÜNERLER (FEATS)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {character.feats.map((f) => (
                      <span
                        key={f}
                        style={{
                          background: 'rgba(212, 175, 53, 0.2)',
                          border: '1px solid var(--border-gold)',
                          color: '#fef08a',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        ✦ {f.replace(/-/g, ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. BACKGROUND SEKMESİ */}
          {activeTab === 'background' && <BackgroundTabContent character={character} />}

          {/* 6. NOTES SEKMESİ */}
          {activeTab === 'notes' && <NotesTabContent />}

          {/* 7. CONDITIONS SEKMESİ */}
          {activeTab === 'conditions' && (
            <div id="tab-content-conditions">
              <ConditionsTracker
                activeConditions={character.activeConditions}
                onConditionsChange={(conds) => {
                  if (!isDemo) updateConditions(conds);
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

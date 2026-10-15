// =============================================================================
// MODERN CHARACTER SHEET V3 (REMASTERED — CRIMSON CITADEL / RED DARK)
// 21st.dev 'Red Dark' & D&D Beyond 1:1 Bento Dashboard
//
// MİMARİ:
// - Üst Bar: Portre, Karakter kimliği, Kısa/Uzun Dinlenme, Stat Kilidi
// - Yatay Bant: 6 Yetenek Skoru Rozeti (Modifikatör üstte, stat altta), AC, İnisiyatif, Hız, Can Barı
// - Sol Sütun (260px): Çift kolon Kurtarma Zarları, Duyular, Ustalıklar
// - Orta Sütun (300px): A-Z 18 Beceri Listesi (Arama filtreli, tıkla-at)
// - Sağ Sütun (1fr): D&D Beyond Pill Sekmeler (Actions, Inventory, Spells/Features, Background, Notes)
// =============================================================================

import React, { useState } from 'react';
import { calculateModifier } from '../rules/abilityScores';
import { calculateProficiencyBonus } from '../rules/proficiency';
import { SKILLS, calculateSkillModifier, calculatePassivePerception, calculatePassiveInvestigation } from '../rules/skills';
import { calculateArmorClass } from '../rules/armorClass';
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
import type { FullCharacter, AbilityName } from '../types/character';

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
  currentHp: 28,
  maxHp: 28,
  tempHp: 0,
  hitDiceAvailable: 3,
  spellSlots: {},
  activeConditions: [],
  deathSaves: { successes: 0, failures: 0 },
  ruleset: '2014',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

type SheetTab = 'actions' | 'spells' | 'inventory' | 'conditions' | 'features' | 'background' | 'notes';
type ActionSubPill = 'all' | 'attack' | 'action' | 'bonus' | 'reaction';

export const ModernCharacterSheet: React.FC = () => {
  const { activeCharacter, updateHp, updateConditions, updateDeathSaves, saveCharacter } = useCharacter();

  const character = activeCharacter ?? DEMO_CHARACTER;
  const isDemo = !activeCharacter;

  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<SheetTab>('actions');
  const [actionSubPill, setActionSubPill] = useState<ActionSubPill>('all');
  const [skillFilter, setSkillFilter] = useState<string>('');
  const [customHpInput, setCustomHpInput] = useState<string>('');

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

  const { openReference } = useReference();
  const [quickToast, setQuickToast] = useState<{ text: string; isCrit?: boolean; isFumble?: boolean } | null>(null);

  const isSpellcaster =
    ['cleric', 'druid', 'wizard', 'sorcerer', 'warlock', 'bard', 'paladin', 'ranger'].includes(character.class.toLowerCase()) ||
    isCasterSubclass(character.subclass);

  // Silah bazlı dönüştürmeli hasar zarı animasyonu state'i (2d6 -> 10 -> [10] 2d6)
  const [damageAnimState, setDamageAnimState] = useState<
    Record<string, { isRolling: boolean; labelText: string; ghostVal: string | null }>
  >({});

  // Doğrudan Kağıt Üzerinden Zar Atma (D&D Beyond tarzı tıkla-at)
  const rollCheck = (label: string, mod: number) => {
    soundEffects.playDiceRollSound();
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + mod;
    const isCrit = d20 === 20;
    const isFumble = d20 === 1;

    if (isCrit) soundEffects.playCritSound();

    const text = `${label}: d20 (${d20}) ${mod >= 0 ? `+ ${mod}` : `- ${Math.abs(mod)}`} = ${total}`;
    setQuickToast({ text, isCrit, isFumble });

    setTimeout(() => {
      setQuickToast((curr) => (curr?.text === text ? null : curr));
    }, 4000);

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
  const handleAnimatedDamageRoll = (weapon: import('../types/character').WeaponItem, abilityMod: number) => {
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
  const handleInventoryChange = (newInventory: import('../types/content').ItemData[]) => {
    const equippedArmorItem = newInventory.find(
      (i) => i.equipped && (i.type === 'armor' || i.type === 'shield')
    );

    let newArmor = character.equippedArmor;
    if (equippedArmorItem && equippedArmorItem.type === 'armor') {
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

  // Second Wind
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
    setQuickToast({ text: `🏕️ Kısa Dinlenme: 1 Can Zarı atıldı (+${hitDieRoll} HP). HP: ${nextHp}/${character.maxHp}` });
    setTimeout(() => setQuickToast(null), 4000);
  };

  const handleLongRest = () => {
    soundEffects.playCritSound();
    handleHpUpdate(character.maxHp, 0);
    setQuickToast({ text: `🌅 Uzun Dinlenme: Tüm can puanları ve yetenekler yenilendi! (${character.maxHp}/${character.maxHp} HP)` });
    setTimeout(() => setQuickToast(null), 4500);
  };

  // Filtrelenmiş Beceriler
  const filteredSkills = SKILLS.filter(
    (sk) =>
      sk.nameTr.toLowerCase().includes(skillFilter.toLowerCase()) ||
      sk.name.toLowerCase().includes(skillFilter.toLowerCase())
  );

  return (
    <div id="modern-character-sheet-container" className="dndbeyond-sheet-container">
      {/* Sinematik Ölüm Eşiği (HP = 0) Modu */}
      <CinematicDeathSaves
        currentHp={character.currentHp}
        initialSuccesses={character.deathSaves?.successes ?? 0}
        initialFailures={character.deathSaves?.failures ?? 0}
        onSavesChange={(s, f) => {
          if (!isDemo) updateDeathSaves(s, f);
        }}
        onRegainHp={(hp) => {
          if (!isDemo) updateHp(hp);
        }}
      />

      {/* Demo Uyarısı */}
      {isDemo && (
        <div className="sheet-demo-banner" role="alert">
          ⚠️ Demo modu — Aktif karakter seçilmedi.{' '}
          <strong>Karakterlerim</strong> sekmesinden bir karakter seç veya yeni bir tane oluştur.
        </div>
      )}

      {/* Hızlı Zar Bildirim Banner'ı (D&D Beyond Toast Style) */}
      {quickToast && (
        <div
          className={`sheet-quick-toast ${quickToast.isCrit ? 'crit' : ''} ${quickToast.isFumble ? 'fumble' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className="toast-icon">{quickToast.isCrit ? '🌟' : quickToast.isFumble ? '💀' : '🎲'}</span>
          <span className="toast-text">{quickToast.text}</span>
          <button className="toast-dismiss" onClick={() => setQuickToast(null)}>✕</button>
        </div>
      )}

      {/* 1. ÜST BAR: PORTRE, KİMLİK & DİNLENME BUTONLARI */}
      <header className="dndbeyond-top-bar">
        <div className="dndbeyond-avatar-name">
          <div className="dndbeyond-avatar-circle font-cinzel">
            {character.name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 className="font-cinzel" style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.4rem' }}>
                {character.name}
              </h2>
              {character.subclass && (
                <span style={{ fontSize: '0.78rem', background: 'rgba(212, 175, 53, 0.15)', color: 'var(--accent-gold)', border: '1px solid var(--border-gold)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {character.subclass}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {character.race} • {character.class.toUpperCase()} Seviye {character.level} • {character.background}
              {character.playerName && ` • 👤 ${character.playerName}`}
            </div>
          </div>
        </div>

        {/* Sağ Kısım: Kısa / Uzun Dinlenme ve Stat Kilidi */}
        <div className="dndbeyond-rest-btn-group">
          <button
            className="dndbeyond-rest-btn"
            onClick={handleShortRest}
            title="Kısa Dinlenme (Can zarı harca)"
          >
            ⛺ SHORT REST
          </button>
          <button
            className="dndbeyond-rest-btn"
            onClick={handleLongRest}
            title="Uzun Dinlenme (Tüm canı yenile)"
          >
            🌙 LONG REST
          </button>
          <button
            id="btn-toggle-stat-lock"
            className="dndbeyond-rest-btn"
            onClick={() => setIsLocked(!isLocked)}
            title={isLocked ? 'Statlar kilitli' : 'Stat düzenleme modu açık'}
          >
            {isLocked ? '🔒 Kilitli' : '🔓 Duzenle'}
          </button>
        </div>
      </header>

      {/* 2. YATAY BANT: 6 YETENEK SKORU KARTI & SAVAŞ GÖSTERGELERİ */}
      <section className="dndbeyond-hud-row">
        {/* 6'lı Yetenek Skorları Bandı (Modifikatör üstte büyük, skor altta rozette) */}
        <div className="dndbeyond-abilities-band" id="ability-scores-column">
          {[
            { id: 'str' as const, label: 'STRENGTH', name: 'Güç', val: character.baseAbilities.str, mod: strMod },
            { id: 'dex' as const, label: 'DEXTERITY', name: 'Çeviklik', val: character.baseAbilities.dex, mod: dexMod },
            { id: 'con' as const, label: 'CONSTITUTION', name: 'Dayanıklılık', val: character.baseAbilities.con, mod: conMod },
            { id: 'int' as const, label: 'INTELLIGENCE', name: 'Zeka', val: character.baseAbilities.int, mod: intMod },
            { id: 'wis' as const, label: 'WISDOM', name: 'Bilgelik', val: character.baseAbilities.wis, mod: wisMod },
            { id: 'cha' as const, label: 'CHARISMA', name: 'Karizma', val: character.baseAbilities.cha, mod: chaMod }
          ].map((st) => (
            <div
              key={st.id}
              className="dndbeyond-stat-badge"
              id={`ability-box-${st.id}`}
              onClick={() => rollCheck(`${st.name} (${st.label}) Kontrolü`, st.mod)}
              title={`${st.name} Zarı At (1d20+${st.mod})`}
            >
              <span className="dndbeyond-stat-label">{st.label.slice(0, 3)}</span>
              <span className="dndbeyond-stat-mod">
                {st.mod >= 0 ? `+${st.mod}` : st.mod}
              </span>
              <span className="dndbeyond-stat-score-pill">{st.val}</span>
              {!isLocked && (
                <div className="unlocked-stat-stepper" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleStatChange(st.id, -1)}>-</button>
                  <button onClick={() => handleStatChange(st.id, +1)}>+</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Savaş Göstergeleri: Ustalık, Hız, İnisiyatif, AC, Can Barı */}
        <div className="dndbeyond-combat-hud-group">
          {/* Ustalık Bonusu */}
          <div className="dndbeyond-hud-box">
            <span className="dndbeyond-stat-label">PROFICIENCY</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              +{profBonus}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>BONUS</span>
          </div>

          {/* Yürüme Hızı */}
          <div className="dndbeyond-hud-box">
            <span className="dndbeyond-stat-label">SPEED</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              30 <span style={{ fontSize: '0.8rem' }}>ft</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>WALKING</span>
          </div>

          {/* İnisiyatif (Elmas Şekli) */}
          <div
            className="dndbeyond-hud-box"
            onClick={() => rollCheck('İnisiyatif', dexMod)}
            style={{ cursor: 'pointer', border: '1px solid rgba(212, 175, 53, 0.4)' }}
            title="İnisiyatif Zarı At (1d20+DEX)"
          >
            <span className="dndbeyond-stat-label">INITIATIVE</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
              {dexMod >= 0 ? `+${dexMod}` : dexMod}
            </span>
          </div>

          {/* Zırh Sınıfı (Kalkan Şekli) */}
          <div className="dndbeyond-hud-box" style={{ border: '1px solid rgba(200, 30, 30, 0.4)' }}>
            <span className="dndbeyond-stat-label">ARMOR CLASS</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff' }} id="sheet-ac-val">
              🛡️ {ac}
            </span>
          </div>

          {/* Can Puanı Modülü (HEAL / DAMAGE Butonları & Can) */}
          <div className="dndbeyond-hp-module">
            <div className="dndbeyond-hp-btn-col">
              <button
                className="dndbeyond-hp-mini-btn heal"
                onClick={() => handleApplyCustomHp(true)}
                title="Can Ver"
              >
                HEAL
              </button>
              <input
                type="number"
                placeholder="±"
                value={customHpInput}
                onChange={(e) => setCustomHpInput(e.target.value)}
                style={{ width: '42px', padding: '0.1rem', fontSize: '0.75rem', background: '#090d16', border: '1px solid #334155', color: '#fff', borderRadius: '3px', textAlign: 'center' }}
              />
              <button
                className="dndbeyond-hp-mini-btn damage"
                onClick={() => handleApplyCustomHp(false)}
                title="Hasar Ver"
              >
                DMG
              </button>
            </div>

            <div>
              <span className="dndbeyond-stat-label" style={{ display: 'block', marginBottom: '0.15rem' }}>HIT POINTS</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <strong style={{ fontSize: '1.35rem', color: character.currentHp <= 5 ? '#ef4444' : '#22c55e' }}>
                  {character.currentHp}
                </strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ {character.maxHp}</span>
                {character.tempHp > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>(+{character.tempHp})</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENTO 3-COLUMN ANA GÖVDE (Nielsen #8 & D&D Beyond Layout) */}
      <div className="dndbeyond-bento-grid">
        
        {/* =========================================================================
            SOL SÜTUN: KURTARMA ZARLARI, DUYULAR & USTALIKLAR
            ========================================================================= */}
        <aside className="dndbeyond-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Kurtarma Zarları (Saving Throws) — 2 Sütunlu Grid */}
          <div className="dndbeyond-card">
            <div className="dndbeyond-card-header">SAVING THROWS (Kurtarma Zarları)</div>
            <div className="saving-throws-grid-2col">
              {[
                { id: 'str', label: 'STR', name: 'Güç', mod: strMod },
                { id: 'int', label: 'INT', name: 'Zeka', mod: intMod },
                { id: 'dex', label: 'DEX', name: 'Çeviklik', mod: dexMod },
                { id: 'wis', label: 'WIS', name: 'Bilgelik', mod: wisMod },
                { id: 'con', label: 'CON', name: 'Dayanıklılık', mod: conMod },
                { id: 'cha', label: 'CHA', name: 'Karizma', mod: chaMod },
              ].map((st) => {
                const isProf = character.proficientSavingThrows.includes(st.id);
                const totalSaveMod = isProf ? st.mod + profBonus : st.mod;

                return (
                  <div
                    key={st.id}
                    className={`saving-throw-item ${isProf ? 'proficient' : ''}`}
                    onClick={() => rollCheck(`${st.name} (${st.label}) Kurtarma Zarı`, totalSaveMod)}
                    title={`${st.name} Kurtarma Zarı At`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="st-dot">{isProf ? '●' : '○'}</span>
                      <span style={{ fontWeight: isProf ? 800 : 500 }}>{st.label}</span>
                    </div>
                    <strong style={{ color: isProf ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                      {totalSaveMod >= 0 ? `+${totalSaveMod}` : totalSaveMod}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duyular (Senses) */}
          <div className="dndbeyond-card" id="passive-senses-box">
            <div className="dndbeyond-card-header">SENSES (Duyular & Algı)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Passive Perception:</span>
                <strong style={{ color: 'var(--accent-gold)' }} id="val-passive-perception">{passivePerception}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Passive Investigation:</span>
                <strong style={{ color: 'var(--accent-gold)' }} id="val-passive-investigation">{passiveInvestigation}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Passive Insight:</span>
                <strong style={{ color: 'var(--accent-gold)' }}>{passiveInsight}</strong>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                🌙 Darkvision: 60 ft.
              </div>
            </div>
          </div>

          {/* Ustalıklar (Proficiencies) */}
          <div className="dndbeyond-card">
            <div className="dndbeyond-card-header">PROFICIENCIES (Eğitimler)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Armor:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>Light, Medium, Shields</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Weapons:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>Simple Weapons, Martial Weapons</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Languages:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>Common, Elvish / Dwarvish</span>
              </div>
            </div>
          </div>

          {/* Ölüm Kurtarma Zarları Widget'ı */}
          <div className="dndbeyond-card">
            <div className="dndbeyond-card-header">DEATH SAVES</div>
            <DeathSaves
              currentHp={character.currentHp}
              initialSuccesses={character.deathSaves?.successes ?? 0}
              initialFailures={character.deathSaves?.failures ?? 0}
              onSavesChange={(s, f) => {
                if (!isDemo) updateDeathSaves(s, f);
              }}
            />
          </div>

        </aside>

        {/* =========================================================================
            ORTA SÜTUN: ALFABETİK 18 BECERİ MATRİSİ (A-Z SKILLS TABLE)
            ========================================================================= */}
        <section className="dndbeyond-middle-col">
          <div className="dndbeyond-card" id="skills-list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="dndbeyond-card-header" style={{ border: 'none', padding: 0, margin: 0 }}>
                SKILLS (Beceriler)
              </div>
              <input
                type="text"
                placeholder="Ara..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                style={{ width: '80px', padding: '0.15rem 0.4rem', fontSize: '0.72rem', background: '#0a0d16', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
              />
            </div>

            <div className="skills-bento-table" style={{ marginTop: '0.4rem' }}>
              {filteredSkills.map((sk) => {
                const isProf = character.proficientSkills.includes(sk.id);
                const modVal = sk.ability === 'str' ? strMod
                  : sk.ability === 'dex' ? dexMod
                  : sk.ability === 'con' ? conMod
                  : sk.ability === 'int' ? intMod
                  : sk.ability === 'wis' ? wisMod : chaMod;

                const totalMod = calculateSkillModifier(modVal, isProf, profBonus);

                return (
                  <div
                    key={sk.id}
                    className={`skill-bento-row ${isProf ? 'proficient' : ''}`}
                    onClick={() => rollCheck(`${sk.nameTr} (${sk.name}) Kontrolü`, totalMod)}
                    title={`${sk.nameTr} Zarı At (1d20 ${totalMod >= 0 ? `+${totalMod}` : totalMod})`}
                  >
                    <span className="skill-bento-dot">{isProf ? '●' : '○'}</span>
                    <span className="skill-bento-mod-tag">{sk.ability.toUpperCase()}</span>
                    <span className="skill-bento-name">{sk.nameTr}</span>
                    <span className="skill-bento-bonus">
                      {totalMod >= 0 ? `+${totalMod}` : totalMod}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SAĞ SÜTUN: D&D BEYOND SEAN0205 PILL TABS & İÇERİK ALANI
            ========================================================================= */}
        <main className="dndbeyond-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* 21st.dev / sean0205 Tabs Pill Navigasyon Çubuğu */}
          <nav className="dndbeyond-pill-tabs-nav" role="tablist">
            <button
              id="tab-btn-actions"
              className={`dndbeyond-pill-tab ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              ⚔️ ACTIONS
            </button>
            <button
              id="tab-btn-inventory"
              className={`dndbeyond-pill-tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              🎒 INVENTORY ({character.inventory?.length ?? 0})
            </button>
            {isSpellcaster ? (
              <button
                id="tab-btn-spells"
                className={`dndbeyond-pill-tab ${activeTab === 'spells' ? 'active' : ''}`}
                onClick={() => setActiveTab('spells')}
              >
                📜 SPELLS
              </button>
            ) : (
              <button
                id="tab-btn-spells"
                className={`dndbeyond-pill-tab ${activeTab === 'spells' ? 'active' : ''}`}
                onClick={() => setActiveTab('spells')}
              >
                ⚡ FEATURES
              </button>
            )}
            <button
              id="tab-btn-features"
              className={`dndbeyond-pill-tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              🏆 LEVEL UP
            </button>
            <button
              id="tab-btn-background"
              className={`dndbeyond-pill-tab ${activeTab === 'background' ? 'active' : ''}`}
              onClick={() => setActiveTab('background')}
            >
              📜 BACKGROUND
            </button>
            <button
              id="tab-btn-notes"
              className={`dndbeyond-pill-tab ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              📝 NOTES
            </button>
            <button
              id="tab-btn-conditions"
              className={`dndbeyond-pill-tab ${activeTab === 'conditions' ? 'active' : ''}`}
              onClick={() => setActiveTab('conditions')}
            >
              ⚡ DURUMLAR
            </button>
          </nav>

          {/* 1. ACTIONS SEKMESİ (D&D Beyond 1:1 Attacks Table & Combat Actions) */}
          {activeTab === 'actions' && (
            <div id="tab-content-actions" className="dndbeyond-card">
              {/* Alt Filtre Hapları */}
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {(['all', 'attack', 'action', 'bonus', 'reaction'] as ActionSubPill[]).map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setActionSubPill(pill)}
                    style={{
                      background: actionSubPill === pill ? 'var(--accent-red)' : 'rgba(255,255,255,0.05)',
                      color: actionSubPill === pill ? '#fff' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {pill.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Attacks Tablosu */}
              <div style={{ overflowX: 'auto' }}>
                <table className="attacks-bento-table">
                  <thead>
                    <tr>
                      <th>ATTACK</th>
                      <th>RANGE</th>
                      <th>HIT / DC</th>
                      <th>DAMAGE</th>
                      <th>NOTES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {character.weapons.map((w) => {
                      const abilityMod = w.abilityUsed === 'str' ? strMod : dexMod;
                      const toHitMod = abilityMod + profBonus;
                      const anim = damageAnimState[w.id];

                      return (
                        <tr key={w.id}>
                          <td>
                            <strong
                              style={{ color: 'var(--text-primary)', display: 'block', cursor: 'pointer' }}
                              onClick={() => openReference({
                                type: 'item',
                                data: {
                                  slug: w.id,
                                  name: w.name,
                                  type: 'weapon',
                                  cost: '15 gp',
                                  weight: 3,
                                  description: `${w.damage} ${w.damageType}. Özellikler: ${w.properties?.join(', ') || 'Standard'}. Menzil: ${w.range ?? '5 ft'}.`,
                                  quantity: 1,
                                  source: 'PHB',
                                  source_ref: 'PHB',
                                  license: 'OGL'
                                }
                              })}
                              title="Detayları İncele (Reference Drawer)"
                            >
                              {w.name}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Melee Weapon • Mastery</span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{w.range ?? '5 ft'}</td>
                          <td>
                            <button
                              id={`btn-attack-${w.id}`}
                              className="dndbeyond-attack-box-btn"
                              onClick={() => rollCheck(`${w.name} Saldırısı`, toHitMod)}
                              title="1d20+Bonus ile Saldırı Yap"
                            >
                              {toHitMod >= 0 ? `+${toHitMod}` : toHitMod}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <button
                                id={`btn-damage-${w.id}`}
                                className={`dndbeyond-attack-box-btn damage-active-btn ${anim?.isRolling ? 'rolling' : ''}`}
                                style={{ background: 'rgba(200, 30, 30, 0.25)', borderColor: 'var(--accent-red)' }}
                                onClick={() => handleAnimatedDamageRoll(w, abilityMod)}
                                disabled={anim?.isRolling}
                                title="Hasar Zarı At"
                              >
                                💥 {anim?.labelText || `${w.damage}+${abilityMod}`}
                              </button>
                              {anim?.ghostVal && (
                                <span className="damage-prev-result-ghost">
                                  [{anim.ghostVal}]
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {w.properties?.join(', ') || 'Standard'} • {w.damageType}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Dövüş İçi Standart Eylemler (Actions in Combat) */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-gold)' }}>ACTIONS IN COMBAT</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.3rem 0' }}>
                  Attack, Dash, Disengage, Dodge, Grapple, Help, Hide, Improvise, Influence, Ready, Search, Shove, Study, Utilize.
                </p>
              </div>
            </div>
          )}

          {/* 2. SPELLS / CLASS FEATURES SEKMESİ */}
          {activeTab === 'spells' && (
            <div id="tab-content-spells">
              {isSpellcaster ? (
                <Spellbook level={character.level} castingModifier={intMod} />
              ) : (
                <div className="dndbeyond-card">
                  <div className="dndbeyond-card-header">SAVAŞÇI YETENEKLERİ (CLASS FEATURES)</div>
                  
                  {/* Second Wind */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-gold)', borderRadius: '8px', padding: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--accent-gold)' }}>💨 İkinci Nefes (Second Wind)</strong>
                      <button
                        id="btn-second-wind-action"
                        className="dndbeyond-attack-box-btn"
                        style={{ background: '#16a34a', borderColor: '#22c55e', color: '#fff' }}
                        onClick={handleSecondWind}
                      >
                        ❤️ 1d10 + {character.level} İyileş
                      </button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0' }}>
                      Bonus eylem olarak 1d10 + Savaşçı seviyen kadar can yenilersin. Kısa veya uzun dinlenmede dolar.
                    </p>
                  </div>

                  {/* Action Surge */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.85rem' }}>
                    <strong style={{ color: '#fff' }}>⚡ Eylem Akışı (Action Surge)</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0' }}>
                      Kendi turunda fazladan 1 Eylem (Action) hakkı kazanırsın. Kısa veya uzun dinlenmede yenilenir.
                    </p>
                  </div>

                  {/* Rage (Barbar ise) */}
                  {character.class.toLowerCase() === 'barbarian' && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-red)', borderRadius: '8px', padding: '0.85rem' }}>
                      <strong style={{ color: 'var(--accent-red)' }}>🔥 Öfke (Rage)</strong>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.3rem' }}>
                        <span>Kullanım:</span>
                        <input type="checkbox" />
                        <input type="checkbox" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ Long Rest</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. INVENTORY SEKMESİ */}
          {activeTab === 'inventory' && (
            <div id="tab-content-inventory">
              <InventoryManager
                strScore={character.baseAbilities.str}
                inventory={character.inventory}
                onInventoryChange={handleInventoryChange}
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
                      <span key={f} style={{ background: 'rgba(212, 175, 53, 0.2)', border: '1px solid var(--border-gold)', color: '#fef08a', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                        ✦ {f.replace(/-/g, ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. BACKGROUND SEKMESİ */}
          {activeTab === 'background' && (
            <div className="dndbeyond-card">
              <div className="dndbeyond-card-header">BACKGROUND & CHARACTERISTICS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px' }}>
                <div><strong>Geçmiş:</strong> {character.background}</div>
                <div><strong>Irk / Tür:</strong> {character.race}</div>
                <div><strong>Boyut:</strong> Medium</div>
                <div><strong>Hizalanma:</strong> Neutral Good</div>
                <div><strong>Gözler:</strong> Kahverengi</div>
                <div><strong>Saç:</strong> Kızıl / Sakallı</div>
              </div>

              {character.backstory ? (
                <div style={{ marginTop: '0.6rem' }}>
                  <strong>Karakter Hikayesi:</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.3rem' }}>
                    {character.backstory}
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Karakter geçmişi henüz yazılmadı. Seviye atlama ekranından ekleyebilirsiniz.
                </p>
              )}
            </div>
          )}

          {/* 6. NOTES SEKMESİ */}
          {activeTab === 'notes' && (
            <div className="dndbeyond-card">
              <div className="dndbeyond-card-header">CAMPAIGN & ADVENTURE NOTES</div>
              <textarea
                placeholder="Önemli NPC'ler, harita konumları, görevler ve ganimet notları..."
                rows={8}
                style={{
                  width: '100%',
                  background: 'rgba(10, 13, 22, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.6rem',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          )}

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

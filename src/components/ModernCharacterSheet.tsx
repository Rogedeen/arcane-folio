// =============================================================================
// MODERN CHARACTER SHEET V3
// Artık CharacterContext'ten besleniyor — aktif karakter otomatik yükleniyor.
// LocalStorage ile kalıcı, HP/condition değişiklikleri anında kaydediliyor.
// =============================================================================

import React, { useState } from 'react';
import { calculateModifier } from '../rules/abilityScores';
import { calculateProficiencyBonus } from '../rules/proficiency';
import { SKILLS, calculateSkillModifier, calculatePassivePerception, calculatePassiveInvestigation } from '../rules/skills';
import { calculateArmorClass } from '../rules/armorClass';
import { ResourceTracker } from './ResourceTracker';
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
import type { FullCharacter } from '../types/character';
import type { CharacterClass } from '../types/character';

// Default karakter — sadece aktif karakter yoksa gösterilir
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

export const ModernCharacterSheet: React.FC = () => {
  const { activeCharacter, updateHp, updateConditions, updateDeathSaves, saveCharacter } = useCharacter();

  // Aktif karakter yoksa demo karakteri göster
  const character = activeCharacter ?? DEMO_CHARACTER;
  const isDemo = !activeCharacter;

  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'actions' | 'spells' | 'inventory' | 'conditions' | 'features'>('actions');

  const profBonus = calculateProficiencyBonus(character.level);

  const strMod = calculateModifier(character.baseAbilities.str);
  const dexMod = calculateModifier(character.baseAbilities.dex);
  const conMod = calculateModifier(character.baseAbilities.con);
  const intMod = calculateModifier(character.baseAbilities.int);
  const wisMod = calculateModifier(character.baseAbilities.wis);
  const chaMod = calculateModifier(character.baseAbilities.cha);

  // Irk bonuslarını da hesaba kat (basit yaklaşım — character.rules.character'dan import edilebilir)
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

  // Zırh sınıfı (equipped armor'dan)
  const ac = calculateArmorClass({
    charClass: character.class as CharacterClass,
    dexModifier: dexMod,
    conModifier: conMod,
    wisModifier: wisMod,
    armor: character.equippedArmor,
    hasShield: character.hasShield,
  });

  const { openReference } = useReference();
  const [quickToast, setQuickToast] = useState<{ text: string; isCrit?: boolean; isFumble?: boolean } | null>(null);

  // Büyücü sınıfı mı kontrolü (Fighter/Barbarian/Rogue gibi sınıflara boş büyü sekmesi gösterme)
  const isSpellcaster =
    ['cleric', 'druid', 'wizard', 'sorcerer', 'warlock', 'bard', 'paladin', 'ranger'].includes(character.class) ||
    Boolean(character.subclass?.toLowerCase().includes('eldritch')) ||
    Boolean(character.subclass?.toLowerCase().includes('arcane'));

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

    // Senkronize et
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

  // Hasar zarı animasyonlu atışı: 2d6 -> dönüyor -> 10 -> yana kayıp silik [10] durur, buton 2d6 olur
  const handleAnimatedDamageRoll = (weapon: import('../types/character').WeaponItem, abilityMod: number) => {
    soundEffects.playDiceRollSound();
    const wId = weapon.id;
    const defaultLabel = `${weapon.damage}+${abilityMod}`;

    // 1. Aşama: Zarlar dönüyor
    setDamageAnimState((prev) => ({
      ...prev,
      [wId]: { isRolling: true, labelText: '🎲...', ghostVal: prev[wId]?.ghostVal ?? null },
    }));

    setTimeout(() => {
      // Zar hesaplama
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
        rolls.push(4);
        sum += 4;
      }
      const totalVal = Math.max(1, sum);

      // 2. Aşama: Sayı belirdi (örn: 10!)
      setDamageAnimState((prev) => ({
        ...prev,
        [wId]: { isRolling: false, labelText: `${totalVal}!`, ghostVal: prev[wId]?.ghostVal ?? null },
      }));

      // 3. Aşama: 600ms sonra yana kayıp silik [10] olarak dursun, buton formüle dönsün
      setTimeout(() => {
        setDamageAnimState((prev) => ({
          ...prev,
          [wId]: { isRolling: false, labelText: defaultLabel, ghostVal: `${totalVal} ${weapon.damageType}` },
        }));
      }, 650);

      const text = `💥 ${weapon.name} Hasar: [${rolls.join('+')}] + ${abilityMod} = ${totalVal} ${weapon.damageType}`;
      setQuickToast({ text });
      setTimeout(() => setQuickToast((curr) => (curr?.text === text ? null : curr)), 4000);

      syncService.broadcastDiceRoll({
        id: `dmg-${Date.now()}`,
        label: `${character.name} • ${weapon.name} Hasarı`,
        diceRolls: rolls.map((v) => ({ die: 'd8', value: v })),
        modifier: abilityMod,
        totalSum: totalVal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formula: `${weapon.damage}+${abilityMod}`,
      });
    }, 400);
  };

  // Envanterden gelen kuşanılmış zırh / kalkan / silahları otomatik tespit et & AC'yi ve eylemleri güncelle
  const handleInventoryChange = (newInventory: import('../types/content').ItemData[]) => {
    if (isDemo) return;

    // Kuşanılan zırhı bul ve AC hesapla
    const equippedArmorItem = newInventory.find((i) => i.type === 'armor' && i.equipped);
    let newArmor: import('../types/character').ArmorItem | undefined = undefined;
    if (equippedArmorItem) {
      const lower = equippedArmorItem.name.toLowerCase();
      if (lower.includes('plate') || lower.includes('levha')) {
        newArmor = { name: equippedArmorItem.name, type: 'heavy', baseAc: 18, maxDexBonus: 0 };
      } else if (lower.includes('chain mail') || lower.includes('zincir')) {
        newArmor = { name: equippedArmorItem.name, type: 'heavy', baseAc: 16, maxDexBonus: 0 };
      } else if (lower.includes('breastplate') || lower.includes('scale') || lower.includes('göğüslük')) {
        newArmor = { name: equippedArmorItem.name, type: 'medium', baseAc: 14, maxDexBonus: 2 };
      } else {
        newArmor = { name: equippedArmorItem.name, type: 'light', baseAc: 12, maxDexBonus: undefined };
      }
    }

    // Kuşanılan kalkanı bul
    const hasShield = newInventory.some((i) => i.type === 'shield' && i.equipped);

    // Kuşanılan silahları bul ve Eylemler sekmesine ekle
    const equippedWeaponItems = newInventory.filter((i) => i.type === 'weapon' && i.equipped);
    const updatedWeapons: import('../types/character').WeaponItem[] = equippedWeaponItems.map((w) => {
      const lower = w.name.toLowerCase();
      const isFinesse = (w.properties || []).some((p) => p.toLowerCase().includes('finesse'));
      const abilityUsed = isFinesse && dexMod > strMod ? 'dex' : 'str';
      let damage = '1d8';
      let damageType = 'slashing';
      if (lower.includes('dagger') || lower.includes('hançer')) {
        damage = '1d4';
        damageType = 'piercing';
      } else if (lower.includes('greatsword') || lower.includes('çift el')) {
        damage = '2d6';
        damageType = 'slashing';
      } else if (lower.includes('bow') || lower.includes('yay')) {
        damage = '1d6';
        damageType = 'piercing';
      } else if (lower.includes('mace') || lower.includes('gürz')) {
        damage = '1d6';
        damageType = 'bludgeoning';
      }
      return {
        id: w.slug,
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

  // Fighter: Second Wind Yeteneği (1d10 + Seviye İyileş)
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

  // HP güncelleme — context'e yaz (otomatik localStorage)
  const handleHpUpdate = (newHp: number, newTemp?: number) => {
    if (isDemo) return;
    updateHp(newHp, newTemp);
  };

  // Stat değişikliği (kilit açıkken)
  const handleStatChange = (stat: keyof typeof character.baseAbilities, delta: number) => {
    if (isLocked || isDemo) return;
    const current = character.baseAbilities[stat];
    const next = Math.max(1, Math.min(30, current + delta));
    saveCharacter({
      ...character,
      baseAbilities: { ...character.baseAbilities, [stat]: next },
    });
  };

  return (
    <div id="modern-character-sheet-container" className="modern-sheet-root">
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

      {/* Demo uyarısı */}
      {isDemo && (
        <div className="sheet-demo-banner" role="alert">
          ⚠️ Demo modu — Aktif karakter seçilmedi.{' '}
          <strong>Karakterlerim</strong> sekmesinden bir karakter seç veya yeni bir tane oluştur.
        </div>
      )}

      {/* Hızlı Zar Atış Bildirimi */}
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

      {/* 1. ÜST BAŞLIK (Character Header Bar) */}
      <header className="sheet-top-header">
        <div className="char-identity-block">
          <div className="char-avatar font-cinzel" style={{
            background: `linear-gradient(135deg, var(--accent-amber), var(--accent-gold))`,
          }}>
            {character.name.charAt(0)}
          </div>
          <div>
            <h2 className="char-sheet-name font-cinzel">{character.name}</h2>
            <div className="char-sheet-meta">
              <span>Seviye {character.level} {character.class.toUpperCase()}</span>
              {character.subclass && <span className="subclass-tag">({character.subclass})</span>}
              <span>• {character.race}</span>
              <span>• {character.background}</span>
              {character.playerName && <span className="player-name-tag">👤 {character.playerName}</span>}
            </div>
          </div>
        </div>

        {/* Hızlı Savaş İstatistikleri & Kilit Butonu */}
        <div className="header-stats-group">
          <div className="stat-pill-box">
            <span className="pill-title">ZIRH SINIFI</span>
            <span className="pill-val" id="sheet-ac-val">🛡️ {ac}</span>
          </div>
          <div className="stat-pill-box">
            <span className="pill-title">INISIYATIF</span>
            <span className="pill-val">{dexMod >= 0 ? `+${dexMod}` : dexMod}</span>
          </div>
          <div className="stat-pill-box">
            <span className="pill-title">HIZ</span>
            <span className="pill-val">30 ft</span>
          </div>
          <div className="stat-pill-box">
            <span className="pill-title">USTALIK</span>
            <span className="pill-val">+{profBonus}</span>
          </div>

          {/* Stat Kilidi */}
          <button
            id="btn-toggle-stat-lock"
            className={`lock-toggle-btn ${isLocked ? 'locked' : 'unlocked'}`}
            onClick={() => setIsLocked(!isLocked)}
            aria-label="Stat Kilidini Değiştir"
            title={isLocked ? 'Statlar kilitli (Değiştirilemez)' : 'Stat düzenleme modu açık'}
          >
            {isLocked ? '🔒 Kilitli' : '🔓 Duzenle'}
          </button>
        </div>
      </header>

      {/* 2. ANA SAYFA GÖVDESİ (3 Sütunlu Ergonomik Düzen) */}
      <div className="sheet-main-layout">
        {/* SOL SÜTUN: 6 Ana Stat, Kurtarma Zarları, Pasif Algı/İnceleme ve Beceriler */}
        <aside className="sheet-left-column">
          {/* 6 Stat Kutusu */}
          <div className="ability-scores-column" id="ability-scores-column">
            {[
              { id: 'str' as const, label: 'STR', name: 'Guc', val: character.baseAbilities.str, mod: strMod },
              { id: 'dex' as const, label: 'DEX', name: 'Ceviklik', val: character.baseAbilities.dex, mod: dexMod },
              { id: 'con' as const, label: 'CON', name: 'Dayaniklilik', val: character.baseAbilities.con, mod: conMod },
              { id: 'int' as const, label: 'INT', name: 'Zeka', val: character.baseAbilities.int, mod: intMod },
              { id: 'wis' as const, label: 'WIS', name: 'Bilgelik', val: character.baseAbilities.wis, mod: wisMod },
              { id: 'cha' as const, label: 'CHA', name: 'Karizma', val: character.baseAbilities.cha, mod: chaMod }
            ].map((st) => (
              <div
                key={st.id}
                className="compact-ability-box"
                id={`ability-box-${st.id}`}
                onClick={() => rollCheck(`${st.name} (${st.label}) Kontrolü`, st.mod)}
                style={{ cursor: 'pointer' }}
                title="Zar At (1d20+Mod)"
              >
                <span className="ability-name">{st.label}</span>
                <span className="ability-modifier-large">
                  {st.mod >= 0 ? `+${st.mod}` : st.mod}
                </span>
                <span className="ability-raw-score">{st.val}</span>
                {!isLocked && (
                  <div className="unlocked-stat-stepper" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleStatChange(st.id, -1)}>-</button>
                    <button onClick={() => handleStatChange(st.id, +1)}>+</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pasif Algı & Pasif İnceleme */}
          <div className="passive-senses-box" id="passive-senses-box">
            <div className="passive-sense-row">
              <span className="sense-label">👁️ Pasif Algi (Perception):</span>
              <strong className="sense-val" id="val-passive-perception">{passivePerception}</strong>
            </div>
            <div className="passive-sense-row">
              <span className="sense-label">🔍 Pasif Inceleme (Investigation):</span>
              <strong className="sense-val" id="val-passive-investigation">{passiveInvestigation}</strong>
            </div>
          </div>

          {/* 18 Beceri Listesi (Skills) */}
          <div className="skills-scroll-box" id="skills-list-container">
            <div className="skills-box-title">BECERILER (Skills) — Tıkla Zar At</div>
            <div className="skills-table">
              {SKILLS.map((sk) => {
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
                    className={`skill-row ${isProf ? 'proficient' : ''}`}
                    onClick={() => rollCheck(`${sk.nameTr} (${sk.name}) Kontrolü`, totalMod)}
                    style={{ cursor: 'pointer' }}
                    title={`${sk.nameTr} Zarı At (1d20 ${totalMod >= 0 ? `+${totalMod}` : totalMod})`}
                  >
                    <span className="skill-prof-dot">{isProf ? '●' : '○'}</span>
                    <span className="skill-mod-badge">{totalMod >= 0 ? `+${totalMod}` : totalMod}</span>
                    <span className="skill-title">{sk.nameTr}</span>
                    <span className="skill-attr-tag">{sk.ability.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ORTA & SAĞ ALAN: Can, Ölüm Zarları ve Sekmeli Modüller */}
        <main className="sheet-center-column">
          {/* Can Takibi & Ölüm Kurtarma Zarları */}
          <div className="sheet-combat-bar">
            <ResourceTracker
              charClass={character.class as CharacterClass}
              level={character.level}
              maxHp={character.maxHp}
              conModifier={conMod}
              currentHp={character.currentHp}
              tempHp={character.tempHp}
              onHpChange={handleHpUpdate}
            />

            {/* Ölüm Kurtarma Zarları */}
            <DeathSaves
              currentHp={character.currentHp}
              initialSuccesses={character.deathSaves?.successes ?? 0}
              initialFailures={character.deathSaves?.failures ?? 0}
              onSavesChange={(s, f) => {
                if (!isDemo) updateDeathSaves(s, f);
              }}
            />
          </div>

          {/* Sekme Gezinme Çubuğu */}
          <nav className="sheet-tabs-nav" role="tablist">
            <button
              id="tab-btn-actions"
              className={`sheet-tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              ⚔️ Eylemler
            </button>
            {isSpellcaster ? (
              <button
                id="tab-btn-spells"
                className={`sheet-tab-btn ${activeTab === 'spells' ? 'active' : ''}`}
                onClick={() => setActiveTab('spells')}
              >
                📜 Büyüler
              </button>
            ) : (
              <button
                id="tab-btn-spells"
                className={`sheet-tab-btn ${activeTab === 'spells' ? 'active' : ''}`}
                onClick={() => setActiveTab('spells')}
              >
                ⚡ Sınıf Yetenekleri
              </button>
            )}
            <button
              id="tab-btn-inventory"
              className={`sheet-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              🎒 Envanter ({character.inventory?.length ?? 0})
            </button>
            <button
              id="tab-btn-conditions"
              className={`sheet-tab-btn ${activeTab === 'conditions' ? 'active' : ''}`}
              onClick={() => setActiveTab('conditions')}
            >
              ⚡ Durumlar
            </button>
            <button
              id="tab-btn-features"
              className={`sheet-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              🏆 Seviye Atlama
            </button>
          </nav>

          {/* Sekme İçerikleri */}
          <div className="sheet-tab-content-area">
            {activeTab === 'actions' && (
              <div className="actions-tab-view" id="tab-content-actions">
                <div className="weapon-cards-list">
                  {character.weapons.length === 0 ? (
                    <div className="empty-tab-hint">
                      <p>⚔️ Kuşanılmış silah bulunmuyor.</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <strong>Envanter</strong> sekmesinden bir silahı "Kuşan" butonuna basarak buraya ekleyebilirsin.
                      </p>
                    </div>
                  ) : (
                    character.weapons.map((weapon) => {
                      const abilityMod = weapon.abilityUsed === 'str' ? strMod : dexMod;
                      const toHitMod = abilityMod + profBonus;
                      const anim = damageAnimState[weapon.id];

                      return (
                        <div key={weapon.id} className="weapon-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4
                              className="font-cinzel"
                              style={{ color: 'var(--text-primary)', margin: 0, cursor: 'pointer' }}
                              onClick={() =>
                                openReference({
                                  type: 'item',
                                  data: {
                                    slug: weapon.id,
                                    name: weapon.name,
                                    type: 'weapon',
                                    cost: '—',
                                    weight: 3,
                                    description: `Hasar: ${weapon.damage} ${weapon.damageType}, Menzil: ${weapon.range || '5 ft'}, Nitelikler: ${weapon.properties.join(', ')}`,
                                    properties: weapon.properties,
                                    quantity: 1,
                                    source: 'Envanter',
                                    source_ref: 'Kuşanılmış Silah',
                                    license: 'SRD 5.1',
                                  },
                                })
                              }
                              title="Silah Detaylarını İncele"
                            >
                              ⚔️ {weapon.name}
                            </h4>
                            <span className="weapon-dmg-badge">
                              {weapon.damage} + {abilityMod} {weapon.damageType}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                            Saldırı Bonusu: <strong>+{toHitMod}</strong>
                            {' • '}Menzil: {weapon.range ?? '5 ft'}
                            {weapon.properties.length > 0 && ` • ${weapon.properties.join(', ')}`}
                          </div>
                          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', alignItems: 'center' }}>
                            <button
                              id={`btn-attack-${weapon.id}`}
                              className="action-button"
                              style={{ flex: 1, minHeight: '40px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                              onClick={() => rollCheck(`${weapon.name} Saldırısı`, toHitMod)}
                            >
                              🎯 Saldırı (1d20+{toHitMod})
                            </button>

                            {/* Dönüşümlü Hasar Butonu: 2d6 -> dönüyor -> 10 -> yana kayıp silik [10] */}
                            <div className="damage-btn-anim-wrapper" style={{ flex: 1 }}>
                              <button
                                id={`btn-damage-${weapon.id}`}
                                className={`action-button damage-active-btn ${anim?.isRolling ? 'rolling' : ''}`}
                                style={{
                                  width: '100%',
                                  minHeight: '40px',
                                  padding: '0.4rem 0.6rem',
                                  fontSize: '0.85rem',
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  borderColor: '#ef4444',
                                }}
                                onClick={() => handleAnimatedDamageRoll(weapon, abilityMod)}
                                disabled={anim?.isRolling}
                              >
                                💥 {anim?.labelText || `${weapon.damage}+${abilityMod}`}
                              </button>
                              {anim?.ghostVal && (
                                <span className="damage-prev-result-ghost" title="Son Atılan Hasar">
                                  [{anim.ghostVal}]
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Büyücüler için Büyü Kitabı, Savaşçılar için Sınıf Özellikleri */}
            {activeTab === 'spells' && (
              <div id="tab-content-spells">
                {isSpellcaster ? (
                  <Spellbook level={character.level} castingModifier={intMod} />
                ) : (
                  <div className="class-features-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'rgba(18, 26, 45, 0.7)', border: '1px solid var(--border-gold)', borderRadius: '16px', padding: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '1.25rem' }}>
                          💨 İkinci Nefes (Second Wind)
                        </h3>
                        <button
                          id="btn-second-wind-action"
                          className="action-button"
                          style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', borderColor: '#4ade80', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                          onClick={handleSecondWind}
                        >
                          ❤️ 1d10 + {character.level} İyileş
                        </button>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        Dövüşte kendi sınırlarını zorlayarak dayanıklılık kazanırsın. Bonus aksiyon olarak 1d10 + Savaşçı seviyen kadar can puanını geri kazanırsın. Kısa veya uzun dinlenmede yenilenir.
                      </p>
                    </div>

                    <div style={{ background: 'rgba(18, 26, 45, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.2rem' }}>
                      <h3 className="font-cinzel" style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.25rem' }}>
                        ⚡ Eylem Akışı (Action Surge)
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        Normal eylemine ek olarak bu turda 1 ilave eylem (Action) yapabilirsin. Kısa veya uzun dinlenmede yenilenir.
                      </p>
                    </div>

                    {character.subclass && (
                      <div style={{ background: 'rgba(18, 26, 45, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.2rem' }}>
                        <h3 className="font-cinzel" style={{ color: 'var(--accent-amber)', margin: '0 0 0.5rem', fontSize: '1.25rem' }}>
                          🛡️ Alt Sınıf: {character.subclass}
                        </h3>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                          Gelişmiş Kritik (Improved Critical): Silah saldırıların 19 veya 20 geldiğinde kritik vuruş sayılır!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Akıllı Envanter: Çantam vs Eşya Ekle (Kuşanılan Zırh AC'yi Günceller) */}
            {activeTab === 'inventory' && (
              <div id="tab-content-inventory">
                <InventoryManager
                  strScore={character.baseAbilities.str}
                  inventory={character.inventory}
                  onInventoryChange={handleInventoryChange}
                />
              </div>
            )}

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

            {activeTab === 'features' && (
              <div id="tab-content-features">
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

                {/* Karakter Hünerleri (Feats) & Arka Planı Listesi */}
                {(character.feats && character.feats.length > 0) && (
                  <div style={{ marginTop: '1.2rem', background: 'rgba(18, 26, 45, 0.7)', border: '1px solid var(--border-gold)', borderRadius: '16px', padding: '1.2rem' }}>
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 0.8rem', fontSize: '1.15rem' }}>
                      ⚡ Kazanılan Hünerler (Feats)
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {character.feats.map((featId) => (
                        <span
                          key={featId}
                          style={{
                            background: 'rgba(217, 119, 6, 0.2)',
                            border: '1px solid var(--accent-gold)',
                            color: '#fef08a',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.82rem',
                            fontWeight: 600
                          }}
                        >
                          ✦ {featId.replace(/-/g, ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {character.backstory && (
                  <div style={{ marginTop: '1rem', background: 'rgba(18, 26, 45, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.2rem' }}>
                    <h3 className="font-cinzel" style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.15rem' }}>
                      📜 Karakter Geçmişi & Hikayesi (Backstory)
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {character.backstory}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

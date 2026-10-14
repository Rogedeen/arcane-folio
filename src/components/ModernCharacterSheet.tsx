import React, { useState } from 'react';
import { calculateModifier } from '../rules/abilityScores';
import { calculateProficiencyBonus } from '../rules/proficiency';
import { SKILLS, calculateSkillModifier, calculatePassivePerception, calculatePassiveInvestigation } from '../rules/skills';
import { ResourceTracker } from './ResourceTracker';
import { InventoryManager } from './InventoryManager';
import { Spellbook } from './Spellbook';
import { ConditionsTracker } from './ConditionsTracker';
import { LevelUpModal } from './LevelUpModal';
import { DeathSaves } from './DeathSaves';
import { syncService } from '../data/syncService';

interface CharacterData {
  name: string;
  charClass: string;
  subclass?: string;
  level: number;
  race: string;
  background: string;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  maxHp: number;
  currentHp: number;
  ac: number;
  speed: number;
  proficientSkills: string[];
}

const DEFAULT_CHARACTER: CharacterData = {
  name: 'Kaelen Karaçekiç',
  charClass: 'fighter',
  subclass: 'Champion',
  level: 3,
  race: 'İnsan (Human)',
  background: 'Asker (Soldier)',
  stats: {
    str: 16,
    dex: 14,
    con: 14,
    int: 10,
    wis: 12,
    cha: 8
  },
  maxHp: 28,
  currentHp: 28,
  ac: 16,
  speed: 30,
  proficientSkills: ['athletics', 'intimidation', 'survival']
};

export const ModernCharacterSheet: React.FC = () => {
  const [character, setCharacter] = useState<CharacterData>(DEFAULT_CHARACTER);
  const [isLocked, setIsLocked] = useState<boolean>(true); // Madde 10: Stat Kilidi
  const [activeTab, setActiveTab] = useState<'actions' | 'spells' | 'inventory' | 'conditions' | 'features'>('actions');

  const profBonus = calculateProficiencyBonus(character.level);

  // Modifikatörler
  const strMod = calculateModifier(character.stats.str);
  const dexMod = calculateModifier(character.stats.dex);
  const conMod = calculateModifier(character.stats.con);
  const intMod = calculateModifier(character.stats.int);
  const wisMod = calculateModifier(character.stats.wis);
  const chaMod = calculateModifier(character.stats.cha);

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

  // Silah Saldırısı Zarı Tetikleme (Madde 3: skill / attack dice roller)
  const handleRollWeaponAttack = (weaponName: string, damageFormula: string) => {
    // Zar havuzuna gönder
    syncService.broadcast({
      type: 'PING',
      campaignId: 'camp-default',
      senderRole: 'player',
      payload: {
        rollRequest: {
          label: `${weaponName} (${damageFormula})`,
          pool: { d8: 1, d6: 0, d4: 0, d10: 0, d12: 0, d20: 0, d100: 0 },
          modifier: strMod
        }
      },
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div id="modern-character-sheet-container" className="modern-sheet-root">
      {/* 1. ÜST BAŞLIK (Character Header Bar) */}
      <header className="sheet-top-header">
        <div className="char-identity-block">
          <div className="char-avatar font-cinzel">
            {character.name.charAt(0)}
          </div>
          <div>
            <h2 className="char-sheet-name font-cinzel">{character.name}</h2>
            <div className="char-sheet-meta">
              <span>Seviye {character.level} {character.charClass.toUpperCase()}</span>
              {character.subclass && <span className="subclass-tag">({character.subclass})</span>}
              <span>• {character.race}</span>
              <span>• {character.background}</span>
            </div>
          </div>
        </div>

        {/* Hızlı Savaş İstatistikleri & Kilit Butonu */}
        <div className="header-stats-group">
          <div className="stat-pill-box">
            <span className="pill-title">ZIRH SINIFI</span>
            <span className="pill-val" id="sheet-ac-val">🛡️ {character.ac}</span>
          </div>
          <div className="stat-pill-box">
            <span className="pill-title">INISiYATIF</span>
            <span className="pill-val">{dexMod >= 0 ? `+${dexMod}` : dexMod}</span>
          </div>
          <div className="stat-pill-box">
            <span className="pill-title">HIZ</span>
            <span className="pill-val">{character.speed} ft</span>
          </div>
          <div className="stat-pill-box">
            <span className="pill-title">USTALIK</span>
            <span className="pill-val">+{profBonus}</span>
          </div>

          {/* Stat Kilidi (Madde 10) */}
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
              { id: 'str', label: 'STR', name: 'Guc', val: character.stats.str, mod: strMod },
              { id: 'dex', label: 'DEX', name: 'Ceviklik', val: character.stats.dex, mod: dexMod },
              { id: 'con', label: 'CON', name: 'Dayaniklilik', val: character.stats.con, mod: conMod },
              { id: 'int', label: 'INT', name: 'Zeka', val: character.stats.int, mod: intMod },
              { id: 'wis', label: 'WIS', name: 'Bilgelik', val: character.stats.wis, mod: wisMod },
              { id: 'cha', label: 'CHA', name: 'Karizma', val: character.stats.cha, mod: chaMod }
            ].map((st) => (
              <div key={st.id} className="compact-ability-box" id={`ability-box-${st.id}`}>
                <span className="ability-name">{st.label}</span>
                <span className="ability-modifier-large">
                  {st.mod >= 0 ? `+${st.mod}` : st.mod}
                </span>
                <span className="ability-raw-score">{st.val}</span>
                {!isLocked && (
                  <div className="unlocked-stat-stepper">
                    <button
                      onClick={() => setCharacter((prev) => ({
                        ...prev,
                        stats: { ...prev.stats, [st.id]: Math.max(1, prev.stats[st.id as keyof typeof prev.stats] - 1) }
                      }))}
                    >-</button>
                    <button
                      onClick={() => setCharacter((prev) => ({
                        ...prev,
                        stats: { ...prev.stats, [st.id]: Math.min(30, prev.stats[st.id as keyof typeof prev.stats] + 1) }
                      }))}
                    >+</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pasif Algı & Pasif İnceleme (Madde 9) */}
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
            <div className="skills-box-title">BECERILER (Skills)</div>
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
                  <div key={sk.id} className={`skill-row ${isProf ? 'proficient' : ''}`}>
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
              charClass={character.charClass as any}
              level={character.level}
              maxHp={character.maxHp}
              conModifier={conMod}
            />

            {/* Ölüm Kurtarma Zarları (Madde 8) */}
            <DeathSaves currentHp={character.currentHp} />
          </div>

          {/* Sekme Gezinme Çubuğu (Madde 6: Az Kaydırmalı Sekmeli Düzen) */}
          <nav className="sheet-tabs-nav" role="tablist">
            <button
              id="tab-btn-actions"
              className={`sheet-tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              ⚔️ Eylemler & Silahlar
            </button>
            <button
              id="tab-btn-spells"
              className={`sheet-tab-btn ${activeTab === 'spells' ? 'active' : ''}`}
              onClick={() => setActiveTab('spells')}
            >
              📜 Buyu Kitabi
            </button>
            <button
              id="tab-btn-inventory"
              className={`sheet-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              🎒 Envanter & Esyalar
            </button>
            <button
              id="tab-btn-conditions"
              className={`sheet-tab-btn ${activeTab === 'conditions' ? 'active' : ''}`}
              onClick={() => setActiveTab('conditions')}
            >
              ⚡ Durumlar & Efektler
            </button>
            <button
              id="tab-btn-features"
              className={`sheet-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              🏆 Seviye & Ozellikler
            </button>
          </nav>

          {/* Sekme İçerikleri */}
          <div className="sheet-tab-content-area">
            {activeTab === 'actions' && (
              <div className="actions-tab-view" id="tab-content-actions">
                <div className="weapon-cards-list">
                  <div className="weapon-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 className="font-cinzel" style={{ color: 'var(--text-primary)', margin: 0 }}>
                        Uzunkilic (Longsword)
                      </h4>
                      <span className="weapon-dmg-badge">1d8 + {strMod} Kesici</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                      Saldiri Bonusu: <strong>+{strMod + profBonus}</strong> (STR + Ustalik) • Menzil: 5 ft • Cok Yonlu (1d10)
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        className="action-button"
                        style={{ minHeight: '44px', padding: '0.4rem 0.8rem' }}
                        onClick={() => handleRollWeaponAttack('Longsword', `1d8+${strMod}`)}
                      >
                        🎲 Hasar Zari At (1d8+{strMod})
                      </button>
                    </div>
                  </div>

                  <div className="weapon-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 className="font-cinzel" style={{ color: 'var(--text-primary)', margin: 0 }}>
                        Hancer (Dagger)
                      </h4>
                      <span className="weapon-dmg-badge">1d4 + {dexMod} Delici</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                      Saldiri Bonusu: <strong>+{dexMod + profBonus}</strong> • Menzil: 20/60 ft • Finesse, Firlatilabilir
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        className="action-button"
                        style={{ minHeight: '44px', padding: '0.4rem 0.8rem' }}
                        onClick={() => handleRollWeaponAttack('Dagger', `1d4+${dexMod}`)}
                      >
                        🎲 Hasar Zari At (1d4+{dexMod})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'spells' && (
              <div id="tab-content-spells">
                <Spellbook level={character.level} castingModifier={intMod} />
              </div>
            )}

            {activeTab === 'inventory' && (
              <div id="tab-content-inventory">
                <InventoryManager strScore={character.stats.str} />
              </div>
            )}

            {activeTab === 'conditions' && (
              <div id="tab-content-conditions">
                <ConditionsTracker />
              </div>
            )}

            {activeTab === 'features' && (
              <div id="tab-content-features">
                <LevelUpModal
                  initialLevel={character.level}
                  charClass={character.charClass}
                  initialMaxHp={character.maxHp}
                  conModifier={conMod}
                  onLevelUpApplied={(newLvl, newHp, subc) => {
                    setCharacter((prev) => ({
                      ...prev,
                      level: newLvl,
                      maxHp: newHp,
                      subclass: subc || prev.subclass
                    }));
                  }}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

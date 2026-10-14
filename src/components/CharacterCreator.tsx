import React, { useState } from 'react';
import { Character, CharacterRace, CharacterClass, AbilityName, ArmorItem } from '../types/character';
import { calculateDerivedStats } from '../rules/character';

const RACES: { value: CharacterRace; label: string }[] = [
  { value: 'human', label: 'İnsan (Human)' },
  { value: 'elf', label: 'Elf' },
  { value: 'dwarf', label: 'Cüce (Dwarf)' },
  { value: 'halfling', label: 'Buçukluk (Halfling)' },
  { value: 'dragonborn', label: 'Ejderhadölü (Dragonborn)' },
  { value: 'gnome', label: 'Gnom (Gnome)' },
  { value: 'half-elf', label: 'Yarı-Elf (Half-Elf)' },
  { value: 'half-orc', label: 'Yarı-Ork (Half-Orc)' },
  { value: 'tiefling', label: 'Tiefling' }
];

const CLASSES: { value: CharacterClass; label: string }[] = [
  { value: 'barbarian', label: 'Barbar (Barbarian)' },
  { value: 'bard', label: 'Ozan (Bard)' },
  { value: 'cleric', label: 'Rahip (Cleric)' },
  { value: 'druid', label: 'Druid' },
  { value: 'fighter', label: 'Savaşçı (Fighter)' },
  { value: 'monk', label: 'Keşiş (Monk)' },
  { value: 'paladin', label: 'Paladin' },
  { value: 'ranger', label: 'Kolcu (Ranger)' },
  { value: 'rogue', label: 'Hırsız (Rogue)' },
  { value: 'sorcerer', label: 'Büyücü (Sorcerer)' },
  { value: 'warlock', label: 'Warlock' },
  { value: 'wizard', label: 'Büyücü / İlimci (Wizard)' }
];

const ARMORS: { label: string; item?: ArmorItem }[] = [
  { label: 'Zırhsız (Unarmored)', item: undefined },
  { label: 'Deri Zırh (Leather - Hafif, Taban 11)', item: { name: 'Leather', type: 'light', baseAc: 11 } },
  { label: 'Pullu Zırh (Scale Mail - Orta, Taban 14, Max DEX +2)', item: { name: 'Scale Mail', type: 'medium', baseAc: 14, maxDexBonus: 2 } },
  { label: 'Tam Plaka Zırh (Plate - Ağır, Taban 18)', item: { name: 'Plate', type: 'heavy', baseAc: 18 } }
];

const ABILITY_LABELS: Record<AbilityName, string> = {
  str: 'Güç (STR)',
  dex: 'Çeviklik (DEX)',
  con: 'Dayanıklılık (CON)',
  int: 'Zeka (INT)',
  wis: 'Bilgelik (WIS)',
  cha: 'Karizma (CHA)'
};

export const CharacterCreator: React.FC = () => {
  const [character, setCharacter] = useState<Character>({
    id: 'char-1',
    name: 'Kaelen Karaçekiç',
    race: 'human',
    class: 'fighter',
    level: 1,
    baseAbilities: {
      str: 15,
      dex: 14,
      con: 13,
      int: 10,
      wis: 12,
      cha: 8
    },
    equippedArmor: undefined,
    hasShield: false
  });

  const derived = calculateDerivedStats(character);

  const handleAbilityChange = (ability: AbilityName, delta: number) => {
    setCharacter((prev) => {
      const current = prev.baseAbilities[ability];
      const next = Math.max(1, Math.min(30, current + delta));
      return {
        ...prev,
        baseAbilities: {
          ...prev.baseAbilities,
          [ability]: next
        }
      };
    });
  };

  const handleLevelChange = (delta: number) => {
    setCharacter((prev) => ({
      ...prev,
      level: Math.max(1, Math.min(20, prev.level + delta))
    }));
  };

  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  return (
    <div id="character-creator-container" className="creator-card">
      <div className="creator-header">
        <div>
          <h2 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.5rem' }}>
            Karakter Olusturucu
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            SRD 5.1 kural motoruyla dinamik türetilmiş değerler ve yetenek puanları
          </p>
        </div>
      </div>

      <div className="creator-layout">
        {/* Form Alanları */}
        <div className="creator-form">
          {/* İsim & Seviye */}
          <div className="form-group-row">
            <div style={{ flex: 2 }}>
              <label htmlFor="input-char-name" className="form-label">Karakter Adı</label>
              <input
                id="input-char-name"
                className="form-input"
                type="text"
                value={character.name}
                onChange={(e) => setCharacter((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Seviye (1–20)</label>
              <div className="stepper-group">
                <button
                  id="btn-level-down"
                  className="stepper-btn"
                  onClick={() => handleLevelChange(-1)}
                  aria-label="Seviye Azalt"
                >
                  -
                </button>
                <span id="display-level" className="stepper-value">
                  {character.level}
                </span>
                <button
                  id="btn-level-up"
                  className="stepper-btn"
                  onClick={() => handleLevelChange(1)}
                  aria-label="Seviye Artır"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Irk ve Sınıf Seçimi */}
          <div className="form-group-row">
            <div style={{ flex: 1 }}>
              <label htmlFor="select-race" className="form-label">Irk</label>
              <select
                id="select-race"
                className="form-select"
                value={character.race}
                onChange={(e) => setCharacter((prev) => ({ ...prev, race: e.target.value as CharacterRace }))}
              >
                {RACES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="select-class" className="form-label">Sınıf</label>
              <select
                id="select-class"
                className="form-select"
                value={character.class}
                onChange={(e) => setCharacter((prev) => ({ ...prev, class: e.target.value as CharacterClass }))}
              >
                {CLASSES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Yetenek Skorları */}
          <div className="abilities-section">
            <label className="form-label">Temel Yetenek Skorları</label>
            <div className="abilities-grid">
              {(Object.keys(ABILITY_LABELS) as AbilityName[]).map((ab) => (
                <div key={ab} className="ability-box" id={`box-ability-${ab}`}>
                  <span className="ability-title">{ABILITY_LABELS[ab]}</span>
                  <div className="stepper-group">
                    <button
                      id={`btn-dec-${ab}`}
                      className="stepper-btn"
                      onClick={() => handleAbilityChange(ab, -1)}
                      aria-label={`${ab} azalt`}
                    >
                      -
                    </button>
                    <span id={`val-${ab}`} className="stepper-value">
                      {character.baseAbilities[ab]}
                    </span>
                    <button
                      id={`btn-inc-${ab}`}
                      className="stepper-btn"
                      onClick={() => handleAbilityChange(ab, 1)}
                      aria-label={`${ab} artır`}
                    >
                      +
                    </button>
                  </div>
                  <span className="ability-mod-tag" id={`mod-${ab}`}>
                    Mod: {formatMod(derived.modifiers[ab])}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Teçhizat & Kalkan */}
          <div className="form-group-row" style={{ marginTop: '1rem' }}>
            <div style={{ flex: 2 }}>
              <label htmlFor="select-armor" className="form-label">Zırh Kuşan</label>
              <select
                id="select-armor"
                className="form-select"
                value={character.equippedArmor?.name || 'none'}
                onChange={(e) => {
                  const found = ARMORS.find((a) => a.item?.name === e.target.value);
                  setCharacter((prev) => ({ ...prev, equippedArmor: found?.item }));
                }}
              >
                {ARMORS.map((a) => (
                  <option key={a.label} value={a.item?.name || 'none'}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  id="chk-shield"
                  type="checkbox"
                  style={{ width: '20px', height: '20px' }}
                  checked={character.hasShield}
                  onChange={(e) => setCharacter((prev) => ({ ...prev, hasShield: e.target.checked }))}
                />
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Kalkan (+2 AC)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Canlı Türetilmiş Değerler Önizleme Kartı */}
        <div className="stats-preview-panel" id="stats-preview-panel">
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', marginBottom: '1.25rem' }}>
            ⚔️ Türetilmiş Değerler
          </h3>

          <div className="stat-badge-row">
            <div className="stat-pill" id="pill-proficiency">
              <span className="stat-pill-label">Ustalık Bonusu</span>
              <span className="stat-pill-val" id="val-proficiency">
                +{derived.proficiencyBonus}
              </span>
            </div>
            <div className="stat-pill" id="pill-ac">
              <span className="stat-pill-label">Zırh Sınıfı (AC)</span>
              <span className="stat-pill-val" id="val-ac">{derived.armorClass}</span>
            </div>
            <div className="stat-pill" id="pill-hp">
              <span className="stat-pill-label">Maksimum Can (HP)</span>
              <span className="stat-pill-val" id="val-hp">{derived.maxHp}</span>
            </div>
            <div className="stat-pill" id="pill-hitdice">
              <span className="stat-pill-label">Can Zarı</span>
              <span className="stat-pill-val" id="val-hitdice">{derived.hitDice}</span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Yetenek Modifikatör Özeti
            </h4>
            <div className="mod-summary-grid">
              {(Object.keys(derived.modifiers) as AbilityName[]).map((ab) => (
                <div key={ab} className="mod-summary-item" id={`summary-mod-${ab}`}>
                  <span style={{ textTransform: 'uppercase', color: 'var(--text-muted)' }}>{ab}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {formatMod(derived.modifiers[ab])}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    ({derived.abilityScores[ab]})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Pasif Algı (Perception)</span>
              <span id="val-passive-perception" style={{ fontWeight: 700 }}>
                {derived.passivePerception}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// CHARACTER CREATOR V3 — Kayıt Akışı ile
// Karakter oluşturulunca CharacterContext'e kaydediliyor,
// ardından otomatik olarak karakter kağıdına geçilebiliyor.
// =============================================================================

import React, { useState } from 'react';
import { Character, CharacterRace, CharacterClass, AbilityName, ArmorItem } from '../types/character';
import type { FullCharacter } from '../types/character';
import { calculateDerivedStats, RACE_SPEED } from '../rules/character';
import { getSpellSlotsForLevel } from '../rules/spellSlots';
import { getStarterKitForClass } from '../rules/starterEquipment';
import { useCharacter } from '../context/CharacterContext';

const RACES: { value: CharacterRace; label: string }[] = [
  { value: 'human', label: 'İnsan' },
  { value: 'elf', label: 'Elf' },
  { value: 'dwarf', label: 'Cüce' },
  { value: 'halfling', label: 'Buçukluk' },
  { value: 'dragonborn', label: 'Ejderhadölü' },
  { value: 'gnome', label: 'Gnom' },
  { value: 'half-elf', label: 'Yarı-Elf' },
  { value: 'half-orc', label: 'Yarı-Ork' },
  { value: 'tiefling', label: 'Tiefling' }
];

const CLASSES: { value: CharacterClass; label: string }[] = [
  { value: 'barbarian', label: 'Barbar' },
  { value: 'bard', label: 'Ozan' },
  { value: 'cleric', label: 'Rahip' },
  { value: 'druid', label: 'Druid' },
  { value: 'fighter', label: 'Savaşçı' },
  { value: 'monk', label: 'Keşiş' },
  { value: 'paladin', label: 'Paladin' },
  { value: 'ranger', label: 'Kolcu' },
  { value: 'rogue', label: 'Hırsız' },
  { value: 'sorcerer', label: 'Büyücü' },
  { value: 'warlock', label: 'Warlock' },
  { value: 'wizard', label: 'İlimci' }
];

const ARMORS: { label: string; item?: ArmorItem }[] = [
  { label: 'Zırhsız', item: undefined },
  { label: 'Deri Zırh (Hafif, Taban 11)', item: { name: 'Leather', type: 'light', baseAc: 11 } },
  { label: 'Pullu Zırh (Orta, Taban 14, Azami ÇEV +2)', item: { name: 'Scale Mail', type: 'medium', baseAc: 14, maxDexBonus: 2 } },
  { label: 'Tam Plaka Zırh (Ağır, Taban 18)', item: { name: 'Plate', type: 'heavy', baseAc: 18 } }
];

const ABILITY_LABELS: Record<AbilityName, string> = {
  str: 'Güç',
  dex: 'Çeviklik',
  con: 'Dayanıklılık',
  int: 'Zeka',
  wis: 'Bilgelik',
  cha: 'Karizma'
};

const BACKGROUNDS = [
  { value: 'soldier', label: 'Asker' },
  { value: 'sage', label: 'Bilgin' },
  { value: 'criminal', label: 'Suçlu' },
  { value: 'noble', label: 'Soylu' },
  { value: 'folk-hero', label: 'Halk Kahramanı' },
  { value: 'acolyte', label: 'Tapınak Görevlisi' },
  { value: 'outlander', label: 'Yabani' },
  { value: 'entertainer', label: 'Eğlendirici' },
  { value: 'hermit', label: 'Münzevi' },
  { value: 'urchin', label: 'Sokak Çocuğu' },
];

interface CharacterCreatorProps {
  onSaved?: (characterId: string) => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onSaved }) => {
  const { saveCharacter, setActiveCharacter } = useCharacter();
  const [saved, setSaved] = useState(false);
  const [savedName, setSavedName] = useState('');

  const [character, setCharacter] = useState<Character>({
    id: `char-${Date.now()}`,
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

  const [playerName, setPlayerName] = useState('');
  const [background, setBackground] = useState('soldier');

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

  // Spell slotlarını oluştur
  const buildSpellSlots = () => {
    const raw = getSpellSlotsForLevel(character.class as CharacterClass, character.level);
    const result: Record<number, { total: number; expended: number }> = {};
    Object.entries(raw).forEach(([lvl, slot]) => {
      result[Number(lvl)] = { total: slot.total, expended: 0 };
    });
    return result;
  };

  const handleSave = () => {
    if (!character.name.trim()) {
      alert('Lütfen bir karakter adı gir!');
      return;
    }

    const starterKit = getStarterKitForClass(
      character.class,
      character.equippedArmor,
      character.hasShield
    );

    const now = new Date().toISOString();
    const fullChar: FullCharacter = {
      id: character.id,
      name: character.name.trim(),
      race: character.race,
      class: character.class,
      background: background as FullCharacter['background'],
      level: character.level,
      playerName: playerName.trim() || undefined,
      baseAbilities: character.baseAbilities,
      proficientSkills: [],
      proficientSavingThrows: [],
      equippedArmor: starterKit.equippedArmor,
      hasShield: starterKit.hasShield,
      weapons: starterKit.weapons,
      inventory: starterKit.inventory,
      currentHp: derived.maxHp,
      maxHp: derived.maxHp,
      tempHp: 0,
      hitDiceAvailable: character.level,
      spellSlots: buildSpellSlots(),
      activeConditions: [],
      deathSaves: { successes: 0, failures: 0 },
      ruleset: '2014',
      createdAt: now,
      updatedAt: now,
    };

    saveCharacter(fullChar);
    setActiveCharacter(fullChar.id);
    setSavedName(character.name.trim());
    setSaved(true);

    if (onSaved) {
      onSaved(fullChar.id);
    }
  };

  if (saved) {
    return (
      <div className="creator-save-success">
        <div className="save-success-icon">✅</div>
        <h2 className="font-cinzel save-success-title">{savedName} Kaydedildi!</h2>
        <p className="save-success-sub">
          Karakter galerinde görünüyor ve karakter kağıdına aktarıldı.
        </p>
        <div className="save-success-actions">
          <button
            className="action-button"
            onClick={() => onSaved && onSaved('')}
          >
            📜 Karakter Kağıdına Git →
          </button>
          <button
            className="secondary-btn"
            onClick={() => {
              setSaved(false);
              setCharacter({
                id: `char-${Date.now()}`,
                name: '',
                race: 'human',
                class: 'fighter',
                level: 1,
                baseAbilities: { str: 15, dex: 14, con: 13, int: 10, wis: 12, cha: 8 },
                equippedArmor: undefined,
                hasShield: false,
              });
            }}
          >
            + Yeni Karakter Oluştur
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="character-creator-container" className="creator-card">
      <div className="creator-header">
        <div>
          <h2 className="font-cinzel creator-title">
            🧙 Karakter Olusturucu
          </h2>
          <p className="creator-subtitle">
            SRD 5.1 kural motoruyla dinamik türetilmiş değerler ve yetenek puanları
          </p>
        </div>
      </div>

      <div className="creator-layout">
        {/* Form Alanları */}
        <div className="creator-form">
          {/* İsim & Oyuncu & Seviye */}
          <div className="form-group-row">
            <div style={{ flex: 2 }}>
              <label htmlFor="input-char-name" className="form-label">Karakter Adı *</label>
              <input
                id="input-char-name"
                className="form-input"
                type="text"
                placeholder="Örn: Kaelen Karaçekiç"
                value={character.name}
                onChange={(e) => setCharacter((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Seviye (1–20)</label>
              <div className="stepper-group">
                <button id="btn-level-down" className="stepper-btn" onClick={() => handleLevelChange(-1)} aria-label="Seviye Azalt">-</button>
                <span id="display-level" className="stepper-value">{character.level}</span>
                <button id="btn-level-up" className="stepper-btn" onClick={() => handleLevelChange(1)} aria-label="Seviye Artır">+</button>
              </div>
            </div>
          </div>

          {/* Oyuncu Adı & Arkaplan */}
          <div className="form-group-row">
            <div style={{ flex: 1 }}>
              <label htmlFor="input-player-name" className="form-label">Oyuncu Adı (İsteğe Bağlı)</label>
              <input
                id="input-player-name"
                className="form-input"
                type="text"
                placeholder="Örn: Ahmet"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="select-background" className="form-label">Arkaplan</label>
              <select
                id="select-background"
                className="form-select"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
              >
                {BACKGROUNDS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
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
                    <button id={`btn-dec-${ab}`} className="stepper-btn" onClick={() => handleAbilityChange(ab, -1)} aria-label={`${ab} azalt`}>-</button>
                    <span id={`val-${ab}`} className="stepper-value">{character.baseAbilities[ab]}</span>
                    <button id={`btn-inc-${ab}`} className="stepper-btn" onClick={() => handleAbilityChange(ab, 1)} aria-label={`${ab} artır`}>+</button>
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
              <span className="stat-pill-val" id="val-proficiency">+{derived.proficiencyBonus}</span>
            </div>
            <div className="stat-pill" id="pill-ac">
              <span className="stat-pill-label">Zırh Sınıfı (AC)</span>
              <span className="stat-pill-val" id="val-ac">{derived.armorClass}</span>
            </div>
            <div className="stat-pill" id="pill-hp">
              <span className="stat-pill-label">Maksimum HP</span>
              <span className="stat-pill-val" id="val-hp">{derived.maxHp}</span>
            </div>
            <div className="stat-pill" id="pill-hitdice">
              <span className="stat-pill-label">Can Zarı</span>
              <span className="stat-pill-val" id="val-hitdice">{derived.hitDice}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-label">Hız</span>
              <span className="stat-pill-val">{RACE_SPEED[character.race] ?? 30} ft.</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-label">İnisiyatif</span>
              <span className="stat-pill-val">{formatMod(derived.modifiers.dex)}</span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Yetenek Modifikatörleri
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Pasif Algı (Perception)</span>
              <span id="val-passive-perception" style={{ fontWeight: 700 }}>{derived.passivePerception}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Pasif İnceleme (Investigation)</span>
              <span style={{ fontWeight: 700 }}>{derived.passiveInvestigation}</span>
            </div>
          </div>

          {/* KAYDET BUTONU */}
          <button
            id="btn-save-character"
            className="action-button creator-save-btn"
            onClick={handleSave}
            style={{ marginTop: '2rem', width: '100%', padding: '0.9rem', fontSize: '1rem' }}
          >
            ✅ Karakteri Kaydet & Galerie Ekle
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            Kaydettikten sonra karakter kağıdına geçebilirsin
          </p>
        </div>
      </div>
    </div>
  );
};

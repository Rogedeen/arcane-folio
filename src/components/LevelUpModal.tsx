// =============================================================================
// LEVEL-UP WIZARD V3 — Adım Adım Karakter Geliştirme Sihirbazı
//
// Desteklenen Özellikler:
// 1. Can zarı atma veya ortalama alma (+CON mod)
// 2. Modüler Alt Sınıf (Subclass) seçimi (Eldritch Knight, Arcane Trickster vb.)
// 3. ASI (+2 tek stat / +1 iki stat) VEYA Hüner (Feat) seçimi
// 4. Karakter Geçmişi (Backstory), İdealler ve Kusurlar
// =============================================================================

import React, { useState } from 'react';
import { calculateAverageHpIncrease, isAsiLevel, CLASS_HIT_DICE } from '../rules/levelUp';
import { getSubclassesForClass, getSubclassUnlockLevel } from '../rules/subclasses';
import { FEATS } from '../rules/feats';
import type { AbilityScores, AbilityName } from '../types/character';

export interface LevelUpResultPayload {
  level: number;
  maxHp: number;
  subclass?: string;
  abilities: AbilityScores;
  feats: string[];
  backstory?: string;
}

interface LevelUpModalProps {
  initialLevel?: number;
  charClass?: string;
  initialMaxHp?: number;
  conModifier?: number;
  currentAbilities?: AbilityScores;
  currentSubclass?: string;
  currentFeats?: string[];
  currentBackstory?: string;
  onLevelUpApplied?: (newLevel: number, newMaxHp: number, subclass?: string) => void;
  onDetailedLevelUpApplied?: (payload: LevelUpResultPayload) => void;
}

type WizardStep = 'hp' | 'subclass' | 'asi-feat' | 'backstory' | 'review';

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  initialLevel = 2,
  charClass = 'fighter',
  initialMaxHp = 20,
  conModifier = 2,
  currentAbilities = { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 },
  currentSubclass = '',
  currentFeats = [],
  currentBackstory = '',
  onLevelUpApplied,
  onDetailedLevelUpApplied,
}) => {
  const [level, setLevel] = useState<number>(initialLevel);
  const [maxHp, setMaxHp] = useState<number>(initialMaxHp);
  const [abilities, setAbilities] = useState<AbilityScores>(currentAbilities);
  const [selectedSubclass, setSelectedSubclass] = useState<string>(currentSubclass);
  const [feats, setFeats] = useState<string[]>(currentFeats);
  const [backstory, setBackstory] = useState<string>(currentBackstory);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<WizardStep>('hp');

  // Adım 1: HP State
  const [hpChoice, setHpChoice] = useState<'average' | 'roll'>('average');
  const [rolledDieValue, setRolledDieValue] = useState<number>(6);
  const [isRollingDie, setIsRollingDie] = useState<boolean>(false);

  // Adım 3: ASI vs Feat State
  const [progressionChoice, setProgressionChoice] = useState<'asi' | 'feat'>('asi');
  const [asiMode, setAsiMode] = useState<'plusTwo' | 'plusOnePlusOne'>('plusTwo');
  const [asiStat1, setAsiStat1] = useState<AbilityName>('str');
  const [asiStat2, setAsiStat2] = useState<AbilityName>('con');
  const [chosenFeatId, setChosenFeatId] = useState<string>('great-weapon-master');

  const nextLevel = level + 1;
  const isMaxLevel = level >= 20;

  const hitDie = CLASS_HIT_DICE[charClass.toLowerCase()] ?? 8;
  const avgIncrease = calculateAverageHpIncrease(charClass, conModifier);
  const hpIncrease = hpChoice === 'average'
    ? avgIncrease
    : Math.max(1, rolledDieValue + conModifier);

  const availableSubclasses = getSubclassesForClass(charClass);
  const unlockLevel = getSubclassUnlockLevel(charClass);
  const grantsASI = isAsiLevel(charClass, nextLevel);

  // Zar atma simülasyonu
  const handleRollHitDie = () => {
    setIsRollingDie(true);
    let count = 0;
    const interval = setInterval(() => {
      setRolledDieValue(Math.floor(Math.random() * hitDie) + 1);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setIsRollingDie(false);
      }
    }, 60);
  };

  const handleApplyLevelUp = () => {
    const newMaxHp = maxHp + hpIncrease;
    const newLevel = nextLevel;
    let newAbilities = { ...abilities };

    // Eğer ASI seçildiyse statları artır
    if (grantsASI) {
      if (progressionChoice === 'asi') {
        if (asiMode === 'plusTwo') {
          newAbilities[asiStat1] = Math.min(20, newAbilities[asiStat1] + 2);
        } else {
          newAbilities[asiStat1] = Math.min(20, newAbilities[asiStat1] + 1);
          newAbilities[asiStat2] = Math.min(20, newAbilities[asiStat2] + 1);
        }
      } else if (progressionChoice === 'feat' && chosenFeatId) {
        if (!feats.includes(chosenFeatId)) {
          setFeats((prev) => [...prev, chosenFeatId]);
        }
      }
    }

    setLevel(newLevel);
    setMaxHp(newMaxHp);
    setAbilities(newAbilities);
    setIsOpen(false);

    const updatedFeats = grantsASI && progressionChoice === 'feat' && chosenFeatId && !feats.includes(chosenFeatId)
      ? [...feats, chosenFeatId]
      : feats;

    if (onDetailedLevelUpApplied) {
      onDetailedLevelUpApplied({
        level: newLevel,
        maxHp: newMaxHp,
        subclass: selectedSubclass,
        abilities: newAbilities,
        feats: updatedFeats,
        backstory,
      });
    }

    if (onLevelUpApplied) {
      onLevelUpApplied(newLevel, newMaxHp, selectedSubclass);
    }
  };

  return (
    <div id="levelup-manager-container" className="levelup-card">
      <div className="levelup-header">
        <div>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.35rem', margin: '0 0 0.3rem' }}>
            🏆 Seviye Atlama & Karakter Gelişimi
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            Mevcut Seviye: <strong id="display-char-level">{level}</strong> | Maksimum Can: <strong>{maxHp} HP</strong>
            {selectedSubclass && <> | Alt Sınıf: <strong>{selectedSubclass}</strong></>}
            {feats.length > 0 && <> | Hünerler: <strong>{feats.length} adet</strong></>}
          </p>
        </div>

        <button
          id="btn-open-levelup-modal"
          className="action-button"
          onClick={() => {
            setActiveStep('hp');
            setIsOpen(true);
          }}
          disabled={isMaxLevel}
          aria-label="Seviye Atla Modalı Aç"
          style={{ padding: '0.6rem 1.2rem', fontWeight: 600 }}
        >
          {isMaxLevel ? 'Maks Seviye (20)' : `⬆️ Seviye Atla (${nextLevel}. Seviye)`}
        </button>
      </div>

      {/* Modal Diyaloğu */}
      {isOpen && (
        <div className="modal-backdrop" id="levelup-modal" onClick={() => setIsOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0 }}>
                  Seviye {nextLevel} Atlama Sihirbazı
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sınıf: {charClass.toUpperCase()} (1d{hitDie} Can Zarı)
                </span>
              </div>
              <button
                id="btn-close-levelup-modal"
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Modalı Kapat"
              >
                ✕
              </button>
            </div>

            {/* Wizard Adım Butonları */}
            <div className="wizard-stepper-tabs" style={{ display: 'flex', gap: '0.4rem', padding: '0.75rem 0', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                className={`wizard-step-btn ${activeStep === 'hp' ? 'active' : ''}`}
                onClick={() => setActiveStep('hp')}
              >
                1. ❤️ Can Puanı
              </button>
              <button
                className={`wizard-step-btn ${activeStep === 'subclass' ? 'active' : ''}`}
                onClick={() => setActiveStep('subclass')}
              >
                2. 🌟 Alt Sınıf
              </button>
              <button
                className={`wizard-step-btn ${activeStep === 'asi-feat' ? 'active' : ''}`}
                onClick={() => setActiveStep('asi-feat')}
              >
                3. 💡 ASI / Feat {grantsASI && '⭐'}
              </button>
              <button
                className={`wizard-step-btn ${activeStep === 'backstory' ? 'active' : ''}`}
                onClick={() => setActiveStep('backstory')}
              >
                4. 📜 Hikaye & Biyo
              </button>
              <button
                className={`wizard-step-btn ${activeStep === 'review' ? 'active' : ''}`}
                onClick={() => setActiveStep('review')}
              >
                5. ✓ Onayla
              </button>
            </div>

            {/* Modal Gövdesi */}
            <div className="modal-body" style={{ overflowY: 'auto', padding: '1rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* ADIM 1: CAN PUANI */}
              {activeStep === 'hp' && (
                <div className="levelup-section-box">
                  <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>❤️ Can Puanı (HP) Artışı</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
                    Sınıfınız için 1d{hitDie} can zarı atabilir veya kural kitabındaki güvenli ortalama değeri alabilirsiniz (+{conModifier} CON Modifikatörü).
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div
                      onClick={() => setHpChoice('average')}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: hpChoice === 'average' ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                        background: hpChoice === 'average' ? 'rgba(217, 119, 6, 0.15)' : 'rgba(15, 23, 42, 0.6)'
                      }}
                    >
                      <strong style={{ color: 'var(--accent-gold)' }}>Ortalama Değer Al</strong>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0.4rem 0' }}>+{avgIncrease} HP</div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({Math.floor(hitDie / 2) + 1} + {conModifier} CON)</span>
                    </div>

                    <div
                      onClick={() => setHpChoice('roll')}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: hpChoice === 'roll' ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                        background: hpChoice === 'roll' ? 'rgba(217, 119, 6, 0.15)' : 'rgba(15, 23, 42, 0.6)'
                      }}
                    >
                      <strong style={{ color: 'var(--accent-gold)' }}>1d{hitDie} Can Zarı At</strong>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0.4rem 0' }}>
                        +{Math.max(1, rolledDieValue + conModifier)} HP
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zar: {rolledDieValue} (+{conModifier} CON)</span>
                    </div>
                  </div>

                  {hpChoice === 'roll' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px' }}>
                      <button
                        className="action-button"
                        onClick={handleRollHitDie}
                        disabled={isRollingDie}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        🎲 {isRollingDie ? 'Zar Yuvarlanıyor...' : `1d${hitDie} Yuvarla`}
                      </button>
                      <span>Veya elle gir:</span>
                      <input
                        id="input-rolled-hp"
                        type="number"
                        min={1}
                        max={hitDie}
                        value={rolledDieValue}
                        onChange={(e) => setRolledDieValue(Number(e.target.value))}
                        style={{ width: '60px', padding: '0.3rem', background: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ADIM 2: ALT SINIF (SUBCLASS) */}
              {activeStep === 'subclass' && (
                <div className="levelup-section-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--accent-gold)', margin: 0 }}>🌟 Alt Sınıf (Subclass) Seçimi</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kilit Seviyesi: {unlockLevel}</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
                    Alt sınıfınız karakterinizin dövüş stilini veya büyü kabiliyetlerini derinden şekillendirir.
                    Örneğin Eldritch Knight veya Arcane Trickster seçildiğinde büyücülük özellikleri ve büyü yuvaları otomatik açılır.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {availableSubclasses.map((sc) => {
                      const isSelected = selectedSubclass === sc.name || selectedSubclass === sc.id;
                      return (
                        <div
                          key={sc.id}
                          onClick={() => setSelectedSubclass(sc.name)}
                          style={{
                            padding: '1rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                            background: isSelected ? 'rgba(217, 119, 6, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)', fontSize: '1rem' }}>
                              {sc.nameTr} ({sc.name})
                            </strong>
                            {sc.isSpellcaster && (
                              <span style={{ fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #c084fc' }}>
                                ✨ Büyücü (Int)
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>
                            {sc.description}
                          </p>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <strong>İlk Özellik:</strong> {sc.features[0]?.name} — {sc.features[0]?.description}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ADIM 3: ASI VEYA FEAT */}
              {activeStep === 'asi-feat' && (
                <div className="levelup-section-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>💡 Yetenek Skoru Artışı (ASI) veya Hüner (Feat)</h4>
                    {grantsASI ? (
                      <span style={{ fontSize: '0.8rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        ⭐ Seviye {nextLevel} Hak Kazandı
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        (Sonraki ASI: Seviye 4, 8, 12, 16, 19)
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
                    İster ana statlarınızı artırın, ister karakterinize Great Weapon Master, War Caster veya Sharpshooter gibi güçlü bir hüner ekleyin.
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button
                      className={`sheet-tab-btn ${progressionChoice === 'asi' ? 'active' : ''}`}
                      onClick={() => setProgressionChoice('asi')}
                      style={{ flex: 1, padding: '0.5rem' }}
                    >
                      📈 Stat Artışı (ASI)
                    </button>
                    <button
                      className={`sheet-tab-btn ${progressionChoice === 'feat' ? 'active' : ''}`}
                      onClick={() => setProgressionChoice('feat')}
                      style={{ flex: 1, padding: '0.5rem' }}
                    >
                      ⚡ Hüner Seç (Feat)
                    </button>
                  </div>

                  {progressionChoice === 'asi' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                          <input
                            type="radio"
                            name="asiMode"
                            checked={asiMode === 'plusTwo'}
                            onChange={() => setAsiMode('plusTwo')}
                          />
                          Tek Yeteneğe +2
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                          <input
                            type="radio"
                            name="asiMode"
                            checked={asiMode === 'plusOnePlusOne'}
                            onChange={() => setAsiMode('plusOnePlusOne')}
                          />
                          İki Farklı Yeteneğe +1
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem' }}>
                          1. Yetenek:
                          <select
                            value={asiStat1}
                            onChange={(e) => setAsiStat1(e.target.value as AbilityName)}
                            style={{ marginLeft: '0.4rem', padding: '0.3rem 0.6rem', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '4px' }}
                          >
                            <option value="str">Kuvvet (STR: {abilities.str})</option>
                            <option value="dex">Çeviklik (DEX: {abilities.dex})</option>
                            <option value="con">Dayanıklılık (CON: {abilities.con})</option>
                            <option value="int">Zeka (INT: {abilities.int})</option>
                            <option value="wis">Bilgelik (WIS: {abilities.wis})</option>
                            <option value="cha">Karizma (CHA: {abilities.cha})</option>
                          </select>
                        </label>

                        {asiMode === 'plusOnePlusOne' && (
                          <label style={{ fontSize: '0.85rem' }}>
                            2. Yetenek:
                            <select
                              value={asiStat2}
                              onChange={(e) => setAsiStat2(e.target.value as AbilityName)}
                              style={{ marginLeft: '0.4rem', padding: '0.3rem 0.6rem', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '4px' }}
                            >
                              <option value="str">Kuvvet (STR: {abilities.str})</option>
                              <option value="dex">Çeviklik (DEX: {abilities.dex})</option>
                              <option value="con">Dayanıklılık (CON: {abilities.con})</option>
                              <option value="int">Zeka (INT: {abilities.int})</option>
                              <option value="wis">Bilgelik (WIS: {abilities.wis})</option>
                              <option value="cha">Karizma (CHA: {abilities.cha})</option>
                            </select>
                          </label>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
                      {FEATS.map((feat) => {
                        const isChosen = chosenFeatId === feat.id;
                        return (
                          <div
                            key={feat.id}
                            onClick={() => setChosenFeatId(feat.id)}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              border: isChosen ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                              background: isChosen ? 'rgba(217, 119, 6, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ color: isChosen ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                                {feat.nameTr} ({feat.name})
                              </strong>
                              {isChosen && <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem' }}>✓ Seçildi</span>}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.3rem 0' }}>
                              {feat.description}
                            </p>
                            <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '1.2rem' }}>
                              {feat.features.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ADIM 4: HİKAYE & GEÇMİŞ (BACKSTORY) */}
              {activeStep === 'backstory' && (
                <div className="levelup-section-box">
                  <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>📜 Karakter Hikayesi & Geçmişi (Backstory)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                    Karakterinizin yaşadığı serüvenleri, yeni kazandığı motivasyonları veya idealleri buraya serbestçe yazabilirsiniz.
                  </p>
                  <textarea
                    value={backstory}
                    onChange={(e) => setBackstory(e.target.value)}
                    placeholder="Karakterinizin geçmişi, yeminleri, müttefikleri ve düşmanları..."
                    rows={6}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      padding: '0.75rem',
                      fontSize: '0.88rem',
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: 1.5,
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              {/* ADIM 5: ÖZET & ONAY */}
              {activeStep === 'review' && (
                <div className="levelup-section-box" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-gold)' }}>
                  <h4 style={{ color: 'var(--accent-gold)', margin: '0 0 0.75rem' }}>✓ Seviye Atlama Özeti</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div>Yeni Seviye: <strong>{level} ➔ {nextLevel}</strong></div>
                    <div>Can Puanı Artışı: <strong>+{hpIncrease} HP</strong> (Yeni Maks HP: <strong>{maxHp + hpIncrease}</strong>)</div>
                    <div>Alt Sınıf: <strong>{selectedSubclass || 'Henüz seçilmedi'}</strong></div>
                    {grantsASI && (
                      <div>
                        {progressionChoice === 'asi' ? (
                          <span>Stat Artışı: <strong>{asiMode === 'plusTwo' ? `+2 ${asiStat1.toUpperCase()}` : `+1 ${asiStat1.toUpperCase()} & +1 ${asiStat2.toUpperCase()}`}</strong></span>
                        ) : (
                          <span>Seçilen Hüner: <strong>{chosenFeatId}</strong></span>
                        )}
                      </div>
                    )}
                    {backstory && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        Hikaye notu kaydedildi ({backstory.length} karakter).
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Alt Kontroller */}
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {activeStep !== 'hp' && (
                  <button
                    className="action-button secondary"
                    onClick={() => {
                      if (activeStep === 'subclass') setActiveStep('hp');
                      else if (activeStep === 'asi-feat') setActiveStep('subclass');
                      else if (activeStep === 'backstory') setActiveStep('asi-feat');
                      else if (activeStep === 'review') setActiveStep('backstory');
                    }}
                    style={{ fontSize: '0.85rem' }}
                  >
                    ← Geri
                  </button>
                )}
                {activeStep !== 'review' && (
                  <button
                    className="action-button secondary"
                    onClick={() => {
                      if (activeStep === 'hp') setActiveStep('subclass');
                      else if (activeStep === 'subclass') setActiveStep('asi-feat');
                      else if (activeStep === 'asi-feat') setActiveStep('backstory');
                      else if (activeStep === 'backstory') setActiveStep('review');
                    }}
                    style={{ fontSize: '0.85rem' }}
                  >
                    İleri →
                  </button>
                )}
              </div>

              <button
                id="btn-confirm-levelup"
                className="action-button"
                style={{ minHeight: '42px', padding: '0.5rem 1.4rem', fontWeight: 600, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
                onClick={handleApplyLevelUp}
                aria-label="Seviye Atlamayı Onayla"
              >
                ✓ Seviye Atlamayı Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

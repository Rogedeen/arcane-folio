import React, { useState } from 'react';
import { performLevelUp, calculateAverageHpIncrease, isAsiLevel } from '../rules/levelUp';
import { getSubclassForClass, getSubclassUnlockLevel } from '../rules/subclasses';

interface LevelUpModalProps {
  initialLevel?: number;
  charClass?: string;
  initialMaxHp?: number;
  conModifier?: number;
  onLevelUpApplied?: (newLevel: number, newMaxHp: number, subclass?: string) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  initialLevel = 2,
  charClass = 'fighter',
  initialMaxHp = 20,
  conModifier = 2,
  onLevelUpApplied
}) => {
  const [level, setLevel] = useState<number>(initialLevel);
  const [maxHp, setMaxHp] = useState<number>(initialMaxHp);
  const [selectedSubclass, setSelectedSubclass] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hpChoice, setHpChoice] = useState<'average' | 'roll'>('average');
  const [rolledDieValue, setRolledDieValue] = useState<number>(6);

  const nextLevel = level + 1;
  const isMaxLevel = level >= 20;

  const avgIncrease = calculateAverageHpIncrease(charClass, conModifier);
  const hpIncrease = hpChoice === 'average'
    ? avgIncrease
    : Math.max(1, rolledDieValue + conModifier);

  const subclassInfo = getSubclassForClass(charClass);
  const unlockLevel = getSubclassUnlockLevel(charClass);
  const needsSubclassSelection = nextLevel >= unlockLevel && !selectedSubclass && subclassInfo !== undefined;
  const grantsASI = isAsiLevel(charClass, nextLevel);

  const handleApplyLevelUp = () => {
    try {
      const result = performLevelUp(
        level,
        charClass,
        maxHp,
        conModifier,
        hpChoice === 'roll' ? rolledDieValue : undefined
      );

      setLevel(result.newLevel);
      setMaxHp(result.newMaxHp);
      if (needsSubclassSelection && subclassInfo) {
        setSelectedSubclass(subclassInfo.name);
      }
      setIsOpen(false);

      if (onLevelUpApplied) {
        onLevelUpApplied(result.newLevel, result.newMaxHp, selectedSubclass || subclassInfo?.name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="levelup-manager-container" className="levelup-card">
      <div className="levelup-header">
        <div>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
            🏆 Seviye Atlama & Alt Sınıflar (Faz 4)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Mevcut Seviye: <strong>{level}</strong> | Maksimum Can: <strong>{maxHp} HP</strong>
            {selectedSubclass && <> | Alt Sınıf: <strong>{selectedSubclass}</strong></>}
          </p>
        </div>

        <button
          id="btn-open-levelup-modal"
          className="action-button"
          onClick={() => setIsOpen(true)}
          disabled={isMaxLevel}
          aria-label="Seviye Atla Modalı Aç"
        >
          {isMaxLevel ? 'Maks Seviye (20)' : `⬆️ Seviye Atla (${nextLevel}. Seviye)`}
        </button>
      </div>

      {/* Modal Diyaloğu */}
      {isOpen && (
        <div className="modal-backdrop" id="levelup-modal" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)' }}>
                Seviye {nextLevel} Atlama
              </h3>
              <button
                id="btn-close-levelup-modal"
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Modalı Kapat"
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Can Puanı Seçimi */}
              <div className="levelup-section-box">
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>❤️ Can Puanı Artışı</h4>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="hpChoice"
                      value="average"
                      checked={hpChoice === 'average'}
                      onChange={() => setHpChoice('average')}
                    />
                    Ortalama Al (+{avgIncrease} HP)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="hpChoice"
                      value="roll"
                      checked={hpChoice === 'roll'}
                      onChange={() => setHpChoice('roll')}
                    />
                    Zar Değeri Gir
                  </label>
                </div>

                {hpChoice === 'roll' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Atılan Zar:</span>
                    <input
                      id="input-rolled-hp"
                      type="number"
                      min={1}
                      max={12}
                      value={rolledDieValue}
                      onChange={(e) => setRolledDieValue(Number(e.target.value))}
                      style={{ width: '60px', padding: '0.3rem', background: '#1e293b', border: '1px solid #475569', color: '#fff' }}
                    />
                    <span>+ {conModifier} (CON) = <strong>+{hpIncrease} HP</strong></span>
                  </div>
                )}
              </div>

              {/* Alt Sınıf Seçimi */}
              {needsSubclassSelection && subclassInfo && (
                <div className="levelup-section-box" id="subclass-unlock-box">
                  <h4 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                    🌟 Alt Sınıf Kilidi Açıldı! ({subclassInfo.nameTr})
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {subclassInfo.description}
                  </p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Özellik:</strong> {subclassInfo.features[0]?.name} - {subclassInfo.features[0]?.description}
                  </div>
                </div>
              )}

              {/* ASI Bildirimi */}
              {grantsASI && (
                <div className="encumbrance-alert" style={{ background: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6', color: '#93c5fd' }}>
                  💡 <strong>Yetenek Skoru Artışı (ASI):</strong> Bu seviyede 2 stat puanı artırma veya bir feat seçme hakkı kazanırsınız.
                </div>
              )}

              {/* Özet ve Onay */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                <div>Yeni Seviye: <strong>{nextLevel}</strong></div>
                <div>Yeni Maksimum Can: <strong>{maxHp + hpIncrease} HP</strong> (+{hpIncrease})</div>
              </div>

              <button
                id="btn-confirm-levelup"
                className="action-button"
                style={{ width: '100%', minHeight: '44px' }}
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

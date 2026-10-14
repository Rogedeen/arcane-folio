import React, { useState } from 'react';
import { DieType, DiceRollResult } from '../types/resources';
import { soundEffects } from '../utils/soundEffects';

const DIE_SIDES: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100
};

interface DieButtonConfig {
  type: DieType;
  label: string;
  iconSvg: React.ReactNode;
}

const DICE_CONFIG: DieButtonConfig[] = [
  {
    type: 'd4',
    label: 'D4',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
        <polygon points="20,4 36,34 4,34" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.15)" strokeLinejoin="round"/>
        <line x1="20" y1="4" x2="20" y2="24" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6"/>
        <line x1="4" y1="34" x2="20" y2="24" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6"/>
        <line x1="36" y1="34" x2="20" y2="24" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6"/>
      </svg>
    )
  },
  {
    type: 'd6',
    label: 'D6',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
        <rect x="6" y="6" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.15)"/>
        <circle cx="13" cy="13" r="2.5" fill="currentColor"/>
        <circle cx="27" cy="27" r="2.5" fill="currentColor"/>
        <circle cx="20" cy="20" r="2.5" fill="currentColor"/>
      </svg>
    )
  },
  {
    type: 'd8',
    label: 'D8',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
        <polygon points="20,4 35,20 20,36 5,20" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.15)" strokeLinejoin="round"/>
        <line x1="5" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6"/>
        <line x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6"/>
      </svg>
    )
  },
  {
    type: 'd10',
    label: 'D10',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
        <polygon points="20,3 36,16 20,37 4,16" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.15)" strokeLinejoin="round"/>
        <line x1="20" y1="3" x2="20" y2="37" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6"/>
      </svg>
    )
  },
  {
    type: 'd12',
    label: 'D12',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
        <polygon points="20,4 34,14 29,32 11,32 6,14" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.15)" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6"/>
      </svg>
    )
  },
  {
    type: 'd20',
    label: 'D20',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
        <polygon points="20,4 35,13 35,27 20,36 5,27 5,13" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.2)" strokeLinejoin="round"/>
        <polygon points="20,4 20,20 35,13" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7"/>
        <polygon points="20,4 20,20 5,13" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7"/>
        <polygon points="5,27 20,20 35,27" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7"/>
        <polygon points="20,20 20,36 35,27" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7"/>
        <polygon points="20,20 20,36 5,27" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7"/>
      </svg>
    )
  },
  {
    type: 'd100',
    label: 'D100',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
        <polygon points="14,4 28,14 28,26 14,36 2,26 2,14" stroke="currentColor" strokeWidth="2" fill="rgba(245,158,11,0.15)"/>
        <polygon points="26,10 38,18 38,28 26,36 16,28 16,18" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7"/>
      </svg>
    )
  }
];

export const DiceTray: React.FC = () => {
  const [history, setHistory] = useState<DiceRollResult[]>([]);
  const [activeDie, setActiveDie] = useState<DieType>('d20');
  const [rolling, setRolling] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<DiceRollResult | null>(null);

  const rollDie = (die: DieType) => {
    soundEffects.playDiceRollSound();
    setActiveDie(die);
    setRolling(true);

    const sides = DIE_SIDES[die];
    const rollValue = Math.floor(Math.random() * sides) + 1;
    const isCrit = die === 'd20' && rollValue === 20;
    const isFumble = die === 'd20' && rollValue === 1;

    setTimeout(() => {
      if (isCrit) {
        soundEffects.playCritSound();
      }

      const result: DiceRollResult = {
        id: `roll-${Date.now()}`,
        dieType: die,
        value: rollValue,
        timestamp: new Date().toLocaleTimeString('tr-TR'),
        isCrit,
        isFumble
      };

      setCurrentResult(result);
      setHistory((prev) => [result, ...prev.slice(0, 7)]);
      setRolling(false);
    }, 450);
  };

  return (
    <div id="dice-tray-container" className="dice-tray-card">
      <div className="dice-tray-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎲</span>
          <div>
            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.25rem' }}>
              D&D Beyond Tarzı Polhedral Zar Tepsisi
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Animasyonlu düşüş, sentetik ses ve kritik vuruş parçacık efekti
            </p>
          </div>
        </div>
      </div>

      {/* Zar Seçim Çubuğu */}
      <div className="dice-selector-bar" role="toolbar" aria-label="Zar Seçimi">
        {DICE_CONFIG.map((cfg) => (
          <button
            key={cfg.type}
            id={`btn-roll-${cfg.type}`}
            className={`dice-btn ${activeDie === cfg.type ? 'active' : ''}`}
            onClick={() => rollDie(cfg.type)}
            disabled={rolling}
            aria-label={`${cfg.label} Zarı At`}
          >
            <div className="dice-icon-wrapper">{cfg.iconSvg}</div>
            <span className="dice-btn-label">{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* Animasyonlu Düşüş ve Sonuç Alanı */}
      <div className="dice-stage-area">
        <div
          id="active-dice-stage"
          className={`dice-tumbler ${rolling ? 'rolling' : ''} ${
            currentResult?.isCrit ? 'crit-glow' : ''
          } ${currentResult?.isFumble ? 'fumble-glow' : ''}`}
        >
          {rolling ? (
            <div className="tumbler-spinner font-cinzel">?</div>
          ) : currentResult ? (
            <div className="result-display">
              <span className="result-number font-cinzel">{currentResult.value}</span>
              <span className="result-die-tag">
                {currentResult.dieType.toUpperCase()}
                {currentResult.isCrit ? ' • KRİTİK!' : currentResult.isFumble ? ' • ISKA!' : ''}
              </span>
            </div>
          ) : (
            <div className="empty-stage-hint font-cinzel">Bir zara tıkla ve at</div>
          )}
        </div>

        {/* Zar Geçmişi */}
        <div className="dice-history-panel" id="dice-history-list">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>
            Son Atışlar
          </div>
          {history.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Henüz zar atılmadı
            </div>
          ) : (
            <div className="history-pill-container">
              {history.map((h) => (
                <span
                  key={h.id}
                  className={`history-pill ${h.isCrit ? 'crit' : ''} ${h.isFumble ? 'fumble' : ''}`}
                >
                  <strong style={{ textTransform: 'uppercase' }}>{h.dieType}</strong>: {h.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

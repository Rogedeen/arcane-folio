import React, { useState, useEffect } from 'react';
import { DieType } from '../types/resources';
import { soundEffects } from '../utils/soundEffects';
import { syncService } from '../data/syncService';

const DIE_SIDES: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100
};

export interface SingleDieRoll {
  die: DieType;
  value: number;
  isCrit?: boolean;
  isFumble?: boolean;
}

export interface MultiDiceRollResult {
  id: string;
  label?: string;
  diceRolls: SingleDieRoll[];
  modifier: number;
  totalSum: number;
  timestamp: string;
  formula: string;
  hasCrit20?: boolean;
  hasFumble1?: boolean;
}

export function executeDicePoolRoll(
  pool: Record<DieType, number>,
  modifier: number = 0,
  label?: string
): MultiDiceRollResult {
  const diceRolls: SingleDieRoll[] = [];
  let baseSum = 0;
  let hasCrit20 = false;
  let hasFumble1 = false;
  const formulaParts: string[] = [];

  const order: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

  for (const die of order) {
    const count = pool[die] || 0;
    if (count > 0) {
      formulaParts.push(`${count}${die}`);
      const sides = DIE_SIDES[die];
      for (let i = 0; i < count; i++) {
        const val = Math.floor(Math.random() * sides) + 1;
        baseSum += val;
        const isCrit = die === 'd20' && val === 20;
        const isFumble = die === 'd20' && val === 1;
        if (isCrit) hasCrit20 = true;
        if (isFumble) hasFumble1 = true;

        diceRolls.push({
          die,
          value: val,
          isCrit,
          isFumble
        });
      }
    }
  }

  const formula = formulaParts.join(' + ') + (modifier !== 0 ? ` ${modifier > 0 ? '+' : '-'} ${Math.abs(modifier)}` : '');
  const totalSum = Math.max(0, baseSum + modifier);

  return {
    id: `multi-roll-${Date.now()}-${Math.random()}`,
    label,
    diceRolls,
    modifier,
    totalSum,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
    formula: formula || '0',
    hasCrit20,
    hasFumble1
  };
}

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
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none">
        <polygon points="20,4 36,34 4,34" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.15)" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    type: 'd6',
    label: 'D6',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none">
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
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none">
        <polygon points="20,4 35,20 20,36 5,20" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.15)" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    type: 'd10',
    label: 'D10',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none">
        <polygon points="20,3 36,16 20,37 4,16" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.15)" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    type: 'd12',
    label: 'D12',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none">
        <polygon points="20,4 34,14 29,32 11,32 6,14" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.15)" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    type: 'd20',
    label: 'D20',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none">
        <polygon points="20,4 35,13 35,27 20,36 5,27 5,13" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.2)" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    type: 'd100',
    label: 'D100',
    iconSvg: (
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none">
        <polygon points="14,4 28,14 28,26 14,36 2,26 2,14" stroke="currentColor" strokeWidth="2" fill="rgba(245,158,11,0.15)"/>
      </svg>
    )
  }
];

export const DiceTray: React.FC = () => {
  const [pool, setPool] = useState<Record<DieType, number>>({
    d4: 0,
    d6: 0,
    d8: 0,
    d10: 0,
    d12: 0,
    d20: 1, // Default 1d20
    d100: 0
  });

  const [modifier, setModifier] = useState<number>(0);
  const [rolling, setRolling] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<MultiDiceRollResult | null>(null);
  const [history, setHistory] = useState<MultiDiceRollResult[]>([]);

  // Canlı senkron dinleyicisi: Büyü veya skill hasarı tetiklendiğinde otomatik atış
  useEffect(() => {
    const unsub = syncService.subscribe((event) => {
      if (event.type === 'PING' && event.payload?.rollRequest) {
        const req = event.payload.rollRequest;
        const res = executeDicePoolRoll(req.pool, req.modifier || 0, req.label);
        setCurrentResult(res);
        setHistory((prev) => [res, ...prev.slice(0, 9)]);
        soundEffects.playDiceRollSound();
        if (res.hasCrit20) soundEffects.playCritSound();
      }
    });
    return unsub;
  }, []);

  const totalDiceInPool = Object.values(pool).reduce((sum, n) => sum + n, 0);

  const addDieToPool = (die: DieType) => {
    if (totalDiceInPool >= 20) return; // 20 zar sınırı
    setPool((prev) => ({ ...prev, [die]: (prev[die] || 0) + 1 }));
  };

  const removeDieFromPool = (die: DieType) => {
    setPool((prev) => ({ ...prev, [die]: Math.max(0, (prev[die] || 0) - 1) }));
  };

  const clearPool = () => {
    setPool({ d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 });
    setModifier(0);
  };

  const setPreset = (die: DieType, count: number, mod: number = 0) => {
    setPool({ d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0, [die]: count });
    setModifier(mod);
  };

  const handleRoll = () => {
    if (totalDiceInPool === 0) {
      // Zar seçili değilse otomatik 1d20 at
      addDieToPool('d20');
      return;
    }

    soundEffects.playDiceRollSound();
    setRolling(true);

    setTimeout(() => {
      const result = executeDicePoolRoll(pool, modifier);
      if (result.hasCrit20) {
        soundEffects.playCritSound();
      }
      setCurrentResult(result);
      setHistory((prev) => [result, ...prev.slice(0, 9)]);
      setRolling(false);
    }, 400);
  };

  return (
    <div id="dice-tray-container" className="dice-tray-card">
      <div className="dice-tray-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎲</span>
          <div>
            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.25rem' }}>
              Polhedral Zar Tepsisi & Coklu Zar Havuzu
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Google tarzı çoklu zar seçimi (örn: 6d8, 4d6), tek tek zar dökümü ve anlık toplam
            </p>
          </div>
        </div>
      </div>

      {/* Zar Seçim Çubuğu (Zar Ekleme) */}
      <div className="dice-selector-bar" role="toolbar" aria-label="Zar Seçimi">
        {DICE_CONFIG.map((cfg) => {
          const count = pool[cfg.type] || 0;
          return (
            <button
              key={cfg.type}
              id={`btn-roll-${cfg.type}`}
              className={`dice-btn ${count > 0 ? 'active' : ''}`}
              onClick={() => addDieToPool(cfg.type)}
              aria-label={`${cfg.label} Zarı At`}
            >
              <div className="dice-icon-wrapper">{cfg.iconSvg}</div>
              <span className="dice-btn-label">{cfg.label}</span>
              {count > 0 && <span className="pool-count-badge">x{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Seçili Zar Havuzu & Modifikatör Çubuğu */}
      <div className="pool-control-bar" id="pool-control-bar">
        <div className="pool-chips">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            ZAR HAVUZU:
          </span>
          {totalDiceInPool === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Zar seçilmedi (Yukarıdaki zarlara tıklayarak ekleyin)
            </span>
          ) : (
            Object.entries(pool).map(([die, count]) => {
              if (count === 0) return null;
              return (
                <span key={die} className="pool-chip" onClick={() => removeDieFromPool(die as DieType)}>
                  {count}{die} <span className="chip-remove">✕</span>
                </span>
              );
            })
          )}
        </div>

        <div className="pool-actions">
          {/* Modifikatör Stepper */}
          <div className="mod-stepper">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bonus:</span>
            <button className="mod-btn" onClick={() => setModifier((m) => m - 1)}>-</button>
            <span className="mod-val">{modifier >= 0 ? `+${modifier}` : modifier}</span>
            <button className="mod-btn" onClick={() => setModifier((m) => m + 1)}>+</button>
          </div>

          <button className="clear-pool-btn" onClick={clearPool} title="Havuzu Temizle">
            Temizle
          </button>

          <button
            id="btn-execute-dice-roll"
            className="action-button roll-pool-btn"
            onClick={handleRoll}
            disabled={rolling}
            aria-label="Havuzdaki Zarları At"
          >
            {rolling ? '🎲 Atılıyor...' : `🎲 Zarları At (${totalDiceInPool})`}
          </button>
        </div>
      </div>

      {/* Hızlı Şablonlar */}
      <div className="quick-presets-row">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hazır Kalıplar:</span>
        <button className="preset-btn" onClick={() => setPreset('d20', 1, 0)}>1d20</button>
        <button className="preset-btn" onClick={() => setPreset('d6', 2, 0)}>2d6</button>
        <button className="preset-btn" onClick={() => setPreset('d6', 4, 0)}>4d6 (Stat)</button>
        <button className="preset-btn" onClick={() => setPreset('d8', 8, 0)}>8d8 (Fireball)</button>
        <button className="preset-btn" onClick={() => setPreset('d12', 1, 3)}>1d12+3</button>
      </div>

      {/* Sonuç Sahnesi */}
      <div className="dice-stage-area" id="dice-stage-area">
        <div
          id="active-dice-stage"
          className={`dice-tumbler ${rolling ? 'rolling' : ''} ${
            currentResult?.hasCrit20 ? 'crit-glow' : ''
          } ${currentResult?.hasFumble1 ? 'fumble-glow' : ''}`}
        >
          {rolling ? (
            <div className="tumbler-spinner font-cinzel">?</div>
          ) : currentResult ? (
            <div className="result-display">
              <span className="result-number font-cinzel">{currentResult.totalSum}</span>
              <span className="result-die-tag">
                {currentResult.formula}
                {currentResult.hasCrit20 ? ' • KRITIK 20!' : currentResult.hasFumble1 ? ' • ISKA (1)!' : ''}
              </span>
            </div>
          ) : (
            <div className="empty-stage-hint font-cinzel">Zar havuzunu atın</div>
          )}
        </div>

        {/* Tek Tek Zarların Dökümü ve Geçmiş */}
        <div className="dice-history-panel" id="dice-history-list">
          {currentResult && currentResult.diceRolls.length > 0 && (
            <div className="current-roll-breakdown" id="current-roll-breakdown">
              <span className="breakdown-label">ZAR DETAYLARI ({currentResult.formula}):</span>
              <div className="dice-chips-container">
                {currentResult.diceRolls.map((dr, idx) => (
                  <span
                    key={idx}
                    className={`die-single-chip ${dr.isCrit ? 'crit' : ''} ${dr.isFumble ? 'fumble' : ''}`}
                  >
                    {dr.die}: <strong>{dr.value}</strong>
                  </span>
                ))}
                {currentResult.modifier !== 0 && (
                  <span className="die-single-chip mod">
                    Mod: <strong>{currentResult.modifier > 0 ? `+${currentResult.modifier}` : currentResult.modifier}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700, marginTop: '0.5rem' }}>
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
                  className={`history-pill ${h.hasCrit20 ? 'crit' : ''} ${h.hasFumble1 ? 'fumble' : ''}`}
                >
                  <strong>{h.formula}</strong> = {h.totalSum}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

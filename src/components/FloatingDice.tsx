import React, { useState } from 'react';
import { DieType } from '../types/resources';
import { soundEffects } from '../utils/soundEffects';
import { syncService } from '../data/syncService';
import { useCharacter } from '../context/CharacterContext';

const DICE_TYPES: { type: DieType; label: string; sides: number; icon: string }[] = [
  { type: 'd20', label: 'd20', sides: 20, icon: '🎲' },
  { type: 'd4', label: 'd4', sides: 4, icon: '🔺' },
  { type: 'd6', label: 'd6', sides: 6, icon: '🧊' },
  { type: 'd8', label: 'd8', sides: 8, icon: '💎' },
  { type: 'd10', label: 'd10', sides: 10, icon: '⭐' },
  { type: 'd12', label: 'd12', sides: 12, icon: '🔮' },
  { type: 'd100', label: 'd100', sides: 100, icon: '💯' },
];

interface QuickRollResult {
  die: DieType;
  rolls: number[];
  chosen: number;
  modifier: number;
  total: number;
  mode: 'normal' | 'advantage' | 'disadvantage';
  isCrit: boolean;
  isFumble: boolean;
  timestamp: string;
}

interface FloatingDiceProps {
  onOpenFullTray?: () => void;
}

export const FloatingDice: React.FC<FloatingDiceProps> = ({ onOpenFullTray }) => {
  const { activeCharacter } = useCharacter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDie, setSelectedDie] = useState<DieType>('d20');
  const [mode, setMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const [modifier, setModifier] = useState<number>(0);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<QuickRollResult | null>(null);

  const rollDie = (sides: number): number => Math.floor(Math.random() * sides) + 1;

  const handleRoll = () => {
    setIsRolling(true);
    soundEffects.playDiceRollSound();

    setTimeout(() => {
      const sides = DICE_TYPES.find((d) => d.type === selectedDie)?.sides || 20;
      let rolls: number[] = [];
      let chosen = 0;

      if (selectedDie === 'd20' && mode !== 'normal') {
        const r1 = rollDie(sides);
        const r2 = rollDie(sides);
        rolls = [r1, r2];
        chosen = mode === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
      } else {
        const r = rollDie(sides);
        rolls = [r];
        chosen = r;
      }

      const total = chosen + modifier;
      const isCrit = selectedDie === 'd20' && chosen === 20;
      const isFumble = selectedDie === 'd20' && chosen === 1;

      if (isCrit) {
        soundEffects.playCritSound();
      }

      const result: QuickRollResult = {
        die: selectedDie,
        rolls,
        chosen,
        modifier,
        total,
        mode,
        isCrit,
        isFumble,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setLastResult(result);
      setIsRolling(false);

      // Kampanya aktifse diğer oyunculara yayınla
      syncService.broadcastDiceRoll({
        id: `quick-${Date.now()}`,
        label: `${activeCharacter?.name ?? 'Oyuncu'} • ${selectedDie.toUpperCase()}${mode !== 'normal' ? ` (${mode === 'advantage' ? 'Avantaj' : 'Dezavantaj'})` : ''}`,
        diceRolls: rolls.map((v) => ({
          die: selectedDie,
          value: v,
          isCrit: selectedDie === 'd20' && v === 20,
          isFumble: selectedDie === 'd20' && v === 1,
        })),
        modifier,
        totalSum: total,
        timestamp: result.timestamp,
        formula: `${selectedDie}${modifier >= 0 ? `+${modifier}` : modifier}`,
        hasCrit20: isCrit,
        hasFumble1: isFumble,
      });
    }, 350);
  };

  return (
    <aside className="floating-dice-wrapper" aria-label="Zar Araçları">
      {/* 1. Hızlı Zar Popup'ı */}
      {isOpen && (
        <div className="floating-dice-popup" id="floating-dice-popup" role="dialog" aria-label="Hızlı Zar Atıcı">
          <div className="floating-popup-header">
            <span className="floating-popup-title font-cinzel">🎲 Hızlı Zar Tepsisi</span>
            <button
              id="btn-close-floating-dice"
              className="floating-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>

          {/* Zar Seçim Çubuğu */}
          <div className="floating-dice-selector">
            {DICE_TYPES.map((d) => (
              <button
                key={d.type}
                id={`btn-quick-die-${d.type}`}
                className={`floating-die-btn ${selectedDie === d.type ? 'active' : ''}`}
                onClick={() => setSelectedDie(d.type)}
                title={d.label}
              >
                <span className="die-btn-icon">{d.icon}</span>
                <span className="die-btn-label">{d.label}</span>
              </button>
            ))}
          </div>

          {/* Sadece d20 için Avantaj / Dezavantaj Barı */}
          {selectedDie === 'd20' && (
            <div className="floating-mode-selector">
              <button
                id="btn-mode-advantage"
                className={`mode-btn ${mode === 'advantage' ? 'active-adv' : ''}`}
                onClick={() => setMode(mode === 'advantage' ? 'normal' : 'advantage')}
              >
                ✨ Avantaj (2d20 Yüksek)
              </button>
              <button
                id="btn-mode-disadvantage"
                className={`mode-btn ${mode === 'disadvantage' ? 'active-dis' : ''}`}
                onClick={() => setMode(mode === 'disadvantage' ? 'normal' : 'disadvantage')}
              >
                ⚠️ Dezavantaj (2d20 Düşük)
              </button>
            </div>
          )}

          {/* Modifikatör Stepper */}
          <div className="floating-modifier-row">
            <label className="floating-mod-label">Modifikatör:</label>
            <div className="floating-stepper">
              <button
                id="btn-quick-mod-dec"
                className="floating-stepper-btn"
                onClick={() => setModifier((m) => m - 1)}
              >
                -
              </button>
              <span id="display-quick-mod" className="floating-mod-val">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </span>
              <button
                id="btn-quick-mod-inc"
                className="floating-stepper-btn"
                onClick={() => setModifier((m) => m + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Fırlatma Butonu */}
          <button
            id="btn-quick-roll-action"
            className={`floating-roll-btn ${isRolling ? 'rolling' : ''}`}
            onClick={handleRoll}
            disabled={isRolling}
          >
            {isRolling ? '🎲 Zarlar Atılıyor...' : `🎲 ${selectedDie.toUpperCase()} At`}
          </button>

          {/* Sonuç Alanı */}
          {lastResult && (
            <div
              className={`floating-result-box ${lastResult.isCrit ? 'crit' : ''} ${lastResult.isFumble ? 'fumble' : ''}`}
              id="floating-roll-result"
            >
              {lastResult.isCrit && <div className="result-crit-tag">🌟 DOĞAL 20! KRİTİK BAŞARI! 🌟</div>}
              {lastResult.isFumble && <div className="result-fumble-tag">💀 DOĞAL 1! KRİTİK BAŞARISIZLIK! 💀</div>}

              <div className="result-main-number">{lastResult.total}</div>

              <div className="result-details">
                {lastResult.rolls.length > 1 ? (
                  <span>
                    Atılan: [{lastResult.rolls.join(', ')}] ➔ Seçilen: {lastResult.chosen}{' '}
                    {lastResult.modifier !== 0 && `(${lastResult.modifier >= 0 ? `+${lastResult.modifier}` : lastResult.modifier})`}
                  </span>
                ) : (
                  <span>
                    Zar: {lastResult.chosen}{' '}
                    {lastResult.modifier !== 0 && `${lastResult.modifier >= 0 ? `+ ${lastResult.modifier}` : `- ${Math.abs(lastResult.modifier)}`}`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tam tepsiye geçiş linki */}
          {onOpenFullTray && (
            <div className="floating-popup-footer">
              <button
                id="btn-open-full-dice-tray"
                className="full-tray-link"
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullTray();
                }}
              >
                Gelişmiş Zar Masasını Aç ➔
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Sabit Yüzen Buton (FAB) */}
      <button
        id="btn-floating-dice"
        className={`floating-fab-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Hızlı Zar Masası"
        title="Hızlı Zar Masasını Aç / Kapat"
      >
        <span className="fab-icon">🎲</span>
        {lastResult && !isOpen && (
          <span className={`fab-last-badge ${lastResult.isCrit ? 'crit' : ''} ${lastResult.isFumble ? 'fumble' : ''}`}>
            {lastResult.total}
          </span>
        )}
      </button>
    </aside>
  );
};

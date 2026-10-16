import React from 'react';

interface CombatModePanelProps {
  combatMode: boolean;
  actionUsed: boolean;
  onToggleAction: () => void;
  bonusActionUsed: boolean;
  onToggleBonusAction: () => void;
  reactionUsed: boolean;
  onToggleReaction: () => void;
  remainingSpeed: number;
  baseSpeed: number;
  onSpendSpeed: (amount: number) => void;
  onResetSpeed: () => void;
  onEndTurn: () => void;
}

export const CombatModePanel: React.FC<CombatModePanelProps> = ({
  combatMode,
  actionUsed,
  onToggleAction,
  bonusActionUsed,
  onToggleBonusAction,
  reactionUsed,
  onToggleReaction,
  remainingSpeed,
  baseSpeed,
  onSpendSpeed,
  onResetSpeed,
  onEndTurn,
}) => {
  if (!combatMode) return null;

  return (
    <section className="combat-mode-turn-panel" id="combat-mode-panel">
      <div className="combat-panel-top">
        <div className="combat-turn-indicator">
          <span className="combat-live-indicator"></span>
          <span className="font-cinzel combat-heading">SAVAŞ MODU • SENİN TURUN</span>
        </div>
        <button
          id="btn-combat-end-turn"
          className="combat-end-turn-btn"
          onClick={onEndTurn}
        >
          🔄 Sırayı / Turu Bitir (Eylemleri Tazele)
        </button>
      </div>

      <div className="combat-slots-grid">
        {/* Action */}
        <div
          className={`combat-slot-card ${actionUsed ? 'used' : 'ready'}`}
          onClick={onToggleAction}
          role="button"
          tabIndex={0}
          title="Tıklayarak harca veya geri al"
        >
          <div className="slot-type">ANA EYLEM (ACTION)</div>
          <div className="slot-state">{actionUsed ? '✓ Harcandı' : '⚡ 1/1 Hazır'}</div>
          <div className="slot-desc">Saldırı, Büyü Yapma, Dash, Dodge vb.</div>
        </div>

        {/* Bonus Action */}
        <div
          className={`combat-slot-card ${bonusActionUsed ? 'used' : 'ready'}`}
          onClick={onToggleBonusAction}
          role="button"
          tabIndex={0}
          title="Tıklayarak harca veya geri al"
        >
          <div className="slot-type">BONUS ACTION</div>
          <div className="slot-state">{bonusActionUsed ? '✓ Harcandı' : '✨ 1/1 Hazır'}</div>
          <div className="slot-desc">Hızlı büyüler, İkinci Nefes vb.</div>
        </div>

        {/* Reaction */}
        <div
          className={`combat-slot-card ${reactionUsed ? 'used' : 'ready'}`}
          onClick={onToggleReaction}
          role="button"
          tabIndex={0}
          title="Tıklayarak harca veya geri al"
        >
          <div className="slot-type">TEPKİ (REACTION)</div>
          <div className="slot-state">{reactionUsed ? '✓ Harcandı' : '🛡️ 1/1 Hazır'}</div>
          <div className="slot-desc">Fırsat saldırısı, Kalkan büyüsü vb.</div>
        </div>

        {/* Movement Speed */}
        <div className="combat-slot-card movement-tracker">
          <div className="slot-type">HAREKET (SPEED)</div>
          <div className="movement-display">
            <span className="movement-current" id="val-remaining-speed">
              {remainingSpeed}
            </span>
            <span className="movement-max">/ {baseSpeed} ft</span>
          </div>
          <div className="movement-actions">
            <button
              type="button"
              disabled={remainingSpeed <= 0}
              onClick={() => onSpendSpeed(5)}
              title="5 ft yürü"
            >
              -5 ft
            </button>
            <button
              type="button"
              disabled={remainingSpeed <= 0}
              onClick={() => onSpendSpeed(10)}
              title="10 ft yürü"
            >
              -10 ft
            </button>
            <button
              type="button"
              disabled={remainingSpeed >= baseSpeed}
              onClick={() => onSpendSpeed(-5)}
              title="5 ft geri al"
            >
              +5 ft
            </button>
            <button
              type="button"
              className="reset-speed-btn"
              onClick={onResetSpeed}
              title="Hareketi sıfırla (tazele)"
            >
              ↺
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

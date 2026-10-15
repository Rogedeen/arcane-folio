import React, { useState } from 'react';
import { DeathSavesState, INITIAL_DEATH_SAVES, processDeathSaveRoll } from '../rules/deathSaves';
import { soundEffects } from '../utils/soundEffects';

interface DeathSavesProps {
  currentHp: number;
  onRegainHp?: (hp: number) => void;
  initialSuccesses?: number;
  initialFailures?: number;
  onSavesChange?: (successes: number, failures: number) => void;
}

export const DeathSaves: React.FC<DeathSavesProps> = ({
  currentHp,
  onRegainHp,
  initialSuccesses = 0,
  initialFailures = 0,
  onSavesChange,
}) => {
  const [state, setState] = useState<DeathSavesState>(
    initialSuccesses > 0 || initialFailures > 0
      ? { ...INITIAL_DEATH_SAVES, successes: initialSuccesses, failures: initialFailures }
      : INITIAL_DEATH_SAVES
  );
  const isDying = currentHp <= 0;

  const handleRollDeathSave = () => {
    soundEffects.playDiceRollSound();
    const roll = Math.floor(Math.random() * 20) + 1;
    const next = processDeathSaveRoll(roll, state);
    setState(next);
    if (onSavesChange) onSavesChange(next.successes, next.failures);

    if (roll === 20) {
      soundEffects.playCritSound();
      if (onRegainHp) onRegainHp(1);
    }
  };

  const handleReset = () => {
    setState(INITIAL_DEATH_SAVES);
    if (onSavesChange) onSavesChange(0, 0);
  };

  return (
    <div
      id="death-saves-container"
      className={`death-saves-box ${isDying ? 'active-dying' : ''} ${state.isDead ? 'character-dead' : ''}`}
    >
      <div className="death-saves-header">
        <span className="font-cinzel death-widget-title">
          💀 ÖLÜM KURTARMA (Death Saves)
        </span>
        <button
          id="btn-reset-death-saves"
          className="reset-saves-btn"
          onClick={handleReset}
          aria-label="Ölüm Zarlarını Sıfırla"
          title="Sıfırla"
        >
          Sıfırla
        </button>
      </div>

      {isDying && !state.isDead && !state.isStable && (
        <div className="dying-pulse-alert">⚠️ CAN 0: ÖLÜM TEHLİKESİ!</div>
      )}
      {state.isDead && (
        <div className="dead-alert">💀 KARAKTER ÖLDÜ</div>
      )}
      {state.isStable && (
        <div className="stable-alert">🛡️ DURUM DENGLENDİ (STABLE)</div>
      )}

      <div className="death-tracks-vertical">
        {/* Başarılar (Successes) */}
        <div className="track-row">
          <span className="track-label success-label">BAŞARI</span>
          <div className="pips-group" id="death-success-pips">
            {[1, 2, 3].map((idx) => (
              <span
                key={idx}
                className={`death-pip success ${state.successes >= idx ? 'filled' : ''}`}
                id={`pip-death-success-${idx}`}
              >
                ●
              </span>
            ))}
          </div>
        </div>

        {/* Başarısızlıklar (Failures) */}
        <div className="track-row">
          <span className="track-label failure-label">BAŞARISIZ</span>
          <div className="pips-group" id="death-failure-pips">
            {[1, 2, 3].map((idx) => (
              <span
                key={idx}
                className={`death-pip failure ${state.failures >= idx ? 'filled' : ''}`}
                id={`pip-death-failure-${idx}`}
              >
                ●
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Zar Butonu */}
      <div className="roll-action-wrap">
        <button
          id="btn-roll-death-save"
          className="action-button roll-death-btn"
          onClick={handleRollDeathSave}
          disabled={state.isDead || state.isStable}
          aria-label="Ölüm Kurtarma Zarı At"
        >
          🎲 Zar At (d20)
        </button>
      </div>

      {state.message && (
        <div className="death-message-alert" id="death-save-message">
          {state.message}
        </div>
      )}
    </div>
  );
};


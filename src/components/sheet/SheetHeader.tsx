import React from 'react';
import type { FullCharacter } from '../../types/character';

interface SheetHeaderProps {
  character: FullCharacter;
  combatMode: boolean;
  onToggleCombatMode: () => void;
  onShortRest: () => void;
  onLongRest: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({
  character,
  combatMode,
  onToggleCombatMode,
  onShortRest,
  onLongRest,
  isLocked,
  onToggleLock,
}) => {
  return (
    <header className="dndbeyond-top-bar" id="sheet-header">
      <div className="dndbeyond-avatar-name">
        <div className="dndbeyond-avatar-circle font-cinzel">
          {character.name.charAt(0)}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 className="font-cinzel" style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.4rem' }}>
              {character.name}
            </h2>
            {character.subclass && (
              <span
                style={{
                  fontSize: '0.78rem',
                  background: 'rgba(212, 175, 53, 0.15)',
                  color: 'var(--accent-gold)',
                  border: '1px solid var(--border-bronze)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                }}
              >
                {character.subclass}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {character.race} • {character.class.toUpperCase()} Seviye {character.level} • {character.background}
            {character.playerName && ` • 👤 ${character.playerName}`}
          </div>
        </div>
      </div>

      {/* Sağ Kısım: Savaş Modu, Dinlenme ve Stat Kilidi */}
      <div className="dndbeyond-rest-btn-group">
        <button
          id="btn-toggle-combat-mode"
          className={`dndbeyond-rest-btn ${combatMode ? 'combat-mode-active' : ''}`}
          onClick={onToggleCombatMode}
          title="Savaş Modu (Action / Bonus / Movement Takibi)"
        >
          ⚔️ {combatMode ? 'SAVAŞ MODU (AÇIK)' : 'SAVAŞ MODU'}
        </button>
        <button
          id="btn-short-rest"
          className="dndbeyond-rest-btn"
          onClick={onShortRest}
          title="Kısa Dinlenme (Can zarı harca)"
        >
          ⛺ SHORT REST
        </button>
        <button
          id="btn-long-rest"
          className="dndbeyond-rest-btn"
          onClick={onLongRest}
          title="Uzun Dinlenme (Tüm canı yenile)"
        >
          🌙 LONG REST
        </button>
        <button
          id="btn-toggle-stat-lock"
          className="dndbeyond-rest-btn"
          onClick={onToggleLock}
          title={isLocked ? 'Statlar kilitli' : 'Stat düzenleme modu açık'}
        >
          {isLocked ? '🔒 Kilitli' : '🔓 Duzenle'}
        </button>
      </div>
    </header>
  );
};

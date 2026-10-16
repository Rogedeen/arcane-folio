import React from 'react';

export interface MonsterTargetFog {
  id: string;
  name: string;
  totalDamageTaken: number;
}

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
  monsterTargets?: MonsterTargetFog[];
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
  monsterTargets = [],
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

      {/* SAVAŞ SİSİ (Fog of War) — Hedef Alınabilir Canavarlar */}
      {monsterTargets.length > 0 && (
        <div
          className="combat-fog-of-war-section"
          id="combat-fog-targets"
          style={{
            marginTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '0.85rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.6rem',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--accent-gold)',
                letterSpacing: '0.06em',
              }}
            >
              🎯 HEDEF ALINABİLİR DÜŞMANLAR (SAVAŞ SİSİ)
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              (Zırh ve can puanı gizlenmiştir • Yalnızca toplam hasar görünür)
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.6rem',
            }}
          >
            {monsterTargets.map((m) => (
              <div
                key={m.id}
                style={{
                  background: 'rgba(20, 16, 14, 0.75)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.55rem 0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  ⚔️ {m.name}
                </strong>
                <span
                  style={{
                    fontSize: '0.75rem',
                    background:
                      m.totalDamageTaken > 0
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                    color: m.totalDamageTaken > 0 ? '#fca5a5' : 'var(--text-muted)',
                    border: `1px solid ${
                      m.totalDamageTaken > 0
                        ? 'rgba(239, 68, 68, 0.4)'
                        : 'rgba(255, 255, 255, 0.1)'
                    }`,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  {m.totalDamageTaken > 0 ? `💥 ${m.totalDamageTaken} Hasar Aldı` : 'Hasar Yok'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

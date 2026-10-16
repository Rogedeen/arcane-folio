import React from 'react';
import type { FullCharacter } from '../../types/character';
import { useCharacter } from '../../context/CharacterContext';
import { getTranslation } from '../../utils/i18n';

interface SheetHeaderProps {
  character: FullCharacter;
  combatMode: boolean;
  onToggleCombatMode: () => void;
  onShortRest: () => void;
  onLongRest: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
  onJoinCampaign?: (inviteCode: string) => void;
  joinedCampaignCode?: string | null;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({
  character,
  combatMode,
  onToggleCombatMode,
  onShortRest,
  onLongRest,
  isLocked,
  onToggleLock,
  onJoinCampaign,
  joinedCampaignCode,
}) => {
  const { state } = useCharacter();
  const t = getTranslation(state.preferences.language || 'tr');
  const [showJoinModal, setShowJoinModal] = React.useState<boolean>(false);
  const [inviteInput, setInviteInput] = React.useState<string>('');
  const [joinMsg, setJoinMsg] = React.useState<string>('');

  const handleJoin = () => {
    const code = inviteInput.trim().toUpperCase();
    if (code.length !== 6) {
      setJoinMsg(t.joinModalInvalid);
      return;
    }
    if (onJoinCampaign) {
      onJoinCampaign(code);
    }
    setJoinMsg(`${t.joinModalSuccess}: ${code}`);
    setTimeout(() => {
      setShowJoinModal(false);
      setJoinMsg('');
    }, 1500);
  };

  return (
    <header className="dndbeyond-top-bar" id="sheet-header">
      <div className="dndbeyond-avatar-name">
        <div className="dndbeyond-avatar-circle font-cinzel">
          {character.name.charAt(0)}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
            {joinedCampaignCode && (
              <span
                id="sheet-campaign-badge"
                style={{
                  fontSize: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '9999px',
                  fontWeight: 700
                }}
              >
                🏰 {t.joinedCampaign}: {joinedCampaignCode}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {character.race} • {character.class.toUpperCase()} {t.levelShort} {character.level} • {character.background}
            {character.playerName && ` • 👤 ${character.playerName}`}
          </div>
        </div>
      </div>

      {/* Sağ Kısım: Sefere Katıl, Savaş Modu, Dinlenme ve Stat Kilidi */}
      <div className="dndbeyond-rest-btn-group" style={{ flexWrap: 'wrap' }}>
        <button
          id="btn-player-join-campaign"
          className="dndbeyond-rest-btn"
          onClick={() => setShowJoinModal(true)}
          title="DM Seferine Davet Koduyla Katıl"
          style={{
            borderColor: joinedCampaignCode ? 'var(--accent-emerald)' : 'var(--accent-gold)',
            color: joinedCampaignCode ? '#34d399' : 'var(--accent-gold)',
            background: 'rgba(212, 175, 53, 0.08)'
          }}
        >
          🏰 {joinedCampaignCode ? `${t.joinedCampaign}: ${joinedCampaignCode}` : t.joinCampaign}
        </button>
        <button
          id="btn-toggle-combat-mode"
          className={`dndbeyond-rest-btn ${combatMode ? 'combat-mode-active' : ''}`}
          onClick={onToggleCombatMode}
          title="Savaş Modu (Action / Bonus / Movement Takibi)"
        >
          ⚔️ {combatMode ? t.combatModeOn : t.combatModeOff}
        </button>
        <button
          id="btn-short-rest"
          className="dndbeyond-rest-btn"
          onClick={onShortRest}
          title="Kısa Dinlenme (Can zarı harca)"
        >
          ⛺ {t.shortRest}
        </button>
        <button
          id="btn-long-rest"
          className="dndbeyond-rest-btn"
          onClick={onLongRest}
          title="Uzun Dinlenme (Tüm canı yenile)"
        >
          🌙 {t.longRest}
        </button>
        <button
          id="btn-toggle-stat-lock"
          className="dndbeyond-rest-btn"
          onClick={onToggleLock}
          title={isLocked ? 'Statlar kilitli' : 'Stat düzenleme modu açık'}
        >
          {isLocked ? t.locked : t.unlocked}
        </button>
      </div>

      {/* Sefere Katıl Açılır Modalı */}
      {showJoinModal && (
        <div
          id="modal-join-campaign-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setShowJoinModal(false)}
        >
          <div
            id="modal-join-campaign-content"
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: 'var(--shadow-glow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 0.5rem 0' }}>
              {t.joinModalTitle}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.2rem', lineHeight: 1.5 }}>
              {t.joinModalDesc}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                id="input-sheet-campaign-code"
                type="text"
                maxLength={6}
                placeholder={t.joinModalPlaceholder}
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border-bronze)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                }}
              />
              <button
                id="btn-confirm-sheet-join"
                className="action-button"
                onClick={handleJoin}
                style={{ padding: '0.65rem 1.25rem' }}
              >
                {t.joinModalBtn}
              </button>
            </div>
            {joinMsg && (
              <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600, marginTop: '0.5rem' }}>
                {joinMsg}
              </div>
            )}
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button
                className="action-button-secondary"
                onClick={() => setShowJoinModal(false)}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
              >
                {t.joinModalClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

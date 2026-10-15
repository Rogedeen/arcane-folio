import React, { useState, useEffect } from 'react';
import { Campaign, PartyMember, UserRole, SyncEvent } from '../types/campaign';
import { isValidInviteCode, generateInviteCode } from '../rules/campaignRules';
import { syncService } from '../data/syncService';
import { DmDashboard } from './DmDashboard';
import { EncounterTracker } from './EncounterTracker';

const INITIAL_MEMBERS: PartyMember[] = [
  {
    id: 'char-1',
    name: 'Kaelen Karaçekiç',
    charClass: 'Savaşçı (Fighter)',
    level: 3,
    currentHp: 28,
    maxHp: 28,
    tempHp: 0,
    ac: 16,
    passivePerception: 11,
    passiveInvestigation: 10,
    stats: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 },
    activeConditions: [],
    playerName: 'Ahmet'
  },
  {
    id: 'char-2',
    name: 'Elira Fırtınasoy',
    charClass: 'Büyücü (Wizard)',
    level: 3,
    currentHp: 18,
    maxHp: 18,
    tempHp: 0,
    ac: 12,
    passivePerception: 14,
    passiveInvestigation: 15,
    stats: { str: 8, dex: 14, con: 12, int: 18, wis: 14, cha: 10 },
    activeConditions: [],
    playerName: 'Zeynep'
  },
  {
    id: 'char-3',
    name: 'Thokk Gölgekesen',
    charClass: 'Hırsız (Rogue)',
    level: 3,
    currentHp: 21,
    maxHp: 21,
    tempHp: 0,
    ac: 15,
    passivePerception: 16,
    passiveInvestigation: 14,
    stats: { str: 10, dex: 18, con: 12, int: 14, wis: 14, cha: 12 },
    activeConditions: ['Görünmez'],
    playerName: 'Barış'
  }
];

export const CampaignView: React.FC = () => {
  const [campaign, setCampaign] = useState<Campaign>({
    id: 'camp-default',
    title: 'Ejderha Mızrağı Seferi',
    dmName: 'Zindan Efendisi (DM)',
    inviteCode: 'DRG924',
    members: INITIAL_MEMBERS,
    createdAt: new Date().toISOString()
  });

  const [userRole, setUserRole] = useState<UserRole>('dm');
  const [dmSubTab, setDmSubTab] = useState<'party' | 'encounter'>('party');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');

  // Canlı Senkronizasyon Dinleyicisi
  useEffect(() => {
    const unsubscribe = syncService.subscribe((event: SyncEvent) => {
      if (event.type === 'HP_UPDATE') {
        const { memberId, delta, isHealing } = event.payload;
        setCampaign((prev) => ({
          ...prev,
          members: prev.members.map((m) => {
            if (m.id === memberId) {
              const newHp = isHealing
                ? Math.min(m.maxHp, m.currentHp + Math.abs(delta))
                : Math.max(0, m.currentHp - Math.abs(delta));
              return { ...m, currentHp: newHp };
            }
            return m;
          })
        }));
      } else if (event.type === 'CONDITION_UPDATE') {
        const { memberId, condId } = event.payload;
        setCampaign((prev) => ({
          ...prev,
          members: prev.members.map((m) => {
            if (m.id === memberId) {
              const exists = m.activeConditions.includes(condId);
              const next = exists
                ? m.activeConditions.filter((c) => c !== condId)
                : [...m.activeConditions, condId];
              return { ...m, activeConditions: next };
            }
            return m;
          })
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(campaign.inviteCode);
    setCopyFeedback('Kopyalandı!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const handleJoinCampaign = () => {
    if (!isValidInviteCode(joinCodeInput)) {
      setJoinError('Geçersiz davet kodu! 6 haneli alfasayısal kod giriniz.');
      return;
    }

    setJoinError('');
    setCampaign((prev) => ({
      ...prev,
      inviteCode: joinCodeInput.trim().toUpperCase()
    }));
    setJoinCodeInput('');
  };

  const handleRegenerateCode = () => {
    const nextCode = generateInviteCode();
    setCampaign((prev) => ({ ...prev, inviteCode: nextCode }));
  };

  return (
    <div id="campaign-view-container" className="campaign-card">
      <div className="campaign-top-bar">
        <div>
          <span className="live-sync-pill" id="live-sync-indicator">
            <span className="live-pulse">●</span> Canlı Senkronize (Realtime Aktif)
          </span>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', marginTop: '0.4rem' }}>
            🏰 Kampanya: {campaign.title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Yönetici: <strong>{campaign.dmName}</strong> | Davet Kodu ve Parti Takibi
          </p>
        </div>

        {/* Rol Değiştirici */}
        <div className="role-switch-group">
          <button
            id="btn-switch-role-dm"
            className={`role-switch-btn ${userRole === 'dm' ? 'active' : ''}`}
            onClick={() => setUserRole('dm')}
            aria-label="DM Moduna Geç"
          >
            🧙‍♂️ DM Modu
          </button>
          <button
            id="btn-switch-role-player"
            className={`role-switch-btn ${userRole === 'player' ? 'active' : ''}`}
            onClick={() => setUserRole('player')}
            aria-label="Oyuncu Moduna Geç"
          >
            🛡️ Oyuncu Modu
          </button>
        </div>
      </div>

      {/* Davet Kodu & Katılım Paneli */}
      <div className="invite-panel-row">
        <div className="invite-box" id="invite-box">
          <span className="invite-label">KAMPANYA DAVET KODU</span>
          <div className="invite-action-group">
            <span className="invite-code-display" id="display-invite-code">
              {campaign.inviteCode}
            </span>
            <button
              id="btn-copy-invite-code"
              className="copy-btn"
              onClick={handleCopyCode}
              aria-label="Davet Kodunu Kopyala"
            >
              {copyFeedback || '📋 Kopyala'}
            </button>
            {userRole === 'dm' && (
              <button
                id="btn-regen-invite-code"
                className="copy-btn"
                onClick={handleRegenerateCode}
                aria-label="Yeni Kod Üret"
                title="Yeni Davet Kodu Üret"
              >
                🔄 Yenile
              </button>
            )}
          </div>
        </div>

        <div className="join-box">
          <span className="invite-label">FARKLI BİR KAMPANYAYA KATIL</span>
          <div className="join-action-group">
            <input
              id="input-join-code"
              type="text"
              maxLength={6}
              placeholder="Örn: ARC842"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              className="join-input"
              aria-label="Katılma Davet Kodu"
            />
            <button
              id="btn-join-campaign"
              className="action-button"
              style={{ minHeight: '44px' }}
              onClick={handleJoinCampaign}
              aria-label="Kampanyaya Katıl"
            >
              Katıl 🚀
            </button>
          </div>
          {joinError && <div id="join-error-msg" className="join-error-text">{joinError}</div>}
        </div>
      </div>

      {/* DM Konsolu & Karşılaşma Seçici */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          id="btn-dm-tab-party"
          className={`sheet-tab-btn ${dmSubTab === 'party' ? 'active' : ''}`}
          onClick={() => setDmSubTab('party')}
          style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}
        >
          👥 Parti Genel Bakış ({campaign.members.length})
        </button>
        <button
          id="btn-dm-tab-encounter"
          className={`sheet-tab-btn ${dmSubTab === 'encounter' ? 'active' : ''}`}
          onClick={() => setDmSubTab('encounter')}
          style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}
        >
          ⚔️ Karşılaşma & İnisiyatif Takipçisi
        </button>
      </div>

      {dmSubTab === 'party' ? (
        <DmDashboard
          members={campaign.members}
          userRole={userRole}
          onUpdateMembers={(next) => setCampaign((prev) => ({ ...prev, members: next }))}
        />
      ) : (
        <EncounterTracker partyMembers={campaign.members} />
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Campaign, PartyMember, UserRole, SyncEvent } from '../types/campaign';
import { isValidInviteCode, generateInviteCode } from '../rules/campaignRules';
import { syncService } from '../data/syncService';
import { loadCampaign, saveCampaign } from '../data/persistenceService';
import { useCharacter } from '../context/CharacterContext';
import { getTranslation } from '../utils/i18n';
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
  const { state } = useCharacter();
  const lang = state.preferences?.language || 'tr';
  const t = getTranslation(lang);

  const [campaign, setCampaign] = useState<Campaign>(() => {
    const saved = loadCampaign();
    if (saved && saved.inviteCode) {
      return saved;
    }
    return {
      id: 'camp-default',
      title: lang === 'en' ? 'Dragonlance Campaign' : 'Ejderha Mızrağı Seferi',
      dmName: 'Zindan Efendisi (DM)',
      inviteCode: 'DRG924',
      members: INITIAL_MEMBERS,
      createdAt: new Date().toISOString()
    };
  });

  const [userRole, setUserRole] = useState<UserRole>('dm');
  const [dmSubTab, setDmSubTab] = useState<'party' | 'encounter'>('party');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');

  // Kampanya verisini her değişiklikte kalıcı belleğe kaydet
  useEffect(() => {
    saveCampaign(campaign);
  }, [campaign]);

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
      } else if ((event.type === 'MEMBER_JOIN' || event.type === 'MEMBER_UPDATE') && event.payload) {
        const memberData = event.payload as PartyMember;
        setCampaign((prev) => {
          // Eğer önceden sadece demo üyeler varsa ve ilk gerçek oyuncu katılıyorsa demo üyeleri temizle
          const isInitialDemo = prev.members.length === 3 &&
            prev.members.every((m) => ['char-1', 'char-2', 'char-3'].includes(m.id));
          const baseList = isInitialDemo ? [] : prev.members;

          const exists = baseList.some((m) => m.id === memberData.id);
          if (exists) {
            return {
              ...prev,
              members: baseList.map((m) => (m.id === memberData.id ? { ...m, ...memberData } : m))
            };
          }
          return {
            ...prev,
            members: [...baseList, memberData]
          };
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(campaign.inviteCode);
    setCopyFeedback(t.dmCopied || '✓ Kopyalandı!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const handleJoinCampaign = () => {
    if (!isValidInviteCode(joinCodeInput)) {
      setJoinError(t.dmInvalidCode || 'Geçersiz davet kodu! 6 haneli alfasayısal kod giriniz.');
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
            <span className="live-pulse">●</span> {t.dmSyncLive || 'Canlı Senkronize (Realtime Aktif)'}
          </span>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.6rem', marginTop: '0.4rem', letterSpacing: '0.03em' }}>
            🏰 {campaign.title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            {t.dmSubTitle || `Yönetici: ${campaign.dmName} | Davet Kodu ve Parti Takibi`}
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
            {t.dmRoleDm || '🧙‍♂️ DM Modu'}
          </button>
          <button
            id="btn-switch-role-player"
            className={`role-switch-btn ${userRole === 'player' ? 'active' : ''}`}
            onClick={() => setUserRole('player')}
            aria-label="Oyuncu Moduna Geç"
          >
            {t.dmRolePlayer || '🛡️ Oyuncu Modu'}
          </button>
        </div>
      </div>

      {/* Davet Kodu & Katılım Paneli */}
      <div className="invite-panel-row">
        <div className="invite-box" id="invite-box">
          <span className="invite-label">{t.dmInviteCode || 'KAMPANYA DAVET KODU'}</span>
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
              {copyFeedback || t.dmCopyCode || '📋 Kopyala'}
            </button>
            {userRole === 'dm' && (
              <button
                id="btn-regen-invite-code"
                className="copy-btn"
                onClick={handleRegenerateCode}
                aria-label="Yeni Kod Üret"
                title="Yeni Davet Kodu Üret"
              >
                {t.dmRegenCode || '🔄 Yenile'}
              </button>
            )}
          </div>
        </div>

        <div className="join-box">
          <span className="invite-label">{t.dmJoinOtherTitle || 'FARKLI BİR KAMPANYAYA KATIL'}</span>
          <div className="join-action-group">
            <input
              id="input-join-code"
              type="text"
              maxLength={6}
              placeholder={t.dmJoinPlaceholder || 'Örn: ARC842'}
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
              {t.dmJoinBtn || 'Katıl 🚀'}
            </button>
          </div>
          {joinError && <div id="join-error-msg" className="join-error-text">{joinError}</div>}
        </div>
      </div>

      {/* DM Büyük Seçim Kartları (Genel Bakış vs Savaş Modu) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '1.8rem',
          marginTop: '1rem',
        }}
      >
        <button
          id="btn-dm-tab-party"
          onClick={() => setDmSubTab('party')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem 1.5rem',
            borderRadius: '12px',
            border: dmSubTab === 'party'
              ? '2px solid var(--accent-gold)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            background: dmSubTab === 'party'
              ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'var(--bg-card)',
            boxShadow: dmSubTab === 'party'
              ? '0 8px 24px rgba(217, 119, 6, 0.25)'
              : 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.2rem' }}>👥</span>
            <div>
              <div
                className="font-cinzel"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: dmSubTab === 'party' ? '#fbbf24' : '#f8fafc',
                  letterSpacing: '0.02em',
                }}
              >
                {t.dmPartyOverview || 'Parti Genel Bakış'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {lang === 'en'
                  ? `Active Adventurers (${campaign.members.length}) • HP & Skills`
                  : `Karakterler (${campaign.members.length}) • Can & Beceriler`}
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              background: dmSubTab === 'party' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)',
              color: dmSubTab === 'party' ? '#000' : 'var(--text-secondary)',
            }}
          >
            {campaign.members.length}
          </span>
        </button>

        <button
          id="btn-dm-tab-encounter"
          onClick={() => setDmSubTab('encounter')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem 1.5rem',
            borderRadius: '12px',
            border: dmSubTab === 'encounter'
              ? '2px solid #ef4444'
              : '1px solid rgba(255, 255, 255, 0.1)',
            background: dmSubTab === 'encounter'
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'var(--bg-card)',
            boxShadow: dmSubTab === 'encounter'
              ? '0 8px 24px rgba(239, 68, 68, 0.25)'
              : 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.2rem' }}>⚔️</span>
            <div>
              <div
                className="font-cinzel"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: dmSubTab === 'encounter' ? '#f87171' : '#f8fafc',
                  letterSpacing: '0.02em',
                }}
              >
                {t.dmCombatTracker || 'Savaş Modu & İnisiyatif'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {lang === 'en'
                  ? 'Combat Encounters, Initiative, Monster HP'
                  : 'Karşılaşma, Tur Sırası ve Canavar Yönetimi'}
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              background: dmSubTab === 'encounter' ? '#ef4444' : 'rgba(255,255,255,0.08)',
              color: dmSubTab === 'encounter' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            COMBAT
          </span>
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


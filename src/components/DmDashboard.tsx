import React from 'react';
import { PartyMember, UserRole } from '../types/campaign';
import { applyMemberDamageOrHealing } from '../rules/campaignRules';
import { syncService } from '../data/syncService';

interface DmDashboardProps {
  members: PartyMember[];
  userRole: UserRole;
  onUpdateMembers: (newMembers: PartyMember[]) => void;
}

export const DmDashboard: React.FC<DmDashboardProps> = ({
  members,
  userRole,
  onUpdateMembers
}) => {
  const isDm = userRole === 'dm';

  const handleAdjustHp = (memberId: string, delta: number, isHealing: boolean) => {
    if (!isDm) return;

    const nextMembers = members.map((m) => {
      if (m.id === memberId) {
        return applyMemberDamageOrHealing(m, Math.abs(delta), isHealing);
      }
      return m;
    });

    onUpdateMembers(nextMembers);

    // Canlı senkronizasyon yayını yap
    syncService.broadcast({
      type: 'HP_UPDATE',
      campaignId: 'camp-default',
      senderRole: 'dm',
      payload: { memberId, delta, isHealing },
      timestamp: new Date().toISOString()
    });
  };

  const handleToggleCondition = (memberId: string, condId: string) => {
    if (!isDm) return;

    const nextMembers = members.map((m) => {
      if (m.id === memberId) {
        const has = m.activeConditions.includes(condId);
        const nextConds = has
          ? m.activeConditions.filter((c) => c !== condId)
          : [...m.activeConditions, condId];
        return { ...m, activeConditions: nextConds };
      }
      return m;
    });

    onUpdateMembers(nextMembers);

    syncService.broadcast({
      type: 'CONDITION_UPDATE',
      campaignId: 'camp-default',
      senderRole: 'dm',
      payload: { memberId, condId },
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div id="dm-dashboard-container" className="dm-dashboard-card">
      <div className="dm-header-row">
        <div>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
            👑 DM Kokpiti: Parti Sağlık & Algı Radarı (Faz 5)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isDm ? 'Tam Yetkili DM Modu: Canlı parti üyelerini yönetin ve can/durum güncelleyin' : 'Oyuncu Görünümü: Parti üyeleri salt-okunur (read-only) kilitlidir'}
          </p>
        </div>

        <span
          id="user-role-badge"
          className="role-badge"
          style={{
            background: isDm ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            borderColor: isDm ? 'var(--accent-gold)' : '#3b82f6',
            color: isDm ? '#fbbf24' : '#93c5fd'
          }}
        >
          {isDm ? '🧙‍♂️ DM Modu (Yetkili)' : '🛡️ Oyuncu Modu (Salt-Okunur)'}
        </span>
      </div>

      {/* Parti Üyeleri Grid */}
      <div className="party-members-grid" id="party-members-grid">
        {members.map((member) => {
          const hpPercent = Math.max(0, Math.min(100, Math.round((member.currentHp / member.maxHp) * 100)));
          const isBloodied = member.currentHp <= member.maxHp / 2;
          const isDown = member.currentHp === 0;

          return (
            <div
              key={member.id}
              id={`party-member-card-${member.id}`}
              className={`party-member-card ${isDown ? 'member-down' : isBloodied ? 'member-bloodied' : ''}`}
            >
              <div className="member-card-header">
                <div>
                  <h4 className="font-cinzel member-name">{member.name}</h4>
                  <span className="member-subtitle">
                    Seviye {member.level} {member.charClass} • Oyuncu: {member.playerName}
                  </span>
                </div>
                <div className="member-ac-badge" title="Zırh Sınıfı (AC)">
                  🛡️ {member.ac} AC
                </div>
              </div>

              {/* Can Barı */}
              <div className="member-hp-section">
                <div className="member-hp-row">
                  <span>CAN (HP)</span>
                  <span className="member-hp-numbers">
                    <strong id={`member-current-hp-${member.id}`}>{member.currentHp}</strong> / {member.maxHp}
                    {member.tempHp > 0 && <span style={{ color: '#60a5fa', marginLeft: '0.3rem' }}>(+{member.tempHp})</span>}
                  </span>
                </div>
                <div className="member-hp-track">
                  <div
                    className="member-hp-fill"
                    style={{
                      width: `${hpPercent}%`,
                      background: isDown ? '#ef4444' : isBloodied ? '#f59e0b' : '#34d399'
                    }}
                  />
                </div>
              </div>

              {/* Pasif Algı & Durumlar */}
              <div className="member-radar-row">
                <span className="passive-perception-tag">
                  👁️ Pasif Algı: <strong>{member.passivePerception}</strong>
                </span>

                <div className="member-conditions-tags">
                  {member.activeConditions.length > 0 ? (
                    member.activeConditions.map((cond) => (
                      <span key={cond} className="member-cond-tag">
                        ⚠️ {cond}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Normal</span>
                  )}
                </div>
              </div>

              {/* DM Hızlı Eylem Butonları */}
              {isDm && (
                <div className="dm-actions-bar">
                  <button
                    id={`btn-dm-damage-${member.id}`}
                    className="dm-action-btn dm-btn-damage"
                    onClick={() => handleAdjustHp(member.id, 5, false)}
                    aria-label={`${member.name} 5 hasar ver`}
                  >
                    ⚔️ -5 HP
                  </button>
                  <button
                    id={`btn-dm-heal-${member.id}`}
                    className="dm-action-btn dm-btn-heal"
                    onClick={() => handleAdjustHp(member.id, 5, true)}
                    aria-label={`${member.name} 5 iyileştir`}
                  >
                    💚 +5 HP
                  </button>
                  <button
                    id={`btn-dm-cond-${member.id}`}
                    className="dm-action-btn dm-btn-cond"
                    onClick={() => handleToggleCondition(member.id, 'Zehirli')}
                    aria-label={`${member.name} zehir durumu değiştir`}
                  >
                    🤢 Zehir
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

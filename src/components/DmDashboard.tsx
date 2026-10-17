import React, { useState } from 'react';
import { PartyMember, UserRole } from '../types/campaign';
import { applyMemberDamageOrHealing } from '../rules/campaignRules';
import { getAllConditions } from '../rules/conditions';
import { calculateModifier } from '../rules/abilityScores';
import { SKILLS } from '../rules/skills';
import { syncService } from '../data/syncService';
import { useCharacter } from '../context/CharacterContext';

interface DmDashboardProps {
  members: PartyMember[];
  userRole: UserRole;
  campaignInviteCode?: string;
  onUpdateMembers: (newMembers: PartyMember[]) => void;
  onRemoveMember?: (memberId: string) => void;
}

export const DmDashboard: React.FC<DmDashboardProps> = ({
  members,
  userRole,
  campaignInviteCode = 'DRG924',
  onUpdateMembers,
  onRemoveMember
}) => {
  const { state } = useCharacter();
  const lang = state.preferences?.language || 'tr';
  const isDm = userRole === 'dm';
  const allConditions = getAllConditions();

  // Her üye için görünüm modu: 'stats' (Ana Statlar) veya 'skills' (Beceriler)
  const [memberViewMode, setMemberViewMode] = useState<Record<string, 'stats' | 'skills'>>({});
  // Her üye için özel girilen HP miktarı (Serbest string girişi — silip boş bırakılabilir)
  const [customHpAmounts, setCustomHpAmounts] = useState<Record<string, string>>({});
  // Seçilen debuff
  const [selectedDebuff, setSelectedDebuff] = useState<Record<string, string>>({});

  const toggleViewMode = (memberId: string) => {
    setMemberViewMode((prev) => ({
      ...prev,
      [memberId]: prev[memberId] === 'skills' ? 'stats' : 'skills'
    }));
  };

  const handleAdjustHp = (memberId: string, delta: number, isHealing: boolean) => {
    if (!isDm) return;

    const nextMembers = members.map((m) => {
      if (m.id === memberId) {
        return applyMemberDamageOrHealing(m, Math.abs(delta), isHealing);
      }
      return m;
    });

    onUpdateMembers(nextMembers);

    syncService.broadcast({
      type: 'HP_UPDATE',
      campaignId: campaignInviteCode,
      senderRole: 'dm',
      payload: { memberId, delta, isHealing },
      timestamp: new Date().toISOString()
    });
  };

  const handleAddCondition = (memberId: string, condName: string) => {
    if (!isDm || !condName) return;

    const nextMembers = members.map((m) => {
      if (m.id === memberId) {
        // Stacklenebilir durumlar: Aynı durumdan birden fazla veya farklı durumlar eklenebilir
        return { ...m, activeConditions: [...m.activeConditions, condName] };
      }
      return m;
    });

    onUpdateMembers(nextMembers);

    syncService.broadcast({
      type: 'CONDITION_UPDATE',
      campaignId: campaignInviteCode,
      senderRole: 'dm',
      payload: { memberId, condId: condName, action: 'add' },
      timestamp: new Date().toISOString()
    });
  };

  const handleRemoveCondition = (memberId: string, indexToRemove: number) => {
    if (!isDm) return;

    let removedCondName = '';
    const nextMembers = members.map((m) => {
      if (m.id === memberId) {
        removedCondName = m.activeConditions[indexToRemove] || '';
        const nextConds = m.activeConditions.filter((_, idx) => idx !== indexToRemove);
        return { ...m, activeConditions: nextConds };
      }
      return m;
    });

    onUpdateMembers(nextMembers);

    if (removedCondName) {
      syncService.broadcast({
        type: 'CONDITION_UPDATE',
        campaignId: campaignInviteCode,
        senderRole: 'dm',
        payload: { memberId, condId: removedCondName, action: 'remove' },
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (!isDm) return;

    if (onRemoveMember) {
      onRemoveMember(memberId);
    } else {
      const nextMembers = members.filter((m) => m.id !== memberId);
      onUpdateMembers(nextMembers);
    }

    syncService.broadcast({
      type: 'MEMBER_REMOVE',
      campaignId: campaignInviteCode,
      senderRole: 'dm',
      payload: { memberId },
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div id="dm-dashboard-container" className="dm-dashboard-card">
      <div className="dm-header-row">
        <div>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
            👑 DM Kokpiti: Parti Durum, Stat ve Algı Radarı
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isDm ? 'Tam Yetkili DM: Statlar, beceriler, pasif inceleme, özel HP ve stacklenebilir debufflar' : 'Oyuncu Görünümü: Parti üyeleri salt-okunur (read-only) kilitlidir'}
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
          const currentMode = memberViewMode[member.id] || 'stats';
          const rawHpInput = customHpAmounts[member.id] !== undefined ? customHpAmounts[member.id] : '5';
          const customHpNumber = Math.max(1, parseInt(rawHpInput, 10) || 5);

          const strMod = calculateModifier(member.stats?.str || 10);
          const dexMod = calculateModifier(member.stats?.dex || 10);
          const conMod = calculateModifier(member.stats?.con || 10);
          const intMod = calculateModifier(member.stats?.int || 10);
          const wisMod = calculateModifier(member.stats?.wis || 10);
          const chaMod = calculateModifier(member.stats?.cha || 10);

          return (
            <div
              key={member.id}
              id={`party-member-card-${member.id}`}
              className={`party-member-card ${isDown ? 'member-down' : isBloodied ? 'member-bloodied' : ''}`}
            >
              {/* Kart Başlığı */}
              <div className="member-card-header">
                <div>
                  <h4 className="font-cinzel member-name">{member.name}</h4>
                  <span className="member-subtitle">
                    Seviye {member.level} {member.charClass} • Oyuncu: {member.playerName}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="member-ac-badge" title="Zırh Sınıfı (AC)">
                    🛡️ {member.ac} AC
                  </div>
                  {isDm && (
                    <button
                      id={`btn-remove-member-${member.id}`}
                      className="dm-remove-member-btn"
                      onClick={() => handleRemoveMember(member.id)}
                      title="Karakteri Partiden Çıkar"
                      aria-label="Karakteri Partiden Çıkar"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      🗑️ Çıkar
                    </button>
                  )}
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

              {/* Pasif Algı & Pasif İnceleme (Madde 9) */}
              <div className="member-radar-row">
                <span className="passive-perception-tag">
                  👁️ Pasif Algı: <strong id={`dm-passive-perception-${member.id}`}>{member.passivePerception}</strong>
                </span>
                <span className="passive-perception-tag">
                  🔍 Pasif İnceleme: <strong id={`dm-passive-investigation-${member.id}`}>{member.passiveInvestigation || 10}</strong>
                </span>
              </div>

              {/* Görünüm Değiştirici: Ana Statlar ↔ Beceriler (Madde 9) */}
              <div className="dm-member-view-toggle">
                <button
                  id={`btn-toggle-view-${member.id}`}
                  className="view-mode-toggle-btn"
                  onClick={() => toggleViewMode(member.id)}
                  aria-label="Stat veya Beceri Görünümünü Değiştir"
                >
                  {currentMode === 'stats' ? '📊 Becerileri Göster (Insight, Stealth...)' : '🛡️ Ana Statları Göster (STR, DEX...)'}
                </button>
              </div>

              {/* Görünüm Alanı */}
              {currentMode === 'stats' ? (
                <div className="dm-stats-chips-row" id={`dm-stats-${member.id}`}>
                  <span className="dm-stat-chip">STR <strong>{member.stats?.str || 10}</strong> ({strMod >= 0 ? `+${strMod}` : strMod})</span>
                  <span className="dm-stat-chip">DEX <strong>{member.stats?.dex || 10}</strong> ({dexMod >= 0 ? `+${dexMod}` : dexMod})</span>
                  <span className="dm-stat-chip">CON <strong>{member.stats?.con || 10}</strong> ({conMod >= 0 ? `+${conMod}` : conMod})</span>
                  <span className="dm-stat-chip">INT <strong>{member.stats?.int || 10}</strong> ({intMod >= 0 ? `+${intMod}` : intMod})</span>
                  <span className="dm-stat-chip">WIS <strong>{member.stats?.wis || 10}</strong> ({wisMod >= 0 ? `+${wisMod}` : wisMod})</span>
                  <span className="dm-stat-chip">CHA <strong>{member.stats?.cha || 10}</strong> ({chaMod >= 0 ? `+${chaMod}` : chaMod})</span>
                </div>
              ) : (
                <div className="dm-skills-list-grid" id={`dm-skills-${member.id}`}>
                  {SKILLS.map((sk) => {
                    const explicitMod = member.skillModifiers?.[sk.id];
                    const fallbackMod = sk.ability === 'str' ? strMod
                      : sk.ability === 'dex' ? dexMod
                      : sk.ability === 'con' ? conMod
                      : sk.ability === 'int' ? intMod
                      : sk.ability === 'wis' ? wisMod : chaMod;
                    const finalMod = explicitMod !== undefined ? explicitMod : fallbackMod;
                    const isExpert = member.expertSkills?.includes(sk.id);
                    const isProf = member.proficientSkills?.includes(sk.id);

                    const displayName = lang === 'en' ? sk.name : sk.nameTr;

                    return (
                      <span
                        key={sk.id}
                        className={`dm-skill-chip ${isExpert ? 'expert' : isProf ? 'proficient' : ''}`}
                        title={isExpert ? `${displayName} (Expertise)` : isProf ? `${displayName} (Proficient)` : displayName}
                      >
                        {isExpert ? '★ ' : isProf ? '● ' : ''}{displayName}: <strong>{finalMod >= 0 ? `+${finalMod}` : finalMod}</strong>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Aktif Durumlar (Stacklenebilir - Madde 9) */}
              <div className="member-conditions-area">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aktif Debuff/Durumlar:</span>
                <div className="member-conditions-tags">
                  {member.activeConditions.length > 0 ? (
                    member.activeConditions.map((cond, idx) => (
                      <span key={idx} className="member-cond-tag stackable-tag">
                        ⚠️ {cond}
                        {isDm && (
                          <button
                            className="cond-remove-x"
                            onClick={() => handleRemoveCondition(member.id, idx)}
                            title="Durumu Kaldır"
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Durum yok</span>
                  )}
                </div>
              </div>

              {/* DM Kontrolleri (Özel HP ve Stacklenebilir Durum Ekleme) */}
              {isDm && (
                <div className="dm-controls-wrapper">
                  {/* Özel HP Girişi & Hızlı Butonlar */}
                  <div className="custom-hp-row">
                    <input
                      id={`input-custom-hp-${member.id}`}
                      type="number"
                      min={1}
                      max={999}
                      value={rawHpInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomHpAmounts((prev) => ({ ...prev, [member.id]: val }));
                      }}
                      onBlur={(e) => {
                        if (!e.target.value || parseInt(e.target.value, 10) <= 0) {
                          setCustomHpAmounts((prev) => ({ ...prev, [member.id]: '5' }));
                        }
                      }}
                      className="custom-hp-input"
                      aria-label="Özel Can Miktarı"
                      placeholder="5"
                    />
                    <button
                      id={`btn-dm-damage-${member.id}`}
                      className="dm-action-btn dm-btn-damage"
                      onClick={() => handleAdjustHp(member.id, customHpNumber, false)}
                      aria-label={`${member.name} ${customHpNumber} hasar ver`}
                    >
                      ⚔️ -{customHpNumber} HP
                    </button>
                    <button
                      id={`btn-dm-heal-${member.id}`}
                      className="dm-action-btn dm-btn-heal"
                      onClick={() => handleAdjustHp(member.id, customHpNumber, true)}
                      aria-label={`${member.name} ${customHpNumber} iyileştir`}
                    >
                      💚 +{customHpNumber} HP
                    </button>
                  </div>

                  {/* Debuff Seçici */}
                  <div className="debuff-picker-row">
                    <select
                      id={`select-debuff-${member.id}`}
                      className="debuff-select"
                      value={selectedDebuff[member.id] || (allConditions[0]?.nameTr || 'Zehirlenmiş')}
                      onChange={(e) => setSelectedDebuff((prev) => ({ ...prev, [member.id]: e.target.value }))}
                      aria-label="Eklenecek Durumu Seç"
                    >
                      {allConditions.map((c) => (
                        <option key={c.id} value={c.nameTr}>
                          {c.icon} {c.nameTr}
                        </option>
                      ))}
                    </select>
                    <button
                      id={`btn-dm-cond-${member.id}`}
                      className="dm-action-btn dm-btn-cond"
                      onClick={() => handleAddCondition(member.id, selectedDebuff[member.id] || (allConditions[0]?.nameTr || 'Zehirlenmiş'))}
                      aria-label={`${member.name} durum ekle`}
                    >
                      + Durum Ekle
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import type { CreatureData } from '../data/open5eClient';
import { calculateModifier } from '../rules/abilityScores';

interface MonsterDetailModalProps {
  monster: CreatureData | null;
  onClose: () => void;
  onAddToEncounter?: (monster: CreatureData) => void;
}

export const MonsterDetailModal: React.FC<MonsterDetailModalProps> = ({
  monster,
  onClose,
  onAddToEncounter,
}) => {
  if (!monster) return null;

  const formatMod = (score: number) => {
    const mod = calculateModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const renderSpeed = (speed: unknown) => {
    if (!speed) return '30 ft.';
    if (typeof speed === 'string') return speed;
    if (typeof speed === 'object' && speed !== null) {
      const s = speed as Record<string, unknown>;
      const parts: string[] = [];
      const unit = String(s.unit ?? 'ft.');
      if (s.walk !== undefined) parts.push(`${s.walk} ${unit}`);
      if (s.swim !== undefined) parts.push(`swim ${s.swim} ${unit}`);
      if (s.fly !== undefined) parts.push(`fly ${s.fly} ${unit}`);
      if (s.burrow !== undefined) parts.push(`burrow ${s.burrow} ${unit}`);
      if (s.climb !== undefined) parts.push(`climb ${s.climb} ${unit}`);
      return parts.length > 0 ? parts.join(', ') : '30 ft.';
    }
    return String(speed);
  };

  const renderLanguages = (languages: unknown) => {
    if (!languages) return null;
    if (typeof languages === 'string') return languages;
    if (typeof languages === 'object' && languages !== null) {
      const l = languages as Record<string, unknown>;
      if (l.as_string) return String(l.as_string);
      if (Array.isArray(l.data)) {
        const names = l.data.map((d: any) => d?.name || d?.key).filter(Boolean);
        if (names.length > 0) return names.join(', ');
      }
    }
    return String(languages);
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="monster-stat-card"
        style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--accent-gold)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-card), 0 0 25px rgba(217, 119, 6, 0.25)',
          color: 'var(--text-primary)',
          position: 'relative',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#e2e8f0',
            fontSize: '1.2rem',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Kapat"
        >
          ✕
        </button>

        {/* Başlık & Tip */}
        <div style={{ borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.6rem', marginBottom: '0.8rem' }}>
          <h2 className="font-cinzel" style={{ margin: 0, fontSize: '1.6rem', color: '#fbbf24' }}>
            {monster.name}
          </h2>
          <div style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '0.9rem', marginTop: '2px' }}>
            {monster.size} {monster.type}, {monster.alignment}
          </div>
        </div>

        {/* Temel Savunma & Can */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.8rem', background: 'rgba(0,0,0,0.25)', padding: '0.6rem', borderRadius: '6px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Zırh Sınıfı (AC):</span>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#38bdf8' }}>{monster.armorClass}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Can Puanı (HP):</span>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ef4444' }}>{monster.hitPoints}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Hız (Speed):</span>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#e2e8f0' }}>{renderSpeed(monster.speed)}</div>
          </div>
        </div>

        {/* Stat Blok 6 Yetenek */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem', textAlign: 'center', marginBottom: '1rem', background: 'rgba(217, 119, 6, 0.08)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
          {[
            { label: 'STR', val: monster.str },
            { label: 'DEX', val: monster.dex },
            { label: 'CON', val: monster.con },
            { label: 'INT', val: monster.int },
            { label: 'WIS', val: monster.wis },
            { label: 'CHA', val: monster.cha },
          ].map((st) => (
            <div key={st.label}>
              <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700 }}>{st.label}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>{st.val}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({formatMod(st.val)})</div>
            </div>
          ))}
        </div>

        {/* Duyular, Diller, Dirençler */}
        <div style={{ fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
          {monster.senses && (
            <div>
              <strong style={{ color: '#fbbf24' }}>Duyular (Senses):</strong> {monster.senses}
            </div>
          )}
          {renderLanguages(monster.languages) && (
            <div>
              <strong style={{ color: '#fbbf24' }}>Diller (Languages):</strong> {renderLanguages(monster.languages)}
            </div>
          )}
          <div>
            <strong style={{ color: '#fbbf24' }}>Zorluk Derecesi (CR):</strong> {monster.challengeRating}
          </div>
          {monster.damageResistances && (
            <div style={{ color: '#38bdf8' }}>
              <strong>Hasar Dirençleri:</strong> {monster.damageResistances}
            </div>
          )}
          {monster.damageImmunities && (
            <div style={{ color: '#a855f7' }}>
              <strong>Hasar Bağışıklıkları:</strong> {monster.damageImmunities}
            </div>
          )}
          {monster.conditionImmunities && (
            <div style={{ color: '#ec4899' }}>
              <strong>Durum Bağışıklıkları:</strong> {monster.conditionImmunities}
            </div>
          )}
        </div>

        {/* Özel Yetenekler (Special Abilities) */}
        {monster.specialAbilities && monster.specialAbilities.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 className="font-cinzel" style={{ color: '#38bdf8', borderBottom: '1px solid #38bdf8', paddingBottom: '0.2rem', margin: '0.6rem 0' }}>
              ✨ Özel Yetenekler & Pasifler
            </h4>
            {monster.specialAbilities.map((ab, idx) => (
              <div key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <strong style={{ color: '#e2e8f0' }}>{ab.name}.</strong>{' '}
                <span style={{ color: '#cbd5e1' }}>{ab.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Aksiyonlar (Actions) & Saldırılar */}
        <div style={{ marginBottom: '1rem' }}>
          <h4 className="font-cinzel" style={{ color: '#ef4444', borderBottom: '1px solid #ef4444', paddingBottom: '0.2rem', margin: '0.6rem 0' }}>
            ⚔️ Aksiyonlar & Saldırılar
          </h4>
          {monster.actions && monster.actions.length > 0 ? (
            monster.actions.map((act, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '0.6rem',
                  padding: '0.5rem 0.7rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: '6px',
                  borderLeft: '3px solid #ef4444',
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#fca5a5' }}>{act.name}</strong>
                  {act.attack_bonus !== undefined && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.2)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#fff' }}>
                      İsabet: +{act.attack_bonus}
                    </span>
                  )}
                </div>
                <div style={{ color: '#e2e8f0', marginTop: '0.2rem', lineHeight: '1.4' }}>
                  {act.desc}
                </div>
                {act.damage_dice && (
                  <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                    🎲 Hasar Zarı: {act.damage_dice}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
              Standart yakın dövüş saldırısı: 1d6 + STR hasar.
            </div>
          )}
        </div>

        {/* Reaksiyonlar */}
        {monster.reactions && monster.reactions.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 className="font-cinzel" style={{ color: '#a855f7', borderBottom: '1px solid #a855f7', paddingBottom: '0.2rem', margin: '0.6rem 0' }}>
              ⚡ Reaksiyonlar
            </h4>
            {monster.reactions.map((rc, idx) => (
              <div key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <strong style={{ color: '#e2e8f0' }}>{rc.name}.</strong> <span style={{ color: '#cbd5e1' }}>{rc.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Efsanevi Aksiyonlar (Legendary Actions) */}
        {monster.legendaryActions && monster.legendaryActions.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 className="font-cinzel" style={{ color: '#eab308', borderBottom: '1px solid #eab308', paddingBottom: '0.2rem', margin: '0.6rem 0' }}>
              👑 Efsanevi Aksiyonlar (Legendary Actions)
            </h4>
            {monster.legendaryActions.map((lg, idx) => (
              <div key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <strong style={{ color: '#fef08a' }}>{lg.name}.</strong> <span style={{ color: '#cbd5e1' }}>{lg.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Alt Butonlar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <button
            className="action-button secondary"
            onClick={onClose}
            style={{ padding: '0.5rem 1rem' }}
          >
            Kapat
          </button>
          {onAddToEncounter && (
            <button
              className="action-button primary"
              onClick={() => {
                onAddToEncounter(monster);
                onClose();
              }}
              style={{ padding: '0.5rem 1.2rem', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
            >
              + Karşılaşmaya Ekle
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

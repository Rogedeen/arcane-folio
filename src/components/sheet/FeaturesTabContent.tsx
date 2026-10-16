import React from 'react';
import type { FullCharacter } from '../../types/character';

interface FeaturesTabContentProps {
  character: FullCharacter;
  onSecondWind: () => void;
}

export const FeaturesTabContent: React.FC<FeaturesTabContentProps> = ({
  character,
  onSecondWind,
}) => {
  return (
    <div className="dndbeyond-card" id="tab-content-features-view">
      <div className="dndbeyond-card-header">SAVAŞÇI YETENEKLERİ (CLASS FEATURES)</div>

      {/* Second Wind */}
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--border-gold)',
          borderRadius: '8px',
          padding: '0.85rem',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ color: 'var(--accent-gold)' }}>💨 İkinci Nefes (Second Wind)</strong>
          <button
            id="btn-second-wind-action"
            className="dndbeyond-attack-box-btn"
            style={{ background: '#16a34a', borderColor: '#22c55e', color: '#fff' }}
            onClick={onSecondWind}
          >
            ❤️ 1d10 + {character.level} İyileş
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0' }}>
          Bonus eylem olarak 1d10 + Savaşçı seviyen kadar can yenilersin. Kısa veya uzun dinlenmede dolar.
        </p>
      </div>

      {/* Action Surge */}
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.85rem',
          marginBottom: '0.75rem',
        }}
      >
        <strong style={{ color: '#fff' }}>⚡ Eylem Akışı (Action Surge)</strong>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0' }}>
          Kendi turunda fazladan 1 Eylem (Action) hakkı kazanırsın. Kısa veya uzun dinlenmede yenilenir.
        </p>
      </div>

      {/* Rage (Barbar ise) */}
      {character.class.toLowerCase() === 'barbarian' && (
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-red)',
            borderRadius: '8px',
            padding: '0.85rem',
          }}
        >
          <strong style={{ color: 'var(--accent-red)' }}>🔥 Öfke (Rage)</strong>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.3rem' }}>
            <span>Kullanım:</span>
            <input type="checkbox" />
            <input type="checkbox" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ Long Rest</span>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import type { FullCharacter } from '../../types/character';

interface BackgroundTabContentProps {
  character: FullCharacter;
}

export const BackgroundTabContent: React.FC<BackgroundTabContentProps> = ({ character }) => {
  return (
    <div className="dndbeyond-card" id="tab-content-background-view">
      <div className="dndbeyond-card-header">BACKGROUND & CHARACTERISTICS</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.6rem',
          fontSize: '0.8rem',
          background: 'rgba(0,0,0,0.3)',
          padding: '0.75rem',
          borderRadius: '8px',
        }}
      >
        <div>
          <strong>Geçmiş:</strong> {character.background}
        </div>
        <div>
          <strong>Irk / Tür:</strong> {character.race}
        </div>
        <div>
          <strong>Boyut:</strong> Medium
        </div>
        <div>
          <strong>Hizalanma:</strong> Neutral Good
        </div>
        <div>
          <strong>Gözler:</strong> Kahverengi
        </div>
        <div>
          <strong>Saç:</strong> Kızıl / Sakallı
        </div>
      </div>

      {character.backstory ? (
        <div style={{ marginTop: '0.6rem' }}>
          <strong>Karakter Hikayesi:</strong>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginTop: '0.3rem',
            }}
          >
            {character.backstory}
          </p>
        </div>
      ) : (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Karakter geçmişi henüz yazılmadı. Seviye atlama ekranından ekleyebilirsiniz.
        </p>
      )}
    </div>
  );
};

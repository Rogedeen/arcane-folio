import React, { useState } from 'react';
import type { CharacterAdvantageState } from '../../rules/statusAnalysis';

interface StatusBannerProps {
  status: CharacterAdvantageState;
  onRemoveCondition?: (conditionId: string) => void;
}

export const StatusAdvantageBanner: React.FC<StatusBannerProps> = ({ status, onRemoveCondition }) => {
  const [selectedTag, setSelectedTag] = useState<CharacterAdvantageState['tags'][0] | null>(null);

  if (status.tags.length === 0) {
    return null;
  }

  return (
    <div
      id="status-advantage-banner"
      style={{
        background: 'rgba(20, 16, 14, 0.95)',
        border: '1px solid rgba(200, 155, 60, 0.25)',
        borderRadius: '6px',
        padding: '0.6rem 0.8rem',
        marginBottom: '0.8rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.9rem' }}>🛡️</span>
          <span
            className="font-cinzel"
            style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.05em' }}
          >
            DURUMLAR & AVANTAJ / DEZAVANTAJ ETKİLERİ
          </span>
        </div>
        {status.isSpellcastingBlocked && (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              padding: '1px 6px'
            }}
          >
            🚫 BÜYÜ YAPILAMAZ (Yetkisiz Zırh)
          </span>
        )}
      </div>

      {/* Etiket Rozetleri Listesi */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {status.tags.map((tag) => {
          const isDebuff = tag.type === 'debuff' || tag.type === 'restriction';
          const isBuff = tag.type === 'buff';
          const badgeBg = isBuff
            ? 'rgba(16, 185, 129, 0.15)'
            : isDebuff
            ? 'rgba(239, 68, 68, 0.15)'
            : 'rgba(200, 155, 60, 0.15)';
          const badgeBorder = isBuff
            ? 'rgba(16, 185, 129, 0.4)'
            : isDebuff
            ? 'rgba(239, 68, 68, 0.4)'
            : 'rgba(200, 155, 60, 0.4)';
          const badgeColor = isBuff ? '#34d399' : isDebuff ? '#f87171' : '#fbbf24';

          return (
            <div
              key={tag.id}
              onClick={() => setSelectedTag(selectedTag?.id === tag.id ? null : tag)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: badgeBg,
                border: `1px solid ${badgeBorder}`,
                borderRadius: '4px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontSize: '0.72rem',
                color: badgeColor,
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
              title="Açıklama için tıkla"
            >
              <span>{tag.icon}</span>
              <span>{tag.labelTr}</span>
              {tag.id.startsWith('condition-') && onRemoveCondition && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const condId = tag.id.replace('condition-', '');
                    onRemoveCondition(condId);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0 2px',
                    marginLeft: '2px'
                  }}
                  title="Durumu Kaldır"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Tıklanan Durumun Detay Açıklaması */}
      {selectedTag && (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderLeft: `3px solid ${selectedTag.type === 'buff' ? '#10b981' : '#ef4444'}`,
            padding: '0.4rem 0.6rem',
            borderRadius: '0 4px 4px 0',
            marginTop: '2px',
            fontSize: '0.75rem',
            color: 'var(--text-primary)'
          }}
        >
          <strong>{selectedTag.labelTr}:</strong> {selectedTag.descriptionTr}
        </div>
      )}
    </div>
  );
};

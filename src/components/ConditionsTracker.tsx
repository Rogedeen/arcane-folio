import React, { useState } from 'react';
import { getAllConditions, isMovementBlocked } from '../rules/conditions';

export const ConditionsTracker: React.FC = () => {
  const [activeConditions, setActiveConditions] = useState<string[]>([]);
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);

  const conditions = getAllConditions();
  const movementBlocked = isMovementBlocked(activeConditions);

  const toggleCondition = (id: string) => {
    setActiveConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div id="conditions-tracker-container" className="conditions-card">
      <div className="conditions-header">
        <div>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
            ⚡ Durumlar & Savaş Etkileri (Faz 4)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            15 SRD 5.1 koşul durumu, avantaj/dezavantaj ve hareket kısıtlama takibi
          </p>
        </div>

        {activeConditions.length > 0 && (
          <button
            id="btn-clear-conditions"
            className="clear-cond-btn"
            onClick={() => setActiveConditions([])}
            aria-label="Tüm Durumları Temizle"
          >
            Tümünü Temizle ({activeConditions.length})
          </button>
        )}
      </div>

      {/* Hareket Engeli & Aktif Uyarı Paneli */}
      {movementBlocked && (
        <div id="movement-blocked-alert" className="encumbrance-alert" style={{ marginBottom: '1.25rem' }}>
          🚫 <strong>Hareket Hızı 0:</strong> Aktif durumlar (Felç, Güreş, Taşlaşma veya Sersemlik) nedeniyle karakter hareket edemez!
        </div>
      )}

      {/* Durum Rozetleri Grid */}
      <div className="conditions-grid" id="conditions-grid">
        {conditions.map((cond) => {
          const isActive = activeConditions.includes(cond.id);
          return (
            <button
              key={cond.id}
              id={`cond-badge-${cond.id}`}
              className={`condition-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                toggleCondition(cond.id);
                setExpandedCondition(cond.id);
              }}
              aria-label={`${cond.nameTr} durumunu aç/kapat`}
            >
              <span className="cond-icon">{cond.icon}</span>
              <span className="cond-title">{cond.nameTr}</span>
              {isActive && <span className="active-dot">●</span>}
            </button>
          );
        })}
      </div>

      {/* Seçili Durum Detay Kartı */}
      {expandedCondition && (
        <div className="condition-detail-box" id="condition-detail-box">
          {(() => {
            const current = conditions.find((c) => c.id === expandedCondition);
            if (!current) return null;
            return (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0 }}>
                    {current.icon} {current.nameTr} ({current.name})
                  </h4>
                  <button
                    className="modal-close-btn"
                    style={{ fontSize: '1rem', padding: '0.2rem' }}
                    onClick={() => setExpandedCondition(null)}
                    aria-label="Kapat"
                  >
                    ✕
                  </button>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {current.description}
                </p>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {current.effects.map((eff, idx) => (
                    <li key={idx}>{eff}</li>
                  ))}
                </ul>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

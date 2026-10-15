import React, { useEffect, useState } from 'react';
import { useReference } from '../context/ReferenceContext';
import { open5eClient } from '../data/open5eClient';
import type { SpellData, ItemData } from '../types/content';
import type { CreatureData } from '../data/open5eClient';

export const ReferenceDrawer: React.FC = () => {
  const { isOpen, activeItem, closeReference, openReference } = useReference();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    spells: SpellData[];
    items: ItemData[];
    creatures: CreatureData[];
  }>({ spells: [], items: [], creatures: [] });

  // ESC tuşuyla kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeReference();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeReference]);

  // Drawer açıkken body scroll'u engelle (mobilde çok iyi hissettirir)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const [spellRes, itemRes, creatureRes] = await Promise.all([
        open5eClient.searchSpells(searchQuery.trim(), 5),
        open5eClient.searchItems(searchQuery.trim(), 5),
        open5eClient.searchCreatures(searchQuery.trim(), undefined, 5),
      ]);

      setSearchResults({
        spells: spellRes.data || [],
        items: itemRes.data || [],
        creatures: creatureRes.data || [],
      });
    } finally {
      setSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reference-drawer-overlay" onClick={closeReference} id="ref-drawer-overlay">
      <div
        className="reference-drawer-panel"
        id="ref-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ref-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Başlık & Kapat Butonu */}
        <div className="ref-drawer-header">
          <div className="ref-header-title-group">
            <span className="ref-header-badge">
              {activeItem?.type === 'spell' && '📜 Büyü'}
              {activeItem?.type === 'item' && '🎒 Eşya'}
              {activeItem?.type === 'condition' && '⚡ Durum'}
              {activeItem?.type === 'creature' && '🐉 Canavar / NPC'}
              {activeItem?.type === 'rule' && '📖 Kural'}
            </span>
            <h3 id="ref-drawer-title" className="font-cinzel ref-header-title">
              {activeItem?.type === 'spell' && activeItem.data.name}
              {activeItem?.type === 'item' && activeItem.data.name}
              {activeItem?.type === 'condition' && activeItem.data.name}
              {activeItem?.type === 'creature' && activeItem.data.name}
              {activeItem?.type === 'rule' && activeItem.data.title}
            </h3>
          </div>
          <button
            id="btn-close-ref-drawer"
            className="ref-drawer-close-btn"
            onClick={closeReference}
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {/* Canlı Arama Çubuğu */}
        <form onSubmit={handleSearch} className="ref-search-form">
          <input
            id="input-ref-search"
            type="text"
            className="ref-search-input"
            placeholder="Başka bir büyü, eşya veya canavar ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="ref-search-btn" disabled={searching}>
            {searching ? '...' : '🔍'}
          </button>
        </form>

        {/* Arama Sonuçları (varsa) */}
        {(searchResults.spells.length > 0 ||
          searchResults.items.length > 0 ||
          searchResults.creatures.length > 0) && (
          <div className="ref-search-results">
            <div className="ref-search-results-header">
              <span>Arama Sonuçları:</span>
              <button
                className="ref-clear-results-btn"
                onClick={() => setSearchResults({ spells: [], items: [], creatures: [] })}
              >
                Temizle
              </button>
            </div>
            {searchResults.spells.map((s) => (
              <div
                key={s.slug}
                className="ref-result-item"
                onClick={() => openReference({ type: 'spell', data: s })}
              >
                <span>📜 {s.name}</span>
                <span className="ref-result-meta">{s.level === 0 ? 'Cantrip' : `${s.level}. Seviye`}</span>
              </div>
            ))}
            {searchResults.items.map((i) => (
              <div
                key={i.slug}
                className="ref-result-item"
                onClick={() => openReference({ type: 'item', data: i })}
              >
                <span>🎒 {i.name}</span>
                <span className="ref-result-meta">{i.type}</span>
              </div>
            ))}
            {searchResults.creatures.map((c) => (
              <div
                key={c.slug}
                className="ref-result-item"
                onClick={() => openReference({ type: 'creature', data: c })}
              >
                <span>🐉 {c.name}</span>
                <span className="ref-result-meta">CR {c.challengeRating}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ana İçerik Alanı */}
        <div className="ref-drawer-body">
          {/* 1. BÜYÜ DETAYLARI */}
          {activeItem?.type === 'spell' && (
            <div className="ref-content-spell">
              <div className="ref-meta-grid">
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Seviye &amp; Okul</span>
                  <span className="ref-meta-value">
                    {activeItem.data.level === 0 ? 'Cantrip' : `${activeItem.data.level}. Seviye`} {activeItem.data.school}
                  </span>
                </div>
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Casting Time</span>
                  <span className="ref-meta-value">{activeItem.data.castingTime}</span>
                </div>
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Menzil (Range)</span>
                  <span className="ref-meta-value">{activeItem.data.range}</span>
                </div>
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Bileşenler</span>
                  <span className="ref-meta-value">{activeItem.data.components}</span>
                </div>
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Süre (Duration)</span>
                  <span className="ref-meta-value">{activeItem.data.duration}</span>
                </div>
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Sınıflar</span>
                  <span className="ref-meta-value">
                    {activeItem.data.classes?.length > 0 ? activeItem.data.classes.join(', ') : 'Tüm büyücüler'}
                  </span>
                </div>
              </div>

              <div className="ref-text-section">
                <h4 className="ref-section-title">Açıklama</h4>
                <div className="ref-description-text">{activeItem.data.description}</div>
              </div>

              <div className="ref-footer-note">
                Kaynak: {activeItem.data.source_ref || activeItem.data.source || 'Open5e SRD 5.1'}
              </div>
            </div>
          )}

          {/* 2. EŞYA DETAYLARI */}
          {activeItem?.type === 'item' && (
            <div className="ref-content-item">
              <div className="ref-meta-grid">
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Tür</span>
                  <span className="ref-meta-value">{activeItem.data.type}</span>
                </div>
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Fiyat</span>
                  <span className="ref-meta-value">{activeItem.data.cost}</span>
                </div>
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Ağırlık</span>
                  <span className="ref-meta-value">{activeItem.data.weight} lb</span>
                </div>
              </div>

              {activeItem.data.properties && activeItem.data.properties.length > 0 && (
                <div className="ref-text-section">
                  <h4 className="ref-section-title">Özellikler</h4>
                  <div className="ref-tags-row">
                    {activeItem.data.properties.map((p, idx) => (
                      <span key={idx} className="ref-property-tag">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="ref-text-section">
                <h4 className="ref-section-title">Açıklama</h4>
                <div className="ref-description-text">
                  {activeItem.data.description || 'Bu eşya için ek açıklama bulunmuyor.'}
                </div>
              </div>
            </div>
          )}

          {/* 3. DURUM DETAYLARI */}
          {activeItem?.type === 'condition' && (
            <div className="ref-content-condition">
              <div className="ref-condition-card-header">
                <span className="ref-condition-large-icon">{activeItem.data.icon}</span>
                <div>
                  <h4 className="ref-condition-heading">{activeItem.data.name}</h4>
                  <p className="ref-condition-desc">{activeItem.data.description}</p>
                </div>
              </div>

              <div className="ref-text-section">
                <h4 className="ref-section-title">Mekanik Kural Etkileri</h4>
                <ul className="ref-bullet-list">
                  {activeItem.data.effects.map((eff, i) => (
                    <li key={i}>{eff}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 4. CANAVAR / NPC DETAYLARI */}
          {activeItem?.type === 'creature' && (
            <div className="ref-content-creature">
              <div className="ref-creature-sub">
                {activeItem.data.size} {activeItem.data.type}, {activeItem.data.alignment}
              </div>

              <div className="ref-meta-grid">
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Zırh Sınıfı (AC)</span>
                  <span className="ref-meta-value">{activeItem.data.armorClass}</span>
                </div>
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Can (HP)</span>
                  <span className="ref-meta-value">{activeItem.data.hitPoints}</span>
                </div>
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Hız</span>
                  <span className="ref-meta-value">{activeItem.data.speed}</span>
                </div>
                <div className="ref-meta-card">
                  <span className="ref-meta-label">Challenge Rating</span>
                  <span className="ref-meta-value">CR {activeItem.data.challengeRating}</span>
                </div>
              </div>

              <div className="ref-stat-block-grid">
                <div className="ref-stat-box">
                  <span className="ref-stat-name">STR</span>
                  <span className="ref-stat-num">{activeItem.data.str}</span>
                </div>
                <div className="ref-stat-box">
                  <span className="ref-stat-name">DEX</span>
                  <span className="ref-stat-num">{activeItem.data.dex}</span>
                </div>
                <div className="ref-stat-box">
                  <span className="ref-stat-name">CON</span>
                  <span className="ref-stat-num">{activeItem.data.con}</span>
                </div>
                <div className="ref-stat-box">
                  <span className="ref-stat-name">INT</span>
                  <span className="ref-stat-num">{activeItem.data.int}</span>
                </div>
                <div className="ref-stat-box">
                  <span className="ref-stat-name">WIS</span>
                  <span className="ref-stat-num">{activeItem.data.wis}</span>
                </div>
                <div className="ref-stat-box">
                  <span className="ref-stat-name">CHA</span>
                  <span className="ref-stat-num">{activeItem.data.cha}</span>
                </div>
              </div>

              {activeItem.data.description && (
                <div className="ref-text-section">
                  <h4 className="ref-section-title">Hakkında</h4>
                  <div className="ref-description-text">{activeItem.data.description}</div>
                </div>
              )}
            </div>
          )}

          {/* 5. GENEL KURAL */}
          {activeItem?.type === 'rule' && (
            <div className="ref-content-rule">
              <p className="ref-rule-summary">{activeItem.data.summary}</p>
              {activeItem.data.bullets && activeItem.data.bullets.length > 0 && (
                <ul className="ref-bullet-list">
                  {activeItem.data.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
              {activeItem.data.details && (
                <div className="ref-description-text">{activeItem.data.details}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

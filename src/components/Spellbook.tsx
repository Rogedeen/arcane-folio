import React, { useEffect, useState } from 'react';
import { SpellData } from '../types/content';
import { contentService } from '../data/contentService';
import { calculateMaxPreparedSpells } from '../rules/spellPreparation';
import { useReference } from '../context/ReferenceContext';

interface SpellbookProps {
  level: number;
  castingModifier: number;
}

export const Spellbook: React.FC<SpellbookProps> = ({ level, castingModifier }) => {
  const { openReference } = useReference();
  const [spells, setSpells] = useState<SpellData[]>(contentService.getInitialSpells());
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const preparedBySlug = new Map(spells.map((spell) => [spell.slug, spell.prepared]));

      if (!searchTerm.trim()) {
        setIsSearching(false);
        const base = contentService.getInitialSpells().map((spell) => ({
          ...spell,
          prepared: preparedBySlug.get(spell.slug) ?? spell.prepared
        }));
        if (active) {
          setSpells(base);
        }
        return;
      }

      setIsSearching(true);
      const fetched = await contentService.getSpells(searchTerm);
      if (!active) {
        return;
      }

      setSpells(
        fetched.map((spell) => ({
          ...spell,
          prepared: preparedBySlug.get(spell.slug) ?? spell.prepared
        }))
      );
      setIsSearching(false);
    };

    load().catch(() => {
      if (active) {
        setIsSearching(false);
      }
    });

    return () => {
      active = false;
    };
  }, [searchTerm]);

  const maxPrepared = calculateMaxPreparedSpells(level, castingModifier);
  const currentPreparedCount = spells.filter((s) => s.level > 0 && s.prepared).length;

  const togglePrepare = (slug: string) => {
    setSpells((prev) =>
      prev.map((s) => {
        if (s.slug === slug) {
          return { ...s, prepared: !s.prepared };
        }
        return s;
      })
    );
  };

  const filteredSpells = spells.filter((s) => {
    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div id="spellbook-container" className="spellbook-card">
      <div className="spellbook-header">
        <div>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
            📜 Buyu Kitabi & Hazirlanan Buyuler
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            SRD 5.1 büyü kütüphanesi, hazırlık sınırı ve büyü detayları
          </p>
        </div>

        {/* Hazırlanan Büyü Sayacı */}
        <div className="prepared-counter-box" id="prepared-counter-box">
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Hazırlanan Büyüler
          </span>
          <span className="prepared-numbers">
            <strong id="display-prepared-count">{currentPreparedCount}</strong> / <span id="display-max-prepared">{maxPrepared}</span>
          </span>
        </div>
      </div>

      {/* Arama & Seviye Filtreleri */}
      <div className="spellbook-toolbar">
        <input
          id="input-spell-search"
          type="text"
          placeholder="Büyü ara (örn: Fireball)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="spell-search-input"
        />

        <div className="spell-level-tabs">
          {['all', 0, 1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              id={`tab-spell-level-${lvl}`}
              className={`spell-level-tab ${levelFilter === lvl ? 'active' : ''}`}
              onClick={() => setLevelFilter(lvl as number | 'all')}
              aria-label={`Seviye ${lvl} Büyüleri`}
            >
              {lvl === 'all' ? 'Tümü' : lvl === 0 ? 'Cantrips' : `${lvl}. Seviye`}
            </button>
          ))}
        </div>
      </div>

      {/* Büyü Listesi */}
      <div className="spells-list-grid" id="spells-list-grid">
        {isSearching && <p style={{ color: 'var(--text-secondary)' }}>Aranıyor...</p>}
        {filteredSpells.map((spell) => (
          <div
            key={spell.slug}
            id={`spell-card-${spell.slug}`}
            className={`spell-item-card ${spell.prepared ? 'prepared' : ''}`}
            onClick={() => openReference({ type: 'spell', data: spell })}
            style={{ cursor: 'pointer' }}
          >
            <div className="spell-card-top">
              <span className="spell-name font-cinzel">{spell.name}</span>
              <span className="spell-level-badge">
                {spell.level === 0 ? 'Cantrip' : `${spell.level}. Seviye`}
              </span>
            </div>

            <div className="spell-meta-row">
              <span>{spell.school}</span> • <span>{spell.castingTime}</span> • <span>{spell.range}</span>
            </div>

            <p className="spell-snippet">{spell.description}</p>

            <div className="spell-card-footer" onClick={(e) => e.stopPropagation()}>
              {spell.level > 0 ? (
                <button
                  id={`btn-prepare-${spell.slug}`}
                  className={`prepare-toggle-btn ${spell.prepared ? 'active' : ''}`}
                  onClick={() => togglePrepare(spell.slug)}
                  aria-label={`${spell.name} hazırla`}
                >
                  {spell.prepared ? '✓ Hazırlandı' : '+ Hazırla'}
                </button>
              ) : (
                <span className="cantrip-tag">Sürekli Hazır</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

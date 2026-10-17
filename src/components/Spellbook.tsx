import React, { useEffect, useState } from 'react';
import { SpellData } from '../types/content';
import { contentService } from '../data/contentService';
import { calculateMaxPreparedSpells } from '../rules/spellPreparation';
import { getMaxSpellLevelForCharacter } from '../rules/spellSlots';
import { useReference } from '../context/ReferenceContext';

interface SpellbookProps {
  level: number;
  castingModifier: number;
  charClass?: string;
  subclass?: string;
}

export const Spellbook: React.FC<SpellbookProps> = ({ level, castingModifier, charClass = 'wizard', subclass }) => {
  const { openReference } = useReference();
  const [spells, setSpells] = useState<SpellData[]>(contentService.getInitialSpells());
  const [levelFilter, setLevelFilter] = useState<number | 'all' | 'prepared'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Character legal max spell level calculation
  const maxSpellLevel = getMaxSpellLevelForCharacter(charClass, subclass, level);

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

  // Strict D&D 5e rule: Player can NEVER view, search, or prepare spells higher than their max allowable level
  const legalSpells = spells.filter((s) => s.level <= maxSpellLevel);

  const filteredSpells = legalSpells.filter((s) => {
    if (levelFilter === 'prepared') {
      if (!s.prepared) return false;
    } else if (levelFilter !== 'all') {
      if (s.level !== levelFilter) return false;
    }
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Dynamic level tabs up to the character's max allowable spell tier
  const levelTabs: Array<'all' | 'prepared' | number> = [
    'all',
    'prepared',
    ...Array.from({ length: maxSpellLevel + 1 }, (_, i) => i)
  ];

  return (
    <div id="spellbook-container" className="spellbook-card">
      <div className="spellbook-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem', margin: 0 }}>
              📜 Büyü Kitabı & Hazırlanan Büyüler
            </h3>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(217, 119, 6, 0.2)',
                color: 'var(--accent-gold)',
                border: '1px solid rgba(217, 119, 6, 0.4)',
                fontWeight: 600
              }}
              title={`Sınıf: ${charClass}, Seviye: ${level} -> Maksimum Kullanılabilir Büyü Seviyesi: ${maxSpellLevel}`}
            >
              Maks Seviye: {maxSpellLevel === 0 ? 'Cantrip' : `${maxSpellLevel}. Kademe`}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            D&D 5e kurallarına uygun seviye kısıtlamalı büyü kütüphanesi ve hazırlık yönetimi
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
          placeholder={`Büyü ara (Maks ${maxSpellLevel}. Seviye)...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="spell-search-input"
        />

        <div className="spell-level-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {levelTabs.map((tab) => (
            <button
              key={tab}
              id={`tab-spell-level-${tab}`}
              className={`spell-level-tab ${levelFilter === tab ? 'active' : ''}`}
              onClick={() => setLevelFilter(tab)}
              aria-label={
                tab === 'all'
                  ? 'Tüm Büyüler'
                  : tab === 'prepared'
                  ? 'Sadece Hazırlanan Büyüler'
                  : tab === 0
                  ? 'Cantripler'
                  : `${tab}. Seviye Büyüler`
              }
              style={
                tab === 'prepared'
                  ? {
                      borderColor: levelFilter === 'prepared' ? 'var(--accent-gold)' : 'rgba(217, 119, 6, 0.4)',
                      color: levelFilter === 'prepared' ? '#fff' : 'var(--accent-gold)',
                      fontWeight: 600
                    }
                  : undefined
              }
            >
              {tab === 'all'
                ? 'Tümü'
                : tab === 'prepared'
                ? '✨ Hazırlananlar'
                : tab === 0
                ? 'Cantrips'
                : `${tab}. Seviye`}
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

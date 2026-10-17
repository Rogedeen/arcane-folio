import React, { useEffect, useState } from 'react';
import { SpellData } from '../types/content';
import { contentService } from '../data/contentService';
import { calculateSpellCapacity } from '../rules/spellPreparation';
import { getMaxSpellLevelForCharacter, getSpellSlotsForLevel } from '../rules/spellSlots';
import { useReference } from '../context/ReferenceContext';
import { RpgIcon } from './common/RpgIcon';

interface SpellbookProps {
  level: number;
  castingModifier: number;
  charClass?: string;
  subclass?: string;
  onSpellSlotsChange?: (slots: Record<number, { tier: number; total: number; expended: number }>) => void;
  initialSpellSlots?: Record<number, { tier: number; total: number; expended: number }>;
}

export const Spellbook: React.FC<SpellbookProps> = ({
  level,
  castingModifier,
  charClass = 'wizard',
  subclass,
  initialSpellSlots,
  onSpellSlotsChange
}) => {
  const { openReference } = useReference();
  const [spells, setSpells] = useState<SpellData[]>(contentService.getInitialSpells());
  const [levelFilter, setLevelFilter] = useState<number | 'all' | 'prepared'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [prepLimitMessage, setPrepLimitMessage] = useState<string | null>(null);

  // Spell slots state
  const baseSlots = getSpellSlotsForLevel(charClass, level, subclass);
  const [spellSlotsState, setSpellSlotsState] = useState<Record<number, { tier: number; total: number; expended: number }>>(
    () => initialSpellSlots || baseSlots
  );

  // Character legal max spell level calculation
  const maxSpellLevel = getMaxSpellLevelForCharacter(charClass, subclass, level);

  // Spellcasting model & capacity calculation (Prepared vs Known vs Pact Magic)
  const capacityInfo = calculateSpellCapacity(charClass, level, castingModifier, subclass);

  const toggleSlotExpend = (tier: number, slotIdx: number) => {
    const slotTier = spellSlotsState[tier];
    if (!slotTier) return;

    // slotIdx 0-indexed: eğer slotIdx < expended ise bu slotu geri al (expended - 1), yoksa harca (expended + 1)
    const newExpended = slotIdx < slotTier.expended ? slotIdx : slotIdx + 1;
    const clamped = Math.max(0, Math.min(slotTier.total, newExpended));

    const updated = {
      ...spellSlotsState,
      [tier]: { ...slotTier, expended: clamped }
    };
    setSpellSlotsState(updated);
    onSpellSlotsChange?.(updated);
  };

  useEffect(() => {
    if (initialSpellSlots) {
      setSpellSlotsState(initialSpellSlots);
    }
  }, [initialSpellSlots]);

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

  const maxCapacity = capacityInfo.maxCount;
  const currentPreparedCount = spells.filter((s) => s.level > 0 && s.prepared).length;

  // D&D 5e Kuralı: Büyü hazırlama sınırı aşılamaz!
  const togglePrepare = (slug: string) => {
    const target = spells.find((s) => s.slug === slug);
    if (!target) return;

    const willPrepare = !target.prepared;

    // Eğer 1+ seviye büyü hazırlanıyorsa ve sınır dolmuşsa engelle!
    if (willPrepare && target.level > 0 && currentPreparedCount >= maxCapacity) {
      setPrepLimitMessage(
        `⚠️ ${capacityInfo.labelTr} sınırı doldu! (Maksimum: ${maxCapacity}). Yeni bir büyü hazırlamak için önce hazırlananlardan birini çıkarın.`
      );
      setTimeout(() => {
        setPrepLimitMessage(null);
      }, 4000);
      return;
    }

    setSpells((prev) =>
      prev.map((s) => {
        if (s.slug === slug) {
          return { ...s, prepared: willPrepare };
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

  const isPreparedModel = capacityInfo.model === 'prepared';
  const actionButtonText = (isPrepared: boolean) => {
    if (isPreparedModel) {
      return isPrepared ? '✓ Hazırlandı' : '+ Hazırla';
    }
    return isPrepared ? '✓ Biliniyor' : '+ Öğren';
  };

  return (
    <div id="spellbook-container" className="spellbook-card">
      <div className="spellbook-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem', margin: 0 }}>
              📜 {isPreparedModel ? 'Büyü Kitabı & Hazırlanan Büyüler' : 'Büyü Kütüphanesi & Bilinen Büyüler'}
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
            D&D 5e kurallarına uygun {capacityInfo.labelTr} kütüphanesi ({capacityInfo.model.toUpperCase()} modeli)
          </p>
        </div>

        {/* Büyü Sayacı (Hazırlanan vs Bilinen) */}
        <div className="prepared-counter-box" id="prepared-counter-box">
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {capacityInfo.labelTr}
          </span>
          <span className="prepared-numbers">
            <strong id="display-prepared-count">{currentPreparedCount}</strong> / <span id="display-max-prepared">{maxCapacity}</span>
          </span>
        </div>
      </div>

      {/* Hazırlama Sınırı Uyarı Mesajı */}
      {prepLimitMessage && (
        <div
          id="spellbook-prep-limit-alert"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '0.5rem 0.8rem',
            borderRadius: '6px',
            marginBottom: '0.75rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{prepLimitMessage}</span>
          <button
            type="button"
            onClick={() => setPrepLimitMessage(null)}
            style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 🔮 İnteraktif Büyü Yuvaları (Spell Slots Tracker) Barı */}
      {Object.keys(spellSlotsState).length > 0 && (
        <div
          id="spell-slots-tracker-bar"
          style={{
            background: 'rgba(10, 13, 22, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            padding: '0.6rem 0.8rem',
            marginBottom: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>
              🔮 BÜYÜ YUVALARI (SPELL SLOTS)
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {charClass.toLowerCase() === 'warlock' ? 'Kısa Dinlenmede (Short Rest) Dolar' : 'Uzun Dinlenmede (Long Rest) Dolar'}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Object.entries(spellSlotsState).map(([tierStr, slot]) => {
              const tier = Number(tierStr);
              const remaining = slot.total - slot.expended;

              return (
                <div
                  key={tier}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {tier}. Kademe:
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: slot.total }).map((_, slotIdx) => {
                      const isExpended = slotIdx < slot.expended;
                      return (
                        <button
                          key={slotIdx}
                          type="button"
                          onClick={() => toggleSlotExpend(tier, slotIdx)}
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: isExpended ? 'transparent' : '#38bdf8',
                            border: '1.5px solid #38bdf8',
                            boxShadow: isExpended ? 'none' : '0 0 6px rgba(56, 189, 248, 0.6)',
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'all 0.15s ease'
                          }}
                          title={`Kademe ${tier} Yuva ${slotIdx + 1} (${isExpended ? 'Harcanmış' : 'Kullanılabilir'})`}
                        />
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: remaining > 0 ? '#38bdf8' : 'var(--text-muted)', fontWeight: 700 }}>
                    ({remaining}/{slot.total})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
            <div className="spell-card-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RpgIcon
                  category="spell"
                  schoolOrType={spell.school}
                  slug={spell.slug}
                  size={36}
                  alt={spell.name}
                />
                <span className="spell-name font-cinzel">{spell.name}</span>
              </div>
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
                  aria-label={`${spell.name} ${isPreparedModel ? 'hazırla' : 'öğren'}`}
                >
                  {actionButtonText(Boolean(spell.prepared))}
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

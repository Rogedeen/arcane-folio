// =============================================================================
// DM ENCOUNTER & INITIATIVE TRACKER V3
// Open5e v2 Canavar API entegrasyonu, parti senkronizasyonu, inisiyatif sıralaması,
// tur sayacı ve canlı canavar HP/durum yönetimi.
// =============================================================================

import React, { useState } from 'react';
import { open5eClient, CreatureData } from '../data/open5eClient';
import { PartyMember } from '../types/campaign';
import { calculateModifier } from '../rules/abilityScores';
import { syncService } from '../data/syncService';
import { soundEffects } from '../utils/soundEffects';

export interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'monster';
  initiative: number;
  armorClass: number;
  currentHp: number;
  maxHp: number;
  conditions: string[];
  cr?: string;
  speed?: string;
  stats?: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  sourceData?: CreatureData;
}

// Çevrimdışı veya hızlı seçim için SRD Başlangıç Canavarları
const DEFAULT_MONSTERS: CreatureData[] = [
  {
    slug: 'goblin',
    name: 'Goblin',
    type: 'humanoid',
    size: 'Small',
    alignment: 'neutral evil',
    challengeRating: '1/4',
    armorClass: 15,
    hitPoints: 7,
    speed: '30 ft.',
    str: 8,
    dex: 14,
    con: 10,
    int: 10,
    wis: 8,
    cha: 8,
    source: 'SRD 5.1'
  },
  {
    slug: 'orc',
    name: 'Orc',
    type: 'humanoid',
    size: 'Medium',
    alignment: 'chaotic evil',
    challengeRating: '1/2',
    armorClass: 13,
    hitPoints: 15,
    speed: '30 ft.',
    str: 16,
    dex: 12,
    con: 16,
    int: 7,
    wis: 11,
    cha: 10,
    source: 'SRD 5.1'
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    type: 'undead',
    size: 'Medium',
    alignment: 'lawful evil',
    challengeRating: '1/4',
    armorClass: 13,
    hitPoints: 13,
    speed: '30 ft.',
    str: 10,
    dex: 14,
    con: 15,
    int: 6,
    wis: 8,
    cha: 5,
    source: 'SRD 5.1'
  },
  {
    slug: 'ogre',
    name: 'Ogre',
    type: 'giant',
    size: 'Large',
    alignment: 'chaotic evil',
    challengeRating: '2',
    armorClass: 11,
    hitPoints: 59,
    speed: '40 ft.',
    str: 19,
    dex: 8,
    con: 16,
    int: 5,
    wis: 7,
    cha: 7,
    source: 'SRD 5.1'
  },
  {
    slug: 'young-red-dragon',
    name: 'Young Red Dragon',
    type: 'dragon',
    size: 'Large',
    alignment: 'chaotic evil',
    challengeRating: '10',
    armorClass: 18,
    hitPoints: 178,
    speed: '40 ft., climb 40 ft., fly 80 ft.',
    str: 23,
    dex: 10,
    con: 21,
    int: 14,
    wis: 11,
    cha: 19,
    source: 'SRD 5.1'
  }
];

interface EncounterTrackerProps {
  partyMembers: PartyMember[];
}

export const EncounterTracker: React.FC<EncounterTrackerProps> = ({ partyMembers }) => {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [round, setRound] = useState<number>(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [isCombatActive, setIsCombatActive] = useState<boolean>(false);

  // Canavar Arama Durumu
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<CreatureData[]>(DEFAULT_MONSTERS);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Hasar girişi için state
  const [damageInput, setDamageInput] = useState<Record<string, number>>({});

  // Open5e Canavar Arama
  const handleSearchCreatures = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults(DEFAULT_MONSTERS);
      return;
    }

    setIsSearching(true);
    try {
      const res = await open5eClient.searchCreatures(q, undefined, 12);
      if (res.data && res.data.length > 0) {
        setSearchResults(res.data);
      } else {
        // Fallback: Yerel filtreleme
        const filtered = DEFAULT_MONSTERS.filter((m) =>
          m.name.toLowerCase().includes(q.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } catch {
      const filtered = DEFAULT_MONSTERS.filter((m) =>
        m.name.toLowerCase().includes(q.toLowerCase())
      );
      setSearchResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  // Partiyi Karşılaşmaya Aktar
  const handleAddParty = () => {
    const existingPlayerIds = new Set(
      combatants.filter((c) => c.type === 'player').map((c) => c.id)
    );

    const newPlayers: Combatant[] = partyMembers
      .filter((p) => !existingPlayerIds.has(p.id))
      .map((p) => {
        const dexMod = calculateModifier(p.stats.dex);
        return {
          id: p.id,
          name: p.name,
          type: 'player',
          initiative: 10 + dexMod,
          armorClass: p.ac,
          currentHp: p.currentHp,
          maxHp: p.maxHp,
          conditions: [...p.activeConditions],
          stats: p.stats,
        };
      });

    setCombatants((prev) => [...prev, ...newPlayers]);
  };

  // Karşılaşmaya Canavar Ekle
  const handleAddMonster = (monster: CreatureData) => {
    const existingCount = combatants.filter((c) =>
      c.name.startsWith(monster.name)
    ).length;

    const monsterDexMod = calculateModifier(monster.dex ?? 10);
    const rolledInit = Math.floor(Math.random() * 20) + 1 + monsterDexMod;

    const newMonster: Combatant = {
      id: `monster-${monster.slug}-${Date.now()}-${Math.random()}`,
      name: existingCount > 0 ? `${monster.name} #${existingCount + 1}` : monster.name,
      type: 'monster',
      initiative: rolledInit,
      armorClass: monster.armorClass ?? 12,
      currentHp: monster.hitPoints ?? 10,
      maxHp: monster.hitPoints ?? 10,
      conditions: [],
      cr: monster.challengeRating,
      speed: monster.speed,
      stats: {
        str: monster.str ?? 10,
        dex: monster.dex ?? 10,
        con: monster.con ?? 10,
        int: monster.int ?? 10,
        wis: monster.wis ?? 10,
        cha: monster.cha ?? 10,
      },
      sourceData: monster,
    };

    setCombatants((prev) => [...prev, newMonster]);
  };

  // Tüm İnisiyatifleri Yuvarla ve Sırala
  const handleRollAllInitiative = () => {
    soundEffects.playDiceRollSound();
    const updated = combatants.map((c) => {
      const dexMod = c.stats ? calculateModifier(c.stats.dex) : 0;
      const roll = Math.floor(Math.random() * 20) + 1 + dexMod;
      return { ...c, initiative: roll };
    });

    // İnisiyatife göre sırala (yüksekten düşüğe)
    updated.sort((a, b) => b.initiative - a.initiative);
    setCombatants(updated);
    setCurrentTurnIndex(0);
    setIsCombatActive(true);

    syncService.broadcast({
      type: 'ENCOUNTER_UPDATE',
      campaignId: 'camp-default',
      senderRole: 'dm',
      payload: { note: 'İnisiyatif zarları atıldı ve dövüş başladı!' },
      timestamp: new Date().toISOString(),
    });
  };

  // Sonraki Tur / Sıra
  const handleNextTurn = () => {
    if (combatants.length === 0) return;
    if (currentTurnIndex >= combatants.length - 1) {
      setCurrentTurnIndex(0);
      setRound((prev) => prev + 1);
    } else {
      setCurrentTurnIndex((prev) => prev + 1);
    }
  };

  // Önceki Sıra
  const handlePrevTurn = () => {
    if (combatants.length === 0) return;
    if (currentTurnIndex > 0) {
      setCurrentTurnIndex((prev) => prev - 1);
    } else if (round > 1) {
      setCurrentTurnIndex(combatants.length - 1);
      setRound((prev) => prev - 1);
    }
  };

  // Hasar / İyileşme Uygula
  const handleApplyDamageOrHeal = (combatantId: string, delta: number, isHealing: boolean) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id !== combatantId) return c;
        const newHp = isHealing
          ? Math.min(c.maxHp, c.currentHp + Math.abs(delta))
          : Math.max(0, c.currentHp - Math.abs(delta));
        return { ...c, currentHp: newHp };
      })
    );
  };

  // Durum Ekle / Kaldır
  const handleToggleCondition = (combatantId: string, cond: string) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id !== combatantId) return c;
        const has = c.conditions.includes(cond);
        const next = has ? c.conditions.filter((x) => x !== cond) : [...c.conditions, cond];
        return { ...c, conditions: next };
      })
    );
  };

  // Dövüşçüyü Kaldır
  const handleRemoveCombatant = (combatantId: string) => {
    setCombatants((prev) => prev.filter((c) => c.id !== combatantId));
  };

  // Karşılaşmayı Sıfırla
  const handleResetEncounter = () => {
    setCombatants([]);
    setRound(1);
    setCurrentTurnIndex(0);
    setIsCombatActive(false);
  };

  const activeCombatant = combatants[currentTurnIndex];

  return (
    <div className="encounter-tracker-container" id="encounter-tracker-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. ÜST KONTROL PANELİ (TUR & İNİSİYATİF YÖNETİMİ) */}
      <div className="encounter-header-panel" style={{ background: 'rgba(18, 26, 45, 0.8)', border: '1px solid var(--border-gold)', borderRadius: '16px', padding: '1.2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '1.4rem' }}>
              ⚔️ DM Karşılaşma & İnisiyatif Takipçisi
            </h2>
            <span style={{ background: isCombatActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: isCombatActive ? '1px solid #22c55e' : '1px solid #ef4444', color: isCombatActive ? '#4ade80' : '#fca5a5', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
              {isCombatActive ? `AKTİF DÖVÜŞ (TUR ${round})` : 'BEKLEMEDE'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>
            Open5e v2 canavar kataloğu • {combatants.length} savaşçı masada
          </p>
        </div>

        {/* Aksiyon Butonları */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            id="btn-add-party-to-encounter"
            className="action-button secondary"
            onClick={handleAddParty}
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            👥 Partiyi Masaya Çek
          </button>

          <button
            id="btn-roll-all-initiatives"
            className="action-button"
            onClick={handleRollAllInitiative}
            disabled={combatants.length === 0}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
          >
            🎲 Tüm İnisiyatifleri At & Başlat
          </button>

          {isCombatActive && (
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '8px' }}>
              <button
                className="action-button secondary"
                onClick={handlePrevTurn}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                title="Önceki Sıra"
              >
                ◀️
              </button>
              <button
                id="btn-next-turn"
                className="action-button"
                onClick={handleNextTurn}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
              >
                Sonraki Sıra ▶️
              </button>
            </div>
          )}

          {combatants.length > 0 && (
            <button
              className="action-button danger"
              onClick={handleResetEncounter}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.7rem' }}
              title="Karşılaşmayı Sıfırla"
            >
              🔄 Sıfırla
            </button>
          )}
        </div>
      </div>

      {/* 2. DÖVÜŞ ALANI (SOL: İNİSİYATİF LİSTESİ, SAĞ: CANAVAR KATALOĞU) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.25rem' }}>
        
        {/* SOL: İNİSİYATİF SIRASI & SAVAŞÇI KARTLARI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="font-cinzel" style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.15rem' }}>
              🎯 İnisiyatif Sırası ({combatants.length})
            </h3>
            {activeCombatant && (
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                Sıradaki: <strong>{activeCombatant.name}</strong>
              </span>
            )}
          </div>

          {combatants.length === 0 ? (
            <div style={{ background: 'rgba(18, 26, 45, 0.5)', border: '1px dashed var(--border-subtle)', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚔️</div>
              <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Karşılaşmada henüz kimse yok.</p>
              <p style={{ fontSize: '0.85rem', margin: '0.3rem 0 1rem' }}>
                Yukarıdan <strong>"Partiyi Masaya Çek"</strong> butonuna basın veya sağdaki katalogdan canavarları ekleyin.
              </p>
            </div>
          ) : (
            combatants.map((c, index) => {
              const isActive = index === currentTurnIndex && isCombatActive;
              const isDead = c.currentHp <= 0;
              const hpPercent = Math.round((c.currentHp / c.maxHp) * 100);

              let hpColor = '#22c55e';
              if (hpPercent <= 25) hpColor = '#ef4444';
              else if (hpPercent <= 50) hpColor = '#f59e0b';

              return (
                <div
                  key={c.id}
                  className={`combatant-card ${isActive ? 'active-turn' : ''}`}
                  style={{
                    background: isActive ? 'rgba(217, 119, 6, 0.15)' : 'rgba(18, 26, 45, 0.7)',
                    border: isActive ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '0.9rem',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    boxShadow: isActive ? '0 0 15px rgba(217, 119, 6, 0.3)' : 'none',
                    opacity: isDead ? 0.6 : 1,
                  }}
                >
                  {/* Kart Başlığı */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {/* İnisiyatif Rozeti */}
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: isActive ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)',
                          color: isActive ? '#000' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}
                        title="İnisiyatif Değeri"
                      >
                        {c.initiative}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ color: '#fff', fontSize: '1rem' }}>{c.name}</strong>
                          <span style={{ fontSize: '0.72rem', background: c.type === 'player' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: c.type === 'player' ? '#93c5fd' : '#fca5a5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            {c.type === 'player' ? 'Oyuncu' : `Canavar (CR ${c.cr ?? '?'})`}
                          </span>
                          {isActive && (
                            <span style={{ fontSize: '0.72rem', background: 'var(--accent-gold)', color: '#000', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                              SIRA SENDE
                            </span>
                          )}
                          {isDead && (
                            <span style={{ fontSize: '0.72rem', background: '#991b1b', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              💀 ÖLÜ
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Zırh Sınıfı (AC): <strong style={{ color: '#fff' }}>{c.armorClass}</strong>
                          {c.speed && ` • Hız: ${c.speed}`}
                        </div>
                      </div>
                    </div>

                    {/* Sağ: Sil butonu */}
                    <button
                      onClick={() => handleRemoveCombatant(c.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                      title="Savaşçıyı Masadan Kaldır"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Can Barı ve Kontroller */}
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>Can (HP): <strong style={{ color: hpColor }}>{c.currentHp}</strong> / {c.maxHp}</span>
                      <span>%{hpPercent}</span>
                    </div>

                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%`, height: '100%', background: hpColor, transition: 'width 0.3s ease' }} />
                    </div>

                    {/* Hızlı Hasar / İyileşme Butonları */}
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                      <button
                        className="action-button danger"
                        onClick={() => handleApplyDamageOrHeal(c.id, 5, false)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        -5
                      </button>
                      <button
                        className="action-button danger"
                        onClick={() => handleApplyDamageOrHeal(c.id, 1, false)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        -1
                      </button>
                      <button
                        className="action-button"
                        onClick={() => handleApplyDamageOrHeal(c.id, 1, true)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: '#16a34a' }}
                      >
                        +1
                      </button>
                      <button
                        className="action-button"
                        onClick={() => handleApplyDamageOrHeal(c.id, 5, true)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: '#16a34a' }}
                      >
                        +5
                      </button>

                      {/* Özel Hasar Girişi */}
                      <input
                        type="number"
                        placeholder="Örn: 8"
                        style={{ width: '55px', padding: '0.2rem 0.4rem', fontSize: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
                        value={damageInput[c.id] || ''}
                        onChange={(e) => setDamageInput({ ...damageInput, [c.id]: Number(e.target.value) })}
                      />
                      <button
                        className="action-button secondary"
                        onClick={() => {
                          const val = damageInput[c.id] || 0;
                          if (val > 0) {
                            handleApplyDamageOrHeal(c.id, val, false);
                            setDamageInput({ ...damageInput, [c.id]: 0 });
                          }
                        }}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Vur
                      </button>

                      {/* Durum Rozetleri */}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.2rem' }}>
                        {['Prone', 'Poisoned', 'Stunned'].map((cond) => {
                          const has = c.conditions.includes(cond);
                          return (
                            <button
                              key={cond}
                              onClick={() => handleToggleCondition(c.id, cond)}
                              style={{
                                padding: '0.15rem 0.4rem',
                                fontSize: '0.7rem',
                                borderRadius: '4px',
                                border: has ? '1px solid #ef4444' : '1px solid #475569',
                                background: has ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
                                color: has ? '#fca5a5' : '#94a3b8',
                                cursor: 'pointer'
                              }}
                            >
                              {cond}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* SAĞ: OPEN5E CANAVAR ARAMA & EKLEME */}
        <div style={{ background: 'rgba(18, 26, 45, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 0.3rem', fontSize: '1.15rem' }}>
              🐉 Canavar Kataloğu (Open5e v2)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Yaratık ara ve tek tıkla inisiyatif masasına ekle.
            </p>
          </div>

          {/* Canavar Arama Input */}
          <div style={{ position: 'relative' }}>
            <input
              id="input-monster-search"
              type="text"
              placeholder="Canavar ara (örn: Goblin, Dragon, Ogre)..."
              value={searchQuery}
              onChange={(e) => handleSearchCreatures(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.8rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
            {isSearching && (
              <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                Aranıyor...
              </span>
            )}
          </div>

          {/* Canavar Listesi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '520px', overflowY: 'auto' }}>
            {searchResults.map((monster) => (
              <div
                key={monster.slug}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{monster.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', background: 'rgba(217,119,6,0.15)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                      CR {monster.challengeRating}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    AC: {monster.armorClass} • HP: {monster.hitPoints} • {monster.size} {monster.type}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="action-button"
                    onClick={() => handleAddMonster(monster)}
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
                    title="Karşılaşmaya Ekle"
                  >
                    + Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

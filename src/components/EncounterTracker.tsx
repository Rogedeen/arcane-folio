// =============================================================================
// DM ENCOUNTER & INITIATIVE TRACKER V3
// Open5e v2 Canavar API entegrasyonu, parti senkronizasyonu, inisiyatif sıralaması,
// tur sayacı ve canlı canavar HP/durum yönetimi.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { open5eClient, CreatureData } from '../data/open5eClient';
import { PartyMember } from '../types/campaign';
import { calculateModifier } from '../rules/abilityScores';
import { syncService } from '../data/syncService';
import { soundEffects } from '../utils/soundEffects';
import { loadCharacters } from '../data/persistenceService';
import { calculateArmorClass } from '../rules/armorClass';
import { localDatabase } from '../data/localDatabase';
import { MonsterDetailModal } from './MonsterDetailModal';
import { CONDITIONS, getAllConditions } from '../rules/conditions';

export interface CombatantCondition {
  id: string;
  name: string;
  nameTr: string;
  icon: string;
  roundsRemaining?: number; // undefined = kalıcı
}

export interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'monster';
  initiative: number;
  armorClass: number;
  currentHp: number;
  maxHp: number;
  conditions: string[];
  activeConditionsList?: CombatantCondition[];
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

  // Seçilen Canavar Stat Blok İnceleme Modalı
  const [selectedMonsterForDetail, setSelectedMonsterForDetail] = useState<CreatureData | null>(null);

  // Durum (Condition/Debuff) Ekleme Paneli State'i
  const [activeConditionCombatantId, setActiveConditionCombatantId] = useState<string | null>(null);
  const [modalConditionId, setModalConditionId] = useState<string>('blinded');
  const [modalConditionDuration, setModalConditionDuration] = useState<string>('1');

  // İlk yüklemede yerel veritabanındaki tüm canavarları çek ve arka planda Open5e ile senkronize et
  useEffect(() => {
    setSearchResults(localDatabase.getAllMonsters());
    localDatabase.syncFromOpen5e().then(() => {
      setSearchResults(localDatabase.getAllMonsters());
    });
  }, []);

  // Canavar Arama (Anında yerel DB + arka planda Open5e)
  const handleSearchCreatures = async (query: string) => {
    setSearchQuery(query);
    // 1. Anında yerel aramayı çalıştır (b ile başlayanlar en başta)
    const local = localDatabase.searchMonsters(query);
    setSearchResults(local);

    if (query.trim().length >= 1) {
      setIsSearching(true);
      try {
        const apiRes = await open5eClient.searchCreatures(query, undefined, 30);
        if (apiRes.data && apiRes.data.length > 0) {
          localDatabase.saveMonsters(apiRes.data);
          const updated = localDatabase.searchMonsters(query);
          setSearchResults(updated);
        }
      } catch (err) {
        console.warn('Open5e canavar arama hatası:', err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // 1. SAVAŞ SİSİ (Fog of War) ile Senkronizasyon Yayıncısı
  const broadcastEncounterState = (
    cList: Combatant[],
    active: boolean,
    r: number,
    turnIdx: number,
    note?: string
  ) => {
    const activeCombatant = cList[turnIdx];
    // Savaş Sisi: Oyunculara sadece canavar isimleri ve toplam aldıkları hasar gider
    const monsterTargets = cList
      .filter((c) => c.type === 'monster')
      .map((m) => ({
        id: m.id,
        name: m.name,
        totalDamageTaken: Math.max(0, m.maxHp - m.currentHp),
      }));

    syncService.broadcast({
      type: 'ENCOUNTER_UPDATE',
      campaignId: 'camp-default',
      senderRole: 'dm',
      payload: {
        combatActive: active,
        round: r,
        turnIndex: turnIdx,
        currentTurnName: activeCombatant?.name ?? '',
        activeCombatantId: activeCombatant?.id ?? '',
        note,
        monsterTargets,
      },
      timestamp: new Date().toISOString(),
    });
  };

  // 2. OTOMATİK KATILIM: Oyuncular otomatik olarak dövüşe eklenir
  useEffect(() => {
    setCombatants((prev) => {
      const hasPlayers = prev.some((c) => c.type === 'player');
      if (hasPlayers) return prev;

      let playersSource: PartyMember[] = partyMembers;
      if (!playersSource || playersSource.length === 0) {
        const saved = loadCharacters();
        if (saved && saved.length > 0) {
          playersSource = saved.map((c) => {
            const dexMod = calculateModifier(c.baseAbilities.dex);
            const conMod = calculateModifier(c.baseAbilities.con);
            const wisMod = calculateModifier(c.baseAbilities.wis);
            const ac = calculateArmorClass({
              charClass: c.class,
              dexModifier: dexMod,
              conModifier: conMod,
              wisModifier: wisMod,
              armor: c.equippedArmor,
              hasShield: c.hasShield,
            });
            return {
              id: c.id,
              name: c.name,
              charClass: c.class,
              level: c.level,
              currentHp: c.currentHp,
              maxHp: c.maxHp,
              tempHp: c.tempHp ?? 0,
              ac,
              passivePerception: 10 + wisMod,
              passiveInvestigation: 10 + calculateModifier(c.baseAbilities.int),
              activeConditions: c.activeConditions,
              stats: c.baseAbilities,
              playerName: c.playerName ?? 'Oyuncu',
            };
          });
        }
      }

      if (playersSource && playersSource.length > 0) {
        const playerCombatants: Combatant[] = playersSource.map((p) => {
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
        return [...prev, ...playerCombatants];
      }
      return prev;
    });
  }, [partyMembers]);

  // 3. İNİSİYATİF DİNLEYİCİSİ: Oyuncunun kendi ekranında attığı inisiyatif DM ekranına düşer ve otomatik sıralanır
  useEffect(() => {
    const unsub = syncService.subscribe((event) => {
      if (event.type === 'DICE_ROLLED' && event.payload) {
        const roll = event.payload;
        if (roll.label && roll.label.toLowerCase().includes('inisiyatif')) {
          const totalInit = roll.totalSum;
          const charNamePrefix = roll.label.split('•')[0]?.trim().toLowerCase() || '';

          setCombatants((prev) => {
            const updated = prev.map((c) => {
              if (
                c.type === 'player' &&
                (c.name.toLowerCase() === charNamePrefix ||
                  charNamePrefix.includes(c.name.toLowerCase()))
              ) {
                return { ...c, initiative: totalInit };
              }
              return c;
            });
            updated.sort((a, b) => b.initiative - a.initiative);
            return updated;
          });
          soundEffects.playCritSound();
        }
      }
    });
    return unsub;
  }, []);


  // Partiyi Karşılaşmaya Aktar (Manuel buton desteği de korunur)
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

    setCombatants((prev) => {
      const nextList = [...prev, newMonster];
      if (isCombatActive) {
        broadcastEncounterState(nextList, true, round, currentTurnIndex);
      }
      return nextList;
    });
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

    broadcastEncounterState(updated, true, 1, 0, 'İnisiyatif zarları atıldı ve dövüş başladı!');
  };

  // Sonraki Tur / Sıra (Tüm oyuncu ekranlarında senkronize ilerler)
  const handleNextTurn = () => {
    if (combatants.length === 0) return;
    const currentCombatant = combatants[currentTurnIndex];
    const nextIndex = currentTurnIndex >= combatants.length - 1 ? 0 : currentTurnIndex + 1;
    const nextRound = currentTurnIndex >= combatants.length - 1 ? round + 1 : round;

    let expiredNote: string | undefined;

    // Turu tamamlanan aktif savaşçının (canavar veya oyuncu) süreli durumlarını 1 azalt
    const updatedCombatants = combatants.map((c) => {
      if (c.id !== currentCombatant?.id) return c;
      const list = c.activeConditionsList || [];
      if (list.length === 0) return c;

      const remaining: CombatantCondition[] = [];
      const expired: string[] = [];

      list.forEach((item) => {
        if (item.roundsRemaining === undefined || item.roundsRemaining <= 0) {
          remaining.push(item);
        } else {
          const nextVal = item.roundsRemaining - 1;
          if (nextVal > 0) {
            remaining.push({ ...item, roundsRemaining: nextVal });
          } else {
            expired.push(`${item.icon} ${item.nameTr}`);
          }
        }
      });

      if (expired.length > 0) {
        expiredNote = `⏳ ${c.name} üzerindeki ${expired.join(', ')} etkisi süresi bittiği için kaldırıldı.`;
      }

      return {
        ...c,
        activeConditionsList: remaining,
        conditions: remaining.map((x) => x.name),
      };
    });

    setCombatants(updatedCombatants);
    setCurrentTurnIndex(nextIndex);
    setRound(nextRound);
    broadcastEncounterState(updatedCombatants, true, nextRound, nextIndex, expiredNote);
  };

  // Önceki Sıra
  const handlePrevTurn = () => {
    if (combatants.length === 0) return;
    let prevIndex = currentTurnIndex;
    let prevRound = round;

    if (currentTurnIndex > 0) {
      prevIndex = currentTurnIndex - 1;
    } else if (round > 1) {
      prevIndex = combatants.length - 1;
      prevRound = round - 1;
    }

    setCurrentTurnIndex(prevIndex);
    setRound(prevRound);
    broadcastEncounterState(combatants, true, prevRound, prevIndex);
  };

  // DM'in Oyuncuya İlham Vermesi (Stacklenebilir Heroic Inspiration)
  const handleAwardInspiration = (playerName: string) => {
    soundEffects.playCritSound();
    syncService.broadcast({
      type: 'INSPIRATION_AWARDED',
      campaignId: 'camp-default',
      senderRole: 'dm',
      payload: { playerName },
      timestamp: new Date().toISOString(),
    });
  };

  // Hasar / İyileşme Uygula
  const handleApplyDamageOrHeal = (combatantId: string, delta: number, isHealing: boolean) => {
    setCombatants((prev) => {
      const nextList = prev.map((c) => {
        if (c.id !== combatantId) return c;
        const newHp = isHealing
          ? Math.min(c.maxHp, c.currentHp + Math.abs(delta))
          : Math.max(0, c.currentHp - Math.abs(delta));
        return { ...c, currentHp: newHp };
      });
      if (isCombatActive) {
        broadcastEncounterState(nextList, true, round, currentTurnIndex);
      }
      return nextList;
    });
  };

  // 15 SRD Durum / Debuff Ekle (Süre Seçimli)
  const handleAddCondition = (combatantId: string) => {
    const condDef = CONDITIONS[modalConditionId] || Object.values(CONDITIONS)[0];
    const duration = modalConditionDuration === 'perm' ? undefined : parseInt(modalConditionDuration, 10);

    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id !== combatantId) return c;
        const currentList = c.activeConditionsList || [];
        const nextList = [
          ...currentList.filter((x) => x.id !== condDef.id),
          {
            id: condDef.id,
            name: condDef.name,
            nameTr: condDef.nameTr,
            icon: condDef.icon,
            roundsRemaining: duration,
          },
        ];
        return {
          ...c,
          activeConditionsList: nextList,
          conditions: nextList.map((x) => x.name),
        };
      })
    );
    setActiveConditionCombatantId(null);
  };

  // Durum Kaldır
  const handleRemoveCondition = (combatantId: string, conditionId: string) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id !== combatantId) return c;
        const currentList = c.activeConditionsList || [];
        const nextList = currentList.filter((x) => x.id !== conditionId);
        return {
          ...c,
          activeConditionsList: nextList,
          conditions: nextList.map((x) => x.name),
        };
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
                          {c.type === 'monster' && (
                            <button
                              onClick={() => {
                                const baseName = c.name.split('#')[0].trim();
                                const found = c.sourceData ?? localDatabase.getAllMonsters().find((m) => m.name.toLowerCase().startsWith(baseName.toLowerCase()));
                                if (found) setSelectedMonsterForDetail(found);
                              }}
                              style={{
                                padding: '0.15rem 0.45rem',
                                fontSize: '0.72rem',
                                background: 'rgba(217, 119, 6, 0.2)',
                                border: '1px solid var(--accent-gold)',
                                color: 'var(--accent-gold)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Tüm Aksiyonları, Hasarları ve Yetenekleri Gör"
                            >
                              📜 Stat Blok
                            </button>
                          )}
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

                      {c.type === 'player' && (
                        <button
                          className="action-button"
                          onClick={() => handleAwardInspiration(c.name)}
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: '#d97706', borderColor: '#f59e0b', color: '#fff' }}
                          title="Bu karaktere +1 İlham (Heroic Inspiration) ver"
                        >
                          ✨ İlham Ver
                        </button>
                      )}

                      {/* Durum / Debuff Yönetim Alanı */}
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {/* Aktif Durum Rozetleri */}
                        {(c.activeConditionsList || []).map((cond) => (
                          <span
                            key={cond.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.15rem 0.45rem',
                              fontSize: '0.7rem',
                              borderRadius: '999px',
                              background: 'rgba(239, 68, 68, 0.25)',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                              color: '#fca5a5',
                            }}
                            title={`${cond.nameTr} (${cond.name}) - ${cond.roundsRemaining !== undefined ? `${cond.roundsRemaining} tur kaldı` : 'Kalıcı'}`}
                          >
                            <span>{cond.icon}</span>
                            <strong>{cond.nameTr}</strong>
                            <span style={{ fontSize: '0.62rem', opacity: 0.85 }}>
                              {cond.roundsRemaining !== undefined ? `(${cond.roundsRemaining}t)` : '(∞)'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCondition(c.id, cond.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#fca5a5',
                                cursor: 'pointer',
                                padding: '0 2px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                              }}
                              title="Durumu Kaldır"
                            >
                              ✕
                            </button>
                          </span>
                        ))}

                        {/* Durum / Debuff Ekle Butonu */}
                        <button
                          type="button"
                          className="action-button secondary"
                          onClick={() => {
                            setActiveConditionCombatantId(
                              activeConditionCombatantId === c.id ? null : c.id
                            );
                          }}
                          style={{
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            background: activeConditionCombatantId === c.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)',
                            color: activeConditionCombatantId === c.id ? '#000' : '#e2e8f0',
                            border: '1px solid var(--border-subtle)',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title="Tüm SRD Durumlarından (Kör, Zehirli, Felçli vb.) süre belirleyerek ekle"
                        >
                          ⚡ {activeConditionCombatantId === c.id ? 'Kapat' : '+ Durum'}
                        </button>
                      </div>
                    </div>

                    {/* Açılır Durum / Debuff Ekleme Paneli */}
                    {activeConditionCombatantId === c.id && (
                      <div
                        style={{
                          marginTop: '0.6rem',
                          padding: '0.6rem 0.8rem',
                          background: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid var(--border-gold)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          flexWrap: 'wrap',
                          animation: 'fadeIn 0.15s ease-out',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Durum:</span>
                          <select
                            value={modalConditionId}
                            onChange={(e) => setModalConditionId(e.target.value)}
                            style={{
                              background: '#090d16',
                              border: '1px solid var(--border-subtle)',
                              color: '#fff',
                              borderRadius: '4px',
                              padding: '0.2rem 0.4rem',
                              fontSize: '0.75rem',
                            }}
                          >
                            {getAllConditions().map((cond) => (
                              <option key={cond.id} value={cond.id}>
                                {cond.icon} {cond.nameTr} ({cond.name})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Süre:</span>
                          <select
                            value={modalConditionDuration}
                            onChange={(e) => setModalConditionDuration(e.target.value)}
                            style={{
                              background: '#090d16',
                              border: '1px solid var(--border-subtle)',
                              color: '#fff',
                              borderRadius: '4px',
                              padding: '0.2rem 0.4rem',
                              fontSize: '0.75rem',
                            }}
                          >
                            <option value="1">1 Tur</option>
                            <option value="2">2 Tur</option>
                            <option value="3">3 Tur</option>
                            <option value="5">5 Tur</option>
                            <option value="10">10 Tur (1 Dakika)</option>
                            <option value="perm">Kalıcı (Süresiz)</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          className="action-button"
                          onClick={() => handleAddCondition(c.id)}
                          style={{
                            padding: '0.2rem 0.65rem',
                            fontSize: '0.75rem',
                            background: '#16a34a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ✓ Uygula
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveConditionCombatantId(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          İptal
                        </button>
                      </div>
                    )}
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
                    className="action-button secondary"
                    onClick={() => setSelectedMonsterForDetail(monster)}
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                    title="Stat Blok, Aksiyon ve Yetenekleri İncele"
                  >
                    📜 İncele
                  </button>
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

      {/* 3. Canavar Detay & Stat Blok Modalı */}
      <MonsterDetailModal
        monster={selectedMonsterForDetail}
        onClose={() => setSelectedMonsterForDetail(null)}
        onAddToEncounter={handleAddMonster}
      />

    </div>
  );
};

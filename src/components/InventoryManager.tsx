import React, { useState, useEffect } from 'react';
import { ItemData } from '../types/content';
import { localDatabase } from '../data/localDatabase';
import { open5eClient } from '../data/open5eClient';
import { calculateCarryingCapacity, calculateTotalWeight, isEncumbered } from '../rules/inventory';
import { useReference } from '../context/ReferenceContext';
import { calculatePotionHealing, isPotionItem } from '../rules/potions';
import { soundEffects } from '../utils/soundEffects';
import { RpgIcon } from './common/RpgIcon';

interface InventoryManagerProps {
  strScore: number;
  inventory?: ItemData[];
  currency?: {
    cp: number;
    sp: number;
    gp: number;
    ep?: number;
    pp?: number;
  };
  onCurrencyChange?: (currency: { cp: number; sp: number; gp: number }) => void;
  onInventoryChange?: (items: ItemData[]) => void;
  onUsePotion?: (item: ItemData, healAmount: number, formula: string, rolls: number[]) => void;
}

const DEFAULT_STANDALONE_ITEMS: ItemData[] = [
  {
    slug: 'longsword',
    name: 'Longsword',
    type: 'weapon',
    weight: 3,
    cost: '15 gp',
    description: 'Uzun kılıç',
    properties: ['versatile'],
    quantity: 1,
    equipped: false,
    source: 'SRD 5.1',
    source_ref: 'PHB',
    license: 'OGL / CC-BY-4.0',
  },
  {
    slug: 'potion-of-healing',
    name: 'Potion of Healing',
    type: 'potion',
    weight: 0.5,
    cost: '50 gp',
    description: '2d4 + 2 can iyileştirir.',
    properties: ['consumable'],
    quantity: 1,
    equipped: false,
    source: 'SRD 5.1',
    source_ref: 'PHB',
    license: 'OGL / CC-BY-4.0',
  },
];

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  strScore,
  inventory: externalInventory,
  currency: externalCurrency,
  onCurrencyChange,
  onInventoryChange,
  onUsePotion,
}) => {
  const { openReference } = useReference();
  const [internalItems, setInternalItems] = useState<ItemData[]>(() =>
    externalInventory !== undefined ? externalInventory : DEFAULT_STANDALONE_ITEMS
  );
  const items = externalInventory !== undefined ? externalInventory : internalItems;

  // Para Kesesi (Cüzdan) State'i
  const [currencyState, setCurrencyState] = useState({
    cp: externalCurrency?.cp ?? 0,
    sp: externalCurrency?.sp ?? 0,
    gp: externalCurrency?.gp ?? 15,
  });

  useEffect(() => {
    if (externalCurrency) {
      setCurrencyState({
        cp: externalCurrency.cp ?? 0,
        sp: externalCurrency.sp ?? 0,
        gp: externalCurrency.gp ?? 0,
      });
    }
  }, [externalCurrency]);

  const handleUpdateCurrency = (coin: 'cp' | 'sp' | 'gp', value: number) => {
    const updated = { ...currencyState, [coin]: Math.max(0, value) };
    setCurrencyState(updated);
    onCurrencyChange?.(updated);
  };

  const [activeTab, setActiveTab] = useState<'bag' | 'add'>('bag');
  const [filterType, setFilterType] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState<string>('all');
  const [catalogResults, setCatalogResults] = useState<ItemData[]>(() => localDatabase.getAllItems());
  
  // Eşya Eklendi Geri Bildirimi State'leri
  const [lastAddedSlug, setLastAddedSlug] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Sekme açıldığında veya ilk yüklemede eşyaları veritabanından çek
  useEffect(() => {
    setCatalogResults(localDatabase.getAllItems());
  }, []);

  const updateItems = (newItems: ItemData[]) => {
    setInternalItems(newItems);
    onInventoryChange?.(newItems);
  };

  const carryingCapacity = calculateCarryingCapacity(strScore);
  const totalWeight = Math.round(calculateTotalWeight(items) * 10) / 10;
  const encumbered = isEncumbered(strScore, totalWeight);
  const weightPercent = Math.min(100, Math.round((totalWeight / carryingCapacity) * 100));

  // Kuşan / Çıkar (Tek Zırh Kuralı: Aynı anda sadece 1 adet zırh kuşanılabilir)
  const toggleEquip = (slug: string) => {
    const targetItem = items.find((it) => it.slug === slug);
    if (!targetItem) return;

    const willEquip = !targetItem.equipped;

    const next = items.map((it) => {
      if (it.slug === slug) {
        return { ...it, equipped: willEquip };
      }
      // KURAL: Yeni zırh kuşanıldığında diğer zırhlar otomatik çıkarılır!
      if (willEquip && targetItem.type === 'armor' && it.type === 'armor') {
        return { ...it, equipped: false };
      }
      // KURAL: Yeni kalkan kuşanıldığında diğer kalkanlar otomatik çıkarılır!
      if (
        willEquip &&
        (targetItem.type === 'shield' || targetItem.name.toLowerCase().includes('shield')) &&
        (it.type === 'shield' || it.name.toLowerCase().includes('shield'))
      ) {
        return { ...it, equipped: false };
      }
      return it;
    });

    updateItems(next);
  };

  // İksir İçme (Potion Usage)
  const handleDrinkPotion = (potionItem: ItemData) => {
    const result = calculatePotionHealing(potionItem.name);
    soundEffects.playDiceRollSound();

    // Miktarını 1 azalt (veya 1 ise çantadan düşür)
    changeQuantity(potionItem.slug, -1);

    onUsePotion?.(potionItem, result.healAmount, result.formula, result.rolls);
  };

  // Çantadan At (Drop)
  const dropItem = (slug: string) => {
    const next = items.filter((it) => it.slug !== slug);
    updateItems(next);
  };

  // Miktar Değiştir (0 veya altına düşerse otomatik çantadan kaldırılır)
  const changeQuantity = (slug: string, delta: number) => {
    const next = items
      .map((it) => {
        if (it.slug === slug) {
          const nextQty = (it.quantity ?? 1) + delta;
          return nextQty > 0 ? { ...it, quantity: nextQty } : null;
        }
        return it;
      })
      .filter((it): it is ItemData => it !== null);
    updateItems(next);
  };

  // Katalogdan Çantaya Ekle (Feedback Toast ve Buton Animasyonu ile)
  const addItemToBag = (itemToAdd: ItemData) => {
    soundEffects.playDiceRollSound();
    const exists = items.find((i) => i.slug === itemToAdd.slug);
    if (exists) {
      changeQuantity(itemToAdd.slug, 1);
    } else {
      updateItems([...items, { ...itemToAdd, quantity: 1, equipped: false }]);
    }

    setLastAddedSlug(itemToAdd.slug);
    setFeedbackToast(`✓ "${itemToAdd.name}" başarıyla çantaya eklendi!`);

    setTimeout(() => {
      setLastAddedSlug((curr) => (curr === itemToAdd.slug ? null : curr));
    }, 1400);

    setTimeout(() => {
      setFeedbackToast((curr) => (curr?.includes(itemToAdd.name) ? null : curr));
    }, 3500);
  };

  const [isSearchingApi, setIsSearchingApi] = useState<boolean>(false);

  // Katalog açıldığında eşyaları yükle ve Open5e'den senkronize et
  useEffect(() => {
    const local = localDatabase.getAllItems();
    setCatalogResults(local);

    // Eğer sadece başlangıç eşyaları varsa arka planda Open5e kataloğunu çek
    if (local.length <= 10) {
      open5eClient.searchItems('', 100).then((res) => {
        if (res.data && res.data.length > 0) {
          localDatabase.saveItems(res.data);
          setCatalogResults(localDatabase.getAllItems());
        }
      });
    }
  }, []);

  // Katalogda Anında "Tak Tak" Arama ve Filtreleme (Yerel DB + Open5e API Entegrasyonu)
  const handleCatalogInputChange = (query: string, typeFilt = catalogTypeFilter) => {
    setCatalogSearch(query);
    const local = localDatabase.searchItems(query, typeFilt);
    setCatalogResults(local);

    // Yerel sonuç az ise veya query varsa API'den de asenkron çek
    if (query.trim().length >= 2) {
      setIsSearchingApi(true);
      open5eClient.searchItems(query.trim(), 25).then((res) => {
        setIsSearchingApi(false);
        if (res.data && res.data.length > 0) {
          localDatabase.saveItems(res.data);
          const merged = localDatabase.searchItems(query, typeFilt);
          setCatalogResults(merged);
        }
      }).catch(() => {
        setIsSearchingApi(false);
      });
    }
  };

  const handleCatalogFilterChange = (type: string) => {
    setCatalogTypeFilter(type);
    const updated = localDatabase.searchItems(catalogSearch, type);
    setCatalogResults(updated);
  };

  const handleCatalogSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleCatalogInputChange(catalogSearch);
  };

  const filteredBagItems = items.filter((it) => (filterType === 'all' ? true : it.type === filterType));

  return (
    <div id="inventory-manager-container" className="inventory-card">
      {/* Bildirim Toast'ı */}
      {feedbackToast && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(21, 128, 61, 0.3) 100%)',
            border: '1px solid #22c55e',
            color: '#86efac',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <span>{feedbackToast}</span>
          <button
            onClick={() => setFeedbackToast(null)}
            style={{ background: 'none', border: 'none', color: '#86efac', cursor: 'pointer', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Para Kesesi / Cüzdan (Altın GP, Gümüş SP, Bakır CP) */}
      <div
        className="currency-wallet-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(217, 119, 6, 0.3)',
          borderRadius: '12px',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>💰</span>
          <span className="font-cinzel" style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.95rem' }}>
            PARA KESESİ
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Altın (GP) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(245, 158, 11, 0.12)',
              padding: '0.3rem 0.55rem',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.35)',
            }}
          >
            <span title="Altın (Gold Pieces - GP)" style={{ fontSize: '0.85rem' }}>🪙 <strong>GP</strong></span>
            <input
              type="number"
              min="0"
              value={currencyState.gp}
              onChange={(e) => handleUpdateCurrency('gp', Number(e.target.value))}
              className="currency-number-input"
              style={{
                width: '50px',
                background: '#0a0d16',
                border: '1px solid #d97706',
                color: '#fbbf24',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.15rem 0.2rem',
                MozAppearance: 'textfield',
                appearance: 'textfield',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <button
                type="button"
                onClick={() => handleUpdateCurrency('gp', currencyState.gp + 1)}
                style={{ fontSize: '0.6rem', padding: '0 4px', cursor: 'pointer', background: '#334155', border: 'none', color: '#fff', borderRadius: '2px' }}
                title="+1 Altın"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleUpdateCurrency('gp', Math.max(0, currencyState.gp - 1))}
                style={{ fontSize: '0.6rem', padding: '0 4px', cursor: 'pointer', background: '#334155', border: 'none', color: '#fff', borderRadius: '2px' }}
                title="-1 Altın"
              >
                -
              </button>
            </div>
          </div>

          {/* Gümüş (SP) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(203, 213, 225, 0.12)',
              padding: '0.3rem 0.55rem',
              borderRadius: '8px',
              border: '1px solid rgba(203, 213, 225, 0.35)',
            }}
          >
            <span title="Gümüş (Silver Pieces - SP)" style={{ fontSize: '0.85rem' }}>🥈 <strong>SP</strong></span>
            <input
              type="number"
              min="0"
              value={currencyState.sp}
              onChange={(e) => handleUpdateCurrency('sp', Number(e.target.value))}
              className="currency-number-input"
              style={{
                width: '50px',
                background: '#0a0d16',
                border: '1px solid #94a3b8',
                color: '#e2e8f0',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.15rem 0.2rem',
                MozAppearance: 'textfield',
                appearance: 'textfield',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <button
                type="button"
                onClick={() => handleUpdateCurrency('sp', currencyState.sp + 1)}
                style={{ fontSize: '0.6rem', padding: '0 4px', cursor: 'pointer', background: '#334155', border: 'none', color: '#fff', borderRadius: '2px' }}
                title="+1 Gümüş"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleUpdateCurrency('sp', Math.max(0, currencyState.sp - 1))}
                style={{ fontSize: '0.6rem', padding: '0 4px', cursor: 'pointer', background: '#334155', border: 'none', color: '#fff', borderRadius: '2px' }}
                title="-1 Gümüş"
              >
                -
              </button>
            </div>
          </div>

          {/* Bakır (CP) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(180, 83, 9, 0.12)',
              padding: '0.3rem 0.55rem',
              borderRadius: '8px',
              border: '1px solid rgba(180, 83, 9, 0.35)',
            }}
          >
            <span title="Bakır (Copper Pieces - CP)" style={{ fontSize: '0.85rem' }}>🥉 <strong>CP</strong></span>
            <input
              type="number"
              min="0"
              value={currencyState.cp}
              onChange={(e) => handleUpdateCurrency('cp', Number(e.target.value))}
              className="currency-number-input"
              style={{
                width: '50px',
                background: '#0a0d16',
                border: '1px solid #b45309',
                color: '#fdba74',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.15rem 0.2rem',
                MozAppearance: 'textfield',
                appearance: 'textfield',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <button
                type="button"
                onClick={() => handleUpdateCurrency('cp', currencyState.cp + 1)}
                style={{ fontSize: '0.6rem', padding: '0 4px', cursor: 'pointer', background: '#334155', border: 'none', color: '#fff', borderRadius: '2px' }}
                title="+1 Bakır"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleUpdateCurrency('cp', Math.max(0, currencyState.cp - 1))}
                style={{ fontSize: '0.6rem', padding: '0 4px', cursor: 'pointer', background: '#334155', border: 'none', color: '#fff', borderRadius: '2px' }}
                title="-1 Bakır"
              >
                -
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Üst Sekme Seçici: Çantam vs Eşya Ekle */}
      <div className="inv-nav-header">
        <div className="inv-tab-switcher">
          <button
            id="tab-btn-my-bag"
            className={`inv-main-tab-btn ${activeTab === 'bag' ? 'active' : ''}`}
            onClick={() => setActiveTab('bag')}
          >
            🎒 Çantam ({items.length} Eşya)
          </button>
          <button
            id="tab-btn-add-item"
            className={`inv-main-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            ➕ Eşya Ekle / Ara
          </button>
        </div>

        {/* Taşıma Kapasitesi Barı */}
        <div className="carrying-widget">
          <div className="carrying-header">
            <span>Yük Kapasitesi:</span>
            <strong>{totalWeight} / {carryingCapacity} lbs</strong>
            {encumbered && <span className="encumbered-tag">⚠️ AĞIR YÜK!</span>}
          </div>
          <div className="carrying-progress-bg">
            <div
              className={`carrying-progress-fill ${encumbered ? 'danger' : ''}`}
              style={{ width: `${weightPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. ÇANTAM SEKMESİ */}
      {activeTab === 'bag' && (
        <div className="inv-bag-view">
          {/* Tür Filtreleri */}
          <div className="inventory-filter-bar">
            {['all', 'weapon', 'armor', 'shield', 'potion', 'gear'].map((type) => (
              <button
                key={type}
                className={`inv-filter-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
                aria-label={`${type} Filtrele`}
              >
                {type === 'all' ? 'Tümü' : type === 'weapon' ? 'Silahlar' : type === 'armor' ? 'Zırhlar' : type === 'shield' ? 'Kalkanlar' : type === 'potion' ? 'İksirler' : 'Ekipman'}
              </button>
            ))}
          </div>

          {/* Çanta Listesi */}
          <div className="items-table" id="items-table">
            {filteredBagItems.length === 0 ? (
              <div className="empty-tab-hint" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <p>🎒 Bu kategoride eşya bulunmuyor.</p>
                <button
                  className="action-button"
                  style={{ marginTop: '0.8rem', padding: '0.5rem 1rem' }}
                  onClick={() => setActiveTab('add')}
                >
                  ➕ Katalogdan Yeni Eşya Ekle
                </button>
              </div>
            ) : (
              filteredBagItems.map((item) => (
                <div key={item.slug} className={`item-row ${item.equipped ? 'equipped-row' : ''}`} id={`item-row-${item.slug}`}>
                  <div
                    className="item-main-col"
                    onClick={() => openReference({ type: 'item', data: item })}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    title="Detayları İncele"
                  >
                    <RpgIcon
                      category="item"
                      schoolOrType={item.type}
                      slug={item.slug}
                      size={36}
                      alt={item.name}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="item-name font-cinzel">{item.name}</span>
                        {item.equipped && <span className="equipped-badge">✓ Kuşanıldı</span>}
                      </div>
                      <div className="item-meta">
                        <span>{item.cost}</span> • <span>{item.weight} lbs/adet</span> • <span style={{ textTransform: 'capitalize' }}>{item.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="item-actions-col">
                    {/* Miktar Stepper */}
                    <div className="item-qty-stepper">
                      <button
                        className="qty-btn"
                        onClick={() => changeQuantity(item.slug, -1)}
                        aria-label={`${item.name} azalt`}
                      >
                        -
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => changeQuantity(item.slug, 1)}
                        aria-label={`${item.name} artır`}
                      >
                        +
                      </button>
                    </div>

                    {/* Kuşanma / Çıkarma Butonu */}
                    {['weapon', 'armor', 'shield'].includes(item.type) && (
                      <button
                        id={`btn-equip-${item.slug}`}
                        className={`equip-toggle-btn ${item.equipped ? 'active' : ''}`}
                        onClick={() => toggleEquip(item.slug)}
                        aria-label={`${item.name} kuşan/çıkar`}
                      >
                        {item.equipped ? 'Çıkar' : 'Kuşan'}
                      </button>
                    )}

                    {/* İksir İçme (Potion Usage) Butonu */}
                    {isPotionItem(item.name || item.type) && (
                      <button
                        id={`btn-drink-${item.slug}`}
                        className="equip-toggle-btn drink-potion-btn"
                        style={{
                          background: 'rgba(46, 125, 50, 0.2)',
                          borderColor: '#2e7d32',
                          color: '#81c784',
                          fontWeight: 700,
                        }}
                        onClick={() => handleDrinkPotion(item)}
                        aria-label={`${item.name} iç / kullan`}
                        title="İksiri iç ve iyileşme zarı at"
                      >
                        🧪 İç
                      </button>
                    )}

                    {/* Çantadan At (Bırak) Butonu */}
                    <button
                      id={`btn-drop-${item.slug}`}
                      className="item-drop-btn"
                      onClick={() => dropItem(item.slug)}
                      title="Çantadan Yere Bırak / Sil"
                      aria-label={`${item.name} bırak`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. EŞYA EKLE (KATALOG / MAĞAZA) SEKMESİ */}
      {activeTab === 'add' && (
        <div className="inv-catalog-view">
          {/* Katalog Arama Çubuğu */}
          <form onSubmit={handleCatalogSearch} className="catalog-search-bar">
            <input
              id="input-catalog-search"
              type="text"
              className="catalog-input"
              placeholder="Eşya ara (örn: Greatsword, Potion, Plate Armor, Bow)..."
              value={catalogSearch}
              onChange={(e) => handleCatalogInputChange(e.target.value)}
            />
            <button id="btn-catalog-search" type="submit" className="action-button catalog-search-btn">
              🔍 Eşya Ara
            </button>
          </form>

          {/* Katalog Kategori Filtresi */}
          <div className="inventory-filter-bar" style={{ marginTop: '0.6rem' }}>
            {['all', 'weapon', 'armor', 'shield', 'potion', 'gear'].map((type) => (
              <button
                key={type}
                className={`inv-filter-btn ${catalogTypeFilter === type ? 'active' : ''}`}
                onClick={() => handleCatalogFilterChange(type)}
              >
                {type === 'all' ? 'Tümü' : type === 'weapon' ? 'Silahlar' : type === 'armor' ? 'Zırhlar' : type === 'shield' ? 'Kalkanlar' : type === 'potion' ? 'İksirler' : 'Ekipman'}
              </button>
            ))}
          </div>

          {/* Sonuçlar Listesi */}
          <div className="catalog-results-list" style={{ marginTop: '0.8rem' }}>
            {isSearchingApi && (
              <div style={{ textAlign: 'center', padding: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.85rem' }}>
                ⏳ Open5e veritabanında aranıyor...
              </div>
            )}
            {catalogResults.length === 0 && !isSearchingApi && (
              <div className="catalog-empty-prompt">
                <p>🔍 Aradığınız kriterlere uygun eşya bulunamadı.</p>
              </div>
            )}

            {catalogResults.map((item) => (
              <div key={item.slug} className="catalog-item-card">
                <div
                  className="catalog-item-info"
                  onClick={() => openReference({ type: 'item', data: item })}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}
                >
                  <RpgIcon
                    category="item"
                    schoolOrType={item.type}
                    slug={item.slug}
                    size={36}
                    alt={item.name}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="font-cinzel" style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>
                        {item.name}
                      </span>
                      <span className="ref-property-tag" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        {item.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Fiyat: {item.cost} • Ağırlık: {item.weight} lbs
                    </div>
                    {item.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineBreak: 'anywhere' }}>
                        {item.description.slice(0, 120)}...
                      </p>
                    )}
                  </div>
                </div>

                <button
                  id={`btn-add-item-${item.slug}`}
                  className="catalog-add-btn"
                  onClick={() => addItemToBag(item)}
                  title="Çantama Ekle"
                  style={{
                    background: lastAddedSlug === item.slug ? '#16a34a' : undefined,
                    borderColor: lastAddedSlug === item.slug ? '#22c55e' : undefined,
                    color: lastAddedSlug === item.slug ? '#fff' : undefined,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {lastAddedSlug === item.slug ? '✓ Eklendi!' : '➕ Çantaya Ekle'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

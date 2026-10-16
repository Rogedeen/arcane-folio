import React, { useState, useEffect } from 'react';
import { ItemData } from '../types/content';
import { localDatabase } from '../data/localDatabase';
import { open5eClient } from '../data/open5eClient';
import { calculateCarryingCapacity, calculateTotalWeight, isEncumbered } from '../rules/inventory';
import { useReference } from '../context/ReferenceContext';
import { calculatePotionHealing, isPotionItem } from '../rules/potions';
import { soundEffects } from '../utils/soundEffects';

interface InventoryManagerProps {
  strScore: number;
  inventory?: ItemData[];
  onInventoryChange?: (items: ItemData[]) => void;
  onUsePotion?: (item: ItemData, healAmount: number, formula: string, rolls: number[]) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  strScore,
  inventory: externalInventory,
  onInventoryChange,
  onUsePotion,
}) => {
  const { openReference } = useReference();
  const [internalItems, setInternalItems] = useState<ItemData[]>(() =>
    externalInventory !== undefined ? externalInventory : localDatabase.getAllItems()
  );
  const items = externalInventory !== undefined ? externalInventory : internalItems;

  const [activeTab, setActiveTab] = useState<'bag' | 'add'>('bag');
  const [filterType, setFilterType] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState<string>('all');
  const [catalogResults, setCatalogResults] = useState<ItemData[]>(() => localDatabase.getAllItems());
  const [isSearchingCatalog, setIsSearchingCatalog] = useState<boolean>(false);

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

  // Miktar Değiştir
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

  // Katalogdan Çantaya Ekle
  const addItemToBag = (itemToAdd: ItemData) => {
    const exists = items.find((i) => i.slug === itemToAdd.slug);
    if (exists) {
      changeQuantity(itemToAdd.slug, 1);
    } else {
      updateItems([...items, { ...itemToAdd, quantity: 1, equipped: false }]);
    }
  };

  // Katalogda Anında Arama ve Filtreleme
  const handleCatalogInputChange = async (query: string, typeFilt = catalogTypeFilter) => {
    setCatalogSearch(query);
    // 1. Anında yerel aramayı çalıştır
    const local = localDatabase.searchItems(query, typeFilt);
    setCatalogResults(local);

    // 2. 2 harften uzunsa arka planda Open5e'den sorgula
    if (query.trim().length >= 2) {
      setIsSearchingCatalog(true);
      try {
        const apiRes = await open5eClient.searchItems(query.trim(), 25);
        if (apiRes.data && apiRes.data.length > 0) {
          localDatabase.saveItems(apiRes.data);
          const updated = localDatabase.searchItems(query, typeFilt);
          setCatalogResults(updated);
        }
      } catch (err) {
        console.warn('Open5e eşya arama hatası:', err);
      } finally {
        setIsSearchingCatalog(false);
      }
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
                    style={{ cursor: 'pointer' }}
                    title="Detayları İncele"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="item-name font-cinzel">{item.name}</span>
                      {item.equipped && <span className="equipped-badge">✓ Kuşanıldı</span>}
                    </div>
                    <div className="item-meta">
                      <span>{item.cost}</span> • <span>{item.weight} lbs/adet</span> • <span style={{ textTransform: 'capitalize' }}>{item.type}</span>
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
            <button id="btn-catalog-search" type="submit" className="action-button catalog-search-btn" disabled={isSearchingCatalog}>
              {isSearchingCatalog ? 'Aranıyor...' : '🔍 Eşya Ara'}
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
            {catalogResults.length === 0 && !isSearchingCatalog && (
              <div className="catalog-empty-prompt">
                <p>🔍 Aradığınız kriterlere uygun eşya bulunamadı.</p>
              </div>
            )}

            {catalogResults.map((item) => (
              <div key={item.slug} className="catalog-item-card">
                <div
                  className="catalog-item-info"
                  onClick={() => openReference({ type: 'item', data: item })}
                  style={{ cursor: 'pointer' }}
                >
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

                <button
                  id={`btn-add-item-${item.slug}`}
                  className="catalog-add-btn"
                  onClick={() => {
                    addItemToBag(item);
                    soundEffects.playDiceRollSound();
                  }}
                  title="Çantama Ekle"
                >
                  ➕ Çantaya Ekle
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

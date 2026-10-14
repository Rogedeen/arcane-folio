import React, { useState } from 'react';
import { ItemData } from '../types/content';
import { INITIAL_ITEMS } from '../data/sampleContent';
import { calculateCarryingCapacity, calculateTotalWeight, isEncumbered } from '../rules/inventory';

interface InventoryManagerProps {
  strScore: number;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ strScore }) => {
  const [items, setItems] = useState<ItemData[]>(INITIAL_ITEMS);
  const [filterType, setFilterType] = useState<string>('all');

  const carryingCapacity = calculateCarryingCapacity(strScore);
  const totalWeight = Math.round(calculateTotalWeight(items) * 10) / 10;
  const encumbered = isEncumbered(strScore, totalWeight);
  const weightPercent = Math.min(100, Math.round((totalWeight / carryingCapacity) * 100));

  const toggleEquip = (slug: string) => {
    setItems((prev) =>
      prev.map((it) => (it.slug === slug ? { ...it, equipped: !it.equipped } : it))
    );
  };

  const changeQuantity = (slug: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.slug === slug) {
            const nextQty = Math.max(0, it.quantity + delta);
            return { ...it, quantity: nextQty };
          }
          return it;
        })
        .filter((it) => it.quantity > 0)
    );
  };

  const filteredItems = filterType === 'all'
    ? items
    : items.filter((it) => it.type === filterType);

  return (
    <div id="inventory-manager-container" className="inventory-card">
      <div className="inventory-header">
        <div>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
            🎒 Envanter & Tasima Kapasitesi
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            STR tabanlı ağırlık limiti (STR x 15 lbs) ve kuşanılan teçhizat yönetimi
          </p>
        </div>
      </div>

      {/* Ağırlık & Kapasite Çubuğu */}
      <div className="weight-panel" id="weight-panel">
        <div className="weight-info-row">
          <span>Toplam Ağırlık</span>
          <span className="weight-numbers">
            <strong id="display-total-weight">{totalWeight}</strong> / <span id="display-carrying-capacity">{carryingCapacity}</span> lbs
          </span>
        </div>
        <div className="weight-bar-bg">
          <div
            id="weight-bar-fill"
            className="weight-bar-fill"
            style={{
              width: `${weightPercent}%`,
              background: encumbered ? '#ef4444' : weightPercent > 75 ? '#f59e0b' : '#34d399'
            }}
          />
        </div>
        {encumbered && (
          <div id="encumbrance-warning" className="encumbrance-alert">
            ⚠️ <strong>Aşırı Yüklü (Encumbered):</strong> Ağırlık taşıma kapasitesini aşıyor! Hareket hızınız 10 ft azalır.
          </div>
        )}
      </div>

      {/* Filtre Butonları */}
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

      {/* Eşya Listesi */}
      <div className="items-table" id="items-table">
        {filteredItems.map((item) => (
          <div key={item.slug} className={`item-row ${item.equipped ? 'equipped-row' : ''}`} id={`item-row-${item.slug}`}>
            <div className="item-main-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="item-name font-cinzel">{item.name}</span>
                {item.equipped && <span className="equipped-badge">Kuşanıldı</span>}
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

              {/* Kuşanma Butonu */}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

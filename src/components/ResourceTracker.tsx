import React, { useState, useEffect, useRef } from 'react';
import { CharacterClass } from '../types/character';
import { ResourceState } from '../types/resources';
import { applyDamage, applyHealing, applyTempHp } from '../rules/damageHealing';
import { performShortRest, performLongRest } from '../rules/resting';
import { getSpellSlotsForLevel } from '../rules/spellSlots';
import { soundEffects } from '../utils/soundEffects';

interface ResourceTrackerProps {
  charClass: CharacterClass;
  level: number;
  maxHp: number;
  conModifier: number;
  currentHp?: number;    // Dışarıdan kontrol (context'ten)
  tempHp?: number;       // Dışarıdan kontrol (context'ten)
  onHpChange?: (currentHp: number, tempHp?: number) => void;
}

export const ResourceTracker: React.FC<ResourceTrackerProps> = ({
  charClass,
  level,
  maxHp,
  conModifier,
  currentHp: externalHp,
  tempHp: externalTempHp,
  onHpChange,
}) => {
  const [amountInput, setAmountInput] = useState<number>(5);

  const [resources, setResources] = useState<ResourceState>(() => {
    const slots = getSpellSlotsForLevel(charClass, level);
    const initHp = externalHp ?? maxHp;
    const initTemp = externalTempHp ?? 0;
    return {
      currentHp: initHp,
      maxHp,
      tempHp: initTemp,
      hitDiceAvailable: level,
      totalHitDice: level,
      hitDieType: charClass === 'barbarian' ? 'd12' : ['fighter', 'paladin', 'ranger'].includes(charClass) ? 'd10' : ['wizard', 'sorcerer'].includes(charClass) ? 'd6' : 'd8',
      spellSlots: slots,
      pactMagic: charClass === 'warlock' ? { slotLevel: Math.min(5, Math.ceil(level / 2)), total: level >= 11 ? 3 : 2, expended: 0 } : undefined
    };
  });

  const lastReported = useRef<{ hp: number; temp: number }>({
    hp: externalHp ?? maxHp,
    temp: externalTempHp ?? 0,
  });

  // Harici HP değişince yerel state'i de güncelle
  useEffect(() => {
    if (externalHp !== undefined) {
      setResources((prev) => ({ ...prev, currentHp: externalHp }));
      lastReported.current.hp = externalHp;
    }
  }, [externalHp]);

  useEffect(() => {
    if (externalTempHp !== undefined) {
      setResources((prev) => ({ ...prev, tempHp: externalTempHp }));
      lastReported.current.temp = externalTempHp;
    }
  }, [externalTempHp]);

  // Yerel HP değiştiğinde dışarı bildir
  useEffect(() => {
    if (
      onHpChange &&
      (lastReported.current.hp !== resources.currentHp ||
        lastReported.current.temp !== resources.tempHp)
    ) {
      lastReported.current = { hp: resources.currentHp, temp: resources.tempHp };
      onHpChange(resources.currentHp, resources.tempHp);
    }
  }, [resources.currentHp, resources.tempHp, onHpChange]);

  // Karakter sınıfı, seviyesi veya max HP değiştiğinde kaynakları güncelle
  useEffect(() => {
    const slots = getSpellSlotsForLevel(charClass, level);
    setResources((prev) => ({
      ...prev,
      maxHp,
      currentHp: Math.min(prev.currentHp, maxHp) || maxHp,
      totalHitDice: level,
      hitDiceAvailable: Math.min(prev.hitDiceAvailable, level),
      spellSlots: slots,
      pactMagic: charClass === 'warlock' ? { slotLevel: Math.min(5, Math.ceil(level / 2)), total: level >= 11 ? 3 : 2, expended: 0 } : undefined
    }));
  }, [charClass, level, maxHp]);

  // Hasar Alma
  const handleTakeDamage = () => {
    if (amountInput <= 0) return;
    const res = applyDamage(resources.currentHp, resources.tempHp, amountInput);
    setResources((prev) => ({
      ...prev,
      currentHp: res.currentHp,
      tempHp: res.tempHp
    }));
  };

  // İyileşme
  const handleHeal = () => {
    if (amountInput <= 0) return;
    const healed = applyHealing(resources.currentHp, resources.maxHp, amountInput);
    setResources((prev) => ({
      ...prev,
      currentHp: healed
    }));
  };

  // Geçici Can Ekle
  const handleAddTempHp = () => {
    if (amountInput <= 0) return;
    const nextTemp = applyTempHp(resources.tempHp, amountInput);
    setResources((prev) => ({
      ...prev,
      tempHp: nextTemp
    }));
  };

  // Büyü Slotu Harca / Geri Al
  const toggleSpellSlot = (tier: number, index: number) => {
    setResources((prev) => {
      const slot = prev.spellSlots[tier];
      if (!slot) return prev;

      // Eğer index mevcut harcanandan küçükse harcanmışı azalt, değilse artır
      const isExpended = index < slot.expended;
      const nextExpended = isExpended ? slot.expended - 1 : slot.expended + 1;

      return {
        ...prev,
        spellSlots: {
          ...prev.spellSlots,
          [tier]: {
            ...slot,
            expended: Math.max(0, Math.min(slot.total, nextExpended))
          }
        }
      };
    });
  };

  // Kısa Dinlenme
  const handleShortRest = () => {
    if (resources.hitDiceAvailable <= 0) {
      alert('Harcanacak can zarı kalmadı!');
      return;
    }
    soundEffects.playDiceRollSound();
    // 1 can zarı harcayarak ortalama + CON mod iyileş
    const rollAvg = Math.floor(resources.maxHp / resources.totalHitDice) || 5;
    const rolledHp = Math.max(1, rollAvg + conModifier);
    const updated = performShortRest(resources, 1, rolledHp);
    setResources(updated);
  };

  // Uzun Dinlenme
  const handleLongRest = () => {
    soundEffects.playCritSound();
    const updated = performLongRest(resources);
    setResources(updated);
  };

  const hpPercentage = Math.round((resources.currentHp / resources.maxHp) * 100);

  return (
    <div id="resource-tracker-card" className="resources-card">
      <div className="resources-header">
        <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
          🛡️ Kaynak Takibi & Can Bari
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Gelişmiş HP kalkanı, hasar/iyileşme kontrolü ve büyü slotları
        </p>
      </div>

      <div className="resources-main-grid">
        {/* HP & Dinlenme Sol Kolon */}
        <div className="hp-widget-panel">
          {/* D&D Beyond HP Rozeti */}
          <div className="hp-shield-badge">
            <div className="hp-label font-cinzel">CAN PUANI (HP)</div>
            <div className="hp-number-group">
              <span id="display-current-hp" className="current-hp-val font-cinzel">
                {resources.currentHp}
              </span>
              <span className="hp-divider">/</span>
              <span id="display-max-hp" className="max-hp-val">
                {resources.maxHp}
              </span>
            </div>

            {/* Sağlık Çubuğu */}
            <div className="hp-progress-bar">
              <div
                className="hp-progress-fill"
                style={{
                  width: `${hpPercentage}%`,
                  background:
                    hpPercentage > 50
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : hpPercentage > 20
                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(90deg, #ef4444, #f87171)'
                }}
              />
            </div>

            {/* Geçici HP Rozeti */}
            {resources.tempHp > 0 && (
              <div id="badge-temp-hp" className="temp-hp-pill">
                🛡️ +{resources.tempHp} Geçici Can (Temp HP)
              </div>
            )}
          </div>

          {/* Hızlı Hasar & İyileşme Formu */}
          <div className="hp-actions-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <label htmlFor="input-hp-amount" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Miktar:
              </label>
              <input
                id="input-hp-amount"
                type="number"
                min="1"
                max="999"
                value={amountInput}
                onChange={(e) => setAmountInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="amount-input"
              />
            </div>
            <div className="hp-btn-group">
              <button
                id="btn-damage"
                className="action-button-danger"
                onClick={handleTakeDamage}
                aria-label="Hasar Al"
              >
                ⚔️ Hasar Al
              </button>
              <button
                id="btn-heal"
                className="action-button-success"
                onClick={handleHeal}
                aria-label="İyileş"
              >
                💚 İyileş
              </button>
              <button
                id="btn-add-temp-hp"
                className="action-button-temp"
                onClick={handleAddTempHp}
                aria-label="Geçici Can Ekle"
              >
                🛡️ +Temp HP
              </button>
            </div>
          </div>

          {/* Dinlenme Butonları */}
          <div className="rest-control-row">
            <button
              id="btn-short-rest"
              className="rest-btn"
              onClick={handleShortRest}
              aria-label="Kısa Dinlenme Yap"
            >
              ☕ Kısa Dinlenme (Zar: {resources.hitDiceAvailable}/{resources.totalHitDice})
            </button>
            <button
              id="btn-long-rest"
              className="rest-btn rest-btn-long"
              onClick={handleLongRest}
              aria-label="Uzun Dinlenme Yap"
            >
              🌙 Uzun Dinlenme (Tümünü Sıfırla)
            </button>
          </div>
        </div>

        {/* Büyü Slotları Sağ Kolon */}
        <div className="spell-slots-panel" id="spell-slots-container">
          <div className="spell-slots-header">
            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>
              ✨ Büyü Slotları
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Harcanan slotu işaretlemek için daireye tıkla
            </span>
          </div>

          {Object.keys(resources.spellSlots).length === 0 ? (
            <div className="no-spells-hint">
              Bu sınıf ve seviyede büyü slotu bulunmamaktadır.
            </div>
          ) : (
            <div className="slots-grid">
              {Object.entries(resources.spellSlots).map(([tierStr, slot]) => {
                const tier = Number(tierStr);
                return (
                  <div key={tier} className="slot-tier-row" id={`slot-tier-${tier}`}>
                    <span className="slot-tier-label">{tier}. Seviye</span>
                    <div className="slot-pips-container">
                      {Array.from({ length: slot.total }).map((_, idx) => {
                        const isExpended = idx < slot.expended;
                        return (
                          <button
                            key={idx}
                            id={`pip-tier-${tier}-${idx}`}
                            className={`slot-pip ${isExpended ? 'expended' : 'available'}`}
                            onClick={() => toggleSpellSlot(tier, idx)}
                            title={isExpended ? 'Slot Harcandı (Tıkla ve Geri Al)' : 'Slot Hazır (Tıkla ve Harca)'}
                            aria-label={`${tier}. Seviye Slot ${idx + 1} (${isExpended ? 'Harcanmış' : 'Hazır'})`}
                          />
                        );
                      })}
                    </div>
                    <span className="slot-count-tag">
                      {slot.total - slot.expended} / {slot.total}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Warlock Pact Magic Bilgisi */}
          {resources.pactMagic && (
            <div className="pact-magic-box" id="pact-magic-display">
              <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>
                🔮 Warlock Pact Magic:
              </span>
              <span>
                {resources.pactMagic.total - resources.pactMagic.expended} / {resources.pactMagic.total} adet {resources.pactMagic.slotLevel}. Seviye slot (Kısa dinlenmede yenilenir)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

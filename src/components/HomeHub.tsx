// =============================================================================
// HOME HUB V3 — Ana Sayfa Karşılama ve Hızlı Navigasyon
// =============================================================================

import React from 'react';
import { useCharacter } from '../context/CharacterContext';

export type AppView = 'home' | 'gallery' | 'sheet' | 'creator' | 'dm' | 'dice';

interface HomeHubProps {
  onNavigate: (view: AppView) => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({ onNavigate }) => {
  const { activeCharacter, state } = useCharacter();
  const charCount = state.characters.length;

  return (
    <div id="home-hub-container" className="home-hub-root">
      {/* Karşılama Kartı */}
      <section className="hub-welcome-banner">
        <h2 className="font-cinzel hub-title" lang="en" style={{ textTransform: 'none', letterSpacing: '0.04em', margin: '0 0 1rem 0' }}>
          ARCANEFOLIO 5E
        </h2>
        {activeCharacter && (
          <div className="hub-active-char-card" id="hub-active-character-banner">
            <div className="hub-active-char-info">
              <span className="hub-active-badge">AKTİF KARAKTER</span>
              <span className="hub-active-name font-cinzel">{activeCharacter.name}</span>
              <span className="hub-active-details">
                Svye {activeCharacter.level} {activeCharacter.class} • {activeCharacter.currentHp}/{activeCharacter.maxHp} HP
              </span>
            </div>
            <button
              id="btn-open-active-sheet"
              className="hub-active-open-btn font-cinzel"
              onClick={() => onNavigate('sheet')}
            >
              📜 Kâğıdı Aç →
            </button>
          </div>
        )}
      </section>

      {/* 5 Ana Eylem Kartı Grid */}
      <div className="hub-cards-grid">
        {/* 1. Karakterlerim */}
        <div
          id="hub-card-gallery"
          className="hub-action-card"
          onClick={() => onNavigate('gallery')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('gallery')}
        >
          <div className="hub-card-icon">🧝</div>
          <h3 className="font-cinzel hub-card-title">Karakterlerim</h3>
          <p className="hub-card-desc">
            {charCount > 0
              ? `${charCount} kayıtlı karakter. Seç, düzenle veya yenisini ekle.`
              : 'Henüz karakter yok. İlk kahramanını oluştur!'}
          </p>
          <span className="hub-card-btn font-cinzel">
            {charCount > 0 ? `${charCount} Karakteri Gör →` : 'Galeriyi Aç →'}
          </span>
        </div>

        {/* 2. Karakter Kağıdı */}
        <div
          id="hub-card-sheet"
          className={`hub-action-card ${!activeCharacter ? 'dimmed' : ''}`}
          onClick={() => activeCharacter ? onNavigate('sheet') : onNavigate('gallery')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && (activeCharacter ? onNavigate('sheet') : onNavigate('gallery'))}
        >
          <div className="hub-card-icon">📜</div>
          <h3 className="font-cinzel hub-card-title">Karakter Kağıdı</h3>
          <p className="hub-card-desc">
            {activeCharacter
              ? `${activeCharacter.name} — Sekmeli, az kaydırmalı, modern Bento Grid kağıt.`
              : 'Önce bir karakter seçmeli veya oluşturmalısın.'}
          </p>
          <span className="hub-card-btn font-cinzel">
            {activeCharacter ? 'Kağıdı Aç →' : 'Karakter Seç →'}
          </span>
        </div>

        {/* 3. Karakter Oluşturucu */}
        <div
          id="hub-card-creator"
          className="hub-action-card"
          onClick={() => onNavigate('creator')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('creator')}
        >
          <div className="hub-card-icon">🧙</div>
          <h3 className="font-cinzel hub-card-title">Karakter Oluştur</h3>
          <p className="hub-card-desc">
            SRD 5.1 kural motoruyla ırk, sınıf, statlar ve türetilmiş değerlerle yeni bir kahraman yarat.
          </p>
          <span className="hub-card-btn font-cinzel">Yeni Kahraman Yarat →</span>
        </div>

        {/* 4. DM Kokpiti */}
        <div
          id="hub-card-dm"
          className="hub-action-card"
          onClick={() => onNavigate('dm')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('dm')}
        >
          <div className="hub-card-icon">👑</div>
          <h3 className="font-cinzel hub-card-title">DM Ekranı &amp; Kampanya</h3>
          <p className="hub-card-desc">
            Tüm partinin can barları, pasif algı radarı, durum takibi ve canlı senkronize sefer yönetimi.
          </p>
          <span className="hub-card-btn font-cinzel">DM Ekranını Aç →</span>
        </div>
      </div>
    </div>
  );
};

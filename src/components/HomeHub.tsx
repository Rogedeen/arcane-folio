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

      {/* 4 Ana Eylem Kartı Grid (Oyuncu, DM, Yaratım, Koleksiyon) */}
      <div className="hub-cards-grid">
        {/* 1. Karakter Kağıdı / Oyuncu Masası */}
        <div
          id="hub-card-sheet"
          className={`hub-action-card ${!activeCharacter ? 'dimmed' : ''}`}
          onClick={() => (activeCharacter ? onNavigate('sheet') : onNavigate('gallery'))}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && (activeCharacter ? onNavigate('sheet') : onNavigate('gallery'))}
        >
          <div className="hub-card-icon">🛡️</div>
          <h3 className="font-cinzel hub-card-title">Oyuncu Masası &amp; Karakter Kağıdı</h3>
          <p className="hub-card-desc">
            {activeCharacter
              ? `${activeCharacter.name} — Canlı zar atımı, envanter, büyüler ve sefere katılım.`
              : 'Aktif bir karakter kağıdını açıp oyuna katılın veya koleksiyondan bir kahraman seçin.'}
          </p>
          <button
            id="nav-btn-sheet"
            className="hub-card-btn font-cinzel"
            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              activeCharacter ? onNavigate('sheet') : onNavigate('gallery');
            }}
          >
            {activeCharacter ? 'Karakter Masasına Gir →' : 'Karakter Seç →'}
          </button>
        </div>

        {/* 2. DM Kokpiti & Sefer Yönetimi */}
        <div
          id="hub-card-dm"
          className="hub-action-card"
          onClick={() => onNavigate('dm')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('dm')}
        >
          <div className="hub-card-icon">👑</div>
          <h3 className="font-cinzel hub-card-title">Zindan Efendisi (DM Kokpiti)</h3>
          <p className="hub-card-desc">
            Sefer oluştur, davet kodu ile oyuncularını masana topla, canlı parti can barlarını ve canavar karşılaşmalarını yönet.
          </p>
          <button
            id="nav-btn-dm"
            className="hub-card-btn font-cinzel"
            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('dm');
            }}
          >
            DM Masasını Aç →
          </button>
        </div>

        {/* 3. Yeni Karakter Yaratım */}
        <div
          id="hub-card-creator"
          className="hub-action-card"
          onClick={() => onNavigate('creator')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('creator')}
        >
          <div className="hub-card-icon">🧙</div>
          <h3 className="font-cinzel hub-card-title">Karakter Yarat (Sihirbaz)</h3>
          <p className="hub-card-desc">
            SRD 5.1 kural motoruyla ırk, sınıf, statlar ve başlangıç eşyalarıyla sıfırdan yeni bir kahraman inşa et.
          </p>
          <button
            id="nav-btn-creator"
            className="hub-card-btn font-cinzel"
            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('creator');
            }}
          >
            Yeni Kahraman Yarat →
          </button>
        </div>

        {/* 4. Karakterlerim & Koleksiyon */}
        <div
          id="hub-card-gallery"
          className="hub-action-card"
          onClick={() => onNavigate('gallery')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('gallery')}
        >
          <div className="hub-card-icon">🧝</div>
          <h3 className="font-cinzel hub-card-title">Karakterlerim &amp; Koleksiyon</h3>
          <p className="hub-card-desc">
            {charCount > 0
              ? `${charCount} kayıtlı karakter. Seç, düzenle, sil veya yedekle.`
              : 'Kayıtlı karakterlerinizi burada listeleyin ve yönetin.'}
          </p>
          <button
            id="nav-btn-gallery"
            className="hub-card-btn font-cinzel"
            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('gallery');
            }}
          >
            {charCount > 0 ? `${charCount} Karakteri Gör →` : 'Koleksiyonu Aç →'}
          </button>
        </div>
      </div>
    </div>
  );
};

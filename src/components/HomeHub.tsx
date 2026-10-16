import React from 'react';
import { useCharacter } from '../context/CharacterContext';
import { getTranslation } from '../utils/i18n';

export type AppView = 'home' | 'gallery' | 'sheet' | 'creator' | 'dm' | 'dice';

interface HomeHubProps {
  onNavigate: (view: AppView) => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({ onNavigate }) => {
  const { activeCharacter, state } = useCharacter();
  const charCount = state.characters.length;
  const t = getTranslation(state.preferences.language || 'tr');

  return (
    <div id="home-hub-container" className="home-hub-root">
      {/* Karşılama Kartı */}
      <section className="hub-welcome-banner">
        <h2 className="font-cinzel hub-title" lang="en" style={{ textTransform: 'none', letterSpacing: '0.04em', margin: '0 0 1rem 0' }}>
          {t.hubTitle}
        </h2>
        {activeCharacter && (
          <div className="hub-active-char-card" id="hub-active-character-banner">
            <div className="hub-active-char-info">
              <span className="hub-active-badge">{t.activeCharacter}</span>
              <span className="hub-active-name font-cinzel">{activeCharacter.name}</span>
              <span className="hub-active-details">
                {t.levelShort} {activeCharacter.level} {activeCharacter.class} • {activeCharacter.currentHp}/{activeCharacter.maxHp} HP
              </span>
            </div>
            <button
              id="btn-open-active-sheet"
              className="hub-active-open-btn font-cinzel"
              onClick={() => onNavigate('sheet')}
            >
              {t.openActiveSheet}
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
          <h3 className="font-cinzel hub-card-title">{t.hubCardSheetTitle}</h3>
          <p className="hub-card-desc">
            {activeCharacter
              ? `${activeCharacter.name} ${t.hubCardSheetDescActive}`
              : t.hubCardSheetDescEmpty}
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
            {activeCharacter ? t.hubCardSheetBtnActive : t.hubCardSheetBtnEmpty}
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
          <h3 className="font-cinzel hub-card-title">{t.hubCardDmTitle}</h3>
          <p className="hub-card-desc">
            {t.hubCardDmDesc}
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
            {t.hubCardDmBtn}
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
          <h3 className="font-cinzel hub-card-title">{t.hubCardCreatorTitle}</h3>
          <p className="hub-card-desc">
            {t.hubCardCreatorDesc}
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
            {t.hubCardCreatorBtn}
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
          <h3 className="font-cinzel hub-card-title">{t.hubCardGalleryTitle}</h3>
          <p className="hub-card-desc">
            {charCount > 0
              ? `${charCount} ${t.hubCardGalleryDescCount}`
              : t.hubCardGalleryDescEmpty}
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
            {charCount > 0 ? `${charCount} ${t.hubCardGalleryBtnCount}` : t.hubCardGalleryBtnEmpty}
          </button>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { HomeHub, AppView } from './components/HomeHub';
import { ModernCharacterSheet } from './components/ModernCharacterSheet';
import { CharacterCreator } from './components/CharacterCreator';
import { CampaignView } from './components/CampaignView';
import { DiceTray } from './components/DiceTray';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');

  return (
    <div id="app-root" className="app-container">
      {/* 1. Üst Gezinme ve Logo Çubuğu */}
      <header className="app-header" role="banner">
        <div className="logo-group" onClick={() => setCurrentView('home')} style={{ cursor: 'pointer' }}>
          <img src="/icons/icon-192.svg" alt="D&D Logo" className="logo-icon" id="header-logo" />
          <div>
            <h1 className="logo-title font-cinzel">D&D 5e Asistani</h1>
            <p className="logo-subtitle">D&D Beyond Seviyesinde Kampanya & Karakter Portali</p>
          </div>
        </div>

        {/* Ana Gezinme Sekmeleri */}
        <nav className="top-nav-bar" aria-label="Ana Menü">
          <button
            id="nav-btn-home"
            className={`nav-tab-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
            aria-label="Ana Sayfa"
          >
            🏰 Ana Sayfa
          </button>
          <button
            id="nav-btn-sheet"
            className={`nav-tab-btn ${currentView === 'sheet' ? 'active' : ''}`}
            onClick={() => setCurrentView('sheet')}
            aria-label="Karakter Kağıdı"
          >
            📜 Karakter Kağıdı
          </button>
          <button
            id="nav-btn-creator"
            className={`nav-tab-btn ${currentView === 'creator' ? 'active' : ''}`}
            onClick={() => setCurrentView('creator')}
            aria-label="Karakter Oluştur"
          >
            🧙 Karakter Oluştur
          </button>
          <button
            id="nav-btn-dm"
            className={`nav-tab-btn ${currentView === 'dm' ? 'active' : ''}`}
            onClick={() => setCurrentView('dm')}
            aria-label="DM Ekranı"
          >
            👑 DM Ekranı
          </button>
          <button
            id="nav-btn-dice"
            className={`nav-tab-btn ${currentView === 'dice' ? 'active' : ''}`}
            onClick={() => setCurrentView('dice')}
            aria-label="Zar Tepsisi"
          >
            🎲 Zar Tepsisi
          </button>
        </nav>
      </header>

      {/* 2. Dinamik Sayfa Görünümleri */}
      <main className="main-content-viewport" id="main-content-viewport">
        {currentView === 'home' && (
          <HomeHub onNavigate={(view) => setCurrentView(view)} />
        )}

        {currentView === 'sheet' && (
          <ModernCharacterSheet />
        )}

        {currentView === 'creator' && (
          <CharacterCreator />
        )}

        {currentView === 'dm' && (
          <CampaignView />
        )}

        {currentView === 'dice' && (
          <DiceTray />
        )}
      </main>

      {/* 3. Footer */}
      <footer className="app-footer">
        <p>D&D 5e Kampanya & Karakter Portali • SRD 5.1 Lisansı (CC-BY-4.0) Uyumlu • Antigravity V2</p>
      </footer>
    </div>
  );
}

export default App;

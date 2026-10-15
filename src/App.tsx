import { useState, useEffect } from 'react';
import { CharacterProvider, useCharacter } from './context/CharacterContext';
import { ReferenceProvider } from './context/ReferenceContext';
import { HomeHub, AppView } from './components/HomeHub';
import { CharacterGallery } from './components/CharacterGallery';
import { ModernCharacterSheet } from './components/ModernCharacterSheet';
import { CharacterCreator } from './components/CharacterCreator';
import { CampaignView } from './components/CampaignView';
import { DiceTray } from './components/DiceTray';
import { FloatingDice } from './components/FloatingDice';
import { ReferenceDrawer } from './components/ReferenceDrawer';

function AppInner() {
  const { setActiveCharacter } = useCharacter();

  const parseHash = (): AppView => {
    if (typeof window === 'undefined') return 'home';
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) return 'home';

    if (hash.startsWith('sheet/')) {
      const charId = hash.replace('sheet/', '');
      if (charId) {
        setActiveCharacter(charId);
      }
      return 'sheet';
    }

    const validViews: AppView[] = ['home', 'sheet', 'creator', 'dm', 'dice', 'gallery'];
    if (validViews.includes(hash as AppView)) {
      return hash as AppView;
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState<AppView>(parseHash);

  useEffect(() => {
    const onHashChange = () => {
      setCurrentView(parseHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.location.hash = `#${view}`;
    }
  };

  // Karakter oluşturulunca → sheet'e git
  const handleCharacterSaved = (_id: string) => {
    handleNavigate('sheet');
  };

  return (
    <div id="app-root" className="app-container">
      {/* 1. Üst Gezinme ve Logo Çubuğu */}
      <header className="app-header" role="banner">
        <div className="logo-group" onClick={() => handleNavigate('home')} style={{ cursor: 'pointer' }}>
          <img src="/icons/icon-192.svg" alt="D&D Logo" className="logo-icon" id="header-logo" />
          <div>
            <h1 className="logo-title font-cinzel">D&D 5e Asistani</h1>
            <p className="logo-subtitle">D&D Beyond Seviyesinde Kampanya &amp; Karakter Portali</p>
          </div>
        </div>

        {/* Ana Gezinme Sekmeleri */}
        <nav className="top-nav-bar" aria-label="Ana Menü">
          <button
            id="nav-btn-home"
            className={`nav-tab-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigate('home')}
            aria-label="Ana Sayfa"
          >
            🏰 Ana Sayfa
          </button>
          <button
            id="nav-btn-gallery"
            className={`nav-tab-btn ${currentView === 'gallery' ? 'active' : ''}`}
            onClick={() => handleNavigate('gallery')}
            aria-label="Karakterlerim"
          >
            🧝 Karakterler
          </button>
          <button
            id="nav-btn-sheet"
            className={`nav-tab-btn ${currentView === 'sheet' ? 'active' : ''}`}
            onClick={() => handleNavigate('sheet')}
            aria-label="Karakter Kağıdı"
          >
            📜 Kağıt
          </button>
          <button
            id="nav-btn-creator"
            className={`nav-tab-btn ${currentView === 'creator' ? 'active' : ''}`}
            onClick={() => handleNavigate('creator')}
            aria-label="Karakter Oluştur"
          >
            🧙 Oluştur
          </button>
          <button
            id="nav-btn-dm"
            className={`nav-tab-btn ${currentView === 'dm' ? 'active' : ''}`}
            onClick={() => handleNavigate('dm')}
            aria-label="DM Ekranı"
          >
            👑 DM
          </button>
          <button
            id="nav-btn-dice"
            className={`nav-tab-btn ${currentView === 'dice' ? 'active' : ''}`}
            onClick={() => handleNavigate('dice')}
            aria-label="Zar Tepsisi"
          >
            🎲 Zarlar
          </button>
        </nav>
      </header>

      {/* 2. Dinamik Sayfa Görünümleri */}
      <main className="main-content-viewport" id="main-content-viewport">
        {currentView === 'home' && (
          <HomeHub onNavigate={handleNavigate} />
        )}

        {currentView === 'gallery' && (
          <CharacterGallery
            onOpenSheet={() => setCurrentView('sheet')}
            onCreateNew={() => setCurrentView('creator')}
          />
        )}

        {currentView === 'sheet' && (
          <ModernCharacterSheet />
        )}

        {currentView === 'creator' && (
          <CharacterCreator onSaved={handleCharacterSaved} />
        )}

        {currentView === 'dm' && (
          <CampaignView />
        )}

        {currentView === 'dice' && (
          <DiceTray />
        )}
      </main>

      {/* 3. Global Yüzen Zar Masası & Kural Referans Çekmecesi */}
      <FloatingDice onOpenFullTray={() => handleNavigate('dice')} />
      <ReferenceDrawer />

      {/* 4. Footer */}
      <footer className="app-footer">
        <p>D&amp;D 5e Kampanya &amp; Karakter Portali • SRD 5.1 Lisansı (CC-BY-4.0) Uyumlu • V3</p>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <CharacterProvider>
      <ReferenceProvider>
        <AppInner />
      </ReferenceProvider>
    </CharacterProvider>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { CharacterProvider, useCharacter } from './context/CharacterContext';
import { ReferenceProvider } from './context/ReferenceContext';
import { HomeHub, AppView } from './components/HomeHub';
import { CharacterGallery } from './components/CharacterGallery';
import { ModernCharacterSheet } from './components/ModernCharacterSheet';
import { CharacterCreator } from './components/CharacterCreator';
import { CampaignView } from './components/CampaignView';
import { FloatingDice } from './components/FloatingDice';
import { Physical3DDiceOverlay } from './components/Physical3DDiceOverlay';
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
  const [theme, setTheme] = useState<'dark' | 'parchment'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('dnd_theme') as 'dark' | 'parchment') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dnd_theme', theme);
  }, [theme]);

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
          <img src="/icons/icon-192.svg" alt="ArcaneFolio Logo" className="logo-icon" id="header-logo" />
          <div>
            <h1 className="logo-title font-cinzel" lang="en" style={{ textTransform: 'none', letterSpacing: '0.04em' }}>
              ARCANEFOLIO 5E
            </h1>
          </div>
        </div>

        {/* Rol Odaklı Sade Üst Gezinme: Ana sayfada temiz logo & tema, alt ekranlarda sadece '← Ana Sayfa' ve mod etiketi */}
        <div className="top-nav-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentView !== 'home' && (
            <>
              <button
                id="nav-btn-home"
                className="nav-tab-btn"
                onClick={() => handleNavigate('home')}
                aria-label="Ana Sayfaya Dön"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700,
                  border: '1px solid var(--accent-gold)',
                  background: 'rgba(212, 175, 53, 0.12)',
                  color: 'var(--accent-gold)'
                }}
              >
                ← Ana Sayfa
              </button>
              <span
                id="current-role-badge"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  background: currentView === 'dm' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  color: currentView === 'dm' ? '#f87171' : '#60a5fa',
                  border: `1px solid ${currentView === 'dm' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}
              >
                {currentView === 'sheet' && '🛡️ Oyuncu Masası'}
                {currentView === 'dm' && '👑 Zindan Efendisi (DM)'}
                {currentView === 'creator' && '🧙 Karakter Yaratım'}
                {currentView === 'gallery' && '🧝 Karakter Koleksiyonu'}
              </span>
            </>
          )}

          <button
            id="theme-toggle-btn"
            className="theme-toggle-btn"
            onClick={() => setTheme((t) => (t === 'dark' ? 'parchment' : 'dark'))}
            title={theme === 'dark' ? 'Parşömen Moduna Geç (Aydınlık)' : 'Zindan Moduna Geç (Koyu)'}
            aria-label="Tema Değiştir"
          >
            {theme === 'dark' ? '📜 Parşömen' : '🌘 Zindan'}
          </button>
        </div>
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
      </main>

      {/* 3. Global Yüzen Zar Masası & Kural Referans Çekmecesi & Fiziksel 3D Zar */}
      <FloatingDice />
      <Physical3DDiceOverlay />
      <ReferenceDrawer />

      {/* 4. Footer & Yasal Feragatname (Fan Content Policy & CC-BY-4.0) */}
      <footer
        className="app-footer"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.5rem 1rem',
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          ArcaneFolio 5e • 5. Edisyon Masaüstü Rol Yapma Portali
        </p>
        <p style={{ maxWidth: '800px', margin: '0 auto' }}>
          ArcaneFolio 5e, Wizards of the Coast'un <em>Hayran İçerik Politikası (Fan Content Policy)</em> kapsamında
          geliştirilmiş bağımsız, kâr amacı gütmeyen bir hayran içeriğidir. Kural seti ve referans verileri,
          Wizards of the Coast LLC tarafından <em>Creative Commons Attribution 4.0 International (CC-BY-4.0)</em>{' '}
          ile lisanslanan <strong>System Reference Document 5.1 (SRD 5.1)</strong> ve Open5e veri tabanından
          alınmıştır. Bu site Wizards of the Coast LLC tarafından desteklenmemekte, onaylanmamakta veya finanse
          edilmemektedir.
        </p>
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

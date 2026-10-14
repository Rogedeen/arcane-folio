import { useState, useEffect } from 'react';
import { AppHealth, PhaseInfo } from './types/app';
import { defaultDatabaseClient } from './data/supabaseClient';
import { CharacterCreator } from './components/CharacterCreator';
import { ResourceTracker } from './components/ResourceTracker';
import { DiceTray } from './components/DiceTray';

const PHASES: PhaseInfo[] = [
  { id: 0, name: 'Faz 0: Temel (İskelet)', description: 'Vite, React, TypeScript, PWA, Vitest, Playwright', status: 'completed' },
  { id: 1, name: 'Faz 1: Karakter Çekirdeği', description: 'Statlar, ırk, sınıf, türetilmiş değerler (SRD 5.1)', status: 'completed' },
  { id: 2, name: 'Faz 2: Kaynak Takibi & Zarlar', description: 'HP, Dinlenme, Büyü slotları, D4-D100 animasyonlu zar', status: 'in_progress' },
  { id: 3, name: 'Faz 3: Envanter & Büyüler', description: 'Eşyalar, 50 büyü, 50 eşya', status: 'planned' },
  { id: 4, name: 'Faz 4: Sınıf & Durumlar', description: 'Alt sınıflar, koşullar, seviye atlama', status: 'planned' },
  { id: 5, name: 'Faz 5: DM & Senkron', description: 'Realtime veri, kampanya paneli', status: 'planned' },
  { id: 6, name: 'Faz 6: Cila & Çevrimdışı', description: 'Zar atıcı, çevrimdışı önbellek', status: 'planned' }
];

export function App() {
  const [health, setHealth] = useState<AppHealth>({
    status: 'ok',
    version: '0.3.0',
    timestamp: new Date().toISOString(),
    pwaReady: true,
    storageReady: true
  });

  const [dbMessage, setDbMessage] = useState<string>('Kontrol ediliyor...');

  useEffect(() => {
    defaultDatabaseClient.getHealthStatus().then((res) => {
      setDbMessage(res.message);
    });
  }, []);

  const handleRefreshHealth = () => {
    setHealth((prev) => ({
      ...prev,
      timestamp: new Date().toISOString()
    }));
  };

  return (
    <div id="app-root" className="app-container">
      {/* Header */}
      <header className="app-header" role="banner">
        <div className="logo-group">
          <img src="/icons/icon-192.svg" alt="D&D Logo" className="logo-icon" id="header-logo" />
          <div>
            <h1 className="logo-title font-cinzel">D&D 5e Takip</h1>
            <p className="logo-subtitle">D&D Beyond Seviyesinde Kampanya Asistanı</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span id="pwa-status-badge" className="badge badge-success">
            ● PWA Hazır
          </span>
          <span id="health-status-badge" className="badge badge-success">
            ● Sistem: {health.status.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-card" aria-labelledby="hero-title">
        <h2 id="hero-title" className="hero-title font-cinzel">
          Faz 2: Kaynak Takibi & Polhedral Zarlar
        </h2>
        <p className="hero-desc">
          D&D Beyond tarzı dokunsal deneyim: Animasyonlu d4–d100 zar tepsisi, 
          can barı (HP / Temp HP), kısa ve uzun dinlenme sıfırlaması ile kurala uygun büyü slotları.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            id="btn-hero-roll-d20"
            className="action-button"
            onClick={() => {
              const r = Math.floor(Math.random() * 20) + 1;
              const el = document.getElementById('btn-hero-roll-d20');
              if (el) el.textContent = `🎲 D20 Zarı At (${r})`;
            }}
            aria-label="Hızlı D20 Zarı At"
          >
            🎲 D20 Zarı At
          </button>
          <button
            id="btn-refresh-health"
            className="action-button action-button-secondary"
            onClick={handleRefreshHealth}
            aria-label="Sağlık Kontrolünü Yenile"
          >
            🔄 Kontrolü Yenile
          </button>
        </div>
      </section>

      {/* Faz 2: D&D Beyond Tarzı Polhedral Zar Tepsisi */}
      <DiceTray />

      {/* Faz 2: Kaynak Takibi (HP & Büyü Slotları) */}
      <ResourceTracker
        charClass="wizard"
        level={5}
        maxHp={32}
        conModifier={2}
      />

      {/* Faz 1: Karakter Çekirdeği Formu */}
      <CharacterCreator />

      {/* Grid: Health & Roadmap */}
      <main className="dashboard-grid">
        {/* System Health Card */}
        <article className="card" id="system-health-card" aria-labelledby="card-health-title">
          <h3 id="card-health-title" className="card-title font-cinzel">
            🛡️ Sistem Sağlığı
          </h3>
          <div className="metric-row">
            <span className="metric-label">Uygulama Sürümü</span>
            <span id="metric-version" className="metric-value">v{health.version}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">PWA Desteği</span>
            <span id="metric-pwa" className="metric-value">Aktif (Standalone)</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Veri Katmanı</span>
            <span id="metric-db" className="metric-value">{dbMessage}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Son Teşhis Zamanı</span>
            <span id="metric-timestamp" className="metric-value" style={{ fontSize: '0.8rem' }}>
              {new Date(health.timestamp).toLocaleTimeString('tr-TR')}
            </span>
          </div>
        </article>

        {/* Phase Progress Card */}
        <article className="card" id="roadmap-card" aria-labelledby="card-roadmap-title">
          <h3 id="card-roadmap-title" className="card-title font-cinzel">
            🗺️ Faz İlerlemesi
          </h3>
          <div className="phase-list">
            {PHASES.map((phase) => (
              <div
                key={phase.id}
                id={`phase-item-${phase.id}`}
                className={`phase-item ${phase.status === 'in_progress' ? 'active' : ''}`}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{phase.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {phase.description}
                  </div>
                </div>
                <span
                  className={`phase-badge ${
                    phase.status === 'completed'
                      ? 'badge-success'
                      : phase.status === 'in_progress'
                      ? 'badge-warning'
                      : 'badge-secondary'
                  }`}
                  style={{
                    background:
                      phase.status === 'completed'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : phase.status === 'in_progress'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                    color:
                      phase.status === 'completed'
                        ? '#34d399'
                        : phase.status === 'in_progress'
                        ? '#fbbf24'
                        : '#94a3b8'
                  }}
                >
                  {phase.status === 'completed' ? 'Tamamlandı' : phase.status === 'in_progress' ? 'Aktif' : 'Planlandı'}
                </span>
              </div>
            ))}
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>D&D 5e Kampanya Takip • SRD 5.1 Lisansı (CC-BY-4.0) Uyumlu • Faz 2 Kaynak & Zar Takibi</p>
      </footer>
    </div>
  );
}

export default App;

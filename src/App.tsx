import { useState, useEffect } from 'react';
import { AppHealth, PhaseInfo } from './types/app';
import { defaultDatabaseClient } from './data/supabaseClient';

const PHASES: PhaseInfo[] = [
  { id: 0, name: 'Faz 0: Temel (İskelet)', description: 'Vite, React, TypeScript, PWA, Vitest, Playwright', status: 'in_progress' },
  { id: 1, name: 'Faz 1: Karakter Çekirdeği', description: 'Statlar, ırk, sınıf, türetilmiş değerler', status: 'planned' },
  { id: 2, name: 'Faz 2: Kaynak Takibi', description: 'HP, Dinlenme, Büyü slotları', status: 'planned' },
  { id: 3, name: 'Faz 3: Envanter & Büyüler', description: 'Eşyalar, 50 büyü, 50 eşya', status: 'planned' },
  { id: 4, name: 'Faz 4: Sınıf & Durumlar', description: 'Alt sınıflar, koşullar, seviye atlama', status: 'planned' },
  { id: 5, name: 'Faz 5: DM & Senkron', description: 'Realtime veri, kampanya paneli', status: 'planned' },
  { id: 6, name: 'Faz 6: Cila & Çevrimdışı', description: 'Zar atıcı, çevrimdışı önbellek', status: 'planned' }
];

export function App() {
  const [health, setHealth] = useState<AppHealth>({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    pwaReady: true,
    storageReady: true
  });

  const [dbMessage, setDbMessage] = useState<string>('Kontrol ediliyor...');
  const [quickRoll, setQuickRoll] = useState<number | null>(null);

  useEffect(() => {
    defaultDatabaseClient.getHealthStatus().then((res) => {
      setDbMessage(res.message);
    });
  }, []);

  const handleRollD20 = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    setQuickRoll(roll);
  };

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
            <p className="logo-subtitle">Kampanya & Karakter Asistanı</p>
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
          Faz 0: Temel İskelet ve Altyapı
        </h2>
        <p className="hero-desc">
          SRD 5.1 uyumlu, modern PWA mimarisiyle tasarlanan D&D 5e takip platformu. 
          Vite, React 18, TypeScript strict mode ve mobil uyumlu responsive arayüz aktif.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            id="btn-roll-d20"
            className="action-button"
            onClick={handleRollD20}
            aria-label="D20 Zarı At"
          >
            🎲 D20 Zarı At {quickRoll !== null ? `(${quickRoll})` : ''}
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
                    phase.status === 'in_progress' ? 'badge-warning' : 'badge-secondary'
                  }`}
                  style={{
                    background: phase.status === 'in_progress' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                    color: phase.status === 'in_progress' ? '#fbbf24' : '#94a3b8'
                  }}
                >
                  {phase.status === 'in_progress' ? 'Aktif' : 'Planlandı'}
                </span>
              </div>
            ))}
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>D&D 5e Kampanya Takip • SRD 5.1 Lisansı (CC-BY-4.0) Uyumlu • Faz 0 İskelet</p>
      </footer>
    </div>
  );
}

export default App;

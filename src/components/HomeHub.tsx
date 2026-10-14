import React from 'react';

export type AppView = 'home' | 'sheet' | 'creator' | 'dm' | 'dice';

interface HomeHubProps {
  onNavigate: (view: AppView) => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({ onNavigate }) => {
  return (
    <div id="home-hub-container" className="home-hub-root">
      {/* Karşılama Kartı */}
      <section className="hub-welcome-banner">
        <h2 className="font-cinzel hub-title">D&D 5e Kampanya & Karakter Portali</h2>
        <p className="hub-subtitle">
          D&D Beyond kalitesinde masaüstü rol yapma asistanı. 
          Karakter kağıdınızı tek sayfada yönetin, polhedral zarları tek tıkla atın ve DM ekranıyla partiyi canlı senkronize edin.
        </p>
      </section>

      {/* 4 Ana Eylem Kartı Grid */}
      <div className="hub-cards-grid">
        {/* 1. Karakter Kağıdı */}
        <div
          id="hub-card-sheet"
          className="hub-action-card"
          onClick={() => onNavigate('sheet')}
          role="button"
          tabIndex={0}
        >
          <div className="hub-card-icon">📜</div>
          <h3 className="font-cinzel hub-card-title">Karakter Kağıdı</h3>
          <p className="hub-card-desc">
            D&D Beyond tarzı 3 sütunlu az kaydırmalı karakter kağıdı. Can puanı, ölüm kurtarma zarları, büyü kitabı ve envanter.
          </p>
          <span className="hub-card-btn font-cinzel">Karakteri Aç →</span>
        </div>

        {/* 2. Karakter Oluşturucu */}
        <div
          id="hub-card-creator"
          className="hub-action-card"
          onClick={() => onNavigate('creator')}
          role="button"
          tabIndex={0}
        >
          <div className="hub-card-icon">🧙</div>
          <h3 className="font-cinzel hub-card-title">Karakter Oluştur</h3>
          <p className="hub-card-desc">
            SRD 5.1 kural motoruyla ırk, sınıf, statlar ve türetilmiş değerlerle yeni bir kahraman yaratın.
          </p>
          <span className="hub-card-btn font-cinzel">Yeni Kahraman Yarat →</span>
        </div>

        {/* 3. DM Kokpiti & Kampanya */}
        <div
          id="hub-card-dm"
          className="hub-action-card"
          onClick={() => onNavigate('dm')}
          role="button"
          tabIndex={0}
        >
          <div className="hub-card-icon">👑</div>
          <h3 className="font-cinzel hub-card-title">DM Ekranı & Kampanya</h3>
          <p className="hub-card-desc">
            Tüm partinin can barları, pasif algı/inceleme radarı, özel hasar/iyileşme ve canlı senkronize sefer yönetimi.
          </p>
          <span className="hub-card-btn font-cinzel">DM Ekranını Aç →</span>
        </div>

        {/* 4. Polhedral Zar Tepsisi */}
        <div
          id="hub-card-dice"
          className="hub-action-card"
          onClick={() => onNavigate('dice')}
          role="button"
          tabIndex={0}
        >
          <div className="hub-card-icon">🎲</div>
          <h3 className="font-cinzel hub-card-title">Polhedral Zar Tepsisi</h3>
          <p className="hub-card-desc">
            Google tarzı çoklu zar havuzu (6d8, 4d6, 2d20 vb.), ses efektleri ve tekil zar dökümü.
          </p>
          <span className="hub-card-btn font-cinzel">Zar Tepsisini Aç →</span>
        </div>
      </div>
    </div>
  );
};

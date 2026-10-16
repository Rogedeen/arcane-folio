import React from 'react';

interface SheetEmergencyDeathBannerProps {
  currentHp: number;
  isDismissed: boolean;
  successes: number;
  failures: number;
  onReopen: () => void;
}

export const SheetEmergencyDeathBanner: React.FC<SheetEmergencyDeathBannerProps> = ({
  currentHp,
  isDismissed,
  successes,
  failures,
  onReopen,
}) => {
  if (currentHp > 0 || !isDismissed) return null;

  return (
    <div className="sheet-death-emergency-banner" role="alert" id="death-emergency-banner">
      <div className="emergency-info">
        <span className="emergency-icon">💀</span>
        <div className="emergency-text">
          <strong>ÖLÜM EŞİĞİNDESİN (HP: 0)!</strong> Bilincin kapalı, her tur ölüm kurtarma zarı atmalısın.
          <span className="emergency-stats">
            (Başarı: {successes}/3 • Başarısızlık: {failures}/3)
          </span>
        </div>
      </div>
      <button
        id="btn-reopen-death-modal"
        className="emergency-reopen-btn"
        onClick={onReopen}
      >
        💀 Ölüm Zarları Ekranına Dön
      </button>
    </div>
  );
};

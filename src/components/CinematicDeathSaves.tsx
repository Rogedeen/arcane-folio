import React, { useState, useEffect } from 'react';
import { soundEffects } from '../utils/soundEffects';

interface CinematicDeathSavesProps {
  currentHp: number;
  initialSuccesses?: number;
  initialFailures?: number;
  onSavesChange?: (successes: number, failures: number) => void;
  onRegainHp?: (hp: number) => void;
  isDismissed?: boolean;
  onDismiss?: () => void;
}

export const CinematicDeathSaves: React.FC<CinematicDeathSavesProps> = ({
  currentHp,
  initialSuccesses = 0,
  initialFailures = 0,
  onSavesChange,
  onRegainHp,
  isDismissed,
  onDismiss,
}) => {
  const [successes, setSuccesses] = useState(initialSuccesses);
  const [failures, setFailures] = useState(initialFailures);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rollOutcome, setRollOutcome] = useState<'crit20' | 'success' | 'fail' | 'fumble1' | null>(null);
  const [stabilized, setStabilized] = useState(false);
  const [dead, setDead] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setSuccesses(initialSuccesses);
  }, [initialSuccesses]);

  useEffect(() => {
    setFailures(initialFailures);
  }, [initialFailures]);

  const activeDismissed = isDismissed !== undefined ? isDismissed : dismissed;

  // Sadece HP <= 0 ise ve kullanıcı geçici olarak gizlemediyse göster
  if (currentHp > 0 || activeDismissed) {
    return null;
  }

  const handleRollDeathSave = () => {
    if (isRolling || stabilized || dead) return;

    setIsRolling(true);
    soundEffects.playDiceRollSound();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;
      setLastRoll(roll);
      setIsRolling(false);

      if (roll === 20) {
        // Doğal 20: 1 HP ile ayağa kalk
        setRollOutcome('crit20');
        soundEffects.playCritSound();
        onRegainHp?.(1);
        onSavesChange?.(0, 0);
        return;
      }

      if (roll === 1) {
        // Doğal 1: 2 Başarısızlık
        setRollOutcome('fumble1');
        const nextFailures = Math.min(3, failures + 2);
        setFailures(nextFailures);
        onSavesChange?.(successes, nextFailures);
        if (nextFailures >= 3) {
          setDead(true);
        }
        return;
      }

      if (roll >= 10) {
        // Başarı
        setRollOutcome('success');
        const nextSuccesses = Math.min(3, successes + 1);
        setSuccesses(nextSuccesses);
        onSavesChange?.(nextSuccesses, failures);
        if (nextSuccesses >= 3) {
          setStabilized(true);
        }
      } else {
        // Başarısızlık
        setRollOutcome('fail');
        const nextFailures = Math.min(3, failures + 1);
        setFailures(nextFailures);
        onSavesChange?.(successes, nextFailures);
        if (nextFailures >= 3) {
          setDead(true);
        }
      }
    }, 1200); // 1.2 saniye fiziksel zar dönme süresi
  };

  const handleManualStabilize = () => {
    onRegainHp?.(1);
    setDismissed(true);
  };

  return (
    <div className="cinematic-death-overlay" id="cinematic-death-overlay">
      <div className="cinematic-vignette-pulse" />

      <div className="cinematic-death-modal" id="cinematic-death-modal">
        {/* Üst Uyarı */}
        <div className="death-modal-header">
          <span className="death-skull-icon">💀</span>
          <h2 className="font-cinzel death-title">ÖLÜM EŞİĞİNDESİN!</h2>
          <p className="death-subtitle">
            Can puanın 0'a düştü. Bilincini kaybettin ve ölümle pençeleşiyorsun!
          </p>
        </div>

        {/* Başarı & Başarısızlık Takipçisi */}
        <div className="death-saves-meter-grid">
          <div className="meter-col successes">
            <span className="meter-label">BAŞARILAR (10+)</span>
            <div className="meter-pills">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`meter-circle succ ${i < successes ? 'filled' : ''}`}>
                  {i < successes && '✓'}
                </div>
              ))}
            </div>
          </div>

          <div className="meter-col failures">
            <span className="meter-label">BAŞARISIZLIKLAR (1-9)</span>
            <div className="meter-pills">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`meter-circle fail ${i < failures ? 'filled' : ''}`}>
                  {i < failures && '✕'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Fiziksel D20 Zar Alanı */}
        <div className="physical-d20-stage">
          <div className={`physical-d20 ${isRolling ? 'tumbling' : ''} ${rollOutcome || ''}`}>
            <div className="d20-inner-face">
              {isRolling ? '🎲' : lastRoll !== null ? lastRoll : '20'}
            </div>
          </div>

          {lastRoll !== null && !isRolling && (
            <div className={`death-outcome-banner ${rollOutcome || ''}`}>
              {rollOutcome === 'crit20' && '🌟 DOĞAL 20! MUCİZEVİ UYANIŞ (1 HP KAZANDIN)!'}
              {rollOutcome === 'fumble1' && '💀 DOĞAL 1! 2 BAŞARISIZLIK BİRDEN ALDIN!'}
              {rollOutcome === 'success' && `✓ BAŞARILI KURTARMA (${lastRoll})`}
              {rollOutcome === 'fail' && `✕ BAŞARISIZ KURTARMA (${lastRoll})`}
            </div>
          )}
        </div>

        {/* Durum Mesajları */}
        {stabilized && (
          <div className="death-status-box stabilized">
            🛡️ <strong>STABİLİZE OLDUN!</strong> Ölüm tehlikesi geçti, durumun sabitlendi.
          </div>
        )}

        {dead && (
          <div className="death-status-box dead">
            ☠️ <strong>KARAKTERİN HAYATINI KAYBETTİ...</strong> 3 başarısızlık sonucu ruh göçtü.
          </div>
        )}

        {/* Aksiyon Butonları */}
        <div className="death-modal-actions">
          {!stabilized && !dead && (
            <button
              id="btn-roll-cinematic-death"
              className={`death-roll-action-btn ${isRolling ? 'disabled' : ''}`}
              onClick={handleRollDeathSave}
              disabled={isRolling}
            >
              {isRolling ? '🎲 ZAR DÖNÜYOR...' : '🎲 ÖLÜM KURTARMA ZARI AT (d20)'}
            </button>
          )}

          <div className="death-secondary-actions">
            <button
              className="death-heal-btn"
              onClick={handleManualStabilize}
              title="Bir parti üyesi büyü veya şifacı kiti ile seni iyileştirdiyse"
            >
              ❤️ İyileştirildim (+1 HP Gir)
            </button>
            <button
              className="death-minimize-btn"
              onClick={() => {
                setDismissed(true);
                onDismiss?.();
              }}
              title="Karakter kağıdına geçici bakış"
            >
              👁️ Kağıdı Gör
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

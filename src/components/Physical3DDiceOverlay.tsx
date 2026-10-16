import React, { useState, useEffect, useRef } from 'react';
import { syncService } from '../data/syncService';
import { soundEffects } from '../utils/soundEffects';

interface ActiveRollVisual {
  id: string;
  label: string;
  formula: string;
  dieType: string;
  rolledValue: number;
  modifier: number;
  total: number;
  isCrit: boolean;
  isFumble: boolean;
}

export const Physical3DDiceOverlay: React.FC = () => {
  const [activeRoll, setActiveRoll] = useState<ActiveRollVisual | null>(null);
  const [animStage, setAnimStage] = useState<'idle' | 'rolling' | 'settled'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const settleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerVisualRoll = (payload: any) => {
    if (!payload) return;
    const firstDie = payload.diceRolls?.[0];
    const rolledVal = firstDie?.value ?? payload.totalSum;
    const dieType = firstDie?.die ?? 'd20';
    const isCrit = payload.hasCrit20 || (dieType === 'd20' && rolledVal === 20);
    const isFumble = payload.hasFumble1 || (dieType === 'd20' && rolledVal === 1);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);

    setActiveRoll({
      id: payload.id ?? String(Date.now()),
      label: payload.label ?? 'Zar Atışı',
      formula: payload.formula ?? `${dieType}+${payload.modifier ?? 0}`,
      dieType,
      rolledValue: rolledVal,
      modifier: payload.modifier ?? 0,
      total: payload.totalSum,
      isCrit: Boolean(isCrit),
      isFumble: Boolean(isFumble),
    });

    setAnimStage('rolling');
    soundEffects.playDiceRollSound();

    settleTimerRef.current = setTimeout(() => {
      setAnimStage('settled');
      if (isCrit) {
        soundEffects.playCritSound();
      }
    }, 750);

    timerRef.current = setTimeout(() => {
      setAnimStage('idle');
      setActiveRoll(null);
    }, 4500);
  };

  useEffect(() => {
    const unsub = syncService.subscribe((event) => {
      if (event.type === 'DICE_ROLLED' && event.payload) {
        triggerVisualRoll(event.payload);
      }
    });

    const onCustomRoll = (e: CustomEvent) => {
      if (e.detail) triggerVisualRoll(e.detail);
    };
    window.addEventListener('dnd-dice-roll' as any, onCustomRoll);

    return () => {
      unsub();
      window.removeEventListener('dnd-dice-roll' as any, onCustomRoll);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  if (animStage === 'idle' || !activeRoll) return null;

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnimStage('idle');
    setActiveRoll(null);
  };

  return (
    <div
      id="physical-3d-dice-overlay"
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.45) 0%, rgba(2, 6, 23, 0.75) 100%)',
        backdropFilter: 'blur(3px)',
        cursor: 'pointer',
        perspective: '1200px',
        animation: 'fadeIn 0.2s ease-out forwards',
      }}
      title="Kapatmak için ekrana tıkla"
    >
      {/* 3D ZAR VE GÖLGE SAHNESİ */}
      <div
        style={{
          position: 'relative',
          width: '180px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Zemin Fiziksel Gölgesi */}
        <div
          style={{
            position: 'absolute',
            bottom: '-25px',
            width: animStage === 'rolling' ? '90px' : '150px',
            height: '24px',
            background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
            filter: 'blur(4px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: animStage === 'rolling' ? 'scale(0.8) translateY(-10px)' : 'scale(1) translateY(0)',
          }}
        />

        {/* 3D Fiziksel D20 Gövdesi */}
        <div
          className={`physical-dice-polyhedron ${animStage === 'rolling' ? 'dice-is-rolling' : 'dice-is-settled'}`}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: activeRoll.dieType === 'd6' ? '18px' : '50%',
            background: activeRoll.isCrit
              ? 'radial-gradient(circle at 35% 35%, #fde047 0%, #d97706 60%, #78350f 100%)'
              : activeRoll.isFumble
              ? 'radial-gradient(circle at 35% 35%, #f87171 0%, #b91c1c 60%, #450a0a 100%)'
              : 'radial-gradient(circle at 35% 35%, #38bdf8 0%, #1e40af 60%, #0f172a 100%)',
            border: activeRoll.isCrit
              ? '3px solid #fef08a'
              : activeRoll.isFumble
              ? '3px solid #fca5a5'
              : '3px solid #93c5fd',
            boxShadow: activeRoll.isCrit
              ? '0 0 45px rgba(234, 179, 8, 0.8), inset 0 0 20px rgba(254, 240, 138, 0.6)'
              : activeRoll.isFumble
              ? '0 0 45px rgba(220, 38, 38, 0.8), inset 0 0 20px rgba(252, 165, 165, 0.5)'
              : '0 0 35px rgba(56, 189, 248, 0.6), inset 0 0 20px rgba(147, 197, 253, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: '2.8rem',
            fontFamily: 'Cinzel, serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            transformStyle: 'preserve-3d',
            userSelect: 'none',
          }}
        >
          {animStage === 'rolling' ? (
            <span style={{ fontSize: '1.6rem', opacity: 0.7 }}>🎲</span>
          ) : (
            <span style={{ transform: 'translateZ(10px)' }}>{activeRoll.rolledValue}</span>
          )}
        </div>
      </div>

      {/* ZAR SONUÇ BİLGİ KARTI (D&D BEYOND STİLİ GÖZ ALICI HUD) */}
      <div
        style={{
          marginTop: '2rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: activeRoll.isCrit
            ? '2px solid #f59e0b'
            : activeRoll.isFumble
            ? '2px solid #ef4444'
            : '1px solid rgba(217, 119, 6, 0.4)',
          borderRadius: '16px',
          padding: '1.2rem 2rem',
          minWidth: '320px',
          maxWidth: '480px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(217, 119, 6, 0.2)',
          animation: animStage === 'settled' ? 'bounceUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
        }}
      >
        <div style={{ fontSize: '0.88rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          {activeRoll.label}
        </div>

        {/* Büyük Toplam & Formül */}
        <div style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '3rem',
              fontWeight: 900,
              fontFamily: 'Cinzel, serif',
              color: activeRoll.isCrit ? '#fbbf24' : activeRoll.isFumble ? '#f87171' : '#f8fafc',
            }}
          >
            {activeRoll.total}
          </span>
          {activeRoll.modifier !== 0 && (
            <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
              ({activeRoll.dieType} [{activeRoll.rolledValue}] {activeRoll.modifier >= 0 ? `+ ${activeRoll.modifier}` : `- ${Math.abs(activeRoll.modifier)}`})
            </span>
          )}
        </div>

        {/* Özel Durum Bildirimi (Kritik / Fumble) */}
        {activeRoll.isCrit && (
          <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
            ✨ KRİTİK BAŞARI! (NATURAL 20) ✨
          </div>
        )}
        {activeRoll.isFumble && (
          <div style={{ color: '#f87171', fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
            💀 KRİTİK BAŞARISIZLIK (NATURAL 1) 💀
          </div>
        )}

        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.6rem' }}>
          Kapatmak için tıkla veya dokun
        </div>
      </div>

      {/* 3D ZAR ANİMASYON CSS KURALI */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceUp {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .dice-is-rolling {
          animation: diceTumble 0.75s ease-out forwards;
        }
        .dice-is-settled {
          animation: diceImpact 0.3s ease-out forwards;
        }
        @keyframes diceTumble {
          0% {
            transform: translateY(-160px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(0.65);
          }
          40% {
            transform: translateY(20px) rotateX(480deg) rotateY(360deg) rotateZ(180deg) scale(1.15);
          }
          70% {
            transform: translateY(-40px) rotateX(680deg) rotateY(520deg) rotateZ(280deg) scale(1.05);
          }
          100% {
            transform: translateY(0) rotateX(720deg) rotateY(720deg) rotateZ(360deg) scale(1);
          }
        }
        @keyframes diceImpact {
          0% {
            transform: scale(1.15);
          }
          50% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

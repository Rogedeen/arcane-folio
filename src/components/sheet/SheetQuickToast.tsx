import React from 'react';

export interface QuickToastData {
  text: string;
  label?: string;
  d20?: number;
  mod?: number;
  total?: number;
  isCrit?: boolean;
  isFumble?: boolean;
}

interface SheetQuickToastProps {
  toast: QuickToastData | null;
  onDismiss: () => void;
}

export const SheetQuickToast: React.FC<SheetQuickToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div
      className={`sheet-quick-toast ${toast.isCrit ? 'crit' : ''} ${toast.isFumble ? 'fumble' : ''}`}
      role="status"
      aria-live="polite"
      id="sheet-quick-toast"
    >
      <div className="toast-inner-row">
        <span className="toast-icon">
          {toast.isCrit ? '🌟 KRİTİK BAŞARI!' : toast.isFumble ? '💀 DOĞAL 1!' : '🎲 ZAR SONUCU'}
        </span>
        {toast.label && <span className="toast-label-chip">{toast.label}</span>}
        <div className="toast-breakdown">
          {toast.d20 !== undefined && (
            <span className="toast-die-roll">
              d20: <strong>{toast.d20}</strong>
            </span>
          )}
          {toast.mod !== undefined && (
            <span className="toast-mod-span">
              {toast.mod >= 0 ? `+ ${toast.mod}` : `- ${Math.abs(toast.mod)}`}
            </span>
          )}
          {toast.total !== undefined && (
            <>
              <span className="toast-equals">=</span>
              <span className="toast-total-badge">{toast.total}</span>
            </>
          )}
          {toast.d20 === undefined && toast.total === undefined && (
            <span className="toast-simple-text">{toast.text}</span>
          )}
        </div>
        <button className="toast-dismiss" onClick={onDismiss} aria-label="Kapat">
          ✕
        </button>
      </div>
    </div>
  );
};

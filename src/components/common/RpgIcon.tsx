import React, { useState } from 'react';
import { resolveIconTheme, getGameIconSvgUrl } from '../../rules/iconThemes';

interface RpgIconProps {
  category: 'spell' | 'item' | 'action';
  schoolOrType: string;
  slug?: string;
  size?: number;
  glow?: boolean;
  className?: string;
  alt?: string;
}

export const RpgIcon: React.FC<RpgIconProps> = ({
  category,
  schoolOrType,
  slug,
  size = 36,
  glow = true,
  className = '',
  alt
}) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const theme = resolveIconTheme(category, schoolOrType, slug);
  const iconUrl = getGameIconSvgUrl(theme.iconName, theme.iconColor);

  return (
    <div
      className={`rpg-icon-badge ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '6px',
        background: theme.bgGradient,
        border: `1px solid ${theme.borderColor}`,
        boxShadow: glow ? `0 0 10px ${theme.glowColor}` : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease-in-out'
      }}
      title={alt || `${category}: ${schoolOrType}`}
    >
      {!loadFailed ? (
        <img
          src={iconUrl}
          alt={alt || theme.iconName}
          onError={() => setLoadFailed(true)}
          style={{
            width: `${Math.round(size * 0.72)}px`,
            height: `${Math.round(size * 0.72)}px`,
            objectFit: 'contain',
            filter: glow ? `drop-shadow(0 0 4px ${theme.glowColor})` : 'none',
            display: 'block'
          }}
          loading="lazy"
        />
      ) : (
        // Offline / Fallback Vektör
        <span
          style={{
            fontSize: `${Math.round(size * 0.45)}px`,
            color: theme.iconColor,
            fontWeight: 800
          }}
        >
          {category === 'spell' ? '✨' : category === 'item' ? '⚔️' : '⚡'}
        </span>
      )}
    </div>
  );
};

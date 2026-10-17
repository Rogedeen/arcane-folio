import { describe, it, expect } from 'vitest';
import { resolveIconTheme, getGameIconSvgUrl, SPELL_SCHOOL_THEMES, ITEM_TYPE_THEMES } from '../../src/rules/iconThemes';

describe('Game-Icons.net Otomatik İkon & Tema Motoru', () => {
  it('Evocation büyüsü için turuncu/altın rengi ve fire-ball default ikonu atamalıdır', () => {
    const theme = resolveIconTheme('spell', 'Evocation');
    expect(theme.iconColor).toBe(SPELL_SCHOOL_THEMES.evocation.iconColor);
    expect(theme.iconName).toBe('fire-ball');
    expect(theme.bgGradient).toContain('radial-gradient');
  });

  it('Abjuration okulu için mavi kalkan teması atamalıdır', () => {
    const theme = resolveIconTheme('spell', 'Abjuration');
    expect(theme.iconColor).toBe(SPELL_SCHOOL_THEMES.abjuration.iconColor);
    expect(theme.iconName).toBe('shield-reflect');
  });

  it('Özel slug (cure-wounds) verildiğinde otomatik healing ikonunu seçmelidir', () => {
    const theme = resolveIconTheme('spell', 'Evocation', 'cure-wounds');
    expect(theme.iconName).toBe('healing');
  });

  it('Eşya tipi weapon için çelik/altın teması ve broadsword default ikonu atamalıdır', () => {
    const theme = resolveIconTheme('item', 'weapon');
    expect(theme.iconColor).toBe(ITEM_TYPE_THEMES.weapon.iconColor);
    expect(theme.iconName).toBe('broadsword');
  });

  it('Eşya tipi potion için kırmızı iksir teması atamalıdır', () => {
    const theme = resolveIconTheme('item', 'potion', 'potion-of-healing');
    expect(theme.iconColor).toBe(ITEM_TYPE_THEMES.potion.iconColor);
    expect(theme.iconName).toBe('health-potion');
  });

  it('Iconify SVG CDN URL formülünü renk parametresiyle doğru üretmelidir', () => {
    const url = getGameIconSvgUrl('fire-ball', '#f59e0b');
    expect(url).toBe('https://api.iconify.design/game-icons:fire-ball.svg?color=%23f59e0b');
  });
});

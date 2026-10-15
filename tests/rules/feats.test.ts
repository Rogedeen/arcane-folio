import { describe, it, expect } from 'vitest';
import { FEATS, getFeatById } from '../../src/rules/feats';

describe('Feats (Hünerler) Kural Motoru', () => {
  it('tüm popüler 2014 PHB featlerini tanımlar', () => {
    expect(FEATS.length).toBeGreaterThanOrEqual(10);
  });

  it('Great Weapon Master hünerini doğru parametrelerle döner', () => {
    const feat = getFeatById('great-weapon-master');
    expect(feat).toBeDefined();
    expect(feat?.name).toBe('Great Weapon Master');
    expect(feat?.features.some((f) => f.includes('-5'))).toBe(true);
  });

  it('War Caster konsantrasyon ve reaksiyon büyüsü özelliklerine sahiptir', () => {
    const feat = getFeatById('war-caster');
    expect(feat).toBeDefined();
    expect(feat?.features.some((f) => f.includes('konsantrasyon'))).toBe(true);
  });

  it('Alert hüneri inisiyatife +5 bonus verir', () => {
    const feat = getFeatById('alert');
    expect(feat).toBeDefined();
    expect(feat?.features.some((f) => f.includes('+5'))).toBe(true);
  });
});

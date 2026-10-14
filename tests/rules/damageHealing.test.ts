import { describe, it, expect } from 'vitest';
import { applyDamage, applyHealing, applyTempHp } from '../../src/rules/damageHealing';

describe('Hasar ve İyileşme Kuralları [SRD 5.1 sf. 77 Temporary Hit Points and Damage]', () => {
  it('Hasar önce Geçici Can (Temp HP)\'dan düşmeli [SRD 5.1 sf. 77]', () => {
    // 10 Temp HP, 25 Normal HP, 6 Hasar => 4 Temp HP, 25 Normal HP
    const res = applyDamage(25, 10, 6);
    expect(res.tempHp).toBe(4);
    expect(res.currentHp).toBe(25);
  });

  it('Temp HP\'yi aşan hasar Normal HP\'den düşmeli [SRD 5.1 sf. 77]', () => {
    // 10 Temp HP, 25 Normal HP, 15 Hasar => 0 Temp HP, 20 Normal HP
    const res = applyDamage(25, 10, 15);
    expect(res.tempHp).toBe(0);
    expect(res.currentHp).toBe(20);
  });

  it('Hasar Can Puanını 0\'ın altına düşüremez [SRD 5.1 sf. 75]', () => {
    const res = applyDamage(10, 0, 50);
    expect(res.currentHp).toBe(0);
  });

  it('İyileşme Maksimum Can Puanı (Max HP)\'yi aşamaz [SRD 5.1 sf. 75]', () => {
    // 18 HP, 20 Max HP, +10 İyileşme => 20 HP
    const healed = applyHealing(18, 20, 10);
    expect(healed).toBe(20);
  });

  it('Geçici canlar birikmez (stack etmez), yalnızca en yüksek olan kalır [SRD 5.1 sf. 77]', () => {
    expect(applyTempHp(5, 8)).toBe(8);
    expect(applyTempHp(8, 5)).toBe(8);
  });
});

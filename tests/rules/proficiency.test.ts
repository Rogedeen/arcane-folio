import { describe, it, expect } from 'vitest';
import { calculateProficiencyBonus } from '../../src/rules/proficiency';

describe('Ustalık Bonusu Seviye 1–20 Tablosu [SRD 5.1 sf. 15 Proficiency Bonus]', () => {
  it('Seviye 1–4 aralığında ustalık bonusu +2 olmalı [SRD 5.1 sf. 15]', () => {
    expect(calculateProficiencyBonus(1)).toBe(2);
    expect(calculateProficiencyBonus(2)).toBe(2);
    expect(calculateProficiencyBonus(3)).toBe(2);
    expect(calculateProficiencyBonus(4)).toBe(2);
  });

  it('Seviye 5–8 aralığında ustalık bonusu +3 olmalı [SRD 5.1 sf. 15]', () => {
    expect(calculateProficiencyBonus(5)).toBe(3);
    expect(calculateProficiencyBonus(6)).toBe(3);
    expect(calculateProficiencyBonus(7)).toBe(3);
    expect(calculateProficiencyBonus(8)).toBe(3);
  });

  it('Seviye 9–12 aralığında ustalık bonusu +4 olmalı [SRD 5.1 sf. 15]', () => {
    expect(calculateProficiencyBonus(9)).toBe(4);
    expect(calculateProficiencyBonus(10)).toBe(4);
    expect(calculateProficiencyBonus(11)).toBe(4);
    expect(calculateProficiencyBonus(12)).toBe(4);
  });

  it('Seviye 13–16 aralığında ustalık bonusu +5 olmalı [SRD 5.1 sf. 15]', () => {
    expect(calculateProficiencyBonus(13)).toBe(5);
    expect(calculateProficiencyBonus(14)).toBe(5);
    expect(calculateProficiencyBonus(15)).toBe(5);
    expect(calculateProficiencyBonus(16)).toBe(5);
  });

  it('Seviye 17–20 aralığında ustalık bonusu +6 olmalı [SRD 5.1 sf. 15]', () => {
    expect(calculateProficiencyBonus(17)).toBe(6);
    expect(calculateProficiencyBonus(18)).toBe(6);
    expect(calculateProficiencyBonus(19)).toBe(6);
    expect(calculateProficiencyBonus(20)).toBe(6);
  });

  it('Sınır dışı seviyelerde (level < 1) minimum 2 döndürmeli [SRD 5.1 sf. 15]', () => {
    expect(calculateProficiencyBonus(0)).toBe(2);
    expect(calculateProficiencyBonus(-1)).toBe(2);
  });
});

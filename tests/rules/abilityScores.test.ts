import { describe, it, expect } from 'vitest';
import { calculateModifier } from '../../src/rules/abilityScores';

describe('Yetenek Skoru Modifikatör Hesapları [SRD 5.1 sf. 76 Ability Scores and Modifiers]', () => {
  it('Skor 10 ve 11 için modifikatör 0 olmalı [SRD 5.1 sf. 76]', () => {
    expect(calculateModifier(10)).toBe(0);
    expect(calculateModifier(11)).toBe(0);
  });

  it('Pozitif skorlar için modifikatörler doğru hesaplanmalı [SRD 5.1 sf. 76]', () => {
    expect(calculateModifier(12)).toBe(1);
    expect(calculateModifier(13)).toBe(1);
    expect(calculateModifier(14)).toBe(2);
    expect(calculateModifier(15)).toBe(2);
    expect(calculateModifier(16)).toBe(3);
    expect(calculateModifier(18)).toBe(4);
    expect(calculateModifier(20)).toBe(5);
  });

  it('Negatif skorlar için modifikatörler doğru hesaplanmalı [SRD 5.1 sf. 76]', () => {
    expect(calculateModifier(9)).toBe(-1);
    expect(calculateModifier(8)).toBe(-1);
    expect(calculateModifier(7)).toBe(-2);
    expect(calculateModifier(6)).toBe(-2);
    expect(calculateModifier(5)).toBe(-3);
    expect(calculateModifier(4)).toBe(-3);
    expect(calculateModifier(3)).toBe(-4);
    expect(calculateModifier(2)).toBe(-4);
  });

  it('Sınır durumları: Skor 1 minimum (-5) ve Skor 30 maksimum (+10) [SRD 5.1 sf. 76]', () => {
    expect(calculateModifier(1)).toBe(-5);
    expect(calculateModifier(30)).toBe(10);
  });
});

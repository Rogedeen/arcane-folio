import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { FloatingDice } from '../../src/components/FloatingDice';
import { CharacterProvider } from '../../src/context/CharacterContext';

describe('FloatingDice (FAB) Bileşen Testleri', () => {
  it('Yüzen zar butonunu (FAB) başarıyla ekrana basar', () => {
    render(
      <CharacterProvider>
        <FloatingDice />
      </CharacterProvider>
    );

    const fabBtn = document.getElementById('btn-floating-dice');
    expect(fabBtn).toBeInTheDocument();
  });

  it('FAB tıklandığında hızlı zar menüsü açılır ve d20 seçilidir', () => {
    render(
      <CharacterProvider>
        <FloatingDice />
      </CharacterProvider>
    );

    const fabBtn = document.getElementById('btn-floating-dice');
    fireEvent.click(fabBtn!);

    const popup = document.getElementById('floating-dice-popup');
    expect(popup).toBeInTheDocument();

    const d20Btn = document.getElementById('btn-quick-die-d20');
    expect(d20Btn).toHaveClass('active');

    // Avantaj ve dezavantaj butonları görünür
    expect(document.getElementById('btn-mode-advantage')).toBeInTheDocument();
    expect(document.getElementById('btn-mode-disadvantage')).toBeInTheDocument();
  });

  it('Modifikatör artırılabilir ve zar atılabilir', async () => {
    vi.useFakeTimers();

    render(
      <CharacterProvider>
        <FloatingDice />
      </CharacterProvider>
    );

    // Menüyü aç
    fireEvent.click(document.getElementById('btn-floating-dice')!);

    // Modifikatörü +2 yap
    const incBtn = document.getElementById('btn-quick-mod-inc')!;
    fireEvent.click(incBtn);
    fireEvent.click(incBtn);

    const modDisplay = document.getElementById('display-quick-mod');
    expect(modDisplay?.textContent).toBe('+2');

    // Zar at
    const rollBtn = document.getElementById('btn-quick-roll-action')!;
    fireEvent.click(rollBtn);

    // Animasyon süresini ilerlet
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const resultBox = document.getElementById('floating-roll-result');
    expect(resultBox).toBeInTheDocument();

    vi.useRealTimers();
  });
});

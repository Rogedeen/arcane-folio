import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConditionsTracker } from '../../src/components/ConditionsTracker';
import { LevelUpModal } from '../../src/components/LevelUpModal';

describe('ConditionsTracker Component', () => {
  it('renders condition buttons and allows toggling an active condition', () => {
    render(<ConditionsTracker />);
    const poisonedBtn = screen.getByRole('button', { name: /Zehirlenmiş durumunu aç\/kapat/i });
    expect(poisonedBtn).toBeInTheDocument();
    expect(poisonedBtn.className).not.toContain('active');

    fireEvent.click(poisonedBtn);
    expect(poisonedBtn.className).toContain('active');
  });

  it('displays movement blocked alert when a speed-0 condition (e.g. Paralyzed) is active', () => {
    render(<ConditionsTracker />);
    const paralyzedBtn = screen.getByRole('button', { name: /Felçli durumunu aç\/kapat/i });
    fireEvent.click(paralyzedBtn);

    expect(screen.getByText(/Hareket Hızı 0/i)).toBeInTheDocument();
  });
});

describe('LevelUpModal Component', () => {
  it('renders initial level and opens modal on click', () => {
    render(
      <LevelUpModal
        initialLevel={2}
        charClass="fighter"
        initialMaxHp={20}
        conModifier={2}
      />
    );

    const openBtn = screen.getByRole('button', { name: /Seviye Atla Modalı Aç/i });
    expect(openBtn).toBeInTheDocument();
    expect(openBtn.textContent).toContain('3. Seviye');

    fireEvent.click(openBtn);
    expect(screen.getByText(/Seviye 3 Atlama/i)).toBeInTheDocument();
    expect(screen.getByText(/Şampiyon/i)).toBeInTheDocument(); // Fighter Level 3 subclass unlock!
  });

  it('completes level up and updates character max HP and level', () => {
    render(
      <LevelUpModal
        initialLevel={2}
        charClass="fighter"
        initialMaxHp={20}
        conModifier={2}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Seviye Atla Modalı Aç/i }));
    const confirmBtn = screen.getByRole('button', { name: /Seviye Atlamayı Onayla/i });
    fireEvent.click(confirmBtn);

    // Modal closed, main card updated to level 3
    expect(screen.getByText(/Mevcut Seviye:/i)).toHaveTextContent('3');
    expect(screen.getByText(/Maksimum Can:/i)).toHaveTextContent('28 HP');
  });
});

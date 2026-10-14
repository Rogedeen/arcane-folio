import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModernCharacterSheet } from '../../src/components/ModernCharacterSheet';
import { DeathSaves } from '../../src/components/DeathSaves';
import { processDeathSaveRoll, INITIAL_DEATH_SAVES } from '../../src/rules/deathSaves';

describe('Modern Karakter Kağıdı ve Ölüm Kurtarma Zarları (Death Saves) Testleri', () => {
  it('Ölüm kurtarma zarı 20 geldiğinde karakter 1 HP ile ayağa kalkmalı', () => {
    const result = processDeathSaveRoll(20, INITIAL_DEATH_SAVES);
    expect(result.regainedHp).toBe(1);
    expect(result.isStable).toBe(true);
    expect(result.isDead).toBe(false);
  });

  it('Ölüm kurtarma zarı 1 geldiğinde 2 başarısızlık hanesi dolmalı', () => {
    const result = processDeathSaveRoll(1, INITIAL_DEATH_SAVES);
    expect(result.failures).toBe(2);
    expect(result.isDead).toBe(false);
  });

  it('DeathSaves bileşeni 3 başarı ve 3 başarısızlık pipini render eder', () => {
    render(<DeathSaves currentHp={0} />);

    expect(screen.getByText(/Death Saves/i)).toBeInTheDocument();
    expect(document.getElementById('btn-roll-death-save')).toBeInTheDocument();
    expect(document.getElementById('btn-reset-death-saves')).toBeInTheDocument();
    expect(document.getElementById('pip-death-success-1')).toBeInTheDocument();
    expect(document.getElementById('pip-death-failure-1')).toBeInTheDocument();
  });

  it('Karakter Kağıdı stat kilitleme butonu durum değiştirir', () => {
    render(<ModernCharacterSheet />);
    
    const lockBtn = document.getElementById('btn-toggle-stat-lock');
    expect(lockBtn).toBeInTheDocument();
    expect(lockBtn?.textContent).toContain('Kilitli');

    fireEvent.click(lockBtn!);
    expect(lockBtn?.textContent).toContain('Duzenle');
  });

  it('Sekmeler arası geçiş (Büyüler, Eşyalar, Durumlar) çalışır', async () => {
    render(<ModernCharacterSheet />);
    
    const tabSpells = document.getElementById('tab-btn-spells');
    expect(tabSpells).toBeInTheDocument();
    fireEvent.click(tabSpells!);

    await waitFor(() => {
      expect(document.getElementById('spellbook-container')).toBeInTheDocument();
    });

    const tabInventory = document.getElementById('tab-btn-inventory');
    expect(tabInventory).toBeInTheDocument();
    fireEvent.click(tabInventory!);

    await waitFor(() => {
      expect(document.getElementById('inventory-manager-container')).toBeInTheDocument();
    });
  });
});

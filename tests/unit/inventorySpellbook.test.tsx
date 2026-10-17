import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryManager } from '../../src/components/InventoryManager';
import { Spellbook } from '../../src/components/Spellbook';

describe('InventoryManager Component', () => {
  it('renders carrying capacity correctly for STR 14 (210 lbs)', () => {
    render(<InventoryManager strScore={14} />);
    expect(screen.getByText(/210 lbs/i)).toBeInTheDocument();
  });

  it('allows toggling equip state of weapon or armor', () => {
    render(<InventoryManager strScore={14} />);
    const equipBtn = screen.getByRole('button', { name: /Longsword kuşan\/çıkar/i });
    expect(equipBtn).toBeInTheDocument();
    const before = equipBtn.textContent;

    fireEvent.click(equipBtn);
    expect(equipBtn.textContent).not.toBe(before);
  });

  it('allows filtering by item category', () => {
    render(<InventoryManager strScore={14} />);
    const potionFilter = screen.getByRole('button', { name: /potion Filtrele/i });
    fireEvent.click(potionFilter);

    expect(screen.getByText('Potion of Healing')).toBeInTheDocument();
    expect(screen.queryByText('Plate Armor')).not.toBeInTheDocument();
  });
});

describe('Spellbook Component', () => {
  it('renders max prepared spell limit for Level 5 with INT Mod +4 (9 spells)', () => {
    render(<Spellbook level={5} castingModifier={4} />);
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('filters spells by search query', async () => {
    render(<Spellbook level={5} castingModifier={4} />);
    const searchInput = screen.getByPlaceholderText(/Büyü ara/i);
    fireEvent.change(searchInput, { target: { value: 'Fireball' } });

    expect(await screen.findByText('Fireball')).toBeInTheDocument();
    expect(screen.queryByText('Cure Wounds')).not.toBeInTheDocument();
  });

  it('toggles spell preparation status', () => {
    render(<Spellbook level={5} castingModifier={4} />);
    const prepBtn = screen.getByRole('button', { name: /Magic Missile hazırla/i });
    expect(prepBtn).toBeInTheDocument();
    const before = prepBtn.textContent;

    fireEvent.click(prepBtn);
    expect(prepBtn.textContent).not.toBe(before);
  });

  it('restricts tabs and visible spells to max legal spell level for Eldritch Knight 3', () => {
    // Level 3 Eldritch Knight can ONLY cast 1st level spells
    render(<Spellbook level={3} castingModifier={2} charClass="fighter" subclass="eldritch-knight" />);

    // Tabs 0 and 1 should exist, but tab 2 or 3 must NOT exist
    expect(screen.getByRole('button', { name: /Cantripler/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1\. Seviye Büyüler/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /2\. Seviye Büyüler/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /3\. Seviye Büyüler/i })).not.toBeInTheDocument();

    // Fireball is 3rd level, so it must not be visible
    expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
  });

  it('filters spells by the prepared tab', () => {
    render(<Spellbook level={5} castingModifier={4} charClass="wizard" />);

    // First prepare a spell (e.g. Magic Missile)
    const prepBtn = screen.getByRole('button', { name: /Magic Missile hazırla/i });
    fireEvent.click(prepBtn);
    expect(prepBtn.textContent).toContain('✓ Hazırlandı');

    // Switch to Prepared tab
    const preparedTab = screen.getByRole('button', { name: /Sadece Hazırlanan Büyüler/i });
    fireEvent.click(preparedTab);

    // Verify prepared cards are shown and they are marked as prepared
    const prepButtons = document.querySelectorAll<HTMLButtonElement>('[id^="btn-prepare-"]');
    expect(prepButtons.length).toBeGreaterThan(0);
    prepButtons.forEach((btn) => {
      expect(btn.textContent).toContain('✓ Hazırlandı');
    });
  });
});


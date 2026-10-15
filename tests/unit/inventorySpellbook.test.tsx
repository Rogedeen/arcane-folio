import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryManager } from '../../src/components/InventoryManager';
import { Spellbook } from '../../src/components/Spellbook';

describe('InventoryManager Component', () => {
  it('renders carrying capacity correctly for STR 14 (210 lbs)', () => {
    render(<InventoryManager strScore={14} />);
    expect(screen.getByText('210')).toBeInTheDocument();
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
});

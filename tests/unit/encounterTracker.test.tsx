import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EncounterTracker } from '../../src/components/EncounterTracker';
import type { PartyMember } from '../../src/types/campaign';

const MOCK_PARTY: PartyMember[] = [
  {
    id: 'char-1',
    name: 'Kaelen Karaçekiç',
    charClass: 'Savaşçı (Fighter)',
    level: 3,
    currentHp: 28,
    maxHp: 28,
    tempHp: 0,
    ac: 16,
    passivePerception: 11,
    passiveInvestigation: 10,
    stats: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 },
    activeConditions: [],
    playerName: 'Ahmet'
  }
];

describe('EncounterTracker (DM Karşılaşma & İnisiyatif Takipçisi)', () => {
  it('boş karşılaşma durumunu ve canavar kataloğunu render eder', () => {
    render(<EncounterTracker partyMembers={MOCK_PARTY} />);
    expect(screen.getByText(/DM Karşılaşma & İnisiyatif Takipçisi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Partiyi Masaya Çek/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Canavar Kataloğu/i })).toBeInTheDocument();
  });

  it('partiyi masaya çekme butonu partideki oyuncuyu ekler', () => {
    render(<EncounterTracker partyMembers={MOCK_PARTY} />);
    const pullBtn = screen.getByRole('button', { name: /Partiyi Masaya Çek/i });
    fireEvent.click(pullBtn);

    expect(screen.getAllByText('Kaelen Karaçekiç').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Oyuncu')).toBeInTheDocument();
  });

  it('canavar ekleme butonu karşılaşmaya canavar ekler', async () => {
    render(<EncounterTracker partyMembers={MOCK_PARTY} />);
    
    // Canavar ara ve ekle (Goblin)
    const searchInput = screen.getByPlaceholderText(/canavar ara/i);
    fireEvent.change(searchInput, { target: { value: 'Goblin' } });

    const addBtns = await screen.findAllByRole('button', { name: /\+ Ekle/i });
    fireEvent.click(addBtns[0]);

    await waitFor(() => {
      const goblinElements = screen.getAllByText('Goblin');
      expect(goblinElements.length).toBeGreaterThanOrEqual(2); // Biri katalogda, biri inisiyatif listesinde
    });
  });

  it('tüm inisiyatifleri at butonu dövüşü başlatır ve sırayı belirler', async () => {
    render(<EncounterTracker partyMembers={MOCK_PARTY} />);
    
    // Partiyi ve bir canavarı ekle
    fireEvent.click(screen.getByRole('button', { name: /Partiyi Masaya Çek/i }));
    const addBtns = screen.getAllByRole('button', { name: /\+ Ekle/i });
    fireEvent.click(addBtns[0]);

    const rollBtn = screen.getByRole('button', { name: /Tüm İnisiyatifleri At & Başlat/i });
    fireEvent.click(rollBtn);

    await waitFor(() => {
      expect(screen.getByText(/AKTİF DÖVÜŞ \(TUR 1\)/i)).toBeInTheDocument();
      expect(screen.getByText('SIRA SENDE')).toBeInTheDocument();
    });
  });
});

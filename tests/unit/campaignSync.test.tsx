import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignView } from '../../src/components/CampaignView';
import { DmDashboard } from '../../src/components/DmDashboard';
import { PartyMember } from '../../src/types/campaign';

describe('CampaignView Component', () => {
  it('renders campaign title, default invite code, and live sync indicator', () => {
    render(<CampaignView />);
    expect(screen.getByText(/Ejderha Mızrağı Seferi/i)).toBeInTheDocument();
    expect(screen.getByText('DRG924')).toBeInTheDocument();
    expect(screen.getByText(/Canlı Senkronize/i)).toBeInTheDocument();
  });

  it('switches between DM and Player mode', () => {
    render(<CampaignView />);
    const playerBtn = screen.getByRole('button', { name: /Oyuncu Moduna Geç/i });
    fireEvent.click(playerBtn);

    expect(screen.getByText(/Oyuncu Modu \(Salt-Okunur\)/i)).toBeInTheDocument();

    const dmBtn = screen.getByRole('button', { name: /DM Moduna Geç/i });
    fireEvent.click(dmBtn);
    expect(screen.getByText(/DM Modu \(Yetkili\)/i)).toBeInTheDocument();
  });

  it('validates join campaign code input', () => {
    render(<CampaignView />);
    const input = screen.getByLabelText(/Katılma Davet Kodu/i);
    const joinBtn = screen.getByRole('button', { name: /Kampanyaya Katıl/i });

    // Invalid code (too short)
    fireEvent.change(input, { target: { value: 'AB' } });
    fireEvent.click(joinBtn);
    expect(screen.getByText(/Geçersiz davet kodu/i)).toBeInTheDocument();

    // Valid code
    fireEvent.change(input, { target: { value: 'NEW999' } });
    fireEvent.click(joinBtn);
    expect(screen.queryByText(/Geçersiz davet kodu/i)).not.toBeInTheDocument();
    expect(screen.getByText('NEW999')).toBeInTheDocument();
  });
});

describe('DmDashboard Component', () => {
  const mockMembers: PartyMember[] = [
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

  it('shows DM action buttons in DM mode and applies damage', () => {
    let updatedMembers: PartyMember[] = [];
    render(
      <DmDashboard
        members={mockMembers}
        userRole="dm"
        onUpdateMembers={(next) => {
          updatedMembers = next;
        }}
      />
    );

    const damageBtn = screen.getByRole('button', { name: /Kaelen Karaçekiç 5 hasar ver/i });
    expect(damageBtn).toBeInTheDocument();

    fireEvent.click(damageBtn);
    expect(updatedMembers[0].currentHp).toBe(23); // 28 - 5 = 23
  });

  it('hides DM action buttons in Player mode', () => {
    render(
      <DmDashboard
        members={mockMembers}
        userRole="player"
        onUpdateMembers={() => {}}
      />
    );

    expect(screen.queryByRole('button', { name: /5 hasar ver/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Oyuncu Modu \(Salt-Okunur\)/i)).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferenceDrawer } from '../../src/components/ReferenceDrawer';
import { ReferenceProvider, useReference } from '../../src/context/ReferenceContext';
import type { SpellData, ItemData } from '../../src/types/content';

const mockSpell: SpellData = {
  slug: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  castingTime: '1 action',
  range: '150 feet',
  components: 'V, S, M',
  duration: 'Instantaneous',
  description: 'A bright streak flashes from your pointing finger to a point you choose...',
  classes: ['Sorcerer', 'Wizard'],
  source: 'SRD 5.1',
  source_ref: 'PHB p.241',
  license: 'CC-BY-4.0',
};

const mockItem: ItemData = {
  slug: 'longsword',
  name: 'Longsword',
  type: 'weapon',
  cost: '15 gp',
  weight: 3,
  description: 'A versatile bladed martial weapon.',
  properties: ['Versatile (1d10)'],
  quantity: 1,
  source: 'SRD 5.1',
  source_ref: 'PHB p.149',
  license: 'CC-BY-4.0',
};

function TestWrapper({ itemToOpen }: { itemToOpen: any }) {
  const { openReference } = useReference();
  return (
    <div>
      <button id="btn-trigger-open" onClick={() => openReference(itemToOpen)}>
        Aç
      </button>
      <ReferenceDrawer />
    </div>
  );
}

describe('ReferenceDrawer Bileşen Testleri', () => {
  it('Kapalıyken ekranda drawer paneli bulunmaz', () => {
    render(
      <ReferenceProvider>
        <ReferenceDrawer />
      </ReferenceProvider>
    );
    expect(document.getElementById('ref-drawer-panel')).not.toBeInTheDocument();
  });

  it('Büyü açıldığında başlık, seviye, okul ve açıklama detaylarını görüntüler', () => {
    render(
      <ReferenceProvider>
        <TestWrapper itemToOpen={{ type: 'spell', data: mockSpell }} />
      </ReferenceProvider>
    );

    fireEvent.click(document.getElementById('btn-trigger-open')!);

    const panel = document.getElementById('ref-drawer-panel');
    expect(panel).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /Fireball/i })).toBeInTheDocument();
    expect(screen.getByText(/3. Seviye Evocation/i)).toBeInTheDocument();
    expect(screen.getByText(/150 feet/i)).toBeInTheDocument();
    expect(screen.getByText(/A bright streak flashes/i)).toBeInTheDocument();
  });

  it('Eşya açıldığında tür, fiyat ve özellikleri görüntüler', () => {
    render(
      <ReferenceProvider>
        <TestWrapper itemToOpen={{ type: 'item', data: mockItem }} />
      </ReferenceProvider>
    );

    fireEvent.click(document.getElementById('btn-trigger-open')!);

    expect(screen.getByRole('heading', { name: /Longsword/i })).toBeInTheDocument();
    expect(screen.getByText(/15 gp/i)).toBeInTheDocument();
    expect(screen.getByText(/Versatile \(1d10\)/i)).toBeInTheDocument();
  });

  it('Kapatma butonuna basıldığında panel kapanır', () => {
    render(
      <ReferenceProvider>
        <TestWrapper itemToOpen={{ type: 'spell', data: mockSpell }} />
      </ReferenceProvider>
    );

    // Paneli aç
    fireEvent.click(document.getElementById('btn-trigger-open')!);
    expect(document.getElementById('ref-drawer-panel')).toBeInTheDocument();

    // Kapat
    const closeBtn = document.getElementById('btn-close-ref-drawer')!;
    fireEvent.click(closeBtn);

    expect(document.getElementById('ref-drawer-panel')).not.toBeInTheDocument();
  });
});

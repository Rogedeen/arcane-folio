import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResourceTracker } from '../../src/components/ResourceTracker';

describe('Kaynak Takibi (ResourceTracker) Bileşen Testleri', () => {
  it('Can Puanı (Current / Max) ve Büyü Slotlarını doğru görüntüler', () => {
    render(<ResourceTracker charClass="wizard" level={5} maxHp={32} conModifier={2} />);
    
    const currentHpEl = document.getElementById('display-current-hp');
    const maxHpEl = document.getElementById('display-max-hp');
    expect(currentHpEl?.textContent).toBe('32');
    expect(maxHpEl?.textContent).toBe('32');
    expect(screen.getByText(/✨ Büyü Slotları/i)).toBeInTheDocument();

    // 5. Seviye Wizard: 1., 2. ve 3. Seviye slotlar olmalı
    expect(screen.getByText('1. Seviye')).toBeInTheDocument();
    expect(screen.getByText('2. Seviye')).toBeInTheDocument();
    expect(screen.getByText('3. Seviye')).toBeInTheDocument();
  });

  it('Geçici can eklendiğinde badge görünür, hasar alındığında önce geçici can düşer', () => {
    render(<ResourceTracker charClass="wizard" level={5} maxHp={32} conModifier={2} />);
    
    // Miktar inputunu 10 yap
    const amountInput = screen.getByLabelText(/Miktar:/i);
    fireEvent.change(amountInput, { target: { value: '10' } });

    // Temp HP ekle
    const addTempBtn = screen.getByRole('button', { name: /Geçici Can Ekle/i });
    fireEvent.click(addTempBtn);

    expect(screen.getByText(/🛡️ \+10 Geçici Can/i)).toBeInTheDocument();

    // 15 hasar al: 10 Temp HP silinir, normal HP 32 - 5 = 27 olur
    fireEvent.change(amountInput, { target: { value: '15' } });
    const damageBtn = screen.getByRole('button', { name: /Hasar Al/i });
    fireEvent.click(damageBtn);

    const currentHpEl = document.getElementById('display-current-hp');
    expect(currentHpEl?.textContent).toBe('27');
    expect(screen.queryByText(/🛡️ \+10 Geçici Can/i)).not.toBeInTheDocument();
  });

  it('Büyü slotuna tıklandığında harcanır, Uzun Dinlenme (Long Rest) ile tüm slotlar ve can yenilenir', () => {
    render(<ResourceTracker charClass="wizard" level={5} maxHp={32} conModifier={2} />);
    
    // 1. Seviye ilk slota tıkla (harca)
    const slotPip = document.getElementById('pip-tier-1-0');
    expect(slotPip).toHaveClass('available');
    fireEvent.click(slotPip!);
    expect(slotPip).toHaveClass('expended');

    // Uzun dinlenme yap
    const longRestBtn = screen.getByRole('button', { name: /Uzun Dinlenme Yap/i });
    fireEvent.click(longRestBtn);

    // Slot tekrar hazır olmalı ve can tam 32 olmalı
    expect(slotPip).toHaveClass('available');
    const currentHpEl = document.getElementById('display-current-hp');
    expect(currentHpEl?.textContent).toBe('32');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCreator } from '../../src/components/CharacterCreator';

describe('Karakter Oluşturucu (CharacterCreator) Bileşen Testleri', () => {
  it('Varsayılan karakter ve türetilmiş istatistikleri görüntüler', () => {
    render(<CharacterCreator />);
    expect(screen.getByDisplayValue(/Kaelen Karaçekiç/i)).toBeInTheDocument();
    expect(screen.getByText(/Karakter Çekirdeği \(Faz 1\)/i)).toBeInTheDocument();

    const profPill = document.getElementById('val-proficiency');
    expect(profPill?.textContent).toContain('+2');
  });

  it('Seviye artırıldığında (Seviye 5) Ustalık Bonusu +3 olmalı', () => {
    render(<CharacterCreator />);
    const levelUpBtn = screen.getByRole('button', { name: /Seviye Artır/i });
    
    // Seviye 1'den 5'e yükselt (4 kez tıkla)
    fireEvent.click(levelUpBtn);
    fireEvent.click(levelUpBtn);
    fireEvent.click(levelUpBtn);
    fireEvent.click(levelUpBtn);

    const levelDisplay = document.getElementById('display-level');
    expect(levelDisplay?.textContent).toBe('5');

    const profPill = document.getElementById('val-proficiency');
    expect(profPill?.textContent).toContain('+3');
  });

  it('Kalkan kuşanıldığında Zırh Sınıfı (AC) 2 artmalı', () => {
    render(<CharacterCreator />);
    const valAc = document.getElementById('val-ac');
    const initialAc = Number(valAc?.textContent);

    const shieldCheckbox = screen.getByRole('checkbox', { name: /Kalkan \(\+2 AC\)/i });
    fireEvent.click(shieldCheckbox);

    expect(Number(valAc?.textContent)).toBe(initialAc + 2);
  });

  it('Yetenek skoru artırıldığında modifikatör güncellenmeli', () => {
    render(<CharacterCreator />);
    const incStrBtn = screen.getByRole('button', { name: /str artır/i });
    fireEvent.click(incStrBtn); // 15'ten 16'ya (Human +1 bonusuyla toplam 17 olur, mod +3)

    const strModTag = document.getElementById('mod-str');
    expect(strModTag?.textContent).toContain('+3');
  });
});

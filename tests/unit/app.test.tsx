import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';
import { createDatabaseClient } from '../../src/data/supabaseClient';

describe('Uygulama Temel İskelet Birim Testleri', () => {
  it('Başlık ve Faz bileşenini ekrana basar', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /D&D 5e Takip/i })).toBeInTheDocument();
    
    const heroTitle = document.getElementById('hero-title');
    expect(heroTitle?.textContent).toContain('Faz 2');

    await waitFor(() => {
      expect(screen.getByText(/Yerel geliştirme modu/i)).toBeInTheDocument();
    });
  });

  it('D20 zarı atıldığında sonuç tepsisinde görüntülenir', async () => {
    render(<App />);
    const rollButton = document.getElementById('btn-roll-d20');
    expect(rollButton).toBeInTheDocument();

    fireEvent.click(rollButton!);
    await waitFor(() => {
      const activeStage = document.getElementById('active-dice-stage');
      expect(activeStage).toBeInTheDocument();
    });
  });

  it('Veri katmanı istemcisi sağlıklı durum döndürür', async () => {
    const client = createDatabaseClient();
    const status = await client.getHealthStatus();
    expect(status.ok).toBe(true);
    expect(status.message).toBeDefined();
  });

  it('PWA durum göstergesi ekranda yer alır', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/PWA Hazır/i)).toBeInTheDocument();
    });
  });
});

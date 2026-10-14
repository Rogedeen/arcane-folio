import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';
import { createDatabaseClient } from '../../src/data/supabaseClient';

describe('Uygulama Temel İskelet Birim Testleri', () => {
  it('Başlık ve Faz bileşenini ekrana basar', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /D&D 5e Takip/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Faz 1: Karakter Çekirdeği/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Yerel geliştirme modu/i)).toBeInTheDocument();
    });
  });

  it('D20 zarı atıldığında 1 ile 20 arasında sonuç üretir', async () => {
    render(<App />);
    const rollButton = screen.getByRole('button', { name: /D20 Zarı At/i });
    expect(rollButton).toBeInTheDocument();

    fireEvent.click(rollButton);
    expect(screen.getByText(/D20 Zarı At \(\d+\)/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Yerel geliştirme modu/i)).toBeInTheDocument();
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

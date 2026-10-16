import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';
import { createDatabaseClient } from '../../src/data/supabaseClient';

describe('Uygulama Temel İskelet ve Gezinme Birim Testleri', () => {
  it('Başlık, üst menü ve ana sayfa kartlarını ekrana basar', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /ArcaneFolio 5e/i })).toBeInTheDocument();
    
    expect(document.getElementById('nav-btn-home')).toBeInTheDocument();
    expect(document.getElementById('nav-btn-sheet')).toBeInTheDocument();
    expect(document.getElementById('nav-btn-creator')).toBeInTheDocument();
    expect(document.getElementById('nav-btn-dm')).toBeInTheDocument();

    expect(document.getElementById('home-hub-container')).toBeInTheDocument();
    expect(document.getElementById('hub-card-sheet')).toBeInTheDocument();
  });

  it('Menüden DM Ekranına geçilebilir', async () => {
    render(<App />);
    const dmNavBtn = document.getElementById('nav-btn-dm');
    expect(dmNavBtn).toBeInTheDocument();
    fireEvent.click(dmNavBtn!);

    await waitFor(() => {
      expect(document.getElementById('campaign-hub-root') || document.getElementById('encounter-tracker-view') || document.getElementById('main-content-viewport')).toBeInTheDocument();
    });
  });

  it('Veri katmanı istemcisi sağlıklı durum döndürür', async () => {
    const client = createDatabaseClient();
    const status = await client.getHealthStatus();
    expect(status.ok).toBe(true);
    expect(status.message).toBeDefined();
  });

  it('Menüden Karakter Kağıdına geçilebilir', async () => {
    render(<App />);
    const sheetNavBtn = document.getElementById('nav-btn-sheet');
    expect(sheetNavBtn).toBeInTheDocument();
    fireEvent.click(sheetNavBtn!);

    await waitFor(() => {
      expect(document.getElementById('modern-character-sheet-container')).toBeInTheDocument();
    });
  });
});

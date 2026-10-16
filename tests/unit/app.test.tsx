import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';
import { createDatabaseClient } from '../../src/data/supabaseClient';

describe('Uygulama Temel İskelet ve Gezinme Birim Testleri', () => {
  it('Başlık ve ana sayfa 4 temel rol kartını ekrana basar', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /ArcaneFolio 5e/i })).toBeInTheDocument();

    // 4 Temel Giriş Kartı
    expect(document.getElementById('hub-card-sheet')).toBeInTheDocument();
    expect(document.getElementById('hub-card-dm')).toBeInTheDocument();
    expect(document.getElementById('hub-card-creator')).toBeInTheDocument();
    expect(document.getElementById('hub-card-gallery')).toBeInTheDocument();

    // Kartlar üzerindeki eylem butonları
    expect(document.getElementById('nav-btn-sheet')).toBeInTheDocument();
    expect(document.getElementById('nav-btn-dm')).toBeInTheDocument();
    expect(document.getElementById('nav-btn-creator')).toBeInTheDocument();
    expect(document.getElementById('nav-btn-gallery')).toBeInTheDocument();
  });

  it('Ana sayfadan DM Ekranına geçilebilir ve üstte Ana Sayfaya dönüş butonu belirir', async () => {
    render(<App />);
    const dmNavBtn = document.getElementById('nav-btn-dm');
    expect(dmNavBtn).toBeInTheDocument();
    fireEvent.click(dmNavBtn!);

    await waitFor(() => {
      expect(
        document.getElementById('campaign-view-container') ||
        document.getElementById('campaign-hub-root') ||
        document.getElementById('main-content-viewport')
      ).toBeInTheDocument();
    });

    // Alt ekrana geçince üstte '← Ana Sayfa' butonu ve rol etiketi belirmeli
    const homeBtn = document.getElementById('nav-btn-home');
    expect(homeBtn).toBeInTheDocument();
    expect(document.getElementById('current-role-badge')).toBeInTheDocument();

    // Ana sayfaya geri dönülebilmeli
    fireEvent.click(homeBtn!);
    await waitFor(() => {
      expect(document.getElementById('home-hub-container')).toBeInTheDocument();
    });
  });

  it('Veri katmanı istemcisi sağlıklı durum döndürür', async () => {
    const client = createDatabaseClient();
    const status = await client.getHealthStatus();
    expect(status.ok).toBe(true);
    expect(status.message).toBeDefined();
  });

  it('Dil anahtarı (TR/EN Switch) arayüz metinlerini dinamik olarak günceller', async () => {
    render(<App />);
    const langBtn = document.getElementById('lang-toggle-btn');
    expect(langBtn).toBeInTheDocument();
    expect(langBtn?.textContent).toContain('TR');

    // Başlangıçta Türkçe metin
    expect(document.getElementById('hub-card-sheet')?.textContent).toContain('Oyuncu Masası');

    // Dili EN yap
    fireEvent.click(langBtn!);
    await waitFor(() => {
      expect(langBtn?.textContent).toContain('EN');
      expect(document.getElementById('hub-card-sheet')?.textContent).toContain('Player Sheet');
    });

    // Tekrar tıkla -> TR'ye geri dön
    fireEvent.click(langBtn!);
    await waitFor(() => {
      expect(langBtn?.textContent).toContain('TR');
      expect(document.getElementById('hub-card-sheet')?.textContent).toContain('Oyuncu Masası');
    });
  });
});

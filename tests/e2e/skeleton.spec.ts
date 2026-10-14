import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Faz 0 İskelet ve Çoklu Viewport Doğrulama', () => {
  test('Sayfa başlığı, PWA rozeti ve temel elementler yüklenmeli', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Başlık ve logo kontrolü
    await expect(page.locator('#header-logo')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /D&D 5e Takip/i })).toBeVisible();
    await expect(page.locator('#hero-title')).toContainText(/Faz \d/);

    // PWA & Sağlık rozetleri
    await expect(page.locator('#pwa-status-badge')).toContainText('PWA Hazır');
    await expect(page.locator('#health-status-badge')).toContainText('Sistem: OK');

    // D20 Zar atma interaktivitesi
    const rollButton = page.locator('#btn-hero-roll-d20');
    await expect(rollButton).toBeVisible();
    await rollButton.click();
    await expect(rollButton).toHaveText(/🎲 D20 Zarı At \(\d+\)/);

    // Yatay kaydırma kontrolü (Mobil disiplini)
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Dokunma hedef boyutu kontrolü (en az 44x44 px)
    const rollBox = await rollButton.boundingBox();
    expect(rollBox).not.toBeNull();
    if (rollBox) {
      expect(rollBox.height).toBeGreaterThanOrEqual(44);
      expect(rollBox.width).toBeGreaterThanOrEqual(44);
    }

    const refreshButton = page.locator('#btn-refresh-health');
    const refreshBox = await refreshButton.boundingBox();
    expect(refreshBox).not.toBeNull();
    if (refreshBox) {
      expect(refreshBox.height).toBeGreaterThanOrEqual(44);
      expect(refreshBox.width).toBeGreaterThanOrEqual(44);
    }

    // Ekran görüntüsü kaydı (proje adına göre)
    const projectName = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join('docs', 'qa', 'screenshots', `skeleton_${projectName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Konsol hatası olmamalı
    expect(consoleErrors).toHaveLength(0);
  });

  test('PWA manifest ve meta etiketleri mevcut ve geçerli olmalı', async ({ page }) => {
    await page.goto('/');
    
    // Manifest link kontrolü
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.webmanifest');

    // Theme color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#0f172a');

    // Viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
  });
});

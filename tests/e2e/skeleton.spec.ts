import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('V2 Modern Ana Sayfa Hub ve Çoklu Viewport Doğrulama', () => {
  test('Sayfa başlığı, üst gezinme menüsü, ana sayfa eylem kartları ve dokunma boyutları yüklenmeli', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Başlık ve logo kontrolü
    await expect(page.locator('#header-logo')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /D&D 5e Asistani/i })).toBeVisible();

    // Üst gezinme sekmeleri
    await expect(page.locator('#nav-btn-home')).toBeVisible();
    await expect(page.locator('#nav-btn-sheet')).toBeVisible();
    await expect(page.locator('#nav-btn-creator')).toBeVisible();
    await expect(page.locator('#nav-btn-dm')).toBeVisible();
    await expect(page.locator('#nav-btn-dice')).toBeVisible();

    // Ana Sayfa Hub eylem kartları
    await expect(page.locator('#home-hub-container')).toBeVisible();
    await expect(page.locator('#hub-card-sheet')).toBeVisible();
    await expect(page.locator('#hub-card-creator')).toBeVisible();
    await expect(page.locator('#hub-card-dm')).toBeVisible();
    await expect(page.locator('#hub-card-dice')).toBeVisible();

    // Yatay kaydırma kontrolü (Mobil disiplini - 0 yatay taşma)
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Dokunma hedef boyutu kontrolü (en az 44x44 px)
    const navBtn = page.locator('#nav-btn-home');
    const navBox = await navBtn.boundingBox();
    expect(navBox).not.toBeNull();
    if (navBox) {
      expect(navBox.height).toBeGreaterThanOrEqual(44);
    }

    const hubCard = page.locator('#hub-card-sheet');
    const cardBox = await hubCard.boundingBox();
    expect(cardBox).not.toBeNull();
    if (cardBox) {
      expect(cardBox.height).toBeGreaterThanOrEqual(44);
      expect(cardBox.width).toBeGreaterThanOrEqual(44);
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

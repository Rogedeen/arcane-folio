import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Durumlar ve Seviye Atlama E2E Doğrulama', () => {
  test('Koşul durumları açılıp kapanmalı, hız 0 uyarısı vermeli, seviye atlama modalı alt sınıfı açmalı', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Karakter Kağıdına Git
    await page.locator('#nav-btn-sheet').click();
    await expect(page.locator('#modern-character-sheet-container')).toBeVisible();

    // 1. Durumlar (Conditions) Sekmesine Git
    await page.locator('#tab-btn-conditions').click();
    const condContainer = page.locator('#conditions-tracker-container');
    await expect(condContainer).toBeVisible();

    const poisonedBadge = page.locator('#cond-badge-poisoned');
    await expect(poisonedBadge).toBeVisible();
    await poisonedBadge.click();
    await expect(poisonedBadge).toHaveClass(/active/);

    // Dokunma Hedefi (Touch Target min 44x44 px) Kontrolü
    const badgeBox = await poisonedBadge.boundingBox();
    expect(badgeBox).not.toBeNull();
    if (badgeBox) {
      expect(badgeBox.height).toBeGreaterThanOrEqual(44);
    }

    // Felç durumu (Hız 0 uyarısı)
    const paralyzedBadge = page.locator('#cond-badge-paralyzed');
    await paralyzedBadge.click();
    await expect(page.locator('#movement-blocked-alert')).toBeVisible();

    // 2. Seviye & Özellikler Sekmesine Git
    await page.locator('#tab-btn-features').click();
    const levelupContainer = page.locator('#levelup-manager-container');
    await expect(levelupContainer).toBeVisible();

    const openLevelUpBtn = page.locator('#btn-open-levelup-modal');
    await expect(openLevelUpBtn).toBeVisible();
    await openLevelUpBtn.click();

    // Modal açılmalı
    const levelupModal = page.locator('#levelup-modal');
    await expect(levelupModal).toBeVisible();

    // 3. Seviye Alt Sınıf (Champion) Kilidi Kontrolü
    await expect(page.locator('#subclass-unlock-box')).toBeVisible();
    await expect(page.locator('#subclass-unlock-box')).toContainText(/Şampiyon/);

    // Onayla ve seviye atla
    const confirmBtn = page.locator('#btn-confirm-levelup');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Modal kapandıktan sonra güncel seviye 4 olmalı
    await expect(page.locator('#display-char-level')).toHaveText('4');

    // Yatay Taşma Kontrolü (0 horizontal scroll)
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Ekran görüntüsü kaydı
    const projectName = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join('docs', 'qa', 'screenshots', `conditions_levelup_${projectName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Konsol hatası olmamalı
    expect(consoleErrors).toHaveLength(0);
  });
});

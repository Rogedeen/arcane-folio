import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Faz 4 Durumlar ve Seviye Atlama E2E Doğrulama', () => {
  test('Koşul durumları açılıp kapanmalı, hız 0 uyarısı vermeli, seviye atlama modalı alt sınıfı açmalı', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // 1. Durumlar (Conditions) Kontrolü
    const condContainer = page.locator('#conditions-tracker-container');
    await expect(condContainer).toBeVisible();

    const poisonedBadge = page.locator('#cond-badge-poisoned');
    await expect(poisonedBadge).toBeVisible();
    await poisonedBadge.click();
    await expect(poisonedBadge).toHaveClass(/active/);

    // Felç durumu (Hız 0 uyarısı)
    const paralyzedBadge = page.locator('#cond-badge-paralyzed');
    await paralyzedBadge.click();
    await expect(page.locator('#movement-blocked-alert')).toBeVisible();

    // 2. Seviye Atlama (Level Up) Kontrolü
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
    await page.locator('#btn-confirm-levelup').click();
    await expect(levelupModal).not.toBeVisible();

    // Seviye 3 olmalı ve Maks Can 28 HP olmalı
    await expect(levelupContainer).toContainText('3');
    await expect(levelupContainer).toContainText('28 HP');

    // Dokunmatik hedef boyutu (>= 44x44px)
    const poisonedBox = await poisonedBadge.boundingBox();
    expect(poisonedBox).not.toBeNull();
    if (poisonedBox) {
      expect(poisonedBox.height).toBeGreaterThanOrEqual(44);
    }

    // Sıfır yatay kaydırma kontrolü
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Ekran görüntüsü kaydı
    const projectName = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join('docs', 'qa', 'screenshots', `conditions_levelup_${projectName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Konsol hatası kontrolü
    expect(consoleErrors).toHaveLength(0);
  });
});

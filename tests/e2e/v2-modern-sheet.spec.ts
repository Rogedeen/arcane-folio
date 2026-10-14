import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('V2 Modern Karakter Kağıdı, Ölüm Zarları ve Çoklu Zar Tepsisi E2E Doğrulama', () => {
  test('Modern karakter kağıdı 3 sütunlu kompakt düzen, stat kilitleme ve ölüm zarları eksiksiz çalışmalı', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // 1. Ana sayfadan "Karakteri Aç" kartına tıkla
    await page.locator('#hub-card-sheet').click();
    const sheetContainer = page.locator('#modern-character-sheet-container');
    await expect(sheetContainer).toBeVisible();

    // 2. Başlık İstatistikleri Kontrolü (AC, Girişim, Hız, Ustalık)
    await expect(page.locator('#sheet-ac-val')).toContainText('16');
    await expect(page.locator('#val-passive-perception')).toHaveText('11');
    await expect(page.locator('#val-passive-investigation')).toHaveText('10');

    // 3. Stat Kilitleme Butonu Kontrolü (Madde 10)
    const lockBtn = page.locator('#btn-toggle-stat-lock');
    await expect(lockBtn).toBeVisible();
    await expect(lockBtn).toContainText('Kilitli');
    await lockBtn.click();
    await expect(lockBtn).toContainText('Duzenle');
    await lockBtn.click();
    await expect(lockBtn).toContainText('Kilitli');

    // 4. 18 Beceri Listesi Görünürlüğü
    await expect(page.locator('#skills-list-container')).toBeVisible();
    await expect(page.locator('#skills-list-container')).toContainText('Algı (Perception)');
    await expect(page.locator('#skills-list-container')).toContainText('Gizlilik');

    // 5. Ölüm Kurtarma Zarları (Madde 8)
    const deathSavesBox = page.locator('#death-saves-container');
    await expect(deathSavesBox).toBeVisible();
    
    // d20 Ölüm Zarı At Butonu
    const rollDeathBtn = page.locator('#btn-roll-death-save');
    await expect(rollDeathBtn).toBeVisible();
    await rollDeathBtn.click();

    // Başarı, başarısızlık veya stabilize durumunu doğrula
    await expect(async () => {
      const filledSuccess = page.locator('.death-pip.success.filled');
      const filledFailure = page.locator('.death-pip.failure.filled');
      const stableAlert = page.locator('.stable-alert');
      const total = (await filledSuccess.count()) + (await filledFailure.count()) + (await stableAlert.count());
      expect(total).toBeGreaterThan(0);
    }).toPass({ timeout: 4000 });

    // Sıfırla butonuna tıkla
    await page.locator('#btn-reset-death-saves').click();

    // 6. Silah Hasar Zarı Atma
    const weaponRollBtn = page.locator('.actions-tab-view button').first();
    if (await weaponRollBtn.isVisible()) {
      await weaponRollBtn.click();
    }

    // 7. Çoklu Zar Tepsisi (Madde 3: Google Zar Havuzu Tarzı)
    await page.locator('#nav-btn-dice').click();
    await expect(page.locator('#dice-tray-container')).toBeVisible();

    // 4d6 Preset Butonuna Tıkla
    await page.getByRole('button', { name: /4d6 \(Stat\)/i }).click();
    await expect(page.locator('#pool-control-bar')).toContainText('4d6');

    // Bonus ekle (+2)
    const modPlusBtn = page.locator('.mod-stepper button').nth(1);
    await modPlusBtn.click();
    await modPlusBtn.click();
    await expect(page.locator('.mod-val')).toHaveText('+2');

    // Zarları at
    const execRollBtn = page.locator('#btn-execute-dice-roll');
    await execRollBtn.click();
    await expect(page.locator('.current-roll-breakdown')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.current-roll-breakdown')).toContainText('4d6');
    await expect(page.locator('.current-roll-breakdown')).toContainText('d6:');

    // Dokunma Hedefi (Touch Target min 44x44 px) Kontrolü (Zar Atma Butonu)
    const diceRollBox = await execRollBtn.boundingBox();
    expect(diceRollBox).not.toBeNull();
    if (diceRollBox) {
      expect(diceRollBox.height).toBeGreaterThanOrEqual(44);
    }

    // Yatay Taşma Kontrolü (0 horizontal scroll)
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Ekran görüntüsü kaydı
    const projectName = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join('docs', 'qa', 'screenshots', `v2_modern_sheet_${projectName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Konsol hatası olmamalı
    expect(consoleErrors).toHaveLength(0);
  });
});

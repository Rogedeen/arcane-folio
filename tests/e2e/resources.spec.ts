import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Zar Tepsisi ve Kaynak Takibi E2E Doğrulama', () => {
  test('Zar tepsisinde çoklu zar havuzu atılmalı, karakter kağıdında HP ve büyü slotları güncellenmeli', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // 1. Zar Tepsisi Sekmesine Git
    await page.locator('#nav-btn-dice').click();
    const diceTray = page.locator('#dice-tray-container');
    await expect(diceTray).toBeVisible();

    // D4, D6, D8, D10, D12, D20, D100 butonları mevcut olmalı
    await expect(page.locator('#btn-roll-d4')).toBeVisible();
    await expect(page.locator('#btn-roll-d6')).toBeVisible();
    await expect(page.locator('#btn-roll-d8')).toBeVisible();
    await expect(page.locator('#btn-roll-d10')).toBeVisible();
    await expect(page.locator('#btn-roll-d12')).toBeVisible();
    await expect(page.locator('#btn-roll-d20')).toBeVisible();
    await expect(page.locator('#btn-roll-d100')).toBeVisible();

    // Havuza D20 ve D6 ekle
    await page.locator('#btn-roll-d20').click();
    await page.locator('#btn-roll-d6').click();

    // Zarları at
    const executeRollBtn = page.locator('#btn-execute-dice-roll');
    await expect(executeRollBtn).toBeVisible();
    await executeRollBtn.click();

    // Tumbler animasyonu ve sonuç kontrolü
    const activeStage = page.locator('#active-dice-stage');
    await expect(activeStage).toBeVisible();
    await expect(page.locator('.result-number')).toBeVisible({ timeout: 5000 });

    // 2. Karakter Kağıdı Sekmesine Git
    await page.locator('#nav-btn-sheet').click();
    const sheetContainer = page.locator('#modern-character-sheet-container');
    await expect(sheetContainer).toBeVisible();

    // Kaynak Takibi (HP & Dinlenme) Kontrolü
    const resourceTracker = page.locator('#resource-tracker-card');
    await expect(resourceTracker).toBeVisible();

    const currentHpEl = page.locator('#display-current-hp');
    await expect(currentHpEl).toHaveText('28');

    // 10 hasar vur
    const amountInput = page.locator('#input-hp-amount');
    await amountInput.fill('10');
    await page.locator('#btn-damage').click();
    await expect(currentHpEl).toHaveText('18');

    // Temp HP ekle (+5)
    await amountInput.fill('5');
    await page.locator('#btn-add-temp-hp').click();
    await expect(page.locator('#badge-temp-hp')).toContainText('+5 Geçici Can');

    // Uzun Dinlenme (Long Rest) ile canı tamamen yenile
    await page.locator('#btn-long-rest').click();
    await expect(currentHpEl).toHaveText('28');

    // Büyü Slotu Harca
    const slotBtn = page.locator('#btn-slot-1-1');
    if (await slotBtn.isVisible()) {
      await expect(slotBtn).toHaveText('1');
      await slotBtn.click();
      await expect(slotBtn).toHaveText('✕');
    }

    // Dokunma Hedefi (Touch Target min 44x44 px) Kontrolü
    const damageBtn = page.locator('#btn-damage');
    const dmgBox = await damageBtn.boundingBox();
    expect(dmgBox).not.toBeNull();
    if (dmgBox) {
      expect(dmgBox.height).toBeGreaterThanOrEqual(44);
    }

    // Yatay Taşma Kontrolü (0 horizontal scroll)
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Ekran görüntüsü kaydı
    const projectName = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join('docs', 'qa', 'screenshots', `resources_${projectName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Konsol hatası olmamalı
    expect(consoleErrors).toHaveLength(0);
  });
});

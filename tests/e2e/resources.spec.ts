import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Faz 2 Kaynak Takibi ve Polhedral Zar Tepsisi E2E Doğrulama', () => {
  test('Zar tepsisinde polhedral zarlar atılmalı, HP hasar/dinlenme ve büyü slotları güncellenmeli', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // 1. Zar Tepsisi Kontrolü
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

    // D20 Zarı at
    await page.locator('#btn-roll-d20').click();
    // Tumbler animasyonu ve sonuç kontrolü
    const activeStage = page.locator('#active-dice-stage');
    await expect(activeStage).toBeVisible();
    await expect(page.locator('.result-number')).toBeVisible({ timeout: 5000 });

    // D6 Zarı at
    await page.locator('#btn-roll-d6').click();
    await expect(page.locator('.result-number')).toBeVisible({ timeout: 5000 });

    // Geçmişte en az bir atış yer almalı
    const historyList = page.locator('#dice-history-list');
    await expect(historyList).toContainText(/d6|d20/i);

    // 2. Kaynak Takibi (HP & Dinlenme) Kontrolü
    const resourceTracker = page.locator('#resource-tracker-card');
    await expect(resourceTracker).toBeVisible();

    const currentHpEl = page.locator('#display-current-hp');
    await expect(currentHpEl).toHaveText('32');

    // 10 hasar vur
    const amountInput = page.locator('#input-hp-amount');
    await amountInput.fill('10');
    await page.locator('#btn-damage').click();
    await expect(currentHpEl).toHaveText('22');

    // Temp HP ekle (+5)
    await amountInput.fill('5');
    await page.locator('#btn-add-temp-hp').click();
    await expect(page.locator('#badge-temp-hp')).toContainText('+5 Geçici Can');

    // Uzun dinlenme yap (Long Rest)
    await page.locator('#btn-long-rest').click();
    // Can tam 32'ye çıkmalı ve temp HP sıfırlanmalı
    await expect(currentHpEl).toHaveText('32');
    await expect(page.locator('#badge-temp-hp')).not.toBeVisible();

    // 3. Büyü Slotları Kontrolü
    const firstSlotPip = page.locator('#pip-tier-1-0');
    await expect(firstSlotPip).toBeVisible();
    await expect(firstSlotPip).toHaveClass(/available/);
    await firstSlotPip.click();
    await expect(firstSlotPip).toHaveClass(/expended/);

    // Dokunmatik hedef kontrolleri
    const d20Box = await page.locator('#btn-roll-d20').boundingBox();
    expect(d20Box).not.toBeNull();
    if (d20Box) {
      expect(d20Box.height).toBeGreaterThanOrEqual(44);
      expect(d20Box.width).toBeGreaterThanOrEqual(44);
    }

    // Yatay kaydırma kontrolü
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

import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Envanter ve Büyüler E2E Doğrulama', () => {
  test('Envanterde eşya kuşanma, ağırlık kapasitesi ve büyü hazırlama eksiksiz çalışmalı', async ({ page }, testInfo) => {
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

    // 1. Envanter Sekmesine Geç
    await page.locator('#tab-btn-inventory').click();
    const invContainer = page.locator('#inventory-manager-container');
    await expect(invContainer).toBeVisible();

    // Taşıma Kapasitesi (STR 16 -> 240 lbs)
    const carryingCap = page.locator('#display-carrying-capacity');
    await expect(carryingCap).toBeVisible();
    const totalWeightEl = page.locator('#display-total-weight');
    await expect(totalWeightEl).toBeVisible();

    // Kuşanma Butonu (Longsword)
    const longswordEquipBtn = page.locator('#btn-equip-longsword');
    await expect(longswordEquipBtn).toBeVisible();
    await expect(longswordEquipBtn).toHaveText('Çıkar');

    // Dokunma Hedefi (Touch Target min 44x44 px) Kontrolü
    const equipBox = await longswordEquipBtn.boundingBox();
    expect(equipBox).not.toBeNull();
    if (equipBox) {
      expect(equipBox.height).toBeGreaterThanOrEqual(44);
    }

    await longswordEquipBtn.click();
    await expect(longswordEquipBtn).toHaveText('Kuşan');

    // Kategori Filtresi (İksirler)
    await page.getByRole('button', { name: /potion Filtrele/i }).click();
    await expect(page.locator('#item-row-potion-of-healing')).toBeVisible();
    await expect(page.locator('#item-row-plate-armor')).not.toBeVisible();

    // Filtreyi Tümü'ne geri al
    await page.getByRole('button', { name: /all Filtrele/i }).click();

    // 2. Büyü Kitabı Sekmesine Geç
    await page.locator('#tab-btn-spells').click();
    const spellbookContainer = page.locator('#spellbook-container');
    await expect(spellbookContainer).toBeVisible();

    // Hazırlanan büyü sayacı
    const maxPreparedEl = page.locator('#display-max-prepared');
    await expect(maxPreparedEl).toBeVisible();
    const preparedCountEl = page.locator('#display-prepared-count');
    await expect(preparedCountEl).toBeVisible();

    // Büyü Arama Filtresi
    const searchInput = page.locator('#input-spell-search');
    await searchInput.fill('Shield');
    await expect(page.locator('#spell-card-shield')).toBeVisible();
    await expect(page.locator('#spell-card-cure-wounds')).not.toBeVisible();
    await searchInput.fill('');

    // Yatay Taşma Kontrolü (0 horizontal scroll)
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Ekran görüntüsü kaydı
    const projectName = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join('docs', 'qa', 'screenshots', `spells_inventory_${projectName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Konsol hatası olmamalı
    expect(consoleErrors).toHaveLength(0);
  });
});

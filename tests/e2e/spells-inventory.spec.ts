import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Faz 3 Envanter ve Büyüler E2E Doğrulama', () => {
  test('Envanterde eşya kuşanma, ağırlık kapasitesi ve büyü hazırlama eksiksiz çalışmalı', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // 1. Envanter Bileşeni Doğrulaması
    const invContainer = page.locator('#inventory-manager-container');
    await expect(invContainer).toBeVisible();

    // Taşıma Kapasitesi (STR 14 -> 210 lbs)
    await expect(page.locator('#display-carrying-capacity')).toHaveText('210');
    const totalWeightEl = page.locator('#display-total-weight');
    await expect(totalWeightEl).toBeVisible();

    // Kuşanma Butonu (Longsword)
    const longswordEquipBtn = page.locator('#btn-equip-longsword');
    await expect(longswordEquipBtn).toBeVisible();
    await expect(longswordEquipBtn).toHaveText('Çıkar');
    await longswordEquipBtn.click();
    await expect(longswordEquipBtn).toHaveText('Kuşan');

    // Kategori Filtresi (İksirler)
    await page.getByRole('button', { name: /potion Filtrele/i }).click();
    await expect(page.locator('#item-row-potion-of-healing')).toBeVisible();
    await expect(page.locator('#item-row-plate-armor')).not.toBeVisible();

    // Filtreyi Tümü'ne geri al
    await page.getByRole('button', { name: /all Filtrele/i }).click();

    // 2. Büyü Kitabı Bileşeni Doğrulaması
    const spellbookContainer = page.locator('#spellbook-container');
    await expect(spellbookContainer).toBeVisible();

    // Hazırlanan büyü sayacı (Level 5 + INT +4 -> Max 9)
    await expect(page.locator('#display-max-prepared')).toHaveText('9');
    const preparedCountEl = page.locator('#display-prepared-count');
    await expect(preparedCountEl).toBeVisible();

    // Büyü Arama Filtresi (Fireball)
    const searchInput = page.locator('#input-spell-search');
    await searchInput.fill('Fireball');
    await expect(page.locator('#spell-card-fireball')).toBeVisible();
    await expect(page.locator('#spell-card-shield')).not.toBeVisible();

    // Arama filtresini temizle
    await searchInput.fill('');

    // Büyü Hazırlama Toggle
    const magicMissileBtn = page.locator('#btn-prepare-magic-missile');
    await expect(magicMissileBtn).toBeVisible();
    await expect(magicMissileBtn).toHaveText('✓ Hazırlandı');
    await magicMissileBtn.click();
    await expect(magicMissileBtn).toHaveText('+ Hazırla');

    // Dokunmatik hedef kontrolleri (>= 44x44px)
    const equipBox = await longswordEquipBtn.boundingBox();
    expect(equipBox).not.toBeNull();
    if (equipBox) {
      expect(equipBox.height).toBeGreaterThanOrEqual(44);
    }

    // Yatay kaydırma kontrolü
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Ekran görüntüsü kaydı
    const projectName = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join('docs', 'qa', 'screenshots', `spells_inventory_${projectName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Konsol hatası kontrolü
    expect(consoleErrors).toHaveLength(0);
  });
});

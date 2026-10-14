import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Faz 1 Karakter Çekirdeği E2E Doğrulama', () => {
  test('Karakter oluşturucu formu yüklenmeli, seviye artırıldığında ustalık bonusu ve AC güncellenmeli', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Karakter oluşturucu bileşeni görünürlüğü
    const creatorCard = page.locator('#character-creator-container');
    await expect(creatorCard).toBeVisible();
    await expect(page.getByRole('heading', { name: /Karakter Çekirdeği \(Faz 1\)/i })).toBeVisible();

    // Başlangıç değerleri (Seviye 1: Ustalık +2)
    const profPill = page.locator('#val-proficiency');
    await expect(profPill).toContainText('+2');

    // Seviye artır (Level 5'e çıkar)
    const levelUpBtn = page.locator('#btn-level-up');
    await expect(levelUpBtn).toBeVisible();
    
    // 4 kez tıkla
    await levelUpBtn.click();
    await levelUpBtn.click();
    await levelUpBtn.click();
    await levelUpBtn.click();

    await expect(page.locator('#display-level')).toHaveText('5');
    await expect(profPill).toContainText('+3');

    // Kalkan kuşanma ve AC değişimi kontrolü
    const acPill = page.locator('#val-ac');
    const initialAcText = await acPill.innerText();
    const initialAc = parseInt(initialAcText, 10);

    const shieldCheckbox = page.locator('#chk-shield');
    await shieldCheckbox.check();
    await expect(acPill).toHaveText(String(initialAc + 2));

    // Dokunma hedefi kontrolü (min 44x44 px)
    const levelBox = await levelUpBtn.boundingBox();
    expect(levelBox).not.toBeNull();
    if (levelBox) {
      expect(levelBox.height).toBeGreaterThanOrEqual(44);
      expect(levelBox.width).toBeGreaterThanOrEqual(44);
    }

    const selectRace = page.locator('#select-race');
    const raceBox = await selectRace.boundingBox();
    expect(raceBox).not.toBeNull();
    if (raceBox) {
      expect(raceBox.height).toBeGreaterThanOrEqual(44);
    }

    // Yatay taşma kontrolü
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Ekran görüntüsü kaydı
    const projectName = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join('docs', 'qa', 'screenshots', `character_${projectName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Konsol hatası olmamalı
    expect(consoleErrors).toHaveLength(0);
  });
});

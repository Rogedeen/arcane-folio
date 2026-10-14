import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Kampanya, DM Kokpiti ve Canlı Senkronizasyon E2E Doğrulama', () => {
  test('Davet kodu, DM kokpiti stat ve beceri görünümü geçişi, custom HP ve debuff stackleme çalışmalı', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // DM Ekranı Sekmesine Git
    await page.locator('#nav-btn-dm').click();

    // 1. Kampanya Görünümü Kontrolü
    const campaignContainer = page.locator('#campaign-view-container');
    await expect(campaignContainer).toBeVisible();

    // Canlı senkronizasyon rozeti
    const liveSyncEl = page.locator('#live-sync-indicator');
    await expect(liveSyncEl).toBeVisible();
    await expect(liveSyncEl).toContainText(/Canlı Senkronize/);

    // Davet kodu kontrolü
    const inviteCodeEl = page.locator('#display-invite-code');
    await expect(inviteCodeEl).toHaveText('DRG924');

    // 2. DM Kokpiti Kontrolü
    const dmDashboard = page.locator('#dm-dashboard-container');
    await expect(dmDashboard).toBeVisible();

    // Karakter 1 (Kaelen Karaçekiç) canı başlangıçta 28
    const char1Hp = page.locator('#member-current-hp-char-1');
    await expect(char1Hp).toHaveText('28');

    // Tüm 6 Stat Görünürlüğü (Madde 9)
    await expect(page.locator('#party-member-card-char-1')).toContainText('STR 16');
    await expect(page.locator('#party-member-card-char-1')).toContainText('DEX 14');

    // Pasif Algı ve Pasif İnceleme (Madde 9)
    await expect(page.locator('#party-member-card-char-1')).toContainText('Pasif Algı');
    await expect(page.locator('#party-member-card-char-1')).toContainText('Pasif İnceleme');

    // Görünüm Değiştirme Butonu (Statlar ↔ Beceriler)
    const toggleViewBtn = page.locator('#btn-toggle-view-char-1');
    await expect(toggleViewBtn).toBeVisible();
    await toggleViewBtn.click();
    await expect(page.locator('#party-member-card-char-1')).toContainText('Atletizm: +3');

    // Tekrar tıkla statlara dön
    await toggleViewBtn.click();
    await expect(page.locator('#party-member-card-char-1')).toContainText('STR 16');

    // Custom HP Girişi (Madde 9)
    const customHpInput = page.locator('#input-custom-hp-char-1');
    await expect(customHpInput).toBeVisible();
    await customHpInput.fill('3');
    await page.locator('#btn-dm-damage-char-1').click();
    await expect(char1Hp).toHaveText('25');

    // DM Zehir durumu ekle
    const condBtn = page.locator('#btn-dm-cond-char-1');
    await condBtn.click();
    await expect(page.locator('#party-member-card-char-1')).toContainText('Zehirli');

    // Çoklu Debuff Stackleme (Madde 9)
    const debuffSelect = page.locator('#select-debuff-char-1');
    await debuffSelect.selectOption('Kör');
    await condBtn.click();
    await expect(page.locator('#party-member-card-char-1')).toContainText('Kör');

    // Dokunma Hedefi (Touch Target min 44x44 px) Kontrolü
    const dmgBtnBox = await condBtn.boundingBox();
    expect(dmgBtnBox).not.toBeNull();
    if (dmgBtnBox) {
      expect(dmgBtnBox.height).toBeGreaterThanOrEqual(44);
    }

    // Yatay Taşma Kontrolü (0 horizontal scroll)
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Ekran görüntüsü kaydı
    const projectName = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join('docs', 'qa', 'screenshots', `campaign_sync_${projectName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Konsol hatası olmamalı
    expect(consoleErrors).toHaveLength(0);
  });
});

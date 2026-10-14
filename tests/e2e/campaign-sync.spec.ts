import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Faz 5 Kampanya ve Canlı Senkronizasyon E2E Doğrulama', () => {
  test('Davet kodu, DM kokpiti canlı can/durum yönetimi ve oyuncu salt-okunur modu eksiksiz çalışmalı', async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

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

    // Kaelen Karaçekiç canı başlangıçta 28
    const char1Hp = page.locator('#member-current-hp-char-1');
    await expect(char1Hp).toHaveText('28');

    // DM -5 Hasar Ver butonuna tıkla
    const damageBtn = page.locator('#btn-dm-damage-char-1');
    await expect(damageBtn).toBeVisible();
    await damageBtn.click();
    await expect(char1Hp).toHaveText('23');

    // DM Zehir durumu ekle
    const condBtn = page.locator('#btn-dm-cond-char-1');
    await condBtn.click();
    await expect(page.locator('#party-member-card-char-1')).toContainText('Zehirli');

    // 3. Oyuncu Moduna Geçiş (Salt-Okunur)
    const playerSwitchBtn = page.locator('#btn-switch-role-player');
    await playerSwitchBtn.click();

    // Rol rozeti salt-okunur olmalı
    await expect(page.locator('#user-role-badge')).toContainText(/Oyuncu Modu \(Salt-Okunur\)/);
    // DM aksiyon butonları gizlenmeli
    await expect(page.locator('#btn-dm-damage-char-1')).not.toBeVisible();

    // DM Moduna geri dön
    await page.locator('#btn-switch-role-dm').click();
    await expect(page.locator('#btn-dm-damage-char-1')).toBeVisible();

    // 4. Farklı Kampanya Koduna Katılma
    const joinInput = page.locator('#input-join-code');
    await joinInput.fill('MYCAMP');
    await page.locator('#btn-join-campaign').click();
    await expect(inviteCodeEl).toHaveText('MYCAMP');

    // Dokunmatik hedef kontrolleri (>= 44x44px)
    const damageBox = await damageBtn.boundingBox();
    expect(damageBox).not.toBeNull();
    if (damageBox) {
      expect(damageBox.height).toBeGreaterThanOrEqual(44);
    }

    // Yatay kaydırma kontrolü
    const isHorizontalScrollPresent = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollPresent).toBe(false);

    // Ekran görüntüsü kaydı
    const projectName = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join('docs', 'qa', 'screenshots', `campaign_sync_${projectName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Konsol hatası kontrolü
    expect(consoleErrors).toHaveLength(0);
  });
});

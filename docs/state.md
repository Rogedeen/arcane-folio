# Proje Durumu (State)

- **Mevcut Faz:** Faz 4 Tamamlandı -> Faz 5: Kampanya ve Canlı Senkron
- **Tur Sayısı:** 1 / 40
- **Son Güncelleme:** 2026-10-14
- **Faz Durumu:** Faz 4 Tamamlandı (Otomatik Onaylı Süreç)

---

## 1. Tamamlanan Fazlar
- **Faz 0:** Temel İskelet (Vite, React, TypeScript, PWA, Vitest, Playwright 3 viewport).
- **Faz 1:** Karakter Çekirdeği (SRD 5.1 Statlar, ırk, sınıf, HP, AC formülleri).
- **Faz 2:** Kaynak Takibi & Polhedral Zarlar (d4–d100 animasyonlu zar tepsisi, HP kalkanı, dinlenme, büyü slotları).
- **Faz 3:** Envanter ve Büyüler (50 büyü, 50 eşya, JSON şema doğrulaması, STR x 15 taşıma kapasitesi, büyü hazırlama).
- **Faz 4:** Sınıf Özellikleri ve Durumlar (15 SRD durumu, 12 alt sınıf, seviye atlama modalı).

---

## 2. Faz 4 Sonuçları ve Kanıtlar
- **Birim & Kural Testleri (`npm test`):** 78 passed, 0 failed.
- **E2E Testleri (`npm run e2e`):** 18 passed, 0 failed across Mobile, Tablet, Desktop.
- **Kural Denetçisi Raporu:** `docs/rules-audit/faz4-01-sinif-ozellikleri-ve-durumlar.md` (ONAYLANDI).
- **Kalite Güvence Raporu:** `docs/qa/faz4-01-sinif-ozellikleri-ve-durumlar.md` (ONAYLANDI).

---

## 3. Aktif Görev: Faz 5
- Kampanya Davet Kodu (Invite Code) & Katılım Mekanizması
- Dungeon Master (DM) Paneli (Parti üyeleri canlı can, pasif algı ve durum takibi)
- Canlı Senkronizasyon (BroadcastChannel çoklu sekme + Supabase Realtime Fallback)

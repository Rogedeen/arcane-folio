# Proje Durumu (State)

- **Mevcut Faz:** Faz 0: Temel (İskelet)
- **Tur Sayısı (Bu Faz):** 1 / 40
- **Son Güncelleme:** 2026-10-14
- **Faz Durumu:** Faz 0 Bitiş Kriterlerini Karşıladı (Onay Kapısı Bekleniyor)

---

## 1. Faz 0 Hedefleri ve Bitiş Kriterleri
- [x] Vite + React + TypeScript + Vanilla CSS / modern responsive stil altyapısı (TAMAMLANDI)
- [x] Vitest birim test altyapısı çalışır durumda (`npm test` 4/4 passed) (TAMAMLANDI)
- [x] Playwright E2E test altyapısı ve 3 viewport (Desktop, Tablet, Mobil 390x844) (`npm run e2e` 6/6 passed) (TAMAMLANDI)
- [x] PWA altyapısı (manifest.webmanifest, service worker kaydı, 192x192 & 512x512 SVG ikonlar) (TAMAMLANDI)
- [x] Supabase istemci katmanı arayüz sözleşmesi (`src/data/supabaseClient.ts`) (TAMAMLANDI)
- [x] CI iş akışı (`.github/workflows/ci.yml`) (TAMAMLANDI)

---

## 2. Açık Görevler
- **Faz 1 Onayı Bekleniyor:** Faz 1: Karakter Çekirdeği (statlar, ırk, sınıf, ustalık bonusu, AC, HP)

---

## 3. Tamamlanan Görevler
- **Görev 0.1 (`faz0-01-temel-iskelet`):**
  - Mimar: `docs/decisions/faz0-01-temel-iskelet.md` arayüz sözleşmesi ve kabul kriterleri oluşturuldu.
  - Geliştirici: Vite, React 18, TypeScript strict, PWA desteği, koyu tema tasarım sistemi ve Supabase istemci katmanı kodlandı.
  - Doğrulayıcı: `tests/e2e/skeleton.spec.ts` 3 viewport'ta (Desktop, Tablet, Mobil) test edildi, ekran görüntüleri alındı, `docs/qa/faz0-01-temel-iskelet.md` raporu yayınlandı. Karar: GEÇTİ.
  - Git Commit: `faz0: temel iskelet, pwa ve test altyapisi kuruldu` (daldan main'e birleştirildi).

---

## 4. Son Sonuçlar ve Kanıtlar
- **Birim Testleri (`npm test`):** 4 passed, 0 failed.
- **E2E Testleri (`npm run e2e`):** 6 passed, 0 failed.
- **Ekran Görüntüleri:**
  - `docs/qa/screenshots/skeleton_desktop__1440x900_.png`
  - `docs/qa/screenshots/skeleton_tablet__768x1024_.png`
  - `docs/qa/screenshots/skeleton_mobile_phone__390x844_.png`

---

## 5. Bilinen Sorunlar ve Riskler
- Bilinen açık sorun bulunmamaktadır.

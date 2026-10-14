# Proje Durumu (State)

- **Mevcut Faz:** Faz 2: Kaynak Takibi
- **Tur Sayısı (Bu Faz):** 1 / 40
- **Son Güncelleme:** 2026-10-14
- **Faz Durumu:** Faz 2 Bitiş Kriterlerini Karşıladı (Onay Kapısı Bekleniyor)

---

## 1. Faz 2 Hedefleri ve Bitiş Kriterleri
- [x] Puppeteer MCP sunucusu entegrasyonu (`~/.gemini/config/mcp_config.json`) (TAMAMLANDI)
- [x] D&D Beyond tarzı dokunsal deneyim & juice artırımı (TAMAMLANDI)
- [x] Tam Polhedral zar seti (d4, d6, d8, d10, d12, d20, d100) (TAMAMLANDI)
- [x] Fiziksel zar takla animasyonu, sentetik Web Audio API ses efektleri ve Nat 20 parıltısı (TAMAMLANDI)
- [x] Can Puanı kalkanı, Geçici Can (Temp HP), dinamik sağlık barı ve hasar/iyileşme hesaplayıcı (TAMAMLANDI)
- [x] Kısa Dinlenme (Short Rest) can zarı harcama & Warlock slot sıfırlama (TAMAMLANDI)
- [x] Uzun Dinlenme (Long Rest) tam HP, slot sıfırlama ve can zarlarının yarısını kazanma (TAMAMLANDI)
- [x] Büyü Slotları Grid (Tam büyücü, yarı büyücü ve Warlock pact magic) (TAMAMLANDI)
- [x] 5e Kural Denetçisi onayı (`docs/rules-audit/faz2-01-kaynak-ve-zar-takibi.md`) (ONAYLANDI)
- [x] Tüm testler yeşil (`npm test` 47/47 passed, `npm run e2e` 12/12 passed) (TAMAMLANDI)

---

## 2. Açık Görevler
- **Faz 3 Onayı Bekleniyor:** Faz 3: Envanter ve Büyüler (50 büyü, 50 eşya, JSON şema doğrulaması `npm run content:validate`)

---

## 3. Tamamlanan Görevler
- **Görev 0.1 (`faz0-01-temel-iskelet`):** Vite + React + TS + PWA + Vitest + Playwright temel iskeleti.
- **Görev 1.1 (`faz1-01-karakter-cekirdegi`):** SRD 5.1 temel kural motoru ve karakter oluşturucu.
- **Görev 2.1 (`faz2-01-kaynak-ve-zar-takibi`):**
  - Mimar: `docs/decisions/faz2-01-kaynak-ve-zar-takibi.md`
  - Kural Denetçisi: `docs/rules-audit/faz2-01-kaynak-ve-zar-takibi.md` (19 kural testi yeşil)
  - Geliştirici: `src/rules/damageHealing.ts`, `resting.ts`, `spellSlots.ts`, `DiceTray.tsx`, `ResourceTracker.tsx`, `soundEffects.ts`
  - Doğrulayıcı: `docs/qa/faz2-01-kaynak-ve-zar-takibi.md` (12/12 Playwright E2E yeşil)
  - Git Commit: `faz2: kaynak takibi, dinlenme mekanigi ve polhedral zar tepsisi tamamlandi`

---

## 4. Son Sonuçlar ve Kanıtlar
- **Birim & Kural Testleri (`npm test`):** 47 passed, 0 failed.
- **E2E Testleri (`npm run e2e`):** 12 passed, 0 failed.
- **Ekran Görüntüleri:**
  - `docs/qa/screenshots/resources_desktop__1440x900_.png`
  - `docs/qa/screenshots/resources_tablet__768x1024_.png`
  - `docs/qa/screenshots/resources_mobile_phone__390x844_.png`

---

## 5. Bilinen Sorunlar ve Riskler
- Bilinen açık sorun veya kural hatası bulunmamaktadır.

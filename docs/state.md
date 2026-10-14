# Proje Durumu (State)

- **Mevcut Faz:** Faz 1: Karakter Çekirdeği
- **Tur Sayısı (Bu Faz):** 1 / 40
- **Son Güncelleme:** 2026-10-14
- **Faz Durumu:** Faz 1 Bitiş Kriterlerini Karşıladı (Onay Kapısı Bekleniyor)

---

## 1. Faz 1 Hedefleri ve Bitiş Kriterleri
- [x] SRD 5.1 referans kılavuzunun oluşturulması (`docs/rules/srd-referans.md`) (TAMAMLANDI)
- [x] Yetenek skoru ve modifikatör motoru (`floor((skor - 10) / 2)`) (TAMAMLANDI)
- [x] Seviye 1–20 ustalık bonusu (Proficiency Bonus) tablosu (TAMAMLANDI)
- [x] Sınıf can zarları ve dinamik HP hesaplama saf fonksiyonu (TAMAMLANDI)
- [x] Zırh Sınıfı (Unarmored, Barbarian, Monk, Hafif/Orta/Ağır Zırh, Kalkan) (TAMAMLANDI)
- [x] Irksal yetenek bonusları (Human, Elf, Dwarf, Halfling vb.) (TAMAMLANDI)
- [x] 5e Kural Denetçisi onayı (`docs/rules-audit/faz1-01-karakter-cekirdegi.md`) (ONAYLANDI)
- [x] Karakter oluşturma ve canlı türetilmiş stat arayüzü (`CharacterCreator.tsx`) (TAMAMLANDI)
- [x] Tüm birim, kural ve E2E testleri yeşil (`npm test` 31/31 passed, `npm run e2e` 9/9 passed) (TAMAMLANDI)

---

## 2. Açık Görevler
- **Faz 2 Onayı Bekleniyor:** Faz 2: Kaynak Takibi (HP ve geçici HP, Short/Long Rest döngüsü, büyü slotları tablosu)

---

## 3. Tamamlanan Görevler
- **Görev 0.1 (`faz0-01-temel-iskelet`):** Vite + React + TS + PWA + Vitest + Playwright temel iskeleti.
- **Görev 1.1 (`faz1-01-karakter-cekirdegi`):**
  - Mimar: `docs/decisions/faz1-01-karakter-cekirdegi.md`
  - Kural Denetçisi: `docs/rules-audit/faz1-01-karakter-cekirdegi.md` (23 kural testi yeşil)
  - Geliştirici: `src/rules/` saf fonksiyonları ve `src/components/CharacterCreator.tsx`
  - Doğrulayıcı: `docs/qa/faz1-01-karakter-cekirdegi.md` (9/9 Playwright E2E yeşil)
  - Git Commit: `faz1: karakter cekirdegi ve srd 5.1 kural motoru tamamlandi`

---

## 4. Son Sonuçlar ve Kanıtlar
- **Birim & Kural Testleri (`npm test`):** 31 passed, 0 failed.
- **E2E Testleri (`npm run e2e`):** 9 passed, 0 failed.
- **Ekran Görüntüleri:**
  - `docs/qa/screenshots/character_desktop__1440x900_.png`
  - `docs/qa/screenshots/character_tablet__768x1024_.png`
  - `docs/qa/screenshots/character_mobile_phone__390x844_.png`

---

## 5. Bilinen Sorunlar ve Riskler
- Bilinen açık sorun veya kural uyuşmazlığı bulunmamaktadır.

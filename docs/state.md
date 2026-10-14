# Proje Durumu (State)

- **Mevcut Faz:** V2 - Modern Karakter Kağıdı, Ölüm Zarları ve DM Hub (Tamamlandı)
- **Tur Sayısı:** 2 / 40
- **Son Güncelleme:** 2026-10-15
- **Faz Durumu:** 12 Maddelik Kullanıcı İstekleri Paketi Eksiksiz Tamamlandı ve Mühürlendi

---

## 1. Tamamlanan Fazlar ve Güncellemeler
- **Faz 0:** Temel İskelet (Vite, React, TypeScript, PWA, Vitest, Playwright 3 viewport).
- **Faz 1:** Karakter Çekirdeği (SRD 5.1 Statlar, ırk, sınıf, HP, AC formülleri).
- **Faz 2:** Kaynak Takibi & Polhedral Zarlar (d4–d100 animasyonlu zar tepsisi, HP kalkanı, dinlenme, büyü slotları, ses efektleri).
- **Faz 3:** Envanter ve Büyüler (50 büyü, 50 eşya, JSON şema doğrulaması, STR x 15 taşıma kapasitesi, büyü hazırlama).
- **Faz 4:** Sınıf Özellikleri ve Durumlar (15 SRD durumu, 12 alt sınıf, seviye atlama modalı).
- **Faz 5:** Kampanya ve Canlı Senkron (6 haneli davet kodu, DM parti takip kokpiti, oyuncu salt-okunur modu, BroadcastChannel realtime senkron).
- **V2 Modernizasyonu (12 Madde):**
  1. Üst bar temizliği ("dnd 5e takip", "pwa hazır", "sistem okey" kaldırıldı).
  2. Hero alanı kaldırıldı ("Faz 2 kaynak takibi" ve "d20 at" silindi).
  3. Google tarzı çoklu zar havuzu (örn: 4d6, 8d8, döküm ve toplam) + otomatik skill/spell hasar zarı ve slot düşme opsiyonu.
  4. Tipografi: Büyük İngilizce kelimelerde Latin 'I' standardı.
  5. Tüm ekranlardan "Faz" ibaresi kaldırıldı.
  6. D&D Beyond tarzı 3 sütunlu az kaydırmalı tek sayfa karakter kağıdı (`ModernCharacterSheet`).
  7. Ana Sayfa Hub portali (`HomeHub`) ve üst gezinme çubuğu.
  8. Ölüm Kurtarma Zarları (`DeathSaves`, 3 başarı/3 başarısızlık, d20 kuralları).
  9. DM Ekranı 2.0 (Tüm statlar, statlar ↔ beceriler görünüm geçişi, Pasif İnceleme, özel HP girişi, stacklenebilir debufflar).
  10. Stat kilitleme koruması (Kazara değişikliklere karşı kilitli mod).
  11. Open5e API entegrasyonu ve zenginleştirilmiş yerel SRD kütüphanesi.
  12. Sistem sağlığı ve yol haritası teşhis kartları arayüzden kaldırıldı.

---

## 2. Test Sonuçları ve Metrikler
- **Birim & Kural Testleri (`npm test`):** 101 passed, 0 failed (22 test dosyası).
- **İçerik Şema Doğrulaması (`npm run content:validate`):** %100 uyumlu.
- **E2E Testleri (`npm run e2e`):** 24 passed, 0 failed (Mobile 390x844, Tablet 768x1024, Desktop 1440x900).
- **Kural Denetçisi Onayları:** `docs/rules-audit/v2-modern-character-sheet-and-dm-hub.md` (ONAYLANDI).
- **Kalite Güvence (QA) Raporları:** `docs/qa/v2-modern-character-sheet-and-dm-hub.md` (ONAYLANDI).

# D&D 5e Kampanya Takip Uygulaması: Yol Haritası

## Faz 0: Temel (İskelet)
- **Kapsam:** Repo kurulumu, Vite/React/TypeScript, PWA altyapısı, Supabase istemci katmanı, Vitest + Playwright test altyapısı, CI iş akışı.
- **Bitiş Kriteri:** Boş bir sayfa telefonda PWA olarak kurulabiliyor, `npm test` ve `npm run e2e` yeşil.

## Faz 1: Karakter Çekirdeği
- **Kapsam:** Karakter oluşturma (ırk, sınıf, seviye, temel nitelikler, türetilmiş değerler: ustalık bonusu, AC, HP).
- **Bitiş Kriteri:** 5e Kural Denetçisi, seviye 1–20 için ustalık bonusu ve yetenek modifikatörlerini doğrular (`tests/rules/` yeşil).

## Faz 2: Kaynak Takibi
- **Kapsam:** HP ve geçici HP, Short Rest / Long Rest döngüsü, sınırlı kullanım yetenekleri, büyü slotları (tam ve yarı büyücü tablosu dahil).
- **Bitiş Kriteri:** Long rest sonrası tüm kaynaklar doğru sıfırlanır, testle kanıtlı.

## Faz 3: Envanter ve Büyüler
- **Kapsam:** Eşya slotları (kuşanma, taşıma kapasitesi), büyü listesi, hazırlanan büyüler, açık lisanslı ikonlar.
- **Bitiş Kriteri:** İçerik Ajanı 50 büyü ve 50 eşya ekler, JSON şema doğrulaması (`npm run content:validate`) geçer.

## Faz 4: Sınıf Özellikleri ve Durumlar
- **Kapsam:** Alt sınıflar, pasif/aktif yetenekler, koşullu durumlar (zehirli, korkmuş vb.), seviye atlama akışı.
- **Bitiş Kriteri:** Seviye atlama yeni özellikleri ve slotları otomatik ekler.

## Faz 5: Kampanya ve Canlı Senkron
- **Kapsam:** Davet kodu, DM paneli (tüm karakterleri görme/düzenleme), oyuncu salt-okunur görünümü, realtime güncelleme, Supabase RLS.
- **Bitiş Kriteri:** İki farklı tarayıcıda değişiklik anında yansır, RLS testleri geçer.

## Faz 6: Cila
- **Kapsam:** Mobil düzen optimizasyonu, çevrimdışı önbellek desteği, 3D/hızlı zar atıcı, oturum notları.
- **Bitiş Kriteri:** PWA çevrimdışı açılır, responsive ve erişilebilir deneyim onaylanır.

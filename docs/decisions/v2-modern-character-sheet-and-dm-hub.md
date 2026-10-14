# Mimari Karar Kaydı: V2 Modern Karakter Kağıdı, DM Hub ve Zar Sistemi

## 1. Bağlam ve Kullanıcı İstekleri
Kullanıcı, Faz 0–5 boyunca inşa edilen altyapıyı tek sayfa kaydırmalı prototip görünümünden çıkarıp gerçek D&D Beyond seviyesinde, ergonomik, profesyonel bir web uygulamasına dönüştürmek için 12 maddelik kapsamlı bir geliştirme talep etmiştir.

## 2. Mimari Kararlar

### A. Sayfa Mimarisi & Ana Sayfa Hub'ı (Maddeler 1, 2, 5, 7, 12)
- Geçici "Faz X" ibareleri, PWA hazır rozetleri, sistem sağlığı ve faz yol haritası kartları arayüzden kaldırılır.
- Üst gezinme çubuğu (Header Nav) ve Ana Sayfa Hub'ı oluşturulur:
  - `home`: Karşılama ve hızlı eylem kartları (Karakter Aç, Yeni Karakter Yarat, DM Ekranı, Zarlar, Kampanya).
  - `sheet`: Otantik, sekmeli ve az kaydırmalı Karakter Kağıdı.
  - `creator`: Karakter Oluşturma Sihirbazı (kayıt sonrası kilit mekanizmalı).
  - `dm`: Gelişmiş DM Kokpiti (tüm statlar, beceriler, pasif inceleme, özel HP, stacklenen durumlar).
  - `dice`: Google tarzı çoklu zar atma havuzu (6d8, 4d6 vb.) ve geçmişi.

### B. Otantik Karakter Kağıdı & Death Saves (Maddeler 6, 8, 10)
- 3 Sütunlu / Sekmeli düzen:
  - **Sol Sütun:** 6 Ana Stat (STR, DEX, CON, INT, WIS, CHA), Kurtarma Zarları, Pasif Algı (Perception) & Pasif İnceleme (Investigation), 18 Beceri Listesi.
  - **Üst/Merkez:** HP Kalkanı, Temp HP, Can Zarları ve **Ölüm Kurtarma Zarları (Death Saves - 3 Başarı / 3 Başarısızlık, d20 kuralları)**.
  - **Sekmeler:** Eylemler & Silahlar, Büyü Kitabı, Envanter & Taşıma Kapasitesi, Durumlar, Sınıf Özellikleri & Seviye Atlama.
- **Stat Kilidi:** Karakter sayfası kilitli modda başlar; rastgele tıklamalar statları değiştirmez. Yalnızca Seviye Atlama ASI veya kilit açma düğmesiyle düzenlenebilir.

### C. Çoklu Zar Havuzu & Büyü/Skill Zar Otomasyonu (Madde 3, 4)
- Google Dice Roller benzeri çoklu zar ekleme (örn: 1d20 + 2d6 + 4d8).
- Her bir zarın düşen değerini tek tek gösterme (`[4, 6, 2, 5]`) ve toplamı hesaplama.
- Büyü veya skill detayında "🎲 Hasar Zarı At" butonu ile otomatik zar tepsisine gönderme ve büyü slotunu otomatik düşürme seçeneği.
- Büyük harf tipografisinde Türkçedeki noktalı İ yerine Latin I kullanımı.

### D. Gelişmiş DM Ekranı 2.0 (Madde 9)
- Karakter kartlarında tüm 6 yetenek skoru kompakt chip olarak görüntülenir.
- Görünüm düğmesi: Ana Statlar ↔ Beceriler (Insight, Stealth, Athletics, Perception...).
- Pasif Algı + Pasif İnceleme desteği.
- Stacklenebilir ve çoklu seçilebilir durum/debuff kütüphanesi.
- Özel girilebilir (+/- Custom HP) şık can kontrol paneli.

### E. Open5e API & Genişletilmiş Çevrimdışı Kütüphane (Madde 11)
- `src/data/open5eClient.ts`: Canlı Open5e v1/v2 API'sine istek atan, çevrimdışı olduğunda zengin yerel SRD kütüphanesine (50 büyü, 50 eşya, 18 beceri, 12 alt sınıf) sorunsuz düşen hibrit içerik katmanı.

# D&D 5e Kampanya Takip Uygulaması: Yol Haritası ve Görev Listesi

## Tamamlanan Fazlar
- [x] **Faz 0: Temel (İskelet)** (Vite, React, TypeScript, PWA, Vitest, Playwright, Supabase altyapısı)
- [x] **Faz 1: Karakter Çekirdeği** (SRD 5.1 Statlar, ırk, sınıf, türetilmiş değerler: AC, HP, Ustalık Bonusu)
- [x] **Faz 2: Kaynak Takibi & Polhedral Zarlar** (HP Kalkanı, Dinlenme, Büyü Slotları, Sesli Zar Tepsisi)
- [x] **Faz 3: Envanter ve Büyüler** (50 büyü, 50 eşya, taşıma kapasitesi, büyü kitabı ve hazırlık sınırı)
- [x] **Faz 4: Sınıf Özellikleri ve Durumlar** (15 SRD durumu, 12 alt sınıf, seviye atlama modalı)
- [x] **Faz 5: Kampanya ve Canlı Senkron** (Davet kodu, DM paneli, realtime broadcast senkronizasyonu)

---

## 📋 V2 İstekler ve Geliştirme Listesi (12 Madde)

1. [ ] **Üst Başlık Temizliği:** "D&D 5e Takip", PWA hazır ve Sistem OK kalabalık rozetlerinin kaldırılması.
2. [ ] **Hero Alanı Temizliği:** "Faz 2 Kaynak Takibi" ve "d20 At" butonunun bulunduğu geçici karşılama alanının kaldırılması.
3. [ ] **Google Tarzı Çoklu Zar Tepsisi & Büyü/Skill Entegrasyonu:**
   - Çoklu zar atma havuzu (örn: 6d8, 4d6, 2d20 havuzu oluşturup tek tek zarların değerlerini ve genel toplamı gösterme).
   - "Use Skill / Büyü Kullan" seçeneğinde skill/büyü hasarı için tek tuşla otomatik zar atma ve isteğe bağlı büyü slotundan otomatik düşme (hem manuel hem otomatik mod).
4. [ ] **Tipografi & Büyük Harf Düzeltmesi:** İngilizce başlıklarda/kelimelerde Türkçedeki noktalı büyük İ yerine büyük I kullanımı ve tipografi standartlaştırması.
5. [ ] **Faz İfadelerinin Kaldırılması:** Arayüzdeki tüm başlıklardan ve kartlardan "Faz 1", "Faz 2", "Faz 3" vb. ifadelerinin kaldırılması.
6. [ ] **D&D Beyond Tarzı Tek Sayfa Karakter Kağıdı:** Uzun dikey kaydırma yerine derli toplu, sekmeli/sütunlu gerçek D&D 5e karakter kağıdı ergonomisi.
7. [ ] **Ana Sayfa (Hub / Portal) & Sayfa Geçişleri:**
   - Ana Sayfa: Karakter Kağıdı Aç, Yeni Karakter Oluştur, Kampanya & DM Ekranı, Kampanyaya Katıl.
   - Her modülün temiz ve bağımsız bir görünümde açılması.
8. [ ] **Ölüm Kurtarma Zarları (Death Saves):**
   - 3 Başarı / 3 Başarısızlık pipsi, HP 0 olduğunda gerici/dikkat çekici tasarım, tek tuşla d20 Death Save atma (1=2 fail, 20=1 HP ile kalkış).
9. [ ] **Gelişmiş DM Ekranı:**
   - Karakter kartlarında tüm statların (STR, DEX, CON, INT, WIS, CHA) doğrudan görünmesi ve tıklanıp detaylandırılabilmesi.
   - Görünüm değiştirici: Ana Statlar ↔ Beceriler (Athletics, Stealth, Perception, Insight vb.).
   - Pasif Algı'nın yanına Pasif İnceleme (Passive Investigation) eklenmesi.
   - Çoklu stacklenebilir tüm durumlar/debuff seçici.
   - Özel girilebilir (+/- Custom HP) şık can kontrol paneli.
10. [ ] **Otantik Karakter Kağıdı Estetiği & Stat Kilitleme:**
    - Karakter oluşturulduktan sonra statların kilitlenmesi; sadece seviye atlandığında (ASI) veya düzenleme modunda değiştirilebilmesi.
11. [ ] **Open5e API & Kapsamlı İçerik Kütüphanesi:**
    - Open5e API entegrasyonu ve zengin yerel SRD veri kütüphanesi (büyüler, eşyalar, canavarlar ve özellikler için tam erişim).
12. [ ] **Sistem Sağlığı ve Faz İlerlemesi Kartlarının Kaldırılması:** Arayüzden teşhis kartlarının temizlenmesi.
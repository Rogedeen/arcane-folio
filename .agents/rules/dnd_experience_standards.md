# 🐉 D&D BEYOND KILLER — DENEYİM & KURAL STANDARTLARI (UX MANİFESTOSU)

Bu doküman, projede geliştirilen tüm bileşenlerin uymak ZORUNDA olduğu temel kural ve standartları tanımlar. Geliştirici veya agent, bu standartları kullanıcı tekrar tekrar belirtmek zorunda kalmadan varsayılan olarak uygulamalıdır.

---

## 1. 💀 HP = 0 Olduğunda Sinematik Death Save Modu
- Karakterin Canı (HP) 0 olduğunda karakter kağıdı **"Ölüm Eşiği (Dying)"** acil durum moduna geçer.
- Ekran kararır, kenarlardan kırmızı nabız (heartbeat vignette) efekti atar.
- Normal eylemler kilitlenir; ekranda belirgin, dramatik bir **"Ölüm Kurtarma Zarı At (Death Saving Throw)"** arayüzü öne çıkar.
- Butona basıldığında ekranda fiziksel bir d20 zarı yuvarlanarak gelir, yavaşlayıp durur ve sonucu net bir şekilde açıklar:
  * **Doğal 20:** Karakter 1 HP ile anında bilincine kavuşur!
  * **10 - 19:** Başarı (1 başarı işareti yanar). 3 başarı = Stabilize.
  * **2 - 9:** Başarısızlık (1 başarısızlık işareti yanar).
  * **Doğal 1:** 2 başarısızlık birden eklenir! 3 başarısızlık = Karakter Ölümü (Dead).

---

## 2. 🎒 Envanter & Ekipman & Mağaza Ayrımı
- Envanter iki net bölüme ayrılır:
  1. **"Çantam (Mevcut Eşyalar)":** Karakterin üzerindeki eşyalar. Kuşanılmış (`Equipped`), Kuşanılmamış, miktar artır/azalt, çantadan at (`Drop`).
  2. **"Eşya Ekle (Katalog / Mağaza)":** Open5e API ve yerel veriden arama yaparak tek tıkla çantaya eşya ekleme.
- **AC Entegrasyonu:** Kuşanılan zırh (Deri, Zincir, Plaka vb.) veya kalkan, karakterin AC değerini anında kural motoruna göre yeniden hesaplar ve kağıda yansıtır.
- **Silah Entegrasyonu:** Kuşanılan silahlar doğrudan "Eylemler" sekmesine düşer; hasar zarı (örn: 1d8), hasar türü (Slashing, Piercing), saldırı bonusu ve menzili açıkça yazar.

---

## 3. 🎲 Zarların Gerçekçi & Fiziksel Hissiyatı
- Zarlar kuru bir sayı üretmek yerine görsel olarak tatmin edici olmalıdır.
- **Hasar Zarı Animasyonu:** Hasar butonuna basıldığında formül (örn: `2d6`), yerinde yuvarlanan zar animasyonuna dönüşür, toplam sayıya dönüşür, ardından hafifçe yana kayarak silik bir referans olarak durur.
- **D20 Atışları:** Fiziksel dönme ve yavaşlayıp durma hissi, Doğal 20'de altın parıltı, Doğal 1'de kafatası uyarısı.

---

## 4. 🧙 Sınıfa Özgü Akıllı Arayüz (Smart Class Layout)
- **Büyücü Olmayan Sınıflar (Fighter, Barbarian, Rogue, Monk):**
  * Bu sınıfların ana kağıdında büyü sekmesi YERİNE **"Sınıf Yetenekleri (Features & Traits)"** sekmesi yer alır.
  * *Second Wind, Action Surge, Rage, Sneak Attack, Ki Puanları* gibi sınıfa has kaynaklar ve butonlar ön plandadır.
  * Yalnızca büyücü alt sınıflar (Eldritch Knight, Arcane Trickster) veya büyücü sınıflar (Wizard, Sorcerer, Cleric, Druid, Bard, Warlock, Paladin, Ranger) büyü sekmesini görür.

---

## 5. 🛡️ Anti-AI Slop Manifestosu ve "Modern Arcane Folio" Tasarım Sistemi
- **Kesin Yasaklar:**
  * ❌ Mor-mavi / indigo gradientler, neon parıltılar, düz jenerik koyu SaaS temaları KESİNLİKLE YASAKTIR.
  * ❌ Her elemana tek tip `border-radius: 12px` verip yan yana simetrik kutular dizmek YASAKTIR.
  * ❌ Jenerik pazarlama klişeleri ("Geleceği inşa edin", "Tapestry", "Delve into" vb.) KESİNLİKLE KULLANILMAZ.
- **Modern Arcane Folio (Büyülü Kitaplık) Konsepti:**
  * **Renk Paleti (Dungeon Dark):**
    * Ana Zemin: Derin Sıcak Deri Koyu Mod (`#14100E`).
    * Kart / Panel Zemini: Mat Barut & Zırh Demiri (`#1F1A17` / `#26201C`).
    * Birincil Aksan: Ejderha Kırmızısı / Crimson Dragon Red (`#8C2D19`).
    * İkincil Aksan & Kenarlıklar: Antik Bronz / Eskitilmiş Altın (`#C89B3C`).
    * Ana Metin: Kemik Beyazı (`#E6E1DA`), Sessiz Metin: Yıpranmış Kömür (`#8C827A`).
  * **Aydınlık Mod (Parchment Light):**
    * Sıcak Mat Parşömen (`#F5F0EB`), Antik Parşömen Kart (`#EAE3D9`), Mürekkep Siyahı Metin (`#1C1817`).
  * **Çift Tipografi Sistemi:**
    * Başlıklar, Karakter İsimleri ve Önemli Etiketler: `Cinzel` veya `MedievalSharp` (Fantasy Display Serif).
    * İstatistikler, Tablolar, Veriler ve Girdiler: `Plus Jakarta Sans` veya `Spectral` (Yüksek okunabilirlikli fonksiyonel font).
  * **Dokunsal Mikro Detaylar:**
    * 1px net bronz metalik çizgiler (`border: 1px solid #C89B3C40`), köşeler maksimum `4px - 6px`.
    * Stat kartları jenerik SaaS kutusu yerine pirinç döküm / oyma plaka görünümünde.
    * Tıklanabilir butonlarda dokunsal basılma efekti (`active: translateY(1px)`).

---

## 6. 🏆 Seviye Atlama Sihirbazı (Level-Up Wizard & Progression)
- Seviye atlandığında adım adım sihirbaz açılır:
  1. **HP Artışı:** Can zarı at (Hit Die) veya kural ortalamasını al + CON bonusu.
  2. **Alt Sınıf (Subclass) Seçimi:** Seviye 3'te (veya Cleric/Warlock/Sorcerer için 1-2'de) alt sınıf seçilir. Alt sınıf modülerdir; örneğin Fighter -> Eldritch Knight veya Rogue -> Arcane Trickster seçildiğinde karaktere büyü yuvaları (Spell Slots), büyü sekmesi ve Int büyücülüğü otomatik açılır!
  3. **Stat Artışı (ASI) veya Hüner (Feat) Seçimi:** (4, 8, 12, 16, 19. seviyelerde) +2 tek stat veya +1 iki stat seçimi ya da listelenen Feat'lerden (Great Weapon Master, War Caster, Alert, Sharpshooter vb.) biri seçilir.
  4. **Geçmiş Hikayesi & Kişilik (Backstory):** Karakter geçmişi, idealleri, kusurları seviye atlama veya düzenleme esnasında güncellenebilir.

---

## 7. ⚔️ DM Karşılaşma & İnisiyatif Takipçisi (Encounter & Initiative Tracker)
- DM ekranında Open5e API'den anında canavar/yaratık arama ve masaya ekleme (`/v2/creatures/`).
- Partideki oyuncuların canı (HP), AC'si ve Pasif Algısı (Passive Perception) canavarlarla aynı inisiyatif listesinde sıralanır.
- Otomatik veya manuel inisiyatif zarı atma; en yüksekten en düşüğe tur sırası (Turn Order).
- "Sonraki Tur (Next Turn)" ve "Tur Sayacı (Round Counter)" ile aktif oyuncu/canavar vurgulanır.
- Canavarlara tek tıkla hasar verme, iyileştirme, durum (Condition) uygulama.

---

## 8. 📜 Kural Seti Önceliği: 2014 PHB
- 2024 kuralları (Weapon Mastery vb.) henüz devreye sokulmaz; öncelikle 2014 5e kuralları eksiksiz ve pürüzsüz uygulanır.

---

## 9. 🚀 Katı Branch İş Akışı (Dev -> Main Kuralı)
- **Asla doğrudan `main` branch'ine commit/push yapılmaz.**
- Her geliştirme turunun veya özelliğin tamamlanmasının ardından:
  1. `npx tsc --noEmit` ile TypeScript kontrolü yapılır (0 hata zorunlu).
  2. `npx vitest run` ile tüm birim ve entegrasyon testleri çalıştırılır (tümü başarılı olmalıdır).
  3. Yapılan tüm değişiklikler anlamlı bir commit mesajıyla `dev` branch'ine commit'lenir ve GitHub uzak sunucusuna (`git push origin dev`) push edilir.
  4. Yalnızca kullanıcı onayından sonra ve testler tamamsa `dev` branch'i `main`'e merge edilir. Böylece canlıdaki (production) kullanıcılar hiçbir zaman kararsız sürümle karşılaşmaz.


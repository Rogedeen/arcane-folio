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

## 5. 👁️ Okunabilirlik, Tipografi ve Gerçekçi Fantezi Paleti
- Zifiri siyah (#000000) ve aşırı yüksek kontrastlı neon renklerden kaçınılır.
- Derin barut grisi / koyu lacivert zemin (`#0f172a`, `#1e293b`), antik parşömen beji tonları, okunaklı krem/beyaz tipografi (`#f1f5f9`, `#e2e8f0`).
- Başlıklar zarif `Cinzel`, gövde ve istatistikler net ve ferah `Inter`.
- Bütün tıklanabilir kartlar ve butonlar belirgin hover/active durumlarına sahip olmalıdır.

---

## 6. 🏆 Seviye Atlama Sihirbazı (Level-Up Wizard)
- Seviye atlandığında sadece sayı artmaz; adım adım bir sihirbaz açılır:
  1. HP Artışı (Can zarı at veya sınıf ortalamasını al + CON mod).
  2. Yeni kazanılan sınıf özellikleri özeti.
  3. Büyücü ise yeni büyü seçimi / slot artışı.
  4. Yetenek puanı artışı (ASI) veya Feat seçimi (4, 8, 12, 16, 19. seviyeler).

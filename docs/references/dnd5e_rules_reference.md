# 📖 D&D 5E TAM KURAL KILAVUZU VE MOTOR STANDARTLARI (2014 & 2024)

Bu belge, **ArcaneFolio 5e** uygulamasının tüm oyun kurallarını, formüllerini ve kısıtlamalarını yöneten resmi referans belgesidir. Sistem geliştirmeleri bu kuralları ihlal edemez.

---

## 1. BÜYÜ HAZIRLAMA VE SEVİYE ERİŞİM KURALI (SPELL LIMITS)

### A. Karakter Seviyesine Göre Maksimum Büyü Seviyesi (Max Castable Spell Level)
Bir karakter, sahip olduğu sınıf seviyesinin izin verdiği büyü yuvası (spell slot) seviyesinin üzerindeki büyüleri **asla göremez, hazırlayamaz ve arayamaz**:

1. **Tam Büyücüler (Full Casters - Wizard, Cleric, Druid, Sorcerer, Bard):**
   - Formül: `Math.min(9, Math.ceil(level / 2))`
   - Seviye 1-2: Yalnızca **Cantrip (0)** ve **1. Seviye**
   - Seviye 3-4: Maksimum **2. Seviye** (Örn: 3. seviye büyücü 3. seviye Fireball'u göremez!)
   - Seviye 5-6: Maksimum **3. Seviye**
   - Seviye 7-8: Maksimum **4. Seviye**
   - Seviye 9-10: Maksimum **5. Seviye**
   - Seviye 11-12: Maksimum **6. Seviye**
   - Seviye 13-14: Maksimum **7. Seviye**
   - Seviye 15-16: Maksimum **8. Seviye**
   - Seviye 17-20: Maksimum **9. Seviye** (Wish, Meteor Swarm vb. yalnızca Seviye 17+)

2. **Yarım Büyücüler (Half Casters - Paladin, Ranger):**
   - Seviye 1: Büyü yok (0)
   - Seviye 2-4: Maksimum 1. Seviye
   - Seviye 5-8: Maksimum 2. Seviye
   - Seviye 9-12: Maksimum 3. Seviye
   - Seviye 13-16: Maksimum 4. Seviye
   - Seviye 17-20: Maksimum 5. Seviye

3. **Üçte Bir Büyücüler (One-Third Casters - Eldritch Knight Fighter, Arcane Trickster Rogue):**
   - Seviye 1-2: Büyü yok (0)
   - Seviye 3-6: Yalnızca **Cantrip** ve **1. Seviye** (3. seviye Savaşçı sadece 1. seviye büyü yapabilir!)
   - Seviye 7-12: Maksimum 2. Seviye
   - Seviye 13-18: Maksimum 3. Seviye
   - Seviye 19-20: Maksimum 4. Seviye

4. **Warlock (Pact Magic):**
   - Formül: `Math.min(5, Math.ceil(level / 2))`
   - Warlock slotları her zaman en yüksek seviyeden harcanır (Kısa dinlenmede yenilenir). 6-9. seviye büyüler Mystic Arcanum ile günde 1 kez kullanılır.

### B. Günlük Hazırlanabilir Büyü Sayısı
- **Wizard:** `Seviye + Zeka Modifikatörü` (En az 1)
- **Cleric & Druid:** `Seviye + Bilgelik Modifikatörü` (En az 1)
- **Paladin:** `Math.floor(Seviye / 2) + Karizma Modifikatörü` (En az 1)
- **Cantripler (0. Seviye):** Hazırlık kotasından düşmez, sınırsız kullanılır.

---

## 2. ENVANTER VE ZIRH KURALLARI (INVENTORY & ARMOR)

1. **Tek Zırh Kuralı:** Bir karakter aynı anda yalnızca **1 adet zırh** ve **1 adet kalkan** kuşanabilir. Yeni zırh kuşanıldığında eskisi otomatik çıkarılır.
2. **Zırh Sınıfı (AC):**
   - Zırhsız: `10 + DEX mod` (Barbar: `+ CON mod`, Keşiş: `+ WIS mod`)
   - Hafif Zırh: `Taban AC + DEX mod`
   - Orta Zırh: `Taban AC + Math.min(2, DEX mod)`
   - Ağır Zırh: `Taban AC` (DEX bonusu eklenmez)
   - Kalkan: `+2 AC`

---

## 3. CAN VE ÖLÜM KURALLARI (HP & DEATH SAVES)

1. **HP = 0:** Karakter bilincini kaybeder (Unconscious).
2. **Ölüm Kurtarma Zarları (Death Saves - Tur Başında 1d20):**
   - **1:** 2 Başarısızlık
   - **2-9:** 1 Başarısızlık
   - **10-19:** 1 Başarı
   - **20:** Anında 1 Can Puanı kazanır ve bilinci yerine gelir!
   - **3 Başarı:** Karakter stabilize olur.
   - **3 Başarısızlık:** Karakter ölür.
3. **0 Can İken Hasar:** Doğrudan 1 başarısızlık (5 fit mesafeden kritik vuruş 2 başarısızlık sayılır).

---

## 4. 2014 VE 2024 KURAL SETİ FARKLILIKLARI

| Özellik | 2014 Kural Seti (PHB 2014) | 2024 Yenilenmiş Kural Seti (PHB 2024) |
|---|---|---|
| **Alt Sınıf (Subclass) Seçimi** | Sınıfa göre 1, 2 veya 3. seviyede | **İstisnasız her sınıf 3. seviyede seçer** |
| **Arka Plan (Background)** | Sosyal/rol yapma özelliği verir | Stat artışı (+2/+1) ve **Origin Feat** verir |
| **Silah Ustalığı (Weapon Mastery)** | Yalnızca standart özellikler | Savaşçı sınıflar silaha özel ustalık uygular (Nick, Vex, Graze, Topple vb.) |
| **Tükenmişlik (Exhaustion)** | 6 ölümcül basamak | Seviye başına tüm zarlara -1 (10'da ölüm) |
| **Kahramanlık İlhamı (Heroic Inspiration)** | Avantaj zarı verir | Atılan herhangi bir zarı yeniden attırır |

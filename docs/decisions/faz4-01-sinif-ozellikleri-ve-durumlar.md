# Mimari Karar Kaydı: Faz 4 - Sınıf Özellikleri, Durumlar ve Seviye Atlama

## 1. Bağlam
D&D Beyond benzeri bir kampanya asistanında savaş ve rol yapma dinamizmini sağlayan en kritik iki yapı taşı:
1. Karakterin anlık savaş koşulları (Conditions: Poisoned, Blinded, Restrained, Prone vb.) ve bu durumların getirdiği mekanik avantaj/dezavantajlar.
2. Karakterin 1. seviyeden 20. seviyeye kadar SRD 5.1 standartlarında seviye atlaması (Level Up), alt sınıf seçimi ve sınıf özelliklerinin açılması.

## 2. Karar
1. **Durum Motoru (`src/rules/conditions.ts`):**
   - 15 adet SRD 5.1 durumu: `blinded`, `charmed`, `deafened`, `frightened`, `grappled`, `incapacitated`, `invisible`, `paralyzed`, `petrified`, `poisoned`, `prone`, `restrained`, `stunned`, `unconscious`, `exhaustion`.
   - Her bir durumun Türkçe adı, simgesi, mekanik açıklaması ve sistem etkisi (hız 0, dezavantaj, avantaj, otomatik başarısızlık) tanımlanır.
2. **Alt Sınıf Motoru (`src/rules/subclasses.ts`):**
   - 12 temel sınıfın SRD 5.1 açık kaynak alt sınıfları (Champion, Berserker, Evocation, Thief, Life Domain, Hunter, Oath of Devotion, College of Lore, Circle of the Land, Way of the Open Hand, Draconic Bloodline, The Fiend) tanımlanır.
   - Her sınıfın alt sınıf seçme seviyesi (Cleric/Sorcerer/Warlock: 1. seviye; Druid/Wizard: 2. seviye; diğerleri: 3. seviye) kurala bağlanır.
3. **Seviye Atlama Mantığı (`src/rules/levelUp.ts`):**
   - Seviye arttıkça Maksimum Can (HP), Can Zarı (Hit Dice), Ustalık Bonusu (Proficiency Bonus) ve büyücü ise Büyü Slotları anında güncellenir.
   - Ortalama Can artışı: `(HitDie / 2 + 1) + CON mod`.
4. **Kullanıcı Arayüzü:**
   - `ConditionsTracker.tsx`: Karakter üzerinde aktif koşulları tek tıkla açıp kapatma rozetleri. Aktif koşullarda kırmızı parıltı ve etki özeti.
   - `LevelUpModal.tsx`: Seviye atlama modalı; yeni seviye, HP artışı seçimi (ortalama veya zar atımı) ve alt sınıf seçim paneli.

## 3. Sonuçlar
- Karakterler dinamik olarak savaştaki zayıflatıcı/güçlendirici durumları takip edebilir.
- Oyuncular tek tuşla seviye atlayarak güncel stat ve slotlarına kavuşur.
- Mobil ve masaüstü arayüz dokunmatik hedeflerine ve 0 yatay taşma şartına tam uygundur.

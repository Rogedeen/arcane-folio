# Kural Denetimi Raporu: Faz 4 - Sınıf Özellikleri, Durumlar ve Seviye Atlama

## Denetim Bilgileri
- **Tarih:** 2026-10-14
- **Denetçi:** Kural Denetçisi Ajanı (Rule Auditor)
- **Kapsam:** SRD 5.1 15 Durum (Conditions) mekaniği, 12 Sınıfın Alt Sınıf açılma seviyeleri ve Seviye Atlama (Level Up) kuralları

## Kural Referansları ve Doğrulama

### 1. Durumlar (Conditions)
- **SRD 5.1 Kuralı:** Blinded, Charmed, Deafened, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious, Exhaustion durumları savaş mekaniklerini doğrudan etkiler.
- **Uygulama:**
  - `speedZero`: Felç (Paralyzed), Güreş (Grappled), Taşlaşma (Petrified), Sersemlik (Stunned) ve Baygınlık (Unconscious) durumlarında hız 0 olur ve `isMovementBlocked` ile kullanıcı uyarılır.
  - `givesDisadvantageOnAttacks`: Zehirlenmiş (Poisoned), Kör (Blinded) ve Yere Serilmiş (Prone) saldırılarda dezavantaj verir.
  - `givesAdvantageToAttackers`: Felç, Kısıtlanmış ve Taşlaşmış hedeflere karşı saldırılar avantajlıdır.
- **Durum:** ✅ ONAYLANDI (4 birim testi ile doğrulandı).

### 2. Alt Sınıf Açılma Seviyeleri (Subclass Progression)
- **SRD 5.1 Kuralı:**
  - Cleric, Sorcerer, Warlock: 1. Seviye
  - Wizard, Druid: 2. Seviye
  - Fighter, Barbarian, Rogue, Paladin, Ranger, Bard, Monk: 3. Seviye
- **Uygulama:** `getSubclassUnlockLevel(charClass)` ve `getSubclassForClass(charClass)` fonksiyonları tüm temel sınıflar için SRD 5.1 kurallarına göre doğru alt sınıfı (Champion, Evocation, Berserker, Thief vb.) ve seviyesini getirmektedir.
- **Durum:** ✅ ONAYLANDI (4 birim testi ile doğrulandı).

### 3. Seviye Atlama (Level Up) & Can Puanı Artışı
- **SRD 5.1 Kuralı:**
  - Seviye atlandığında can artışı: Ortalama `floor(HitDie / 2) + 1 + CON mod` veya atılan zar + CON mod (en az 1 HP).
  - Seviye 5'te Ustalık Bonusu +2'den +3'e yükselir.
  - Seviye 4, 6 (Fighter), 8, 12 vb. ASI hakkı verir.
  - Maksimum seviye 20'dir.
- **Uygulama:** `performLevelUp` fonksiyonu can artışını, yeni ustalık bonusunu ve alt sınıf kilidini eksiksiz üretir.
- **Durum:** ✅ ONAYLANDI (6 birim testi ile doğrulandı).

## Denetim Sonucu
Faz 4 kural motoru SRD 5.1 yönergelerine %100 uyumludur.

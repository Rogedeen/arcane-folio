# D&D 5e SRD Referans Kılavuzu (Kural Denetçisi Kaynağı)

Bu belge, System Reference Document 5.1 ("SRD 5.1", CC-BY-4.0 lisanslı) metninden alınan ve projenin kural motorunun dayandığı resmi referansları içerir. Tüm kural testleri (`tests/rules/`) buradaki bölüm numaralarına dayanmak zorundadır.

---

## Bölüm 1: Yetenek Skorları ve Modifikatörleri (Ability Scores and Modifiers)
- **Kaynak:** SRD 5.1, sf. 76, "Ability Scores and Modifiers"
- **Kural:** Her yetenek skoru bir modifikatöre sahiptir. Modifikatör hesabı şu formüle dayanır:
  $$\text{Modifikatör} = \lfloor(\text{Skor} - 10) / 2\rfloor$$
- **Referans Tablosu:**
  | Skor | Modifikatör | Skor | Modifikatör |
  |---|---|---|---|
  | 1 | -5 | 16–17 | +3 |
  | 2–3 | -4 | 18–19 | +4 |
  | 4–5 | -3 | 20–21 | +5 |
  | 6–7 | -2 | 22–23 | +6 |
  | 8–9 | -1 | 24–25 | +7 |
  | 10–11 | 0 | 26–27 | +8 |
  | 12–13 | +1 | 28–29 | +9 |
  | 14–15 | +2 | 30 | +10 |

---

## Bölüm 2: Ustalık Bonusu (Proficiency Bonus)
- **Kaynak:** SRD 5.1, sf. 15, "Proficiency Bonus"
- **Kural:** Ustalık bonusu karakterin toplam sınıf seviyesine göre belirlenir ve tüm sınıflar için aynı hızda artar:
  $$\text{Proficiency Bonus} = \lfloor(\text{Level} - 1) / 4\rfloor + 2$$
- **Referans Tablosu:**
  - Seviye 1–4: +2
  - Seviye 5–8: +3
  - Seviye 9–12: +4
  - Seviye 13–16: +5
  - Seviye 17–20: +6

---

## Bölüm 3: Zırh Sınıfı (Armor Class - AC)
- **Kaynak:** SRD 5.1, sf. 9, 62–64, "Armor and Shields"
- **Zırhsız (Unarmored):**
  - Standart: $10 + \text{DEX mod}$
  - Barbarian Unarmored Defense: $10 + \text{DEX mod} + \text{CON mod}$ (kalkan takılabilir)
  - Monk Unarmored Defense: $10 + \text{DEX mod} + \text{WIS mod}$ (zırh ve kalkan takılamaz)
- **Hafif Zırh (Light Armor):**
  - Padded: $11 + \text{DEX mod}$
  - Leather: $11 + \text{DEX mod}$
  - Studded Leather: $12 + \text{DEX mod}$
- **Orta Zırh (Medium Armor):**
  - Hide: $12 + \min(2, \text{DEX mod})$
  - Chain Shirt: $13 + \min(2, \text{DEX mod})$
  - Scale Mail: $14 + \min(2, \text{DEX mod})$
  - Breastplate: $14 + \min(2, \text{DEX mod})$
  - Half Plate: $15 + \min(2, \text{DEX mod})$
- **Ağır Zırh (Heavy Armor):**
  - Ring Mail: 14 (DEX mod eklenmez)
  - Chain Mail: 16 (DEX mod eklenmez)
  - Splint: 17 (DEX mod eklenmez)
  - Plate: 18 (DEX mod eklenmez)
- **Kalkan (Shield):** $+2\text{ AC}$

---

## Bölüm 4: Can Puanı (Hit Points - HP) ve Can Zarları (Hit Dice)
- **Kaynak:** SRD 5.1, sf. 12, "Hit Points and Hit Dice"
- **Sınıf Can Zarları:**
  - d12: Barbarian (Sabit ortalama artış: 7)
  - d10: Fighter, Paladin, Ranger (Sabit ortalama artış: 6)
  - d8: Bard, Cleric, Druid, Monk, Rogue, Warlock (Sabit ortalama artış: 5)
  - d6: Sorcerer, Wizard (Sabit ortalama artış: 4)
- **1. Seviye HP:** Sınıf Can Zarı Maksimum Değeri + CON Modifikatörü
- **Sonraki Seviyeler (Seviye 2–20):** 
  - Standart/Ortalama Yöntem: $\text{Seviye Başı Sabit Artış} + \text{CON Modifikatörü}$ (Minimum 1 HP artar)
  - Toplam HP: $\text{Seviye 1 HP} + (\text{Level} - 1) \times \max(1, \text{Sabit Artış} + \text{CON Mod})$

---

## Bölüm 5: Temel Irklar ve Stat Bonusları
- **Kaynak:** SRD 5.1, sf. 3–8, "Races"
- Human: STR +1, DEX +1, CON +1, INT +1, WIS +1, CHA +1
- Elf: DEX +2 (High Elf: INT +1; Wood Elf: WIS +1)
- Dwarf: CON +2 (Hill Dwarf: WIS +1, HP +1/seviye; Mountain Dwarf: STR +2)
- Halfling: DEX +2 (Lightfoot: CHA +1; Stout: CON +1)
- Dragonborn: STR +2, CHA +1
- Gnome: INT +2 (Rock Gnome: CON +1)
- Half-Elf: CHA +2, Oyuncu seçimi iki farklı stat +1
- Half-Orc: STR +2, CON +1
- Tiefling: CHA +2, INT +1

---

## Bölüm 6: Dinlenme Kuralları (Resting)
- **Kaynak:** SRD 5.1, sf. 78, "Resting"
- **Kısa Dinlenme (Short Rest):**
  - En az 1 saat sürer.
  - Karakter sahip olduğu Can Zarlarından (Hit Dice) istediği kadarını harcayarak can doldurabilir.
  - Her harcanan zar için: $\text{Zar Atışı} + \text{CON Modifikatörü}$ kadar HP kazanılır.
  - Warlock büyü slotları (Pact Magic) kısa dinlenme sonunda tamamen sıfırlanır (yenilenir).
- **Uzun Dinlenme (Long Rest):**
  - En az 8 saat sürer (en fazla 24 saatte bir kez yapılabilir).
  - Karakterin Can Puanı (Current HP) maksimum değerine sıfırlanır (tamamen dolar).
  - Geçici Can Puanı (Temporary HP) sıfırlanır.
  - Harcanan can zarlarının yarısı (toplam zar sayısının yarısı, en az 1) geri kazanılır: $\max(1, \lfloor\text{Toplam Can Zarı} / 2\rfloor)$.
  - Tüm harcanan büyü slotları (Spell Slots) tamamen sıfırlanır (yenilenir).

---

## Bölüm 7: Geçici Can Puanı (Temporary HP) ve Hasar Mekaniği
- **Kaynak:** SRD 5.1, sf. 77, "Temporary Hit Points"
- **Hasar Alma:** Gelen hasar önce Geçici Can (Temp HP)'dan düşülür. Temp HP sıfırlanırsa artan hasar normal HP'den düşer. HP 0'ın altına inemez.
- **İyileşme (Healing):** Yalnızca normal HP'yi artırır, Temp HP vermez. Normal HP asla Maksimum HP'yi aşamaz.
- **Geçici Can Birikmez (Do not stack):** Yeni bir geçici can kazanıldığında, oyuncu mevcut olanı korumak veya yenisini almak arasında seçim yapar (en yüksek olan kalır).

---

## Bölüm 8: Büyü Slotları Tablosu (Spell Slots)
- **Kaynak:** SRD 5.1, sf. 13–55, "Spellcasting"
- **Tam Büyücü Tablosu (Wizard, Sorcerer, Cleric, Druid, Bard):**
  | Seviye | 1. | 2. | 3. | 4. | 5. | 6. | 7. | 8. | 9. |
  |---|---|---|---|---|---|---|---|---|---|
  | 1 | 2 | - | - | - | - | - | - | - | - |
  | 2 | 3 | - | - | - | - | - | - | - | - |
  | 3 | 4 | 2 | - | - | - | - | - | - | - |
  | 4 | 4 | 3 | - | - | - | - | - | - | - |
  | 5 | 4 | 3 | 2 | - | - | - | - | - | - |
  | 6 | 4 | 3 | 3 | - | - | - | - | - | - |
  | 7 | 4 | 3 | 3 | 1 | - | - | - | - | - |
  | 8 | 4 | 3 | 3 | 2 | - | - | - | - | - |
  | 9 | 4 | 3 | 3 | 3 | 1 | - | - | - | - |
  | 10 | 4 | 3 | 3 | 3 | 2 | - | - | - | - |
  | 11 | 4 | 3 | 3 | 3 | 2 | 1 | - | - | - |
  | 13 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | - | - |
  | 15 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | - |
  | 17 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | 1 |
  | 19 | 4 | 3 | 3 | 3 | 3 | 2 | 1 | 1 | 1 |
  | 20 | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 |
- **Yarı Büyücü Tablosu (Paladin, Ranger):**
  - Seviye 1: Slot yok (0)
  - Seviye 2: 2x 1. seviye slot
  - Seviye 3: 3x 1. seviye slot
  - Seviye 5: 4x 1., 2x 2. seviye slot
- **Warlock (Pact Magic):**
  - Seviye 1: 1 slot (1. seviye)
  - Seviye 2: 2 slot (1. seviye)
  - Seviye 3–4: 2 slot (2. seviye)
  - Seviye 5–6: 2 slot (3. seviye)
  - Seviye 7–8: 2 slot (4. seviye)
  - Seviye 9–10: 2 slot (5. seviye)
  - Seviye 11–16: 3 slot (5. seviye)
  - Seviye 17–20: 4 slot (5. seviye)


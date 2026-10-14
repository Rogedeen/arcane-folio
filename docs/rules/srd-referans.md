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

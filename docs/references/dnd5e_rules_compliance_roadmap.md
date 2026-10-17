# 📜 D&D 5e Rule Compliance & Refactor Roadmap

Bu doküman, Arcane Folio / DnD Beyond Killer projesinde **resmi D&D 5e SRD 5.1 & 2024 kurallarına** %100 uyumu garanti altına almak amacıyla hazırlanmıştır. Projeye dahil olan tüm geliştiriciler ve AI asistanları bu yol haritasına ve kurallara uymakla yükümlüdür.

---

## 📌 Temel Prensipler & Değişmez Kural Standartları
1. **2014 Kuralları Önceliklidir:** Sistemde aksi belirtilmedikçe SRD 5.1 / 2014 PHB kuralları geçerlidir. 2024 kuralları modüler olarak toggle ile seçilebilir olmalıdır.
2. **Karakter Kısıtlamaları Delinemez:** Oyuncunun sınıfı, seviyesi ve alt sınıfı neyi gerektiriyorsa arayüz (UI) onu zorunlu kılar. Seviyesi yetmeyen büyü aranamaz veya hazırlanamaz.
3. **Otomatik Matematik:** Saldırı bonusları, hasar zarları, taşıma sınırları, AC ve dinlenme kazanımları elle girilen rasgele değerler değil, D&D 5e formüllerinin çıktısı olmalıdır.
4. **Çift Dil Desteği:** Kuralların terimleri (Hit Dice, Cantrips, Short Rest, Encumbrance vb.) hem Türkçe hem İngilizce modda tutarlı ve anlaşılır kalmalıdır.

---

## 🗺️ Refactor Fazları ve Durum Takibi

### 📍 FAZ 1: Büyü Hazırlama Modelleri & Sınıfa Özgü Büyü Sistemi
- [x] **1.1. Büyücü Türleri Ayrımı (Prepared vs Known vs Pact Magic):**
  - **Prepared Casters:** Wizard (`Level + INT Mod`), Cleric/Druid (`Level + WIS Mod`), Paladin (`floor(Level/2) + CHA Mod`).
  - **Known Casters:** Sorcerer, Bard, Ranger; büyü hazırlamaz, sınıfa ve seviyeye göre sabit sayıda `Spells Known` bilir.
  - **Warlock (Pact Magic):** Normal spell slot kullanmaz; tüm slotları aynı seviyededir (1-5) ve Kısa Dinlenmede (Short Rest) yenilenir.
  - **1/3 Casters:** Eldritch Knight Fighter ve Arcane Trickster Rogue (seviye 3'te başlar, 1/3 ilerler, kısıtlı okul büyüsü bilir).
- [x] **1.2. Spellbook UI Uyarlaması:**
  - Known caster ise "Hazırla" butonu yerine "Öğren" / "Biliniyor" ve `Known Spells Max` gösterilir.
  - Sınıfa uygun başlık ("Büyü Kitabı & Hazırlanan Büyüler" vs "Büyü Kütüphanesi & Bilinen Büyüler") dinamikleşti.

---

### 📍 FAZ 2: Saldırı & Hasar Motoru (Weapons, Finesse & Off-Hand)
- [x] **2.1. Silah Özellikleri ve Yetenek Bonusu Hesaplama:**
  - Yakın dövüş: `STR Mod + PB` (Attack), `STR Mod` (Damage).
  - *Finesse* (Rapier, Dagger, Scimitar): `max(STR, DEX) + PB` (Attack), `max(STR, DEX)` (Damage).
  - Menzilli (Bow, Crossbow): `DEX Mod + PB` (Attack), `DEX Mod` (Damage).
  - *Versatile* (Longsword, Warhammer): Tek el (`1d8`) vs İki el (`1d10`) hasar seçeneği (`src/rules/weaponAttacks.ts`).
- [x] **2.2. İkincil Silah (Two-Weapon Fighting) Kuralı:**
  - Bonus Action ile yapılan ikincil el saldırısına stat modifikasyonu **hasar olarak eklenmez** (Two-Weapon Fighting fighting style yoksa).
- [x] **2.3. Büyü Saldırı & Hasar Kuralı:**
  - Spell Attack: `PB + Casting Mod`. Spell Save DC: `8 + PB + Casting Mod`.

---

### 📍 FAZ 3: Dinlenme Mekaniği (Short Rest vs Long Rest & Hit Dice)
- [x] **3.1. Short Rest (Kısa Dinlenme - 1 Saat):**
  - Hit Dice harcayarak can doldurma (`Hit Die + CON Mod`).
  - Harcanan Hit Die'ların takibi.
  - Kısa dinlenmede dolan yeteneklerin sıfırlanması: Warlock Pact Slots, Fighter Second Wind/Action Surge.
- [x] **3.2. Long Rest (Uzun Dinlenme - 8 Saat):**
  - HP tamamen dolar.
  - Harcanan Hit Die'ların en fazla **yarısı** (`max(1, floor(Level / 2))`) geri gelir.
  - Tüm standart Spell Slot'lar sıfırlanır (`src/rules/resting.ts`).

---

### 📍 FAZ 4: Zırh Güç Gereksinimi & Encumbrance (Ağırlık Kuralı)
- [x] **4.1. Zırh STR Kısıtlaması:**
  - Chain Mail (STR 13), Splint (STR 15), Plate (STR 15) gerektirir.
  - STR yetersizse karakterin `Speed` değeri **10 ft düşer** (`checkArmorStrengthRequirement`).
- [x] **4.2. Taşıma Sınırı & Encumbrance:**
  - Standart: `STR * 15 lb`.
  - Encumbrance varyantı: `STR * 5 lb` (Encumbered: -10 ft hız), `STR * 10 lb` (Heavily Encumbered: -20 ft hız + DEX/STR/CON dezavantaj), `STR * 15 lb` (Over capacity) (`getDetailedEncumbranceStatus`).

---

### 📍 FAZ 5: Konsantrasyon (Concentration) Takibi
- [x] **5.1. Aktif Konsantrasyon:**
  - Oyuncu bir konsantrasyon büyüsü kullandığında aktif konsantrasyon durumuna geçer.
  - İkinci bir konsantrasyon büyüsü atıldığında önceki otomatik sonlanır (`startConcentration`).
- [x] **5.2. Konsantrasyon Kurtulma Zarı (CON Save):**
  - Hasar alındığında DC = `max(10, floor(Alınan Hasar / 2))` ile CON Save uyarısı ve zar fırlatıcısı tetiklenir (`calculateConcentrationDC`).
- [x] **5.3. 0 HP & Durum Etkileri:**
  - 0 HP veya Incapacitated/Unconscious durumunda konsantrasyon anında düşer (`checkConcentrationLossOnCondition`).

---

## 🏆 Tamamlananlar (Done)
- [x] **Open5e SRD 5.1 Kuralları (227 adet) ve 2024 Kuralları (56 adet)** yerel JSON veri setine çekildi (`src/data/open5e_srd_rules.json`, `src/data/open5e_srd_2024_rules.json`).
- [x] **D&D 5e Master Rules Skill** oluşturuldu (`.agents/skills/dnd5e-rules-master/SKILL.md`).
- [x] **Kapsamlı Kural Referans Dokümantasyonu** oluşturuldu (`docs/references/dnd5e_rules_reference.md`).
- [x] **Büyü Seviyesi Kısıtlama Motoru:** `getMaxSpellLevelForCharacter` eklendi; Full Caster, Half Caster, Warlock, 1/3 Caster seviye kontrolleri yapıldı.
- [x] **Büyü Kitabı UI Koruması:** Seviyeden yüksek büyüler tamamen gizlendi (arama dahil Wish vb. engellendi).
- [x] **✨ Hazırlananlar Sekmesi:** Spellbook'a yalnızca hazırlanan büyüleri filtreleyen sekme eklendi.

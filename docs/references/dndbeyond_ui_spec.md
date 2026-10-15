# 📜 D&D Beyond UI & UX Referans Şartnamesi (Tasarım Analizi)

Bu belge, kullanıcının paylaştığı resmi D&D Beyond arayüzü ekran görüntülerinin piksel ve mimari düzeydeki dökümüdür. Projedeki tüm arayüz revizyonları bu standartları kılavuz alacaktır.

---

## 1. Genel Sayfa & Başlık Mimarisi (Top Bar & Header)
1. **Üst Bilgi Çubuğu (Top Bar):**
   - Sol: Karakter Portresi (Avatar), Karakter Adı (`Hammer`), Irk ve Sınıf/Seviye (`Dwarf Barbarian 1`).
   - Sağ: Hızlı Dinlenme Butonları (`SHORT REST`, `LONG REST` - özel ikonlu), `FIND A GROUP`, Kampanya ve Karakter Düzenleme kısayolu.
   - Sağ Üst Toast/Banner: Zar atıldığında beliren yatay zar rozeti:
     `[d20 İkonu] HAMMER ROLLED INITIATIVE: 8`
   - **Fiziksel 3D Zarlar:** Zar atıldığında ekranda yuvarlanan, zemine gölge düşüren ve yavaşça duran fiziksel 3D zarlar (kırmızı rakamlı siyah d20).

2. **Yetenek Skorları Bandı (Ability Score Badges Row):**
   - 6 temel stat yan yana yatay rozetler halinde: `STRENGTH`, `DEXTERITY`, `CONSTITUTION`, `INTELLIGENCE`, `WISDOM`, `CHARISMA`.
   - Kart anatomisi:
     - Üstte büyük font ile Modifikatör (örn: `+3`).
     - Altta kavisli rozet içinde Yetenek Skoru (örn: `17`).
   - Statların hemen sağında:
     - `PROFICIENCY`: `+2 BONUS`
     - `WALKING`: `30 ft. SPEED`
     - `HEROIC INSPIRATION`: Boş/dolu kalkan yuvası.

3. **Savaş & Can Durumu Bloğu (Combat & HP Box):**
   - `INITIATIVE`: `+1` (baklava/elmas formunda rozet).
   - `ARMOR CLASS`: `13` (kalkan rozeti içinde).
   - `HIT POINTS KUTUSU`:
     - Sol: `HEAL` (yeşil) ve `DAMAGE` (kırmızı) butonları, ortada sayı giriş kutusu.
     - Sağ: `CURRENT / MAX` (`15 / 15`), `TEMP` (`--`).
   - `DEFENSES & CONDITIONS KUTUSU`:
     - Savunmalar / Dirençler (örn: `🛡️ Defenses: Poison`).
     - Aktif Durumlar (`Conditions: Add Active Conditions`).

---

## 2. Sol Sütun: Kurtarma Zarları, Duyular & Ustalıklar
1. **Kurtarma Zarları (Saving Throws):**
   - 2 sütunlu düzen: STR / INT, DEX / WIS, CON / CHA.
   - Ustalık olan kurtarma zarlarının yanında dolu siyah daire (`●`).
   - Altında özel durum notu: *"to avoid or end the Poisoned condition"*.

2. **Duyular (Senses):**
   - Yatay kapsül butonlar: `11 PASSIVE PERCEPTION`, `10 PASSIVE INVESTIGATION`, `11 PASSIVE INSIGHT`.
   - Özel görüş notu: `Darkvision 120 ft.`

3. **Zırh ve Silah Ustalığı (Proficiencies):**
   - `ARMOR`: Light Armor, Medium Armor, Shields.
   - `WEAPONS`: Martial Weapons, Simple Weapons.

---

## 3. Orta Sütun: Alfabetik Beceri Listesi (Skills Table)
- Alfabetik A-Z sıralı 18 beceri.
- Kolonlar:
  1. `PROF` (Ustalık dairesi: `●` dolu veya `○` boş).
  2. `MOD` (İlgili stat: `DEX`, `WIS`, `INT`, `STR`, `CHA`).
  3. `SKILL` (Beceri adı: Acrobatics, Animal Handling, Athletics...).
  4. `BONUS` (Hesaplanmış nihai modifikatör: `+1`, `+5`, `-1`...).

---

## 4. Sağ Bölüm: Sekmeler & Alt Filtreler (Tab System)
Sağ ana içerik alanı şu ana sekmelerden oluşur:
`ACTIONS` | `INVENTORY` | `FEATURES & TRAITS` | `BACKGROUND` | `NOTES` | `EXTRAS`

### A. ENFEKTE / ENVANTER (`INVENTORY`)
- **Üst Metrikler:**
  - Taşıma ağırlığı: `WEIGHT CARRIED: 96 lb. UNENCUMBERED`
  - Para birimi / Altın: `25 GP` (kese ikonu ile).
- **Arama & Yönetim:**
  - `Search Item Names, Types, Rarities, or Tags` arama kutusu.
  - Huni ikonu (Filtre) ve `MANAGE INVENTORY` butonu.
- **Alt Kategoriler (Pill Tabs):**
  - `ALL` | `EQUIPMENT` | `BACKPACK` | `ATTUNEMENT` | `OTHER POSSESSIONS`
- **Tablo Sütunları:**
  - `ACTIVE`: Kuşanma kutucuğu (Kuşanılmış ise dolu kırmızı kare `■`, kuşanılmamış ise boş `□`, kuşanılmaz eşya ise `--`).
  - `NAME`: Eşya adı + kategori etiketi (örn: *Greataxe / Greataxe • Mastery*).
  - `WEIGHT`: Ağırlık (örn: `7 lb.`).
  - `QTY`: Miktar (`1`, `2` veya `--`).
  - `COST (GP)`: Değer (`30`, `50`...).
  - `NOTES`: Silah özellikleri (örn: *Martial, Heavy, Two-Handed, Cleave*).
- **Alt Kısım:** `+ Add Equipment`, `Hide Contents`.

### B. ÖZELLİKLER & YETENEKLER (`FEATURES & TRAITS`)
- **Alt Kategoriler (Pill Tabs):**
  - `ALL` | `CLASS FEATURES` | `SPECIES TRAITS` | `FEATS`
- **Sınıf Özellikleri Detayları:**
  - Başlık: `Barbarian Features`
  - Yetenek blokları:
    - `Rage`: Kullanım sayacı (checkbox `[ ] [ ] / Long Rest`), Rage başlatma/durdurma seçimi, bonus eylem gereksinimi.
    - `Unarmored Defense`: Zırhsızken AC = 13 + Kalkan.
    - `Weapon Mastery`: Silaha özgü ustalıklar (*Greataxe: Cleave, Handaxe: Vex*).

### C. KARAKTER GEÇMİŞİ (`BACKGROUND`)
- **Alt Kategoriler (Pill Tabs):**
  - `ALL` | `BACKGROUND` | `CHARACTERISTICS` | `APPEARANCE`
- **Bölümler:**
  - `Background`: Başlık (*Folk Hero*), Özellik (*Rustic Hospitality* ve hikaye metni).
  - `Characteristics Grid`: ALIGNMENT, GENDER, EYES, SIZE (`Medium`), HEIGHT, FAITH, HAIR, SKIN, AGE, WEIGHT.
  - Rol Yapma Alanları:
    - `Personality Traits` (`+ Add Personality Traits`)
    - `Ideals` (`+ Add Ideals`)
    - `Bonds` (`+ Add Bonds`)
    - `Flaws` (`+ Add Flaws`)
  - `Appearance`: `+ Add Appearance information`.

### D. NOTLAR (`NOTES`)
- **Alt Kategoriler (Pill Tabs):**
  - `ALL` | `ORGS` | `ALLIES` | `ENEMIES` | `BACKSTORY` | `OTHER`
- **Bölümler:**
  - `ORGANIZATIONS`: `+ Add Organizations`
  - `ALLIES`: `+ Add Allies`
  - `ENEMIES`: `+ Add Enemies`
  - `BACKSTORY`: `+ Add Backstory`
  - `OTHER`: `+ Add Other`

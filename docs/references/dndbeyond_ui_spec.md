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

### E. EYLEMLER SEKMESİ (`ACTIONS`)
- **Alt Kategoriler (Pill Tabs):**
  - `ALL` | `ATTACK` | `ACTION` | `BONUS ACTION` | `REACTION` | `OTHER` | `LIMITED USE`
- **Başlık & Ayarlar:**
  - `ACTIONS • Attacks per Action: 1`
  - Sağ: `MANAGE CUSTOM` butonu.
- **Saldırı Tablosu (Attacks Table):**
  - İkon: Kırmızı yıldız + çapraz kılıç rozeti (proficient melee attack).
  - Kolonlar:
    1. `ATTACK`: Silah adı ve türü (örn: *Greataxe / Melee Weapon • Mastery*, *Handaxe / Melee Weapon • Mastery*, *Unarmed Strike / Melee Attack*).
    2. `RANGE`: Menzil (örn: `5 ft. Reach`, `20 (60)`).
    3. `HIT / DC`: Tıklanabilir saldırı zarı kutusu (örn: `+5` kutucuğu — tıklandığında doğrudan 1d20+5 atar).
    4. `DAMAGE`: Tıklanabilir hasar zarı kutusu (örn: `1d12+3` veya `1d6+3` kılıç ikonlu buton — tıklandığında hasar zarı atar).
    5. `NOTES`: Özellikler (*Martial, Heavy, Two-Handed, Cleave*, *Simple, Light, Thrown, Vex*).
- **Dövüş İçi Standart Eylemler (Actions in Combat Listesi):**
  - *Attack, Dash, Disengage, Dodge, Grapple, Help, Hide, Improvise, Influence, Magic, Ready, Search, Shove, Study, Utilize*.
- **Kural & Ustalık Detay Açıklamaları (Dropdown Cards):**
  - Örn: `Cleave (Greataxe)` kural detayı.
  - Örn: `Unarmed Strike` seçenekleri: *Damage, Grapple (DC = 8 + Prof + Str), Shove (DC = 8 + Prof + Str)*.

---

## 5. Seviye Atlama & Karakter Oluşturucu Ekranı (Builder & Level-Up Flow)
1. **Adımlı Gezinme Çubuğu:**
   - Sayfa başında mavi renkli `[ < ]` (Önceki Adım) ve `[ > ]` (Sonraki Adım) navigasyon okları.
2. **Akordeon Başlıkları (`CLASS FEATURES`):**
   - Açılır/kapanır kart: `Core Barbarian Traits (2 Choices • 1st level)`.
   - Tablo özeti:
     - `Primary Ability`: Strength
     - `Hit Point Die`: D12 per Barbarian level
     - `Saving Throw Proficiencies`: Strength and Constitution
     - `Skill Proficiencies`: *Choose 2* (Animal Handling, Athletics, Intimidation, Nature, Perception, Survival)
     - `Weapon Proficiencies`: Simple and Martial weapons
     - `Armor Training`: Light and Medium armor and Shields
     - `Starting Equipment`: A veya B seçeneği.
3. **Akıllı Dropdown Seçimleri (Geçmiş / Background Farkındalığı):**
   - Açılır listede, geçmişten (Folk Hero vb.) zaten kazanılmış yetenekler etiketlenir ve mükerrer seçilmeleri engellenir:
     - `Animal Handling (Folk Hero)`
     - `✓ Athletics`
     - `Nature`
     - `Perception`
     - `Survival (Folk Hero)`
4. **Gelecek Seviyeler Önizlemesi & Multiclassing:**
   - `Available at Higher Levels (22) +`: İlerideki seviyelerde nelerin açılacağını gösteren katlanabilir liste.
   - `+ Add Another Class`: Çoklu sınıf (Multiclassing) ekleme butonu.

---

## 6. UI/UX Remastering: Jakob Nielsen'in 10 Kullanılabilirlik Sezgisi (Heuristics)
Tüm sistem mimarisi, gereksiz kaydırmaları bitirip "tek bakışta hakimiyet" sağlayan bu 10 ilkeye göre inşa edilecektir:

1. **Sistem Durumunun Görünürlüğü (Visibility of System Status):**
   - Kullanıcı ne yaparsa yapsın (zar atma, eşya kuşanma, can değişimi, inisiyatif sırası) ekranda anlık, makul ve net bir geri bildirim (toast banner, d20 animasyonu, canlı bar değişimi) almalıdır.
2. **Sistem ile Gerçek Dünya Arasındaki Uyum (Match between System and Real World):**
   - D&D 5e terimleri, oyuncuların ve DM'lerin gerçek masa başında konuştuğu dille sunulmalı; ham veritabanı değişkenleri yerine "Kuşan", "Dinlen", "İnisiyatif", "Kısa Dinlenme" gibi doğal ifadeler kullanılmalıdır.
3. **Kullanıcı Kontrolü ve Özgürlüğü (User Control and Freedom):**
   - Yanlışlıkla seviye atlama, yanlış stat dağıtma veya yanlış hasar girme gibi durumlarda net "İptal Et", "Geri Al" ve "Kapat" acil durum çıkışları bulunmalıdır.
4. **Tutarlılık ve Standartlar (Consistency and Standards):**
   - Saldırı butonu her yerde aynı formda (`[+5]` kutucuğu), hasar butonu her yerde kılıç ikonuyla, sekmeler her yerde aynı pill stilinde olmalıdır.
5. **Hata Önleme (Error Prevention):**
   - Geçmişten gelen bir beceriyi (örn: Folk Hero'dan gelen Survival) sınıftan tekrar seçtirmemek gibi kısıtlamalar baştan hatayı engellemelidir.
6. **Hatırlama Yerine Tanıma (Recognition Rather Than Recall):**
   - Kullanıcı bir büyünün veya silah özelliğinin ne anlama geldiğini ezberlemek zorunda kalmamalı; tıklandığında anında kartın altında kurallar açılmalıdır.
7. **Esneklik ve Kullanım Verimliliği (Flexibility and Efficiency of Use):**
   - Yeni başlayan oyuncu adım adım sihirbazla ilerleyebilirken; deneyimli oyuncu doğrudan stat kutusuna veya hızlı zar tepsisine basarak saniyeler içinde zarlarını yuvarlayabilmelidir.
8. **Estetik ve Minimalist Tasarım (Aesthetic and Minimalist Design):**
   - Sayfa sonu görünmeyen upuzun kaydırmalar yerine; 3 sütunlu kompakt D&D Beyond mimarisiyle her bilgi kendi sabit kutusunda yer almalı, alakasız bilgiler gizlenmelidir.
9. **Hataları Tanıma, Teşhis Etme ve Kurtarma (Help Users Recognize, Diagnose, and Recover from Errors):**
   - Bir hata olduğunda anlaşılmaz kodlar yerine "Karakterin seviye atlaması için önce bir alt sınıf seçmelisiniz" gibi yapıcı mesajlar verilmelidir.
10. **Yardım ve Dokümantasyon (Help and Documentation):**
    - Yan çekmecede her an açılabilen kural rehberi (ReferenceDrawer), büyü ve durum sözlüğü sunulmalıdır.


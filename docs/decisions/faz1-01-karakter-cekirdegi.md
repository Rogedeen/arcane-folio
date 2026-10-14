# Tasarım Notu: faz1-01-karakter-cekirdegi

## 1. Amaç
D&D 5e SRD 5.1 kural motoru temellerini kurmak: Seviye 1–20 için yetenek puanları ve modifikatörleri, ustalık bonusu, sınıf bazlı can puanı (HP), zırh sınıfı (AC), ırk bonusları ve karakter oluşturma sihirbazı/görünümü bileşeni.

## 2. Kapsam Dışı
- Dinlenme (Short/Long Rest) döngüsü ve can harcama (Faz 2 konusu)
- Büyü slotları ve kaynak sayaçları (Faz 2 konusu)
- Envanter, ağırlık ve eşya kuşanma detayları (Faz 3 konusu)

## 3. Veri Modeli
- `src/types/character.ts`:
  ```typescript
  export type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

  export type CharacterClass = 
    | 'barbarian' | 'bard' | 'cleric' | 'druid' | 'fighter' 
    | 'monk' | 'paladin' | 'ranger' | 'rogue' | 'sorcerer' 
    | 'warlock' | 'wizard';

  export type CharacterRace = 
    | 'human' | 'elf' | 'dwarf' | 'halfling' 
    | 'dragonborn' | 'gnome' | 'half-elf' | 'half-orc' | 'tiefling';

  export interface AbilityScores {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  }

  export interface Character {
    id: string;
    name: string;
    race: CharacterRace;
    class: CharacterClass;
    level: number; // 1 - 20
    baseAbilities: AbilityScores;
    equippedArmor?: {
      name: string;
      type: 'light' | 'medium' | 'heavy';
      baseAc: number;
      maxDexBonus?: number;
    };
    hasShield: boolean;
  }

  export interface DerivedStats {
    abilityScores: AbilityScores;
    modifiers: Record<AbilityName, number>;
    proficiencyBonus: number;
    maxHp: number;
    currentHp: number;
    armorClass: number;
    hitDice: string;
    passivePerception: number;
  }
  ```

## 4. Dosya Planı
- `src/rules/abilityScores.ts`: Yetenek modifikatörü hesabı (`floor((score - 10) / 2)`).
- `src/rules/proficiency.ts`: Seviye 1–20 ustalık bonusu hesabı (`floor((level - 1) / 4) + 2`).
- `src/rules/hitPoints.ts`: Sınıf zarı ve seviye bazlı HP formülü.
- `src/rules/armorClass.ts`: Standart zırh, Barbarian/Monk unarmored defense ve kalkan hesabı.
- `src/rules/character.ts`: Karakter modelinden türetilmiş değerleri (DerivedStats) hesaplayan saf fonksiyon.
- `src/components/CharacterCreator.tsx`: Karakter oluşturma ve stat önizleme bileşeni.
- `tests/rules/abilityScores.test.ts`: Kural Denetçisi 1–30 skor sınır ve pozitif testleri.
- `tests/rules/proficiency.test.ts`: Kural Denetçisi 1–20 seviye tablosu testleri.
- `tests/rules/hitPoints.test.ts`: Sınıf can zarları ve CON modifikatörü testleri.
- `tests/rules/armorClass.test.ts`: Zırhsız, kalkanlı, hafif/orta/ağır zırh testleri.
- `tests/unit/characterCreator.test.tsx`: Birim testleri.
- `tests/e2e/character.spec.ts`: E2E karakter oluşturma ve türetilmiş değerlerin ekranda doğrulanması.

## 5. Arayüz Sözleşmesi
- `src/rules/abilityScores.ts`:
  ```typescript
  export function calculateModifier(score: number): number;
  ```
- `src/rules/proficiency.ts`:
  ```typescript
  export function calculateProficiencyBonus(level: number): number;
  ```
- `src/rules/hitPoints.ts`:
  ```typescript
  export function calculateMaxHp(charClass: CharacterClass, level: number, conModifier: number, isHillDwarf?: boolean): number;
  ```
- `src/rules/armorClass.ts`:
  ```typescript
  export function calculateArmorClass(params: {
    charClass: CharacterClass;
    dexModifier: number;
    conModifier: number;
    wisModifier: number;
    armor?: { type: 'light' | 'medium' | 'heavy'; baseAc: number; maxDexBonus?: number };
    hasShield?: boolean;
  }): number;
  ```
- `src/rules/character.ts`:
  ```typescript
  export function calculateDerivedStats(character: Character): DerivedStats;
  ```

## 6. Kural Bağımlılıkları
1. `docs/rules/srd-referans.md` Bölüm 1: Yetenek Modifikatörü Formülü
2. `docs/rules/srd-referans.md` Bölüm 2: Seviye 1–20 Ustalık Bonusu
3. `docs/rules/srd-referans.md` Bölüm 3: Zırh Sınıfı (Unarmored, Barbarian, Monk, Light/Medium/Heavy, Shield)
4. `docs/rules/srd-referans.md` Bölüm 4: Can Zarları ve Maksimum HP
5. `docs/rules/srd-referans.md` Bölüm 5: Irksal Stat Bonusları

## 7. Kabul Kriterleri
1. Seviye 1–20 aralığında ustalık bonusu sırasıyla +2, +3, +4, +5, +6 üretmeli.
2. Skor 1 için -5, 10-11 için 0, 20 için +5, 30 için +10 modifikatör hesaplanmalı.
3. Seviye 1 Barbarian (CON 16 / +3 mod) HP: tam 15 olmalı (12 + 3).
4. Seviye 5 Barbarian (CON 16 / +3 mod, ortalama HP artışı) HP: 15 + (4 * 10) = 55 olmalı.
5. Seviye 1 Monk (DEX 16 / +3 mod, WIS 14 / +2 mod, zırhsız) AC: 10 + 3 + 2 = 15 olmalı.
6. Standart zırhsız karakter (DEX 14 / +2 mod) kalkan taktığında AC: 10 + 2 + 2 = 14 olmalı.
7. Arayüzde karakter oluşturulduğunda türetilmiş tüm değerler dinamik olarak güncellenmeli ve görünmeli.
8. Kural testleri (`tests/rules/`) ve E2E testleri (`npm run e2e`) yeşil olmalı.

## 8. Riskler ve Açık Sorular
- Negatif CON modifikatöründe seviye başına HP artışı kural gereği minimum 1 olmalıdır (Bölüm 4 gereği).

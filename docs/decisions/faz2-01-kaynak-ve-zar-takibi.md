# Tasarım Notu: faz2-01-kaynak-ve-zar-takibi

## 1. Amaç
D&D 5e SRD 5.1 kural motoruna kaynak takibi (Can Puanı, Geçici Can, Hasar/İyileşme, Kısa ve Uzun Dinlenme, Büyü Slotları) ve D&D Beyond tarzı "juice" artıran çoklu polhedral zar atıcıyı (d4, d6, d8, d10, d12, d20, d100; fiziksel yuvarlanma animasyonu, Web Audio ses efekti ve kritik vuruş parçacıkları) eklemek.

## 2. Kapsam Dışı
- Büyü kütüphanesindeki 50 büyünün metinleri ve açıklamaları (Faz 3 konusu).
- Eşya envanteri ve taşıma kapasitesi (Faz 3 konusu).

## 3. Veri Modeli
- `src/types/resources.ts`:
  ```typescript
  export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

  export interface SpellSlotTier {
    tier: number; // 1 - 9
    total: number;
    expended: number;
  }

  export interface ResourceState {
    currentHp: number;
    maxHp: number;
    tempHp: number;
    hitDiceAvailable: number;
    totalHitDice: number;
    hitDieType: string;
    spellSlots: Record<number, SpellSlotTier>;
    pactMagic?: {
      slotLevel: number;
      total: number;
      expended: number;
    };
  }

  export interface DiceRollResult {
    id: string;
    dieType: DieType;
    value: number;
    timestamp: string;
    isCrit: boolean; // d20'de 20
    isFumble: boolean; // d20'de 1
  }
  ```

## 4. Dosya Planı
- `src/types/resources.ts`: Kaynak ve zar tipleri.
- `src/rules/spellSlots.ts`: Tam büyücü, yarı büyücü ve Warlock slot tabloları saf fonksiyonu.
- `src/rules/damageHealing.ts`: Geçici can öncelikli hasar ve maksimum can sınırlı iyileşme fonksiyonu.
- `src/rules/resting.ts`: Short rest (can zarı harcama, Warlock slot sıfırlama) ve Long rest (tam HP, temp HP sıfırlama, slotların ve zarların yarısının yenilenmesi) saf fonksiyonları.
- `src/utils/soundEffects.ts`: Web Audio API tabanlı sentetik zar yuvarlanma ve çarpma sesleri (dış dosya bağımlılığı olmadan %100 çevrimdışı çalışır).
- `src/components/ResourceTracker.tsx`: D&D Beyond tarzı HP kalkanı/kalbi, hasar alma, iyileşme, dinlenme butonları ve interaktif büyü slotları.
- `src/components/DiceTray.tsx`: Polhedral zarlar (d4–d100), animasyonlu yuvarlanma tepsisi, zar geçmişi ve parçacık efekti.
- `tests/rules/spellSlots.test.ts`: Kural Denetçisi büyü slot tabloları testleri.
- `tests/rules/resting.test.ts`: Kural Denetçisi dinlenme döngüsü testleri.
- `tests/rules/damageHealing.test.ts`: Kural Denetçisi temp HP ve hasar testleri.
- `tests/unit/resourceTracker.test.tsx`: Birim testleri.
- `tests/e2e/resources.spec.ts`: E2E testleri (hasar alma, dinlenme yapma, zar atma, animasyon ve ekran görüntüleri).

## 5. Arayüz Sözleşmesi
- `src/rules/spellSlots.ts`:
  ```typescript
  export function getSpellSlotsForLevel(charClass: CharacterClass, level: number): Record<number, SpellSlotTier>;
  ```
- `src/rules/damageHealing.ts`:
  ```typescript
  export function applyDamage(currentHp: number, tempHp: number, damage: number): { currentHp: number; tempHp: number };
  export function applyHealing(currentHp: number, maxHp: number, healAmount: number): number;
  export function applyTempHp(currentTempHp: number, newTempHp: number): number;
  ```
- `src/rules/resting.ts`:
  ```typescript
  export function performShortRest(state: ResourceState, hitDiceSpent: number, rolledHpTotal: number): ResourceState;
  export function performLongRest(state: ResourceState): ResourceState;
  ```

## 6. Kural Bağımlılıkları
1. `docs/rules/srd-referans.md` Bölüm 6: Dinlenme Kuralları (Short Rest & Long Rest)
2. `docs/rules/srd-referans.md` Bölüm 7: Geçici Can Puanı (Temp HP) ve Hasar
3. `docs/rules/srd-referans.md` Bölüm 8: Büyü Slotları Tablosu (Tam/Yarı/Warlock)

## 7. Kabul Kriterleri
1. 10 Temp HP ve 20 normal HP olan karaktere 15 hasar vurulduğunda Temp HP 0, normal HP 15 kalmalı.
2. Long rest yapıldığında Current HP tam Max HP'ye eşitlenmeli, Temp HP 0 olmalı ve tüm harcanan büyü slotları sıfırlanmalıdır.
3. Seviye 5 Wizard: 4 adet 1. seviye, 3 adet 2. seviye, 2 adet 3. seviye büyü slotuna sahip olmalıdır.
4. Seviye 5 Paladin (yarı büyücü): 4 adet 1. seviye, 2 adet 2. seviye slota sahip olmalıdır.
5. Seviye 5 Warlock (Pact Magic): 2 adet 3. seviye slotuna sahip olmalı ve kısa dinlenmeyle sıfırlanmalıdır.
6. Arayüzde d4, d6, d8, d10, d12, d20, d100 zarları tıklanarak atılabilmeli, düşüş/takla animasyonu gösterilmeli ve zar geçmişinde listelenmelidir.
7. Tüm birim ve kural testleri (`npm test`) ile E2E senaryoları (`npm run e2e`) yeşil olmalıdır.

## 8. Riskler ve Açık Sorular
- Tarayıcı ses izinleri (Autoplay policy) nedeniyle kullanıcı ilk etkileşimi yapmadan ses çalınamaz; Web Audio context'i ilk tıklamada `resume()` edilmelidir.

# Tasarım Notu: faz3-01-envanter-ve-buyuler

## 1. Amaç
D&D 5e SRD 5.1 standartlarına uygun 50 büyü ve 50 eşyanın JSON formatında şemayla doğrulanarak eklenmesi (`npm run content:validate`), karakter taşıma kapasitesi ve kuşanma mantığı, büyü hazırlama kuralları ve D&D Beyond tarzı Envanter & Büyü Kitabı (Spellbook) bileşenlerinin geliştirilmesi.

## 2. Kapsam Dışı
- Alt sınıflar ve durum (condition) motoru (Faz 4 konusu)
- DM Kampanya canlı senkronu ve RLS (Faz 5 konusu)

## 3. Veri Modeli
- `src/types/content.ts`:
  ```typescript
  export interface SpellData {
    slug: string;
    name: string;
    level: number; // 0 (cantrip) - 9
    school: string;
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    description: string;
    classes: string[];
    source: string;
    source_ref: string;
    license: string;
  }

  export interface ItemData {
    slug: string;
    name: string;
    type: 'weapon' | 'armor' | 'shield' | 'gear' | 'potion' | 'scroll';
    cost: string;
    weight: number; // in lbs
    description: string;
    properties?: string[];
    equipped?: boolean;
    quantity: number;
    source: string;
    source_ref: string;
    license: string;
  }
  ```

## 4. Dosya Planı
- `content/schemas/spell.schema.json`: Büyü JSON doğrulama şeması.
- `content/schemas/item.schema.json`: Eşya JSON doğrulama şeması.
- `content/spells/**/*.json`: 50 adet SRD 5.1 büyüsü (Cantrips, 1-5. seviye büyüler).
- `content/items/**/*.json`: 50 adet SRD 5.1 eşyası (silahlar, zırhlar, macera ekipmanları, iksirler).
- `content/ATTRIBUTION.md`: SRD 5.1 CC-BY-4.0 lisans atıf kütüğü.
- `scripts/validate-content.js`: Şema doğrulama motoru.
- `src/rules/inventory.ts`: Taşıma kapasitesi (`STR * 15`) ve yük kontrolü.
- `src/rules/spellPreparation.ts`: Hazırlanabilir büyü sayısı (`level + casterMod`).
- `src/components/InventoryManager.tsx`: Envanter, ağırlık barı, eşya kuşanma arayüzü.
- `src/components/Spellbook.tsx`: Büyü listesi, arama/filtreleme, büyü hazırlama arayüzü.
- `tests/rules/inventory.test.ts`: Kural Denetçisi envanter kuralları testleri.
- `tests/rules/spellPreparation.test.ts`: Kural Denetçisi büyü hazırlama testleri.
- `tests/e2e/spells-inventory.spec.ts`: E2E testleri.

## 5. Arayüz Sözleşmesi
- `src/rules/inventory.ts`:
  ```typescript
  export function calculateCarryingCapacity(strScore: number): number;
  export function calculateTotalWeight(items: ItemData[]): number;
  export function isEncumbered(strScore: number, totalWeight: number): boolean;
  ```
- `src/rules/spellPreparation.ts`:
  ```typescript
  export function calculateMaxPreparedSpells(level: number, castingModifier: number): number;
  ```

## 6. Kural Bağımlılıkları
1. SRD 5.1 sf. 60, "Lifting and Carrying" (Taşıma kapasitesi = $STR \times 15\text{ lbs}$)
2. SRD 5.1 sf. 53, "Preparing and Casting Spells" (Hazırlanan büyü sayısı = $\max(1, \text{Level} + \text{Zeka/İlim Modifikatörü})$)
3. SRD 5.1 sf. 115–200, "Spells"
4. SRD 5.1 sf. 60–73, "Equipment"

## 7. Kabul Kriterleri
1. `npm run content:validate` çalıştırıldığında en az 50 büyü ve 50 eşya hatasız doğrulanmalı.
2. `content/ATTRIBUTION.md` dosyası oluşturulmuş ve SRD 5.1 referansları belirtilmiş olmalı.
3. STR 15 olan bir karakterin taşıma kapasitesi 225 lbs olmalıdır.
4. Toplam ağırlık taşıma kapasitesini aştığında arayüzde "Aşırı Yüklü (Encumbered)" uyarısı belirmelidir.
5. Seviye 5 ve INT mod +3 olan bir Wizard en fazla 8 büyü hazırlayabilmelidir.
6. Arayüzde eşyalar kuşanılabilmeli (Equipped toggle) ve büyüler hazırlanabilmelidir (Prepared toggle).
7. Tüm testler (`npm test` ve `npm run e2e`) yeşil olmalıdır.

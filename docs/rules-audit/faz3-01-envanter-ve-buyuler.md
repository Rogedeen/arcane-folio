# Kural Denetimi Raporu: Faz 3 - Envanter ve Büyüler

## Denetim Bilgileri
- **Tarih:** 2026-10-14
- **Denetçi:** Kural Denetçisi Ajanı (Rule Auditor)
- **Kapsam:** SRD 5.1 Taşıma Kapasitesi (Encumbrance), Eşya Tipleri/Ağırlıkları, Büyü Hazırlama Sınırları ve Şema Uyumu

## Kural Referansları ve Doğrulama

### 1. Taşıma Kapasitesi (Carrying Capacity)
- **SRD 5.1 Kuralı:** Bir karakterin taşıma kapasitesi `STR * 15 lbs`'dir.
- **Uygulama:** `calculateCarryingCapacity(strScore)` fonksiyonu `strScore * 15` üretmektedir. Örneğin STR 14 için 210 lbs, STR 10 için 150 lbs, STR 20 için 300 lbs.
- **Aşırı Yük:** Toplam ağırlık taşıma kapasitesini aştığında `isEncumbered` true döner ve UI üzerinde kullanıcıya hızın 10 ft azalacağını bildiren altın/kırmızı durum uyarısı gösterilir.
- **Durum:** ✅ ONAYLANDI (4 birim testi ile doğrulandı).

### 2. Büyü Hazırlama Sınırı (Spell Preparation)
- **SRD 5.1 Kuralı:** İlimci (Wizard), Rahip (Cleric), Druid veya Paladin için hazırlanabilen büyü sayısı `Seviye + Büyü Yetenek Modifikatörü`'dür (en az 1). Cantripler bu sınıra dahil değildir.
- **Uygulama:** `calculateMaxPreparedSpells(level, castingModifier)` fonksiyonu `Math.max(1, level + castingModifier)` kuralını işletir. 0. seviye (cantrip) büyüler her zaman hazır statüsünde tutulur ve sınır sayacına sayılmaz.
- **Durum:** ✅ ONAYLANDI (3 birim testi ile doğrulandı).

### 3. SRD 5.1 İçerik & Lisans Şeması
- **Attribution:** `content/ATTRIBUTION.md` dosyası Wizards of the Coast SRD 5.1 Creative Commons CC-BY-4.0 lisansını ve Game-icons.net CC-BY-3.0 atfını içermektedir.
- **Şema Bütünlüğü:** 50 adet büyü ve 50 adet eşya JSON dosyası `ajv` ile `spell.schema.json` ve `item.schema.json` şemalarına göre %100 oranında doğrulanmıştır.
- **Durum:** ✅ ONAYLANDI.

## Denetim Sonucu
Faz 3 kural motoru ve içerik veri tabanı SRD 5.1 standartlarına bütünüyle uygundur.

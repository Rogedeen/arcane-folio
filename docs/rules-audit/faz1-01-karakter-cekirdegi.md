# 5e Kural Denetim Raporu: faz1-01-karakter-cekirdegi

- **Tarih:** 2026-10-14
- **Denetçi:** 5e Kural Denetçisi (Rule Auditor)
- **Kural Kaynağı:** `docs/rules/srd-referans.md` (SRD 5.1 CC-BY-4.0)
- **Karar:** **ONAY**

---

## 1. Denetlenen Kurallar ve Bölümler
| Kural | Referans | Test Dosyası | Durum |
|---|---|---|---|
| Yetenek Modifikatörü (`floor((skor - 10) / 2)`) | SRD 5.1 sf. 76 Bölüm 1 | `tests/rules/abilityScores.test.ts` | ONAYLANDI (Skor 1 -5, Skor 30 +10, 10/11 0) |
| Ustalık Bonusu Seviye 1–20 Tablosu | SRD 5.1 sf. 15 Bölüm 2 | `tests/rules/proficiency.test.ts` | ONAYLANDI (Seviye 1-4 +2, 5-8 +3, 9-12 +4, 13-16 +5, 17-20 +6) |
| Sınıf Can Zarları & HP Hesabı | SRD 5.1 sf. 12 Bölüm 4 | `tests/rules/hitPoints.test.ts` | ONAYLANDI (d12, d10, d8, d6, Seviye 1 max HP, Seviye başı min 1) |
| Zırh Sınıfı (Unarmored, Barbarian, Monk, Armor, Shield) | SRD 5.1 sf. 9, 26, 62–64 Bölüm 3 | `tests/rules/armorClass.test.ts` | ONAYLANDI (Barbarian kalkanlı, Monk kalkansız, Ağır zırh DEX'siz) |
| Irksal Yetenek Bonusları | SRD 5.1 sf. 3–8 Bölüm 5 | `src/rules/character.ts` | ONAYLANDI (Human, Elf, Dwarf, Halfling vb.) |

---

## 2. Test Sonuçları
- Toplam 23 kural testi çalıştırıldı.
- 23/23 test başarıyla geçti.
- Beklenen değerler SRD referansından türetilmiş, koddan kopyalanmamıştır.

---

## 3. Karar ve Gerekçe
**ONAY:** Tüm kural hesapları SRD 5.1 ile birebir uyumlu ve doğrulanmıştır. Kod geliştirici tarafından saf fonksiyonlar halinde `src/rules/` altında tutulmuştur.

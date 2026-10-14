# 5e Kural Denetim Raporu: faz2-01-kaynak-ve-zar-takibi

- **Tarih:** 2026-10-14
- **Denetçi:** 5e Kural Denetçisi (Rule Auditor)
- **Kural Kaynağı:** `docs/rules/srd-referans.md` Bölüm 6 (Resting), Bölüm 7 (Temp HP & Damage), Bölüm 8 (Spellcasting Slots)
- **Karar:** **ONAY**

---

## 1. Denetlenen Kurallar ve Bölümler
| Kural | Referans | Test Dosyası | Durum |
|---|---|---|---|
| Hasar Önceliği (Önce Temp HP, sonra normal HP) | SRD 5.1 sf. 77 Bölüm 7 | `tests/rules/damageHealing.test.ts` | ONAYLANDI (Temp HP düşer, artan normalden düşer, min 0) |
| İyileşme Sınırı (Max HP aşılmaz) | SRD 5.1 sf. 75 Bölüm 7 | `tests/rules/damageHealing.test.ts` | ONAYLANDI |
| Kısa Dinlenme (Short Rest) | SRD 5.1 sf. 78 Bölüm 6 | `tests/rules/resting.test.ts` | ONAYLANDI (Can zarı harcanır, Warlock slotu yenilenir) |
| Uzun Dinlenme (Long Rest) | SRD 5.1 sf. 78 Bölüm 6 | `tests/rules/resting.test.ts` | ONAYLANDI (Can tamamen dolar, Temp HP silinir, slotlar ve zarların yarısı yenilenir) |
| Büyü Slotları Tablosu (Tam Büyücü, Yarı Büyücü, Warlock) | SRD 5.1 sf. 13-55 Bölüm 8 | `tests/rules/spellSlots.test.ts` | ONAYLANDI (Wizard 1-20, Paladin 1-20, Warlock Pact Magic) |

---

## 2. Test Kanıtı
- Toplam 19 kural testi çalıştırıldı (`damageHealing`, `resting`, `spellSlots`).
- 19/19 kural testi yeşil geçti.
- Beklenen değerler SRD referansından alınmış, koddan uydurulmamıştır.

---

## 3. Karar
**ONAY:** Tüm kaynak ve dinlenme mantığı SRD 5.1 ile uyumludur.

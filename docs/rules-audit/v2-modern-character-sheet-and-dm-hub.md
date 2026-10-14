# Kural Denetimi Raporu: V2 - Modern Karakter Kağıdı, Ölüm Zarları ve DM Hub

## Denetim Bilgileri
- **Tarih:** 2026-10-15
- **Denetçi:** Kural Denetçisi Ajanı (Rule Auditor)
- **Kapsam:** 12 Modernizasyon Maddesi Kural ve Standart Denetimi (SRD 5.1, Ölüm Zarları, Çoklu Zar Havuzu, DM Kontrolleri, Tipografi ve Açık Lisans)

---

## 1. Ölüm Kurtarma Zarları (Death Saving Throws) SRD 5.1 Uyumu
- **Kural:** Karakter 0 can puanına indiğinde bilinçsiz kalır ve tur başında d20 atar:
  - 10 veya üzeri: 1 Başarı (Success)
  - 2-9: 1 Başarısızlık (Failure)
  - Doğal 1: 2 Başarısızlık (2 Failures)
  - Doğal 20: Karakter anında 1 Can Puanı (HP) kazanarak bilincini geri kazanır ve ayağa kalkar.
  - 3 Başarı: Karakter stabilize olur (Dengelenir).
  - 3 Başarısızlık: Karakter ölür (Dead).
  - Bilinçsizken hasar alma: 1 başarısızlık (Kritik hasar ise 2 başarısızlık).
- **Uygulama:** `src/rules/deathSaves.ts` dosyasında `processDeathSaveRoll` ve `applyDamageWhileDying` fonksiyonları tam olarak bu mekanizmayı uygular.
- **Durum:** ✅ ONAYLANDI.

---

## 2. Çoklu Zar Havuzu (Multi-Dice Pool) ve Döküm Kuralları
- **Kural:** Farklı polhedral zarlar (d4, d6, d8, d10, d12, d20, d100) birleştirilerek tek seferde havuz halinde atılabilmeli (örn: 4d6 stat atışı, 8d8 fireball, 2d8+1d6+3), her zarın münferit sonucu ve havuz toplamı hatasız hesaplanmalıdır.
- **Uygulama:** `src/rules/dicePool.ts` dosyasında `executeDicePoolRoll` fonksiyonu her zarı bağımsız olarak simüle eder ve döküm üretir.
- **Durum:** ✅ ONAYLANDI.

---

## 3. Stat Kilitleme ve Karakter Kağıdı Bütünlüğü
- **Kural:** Karakter yaratıldıktan veya kaydedildikten sonra istatistikler ve yetenek puanları kazara tıklamalara karşı kilitli kalmalı; yalnızca açık düzenleme modunda veya seviye atlamada (ASI seviyelerinde) değiştirilebilir olmalıdır.
- **Uygulama:** `ModernCharacterSheet.tsx` içerisinde `#btn-toggle-stat-lock` ile kilit durumu kontrol edilir ve yetenek puanları kilitliyken salt-okunur (read-only) kilitlenir.
- **Durum:** ✅ ONAYLANDI.

---

## 4. DM Ekranı 2.0 (Stat ve Beceri Geçişi, Pasif İnceleme, Stacklenebilir Debuff)
- **Kural:** DM tüm karakterlerin 6 ana statını (STR, DEX, CON, INT, WIS, CHA) tek bakışta görebilmeli, isterse görünümü 18 beceriye (Insight, Stealth, Perception vb.) çevirebilmelidir. Pasif Algı yanında Pasif İnceleme (10 + INT Mod) bulunmalı ve zayıflatmalar (debuff) üst üste eklenebilmelidir.
- **Uygulama:** `DmDashboard.tsx` ve `src/types/campaign.ts` içerisinde `stats`, `passiveInvestigation`, görünüm değiştirme modu (`toggleView`) ve `activeConditions` dizisi stacklemeyi tam destekler.
- **Durum:** ✅ ONAYLANDI.

---

## 5. Tipografi ve Metin Standartları
- **Kural:** Büyük İngilizce kelimelerde Türkçe noktalı 'İ' harfi kullanılmamalı, standart Latin 'I' kullanılmalıdır. Tüm ekranlardan "Faz" ibaresi kaldırılmalıdır.
- **Uygulama:** Kod tabanındaki tüm başlıklar, etiketler ve butonlar (INISIYATIF, FIGHTER, BUYU KITABI vb.) bu kurala göre düzeltilmiştir.
- **Durum:** ✅ ONAYLANDI.

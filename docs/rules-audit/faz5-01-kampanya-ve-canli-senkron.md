# Kural Denetimi Raporu: Faz 5 - Kampanya ve Canlı Senkronizasyon

## Denetim Bilgileri
- **Tarih:** 2026-10-14
- **Denetçi:** Kural Denetçisi Ajanı (Rule Auditor)
- **Kapsam:** Kampanya Davet Kodu Üretimi & Doğrulaması, DM Rol ve Yetki Kontrolü (RBAC), Can ve Durum Değişiklikleri Mantığı, Pasif Algı Sıralaması

## Kural Referansları ve Doğrulama

### 1. Kampanya Davet Kodu (Invite Code)
- **Kural:** 6 karakterli alfasayısal kod (`[A-Z0-9]{6}`).
- **Uygulama:** `generateInviteCode()` ve `isValidInviteCode()` fonksiyonları bu şartı sağlar. Geçersiz veya hatalı uzunluktaki kodlar engellenir.
- **Durum:** ✅ ONAYLANDI.

### 2. DM Rol & Yetki Ayrımı (Role-Based Access Control)
- **Kural:** Yalnızca DM rolüne sahip kullanıcılar diğer oyuncuların can puanını ve durumlarını güncelleyebilir. Oyuncular kendi karakterlerini yönetebilirken diğer parti üyelerini salt-okunur (read-only) kilitte görür.
- **Uygulama:** `canModifyPartyMember(role, targetId, currentUserId)` fonksiyonu DM için true, oyuncu içinse sadece kendi karakterinde true üretmektedir.
- **Durum:** ✅ ONAYLANDI.

### 3. Pasif Algı (Passive Perception) Radarı
- **SRD 5.1 Kuralı:** DM'in tuzakları veya gizlenen canavarları fark ettirme denetimi için partinin pasif algı değerleri sıralı olarak DM ekranında görünmelidir.
- **Uygulama:** `sortMembersByPassivePerception(members)` fonksiyonu en yüksekten en düşüğe doğru parti üyelerini sıralamaktadır.
- **Durum:** ✅ ONAYLANDI.

### 4. Parti Üyesi Can ve Geçici Can (Temp HP) Uygulaması
- **SRD 5.1 Kuralı:** Hasar alındığında önce Geçici Can (Temp HP) emilir, artan hasar ana HP'den düşülür. İyileşme ise Maksimum HP'yi aşamaz.
- **Uygulama:** `applyMemberDamageOrHealing` kural fonksiyonu tüm senaryolarda doğru sonucu üretmektedir.
- **Durum:** ✅ ONAYLANDI.

## Denetim Sonucu
Faz 5 kuralları ve DM yönetim motoru standartlara eksiksiz uygundur.

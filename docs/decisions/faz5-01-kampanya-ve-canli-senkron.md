# Mimari Karar Kaydı: Faz 5 - Kampanya Yönetimi, DM Paneli ve Canlı Senkronizasyon

## 1. Bağlam
D&D 5e masaüstü rol yapma oyunlarında oyun yöneticisi (Dungeon Master - DM) ve oyuncular (Players) asimetrik rollere sahiptir.
- **Dungeon Master (DM):** Tüm parti üyelerinin can puanını (HP), pasif algısını (Passive Perception), zırh sınıfını (AC) ve üzerlerindeki koşul durumlarını (Conditions) tek bir ekrandan görmeli ve gerektiğinde anında müdahale edebilmelidir (hasar verme, iyileştirme, durum uygulama).
- **Oyuncular (Players):** Kendi karakterlerini kontrol ederken diğer parti üyelerini salt-okunur olarak görebilmelidir.
- **Canlı Senkron:** Tarayıcı sekmeleri veya cihazlar arasında karakter durumu güncellendiğinde tüm katılımcıların ekranı sayfa yenilemeye gerek kalmadan anında güncellenmelidir.

## 2. Karar
1. **Veri Modeli (`src/types/campaign.ts`):**
   - `Campaign`: ID, başlık, DM ID'si, benzersiz 6 haneli davet kodu (`INVITE-XXXXXX`), parti üyeleri listesi.
   - `PartyMember`: Karakter adı, sınıfı, seviyesi, HP/Max HP, AC, pasif algı, aktif durumlar, oyuncu adı.
   - `SyncEvent`: Tip (`HP_UPDATE`, `CONDITION_UPDATE`, `MEMBER_JOIN`), payload ve zaman damgası.
2. **Senkronizasyon Katmanı (`src/data/syncService.ts`):**
   - Tarayıcılar arası / sekmeler arası anlık haberleşme için standart W3C `BroadcastChannel` API'si (`dnd-campaign-sync`) kullanılır.
   - Supabase bağlantısı hazır olduğunda Supabase Realtime Channels üzerinden çift yönlü çalışır; çevrimdışıyken veya yerel ağdayken BroadcastChannel ile sıfır gecikmeli çalışmaya devam eder.
3. **Kullanıcı Arayüzü:**
   - `CampaignView.tsx`: Kampanya bilgisi, 6 haneli davet kodu kopyalama, yeni koda katılma ve rol değiştirici (DM Modu ↔ Oyuncu Modu).
   - `DmDashboard.tsx`: DM'in parti takip kokpiti. Canlı can barları, pasif algı radar kartları, parti üyelerine tek tuşla hasar/iyileşme verme ve durum ekleme.

## 3. Güvenlik ve İzinler (RBAC)
- Yalnızca `role === 'dm'` olan kullanıcılar diğer oyuncuların canını veya durumlarını değiştirebilir.
- Oyuncu modunda diğer karakterler salt-okunur (read-only) kilitlidir.
- Davet kodları standart 6 karakterli alfasayısal büyük harflerden oluşur.

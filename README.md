# 📜 ArcaneFolio 5e

> **5e SRD 5.1 Uyumlu Yeni Nesil Karakter & DM Kampanya Portalı**  
> Modern Bento Grid arayüzü, 3D fiziksel zar motoru ve tam 2014 kural setiyle donatılmış açık kaynaklı masaüstü rol yapma oyunları yol arkadaşı.

---

### ⚖️ Yasal Uyarı & Lisans
- Bu proje, Wizards of the Coast LLC'nin **Creative Commons Attribution 4.0 International (CC-BY-4.0)** lisansı ile yayınladığı **System Reference Document 5.1 ("SRD 5.1")** içeriğini kullanır.
- *Dungeons & Dragons*, *D&D* ve *D&D Beyond*, Wizards of the Coast LLC'nin tescilli ticari markalarıdır.
- Bu yazılım bağımsız bir açık kaynak projesidir; Wizards of the Coast ile herhangi bir resmi bağı, sponsorluğu veya ortaklığı bulunmamaktadır. Kod tabanı **MIT Lisansı** ile lisanslanmıştır. Detaylar için [`LICENSE`](LICENSE) dosyasına göz atabilirsiniz.

---

## ⚡ Hızlı Başlangıç (Geliştirici Modu)

Projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları terminalde (PowerShell, CMD veya Git Bash) çalıştırabilirsiniz:

### 1. Bağımlılıkları Yükleme (İlk kurulum için)
```bash
npm install
```

### 2. Geliştirici Sunucusunu Başlatma (Localhost)
```bash
npm run dev
```
> Sunucu başladığında tarayıcınızdan **`http://localhost:5173/`** adresine gidebilirsiniz.

---

## 🛠️ Diğer Faydalı Komutlar

| Amaç | Komut | Açıklama |
| :--- | :--- | :--- |
| **Geliştirici Sunucusu** | `npm run dev` | Canlı yenilenen Vite dev sunucusunu başlatır (`localhost:5173`). |
| **Birim Testler (Vitest)** | `npm test` | Tüm birim ve kural testlerini tek seferde koşar. |
| **Canlı Test İzleme** | `npm run test:watch` | Kod değiştikçe testleri otomatik tekrar çalıştırır. |
| **TypeScript Tip Kontrolü** | `npm run typecheck` | Derleme hatası veya eksik tip kontrolü yapar (`tsc --noEmit`). |
| **Üretim Derlemesi (Build)** | `npm run build` | Projeyi üretim için optimize edilmiş şekilde `dist/` klasörüne derler. |
| **Derleme Önizleme** | `npm run preview` | Oluşturulan `dist/` üretim derlemesini yerel sunucuda test eder. |

---

## 💡 Windows PowerShell İpuçları
Eğer PowerShell üzerinde komut çalıştırırken `ExecutionPolicy` hatası alırsanız, `cmd.exe /c "komut"` formatında veya terminali Yönetici olarak açıp izin vererek çalıştırabilirsiniz:
```powershell
cmd.exe /c "npm run dev"
```
veya doğrudan:
```powershell
npx vite
```

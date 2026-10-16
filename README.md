# 🐉 DnD Beyond Killer (D&D 5e Kampanya & Karakter Portalı)

Yeni nesil, 2014 PHB / SRD 5.1 uyumlu, zengin zar animasyonlu ve Bento Grid arayüzlü D&D 5e karakter ve kampanya yönetim uygulaması.

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

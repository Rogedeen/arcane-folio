# Tasarım Notu: faz0-01-temel-iskelet

## 1. Amaç
D&D 5e Kampanya Takip Uygulamasının temel frontend iskeletini (Vite + React 18+ + TypeScript), modern tasarım sistemini, Vitest birim test altyapısını, Playwright E2E ortamını, PWA kabuğunu ve Supabase veri katmanı sözleşmesini kurmak.

## 2. Kapsam Dışı
- Gerçek 5e karakter oluşturma veya seviye atlama mantığı (Faz 1 konusu)
- Gerçek Supabase uzak veritabanına doğrudan canlı bağlantı ve RLS politikaları (Faz 5 konusu)
- Büyü/eşya içerik verilerinin girilmesi (Faz 3 konusu)

## 3. Veri Modeli
Bu faz altyapı fazı olduğundan kalıcı oyun verisi içermez. Sadece uygulama kabuğu ve sağlık durumu kontrol tipleri tanımlanır:
- `src/types/app.ts`:
  ```typescript
  export interface AppHealth {
    status: 'ok' | 'degraded';
    version: string;
    timestamp: string;
    pwaReady: boolean;
    storageReady: boolean;
  }
  ```

## 4. Dosya Planı
- `package.json`: Vite, React, TypeScript, Vitest, Playwright, vite-plugin-pwa bağımlılıkları ve npm scriptleri (`dev`, `build`, `test`, `typecheck`, `e2e`).
- `vite.config.ts`: React, PWA manifest ve Vitest yapılandırması.
- `tsconfig.json`, `tsconfig.node.json`: TypeScript strict konfigürasyonu.
- `index.html`: Modern viewport, Google Fonts (Inter, Cinzel) ve meta etiketleri.
- `public/manifest.webmanifest`: PWA uygulama manifestosu.
- `public/icons/`: Standart 192x192 ve 512x512 PWA ikonları (SVG/PNG).
- `src/index.css`: Tasarım sistemi değişkenleri (HSL renk paleti, koyu tema, tipografi, glassmorphism kartlar, dokunmatik min 44px hedef boyutları).
- `src/main.tsx`: React uygulama giriş noktası ve PWA register çağrısı.
- `src/App.tsx`: Temel karşılama kabuğu, sağlık kontrolü paneli, Faz 0 göstergesi.
- `src/data/supabaseClient.ts`: Supabase istemci fabrika ve tip güvenli arayüz sözleşmesi.
- `tests/unit/app.test.tsx`: Vitest ile temel bileşen ve sağlık kontrolü birim testi.
- `tests/e2e/skeleton.spec.ts`: Playwright ile masaüstü, tablet ve mobil görünüm E2E testi.
- `playwright.config.ts`: Playwright test konfigürasyonu (Desktop Chrome, Mobile Chrome / iPhone 390x844, Tablet 768x1024).

## 5. Arayüz Sözleşmesi
- `src/data/supabaseClient.ts`:
  ```typescript
  export interface SupabaseConfig {
    url?: string;
    anonKey?: string;
  }
  export interface DatabaseClient {
    isConnected: () => boolean;
    getHealthStatus: () => Promise<{ ok: boolean; message: string }>;
  }
  export function createDatabaseClient(config?: SupabaseConfig): DatabaseClient;
  ```

## 6. Kural Bağımlılıkları
Bu faz kural motoru hesabı içermemektedir (Altyapı görevi). 5e kural hesapları Faz 1'de başlayacaktır.

## 7. Kabul Kriterleri
1. `npm.cmd run typecheck` sıfır TypeScript hatası vermeli (strict mode).
2. `npm.cmd test` (Vitest) birim testleri hatasız geçmeli.
3. `npm.cmd run build` üretim paketi oluşturabilmeli.
4. `npm.cmd run e2e` senaryoları 3 viewport'ta (mobil 390x844, tablet 768x1024, masaüstü 1440x900) yeşil geçmeli.
5. PWA manifest geçerli olmalı, `theme_color`, `icons`, `display: standalone` içermeli.
6. Arayüzde mobil dokunma hedefleri en az 44x44 px olmalı, yatay kaydırma olmamalı.

## 8. Riskler ve Açık Sorular
- Node v24 ve Windows PowerShell script çalıştırma kısıtlaması nedeniyle script çalıştırmalarında `npm.cmd` ve `npx.cmd` kullanılmalıdır.

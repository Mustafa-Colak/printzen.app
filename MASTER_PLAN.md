# Printzen.app — MASTER PLAN
> Son Güncelleme: 18 Eylül 2026 | Durum: Aktif Geliştirme

---

## 1. Proje Kimliği, Amacı ve Kapsamı
Printzen, web tabanlı yazılımlar (Web POS, e-ticaret, depo, restoran otomasyonları) ve mobil cihazlar için termal fiş ve etiket yazdırma çözümleri sunan modern bir platformdur.
- **Hedef Kitle:** Web POS geliştiricileri, restoran & kafe işletmecileri, depo yöneticileri ve Android mobil saha ekipleri.
- **Temel Yetenekler:** ESC/POS, ZPL, TSPL ve CPCL protokolleriyle sürücüsüz doğrudan yazdırma; Android Print Service uygulaması (`com.mobileprint.service`); Web Bluetooth, WebUSB, Raw TCP (Port 9100) ve WebSocket köprüleri; 91 teknik rehber ve 2.500 yazıcı modeli bilgi bankası.

---

## 2. Mimari ve Teknoloji Yığını
- **Frontend / SSG:** Astro v4 (Static Site Generation), Tailwind CSS
- **Çoklu Dil (i18n):** EN (varsayılan) ve TR rotaları, `trailingSlash: 'always'` standart kanonik yapı
- **Hosting & Dağıtım:** Cloudflare Workers (Static Assets, `auto-trailing-slash`), Cloudflare Custom Domain (`printzen.app`, `www.printzen.app`)
- **DNS & E-posta:** Cloudflare DNS, Cloudflare Email Routing (`support@printzen.app` → Gmail)
- **Mobil Uygulama:** Android Native Print Service (Google Play Billing, BT Plan $9.90, Full Plan $14.90)
- **Kalite & Güvenlik:** `scripts/qa-agent-audit.mjs` (CI Quality Gate, 0 tolerans), `@astrojs/sitemap`

---

## 3. Kodlama, Tasarım ve Kalite Standartları
- **SEO & URL Standartları:** Bütün rotalar, dahili bağlantılar ve sitemap URL'leri istisnasız trailing slash (`/`) ile biter. 301 yönlendirmeleri doğrudan nihai canonical URL'ye yapılmalıdır (redirect chain yasaktır).
- **QA Gate Kuralları:** `npm run qa` (`node scripts/qa-agent-audit.mjs`) çalıştırılmadan derleme veya deploy yapılamaz. Başlık tekrarları ("Rehberi Rehberi"), kod sayfası tezatları, eksik frontmatter ve FAQ kuralları deterministik denetlenir.
- **Tek Doğruluk Kaynağı İlkesi:** Proje hakkında tüm kararlar ve ilerleme bu `MASTER_PLAN.md` dosyasına işlenir. Bağımsız `TODO.md` açılmaz.
- **Canlıda Test Etmeden Asla 'Bitti' Deme Kuralı:** Kod git `master` dalına gönderildikten sonra canlı sunucuda (`https://printzen.app/`) HTTP 200, HTML selector ve canonical doğrulaması yapılmadan iş tamamlandı sayılamaz.

---

## 4. Dizin ve Dosya Hiyerarşisi
```
c:\edev\printzen.app\
├── astro.config.mjs               # Astro yapılandırması (trailingSlash: 'always', sitemap, i18n)
├── wrangler.jsonc                 # Cloudflare Workers static assets konfigürasyonu
├── public\
│   ├── _redirects                 # Cloudflare Pages/Workers 301/302 yönlendirmeleri
│   ├── robots.txt                 # Arama motoru tarama kuralları & sitemap referansı
│   └── MobilePrintService.apk     # Doğrudan indirme APK dosyası
├── scripts\
│   ├── qa-agent-audit.mjs         # İçerik ve teknik kalite kapısı denetçisi
│   └── gsc-report.mjs             # Haftalık Google Search Console analiz motoru
├── src\
│   ├── components\                # Nav, Footer, SearchModal vb. bileşenler
│   ├── content\guides\            # 91 teknik makale (tr/ ve en/ markdown koleksiyonları)
│   ├── layouts\BaseLayout.astro   # Kanonik etiketler, hreflang, OpenGraph, noindex
│   ├── pages\                     # /guides, /tr/rehberler, /printers, /tr/yazicilar, yasal sayfalar
│   └── utils\i18n.ts              # Dil dönüştürme ve alternatif yol yardımcıları
└── MASTER_PLAN.md                 # Tek doğruluk kaynağı
```

---

## 5. Canlı Durum ve Görev Takvimi (Backlog)
- [x] **Amiral Rehberler (Pillars):** 10 temel mimari rehber yazıldı ve yayına alındı.
- [x] **Uydu Rehberler (Satellites):** 40 uzmanlık makalesi tamamlandı.
- [x] **Kanibalizasyon Temizliği:** Yinelenen 6 makale ana pillar'lara 301 ile birleştirildi.
- [x] **QA Gate Entegrasyonu:** Windows CRLF uyumu sağlandı; 0 hata ile GitHub Actions CI devrede.
- [x] **GSC İndeksleme & Trailing Slash Optimizasyonu:**
  - `astro.config.mjs`'e `trailingSlash: 'always'` eklendi.
  - Menü, alt bilgi, rehber kartları, ana sayfa ve breadcrumb linkleri slash (`/`) ile mühürlendi.
  - `_redirects` dosyasındaki tüm hedefler slash'lı yapılarak 301 ➔ 307 zincirleri kırıldı.
  - `activate.astro` lisans sayfasına `noindex, nofollow` eklendi.
  - `woo-multi-sync.astro` sayfasına canonical etiketi eklendi.
  - Canlı Cloudflare Worker üzerinde doğrulandı (HTTP 200, slash'lı linkler, noindex).
- [x] **GSC Doğrulaması:** Kullanıcı Search Console panelinden 'Düzeltmeyi Doğrula' butonuna bastı (Google tarama ve doğrulama döngüsü başlatıldı).
- [x] **31 Ekim 2026 — Dayanıklı Dağıtık Sistem Mimarisi & Sam Newman (PRN-003):** Çift dilli (TR & EN) kılavuz 5 FLUX WebP görseliyle yayına alındı.
- [x] **31 Ekim 2026 — Yüksek Performanslı Kod Mimarisi & Casey Muratori (PRN-004):** Çift dilli (TR & EN) kılavuz 5 FLUX WebP görseliyle yayına alındı.
- [ ] **WooCommerce Çoklu Mağaza Senkronizasyon Sayfası (woo-multi-sync):** TR versiyonu ve i18n altyapısı.

---

## 6. Oturum Seyir Defteri (Changelog)
- **11 Eylül 2026:** 91 rehber konsolide edildi; `rehberler-sorun-tespiti.md` üzerindeki 8 madde çözüldü; 6 kanibalize makale `_redirects` ile birleştirildi.
- **18 Eylül 2026 - 01:45 (GSC İndeksleme Engelleri & Trailing Slash Düzeltmesi):**
  - Search Console'un ilettiği 'Doğru standart etikete sahip alternatif sayfa' ve 'Yönlendirmeli sayfa' uyarıları incelendi.
  - Cloudflare Workers `auto-trailing-slash` modu ile sitedeki slash'sız dahili linklerin (`/tr/rehberler`, `/terms`, `/guides/slug` vb.) sürekli 307 Temporary Redirect üreterek crawl bütçesini tükettiği tespit edildi.
  - `astro.config.mjs` `trailingSlash: 'always'` yapıldı. `Nav.astro`, `Footer.astro`, `index.astro`, `tr/index.astro`, `guides/index.astro`, `tr/rehberler/index.astro`, `[slug].astro` ve markdown iç bağlantıların tamamına trailing slash eklendi.
  - `_redirects` dosyası güncellenerek 301 ➔ 307 zincirleri sıfırlandı. `activate.astro` için `noindex` tanımlandı, `woo-multi-sync.astro` için canonical eklendi.
  - `qa-agent-audit.mjs` Windows CRLF regex sorunu düzeltildi; `npm run qa` 0 hata ile geçti.
  - Değişiklikler GitHub `master` dalına push edildi (`0943bc4`). Canlı ortamda curl ve Node fetch testleriyle linklerin sonundaki `/`, `/activate/` sayfasındaki `<meta name="robots" content="noindex, nofollow">` ve `/terms/` sayfasının HTTP 200 yanıtı bizzat kanıtlandı.
- **23 Ekim 2026 - 18:00 (`TASK-2026-958` Çift Dilli Çevrimiçi ZPL Etiket Önizleme Rehberi & Kuyruk Temizliği):**
  - `src/content/guides/tr/cevrimici-zpl-etiket-onizleme-ve-test-rehberi.md` ve `src/content/guides/en/online-zpl-viewer-label-preview-testing-guide.md` (`translationKey: online-zpl-viewer-label-preview`) oluşturuldu; 0 hata ve 0 uyarı ile `npm run qa` kalite kapısından geçti ve `origin/master` dalına push edildi (`5ad4fba`).
  - `master-backlog.json` içindeki `TASK-2026-958`, `TASK-2026-959`, `TASK-2026-864` ve `TASK-2026-735` tamamlandı (`DONE`) olarak işaretlendi; `TASK-2026-944` (Linux CUPS) kapsam dışı olarak elendi.
- **23 Ekim 2026 - 21:28 (`TASK-2026-345` Sessiz Bulut Baskı & `TASK-2026-337` Sınır Ötesi E-İhracat Bulut Kargo Etiketi Otomasyonu — Çift Dilli 4 Rehber Yayında):**
  - **`TASK-2026-345` (`translationKey: silent-cloud-printing-browser-architecture`):** `src/content/guides/tr/tarayicidan-sessiz-bulut-baski-ve-dogrudan-yazdirma-rehberi.md` ve `src/content/guides/en/silent-cloud-printing-browser-webusb-websocket-guide.md` oluşturuldu (`>800` kelime, 4 SSS maddesi, WebUSB + WebSocket-TCP 9100 kod örnekleri).
  - **`TASK-2026-337` (`translationKey: cross-border-ecommerce-shipping-label-automation`):** `src/content/guides/tr/sinirotesi-e-ihracat-kargo-etiketi-ve-bulut-baski-otomasyonu.md` ve `src/content/guides/en/cross-border-ecommerce-shipping-label-cloud-printing-automation.md` oluşturuldu (`>800` kelime, 4 SSS maddesi, `^CI28` çok dilli `4x6 inç` ZPL şablonu ve Base64 ZPL sıfır tıklamalı paketleme istasyonu kodu).
  - `node scripts/qa-agent-audit.mjs` kalite kapısından `0 hata / 0 yeni uyarı` ile geçti; Cloudflare Workers (`https://printzen.app/`) üzerine deploy edilip `HTTP 200` ile doğrulandı.
- **30 Ekim 2026 - 23:33 (`PRN-001` DevTools Ürün Hızı & Cat Wu Anthropic Vaka Analizi — Çift Dilli Rehber Yayında):**
  - `src/content/guides/tr/gelistirici-araclari-urun-hizi-api-sdk-ekipleri.md` ve `src/content/guides/en/developer-tools-product-velocity-api-sdk-teams.md` (`translationKey: gelistirici-araclari-urun-hizi-api-sdk-ekipleri`) yayınlandı.
  - 1 kapak + 4 gövde olmak üzere 5 adet 1376x768 WebP görsel ComfyUI FLUX.1-Dev motoruyla üretildi.
  - `node scripts/qa-agent-audit.mjs` ve `check-terminology.mjs` (0 hata) doğrulandı; 199 sayfa derlendi ve `origin/master` dalına push edilerek canlıda HTTP 200 ve IndexNow (200 OK) ile mühürlendi.
- **31 Ekim 2026 - 00:09 (`PRN-002` Spesifikasyon Odaklı Ürün Geliştirme & Ryan Nystrom Notion Vaka Analizi — Çift Dilli Rehber Yayında):**
  - `src/content/guides/tr/spesifikasyon-odakli-gelistirme-ve-sifir-hatali-api-mimarisi.md` ve `src/content/guides/en/spec-driven-development-zero-defect-api-architecture.md` (`translationKey: spesifikasyon-odakli-gelistirme-ve-sifir-hatali-api-mimarisi`) yayınlandı.
  - 1 kapak + 4 gövde olmak üzere 5 adet 1376x768 WebP görsel ComfyUI FLUX.1-Dev motoruyla üretildi.
  - `node scripts/qa-agent-audit.mjs` ve `check-terminology.mjs` (0 hata) doğrulandı; 207 sayfa derlendi, Cloudflare Workers üzerine deploy edildi ve canlıda HTTP 200 ve IndexNow (207 URL, 200 OK) ile mühürlendi.
- **31 Ekim 2026 - 01:20 (PRN-003 Dayanıklı Yapay Zekâ Destekli Dağıtık Sistem Mimarisi & Sam Newman Vaka Analizi — Çift Dilli Rehber Yayında):**
  - src/content/guides/tr/dayanikli-yapay-zeka-dagitik-sistem-mimarisi-afet-kurtarma.md ve src/content/guides/en/building-resilient-ai-powered-distributed-systems.md (	ranslationKey: dayanikli-yapay-zeka-dagitik-sistem-mimarisi-afet-kurtarma) yayınlandı.
  - 1 kapak + 4 gövde olmak üzere 5 adet 1376x768 WebP görsel ComfyUI FLUX.1-Dev motoruyla üretildi.
  - 
ode scripts/qa-agent-audit.mjs ve check-terminology.mjs (0 hata) doğrulandı; 209 sayfa derlendi, GitHub master dalına push edildi, canlıda HTTP 200 ve IndexNow (200 OK) ile mühürlendi.

- **31 Ekim 2026 - 08:05 (PRN-004 Yüksek Performanslı Kod Mimarisi & Casey Muratori — Çift Dilli Rehber Yayında):**
  - src/content/guides/tr/yuksek-performansli-kod-mimarisi-donanim-ve-cpu-verimliligi.md ve src/content/guides/en/why-performant-code-matters-hardware-cpu-efficiency.md (	ranslationKey: yuksek-performansli-kod-mimarisi-donanim-ve-cpu-verimliligi) yayınlandı.
  - 1 kapak + 4 gövde olmak üzere 5 adet 1376x768 WebP görsel ComfyUI FLUX.1-Dev motoruyla üretildi (Pillow rozetleri, sıfır yabancı harf).
  - 
ode scripts/qa-agent-audit.mjs ve check-terminology.mjs (0 hata) doğrulandı; 211 sayfa derlendi, Cloudflare Workers ve GitHub master dalına push edildi, canlıda HTTP 200 ve IndexNow (211 URL, 200 OK) ile mühürlendi.

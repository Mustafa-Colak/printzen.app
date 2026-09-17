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
- [ ] **GSC Doğrulaması:** Kullanıcının Search Console panelinden 'Düzeltmeyi Doğrula' butonuna basması.
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

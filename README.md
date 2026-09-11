# Printzen.app

Mobile Print Service Android uygulamasının tanıtım sitesi + termal/termal
transfer yazdırma konularında içerik portalı.

> **İlişkili proje:** `c:\edev\mobile-print-service-android` (aynı workspace,
> ayrı repo) — bu sitenin tanıttığı Android uygulaması. Fiyatlandırma, plan
> isimleri, Play Store linki, paket adı, gizlilik/iade politikası metinleri
> gibi konularda **bu iki repo birbirini etkiler** — bu sitede pricing/legal
> içerik değiştirirken uygulama tarafında (`ProManager`, `PlayBillingManager`)
> gerçek plan/fiyat bilgisiyle tutarlı olduğunu kontrol et, tam tersi de
> geçerli.

## Teknoloji

- **[Astro](https://astro.build)** (statik site üretici, sıfır varsayılan JS)
- **Tailwind CSS** — CDN üzerinden (`?plugins=typography`), build adımı yok
- **Barındırma:** Cloudflare Pages (statik çıktı, ücretsiz katman)
- **Domain/DNS:** Cloudflare (bkz. `INFRASTRUCTURE.md`)

## Dil Yapısı (i18n)

Site iki dilde: İngilizce (varsayılan) ve Türkçe.

- **İngilizce sayfalar önek almaz:** `/`, `/guides`, `/terms` ...
- **Türkçe sayfalar `/tr/` önekiyle:** `/tr/`, `/tr/rehberler`, `/tr/terms` ...

Her sayfa **ayrı, tek dilde statik bir HTML dosyası** olarak üretilir — eski
"tek URL + CSS ile göster/gizle" yaklaşımı SEO için terk edildi (Google'ın
önerdiği `hreflang` + ayrı URL yöntemine geçildi, bkz. `astro.config.mjs`
`i18n` bloğu).

Her sayfa çiftinde:
- `<link rel="canonical">` — kendi URL'i
- `<link rel="alternate" hreflang="en"|"tr"|"x-default">` — karşılıklı bağlantı
- Nav'daki dil butonu artık JS toggle değil, karşı dildeki **gerçek sayfa linki**

**Önemli:** URL segmentleri de dile göre çevrilir, sadece `/tr` önek eklenmez —
`guides` → `rehberler`, `printers` → `yazicilar` (Türkçe arama sonuçlarında
daha iyi eşleşme + daha "yerli" görünüm için). Bu yüzden çoğu sayfada
`getAlternatePath()`'in genel `/tr` önek-değiştirme mantığı YETERSİZ kalır —
`BaseLayout`/`Nav`'a açık bir `alternatePath` prop'u geçilerek bu durum
override edilir (bkz. `guides/index.astro` ↔ `tr/rehberler/index.astro`,
`printers/index.astro` ↔ `tr/yazicilar/index.astro`).

Rehber detay sayfalarında (`guides/[slug].astro`) slug'lar da dile göre
çevrilir (örn. `android-bluetooth-printer-setup` ↔
`android-bluetooth-yazici-kurulumu`) — bu yüzden eşleştirme dosya adı yerine
frontmatter'daki ortak `translationKey` alanıyla yapılır (aşağıya bkz.).

Yeni bir **statik sayfa** (terms/privacy/refund gibi, slug'ı sabit) eklerken
diğer dildeki karşılığını da eklemen yeterli — `getAlternatePath()` otomatik
eşler. Yeni bir **rehber/slug'lı sayfa** eklerken `alternatePath`'i elle
hesaplayıp geçmen gerekir (mevcut `[slug].astro` dosyalarındaki örneğe bak).

## İçerik Yönetimi (Content Collections)

`src/content/` altında iki koleksiyon (bkz. `src/content/config.ts`):

### `printers` (data koleksiyonu, YAML)
Yazıcı uyumluluk veritabanı girişleri (`/printers`, `/tr/yazicilar`). Her
dosya bir yazıcı modeli: marka, sınıf (mobile/desktop/industrial), bağlantı
tipi, komut dili, baskı türü, Mobile Print Service tarafından destek
durumu. `notes` alanı `{en, tr}` olarak iki dilli.

### `guides` (content koleksiyonu, Markdown)
Kurulum rehberleri (`/guides/[slug]`, `/tr/rehberler/[slug]`).
`src/content/guides/en/` ve `src/content/guides/tr/` altında **dosya adı
İngilizce/Türkçe farklı olabilir** — örn. `en/android-bluetooth-printer-setup.md`
+ `tr/android-bluetooth-yazici-kurulumu.md`. Slug, klasör önekinden
(`en/`, `tr/`) arındırılarak üretilir (yani dosya adı = URL slug'ı).

Eşleştirme dosya adına değil, frontmatter'daki **`translationKey`** alanına
göre yapılır — iki dildeki karşılık gelen dosyalar aynı `translationKey`
değerine sahip olmalı (örn. ikisi de `translationKey: android-bluetooth-printer-setup`).

Yeni rehber eklemek için: iki dilde birer `.md` oluştur (dosya adları farklı
olabilir, Türkçe slug Türkçe olsun), frontmatter'da `title`, `description`,
`printerClass`, (opsiyonel) `brand`, `publishDate`, ve **aynı `translationKey`**
değerini doldur.

## SEO

- **Sitemap:** `@astrojs/sitemap` ile otomatik üretilir (`/sitemap-index.xml`).
  ⚠️ Paket sürümü **3.2.1'e sabit** — daha yeni sürümler (3.3+) Astro 6 için
  build edilmiş, bu projedeki Astro 4 ile build hatası veriyor.
- **robots.txt:** `public/robots.txt`, sitemap'e referans veriyor
- **Structured data (JSON-LD):** `Organization` (sitewide, `BaseLayout.astro`),
  `Article` (rehber sayfalarında)
- **Open Graph / Twitter Card:** `BaseLayout.astro`'da, her sayfanın
  `title`/`description` prop'undan otomatik üretilir
- **Eksik:** Sosyal paylaşım için özel bir OG görseli (1200×630) yok — şu an
  paylaşımlarda görsel önizleme çıkmaz, ileride eklenmeli

## Sayfa Yapısı

```
src/pages/
  index.astro              (EN ana sayfa)
  terms.astro / privacy.astro / refund.astro
  guides/index.astro       (EN rehber listesi)
  guides/[slug].astro      (EN rehber detay — content collection'dan otomatik üretilir)
  printers/index.astro     (EN yazıcı veritabanı)
  activate.astro           (Türkçe özel: uygulama lisans aktivasyon deep-link sayfası, dil çiftlemesi yok)
  tr/
    index.astro / terms.astro / privacy.astro / refund.astro
    rehberler/index.astro / rehberler/[slug].astro
    yazicilar/index.astro
```

## Geliştirme

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # dist/ üretir
npm run preview   # build çıktısını lokal sunar
```

## Deploy Akışı

`master` branch = production (`printzen.app`), Cloudflare Pages otomatik deploy eder.
Yeni özellikler için ayrı branch aç → Cloudflare Pages preview URL'inde kontrol et →
`master`'a merge et. Büyük altyapı değişiklikleri (ör. Astro migration,
i18n routing) tek seferlik, kapsamlı doğrulama sonrası merge edilir; küçük
içerik eklemeleri (yeni rehber/yazıcı) doğrudan küçük branch'lerle
aşamalı olarak canlıya alınabilir.

Detaylı altyapı (DNS, Play Billing, vs.) için bkz. `INFRASTRUCTURE.md`.
Portal içerik planı için bkz. `PLAN.md`.

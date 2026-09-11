# Printzen Infrastructure

## Genel Bakış

```
Kullanıcı → printzen.app (Cloudflare Pages)
Satın alma → Google Play Billing (uygulama içi, doğrudan) → Google Play satın alma kaydı
Destek → support@printzen.app (Cloudflare Email Routing → Gmail)
```

> **Not (2026-07):** Ödeme akışı Paddle + fly.io license server'dan Google Play
> Billing'e taşındı (bkz. mobile-print-service-android CLAUDE.md, v2.6.0).
> Aşağıdaki Paddle/License Server/Resend bölümleri artık bu ürün için
> **kullanılmıyor** — kayıt amaçlı tutuluyor, gerçekten kapatılıp
> kapatılmadıkları (Fly.io app, Paddle hesabı, Resend domain) dashboard'lardan
> ayrıca doğrulanmalı.

---

## 1. Domain — Cloudflare

**Registrar:** IHS (ihsdns.com)
**DNS Yönetimi:** Cloudflare
**Nameservers:** `crystal.ns.cloudflare.com`, `kellen.ns.cloudflare.com`

### DNS Kayıtları (Cloudflare)

| Type  | Name                  | Content                          | Açıklama             |
|-------|-----------------------|----------------------------------|----------------------|
| CNAME | printzen.app          | `<proje>.pages.dev` _(TODO: gerçek Cloudflare Pages proje subdomain'i ile doldur — Cloudflare CNAME flattening ile apex'te çalışır)_ | Cloudflare Pages |
| CNAME | www                   | `<proje>.pages.dev` _(TODO: yukarıdakiyle aynı)_ | Cloudflare Pages www |
| MX    | printzen.app          | route1/2/3.mx.cloudflare.net     | Email Routing        |
| MX    | send                  | feedback-smtp.us-east-1.amazonses.com | Resend SPF (muhtemelen artık gereksiz) |
| TXT   | printzen.app          | v=spf1 include:_spf.mx.clo...   | Cloudflare SPF       |
| TXT   | resend._domainkey     | p=MIGfMA0GCSqGSIb...            | Resend DKIM (muhtemelen artık gereksiz) |
| TXT   | send                  | v=spf1 include:amazonses...     | Resend SPF (muhtemelen artık gereksiz) |
| TXT   | _dmarc                | v=DMARC1; p=none;               | DMARC                |
| TXT   | cf2024-1._domainkey   | v=DKIM1; h=sha256...            | Cloudflare DKIM      |

### Email Routing
- `support@printzen.app` → Gmail'e yönlendirildi ✅ (2026-07-06'da test edildi, çalışıyor)

---

## 2. Website — Cloudflare Pages

**Repo:** github.com/Mustafa-Colak/printzen-website
**Branch:** master (auto-deploy)
**URL:** https://printzen.app
**Framework:** Astro (statik, i18n routing — bkz. `README.md`)

### Yapı
- `/` — Ana sayfa (EN, varsayılan) · `/tr/` — Türkçe sürüm
- `/terms`, `/privacy`, `/refund` — Yasal sayfalar (EN, `/tr/` altında Türkçe)
- `/guides`, `/tr/rehberler` — Kurulum rehberleri (Content Collections)
- `/printers`, `/tr/yazicilar` — Yazıcı uyumluluk veritabanı
- `/activate` — Eski lisans aktivasyon deep-link sayfası (Türkçe, artık uygulama
  tarafında işlenmiyor — bkz. not aşağıda)

Detaylı mimari için bkz. `README.md`, portal içerik planı için `PLAN.md`.

---

## 3. Ödeme — Google Play Billing

**Ürünler (INAPP, non-consumable, tek seferlik):**

| Plan     | Fiyat  | Play Console Product ID |
|----------|--------|--------------------------|
| BT Plan  | $9.90  | `bt_plan`                |
| Full Plan| $14.90 | `full_plan`              |

- Satın alma tamamen uygulama içinde (`PlayBillingManager`), harici webhook/sunucu yok
- Doğrulama: `queryPurchasesAsync()` — uygulama her açılışında (`MainActivity.onResume()`) kontrol eder
- İade: Google Play'in kendi 48 saatlik otomatik penceresi + Printzen'in 30 günlük garantisi (bkz. `refund.astro`)
- Restore: Aynı Google hesabıyla herhangi bir cihazda otomatik

> Play Console'daki ürün fiyatları/isimleri gerçek kaynak — bu tablo sadece
> referans, Play Console ile çelişirse Play Console esas alınır.

---

## 4. ~~License Server — fly.io~~ (ARTIK KULLANILMIYOR)

**App:** license-server-mps
**URL:** https://license-server-mps.fly.dev
**Repo:** c:\edev\license-server

Google Play Billing'e geçişle birlikte bu servis artık Mobile Print Service
tarafından kullanılmıyor (`LicenseManager` kod tabanından kaldırıldı, v2.6.0).
Fly.io'da hâlâ çalışıyorsa gereksiz maliyet oluşturuyor olabilir — kapatılıp
kapatılmayacağına karar verilmeli (başka bir ürün tarafından kullanılmıyorsa
`fly apps destroy license-server-mps` ile kaldırılabilir).

<details>
<summary>Eski API referansı (arşiv)</summary>

| Method | Path                        | Açıklama                    |
|--------|-----------------------------|-----------------------------|
| POST   | /webhook/paddle             | Paddle ödeme webhook        |
| GET    | /api/license/activate       | Lisans aktivasyonu          |
| GET    | /api/license/verify         | Lisans doğrulama            |
| GET    | /api/release/latest         | Güncelleme kontrolü         |
| GET    | /admin/*                    | Admin paneli                |
| GET    | /health                     | Health check                |

</details>

---

## 5. ~~Email — Resend~~ (ARTIK KULLANILMIYOR)

Lisans anahtarı e-postaları Resend üzerinden gönderiliyordu — Play Billing'de
lisans anahtarı kavramı olmadığı için bu akış artık çalışmıyor. Resend
hesabı/domain doğrulaması başka bir amaçla kullanılmıyorsa iptal edilebilir.

---

## 6. Android App — Google Play

**Package:** com.mobileprint.service
**Play Store:** [Printzen Mobile Print Services](https://play.google.com/store/apps/details?id=com.mobileprint.service) — yayında
**Releases (GitHub, yedek/manuel dağıtım):** c:\edev\mobile-print-service-android\releases\
**Current:** v2.6.2

Lisans/satın alma tamamen Google Play üzerinden yönetiliyor — uygulama içinde
manuel anahtar girişi yok.

### `/activate` sayfası hakkında
`printzen.app/activate`, eski lisans-anahtarı e-posta akışının deep-link
sayfasıydı (`mps://activate?key=...`). Uygulama artık bu deep-link'i
işlemiyor (`LicenseManager` kaldırıldı) — sayfa fiilen ölü, silinip
silinmeyeceğine karar verilmeli.

---

## Akış: Satın Alma → Yetkilendirme (Güncel)

```
1. Kullanıcı uygulama içinde "BT Plan" veya "Full Plan" satın alma butonuna basar
2. Google Play Billing checkout akışı açılır (native, uygulama içinde)
3. Ödeme tamamlanınca PlayBillingManager.onPurchasesUpdated() tetiklenir
4. Satın alma acknowledge edilir (3 gün içinde yapılmazsa Google otomatik iade eder)
5. ProManager.setPlan() ile yerel durum güncellenir (SharedPreferences)
6. Her uygulama açılışında (MainActivity.onResume) queryAndUpdatePurchases()
   Google Play'e sorup durumu tazeler — offline'da veya uygulama açılmazsa
   son bilinen durum korunur (bkz. sohbet: iade/offline davranışı, 2026-07-06)
```

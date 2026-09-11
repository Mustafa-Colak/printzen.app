# Printzen /tr/rehberler İçerik Denetimi — Bulgular ve Yapılacaklar

_Tarih: 2026-09-11 · Kaynak: https://printzen.app/tr/rehberler (91 ana rehber + 2.500 TR cihaz-özel doorway sayfa) örneklem incelemesi_

Bu dosya, sitedeki içerik/kod sorunlarının tespit edilen kök nedenlerini ve hangi dosyada ne yapılması gerektiğini listeler. Hiçbir değişiklik uygulanmadı — bu sadece bir yapılacaklar listesidir.

---

## 1. [KÖK NEDEN] "Rehberi Rehberi" başlık tekrarı bug'ı

**Dosya:** `scripts/generate-all-2500-pseo.mjs`, satır 248

```js
${m.brand} ${m.model} ${topic.title} Rehberi
```

`topic.title` zaten "...Rehberi" ile bitiyorsa (ör. id:41 `'Bluetooth Termal Yazıcı Bağlantı Sorunları Rehberi'`) sonuna bir "Rehberi" daha ekleniyor ve H1 başlığı "...Rehberi Rehberi" olarak çıkıyor.

**Doğrulama:** `grep -rl "Rehberi Rehberi" public/tr/rehber/` → **50 dosya** etkileniyor.

**Yapılacak:**
1. Satır 248'i koşullu hale getir: `topic.title.endsWith('Rehberi') ? topic.title : topic.title + ' Rehberi'`.
2. `scripts/` altındaki diğer generator dosyalarında (`build-pseo-2500.mjs`, `generate-missing-hubs.mjs`, `expand-and-build-hubs.mjs`, `enrich-existing-pillars.mjs`) aynı desenin tekrarlanıp tekrarlanmadığını kontrol et — hepsi benzer pSEO şablonları üretiyor, kopya kod olma ihtimali yüksek.
3. Script düzeltildikten sonra, etkilenen 50 statik dosyayı yeniden üret ve `public/tr/rehber/` altına üzerine yaz (bu dosyalar build-time'da otomatik oluşmuyor, önceden üretilip repoya commit edilmiş statik HTML).

---

## 2. Şablon cümlesindeki bozuk Türkçe

**Dosya:** `scripts/generate-all-2500-pseo.mjs`, satır 251

```js
cihazın <strong>${topic.title.toLowerCase()}</strong> süreçlerini, ${m.proto} protokol parametrelerini...
```

Konu başlığı (`topic.title`) ham haliyle cümleye enjekte ediliyor. Örnek çıktı:

> "cihazın **bluetooth termal yazıcı bağlantı sorunları rehberi** süreçlerini... inceleyeceğiz"

Bu gramer olarak bozuk ("rehberi süreçlerini" anlamsız). Konu başlığı zaten "Rehberi" ile bittiğinde durum daha da kötüleşiyor.

**Yapılacak:** `topics` dizisindeki her objeye ayrı bir kısa isim tamlaması alanı ekle (ör. `processNoun: 'bluetooth bağlantı sorunlarının giderilmesi'`) ve cümleyi bu alanla kur. 50 konu için elle yazılması gerekir, otomatik/regex ile düzeltilemez.

---

## 3. Aynı sayfa içinde çelişen teknik veri — Türkçe karakter rehberi

**Dosya:** `src/content/guides/tr/termal-yazici-turkce-karakter-sorunu-cozumu.md`

Sayfanın kendi içinde iki farklı CP857 seçim komutu veriliyor:
- Üst bölümde ve JS örneğinde: `ESC t 18` (hex `0x12`) — sayfanın kendi karakter tablosuyla (ğ:0xA6, Ğ:0xA7) tutarlı.
- Sayfanın sonuna eklenmiş ikinci bir bölümde: `ESC t 19` (hex `0x13`) — ve bu bloktaki JS fonksiyonunda `ğ`/`Ğ` bayt değerleri **ters** verilmiş (ğ:0xA7, Ğ:0xA6).

Sayfanın kendi referans tablosu ilk değeri (18 / ğ:0xA6) doğruluyor, yani ikinci blok muhtemelen yanlış ve kopyalayan geliştiricide ğ/Ğ karakterlerini birbirine karıştırır.

**Yapılacak:**
1. Gerçek donanımda veya üretici ESC/POS komut referansında hangi değerin doğru olduğunu teyit et.
2. Dosyadaki tüm örnekleri (metin + iki JS kod bloğu + tablo) tek bir doğru değere göre birleştir.
3. Sayfanın sonundaki "başlıksız ek bölüm" (madde 5'te bahsedilen genel desen) muhtemelen ayrı bir üretim adımından kopyalanıp yapıştırılmış — kaynağını bul (`enrich-existing-pillars.mjs` olabilir, kontrol et).

**İlgili tutarsızlık:** `scripts/generate-all-2500-pseo.mjs` satır 214'teki FAQ şablonu da sabit olarak `"CP857 (ESC t 19)"` yazıyor — hangi değer doğruysa (madde 3.1) onunla senkronize edilmeli, yoksa 2.500 doorway sayfasının tamamı da yanlış/tutarsız değeri yayar.

---

## 4. Sayfa içinde tekrarlayan "dikişlenmiş içerik" deseni

İncelenen örnek makalelerin (WooCommerce, Türkçe karakter, Bluetooth) hepsinde aynı yapı var: numaralı bölümler (1, 2, 3...) + SSS ile biten "ana" içerik, ardından **başlıksız/numarasız bir ek bölüm** geliyor ve bu bölüm ana içerikte zaten anlatılanları (bazen çelişerek) tekrar ediyor.

**Yapılacak:**
1. Bu ek bölümlerin hangi script/adımdan geldiğini bul (muhtemel aday: `enrich-existing-pillars.mjs`, ad olarak "zenginleştirme" işlemi yapıyor gibi duruyor — mevcut pillar'lara ikinci bir içerik bloğu ekliyor olabilir).
2. `src/content/guides/tr/*.md` içindeki tüm dosyaları tarayıp bu "ek blok" deseni olan dosyaları listele.
3. Her dosyada: ek bloğu ya sil, ya da ana içerikle birleştirip tekrarı/çelişkiyi gider.

---

## 5. Anahtar kelime kanibalizasyonu — somut örnek

**Dosyalar:**
- `src/content/guides/tr/woocommerce-yeni-siparis-otomatik-fis-tetikleme.md` (~311 kelime)
- `src/content/guides/tr/woocommerce-otomatik-termal-fis-kargo-etiketi-yazdirma.md` (~1227 kelime)

İkisi de aynı WordPress hook'unu (`woocommerce_order_status_processing`), aynı kod desenini ve aynı SSS mantığını işliyor — biri diğerinin kısaltılmış/erken versiyonu gibi duruyor.

**Yapılacak (karar gerektirir, otomatik çözülemez):**
- Ya kısa olanı (`...tetikleme.md`) sil ve linkleri uzun olana yönlendir (301 redirect),
- Ya da kısa olanı gerçekten farklı bir alt konuya (ör. sadece "processing hook'u" — kargo etiketi/şablon olmadan) odaklayarak yeniden yaz.

Aynı kanibalizasyon riski şu küme başlıklarında da var, tek tek incelenmesi gerekir:
- Bluetooth: 10 ayrı makale (`bluetooth-*`, `android-bluetooth-*`, `web-bluetooth-*`, `termal-yazici-bluetooth-pin-kodu-sorunlari`)
- Türkçe karakter/encoding: 5 makale (`termal-yazici-turkce-karakter-sorunu-cozumu`, `termal-yazici-utf8-desteklemiyorsa-karakter-temizleme`, `termal-yazicilarda-cp857-kod-sayfasi-tablosu`, `windows-1254-esc-pos-turkce-karakter-esleme`, `fiste-cikan-soru-isareti-ve-garip-sembolleri-duzeltme`)
- 100x150mm kargo etiketi: 3 makale (`100x150mm-kargo-barkod-sablonu-hazirlama`, `a4-kargo-pdf-100x150mm-termal-etiket-donusturme`, `trendyol-100x150mm-termal-barkod-yazdirma`)
- React/Vue hook entegrasyonu: 2 makale (`react-nextjs-vue-icin-usethermalprinter-kancasi`, `react-vue-termal-yazici-entegrasyon-kancalari-hooks`)

---

## 6. Kod örneklerinde güvenlik/tutarlılık sorunları

**Dosya:** `src/content/guides/tr/woocommerce-otomatik-termal-fis-kargo-etiketi-yazdirma.md` (ve muhtemelen aynı desenin geçtiği diğer WooCommerce makaleleri)

- Canlı API anahtarı doğrudan PHP string literal olarak gösteriliyor: `$api_key = 'PRZ_LIVE_SECRET_KEY_BURAYA';` — okuyucuyu secret'ı `functions.php` içine / git'e commit etme riskine sürüklüyor. `wp-config.php` sabiti veya ortam değişkeni kullanımı önerilmeli.
- Sayfadaki üç farklı kod bloğu tutarsız: biri `timeout => 15` kullanıyor, biri hiç `timeout` belirtmiyor; biri `wp_json_encode()`, biri düz `json_encode()` kullanıyor.
- SSS'teki bir cevap teknik olarak yanlış: `timeout => 5` ayarının isteği "arka plana attığını" (asenkron yaptığını) iddia ediyor. `wp_remote_post` varsayılan olarak **senkron/bloklayan** bir çağrıdır; `timeout` sadece bekleme süresini sınırlar. Gerçek asenkron çözüm `'blocking' => false` veya Action Scheduler kullanmaktır.

**Yapılacak:** Bu makaledeki (ve varsa diğer WooCommerce makalelerindeki) kod bloklarını tek bir tutarlı, güvenli örnekle değiştir; SSS cevabını düzelt.

---

## 7. Küçük tutarsızlık — rakam

Ana `/tr/rehberler` sayfasının meta açıklaması "50 ana konu rehberi" diyor, ama sayfada **91 farklı** `/tr/rehberler/*` linki var (50 "ana konu" + görünüşe göre ek/ikincil rehberler). Sayı muhtemelen güncel değil ya da "ana konu" tanımı netleştirilmeli.

**Yapılacak:** Meta açıklamayı gerçek sayıyla güncelle ya da 91 sayfanın hangisinin "ana konu" hangisinin ek olduğunu netleştirip açıklamayı buna göre düzelt.

---

## Öncelik sırası (önerilen)

1. **Madde 1** — script bug'ını düzelt (tek satır, düşük risk, yüksek görünürlük etkisi — 50 sayfa)
2. **Madde 1.3** — düzeltilmiş script ile 50 dosyayı yeniden üret
3. **Madde 3** — Türkçe karakter rehberindeki çelişkiyi teyit edip düzelt (yanlış teknik bilgi yayınlanıyor olabilir)
4. **Madde 4** — "dikişlenmiş ek bölüm" kaynağını bulup diğer makalelerde de tara
5. **Madde 2** — şablon cümlesini konu başına elle iyileştir (zaman alır, 50 konu)
6. **Madde 5** — kanibalizasyon kümelerini tek tek gözden geçirip birleştirme/redirect kararı ver
7. **Madde 6** — kod örneklerini güvenlik açısından düzelt
8. **Madde 7** — meta açıklama sayısını güncelle

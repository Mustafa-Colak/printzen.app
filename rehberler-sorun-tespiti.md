# Printzen /tr/rehberler İçerik Denetimi — Bulgular ve Yapılacaklar

_Tarih: 2026-09-11 · Kaynak: https://printzen.app/tr/rehberler (91 ana rehber + 2.500 TR cihaz-özel doorway sayfa) örneklem incelemesi_

Bu dosya, sitedeki içerik/kod sorunlarının tespit edilen kök nedenlerini ve hangi dosyada ne yapılması gerektiğini listeler.

## Durum güncellemesi (2026-09-11)

Aşağıdaki **1-8 numaralı maddelerin tamamı düzeltildi** — doğrudan kaynak kod (`src/`, `scripts/`, `dist/`, `public/`) ve QA testleri üzerinden teyit edildi:

- Madde 1: `h1Title` koşullu hale getirilmiş, `public/`+`dist/`'te "Rehberi Rehberi" 0 eşleşme.
- Madde 2: Her konuya özel `nounTr` alanı eklenmiş, şablon cümlesi artık doğal Türkçe üretiyor.
- Madde 3: `ESC t 18` tek değere birleştirilmiş, script'teki FAQ "modele göre değişir" diyerek dürüstleştirilmiş.
- Madde 4: Örneklenen 3 makalede (WooCommerce, Türkçe karakter, Bluetooth ana rehber) dikişlenmiş bölüm temizlenmişti.
- Madde 5: Kısa WooCommerce makalesi "Action Scheduler ile asenkron tetikleme" başlığıyla tamamen farklı bir alt konuya kaydırılmış, ana rehbere link veriyor.
- Madde 6: Kaynakta zaten düzeltilmişti; `dist/`/`public/` yeniden build edilmiş, artık temiz.
- Madde 7: Meta açıklama artık `${guides.length}` ile dinamik, gerçek sayıyı yazıyor.
- Madde 8: QA script'inin tespit ettiği 8 TR + 8 EN (28 uyarı) dosyanın tamamı incelendi; dikişlenmiş bölümler ve teknik çelişkiler temizlendi, değerli kısımlar (`Sayfa/Satır modu`, `ZPL flash şablon saklama`) SSS önüne taşındı.

Ayrıca `.github/workflows/content-qa.yml` (CI gate) ve `scripts/qa-agent-audit.mjs` devrede. `npm run qa` şu an **0 ERROR, 0 WARNING** ile **"ALL QUALITY GATES PASSED"** veriyor. `npm run build` ile 196 sayfa sıfır hatayla derleniyor.

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

## 8. [ÇÖZÜLDÜ] QA gate'in tespit ettiği kalan "dikişlenmiş bölüm" dosyaları (28 Uyarı Temizlendi)

`scripts/qa-agent-audit.mjs` tarafından işaretlenen 8 TR ve 8 EN makalesindeki 28 uyarı tek tek incelendi ve tamamı temizlendi:

**TR (8 dosya, 15 uyarı):**
- `bluetooth-termal-yazici-baglanti-sorunlari-rehberi.md`: SSS sonrası eksik ve tekrarlı teşhis matrisi temizlendi.
- `esc-pos-komut-dili-ve-fis-yazici-programlama.md`: SSS sonrası 6 ek bölümdeki `ESC t 19` CP857 çelişkisi ve geçersiz `ws://...:9100` soket kodu temizlendi; değerli `Sayfa Modu vs Satır Modu` bilgisi Bölüm 1.1 olarak SSS önüne taşındı.
- `pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon.md`: SSS sonrası tekrar eden kırpma mimarisi ve mock SDK çağrısı temizlendi.
- `restoran-kafe-mutfak-adisyon-yazdirma-mimarisi.md`: SSS sonrası tekrar eden istasyon dağıtım fonksiyonu ve buzzer tekrarları temizlendi.
- `web-bluetooth-termal-yazici-baglantisi.md`: SSS sonrası tekrar eden 20-bayt parçalama ve iOS Safari kısıtları temizlendi.
- `web-uygulamalari-termal-yazdirma-sdk-mimarisi.md`: SSS sonrası tekrar eden SDK interface şeması temizlendi.
- `web-uygulamalarinda-sessiz-yazdirma-silent-print.md`: SSS sonrası tekrar eden kiosk mod bayrakları ve yerel bridge temizlendi.
- `zebra-zpl-etiket-yazdirma.md`: SSS sonrası tekrar eden koordinat blokları temizlendi; değerli `^DF / ^XF` flash şablon saklama ve hız optimizasyonu konusu Bölüm 6 olarak SSS önüne taşındı.

**EN (8 dosya, 13 uyarı):**
- TR dosyalarındaki aynı yapı ve temizlikler 8 İngilizce eşdeğer dosyada da eksiksiz uygulandı.

**Sonuç:**
`npm run qa` çalıştırıldığında **0 Hata, 0 Uyarı** ile tüm kalite kapıları başarıyla geçmektedir. `npm run build` ile 196 sayfa sorunsuz derlenmektedir.

---

## Öncelik sırası (tamamlandı)

1. ~~Madde 1, 2, 3, 5, 6, 7~~ — ✅ çözüldü (commit `f65fbce`)
2. ~~Madde 4~~ — ✅ örneklenen 3 dosyada çözüldü
3. ~~Madde 8~~ — ✅ 8 TR + 8 EN dosyadaki 28 dikişlenmiş bölüm uyarısı temizlendi, değerli kısımlar SSS önüne taşındı
4. ~~QA Gate & Build~~ — ✅ `npm run qa` 0 hata/0 uyarı, `npm run build` 196 sayfa yeşil


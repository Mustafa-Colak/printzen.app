---
updatedDate: 2026-10-29
title: "ZPL II, TSPL2 ve ESC/POS ile GS1 Digital Link ve Dinamik 2B Karekod Programlama Rehberi"
description: "Bağlantılı ambalaj ve GS1 Sunrise 2027 geçişi kapsamında yeniden baskı gerektirmeyen GS1 Digital Link URI kodlaması, ZPL II (^BQ, ^BX), TSPL2 (QRCODE, DMATRIX) ve ESC/POS (GS ( k) hata düzeltme seviyeleri ile bulut baskı mimarisi."
printerClass: industrial
brand: Zebra
publishDate: 2026-10-29
translationKey: gs1-digital-link-dynamic-qr-datamatrix-zpl-tspl-escpos-programming
---

Üretim, e-ticaret, gıda ve ilaç lojistiğinde ambalaj üzerine basılan statik karekodlar (*"bas ve unut"* yaklaşımı), yalnızca sabit bir pazarlama URL'sine yönlendiği için ne depo/POS otomasyonuna veri sağlar ne de hedef sayfa değiştiğinde etiketin yeniden basılmasını önleyebilir [1]. **GS1 Digital Link Standardı (v1.2 / v1.3)** [2] ve **Temmuz 2024'te yürürlüğe giren AB Sürdürülebilir Ürünler İçin Ekotasarım Tüzüğü (Regulation EU 2024/1781 — ESPR Dijital Ürün Pasaportu / DPP)** [3], ürünün Küresel Ticari Ürün Numarasını (`AI 01 GTIN`), Parti/Lot kodunu (`AI 10`), Son Kullanma Tarihini (`AI 17`) ve Seri Numarasını (`AI 21`) standart bir HTTP URI yapısında (`https://id.marka.com/01/...`) birleştirerek tek bir **2B karekodun (ISO/IEC 18004 QR veya ISO/IEC 16022 DataMatrix)** hem mağaza kasasında, hem depoda hem de tüketici telefonunda çalışmasını mümkün kılmıştır.

Ancak 80 ila 120 karakterlik bir **GS1 Digital Link URI** dizisini termal etiket ve fiş yazıcılarda **ISO/IEC 15415** (`≥ 2,5 / B` kalite derecesi) standardında basabilmek [4]; **ZPL II (`^BQ` ve `^BX`)**, **TSPL2 (`QRCODE` ve `DMATRIX`)** ve **ESC/POS (`GS ( k`)** dillerinin veri ön eki kurallarını, Reed-Solomon hata düzeltme seviyelerini (`L/M/Q/H`) ve tam nokta (*integer dot*) modül genişliklerini doğru programlamayı gerektirir. Bu mühendislik rehberinde, yeniden baskı gerektirmeyen dinamik 2B karekodların üç ana termal yazıcı dilinde nasıl kodlandığını ve bulut üzerinden nasıl sürüldüğünü inceliyoruz.

<figure>
  <img src="/images/guides/gs1-digital-link-zpl-tr-01.webp" width="1376" height="768" alt="GS1 Digital Link URI yapısının bulut çözümleyici sunucu üzerinden ZPL II, TSPL2 ve ESC/POS termal yazıcılara dinamik 2B karekod olarak basılması" loading="eager" decoding="async" />
  <figcaption>Şekil 1: Tek bir GS1 Digital Link 2B karekodun POS kasası, depo el terminali ve tüketici/DPP ekranı için yeniden baskı gerektirmeyen dinamik çözümleyici mimarisi [1, 2, 3].</figcaption>
</figure>

---

## 1. Statik Karekod vs. GS1 Digital Link URI Sözdizimi: Neden Yeniden Baskı Gerekmez?

Klasik bir QR kod doğrudan uzun ve değişken bir hedef sayfa adresini (`https://www.ornek.com/kampanya-2025/urun-katalogu.pdf`) barındırdığında, ilgili sayfa kaldırıldığı anda sahadaki binlerce ambalaj geçersiz hale gelir [1]. **GS1 Digital Link** standardında ise etiket üzerine basılan URI **ürünün değişmez kimliğini** taşır; yönlendirme kararı buluttaki **Çözümleyici (*Resolver*)** sunucuda verilir [2]:

```text
https://id.ornek.com/01/08690123456789/10/LOT2026X/21/SN00984?17=271231
└────────┬─────────┘ └───────┬───────┘ └────┬────┘ └────┬───┘ └───┬───┘
   Çözümleyici Alan    AI (01) GTIN-14   AI (10)     AI (21)    AI (17)
    Adı (Kısa URI)     (Sabit 14 Hane)  Parti/Lot    Seri No   SKT (YYAAGG)
```

| Teknik Kriter | Statik "Bas ve Unut" QR Kod | GS1 Digital Link Dinamik 2B Karekod (QR & DataMatrix) |
| :--- | :--- | :--- |
| **Mağaza POS Kasası Okuması (GS1 Sunrise 2027)** | ❌ Okunamaz; POS sistemi pazarlama URL'sinden GTIN çıkaramaz | ✅ **Aralık 2027 Standardı:** Kasa okuyucusu `/01/` altındaki 14 haneli GTIN ve `?17=` SKT verisini çevrimdışı ayrıştırır [2] |
| **Depo / ERP Lot ve Seri İzlenebilirliği** | ❌ Parti (`AI 10`) veya seri (`AI 21`) verisi içermez | ✅ El terminali tek okutmada GTIN, Lot, SKT ve Seri numarasını ERP'ye aktarır [2, 4] |
| **Hedef Sayfa ve Mevzuat Güncellemesi** | ❌ URL değiştiğinde tüm etiket ve ambalajlar yeniden basılmalıdır | ✅ **Sıfır Yeniden Baskı:** Fiziksel etiket değişmeden bulut çözümleyici üzerinden hedef sayfa/dil güncellenir [1, 2] |
| **AB Dijital Ürün Pasaportu (ESPR 2024/1781)** | ❌ Tekil parti/seri kimliği olmadığı için DPP şartlarını karşılamaz | ✅ **Madde 9–13 Uyumlu:** Aynı karekod `linkType=gs1:dpp` parametresiyle resmi ürün pasaportunu açar [3] |
| **URI Sıkıştırma ve Matris Yoğunluğu** | Uzun URL'ler Versiyon 6+ (`41×41` modül) gerektirir; küçük etikete sığmaz | Kısa alan adı (`id.firma.tr`) ve kanonik GS1 yolu ile Versiyon 3–4 (`29×29` – `33×33` modül) içine sığar [4] |

<figure>
  <img src="/images/guides/gs1-digital-link-zpl-tr-02.webp" width="1376" height="768" alt="ZPL II ^BQ ve ^BX komutlarıyla 300 DPI termal yazıcıda GS1 Digital Link QR kod ve GS1 DataMatrix ECC 200 modül genişliği ve sessiz bölge yapısı" loading="lazy" decoding="async" />
  <figcaption>Şekil 2: 300 DPI termal baskı kafasında ZPL II ^BQ (Model 2 QR) ve ^BX (ECC 200 DataMatrix) sembollerinin tam nokta modül genişliği ve sessiz bölge (Quiet Zone) geometrisi [4].</figcaption>
</figure>

Tedarikçi ağında şablonların merkezi olarak kilitlenmesi ve sürüm kontrolü için [Tedarikçi Portalı ve ERP Sistemlerinden Merkezi ZPL/TSPL Etiket Şablon Yönetimi](/tr/rehberler/tedarikci-portali-merkezi-zpl-etiket-sablonu-yonetisimi-ve-erp-bulut-baski/) rehberimizi inceleyebilirsiniz.

---

## 2. ZPL II (`^BQ` ve `^BX`) ile GS1 Digital Link QR ve DataMatrix Kodlama

Zebra ve ZPL II uyumlu endüstriyel/masaüstü yazıcılarda dinamik 2B karekod basılırken geliştiricilerin en sık yaptığı hata, `^BQ` komutundan sonra gelen `^FD` (*Field Data*) alanına doğrudan `https://...` yazmaktır. **ZPL II ayrıştırıcısı `^BQ` sonrasında zorunlu bir yapılandırma ön eki (`[hata_düzeltme][veri_modu],`) bekler; bu ön ek yazılmazsa URL'nin ilk karakterleri yutulur ve bozuk karekod basılır** [4]:

* **`^BQa,b,c,d,e` Parametreleri:**
  - `a`: Yönlendirme (`N` = Normal, `R` = 90°, `I` = 180°, `B` = 270°).
  - `b`: QR Modeli (`2` = Geliştirilmiş **Model 2**; GS1 Digital Link için daima `2` seçilmelidir).
  - `c`: Büyütme faktörü / modül genişliği (`1`–`10` dot; `203 DPI` yazıcıda `4` veya `5`, `300 DPI` yazıcıda `5` veya `6` önerilir).
  - `d`: Hata düzeltme seviyesi (`H` = %30, `Q` = %25, `M` = %15, `L` = %7).
* **`^FD` Zorunlu Ön Eki (`QA,` veya `MA,`):**
  - İlk harf hata düzeltme seviyesini (`Q` = %25 veya `M` = %15), ikinci harf ise otomatik karakter kodlama modunu (`A` = Automatic) belirtir. Ardından virgül (`,`) konularak GS1 Digital Link URI metni başlatılır: `^FDQA,https://id.marka.com/...^FS`.

Aşağıdaki **`300 DPI` (`12 nokta/mm`)** ZPL II şablonu, aynı etiket üzerinde hem **GS1 Digital Link QR Kod (`^BQ`)** hem de **GS1 DataMatrix ECC 200 (`^BX`)** sembolünü tam nokta keskinliğiyle üretir:

```zpl
^XA
^CI28
^PW826
^LL590
^LH0,0

^FX --- Üst Çerçeve ve Ürün Tanımı ---
^FO30,30^GB766,530,3^FS
^FO55,55^A0N,34,34^FDBAGLANTILI AMBALAJ & GS1 DIGITAL LINK (DPP)^FS
^FO55,100^A0N,26,26^FDGTIN (01): 08690123456789 | LOT (10): LOT26B | SKT (17): 271231^FS
^FO30,140^GB766,2,2^FS

^FX --- 1. GS1 Digital Link QR Kod (^BQ Model 2, Büyütme 5 Dot, ECC Q %25) ---
^FX --- KRİTİK: ^FD sonrasında 'QA,' ön eki zorunludur! ---
^FO60,170^BQN,2,5,Q,7
^FDQA,https://id.ornek.com/01/08690123456789/10/LOT26B/21/SN4092?17=271231^FS
^FO60,425^A0N,22,22^FDGS1 Digital Link QR (ISO/IEC 18004)^FS

^FX --- 2. GS1 DataMatrix (^BX ECC 200, Modül 8 Dot, _1 FNC1 Karakteri) ---
^FO450,185^BXN,8,200,0,0,6,_
^FD_101086901234567891727123110LOT26B_121SN4092^FS
^FO450,360^A0N,22,22^FDGS1 DataMatrix (ECC 200 / FNC1)^FS
^FO450,395^A0N,22,22^FD(01) 08690123456789^FS
^FO450,425^A0N,22,22^FD(17) 271231 (10) LOT26B (21) SN4092^FS

^FX --- Alt Bilgi: AB ESPR 2024/1781 Dijital Ürün Pasaportu ---
^FO55,495^A0N,22,22^FDAB ESPR (2024/1781) DPP & GS1 Sunrise 2027 POS Uyumlu Etiket^FS

^XZ
```

ZPL etiketlerinde koordinat hesaplama ve önizleme detayları için [ZPL Etikete Barkod ve Karekod Yerleştirme](/tr/rehberler/zpl-etikete-barkod-ve-karekod-yerlestirme/) ve [Çevrimiçi ZPL Etiket Önizleme ve Test Rehberi](/tr/rehberler/cevrimici-zpl-etiket-onizleme-ve-test-rehberi/) yazılarımıza başvurabilirsiniz.

---

## 3. TSPL2 (`QRCODE` / `DMATRIX`) ve ESC/POS (`GS ( k`) Komut Mimarisi

Farklı donanım ailelerinden oluşan karma bir yazıcı parkurunda (masaüstü TSC/Godex etiket yazıcıları ve mağaza POS fiş yazıcıları), aynı GS1 Digital Link verisi **TSPL2** ve **ESC/POS** protokollerine şu şekilde çevrilir [4]:

<figure>
  <img src="/images/guides/gs1-digital-link-zpl-tr-03.webp" width="1376" height="768" alt="ZPL II, TSPL2 ve ESC/POS protokollerinde GS1 Digital Link dinamik QR kod ve DataMatrix komut paketi dönüşümü ve WebUSB/TCP 9100 akışı" loading="lazy" decoding="async" />
  <figcaption>Şekil 3: Bulut SDK katmanında tekil GS1 Digital Link URI verisinin ZPL II (^BQ), TSPL2 (QRCODE) ve ESC/POS (GS ( k) ikili bayt dizilerine dönüştürülmesi [2, 4].</figcaption>
</figure>

### A. TSPL / TSPL2 (`QRCODE` ve `DMATRIX`) Uygulaması
TSPL2 dilinde `QRCODE X, Y, ECC, cell_width, mode, rotation, model, "veri"` sözdizimi kullanılır (`ZPL` gibi `QA,` ön eki gerektirmez):

```text
SIZE 70 mm, 50 mm
GAP 3 mm, 0 mm
DIRECTION 1
CLS
TEXT 40,40,"3",0,1,1,"BAGLANTILI AMBALAJ - GS1 DIGITAL LINK"
QRCODE 40,90,Q,5,A,0,M2,"https://id.ornek.com/01/08690123456789/10/LOT26B/21/SN4092?17=271231"
DMATRIX 320,90,400,400,x6,"https://id.ornek.com/01/08690123456789/10/LOT26B/21/SN4092?17=271231"
TEXT 320,280,"2",0,1,1,"GTIN: 08690123456789"
TEXT 320,315,"2",0,1,1,"LOT: LOT26B | SERI: SN4092"
PRINT 1,1
```

### B. ESC/POS (`GS ( k` — Function 165, 167, 169, 180, 181) ve Dinamik Çözümleyici Yönlendirmesi
Termal fiş yazıcılarda (`ESC/POS`) grafik görüntüsü (raster bitmap) yerine yazıcının yerleşik **Function 180/181** vektörel QR motorunu kullanmak hem baskı hızını artırır hem de modül kenarlarını netleştirir. Aşağıdaki Node.js / TypeScript modülü, hem GS1 Digital Link URI oluşturup ESC/POS ikili bayt dizisini (`Uint8Array`) üretir hem de etiketi yeniden basmadan **Çözümleyici (*Resolver*)** üzerinden dinamik yönlendirme yapar:

```javascript
/**
 * 1. GS1 Digital Link Kanonik URI Üretici (v1.3 Uyumlu)
 */
export function buildGs1DigitalLinkUri({ resolverDomain, gtin14, batchLot, serialNo, expYymmdd }) {
  if (!/^\d{14}$/.test(gtin14)) {
    throw new Error('GS1 AI (01) GTIN alanı tam 14 haneli sayısal olmalıdır.');
  }
  const cleanLot = encodeURIComponent(String(batchLot).slice(0, 20));
  const cleanSerial = encodeURIComponent(String(serialNo).slice(0, 20));
  let uri = `https://${resolverDomain}/01/${gtin14}/10/${cleanLot}/21/${cleanSerial}`;
  if (expYymmdd && /^\d{6}$/.test(expYymmdd)) {
    uri += `?17=${expYymmdd}`;
  }
  return uri;
}

/**
 * 2. ESC/POS GS ( k (0x1D 0x28 0x6B) Doğal Donanım QR Kod Bayt Dizisi Üretici
 */
export function encodeEscPosGs1Qr(uriString, moduleSize = 5, eccLevel = 50) {
  // eccLevel: 48=L (%7), 49=M (%15), 50=Q (%25), 51=H (%30)
  const dataBytes = Buffer.from(uriString, 'utf8');
  const storeLen = dataBytes.length + 3;
  const pL = storeLen & 0xff;
  const pH = (storeLen >> 8) & 0xff;

  return Buffer.concat([
    // Function 165: QR Model 2 seçimi (n1 = 50)
    Buffer.from([0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]),
    // Function 167: Modül genişliği (1-16 dot)
    Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, moduleSize]),
    // Function 169: Reed-Solomon Hata Düzeltme Seviyesi (50 = Seviye Q %25)
    Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, eccLevel]),
    // Function 180: GS1 Digital Link URI verisini sembol belleğine yükle
    Buffer.from([0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30]),
    dataBytes,
    // Function 181: Bellekteki QR kodu tam nokta keskinliğiyle yazdır
    Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30])
  ]);
}
```

TSPL2 ve ESC/POS protokollerinin diğer komut detayları için [TSPL ve TSPL2 Masaüstü Barkod Programlama](/tr/rehberler/tspl-ve-tspl2-masaustu-barkod-programlama/) ile [ESC/POS Karekod ve Barkod Basımı](/tr/rehberler/esc-pos-karekod-qr-kod-ve-barkod-basma/) rehberlerimize göz atabilirsiniz.

<figure>
  <img src="/images/guides/gs1-digital-link-zpl-tr-04.webp" width="1376" height="768" alt="Yeniden baskı gerektirmeyen GS1 Digital Link dinamik karekod çözümleyici mimarisi: tek etiketle POS, depo izlenebilirliği ve AB Dijital Ürün Pasaportu" loading="lazy" decoding="async" />
  <figcaption>Şekil 4: Fiziksel etiketi yeniden basmadan bulut çözümleyici (Resolver) kurallarıyla geri çağırma, çok dilli kılavuz ve AB Dijital Ürün Pasaportu (DPP) yönlendirmesi [1, 2, 3].</figcaption>
</figure>

---

## 4. Uçtan Uca Bağlantılı Ambalaj, Donanım ve ERP Ekosistemi

Yazılım katmanında ZPL II, TSPL2 ve ESC/POS ile GS1 Digital Link karekod üretimini kurguladıktan sonra, sahadaki fiziksel donanım, konveyör otomasyonu ve KOBİ ERP süreçleri için konsorsiyum rehberlerimizden yararlanabilirsiniz:

1. **300/600 DPI Termal Transfer Yazıcılar, 2B POS/Depo Okuyucular ve UL 969 Sentetik Etiketler:** Yoğun 2B karekodların basımı için doğru DPI seçimi, reçine ribon kimyası ve **GS1 Sunrise 2027** uyumlu 2B CMOS barkod okuyucu donanımları için **[Rebo Teknoloji — Bağlantılı Ambalaj, Dinamik 2B Karekod ve GS1 Digital Link Donanım Rehberi](https://rebo.com.tr/baglantili-ambalaj-dinamik-2d-karekod-gs1-digital-link-termal-yazici-okuyucu-rehberi/)** incelememize başvurabilirsiniz.
2. **Konveyör Hatlarında Tam Otomatik *Print & Apply* (Yazdır-Yapıştır) ve Kameralı Doğrulama:** Yüksek hızlı üretim hatlarında önceden basılmış ambalaj hurdasını ortadan kaldıran `Rebo-Label OX / TX / MX Pro` seri numaralı 2B karekod uygulama ve `ISO/IEC 15415` kameralı ayırma sistemleri için **[ReboLabel — Konveyör Hatlarında Bağlantılı Ambalaj ve GS1 Digital Link Dinamik 2B Karekod Otomatik Etiketleme](https://rebolabel.com/blog/baglantili-ambalaj-gs1-digital-link-dinamik-karekod-otomatik-etiketleme-print-apply/)** kılavuzunu inceleyebilirsiniz.
3. **KOBİ'lerde Excel, E-Posta ve "Usta Hafızası" Riskini Bitiren Devir-Teslim ve ERP Olgunluk Rehberi:** Siparişten sevkiyata departmanlar arası devir-teslim disiplini, VUK 219/230/353 kayıt düzeni ve 10 soruluk dijital olgunluk testi için **[UstaHesap — KOBİ'lerde Excel, E-Posta ve Usta Hafızasına Dayalı Yönetimin Gizli Maliyeti ve ERP Olgunluk Rehberi](https://ustahesap.com/rehber/kobilerde-excel-eposta-ve-kisiye-bagli-hafiza-riski-devir-teslim-ve-erp-olgunluk-rehberi)** analizine göz atabilirsiniz.

---

## 5. Sıkça Sorulan Sorular (SSS)

### ZPL II `^BQ` komutunda neden URL'nin ilk 3 karakteri kesiliyor veya karekod yanlış çıkıyor?
ZPL II dilinde `^BQ` komutu, kendisinden sonra gelen `^FD` veri alanında hata düzeltme seviyesini ve veri giriş modunu belirten bir ön ek (`QA,` veya `MA,` gibi) bekler. Eğer `^FDhttps://...^FS` şeklinde doğrudan URL yazılırsa, yazıcı ilk karakterleri kontrol parametresi sanarak yutar. Doğru kullanım `^FDQA,https://...^FS` biçimindedir [4].

### Dinamik QR kod kullanıldığında hedef web adresi değişirse etiketleri yeniden basmak gerekir mi?
Hayır. **GS1 Digital Link** mimarisinde etikete basılan URI ürünün değişmez kimliğini (`/01/GTIN/10/LOT/21/SERI`) ve kısa çözümleyici alan adını içerir. Ürün kılavuzu, kampanya sayfası veya **AB Dijital Ürün Pasaportu (DPP)** adresi değiştiğinde yönlendirme kuralı sunucu tarafında güncellenir; depodaki hiçbir etiketin yeniden basılmasına gerek kalmaz [1, 2].

### 203 DPI termal yazıcıda 100 karakterlik GS1 Digital Link QR kodu neden küçük basılamaz?
203 DPI (`8 nokta/mm`) yazıcıda `2 dot` modül genişliği `0,25 mm`'ye denk gelir ve termal yayılma nedeniyle hücreler birbirine karışır; güvenli okuma için en az `4 dot (0,50 mm)` gerekir ki bu da 100 karakterlik bir QR kodu `20 × 20 mm` üzerine çıkarır. Küçük ambalajlarda (`12 × 12 mm`) yüksek **ISO/IEC 15415** kalitesi elde etmek için `300 DPI` veya `600 DPI` yazıcı kullanılmalıdır [4].

### GS1 Digital Link QR kod ile GS1 DataMatrix arasındaki temel fark nedir?
Her iki 2B sembol de GS1 uygulama tanımlayıcılarını taşıyabilir ve **GS1 Sunrise 2027** kapsamında POS kasalarında okunabilir. Ancak **GS1 Digital Link QR kod (`ISO/IEC 18004`)** standart bir web URI'si içerdiği için ek bir uygulama gerektirmeden doğrudan tüketicilerin akıllı telefon kameralarıyla açılabilir; **GS1 DataMatrix (`ISO/IEC 16022`)** ise çok daha küçük alanlara (ilaç kutusu, elektronik parça, tıbbi cihaz UDI) sığabildiği için endüstriyel ve klinik izlenebilirlikte tercih edilir [2, 4].

---

## 6. Doğrulanmış Kaynaklar ve Standartlar

1. **Loftware Endüstri Bülteni & 2026 Etiketleme Raporu** (Ekim 2026). *Turn Packaging into a Growth Channel: Dynamic QR Codes, Connected Packaging, 10-Question Labeling Maturity Assessment & Top 5 Trends for 2026*.
2. **GS1 Digital Link Standard & Sunrise 2027** (v1.2 / v1.3, 2024–2026). *GS1 Digital Link Standard: URI Syntax, Çözümleyici Spesifikasyonu ve Küresel Perakende POS 2B Geçiş Yol Haritası (Aralık 2027)*.
3. **Avrupa Parlamentosu ve Konseyi — Regulation (EU) 2024/1781 (ESPR)** (Temmuz 2024). *Framework for the Setting of Ecodesign Requirements for Sustainable Products — Chapter III: Digital Product Passport (Articles 9–13)*.
4. **ISO/IEC 18004:2024 (QR Code), ISO/IEC 16022:2024 (DataMatrix ECC 200), ISO/IEC 15415:2024 & Zebra ZPL II / TSC TSPL2 / Epson ESC/POS Programming Manuals** (2024–2026).

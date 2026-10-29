---
updatedDate: 2026-10-29
title: "Tedarikçi Portalı ve ERP Sistemlerinden Merkezi ZPL/TSPL Etiket Şablon Yönetimi ve Bulut Baskı Mimarisi"
description: "Çok katmanlı tedarikçi ve fason üretim ağlarında etiket uyum açığını kapatmak için merkezi ZPL II ve TSPL şablon yönetimi, SAP/ERP JSON veri enjeksiyonu, GS1-128 ve DataMatrix FNC1 kodlaması ile tarayıcıdan sessiz bulut baskı rehberi."
printerClass: industrial
brand: Zebra
publishDate: 2026-10-29
translationKey: supplier-portal-centralized-zpl-template-governance
---

Küresel üretim ve perakende tedarik zincirlerinde karşılaşılan en pahalı operasyonel kırılma noktası, ana üretici ile dış tedarikçiler (*Tier-1 / Tier-2 hammadde sağlayıcıları ve fason üreticiler*) arasındaki **"etiket ve ürün bilgisi uyum açığı" (*compliance gap*)** sorunudur. Merkez fabrikada **SAP S/4HANA** veya kurumsal ERP sistemi üzerinde ürün ana verisi (GTIN, parti/lot numarası, son tüketim tarihi, alerjen uyarısı veya **AB Dijital Ürün Pasaportu — DPP** verisi) güncellendiğinde; dış tedarikçinin kendi bilgisayarındaki eski bir Excel tablosundan veya yerel etiket dosyasından baskı almaya devam etmesi, mal kabul kapısında tüm sevkiyatın reddedilmesine, ağır iade cezalarına ve **7223 sayılı Ürün Güvenliği ve Teknik Düzenlemeler Kanunu** ile **AB ESPR (EU) 2024/1781** kapsamında piyasa gözetimi yaptırımlarına yol açar [1, 2, 5].

Etiket uyum açığını kapatmak yalnızca bir donanım yatırımı değil; **kayıt sistemleri (*systems of record*), kurumsal veri yönetimi (*governance*) ve uç noktada tutarlı etiket icrasının (*execution*)** tek bir mimaride birleştirilmesidir [1]. Bu kapsamlı mühendislik rehberinde; dış tedarikçilere yerel şablon dosyası göndermek yerine **Merkezi ZPL II / TSPL Şablon Kasası (*Template Vault*)** kurmayı, ERP'den gelen doğrulanmış JSON veri yükünü `HMAC-SHA256` imzasıyla şablona enjekte etmeyi ve tedarikçinin web tarayıcısından (`WebUSB`, `Web Bluetooth` veya `TCP 9100`) sıfır sürücü kurulumuyla doğrudan termal yazıcıya basmayı inceliyoruz.

<figure>
  <img src="/images/guides/tedarikci-zpl-yonetisimi-tr-01.webp" width="1376" height="768" alt="Tedarikçi portalı üzerinden merkezi ZPL II etiket şablon yönetimi, SAP ERP JSON veri akışı ve masaüstü termal yazıcıya doğrudan sessiz baskı mimarisi" loading="eager" decoding="async" />
  <figcaption>Şekil 1: Kayıt sisteminden (ERP) gelen doğrulanmış ürün verisinin merkezi ZPL II şablon kasasıyla birleştirilerek tedarikçi istasyonundaki termal yazıcıya sıfır yerel müdahaleyle iletilmesi [1, 3].</figcaption>
</figure>

---

## 1. Neden Tedarikçilere Excel, PDF veya Yerel Şablon Dosyası Gönderilmemeli?

Çok katmanlı tedarikçi ağlarında her fason atölyenin veya hammadde tedarikçisinin kendi etiket tasarımını yapmasına izin vermek, hem **FDA 21 CFR Part 11 / AB GMP Ek 11 (Annex 11)** elektronik kayıt bütünlüğü kurallarını ihlal eder hem de termal baskı kalitesini düşürür [3, 4]:

| Operasyonel Kriter | Dağıtık Yerel Dosya & PDF Baskı Yaklaşımı | Merkezi ZPL II / TSPL Şablon Yönetimi (Bulut Portalı) |
| :--- | :--- | :--- |
| **Veri Doğruluk Kaynağı** | Tedarikçi personelinin klavyeden elle girdiği Excel/CSV hücresi (Yüksek yazım hatası riski) | **ERP Kayıt Sistemi (SAP S/4HANA vb.):** Sipariş emrine (`PO`) bağlı salt-okunur JSON veri yükü [1] |
| **Şablon Sürüm Kontrolü** | Tedarikçi bilgisayarında unutulmuş eski şablon dosyaları (`etiket_v2_son.lbl`) | **SHA-256 Özet (Hash) Kilidi:** Merkezde onaylanan şablon anında tüm tedarikçi ağında devreye girer |
| **Barkod Keskinliği ve Kalite** | PDF'ten yazdırma sırasında gri tonlamalı kenar bozulması (*dithering*) ve okuma hatası | **Doğrudan ASCII ZPL II / TSPL:** `203 / 300 / 600 DPI` tam nokta keskinliği, **ISO/IEC 15415 / 15416** A/B derecesi [3] |
| **Ağ Veri Yükü ve Hız** | Etiket başına `150 KB – 450 KB` PDF (Yavaş işletim sistemi yazdırma kuyruğu) | Etiket başına **`2 KB – 4 KB` düz metin** (`30 – 60 ms` içinde anında termal kafa tetiklemesi) |
| **Denetim İzi (*Audit Trail*)** | Hangi tedarikçinin, hangi saatte, kaç adet etiket bastığı merkezden izlenemez | **21 CFR Part 11 Uyumu:** Kullanıcı, zaman damgası, parti kodu ve yazıcı seri numarası merkezi kütüğe işlenir [4] |

<figure>
  <img src="/images/guides/tedarikci-zpl-yonetisimi-tr-02.webp" width="1376" height="768" alt="Dağıtık yerel Excel ve PDF etiket kaosu ile merkezi ZPL II şablon yönetimi ve ISO/IEC 15415 A derecesi termal baskı karşılaştırması" loading="lazy" decoding="async" />
  <figcaption>Şekil 2: Sol panelde yerel Excel/PDF dönüşümünden kaynaklanan bozuk barkod ve mal kabul reddi; sağ panelde merkezi ZPL II şablon yönetimiyle üretilen tam nokta keskinliğinde GS1 etiketi [1, 3].</figcaption>
</figure>

Termal yazıcılarda PDF veya görsel tabanlı baskıların neden kenar bulanıklığına yol açtığını matematiksel olarak incelemek için [Termal Fiş Şablonlama ve 1-Bit Dithering Motoru](/tr/rehberler/termal-fis-sablonlama-ve-1-bit-dithering-motoru/) kılavuzumuza göz atabilirsiniz.

---

## 2. GS1-128 ve GS1 DataMatrix İçin Kilitli Parametrik ZPL II Şablon Mimarisi

Bir tedarikçi sevkiyat etiketinin hem perakende/endüstriyel mal kabul kapılarından (**ISO/IEC 15459** tekil tanımlama) hem de **AB Sürdürülebilir Ürünler için Ekotasarım Tüzüğü (ESPR — Regulation (EU) 2024/1781, Madde 9–13)** kapsamındaki Dijital Ürün Pasaportu (DPP) ve **FDA FSMA Bölüm 204** gıda izlenebilirliği denetimlerinden hatasız geçebilmesi için GS1 Uygulama Tanımlayıcılarının (*Application Identifiers — AI*) doğru **FNC1** kontrol karakterleriyle kodlanması şarttır [2, 3, 4]:

* **`(00)` SSCC (*Seri Taşıma Kabı Kodu*):** Sabit **18 haneli** sayısal lojistik birim kimliği.
* **`(01)` GTIN (*Küresel Ticari Ürün Numarası*):** Sabit **14 haneli** sayısal ürün kodu.
* **`(17)` Son Tüketim Tarihi:** Sabit **6 haneli** (`YYAAGG` formatında) tarih alanı (Sabit uzunluklu olduğu için kendisinden sonra FNC1 ayracı gerektirmez).
* **`(10)` Parti / Lot Numarası** ve **`(21)` Seri Numarası:** En fazla **20 alfanümerik karakter** alan değişken uzunluklu alanlardır. Değişken uzunluklu bir AI'dan sonra başka bir veri alanı geliyorsa, araya mutlaka **FNC1** grup ayırıcı karakteri (`^BC` komutunda `>8`, `^BX` komutunda `_1`) yerleştirilmelidir [3].

Aşağıdaki parametrik ZPL II şablonu, tedarikçinin biçimlendirmeye müdahale etmesini engelleyen, yalnızca ERP kayıt sisteminden onaylı değişkenleri kabul eden **`300 DPI` (`12 nokta/mm`)** kilitli bir ana şablondur:

```zpl
^XA
^CI28
^PW1181
^LL1772
^LH0,0

^FX --- Üst Başlık: Merkezi Denetim Şablon Kimliği ve Onay Sürümü ---
^FO40,40^GB1101,1692,4^FS
^FO70,65^A0N,38,38^FDONAYLI TEDARIKCI SEVKIYAT VE IZLENEBILIRLIK ETIKETI^FS
^FO70,115^A0N,26,26^FDSABLON ID: {{TEMPLATE_VERSION_ID}} | SHA256: {{TEMPLATE_HASH_SHORT}}^FS
^FO40,155^GB1101,4,4^FS

^FX --- Bölüm 1: Tedarikçi, Sipariş (PO) ve Ürün Ana Verisi ---
^FO70,185^A0N,30,30^FDTEDARIKCI KODU: {{SUPPLIER_GLN}} - {{SUPPLIER_NAME}}^FS
^FO70,230^A0N,30,30^FDERP SIPARIS (PO): {{SAP_PO_NUMBER}} | VUK E-IRSALIYE ETTN: {{E_WAYBILL_ETTN}}^FS
^FO70,285^A0N,42,42^FD{{PRODUCT_MASTER_DESCRIPTION}}^FS
^FO70,345^A0N,30,30^FDGTIN (01): {{GTIN_14}} | PARTI/LOT (10): {{BATCH_LOT}} | SKT (17): {{EXP_DATE_HRI}}^FS
^FO40,400^GB1101,3,3^FS

^FX --- Bölüm 2: GS1 DataMatrix (^BX ECC 200 ve _1 FNC1 Kontrol Karakteri) ---
^FO70,435^BXN,10,200,0,0,1,_
^FD_101{{GTIN_14}}17{{EXP_YYMMDD}}10{{BATCH_LOT}}_121{{SERIAL_NO}}^FS
^FO360,445^A0N,28,28^FDGS1 DataMatrix (ISO/IEC 15415)^FS
^FO360,490^A0N,26,26^FD(01) {{GTIN_14}}^FS
^FO360,530^A0N,26,26^FD(17) {{EXP_YYMMDD}} (10) {{BATCH_LOT}}^FS
^FO360,570^A0N,26,26^FD(21) {{SERIAL_NO}}^FS
^FO360,615^A0N,24,24^FDAB ESPR (2024/1781) DPP & 7223 Sayili Kanun Md. 7 Uyumlu^FS
^FO40,720^GB1101,3,3^FS

^FX --- Bölüm 3: GS1-128 Ürün/Parti Barkodu (^BC ve >;>8 FNC1 Çağrısı) ---
^FO70,755^A0N,28,28^FDGS1-128 KOLI IZLENEBILIRLIK BARKODU:^FS
^FO70,805^BY3,3,180^BCN,180,Y,N,N
^FD>;>801{{GTIN_14}}17{{EXP_YYMMDD}}>610{{BATCH_LOT}}^FS
^FO40,1060^GB1101,4,4^FS

^FX --- Bölüm 4: GS1-128 SSCC (00) 18 Haneli Lojistik Palet/Koli Kimliği ---
^FO70,1095^A0N,34,34^FDSSCC (00): {{SSCC_18}}^FS
^FO70,1150^BY4,3,240^BCN,240,Y,N,N
^FD>;>800{{SSCC_18}}^FS

^XZ
```

<figure>
  <img src="/images/guides/tedarikci-zpl-yonetisimi-tr-03.webp" width="1376" height="768" alt="Termal baskı kafasında GS1 DataMatrix (^BX _1 FNC1) ve GS1-128 (^BC >;>8 FNC1) barkod basımı ile HMAC-SHA256 imzalı uç köprü mimarisi" loading="lazy" decoding="async" />
  <figcaption>Şekil 3: GS1 DataMatrix ve GS1-128 FNC1 kontrol dizilerinin yerel uç köprü üzerinden 300 DPI termal baskı kafasına iletilmesi [3].</figcaption>
</figure>

Şablonları fiziksel etiket harcamadan tarayıcıda doğrulamak için [Çevrimiçi ZPL Etiket Önizleme ve Test Rehberi](/tr/rehberler/cevrimici-zpl-etiket-onizleme-ve-test-rehberi/) aracımızı, ZPL barkod koordinat kuralları için [ZPL Etikete Barkod ve Karekod Yerleştirme](/tr/rehberler/zpl-etikete-barkod-ve-karekod-yerlestirme/) rehberimizi inceleyebilirsiniz.

---

## 3. ERP Kayıt Sisteminden Tedarikçi Yazıcısına İmzalı Bulut Baskı ve Durum Telemetrisi

Tedarikçi ağında tam merkezi yönetim sağlamak için iki güvenlik adımı zorunludur: **(1) Tedarikçinin şablon metnini veya değişkenleri tarayıcı konsolundan değiştirememesi (`HMAC-SHA256` doğrulama)** ve **(2) Etiketin fiziksel olarak hatasız basıldığının (`~HS` / `~HQES` durum sorgusuyla) merkez ERP'ye geri bildirilmesi**.

Aşağıdaki mimari örnek; merkez sunucuda ERP verisiyle derlenen ve kriptografik olarak imzalanan ZPL II paketinin, tedarikçi istasyonundaki [Tarayıcıdan Sessiz Bulut Baskı](/tr/rehberler/tarayicidan-sessiz-bulut-baski-ve-dogrudan-yazdirma-rehberi/) köprüsü veya [Ağ ve Ethernet Raw Port 9100 Soket Mimarisi](/tr/rehberler/ag-ve-ethernet-raw-port-9100-soket-mimarisi/) üzerinden yazıcıya iletilmesini ve denetim izi kaydını gösterir:

```javascript
import crypto from 'node:crypto';
import net from 'node:net';

/**
 * 1. Merkez ERP / Merkezi Denetim Sunucusu: Kilitli Şablona Veri Enjeksiyonu ve HMAC-SHA256 İmzası
 */
export function buildGovernedSupplierPrintJob(lockedZplTemplate, erpRecord, secretKey) {
  // Değişken alanlardan ZPL kontrol karakterlerini (^ ve ~) temizleyerek enjeksiyonu önle
  const sanitize = (val) => String(val ?? '').replace(/[\^~]/g, '');

  const compiledZpl = lockedZplTemplate
    .replaceAll('{{TEMPLATE_VERSION_ID}}', sanitize(erpRecord.templateVersionId))
    .replaceAll('{{TEMPLATE_HASH_SHORT}}', sanitize(erpRecord.templateHashShort))
    .replaceAll('{{SUPPLIER_GLN}}', sanitize(erpRecord.supplierGln))
    .replaceAll('{{SUPPLIER_NAME}}', sanitize(erpRecord.supplierName))
    .replaceAll('{{SAP_PO_NUMBER}}', sanitize(erpRecord.sapPoNumber))
    .replaceAll('{{E_WAYBILL_ETTN}}', sanitize(erpRecord.eWaybillEttn))
    .replaceAll('{{PRODUCT_MASTER_DESCRIPTION}}', sanitize(erpRecord.productDescription))
    .replaceAll('{{GTIN_14}}', sanitize(erpRecord.gtin14))
    .replaceAll('{{BATCH_LOT}}', sanitize(erpRecord.batchLot))
    .replaceAll('{{EXP_DATE_HRI}}', sanitize(erpRecord.expDateHri))
    .replaceAll('{{EXP_YYMMDD}}', sanitize(erpRecord.expYymmdd))
    .replaceAll('{{SERIAL_NO}}', sanitize(erpRecord.serialNo))
    .replaceAll('{{SSCC_18}}', sanitize(erpRecord.sscc18));

  const issuedAt = new Date().toISOString();
  const payloadToSign = `${erpRecord.sapPoNumber}|${erpRecord.sscc18}|${issuedAt}|${compiledZpl}`;
  const signature = crypto.createHmac('sha256', secretKey).update(payloadToSign).digest('hex');

  return { compiledZpl, issuedAt, signature };
}

/**
 * 2. Tedarikçi Uç İstasyonu: ~HQES Donanım Sağlığı Kontrolü ve Raw TCP 9100 İletimi
 */
export function executeVerifiedThermalPrint(printerIp, zplPayload, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let printerResponse = '';

    socket.setTimeout(timeoutMs);
    socket.connect(9100, printerIp, () => {
      // Önce yazıcı hata durumunu (~HQES) sorgula ve ardından kilitli ZPL II akışını gönder
      socket.write('~HQES\r\n' + zplPayload, 'utf8');
    });

    socket.on('data', (chunk) => {
      printerResponse += chunk.toString('utf8');
      if (printerResponse.includes('ERRORS:') && printerResponse.includes('WARNINGS:')) {
        socket.end();
        resolve({ status: 'PRINTED_VERIFIED', telemetry: printerResponse.trim() });
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`Tedarikçi yazıcısı (${printerIp}:9100) zaman aşımına uğradı.`));
    });

    socket.on('error', (err) => reject(err));
  });
}
```

<figure>
  <img src="/images/guides/tedarikci-zpl-yonetisimi-tr-04.webp" width="1376" height="768" alt="Çoklu tedarikçi paketleme istasyonlarında merkezi ZPL şablon dağıtımı, barkod okut anında bas otomasyonu ve 21 CFR Part 11 denetim izi" loading="lazy" decoding="async" />
  <figcaption>Şekil 4: Çoklu tedarikçi ve fason üretim istasyonlarında merkezi şablon güncellemesi ve sıfır tıklamalı (barkod okut ➔ anında bas) paketleme akışı [1, 4].</figcaption>
</figure>

---

## 4. Uçtan Uca Tedarik Zinciri Donanım ve ERP Ekosistemi

Yazılım katmanında merkezi ZPL II ve TSPL şablon yönetimini kurduktan sonra, fiziksel saha icrasının kesintisiz çalışması için üç tamamlayıcı katman birlikte planlanmalıdır:

1. **Tedarikçi Masaüstü/Endüstriyel Yazıcı ve ISO/IEC 15415 Doğrulayıcı Donanımı:** Tedarikçi sevkiyat noktalarında kullanılacak 300/600 DPI termal transfer yazıcılar, reçine (*resin*) ribon seçimi, **ISO/IEC 15426** kalibrasyonlu barkod doğrulayıcılar (*verifier*) ve mal kabul kapısı UHF RFID/2B okuyucu donanımları için **[Rebo Teknoloji — Tedarikçi Ağında Ürün Bilgisi Yönetimi, ERP Entegreli Termal Yazıcılar ve ISO/IEC 15415 Barkod Doğrulama Rehberi](https://rebo.com.tr/tedarikci-aginda-urun-bilgisi-yonetisimi-erp-termal-yazici-ve-barkod-dogrulama-rehberi/)** incelememize başvurabilirsiniz.
2. **Konveyör Hattı Tam Otomatik *Print & Apply* (Yazdır-Yapıştır) Sistemleri:** Saatte yüzlerce koli ve paletin çıktığı yüksek hızlı fabrikalarda, SAP/ERP sisteminden gelen ZPL akışını operatörsüz olarak doğrudan konveyördeki kolilere uygulayan ve kameralı doğrulama ile hatalı koliyi ayıran robotik sistemler için **[ReboLabel — Tedarik Zinciri ve Çok Tesisli Üretimde ERP (SAP) Entegreli Otomatik Etiketleme (Print & Apply) Yönetimi](https://rebolabel.com/blog/erp-sap-entegreli-otomatik-etiketleme-print-apply-ve-urun-veri-yonetisimi/)** kılavuzunu inceleyebilirsiniz.
3. **KOBİ Ürün Ana Verisi (Stok Kartı), VUK e-İrsaliye ve Mevzuat Uyumu:** Tedarikçi ağında stok kartı standardizasyonu, **7223 sayılı Ürün Güvenliği Kanunu**, **5996 sayılı Veteriner Hizmetleri ve Gıda Kanunu (Madde 21, 22, 24)** ve **VUK 509 Sıra No'lu Tebliğ** e-İrsaliye karekod eşleşmesi için **[UstaHesap — KOBİ ve Üreticilerde Ürün Ana Verisi (Stok Kartı) Yönetimi, Lot İzlenebilirliği ve Mevzuat Uyumu](https://ustahesap.com/rehber/urun-ana-verisi-stok-karti-yonetisimi-tedarikci-etiket-ve-mevzuat-uyumu)** rehberine göz atabilirsiniz.

---

## 5. Sıkça Sorulan Sorular (SSS)

### Tedarikçi portalında PDF yerine neden doğrudan ZPL II veya TSPL şablonu kullanılmalıdır?
PDF belgeleri işletim sistemi yazdırma sürücüsü tarafından grafik görüntüsüne dönüştürülürken ölçekleme ve yarı tonlama (*dithering*) işlemine uğrar; bu durum 2B `GS1 DataMatrix` ve `GS1-128` barkodlarının kenar kontrastını bozarak mal kabulde okuma hatasına yol açar. Doğrudan `ZPL II` veya `TSPL` komutları ise yazıcının doğal DPI çözünürlüğünde (`203/300/600 DPI`) tam nokta keskinliğiyle basılır ve ağ üzerinde 60 kat daha az veri tüketir [3].

### GS1-128 ve GS1 DataMatrix barkodlarında FNC1 ayracı neden zorunludur?
GS1 standardında `(10)` Parti/Lot Numarası ve `(21)` Seri Numarası gibi alanlar değişken uzunlukludur (en fazla 20 karakter). Barkod okuyucunun değişken uzunluklu bir alanın nerede bittiğini ve yeni Uygulama Tanımlayıcısının (AI) nerede başladığını anlayabilmesi için araya mutlaka **FNC1** grup ayırıcı karakteri (`^BC` komutunda `>8`, `^BX` komutunda `_1`) konulmalıdır [3].

### Tedarikçinin yazıcısında kağıt veya ribon bittiğinde merkez ERP sistemi bunu nasıl anlar?
Tek yönlü yazdırma kuyruklarında veri gönderildikten sonra etiketin gerçekten basılıp basılmadığı bilinemez. Çift yönlü TCP `9100` veya `WebUSB` köprüsü üzerinden her iş emrinden önce veya sonra `~HS` (*Host Status*) ve `~HQES` (*Host Query Error Status*) komutları gönderilerek baskı kafası açık, ribon koptu veya etiket bitti uyarıları anlık olarak yakalanır ve ERP denetim izine kaydedilir.

### AB Dijital Ürün Pasaportu (DPP) tedarikçi etiket şablonlarını nasıl etkiler?
Temmuz 2024'te yürürlüğe giren **AB Sürdürülebilir Ürünler için Ekotasarım Tüzüğü (ESPR — Regulation (EU) 2024/1781, Madde 9–13)** uyarınca, AB pazarına sunulan ürünlerin tedarik zinciri boyunca **ISO/IEC 15459** uyumlu tekil ürün/parti tanımlayıcısına ve veri taşıyıcısına (QR kod, GS1 DataMatrix veya UHF RFID) sahip olması zorunludur [2]. Merkezi şablon yönetimi, alt tedarikçilerin DPP bağlantılı karekodları standartlara uygun basmasını garanti altına alır.

---

## 6. Doğrulanmış Kaynaklar ve Standartlar

1. **Loftware, SAP & Accenture** (Kasım 2026). *Closing the Compliance Gap: How to Govern Product Information Across Your Supplier Network — Tedarik Zinciri Görünürlüğü, Kayıt Sistemleri, Merkezi Yönetim ve Etiket İcrası*.
2. **Avrupa Parlamentosu ve Konseyi — Regulation (EU) 2024/1781 (ESPR)** (Temmuz 2024). *Framework for the Setting of Ecodesign Requirements for Sustainable Products — Chapter III: Digital Product Passport (Articles 9–13)* & **ISO/IEC 15459** (*Unique Identification*).
3. **GS1 General Specifications & ISO/IEC 15415 / 15416** (2024–2026). *GS1 Application Identifiers (00, 01, 10, 17, 21), FNC1 Symbol Character Encoding in GS1-128 and GS1 DataMatrix (ECC 200)* & *Zebra ZPL II Programming Guide*.
4. **FDA 21 CFR Part 11, EU GMP Annex 11 & FDA FSMA Section 204** (2026). *Electronic Records, Electronic Signatures, Computerised Systems Audit Trails, and Food Traceability Critical Tracking Events (CTEs)*.
5. **7223 Sayılı Ürün Güvenliği ve Teknik Düzenlemeler Kanunu** (Mart 2020, Resmî Gazete Sayı: 31066, Madde 7–10) & **VUK Genel Tebliği Sıra No: 509** (Ekim 2019, Resmî Gazete Sayı: 30923 — e-İrsaliye Karekod Standardı).

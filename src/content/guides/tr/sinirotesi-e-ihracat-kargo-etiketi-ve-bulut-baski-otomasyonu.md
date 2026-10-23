---
updatedDate: 2026-10-23
title: "Sınır Ötesi E-İhracat ve Depo Sipariş Karşılama İçin Bulut Kargo Etiketi Baskı Otomasyonu"
description: "Uluslararası e-ihracat (DHL, UPS, FedEx, ETGB) ve pazaryeri operasyonlarında 4x6 inç (100x150 mm) ZPL II kargo etiketlerini bulut webhook ve sessiz yazdırma ile otomatikleştirme rehberi."
printerClass: industrial
brand: Zebra
publishDate: 2026-10-23
translationKey: cross-border-ecommerce-shipping-label-automation
---

Sınır ötesi e-ihracat (**Cross-Border E-Commerce**) ve çok kanallı depo sipariş karşılama (*fulfillment*) operasyonlarında hız ve gümrük uyumluluğu doğrudan kargo etiketi kalitesine bağlıdır. Uluslararası ekspres taşıyıcılar (**DHL Express**, **UPS**, **FedEx**, **Aramex**) ve pazaryeri lojistik ağları; her paket üzerinde yüksek kontrastlı yönlendirme barkodları (`Code 128`, `GS1-128`, `MaxiCode`, `PDF417`, `GS1 DataMatrix`), `ETGB / CN22 / CN23` elektronik gümrük beyan verileri ve varış ülkesinin yerel alfabesinde (`UTF-8` Kiril, Arapça, Yunanca veya Avrupa aksanlı karakterler) alıcı adresi bulunmasını zorunlu kılar.

Depo paketleme masalarında kargo API'sinden dönen PDF etiketlerini indirip tarayıcıda açarak tek tek yazdırmak, hem paket başına **10–15 saniye** operasyonel gecikme yaratır hem de PDF'ten termal yazıcıya dönüşüm sırasında barkod çubuklarının bozulmasına (*dithering*) yol açarak yurt dışı gümrük hub'larında paketin reddedilmesine neden olur.

Bu kapsamlı mühendislik rehberinde; uluslararası kargo API'lerinden doğrudan **yerel ZPL II (`ZPL203` / `ZPL300`)** akışı almayı, çok dilli `^CI28` UTF-8 gümrük etiketi şablonlamasını ve sipariş barkodu okutulduğu anda **sıfır tıklamayla (zero-click)** kargo etiketi basan bulut otomasyon mimarisini inceliyoruz.

---

## 1. Uluslararası Kargo API'lerinde PDF Yerine Neden Doğrudan ZPL II (`Base64`) Seçilmeli?

Küresel kargo entegrasyonlarında (`DHL MyDHL API`, `FedEx Ship API v1`, `UPS Shipping API`) gönderi oluşturulduğunda etiket formatı olarak `PDF`, `PNG` veya doğrudan **`ZPL2` (`ZPL II`)** talep edilebilir. Yüksek hacimli e-ihracat depolarında `PDF` yerine doğrudan `ZPL II` kullanılmasının 3 kritik mühendislik nedeni vardır:

| Teknik Kriter | Grafiksel PDF Etiket Akışı (`imageType: PDF`) | Doğrudan ZPL II Akışı (`imageType: ZPL`) |
| :--- | :--- | :--- |
| **Veri Boyutu (Payload Size)** | `120 KB – 450 KB` (Yüksek bant genişliği ve RAM tüketimi) | **`2 KB – 5 KB` düz ASCII metin** (60 kat daha hafif) |
| **Yazıcıya İletim ve Basım Süresi** | `1.500 – 3.500 ms` (PDF rasterizasyon + sürücü kuyruğu) | **`30 – 80 ms`** (Anında termal kafa tetiklemesi) |
| **2D `MaxiCode` / `GS1-128` Kalitesi** | Ölçekleme nedeniyle gri pikseller ve okuma hatası riski | **`ISO/IEC 15415` / `15416` A Derecesi** tam nokta keskinliği |
| **Otomatik Konveyör Uyumu** | Sürücü gecikmesi nedeniyle yüksek hızlı hatlara yetişemez | **[Rebo-Label otomatik etiketleme hatlarıyla](https://rebolabel.com/)** %100 senkron |

Kargo API isteğinizde etiket parametresini doğrudan termal yazıcınızın çözünürlüğüne (`203 DPI` veya `300 DPI`) ve standart **`4 × 6 inç (100 × 150 mm)`** veya gümrük faturalı **`4 × 8 inç (100 × 200 mm)`** boyuta göre yapılandırmanız yeterlidir.

---

## 2. Sınır Ötesi E-İhracat İçin Çok Dilli (`^CI28`) `100 × 150 mm` ZPL II Etiket Şablonu

Kendi konsolidasyon deponuzu yönetiyor veya gümrük ön taşıma etiketlerinizi (`GS1-128 SSCC` ve `CN23` özeti) kendi ERP/WMS yazılımınızda üretiyorsanız, şablonunuzda `^CI28` (UTF-8 uluslararası karakter tablosu) ve `^FB` (*Field Block* — otomatik satır kaydırma) komutlarını kullanmalısınız:

```zpl
^XA
^CI28
^PW812
^LL1218
^LH0,0

^FX --- Üst Kargo Hizmet Kodu ve Gümrük Rejimi (ETGB / DDP) ---
^FO30,30^GB752,1158,4^FS
^FO50,50^A0N,56,56^FDEXPRESS CROSS-BORDER — DDP^FS
^FO630,45^GB130,65,65^FS
^FO648,58^FR^A0N,44,44^FDEU-1^FS
^FO30,125^GB752,4,4^FS

^FX --- Çok Dilli Alıcı Adresi (UTF-8 ^CI28 + ^FB Otomatik Satır Kaydırma) ---
^FO50,150^A0N,26,26^FDALICI / DELIVER TO:^FS
^FO50,185^A0N,34,34^FB700,4,6,L,0^FDالعميل الدولي / Мюнхен Логистик GmbH\&Çağlayan Cad. No:42, 80331 München, DE^FS
^FO30,340^GB752,3,3^FS

^FX --- Gümrük Beyan Özeti (GTİP / HS Code, Menşei, Ağırlık) ---
^FO50,365^A0N,26,26^FDHS CODE (GTİP): 6205.20.00 | MENŞEİ: TR (TÜRKİYE)^FS
^FO50,400^A0N,26,26^FDBRÜT: 1.45 KG | BEYAN: ETGB-2026-99481 | DEĞER: 145.00 EUR^FS
^FO30,445^GB752,3,3^FS

^FX --- Taşıyıcı AWB Takip Barkodu (Code 128) ve 2D Yönlendirme Kodu ---
^FO60,480^BY3,3,150^BCN,150,Y,N,N
^FDJJD008690001928374^FS
^FO580,475^BXN,6,200,,,,_
^FD_10008690000000000001842127680331^FS

^FX --- Alt Bölüm: GS1-128 SSCC Lojistik Birim Barkodu ---
^FO30,700^GB752,4,4^FS
^FO50,730^A0N,28,28^FDGS1 SSCC (00): 086900000000000018^FS
^FO60,775^BY3,3,180^BCN,180,Y,N,N,D
^FD(00)086900000000000018^FS

^XZ
```

Şablonunuzu fiziksel etiket harcamadan tarayıcıda test etmek için [Çevrimiçi ZPL Etiket Önizleme ve Test Rehberi](/tr/rehberler/cevrimici-zpl-etiket-onizleme-ve-test-rehberi/) aracımızı, Türkçe ve uluslararası karakter ayarları için [Zebra ZPL Etiket Yazdırma Rehberi](/tr/rehberler/zebra-zpl-etiket-yazdirma/) kılavuzumuzu inceleyebilirsiniz.

---

## 3. Paketleme Masasında "Barkod Okut ➔ Anında Bas" (Zero-Click Webhook) Otomasyonu

Yüksek hızlı bir e-ihracat deposunda paketleme personelinin bilgisayar faresi veya klavyesiyle işlem yapması hata riskini artırır. İdeal **Sıfır Tıklamalı Paketleme İstasyonu (Zero-Click Pack Station)** akışı şu 4 adımda çalışır:

1. **Toplama Sepeti (Tote) veya Ürün Barkodunun Okutulması:** Operatör, **[2D karekod okuyucu](https://rebo.com.tr/barkod-ve-2d-karekod-okuyucu-secim-rehberi-karsilastirma/)** ile sipariş fişini veya ürün barkodunu okutur.
2. **Kargo API ve Gümrük (`ETGB`) Kaydı:** WMS arka ucu, taşıyıcı API'sine paket ağırlığını ve `GTİP (HS Code)` kalemlerini göndererek `Base64` kodlu ham `ZPL II` etiketini alır.
3. **Base64 Çözme ve Sessiz İletim:** İstemci uygulama `Base64` metnini UTF-8 ZPL dizisine çözer ve [Tarayıcıdan Sessiz Bulut Baskı](/tr/rehberler/tarayicidan-sessiz-bulut-baski-ve-dogrudan-yazdirma-rehberi/) köprüsü (`WebUSB` veya `TCP 9100`) üzerinden doğrudan masadaki termal yazıcıya gönderir:

```javascript
// Kargo API'sinden Dönen Base64 ZPL Etiketini Çözüp Anında TCP 9100 Yazıcıya Basma
async function dispatchCarrierLabelToStation(base64Zpl, stationPrinterIp) {
  // Base64 ZPL verisini UTF-8 metnine çöz
  const rawZpl = Buffer.from(base64Zpl, 'base64').toString('utf8');

  // Yerel WebSocket-TCP 9100 köprüsüne veya doğrudan ağ soketine gönder
  const response = await fetch('http://127.0.0.1:8181/print-raw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      printerIp: stationPrinterIp,
      port: 9100,
      payload: rawZpl
    })
  });

  if (!response.ok) {
    throw new Error(`Paketleme istasyonu yazıcı hatası (${stationPrinterIp})`);
  }
  return await response.json();
}
```

4. **Otomatik Konveyör ve Paletleme Entegrasyonu:** Saatte 1.000+ paketin çıktığı e-ihracat merkezlerinde bu ZPL akışı doğrudan **[Rebo-Label otomatik koli ve palet etiketleme sistemine](https://rebolabel.com/blog/otomatik-koli-ve-palet-etiketleme-sistemi/)** yönlendirilir; 6 eksenli robotik kol etiketi pakete yapıştırırken entegre 2D kamera barkodun okunabilirliğini 50 milisaniyede doğrular. Shopify ve WooCommerce mağaza entegrasyonları için [Shopify ve Bulut E-Ticaret Fişi Entegrasyonu](/tr/rehberler/shopify-ve-bulut-eticaret-fisi-entegrasyonu/) rehberimize göz atabilirsiniz.

---

## 4. Sıkça Sorulan Sorular (SSS)

### Uluslararası kargo şirketleri (DHL, UPS, FedEx) hangi etiket boyutunu zorunlu tutar?
Küresel ekspres kargo taşıyıcılarının standart paket etiketi ölçüsü **`4 × 6 inç` (`100 × 150 mm` / `101,6 × 152,4 mm`)** boyutudur. Gümrük arşiv dokümanı (*Archive Doc / Waybill Doc*) tek etikette birleştirildiğinde ise **`4 × 8 inç` (`100 × 200 mm`)** termal etiket kullanılır.

### E-ihracat kargo etiketlerinde Direkt Termal mi yoksa Termal Transfer mi kullanılmalı?
Standart hava kargo gönderilerinde (3–10 gün teslimat süresi) kaliteli üst kaplamalı (**Top-Coated Direct Thermal**) etiketler yeterlidir. Ancak deniz yolu konteyner taşımacılığında, sıcak/nemli iklim bölgelerine yapılan sevkiyatlarda ve **AB Dijital Ürün Pasaportu (DPP)** kapsamındaki palet etiketlerinde sürtünme ve ısıdan kararmaması için **Termal Transfer (`PP Etiket + Wax/Resin Ribon`)** kullanılmalıdır.

### Kargo API'sinden `203 DPI` gelen ZPL etiketi `300 DPI` yazıcıda neden küçük çıkıyor?
ZPL koordinatları nokta (*dot*) bazlı olduğu için `203 DPI` (`8 nokta/mm`) için üretilmiş `800 × 1200` noktalık bir kargo etiketi, `300 DPI` (`12 nokta/mm`) yazıcıda basıldığında yalnızca `67 × 100 mm` alan kaplar. Kargo API isteğinde `printerResolution: 300` seçilmeli veya yazıcının DPI ölçekleme (*DPI Emulation*) özelliği aktif edilmelidir.

### Yurt dışı alıcı adreslerindeki Kiril, Arapça veya Avrupa karakterleri etikette neden soru işareti (`?`) çıkıyor?
Kargo API'sinden veya ERP'den gelen ZPL akışının başında `^CI28` (`UTF-8` karakter kodlaması) komutu bulunmadığında yazıcı varsayılan `CP850` tablosunu kullanır ve yabancı karakterleri basamaz. ZPL akışındaki `^XA` satırının hemen altına `^CI28` eklenerek ve yazıcı belleğine uluslararası Unicode font (`Swiss 721` / `TT0003M_`) tanımlanarak tüm diller kusursuz basılır.

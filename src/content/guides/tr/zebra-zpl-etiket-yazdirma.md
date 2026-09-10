---
title: "Zebra ZPL Programlama ve Etiket Tasarım Rehberi (ZPL II Kılavuzu)"
description: "ZPL komut diliyle barkod, QR kod, logo ve metin tasarımı. 203 vs 300 DPI koordinat hesaplama, 100x150 mm kargo şablonu ve ham soket yazdırma mimarisi."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: zebra-zpl-label-printing
---

Endüstriyel depolarda, e-ticaret lojistiğinde ve kargo dağıtım merkezlerinde kullanılan barkod ve sevkiyat etiketlerinin küresel standardı **Zebra ZPL II (Zebra Programming Language)** komut dilidir. ZPL, grafik tabanlı ağır PDF veya resim dosyaları yerine, doğrudan yazıcı işlemcisine komut satırlarıyla çizim yaptıran ASCII metin tabanlı son derece hızlı bir dildir.

Bir web uygulamasından veya ERP sisteminden termal etiket basarken ZPL kullanmak; bant genişliğini %90 azaltır, yazdırma hızını milisaniyelere indirir ve barkod çizgilerinin pikselleşmeden jilet gibi net çıkmasını sağlar.

Bu rehberde; ZPL II koordinat sisteminden DPI hesaplamalarına, Code 128 barkod ve QR kod yerleşiminden 100x150 mm kargo etiketi şablonuna kadar tüm mimariyi inceliyoruz.

---

## 1. ZPL II Temel Sözdizimi ve Koordinat Matematiği

Her ZPL etiketi istisnasız `^XA` (*Format Start*) komutu ile başlar ve `^XZ` (*Format End*) komutu ile biter. Bu iki sınır arasındaki tüm komutlar yazıcının dahili grafik belleğinde oluşturulur ve `^XZ` görüldüğü anda motor tetiklenerek etiket basılır.

```
^XA
^PW812
^LL1218
^FO50,50^A0N,36,36^FDPrintzen Cloud Print^FS
^XZ
```

### 1.1. ZPL'de Nokta (Dot) ve DPI Matematiği
ZPL'de koordinatlar milimetre veya piksel cinsinden değil, **yazıcı kafa noktası (dot)** cinsindendir. Bu nedenle etiketin fiziksel boyutu yazıcının DPI değerine sıkı sıkıya bağlıdır:

$$\text{Nokta Sayısı} = \text{Milimetre} \times \left(\frac{\text{DPI}}{25.4}\right)$$

| Standart Etiket Boyutu | 203 DPI (8 nokta/mm) | 300 DPI (12 nokta/mm) | 600 DPI (24 nokta/mm) |
|---|---|---|---|
| **100 × 150 mm (Kargo Etiketi)** | 800 × 1200 nokta | 1181 × 1771 nokta | 2362 × 3543 nokta |
| **80 × 50 mm (Ürün/Raf Etiketi)** | 640 × 400 nokta | 945 × 590 nokta | 1890 × 1181 nokta |
| **50 × 25 mm (Fiyat Barkodu)** | 400 × 200 nokta | 590 × 295 nokta | 1181 × 590 nokta |

> ⚠️ **Kritik Kural:** 203 DPI bir yazıcı için yazılan ZPL kodunu doğrudan 300 DPI bir yazıcıya (örneğin Zebra ZT411) gönderirseniz etiket yaklaşık %33 oranında küçülür ve sol üst köşeye sıkışır.

---

## 2. En Çok Kullanılan Temel ZPL Komutları

| Komut | İsim | Örnek | Açıklama & Parametreler |
|---|---|---|---|
| `^FOx,y` | Field Origin | `^FO50,100` | Alanın başlangıç koordinatı (X: soldan, Y: yukarıdan mesafe). |
| `^FD...^FS` | Field Data / Separator | `^FDMetin^FS` | Basılacak veriyi tanımlar ve alanı kapatır (`^FS`). |
| `^Afn,h,w` | Font Selection | `^A0N,40,40` | Font tipi (0: Ölçeklenebilir), yön (N: Normal, R: 90°), yükseklik, genişlik. |
| `^GBw,h,t,c` | Graphic Box | `^GB700,2,2^FS` | Çizgi veya kutu çizer (Genişlik, Yükseklik, Çizgi Kalınlığı, Köşe Yuvarlama). |
| `^BCo,h,f,g,e` | Code 128 Barkod | `^BCN,100,Y,N,N` | Endüstri standardı 1D barkod (Normal yön, 100 nokta yükseklik, metin göster). |
| `^BQo,m,s` | QR Kod | `^BQN,2,6` | 2D Karekod (Normal yön, Model 2, Büyüklük faktörü 1-10). |
| `^PWw` | Print Width | `^PW800` | Etiketin basılabilir genişliğini tanımlar (Taşmaları önler). |
| `^LLh` | Label Length | `^LL1200` | Etiket uzunluğunu tanımlar (Sürekli form rulolarda zorunludur). |

---

## 3. Barkod ve Karekod Yerleşimi (^BC ve ^BQ)

### 3.1. Code 128 Lojistik Barkodu (`^BC`)
E-ticaret ve kargo paketlerinde en yaygın kullanılan barkod standardı Code 128'dir. ZPL'de okunabilirliği maksimuma çıkarmak için modül genişliği (`^BY`) ile birlikte tanımlanır:

```
^FO50,200^BY3,2.5,100^BCN,100,Y,N,N^FD1Z9999999999999999^FS
```
- `^BY3`: Dar çizgi genişliği (3 nokta). Okuyucunun rahat yakalamasını sağlar.
- `^BCN,100,Y,N,N`: Yüksekliği 100 nokta, altta insan gözüyle okunabilir metin açık (`Y`).

### 3.2. 2D QR Kod Mimarisi (`^BQ`)
```
^FO500,200^BQN,2,6^FDQA,https://printzen.app/track/142857^FS
```
- `^BQN,2,6`: Model 2, Büyüklük katsayısı 6 nokta.
- `^FDQA,...`: `Q` hata düzeltme seviyesi (High %25), `A` otomatik veri tipi.

---

## 4. 100 × 150 mm Kargo Etiketi Şablonu (203 DPI)

Aşağıdaki hazır ZPL II şablonu, modern bir kargo/sevkiyat etiketinde bulunması gereken tüm alanları (Gönderici, Alıcı, Kargo Barkodu, Takip QR Kodu, Ürün Tablosu) içerir:

```zpl
^XA
^PW812
^LL1218
^LH0,0

^FX --- Üst Başlık & Logo Alanı ---
^FO50,40^A0N,44,44^FDPRINTZEN EXPRESS LOJISTIK^FS
^FO50,90^A0N,24,24^FDStandart Hizli Kargo / Ertesi Gun Teslim^FS
^FO50,125^GB712,3,3^FS

^FX --- Alici ve Gonderici Bilgileri ---
^FO50,150^A0N,22,22^FDGONDERICI:^FS
^FO50,180^A0N,26,26^FDPrintzen Depo ve Lojistik AS^FS
^FO50,210^A0N,22,22^FDIstanbul / Turkiye^FS

^FO420,150^A0N,22,22^FDALICI:^FS
^FO420,180^A0N,30,30^FDAhmet Yilmaz^FS
^FO420,215^A0N,24,24^FDAtaturk Mah. Gul Sok. No:12 D:4^FS
^FO420,245^A0N,24,24^FDKadikoy / Istanbul^FS
^FO50,285^GB712,3,3^FS

^FX --- Ana Kargo Takip Barkodu (Code 128) ---
^FO80,320^BY3,2.5,130^BCN,130,Y,N,N^FDPRZ-2026-981245^FS

^FX --- Bolum Ayirici Kutu ---
^FO50,510^GB712,180,2^FS
^FO70,530^A0N,24,24^FDSIPARIS NO: #84921^FS
^FO70,565^A0N,24,24^FDPARCA ADEDI: 3 Koli^FS
^FO70,600^A0N,24,24^FDAGIRLIK / DESI: 4.20 KG / 5 DESI^FS
^FO70,635^A0N,24,24^FDDURUM: Pesin Odendi (Kredi Karti)^FS

^FX --- QR Kod & Mobil Takip ---
^FO550,525^BQN,2,6^FDQA,https://printzen.app/track/PRZ-2026-981245^FS
^FO550,660^A0N,18,18^FDKAREKOD OKUTUN^FS

^FX --- Alt Bilgi ---
^FO50,710^GB712,3,3^FS
^FO50,730^A0N,20,20^FDTasiyici Guvencesi Altindadir. Hasarli Kolileri Tutanakla Teslim Aliniz.^FS
^XZ
```

---

## 5. Web ve Sunucudan ZPL Yazdırma Yöntemleri

### 5.1. Raw TCP Socket (Port 9100) — Node.js Örneği
Ethernet veya Wi-Fi bağlı Zebra yazıcılar standart olarak port 9100 üzerinden ham veri kabul eder:

```javascript
import net from 'net';

function sendZplToPrinter(ip, zplString) {
  const client = new net.Socket();
  client.connect(9100, ip, () => {
    client.write(zplString, 'utf8', () => {
      client.destroy();
      console.log('ZPL etiketi basariya gonderildi.');
    });
  });

  client.on('error', (err) => {
    console.error('Yazici baglanti hatasi:', err.message);
  });
}
```

### 5.2. Tarayıcıdan Direkt WebUSB ile ZPL Gönderme
```javascript
async function printZplWebUSB(zplString) {
  const device = await navigator.usb.requestDevice({
    filters: [{ vendorId: 0x0a5f }] // Zebra Vendor ID
  });

  await device.open();
  await device.selectConfiguration(1);
  await device.claimInterface(0);

  const encoder = new TextEncoder();
  const data = encoder.encode(zplString);

  // Endpoint 1 genelde OUT transferidir
  await device.transferOut(1, data);
  await device.close();
}
```

---

## 6. Sıkça Sorulan Sorular (SSS)

### ZPL kodları sadece Zebra yazıcılarda mı çalışır?
**Hayır, günümüzde TSC, Xprinter, Godex ve Honeywell gibi birçok marka ZPL emülasyonunu destekler.** Bu yazıcıların ayar panellerinden veya DIP switch'lerinden dil modunu "ZPL / ZPL II Emulation" olarak seçtiğinizde, Zebra için yazılmış etiket kodlarını birebir hatasız basabilirler.

### 203 DPI için yazılan ZPL kodu 300 DPI yazıcıda neden küçük çıkıyor?
**ZPL komutlarındaki koordinatlar piksel/nokta cinsindendir; inç veya milimetre cinsinden değildir.** 203 DPI yazıcıda 800 nokta 10 cm ederken, 300 DPI yazıcıda 800 nokta yaklaşık 6.7 cm'ye karşılık gelir. Farklı çözünürlükteki yazıcılar için koordinatları `DPI / 25.4` çarpanına göre dinamik hesaplamalı veya yazıcının dahili ölçekleme komutlarını (`^MU`) kullanmalısınız.

### ZPL'de şirket logosu veya resim nasıl basılır?
**ZPL'de resimler `^GF` (Graphic Field) komutu kullanılarak 1-bit monokrom hex dizisi olarak basılır.** Renkli veya gri tonlamalı resimler önce siyah-beyaz bitmape çevrilir, ardından satır bazında hex baytlarına dönüştürülerek `^GFA,...` komut bloğu içerisine gömülür.

### Etiket yazıcı her baskıdan sonra neden fazladan bir boş etiket fırlatıyor?
**Yazıcının etiket uzunluk sensörü (Gap/Çentik) kalibre edilmediğinde veya ZPL'deki `^LL` (Label Length) değeri fiziksel etiketten büyük tanımlandığında bu hata oluşur.** Çözüm için yazıcı kapalıyken besleme (FEED) tuşuna basılı tutarak açıp sensör kalibrasyonu yapmalı ve ZPL kodundaki `^LL` değerinin fiziksel etiket yüksekliğiyle tam eşleştiğinden emin olmalısınız.

### ZPL ile yazdırırken Türkçe karakterler neden bozuluyor?
**ZPL'in varsayılan fontları (Font 0) standart ASCII tablosunu kullanır ve Türkçe `Ş, Ğ, İ, ı, ç, ö, ü` karakterlerini doğrudan tanımaz.** Çözüm için etiket başında `^CI28` (UTF-8 modunu açan komut) verilmeli veya `_C5_9F` gibi ZPL hex kaçış karakterleri (Hex Escape) tercih edilmelidir.

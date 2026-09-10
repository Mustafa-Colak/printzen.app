---
title: "ZPL ile Etikete Barkod ve Karekod Yerleştirme (^BC ve ^BQ Komutları)"
description: "Zebra ZPL II ile Code 128 lojistik barkodu ve 2D QR kod tasarımı. Modül genişliği, hata düzeltme seviyeleri ve okunabilirlik optimizasyonu."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: zpl-label-barcode-and-qr-code-placement
---

Zebra etiket yazıcılarında lojistik ve ürün etiketlerinin kalbi barkodlardır. ZPL II dilinde grafik resim dosyası göndermek yerine doğrudan dahili barkod komutlarını kullanmak; lazer ve optik okuyucuların $360^\circ$ açıyla hatasız okuyabileceği kusursuz vektörel çizgiler üretir.

Bu rehberde; 1D Code 128 barkod komutunu (`^BC`), 2D QR kod komutunu (`^BQ`) ve modül genişliği ayarını (`^BY`) inceliyoruz.

---

## 1. Code 128 Barkod Yerleşimi (`^BC`) ve Modül Ayarı (`^BY`)

Bir kargo takip kodunu veya SKU numarasını basarken en yaygın kullanılan format Code 128'dir. ZPL'de barkodun çizgi kalınlığı ve yüksekliği iki temel komutla kontrol edilir:

### 1.1. Modül Genişliği Komutu (`^BY`)
Barkodun en ince çizgisinin kaç dot olacağını belirler:
```zpl
^BYw,r,h
```
- `w`: Modül genişliği (1-10 dot). 203 DPI yazıcılarda `2` veya `3` idealdir.
- `r`: Geniş çizginin dar çizgiye oranı (varsayılan: 2.5 - 3.0).
- `h`: Varsayılan çubuk yüksekliği (dot cinsinden).

### 1.2. Code 128 Komutu (`^BC`)
```zpl
^BCo,h,f,g,e,m
```
- `o`: Yön (`N`: Normal, `R`: 90° Döndürülmüş, `I`: 180°, `B`: 270°).
- `h`: Barkod yüksekliği (Örn: 100 dot).
- `f`: İnsan gözüyle okunabilir metin satırı (`Y`: Açık, `N`: Kapalı).
- `g`: Metnin konumu (`N`: Altta, `Y`: Üstte).

#### Örnek ZPL Code 128 Kodu:
```zpl
^XA
^FO50,100^BY3,2.5,120^BCN,120,Y,N,N^FDTR98124765^FS
^XZ
```

---

## 2. 2D Karekod Yerleşimi (`^BQ`)

Web linkleri, dijital pasaportlar ve e-fatura QR kodları için ZPL Model 2 QR kod standardını destekler:

```zpl
^BQo,m,s
```
- `o`: Yön (`N`: Normal).
- `m`: Model (`2`: En modern ve önerilen QR Model 2).
- `s`: Büyütme faktörü (1-10 dot). 203 DPI'da `5` veya `6`, 300 DPI'da `8` önerilir.

### QR Kod Veri Bloğu (`^FD` Biçimi):
QR koda metin veya URL yüklerken veri alanı şu formatta başlamalıdır:
```zpl
^FD[Hata Düzeltme][Girdi Modu],[URL veya Metin]^FS
```
- **Hata Düzeltme:** `H` (%30), `Q` (%25), `M` (%15), `L` (%7).
- **Girdi Modu:** `A` (Otomatik / ASCII).

#### Örnek ZPL QR Kod Kodu:
```zpl
^XA
^FO500,100^BQN,2,6^FDQA,https://printzen.app/track/TR98124765^FS
^XZ
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Barkod etiket basıldıktan sonra depo el terminali tarafından neden okunamıyor?
**Bunun iki temel sebebi vardır: Çizgi modülünün (`^BY`) çok dar olması veya barkodun etrafında yeterli beyaz boşluk (Quiet Zone) bırakılmaması.** 203 DPI bir yazıcıda `^BY1` kullanırsanız çizgiler birbirine yapışabilir; en az `^BY2` veya `^BY3` tercih edilmelidir. Ayrıca barkodun sağına ve soluna en az 30 dot boşluk bırakılmalıdır.

### ZPL'de hem barkod hem metin aynı satıra nasıl yerleştirilir?
**ZPL koordinat tabanlı bir dil olduğu için her eleman `^FOx,y` komutu ile bağımsız konumlandırılır.** Örneğin barkodu sol tarafa `^FO50,100` ile koyarken, yanındaki QR kodu `^FO500,100` koordinatına koyarak mükemmel bir yan yana yerleşim sağlayabilirsiniz.

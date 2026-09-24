---
title: "TSPL ve TSPL2 Masaüstü Barkod Yazıcı Programlama Kılavuzu"
description: "TSC, Xprinter ve Godex masaüstü etiket yazıcılarında kullanılan TSPL/TSPL2 dili komutları, SIZE, GAP, TEXT, BARCODE ve sensör kalibrasyon kuralları."
printerClass: "desktop"
brand: "Generic"
publishDate: 2026-09-11
translationKey: "tspl-ve-tspl2-masaustu-barkod-programlama"
topicCluster: "hub-3"
---

TSPL (Taiwan Semiconductor Programming Language) ve onun geliştirilmiş sürümü olan TSPL2, dünya çapında özellikle fiyat/performans odaklı masaüstü termal etiket yazıcılarında (TSC, Xprinter, Gprinter, Godex vb.) en çok tercih edilen etiket dillerinden biridir. ZPL kadar yaygın olan bu dil, çok daha basit ve okunabilir komut yapısıyla geliştiricilere hızlı entegrasyon imkanı sunar.

## Temel TSPL Komut Yapısı

TSPL komutları metin tabanlıdır ve her komut yeni bir satırda (`\r\n`) çalıştırılır. Bir etiket basımı temel olarak şu komut bloklarını içerir:

```tspl
SIZE 100 mm, 150 mm
GAP 3 mm, 0 mm
DIRECTION 1
CLS
TEXT 50,50,"3",0,1,1,"PRINTZEN E-TICARET KARGO"
BARCODE 50,120,"128",80,1,0,2,4,"TR1234567890"
PRINT 1,1
```

### Komutların Teknik Anlamları:
- **SIZE w, h:** Etiketin milimetre veya inç cinsinden genişlik ve yüksekliğini belirler. Örneğin 100x150 mm standart kargo etiketi için `SIZE 100 mm, 150 mm` yazılır.
- **GAP m, n:** İki etiket arasındaki boşluk (gap) yüksekliğini tanımlar. Standart rulolarda gap genellikle 2-3 mm arasındadır.
- **DIRECTION 0 | 1:** Etiketin yazıcı kafasından çıkış yönünü tersine çevirir (180 derece döndürme).
- **CLS:** Yazıcının dahili görüntü tamponunu (image buffer) temizler. Her yeni etiketten önce mutlaka çağrılmalıdır.
- **TEXT x, y, "font", rot, x-mul, y-mul, "content":** Belirtilen koordinata dahili donanım fontuyla metin çizer.
- **BARCODE x, y, "type", height, human-readable, rot, narrow, wide, "code":** Otomatik vektörel barkod üretir.
- **PRINT m, n:** Hazırlanan etiketi m kopya ve n set halinde anında termal kafadan çıkarır.

## TSPL ile QR Kod ve 2D Barkod Basımı

```tspl
QRCODE 50,250,L,5,A,0,"M2,S7","https://printzen.app/track/TR123"
```

- **L | M | Q | H:** Hata düzeltme (Error Correction) seviyesi. Kargo etiketlerinde genellikle 'M' (%15) veya 'Q' (%25) tercih edilir.
- **Cell width (1-10):** Karekodun her bir modülünün piksel genişliği. 203 DPI yazıcıda 4-6 arası ideal okunabilirlik sağlar.

## JavaScript / Node.js ile TSPL Paketi Oluşturma

```javascript
export function buildTsplLabel(data) {
  let cmd = '';
  cmd += 'SIZE 100 mm, 150 mm\r\n';
  cmd += 'GAP 3 mm, 0 mm\r\n';
  cmd += 'DIRECTION 1\r\n';
  cmd += 'CLS\r\n';
  cmd += `TEXT 40,40,"4",0,1,1,"${data.storeName}"\r\n`;
  cmd += `TEXT 40,90,"2",0,1,1,"Musteri: ${data.customerName}"\r\n`;
  cmd += `BARCODE 40,150,"128",90,1,0,2,4,"${data.trackingNo}"\r\n`;
  cmd += `QRCODE 500,150,H,4,A,0,"M2,S7","${data.qrData}"\r\n`;
  cmd += 'PRINT 1,1\r\n';
  return new TextEncoder().encode(cmd);
}
```

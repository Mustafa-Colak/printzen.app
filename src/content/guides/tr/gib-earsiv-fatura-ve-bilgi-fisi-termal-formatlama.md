---
title: "GİB e-Arşiv Fatura ve Vergi Bilgi Fişi Termal Formatlama Rehberi"
description: "GİB uyumlu e-arşiv fatura bilgilerini termal fiş formatına dönüştürme, zorunlu vergi alanları, QR kod ekleme ve yasal gereksinimler."
printerClass: "desktop"
brand: "Epson / Bixolon"
publishDate: 2026-09-11
translationKey: "gib-earsiv-fatura-bilgi-fisi-termal-formatlama"
topicCluster: "hub-15"
---

Türkiye'de faaliyet gösteren işletmelerin belirli cirolar üzerinde GİB (Gelir İdaresi Başkanlığı) uyumlu e-Arşiv veya e-Fatura sistemlerine geçmesi zorunludur. Termal yazıcılarla entegre çalışan bu sistemlerin doğru formatlanması hem yasal gereklilik hem de müşteri deneyimi açısından kritiktir.

## Zorunlu Vergi Alanları

GİB'e göre termal fişte bulunması gereken asgari bilgiler:

| Alan | Örnek |
|------|-------|
| İşletme unvanı | KAFE OLIMPOS LTD. ŞTİ. |
| Vergi Dairesi | Kadıköy V.D. |
| Vergi No (VKN) | 1234567890 |
| Tarih ve saat | 11.09.2026 14:35 |
| Fiş/fatura numarası | 2026-000123 |
| KDV oranı ve tutarı | %18 KDV: 13,56 TL |
| Toplam tutar | 89,00 TL |
| QR kod | GİB doğrulama linki |

## Termal Fiş Formatı

```javascript
function buildTaxReceipt(order) {
  const ESC = 0x1B, GS = 0x1D, LF = 0x0A;
  const enc = new TextEncoder();
  const cols = 42; // 80mm yazıcı için

  function padRow(left, right) {
    const pad = cols - left.length - right.length;
    return left + ' '.repeat(Math.max(1, pad)) + right + '
';
  }

  function divider() {
    return enc.encode('-'.repeat(cols) + '
');
  }

  const cmds = [
    ESC, 0x40,                   // sıfırla
    ESC, 0x61, 0x01,             // ortala
    ESC, 0x21, 0x10,             // çift boy
    ...enc.encode(order.businessName + '
'),
    ESC, 0x21, 0x00,             // normal
    ...enc.encode(order.taxOffice + ' V.D. / VKN: ' + order.taxNo + '
'),
    ...enc.encode(order.address + '
'),
    ...divider(),

    ESC, 0x61, 0x00,             // sola hizala
    ...enc.encode('FİŞ NO: ' + order.receiptNo + '
'),
    ...enc.encode('TARİH: ' + new Date().toLocaleString('tr-TR') + '
'),
    ...divider(),
  ];

  // Ürünler
  for (const item of order.items) {
    const total = (item.price * item.qty).toFixed(2) + ' TL';
    cmds.push(...enc.encode(padRow(item.name.substring(0, 28) + ' x' + item.qty, total)));
  }

  cmds.push(...divider());

  // Vergi hesaplaması
  const kdvBase = (order.total / 1.18).toFixed(2);
  const kdvAmount = (order.total - parseFloat(kdvBase)).toFixed(2);

  cmds.push(
    ...enc.encode(padRow('KDV Matrahı (%18)', kdvBase + ' TL')),
    ...enc.encode(padRow('KDV Tutarı', kdvAmount + ' TL')),
    ...divider(),
    ESC, 0x45, 0x01,             // kalın
    ...enc.encode(padRow('TOPLAM', order.total.toFixed(2) + ' TL')),
    ESC, 0x45, 0x00,
  );

  // GİB QR Kodu
  const gibUrl = 'https://earsivportal.efatura.gov.tr/indir/' + order.receiptNo;
  cmds.push(
    ...divider(),
    ESC, 0x61, 0x01,             // ortala
    GS, 0x28, 0x6B,              // QR kod başlat
    // QR data command sequence
    ...buildQRCode(gibUrl),
    ...enc.encode('GİB e-Arşiv
'),
    ...enc.encode(order.receiptNo + '
'),
    LF, LF, LF,
    GS, 0x56, 0x41, 0x03        // kes
  );

  return cmds;
}
```

## GİB QR Kod Formatı

```javascript
function buildQRCode(url) {
  const GS = 0x1D;
  const data = new TextEncoder().encode(url);
  const len = data.length + 3;
  const pL = len & 0xFF;
  const pH = (len >> 8) & 0xFF;

  return [
    // Model seç (model 2)
    GS, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00,
    // Boyut (module size = 4)
    GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x04,
    // Hata düzeltme seviyesi (M = 48)
    GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31,
    // Veri
    GS, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30, ...data,
    // Yazdır
    GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30
  ];
}
```

## e-Fatura vs e-Arşiv Fatura Farkı

| Özellik | e-Fatura | e-Arşiv |
|---------|----------|---------|
| Hedef kitle | e-Fatura mükellefi işletmeler | Bireysel tüketiciler / küçük işletmeler |
| GİB onayı | Anlık (UBL-TR XML) | 3 gün içinde |
| Termal baskı | Bilgi amaçlı | Asıl belge olabilir |
| QR zorunluluğu | Evet | Evet |

## Sık Sorulan Sorular

### e-Arşiv fatura termal fişte yasal olarak geçerli mi?
Evet, GİB'in belirlediği zorunlu alanlar (VKN, tarih, tutar, KDV, QR) bulunduğu sürece termal baskı yasal belgedir.

### KDV oranı birden fazlaysa ne yapılır?
Her KDV dilimi (%1, %10, %20) ayrı satırda gösterilmelidir.

### Yazar kasa entegrasyonu zorunlu mu?
Tüm mükelleflere değil. Güvenli mobil ödeme cihazı (GMÖ) veya ÖKC sahibi olmayanlar e-Arşiv sistemiyle muaf tutulabilir. Mali müşavirinize danışın.

## Desteklenen Cihazlar

Bu rehberdeki adımlar, ilgili protokolü/arayüzü destekleyen aşağıdaki yazıcı modellerinin tamamı için geçerlidir:

| Marka | Model | Protokol | Arayüzler | Kağıt Genişliği |
|---|---|---|---|---|
| Bixolon | SLP-TX400 | SLCS / BPL-Z | USB, Ethernet, Seri | 104mm |
| Bixolon | SPP-R200III | ESC/POS / CPCL | Bluetooth, Wi-Fi, USB | 58mm |
| Bixolon | SPP-R310 | ESC/POS / CPCL | Bluetooth BLE, USB | 80mm |
| Bixolon | SRP-330II | ESC/POS | USB, Ethernet | 80mm |
| Bixolon | SRP-350III | ESC/POS | USB, Ethernet, Seri | 80mm |
| Bixolon | SRP-Q300 | ESC/POS | Bluetooth, Wi-Fi, USB, Ethernet | 80mm |
| Epson | TM-L90 | ESC/POS | USB, Ethernet | 80mm |
| Epson | TM-m30II | ESC/POS | Bluetooth, Wi-Fi, USB, Ethernet | 80mm / 58mm |
| Epson | TM-P20II | ESC/POS | Bluetooth 5.0, Wi-Fi | 58mm |
| Epson | TM-P80II | ESC/POS | Bluetooth, Wi-Fi | 80mm |
| Epson | TM-T20III | ESC/POS | USB, Ethernet, Seri | 80mm / 58mm |
| Epson | TM-T88VI | ESC/POS | USB, Ethernet, Bluetooth, Wi-Fi | 80mm / 58mm |
| Epson | TM-T88VII | ESC/POS | USB, Ethernet, Wi-Fi | 80mm |
| Godex | DT4x | EZPL | USB, Ethernet, Seri | 108mm |
| Godex | G500 | EZPL / GEPL / GZPL | USB, Ethernet, Seri | 108mm |
| Godex | RT700 | EZPL | USB, Ethernet | 108mm |
| Honeywell | PC42d | ZSim / ESim | USB | 104mm |
| Honeywell | PC42t | Direct Protocol / ZSim / ESim | USB, Ethernet, Seri | 104mm |
| Rongta | RP326 | ESC/POS | USB, Ethernet, Seri | 80mm |
| Rongta | RP410 | TSPL / ESC/POS | USB | 108mm |
| Rongta | RP80 | ESC/POS | USB, Ethernet | 80mm |
| Rongta | RPP02N | ESC/POS | Bluetooth, USB | 58mm |
| Seiko | MP-B30L | ESC/POS / SII SDK | Bluetooth, USB | 80mm |
| Seiko | RP-D10 | ESC/POS | USB, Ethernet, Bluetooth | 80mm |
| Star Micronics | mC-Print3 | StarPRNT | CloudPRNT, Bluetooth, Ethernet, USB | 80mm |
| Star Micronics | SM-L200 | Star Line | Bluetooth 4.0 BLE, USB | 58mm |
| Star Micronics | SM-T300i | Star Line / ESC/POS | Bluetooth (MFi), Seri | 80mm |
| Star Micronics | TSP143III | StarPRNT / ESC/POS | Ethernet, Wi-Fi, USB, Lightning | 80mm |
| Star Micronics | TSP654II | Star Line / ESC/POS | Bluetooth, Ethernet, USB | 80mm |
| Sunmi | V2 Pro | ESC/POS (Sunmi InnerPrinter) | Dahili Donanım, Bluetooth | 58mm |
| TSC | Alpha-3R | TSPL / CPCL / ESC/POS | Bluetooth, USB | 72mm (3 inç) |
| TSC | DA210 | TSPL-EZD | USB | 108mm |
| TSC | DA220 | TSPL-EZD | USB, Ethernet, Bluetooth, Wi-Fi | 108mm |
| TSC | TE200 | TSPL-EZ | USB 2.0 | 108mm |
| TSC | TTP-244 Pro | TSPL | USB, Seri | 108mm |
| Xprinter | XP-365B | TSPL / ESC/POS | USB | 80mm |
| Xprinter | XP-420B | TSPL / ESC/POS | USB, Bluetooth, Ethernet | 108mm (100x150) |
| Xprinter | XP-470B | TSPL | USB | 108mm |
| Xprinter | XP-58IIH | ESC/POS | USB, Bluetooth | 58mm |
| Xprinter | XP-N160II | ESC/POS | USB, Ethernet | 80mm |
| Xprinter | XP-P300 | ESC/POS | Bluetooth, USB | 58mm |
| Xprinter | XP-Q800 | ESC/POS | USB, Ethernet, Seri | 80mm |
| Zebra | GK420d | ZPL II / EPL2 | USB, Ethernet, Seri | 104mm |
| Zebra | GK420t | ZPL II / EPL2 | USB, Ethernet | 104mm |
| Zebra | ZD220 | ZPL II / EPL | USB | 104mm (4 inç) |
| Zebra | ZD420 | ZPL II / EPL | USB, Ethernet, Bluetooth, Wi-Fi | 104mm |
| Zebra | ZD421 | ZPL II / EPL | USB, Ethernet, Bluetooth BLE | 104mm |
| Zebra | ZQ320 Plus | CPCL / ZPL | Bluetooth BLE, Wi-Fi | 80mm (3 inç) |
| Zebra | ZQ520 | CPCL / ZPL | Bluetooth, Wi-Fi | 104mm (4 inç) |
| Zebra | ZT411 | ZPL II | Ethernet, USB, Bluetooth 4.1 | 104mm |


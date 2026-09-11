---
title: "CPCL Mobil Kurye ve Saha Yazdırma Protokolü Kılavuzu"
description: "Taşınabilir kemer tipi mobil yazıcılarda kullanılan CPCL protokolü mimarisi, pil koruma optimizasyonları ve saha teslimat fişi tasarımı."
printerClass: "desktop"
brand: "Generic"
publishDate: 2026-09-11
translationKey: "cpcl-mobil-kurye-ve-saha-yazdirma-protokolu"
topicCluster: "hub-4"
---

CPCL (Comtec Printer Control Language), mobil kargo kuryeleri, otopark görevlileri, elektrik/su sayaç okuma personeli ve saha satış ekiplerinin kemer tipi taşınabilir yazıcılarında (Zebra QLn/ZQ serisi, Bixolon SPP serisi, Rongta mobil yazıcılar) kullanılan ultra hafif bir komut dilidir.

## CPCL Neden Mobil Sistemlerde Tercih Edilir?
ZPL ve TSPL gibi masaüstü dilleri tüm etiketi hafızada büyük bir piksel tamponuna işlerken, CPCL doğrudan **satır odaklı (streaming line-oriented)** mimariye sahiptir. Bu sayede:
1. Mobil yazıcının mikroişlemcisi ve RAM'i minimum seviyede yorulur.
2. Batarya tüketimi %40'a varan oranda azalır.
3. Bluetooth BLE üzerinden iletilen toplam bayt paketi çok küçüktür, bu da transfer süresini kısaltır.

## CPCL Kod Bloğu Anatomisi

```cpcl
! 0 200 200 600 1
PAGE-WIDTH 576
TEXT 4 0 30 40 PRINTZEN MOBIL KURYE
TEXT 7 0 30 90 Teslimat Fisi #TR-9982
LINE 30 130 540 130 2
TEXT 7 0 30 150 Musteri: Ayse Demir
TEXT 7 0 30 180 Tutar: 145.50 TL (Kredi Karti)
BARCODE 128 1 1 50 30 230 TR9982718
PRINT
```

- **! 0 200 200 600 1:** Başlangıç satırı. Orijin (0), X-DPI (200), Y-DPI (200), maksimum yükseklik (600 dot) ve kopya adedi (1).
- **PAGE-WIDTH 576:** 80 mm (72 mm baskı alanı) yazıcı için sayfa genişliği sınırı.
- **TEXT font size x y text:** Belirtilen font ve koordinata metin yerleştirir.
- **BARCODE type width ratio height x y data:** 1D barkod üretir.
- **PRINT:** Baskıyı başlatır ve kağıdı yırtma çizgisine (tear-bar) ilerletir.

## Desteklenen Cihazlar

Bu rehberdeki adımlar, ilgili protokolü/arayüzü destekleyen aşağıdaki yazıcı modellerinin tamamı için geçerlidir:

| Marka | Model | Protokol | Arayüzler | Kağıt Genişliği |
|---|---|---|---|---|
| Bixolon | SPP-R200III | ESC/POS / CPCL | Bluetooth, Wi-Fi, USB | 58mm |
| Bixolon | SPP-R310 | ESC/POS / CPCL | Bluetooth BLE, USB | 80mm |
| TSC | Alpha-3R | TSPL / CPCL / ESC/POS | Bluetooth, USB | 72mm (3 inç) |
| Zebra | ZQ320 Plus | CPCL / ZPL | Bluetooth BLE, Wi-Fi | 80mm (3 inç) |
| Zebra | ZQ520 | CPCL / ZPL | Bluetooth, Wi-Fi | 104mm (4 inç) |


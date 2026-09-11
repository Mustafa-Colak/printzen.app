---
title: "EPL ve EPL2 Eski Nesil Etiket Mimarisi ve Emülasyon Rehberi"
description: "Eltron kökenli EPL/EPL2 barkod komut yapısı, N/q/Q/A/B komutları ve modern ZPL/TSPL sistemlerine kod kaybı olmadan dönüştürme metotları."
printerClass: "desktop"
brand: "Generic"
publishDate: 2026-09-11
translationKey: "epl-ve-epl2-eski-nesil-etiket-emulasyonu"
topicCluster: "hub-5"
---

EPL (Eltron Programming Language) ve EPL2, 1990'lar ve 2000'lerin başında Zebra'nın Eltron'u satın almasıyla etiket dünyasında standart haline gelen ilk nesil sayfa tanımlama dillerindendir. Günümüzde birçok eski hastane otomasyonu, kargo şubesi ve kurumsal ERP sistemi halen EPL formatında çıktı üretmektedir.

## EPL2 Komut Yapısı

EPL2 komutları tek harfli direktiflerle çalışır ve son derece kompakttır:

```epl
N
q812
Q1218,24
A50,50,0,4,1,1,N,"PRINTZEN DEPO KABUL"
B50,120,0,1,3,6,80,B,"123456789"
P1
```

- **N (New):** Belleği sıfırlar ve yeni bir etiket başlatır.
- **q (width):** Etiketin nokta (dot) cinsinden genişliğini tanımlar (812 dot = 100 mm).
- **Q (height, gap):** Etiket yüksekliğini ve gap mesafesini belirler.
- **A (ASCII text):** Metin çizer (x, y, rotation, font, h-mul, v-mul, reverse, data).
- **B (Barcode):** Barkod basar (Code 128, EAN vb.).
- **P (Print):** Baskıyı gerçekleştirir.

## Desteklenen Cihazlar

Bu rehberdeki adımlar, ilgili protokolü/arayüzü destekleyen aşağıdaki yazıcı modellerinin tamamı için geçerlidir:

| Marka | Model | Protokol | Arayüzler | Kağıt Genişliği |
|---|---|---|---|---|
| Godex | DT4x | EZPL | USB, Ethernet, Seri | 108mm |
| Godex | G500 | EZPL / GEPL / GZPL | USB, Ethernet, Seri | 108mm |
| Godex | RT700 | EZPL | USB, Ethernet | 108mm |
| Rongta | RP410 | TSPL / ESC/POS | USB | 108mm |
| TSC | Alpha-3R | TSPL / CPCL / ESC/POS | Bluetooth, USB | 72mm (3 inç) |
| TSC | DA210 | TSPL-EZD | USB | 108mm |
| TSC | DA220 | TSPL-EZD | USB, Ethernet, Bluetooth, Wi-Fi | 108mm |
| TSC | TE200 | TSPL-EZ | USB 2.0 | 108mm |
| TSC | TTP-244 Pro | TSPL | USB, Seri | 108mm |
| Xprinter | XP-365B | TSPL / ESC/POS | USB | 80mm |
| Xprinter | XP-420B | TSPL / ESC/POS | USB, Bluetooth, Ethernet | 108mm (100x150) |
| Xprinter | XP-470B | TSPL | USB | 108mm |
| Zebra | GK420d | ZPL II / EPL2 | USB, Ethernet, Seri | 104mm |
| Zebra | GK420t | ZPL II / EPL2 | USB, Ethernet | 104mm |
| Zebra | ZD220 | ZPL II / EPL | USB | 104mm (4 inç) |
| Zebra | ZD420 | ZPL II / EPL | USB, Ethernet, Bluetooth, Wi-Fi | 104mm |
| Zebra | ZD421 | ZPL II / EPL | USB, Ethernet, Bluetooth BLE | 104mm |
| Zebra | ZQ320 Plus | CPCL / ZPL | Bluetooth BLE, Wi-Fi | 80mm (3 inç) |
| Zebra | ZQ520 | CPCL / ZPL | Bluetooth, Wi-Fi | 104mm (4 inç) |
| Zebra | ZT411 | ZPL II | Ethernet, USB, Bluetooth 4.1 | 104mm |


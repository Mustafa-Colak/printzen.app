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

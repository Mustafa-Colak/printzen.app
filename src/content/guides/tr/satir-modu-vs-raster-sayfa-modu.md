---
title: "Satır Modu (Line Mode) vs Raster Sayfa Modu Karşılaştırması"
description: "Belleği kısıtlı termal cihazlarda satır satır akıtılan veri ile tüm fişin 1-bit monokrom bitmap tamponuna işlenip tek seferde basılması arasındaki hız ve hafıza farkları."
printerClass: "desktop"
brand: "Generic"
publishDate: 2026-09-11
translationKey: "satir-modu-vs-raster-sayfa-modu"
topicCluster: "hub-7"
---

Termal yazdırma mimarisinde en temel mühendislik tercihlerinden biri, çıktının **Satır Modu (Standard Line Mode)** ile mi yoksa **Sayfa / Raster Modu (Page Mode)** ile mi basılacağıdır.

### Karşılaştırma Matrisi

| Kriter | Satır Modu (Line Mode) | Sayfa / Raster Modu (Page Mode) |
|---|---|---|
| **Bellek Tüketimi** | Çok düşük (birkaç satır buffer) | Yüksek (Tam etiket framebuffer'ı) |
| **Baskı Gecikmesi** | Sıfır (bayt geldikçe kafa basar) | Tampon dolana kadar bekler |
| **Tipografi & Düzen** | Sınırlı (sadece sabit kolonlar) | Sınırsız (HTML/CSS, serbest koordinat) |
| **Karakter Kod Sayfası** | Yazıcı firmware'ine bağımlı | Bağımsız (tüm fontlar çizilir) |

## Popüler Yazıcı Modeli Özelinde Kılavuzlar

- [Bixolon Slp Tx400 Satir](/tr/rehber/bixolon-slp-tx400-satir-modu-vs-raster-sayfa-modu)
- [Bixolon Spp R200iii Satir](/tr/rehber/bixolon-spp-r200iii-satir-modu-vs-raster-sayfa-modu)
- [Bixolon Spp R310 Satir](/tr/rehber/bixolon-spp-r310-satir-modu-vs-raster-sayfa-modu)
- [Bixolon Srp 330ii Satir](/tr/rehber/bixolon-srp-330ii-satir-modu-vs-raster-sayfa-modu)
- [Bixolon Srp 350iii Satir](/tr/rehber/bixolon-srp-350iii-satir-modu-vs-raster-sayfa-modu)
- [Bixolon Srp Q300 Satir](/tr/rehber/bixolon-srp-q300-satir-modu-vs-raster-sayfa-modu)
- [Epson Tm L90 Satir](/tr/rehber/epson-tm-l90-satir-modu-vs-raster-sayfa-modu)
- [Epson Tm M30ii Satir](/tr/rehber/epson-tm-m30ii-satir-modu-vs-raster-sayfa-modu)
- [Epson Tm P20ii Satir](/tr/rehber/epson-tm-p20ii-satir-modu-vs-raster-sayfa-modu)
- [Epson Tm P80ii Satir](/tr/rehber/epson-tm-p80ii-satir-modu-vs-raster-sayfa-modu)

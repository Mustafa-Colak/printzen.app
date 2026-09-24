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

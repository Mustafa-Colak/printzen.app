---
title: "Star Line Mode ve StarPRNT Fiş Yazıcı Protokolleri Kılavuzu"
description: "Star Micronics masaüstü ve mutfak yazıcılarının emülasyon farkları, Star Line Mode komutları ve ESC/POS uyumluluk katmanları."
printerClass: "desktop"
brand: "Generic"
publishDate: 2026-09-11
translationKey: "star-line-mode-ve-starprnt-fis-protokolleri"
topicCluster: "hub-6"
---

Star Micronics, özellikle perakende, kiosk ve restoran sektöründe Epson'ın en büyük küresel rakibidir. Star yazıcılar (TSP143, TSP654 vb.) fabrika çıkışında ya **Star Line Mode** ya da modern **StarPRNT** protokolüyle gelir.

## Star Line Mode vs ESC/POS Farkları
- **Kesici Komutu:** ESC/POS `GS V` kullanırken, Star yazıcılar `ESC d 2` veya `ESC d 3` komutlarını kullanır.
- **Çekmece Açma:** ESC/POS `ESC p` kullanırken, Star `BEL` (0x07) karakteriyle çekmece solenoidini tetikler.
- **Hizalama:** Star `ESC a n` yapısını kullanır.

## Popüler Yazıcı Modeli Özelinde Kılavuzlar

- [Bixolon Slp Tx400 Star](/tr/rehber/bixolon-slp-tx400-star-line-mode-ve-starprnt-fis-protokolleri)
- [Bixolon Spp R200iii Star](/tr/rehber/bixolon-spp-r200iii-star-line-mode-ve-starprnt-fis-protokolleri)
- [Bixolon Spp R310 Star](/tr/rehber/bixolon-spp-r310-star-line-mode-ve-starprnt-fis-protokolleri)
- [Bixolon Srp 330ii Star](/tr/rehber/bixolon-srp-330ii-star-line-mode-ve-starprnt-fis-protokolleri)
- [Bixolon Srp 350iii Star](/tr/rehber/bixolon-srp-350iii-star-line-mode-ve-starprnt-fis-protokolleri)
- [Bixolon Srp Q300 Star](/tr/rehber/bixolon-srp-q300-star-line-mode-ve-starprnt-fis-protokolleri)
- [Epson Tm L90 Star](/tr/rehber/epson-tm-l90-star-line-mode-ve-starprnt-fis-protokolleri)
- [Epson Tm M30ii Star](/tr/rehber/epson-tm-m30ii-star-line-mode-ve-starprnt-fis-protokolleri)
- [Epson Tm P20ii Star](/tr/rehber/epson-tm-p20ii-star-line-mode-ve-starprnt-fis-protokolleri)
- [Epson Tm P80ii Star](/tr/rehber/epson-tm-p80ii-star-line-mode-ve-starprnt-fis-protokolleri)

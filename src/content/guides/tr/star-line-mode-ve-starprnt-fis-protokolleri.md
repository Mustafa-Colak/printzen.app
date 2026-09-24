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

---
title: "React, Next.js ve Vue.js İçin useThermalPrinter Kancası (Hook)"
description: "Modern SPA ve SSR web uygulamalarında yazıcı bağlantı durumunu, pil seviyesini ve baskı kuyruğunu yöneten reaktif kancalar."
printerClass: "desktop"
brand: "Generic"
publishDate: 2026-09-11
translationKey: "react-nextjs-vue-icin-usethermalprinter-kancasi"
topicCluster: "hub-48"
---

React, Next.js ve Vue tabanlı modern web POS arayüzlerinde yazıcı durumunu reaktif olarak yönetmek için `useThermalPrinter` kancası kullanılır.

```tsx
import { useThermalPrinter } from '@printzen/react';

export function CheckoutButton({ receiptData }) {
  const { isConnected, printReceipt, connect, status } = useThermalPrinter({
    transport: 'bluetooth'
  });

  return (
    <button onClick={() => isConnected ? printReceipt(receiptData) : connect()}>
      {isConnected ? 'Hemen Yazdır' : 'Yazıcıya Bağlan'}
    </button>
  );
}
```

## Popüler Yazıcı Modeli Özelinde Kılavuzlar

- [Bixolon Slp Tx400 React](/tr/rehber/bixolon-slp-tx400-react-nextjs-vue-icin-usethermalprinter-kancasi)
- [Bixolon Spp R200iii React](/tr/rehber/bixolon-spp-r200iii-react-nextjs-vue-icin-usethermalprinter-kancasi)
- [Bixolon Spp R310 React](/tr/rehber/bixolon-spp-r310-react-nextjs-vue-icin-usethermalprinter-kancasi)
- [Bixolon Srp 330ii React](/tr/rehber/bixolon-srp-330ii-react-nextjs-vue-icin-usethermalprinter-kancasi)
- [Bixolon Srp 350iii React](/tr/rehber/bixolon-srp-350iii-react-nextjs-vue-icin-usethermalprinter-kancasi)
- [Bixolon Srp Q300 React](/tr/rehber/bixolon-srp-q300-react-nextjs-vue-icin-usethermalprinter-kancasi)
- [Epson Tm L90 React](/tr/rehber/epson-tm-l90-react-nextjs-vue-icin-usethermalprinter-kancasi)
- [Epson Tm M30ii React](/tr/rehber/epson-tm-m30ii-react-nextjs-vue-icin-usethermalprinter-kancasi)
- [Epson Tm P20ii React](/tr/rehber/epson-tm-p20ii-react-nextjs-vue-icin-usethermalprinter-kancasi)
- [Epson Tm P80ii React](/tr/rehber/epson-tm-p80ii-react-nextjs-vue-icin-usethermalprinter-kancasi)

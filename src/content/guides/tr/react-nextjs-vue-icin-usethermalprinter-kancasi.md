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

Modern web uygulamalarında donanım entegrasyonu yaparken en büyük zorluk, fiziksel yazdırma durumlarını (Bağlanıyor, Yazdırılıyor, Kağıt Bitti, Hata) bileşenlerin reaktif yaşam döngüsüyle (Component Lifecycle) senkronize etmektir. Yukarıdaki `@printzen/react` paketi bunu hazır bir çözüm olarak sunar; kendi WebSocket taşıma katmanınızı yazmak isterseniz aşağıdaki iki kancayı referans alabilirsiniz.

---

## React Custom Hook: `useThermalPrinter` (Kendi WebSocket Katmanınızla)

```typescript
import { useState, useCallback } from 'react';

export function useThermalPrinter(transportEndpoint = 'ws://localhost:18570') {
  const [status, setStatus] = useState<'idle' | 'printing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const print = useCallback(async (binaryBytes: Uint8Array) => {
    setStatus('printing');
    setErrorMessage(null);

    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(transportEndpoint);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        ws.send(binaryBytes);
        ws.close();
        setStatus('idle');
        resolve();
      };

      ws.onerror = (err) => {
        setStatus('error');
        setErrorMessage('Yazıcı servisine bağlanılamadı.');
        reject(err);
      };
    });
  }, [transportEndpoint]);

  return { print, status, isPrinting: status === 'printing', errorMessage };
}
```

### React Bileşeninde Kullanımı:
```tsx
import React from 'react';
import { useThermalPrinter } from './useThermalPrinter';

export function KasaBileseni({ siparis }: { siparis: any }) {
  const { print, isPrinting, errorMessage } = useThermalPrinter();

  const handleBaski = async () => {
    // ESC/POS komut dizisi
    const bytes = new Uint8Array([0x1B, 0x40, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x0A, 0x1D, 0x56, 66, 0]);
    await print(bytes);
  };

  return (
    <div>
      <button onClick={handleBaski} disabled={isPrinting}>
        {isPrinting ? 'Yazdırılıyor...' : 'Fiş Bas'}
      </button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}
```

---

## Vue 3 Composable: `useThermalReceipt`

```typescript
import { ref } from 'vue';

export function useThermalReceipt(endpoint = 'ws://localhost:18570') {
  const isPrinting = ref(false);
  const error = ref<string | null>(null);

  async function print(payload: Uint8Array) {
    isPrinting.value = true;
    error.value = null;

    try {
      const ws = new WebSocket(endpoint);
      await new Promise((resolve, reject) => {
        ws.onopen = () => {
          ws.send(payload);
          ws.close();
          resolve(true);
        };
        ws.onerror = reject;
      });
    } catch (e: any) {
      error.value = 'Baskı hatası oluştu.';
    } finally {
      isPrinting.value = false;
    }
  }

  return { print, isPrinting, error };
}
```

---

## Sıkça Sorulan Sorular (SSS)

### Kullanıcı peş peşe 5 kez "Yazdır" butonuna basarsa ne olur?
**`isPrinting` durumu buton üzerinde `disabled={isPrinting}` olarak bağlandığı için çift tıklamalar engellenir.** Ayrıca kurumsal senaryolarda kancanın içine bir FIFO (İlk Giren İlk Çıkar) yazdırma kuyruğu eklenerek işler sırayla basılır.

### Bu kancalar Web Bluetooth ile birlikte kullanılabilir mi?
**Evet, taşıyıcı katmanı WebSocket yerine Web Bluetooth GATT karakteristiğine bağlanacak şekilde soyutlanabilir.**

### `@printzen/react` paketi ile kendi kancamı yazmak arasındaki fark ne?
**`@printzen/react` bağlantı yönetimini, yeniden bağlanmayı ve pil seviyesi takibini hazır sunar; kendi kancanızı yazmak ise taşıma katmanı (WebSocket, Web Bluetooth, WebUSB) üzerinde tam kontrol ister.** Hızlı başlangıç için pakete, özel altyapı gereksinimleri için yukarıdaki referans implementasyonlara başvurun.

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


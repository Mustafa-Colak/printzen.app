---
title: "React ve Vue Projelerinde Termal Yazıcı Entegrasyon Kancaları (Custom Hooks)"
description: "React için useThermalPrinter hook'u ve Vue 3 için useThermalReceipt composable'ı. Durum yönetimi, kuyruklama ve hata yakalama ile kurumsal Web POS mimarisi."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: react-vue-thermal-printer-integration-hooks
---

Modern web uygulamalarında donanım entegrasyonu yaparken en büyük zorluk, fiziksel yazdırma durumlarını (Bağlanıyor, Yazdırılıyor, Kağıt Bitti, Hata) bileşenlerin reaktif yaşam döngüsüyle (Component Lifecycle) senkronize etmektir.

Doğru tasarım deseni; React projelerinde **Custom Hook (`useThermalPrinter`)**, Vue 3 projelerinde ise **Composition API (`useThermalReceipt`)** oluşturmaktır.

---

## 1. React Custom Hook: `useThermalPrinter`

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

## 2. Vue 3 Composable: `useThermalReceipt`

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

## 3. Sıkça Sorulan Sorular (SSS)

### Kullanıcı peş peşe 5 kez "Yazdır" butonuna basarsa ne olur?
**`isPrinting` durumu buton üzerinde `disabled={isPrinting}` olarak bağlandığı için çift tıklamalar engellenir.** Ayrıca kurumsal senaryolarda kancanın içine bir FIFO (İlk Giren İlk Çıkar) yazdırma kuyruğu eklenerek işler sırayla basılır.

### Bu kancalar Web Bluetooth ile birlikte kullanılabilir mi?
**Evet, taşıyıcı katmanı WebSocket yerine Web Bluetooth GATT karakteristiğine bağlanacak şekilde soyutlanabilir.**

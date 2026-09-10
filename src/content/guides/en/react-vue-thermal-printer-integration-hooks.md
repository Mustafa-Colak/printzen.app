---
title: "Integrating Thermal Printers in React and Vue: Custom Hooks & Composables"
description: "Build robust Web POS frontends with React's useThermalPrinter hook and Vue 3's useThermalReceipt composable. Manage connection lifecycle and print states."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: react-vue-thermal-printer-integration-hooks
---

When integrating physical hardware into modern frontend frameworks, managing asynchronous states (Connecting, Printing, Out of Paper, Offline) within component lifecycles is critical to prevent UI freezing and duplicate prints.

The clean architectural pattern encapsulates hardware communication into **React Custom Hooks (`useThermalPrinter`)** and **Vue 3 Composables (`useThermalReceipt`)**.

---

## 1. React Custom Hook: `useThermalPrinter`

```typescript
import { useState, useCallback } from 'react';

export function useThermalPrinter(agentSocketUrl = 'ws://localhost:18570') {
  const [isPrinting, setIsPrinting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const printReceipt = useCallback(async (binaryPayload: Uint8Array) => {
    setIsPrinting(true);
    setLastError(null);

    return new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(agentSocketUrl);
      socket.binaryType = 'arraybuffer';

      socket.onopen = () => {
        socket.send(binaryPayload);
        socket.close();
        setIsPrinting(false);
        resolve();
      };

      socket.onerror = (err) => {
        setIsPrinting(false);
        setLastError('Failed to connect to local printing agent.');
        reject(err);
      };
    });
  }, [agentSocketUrl]);

  return { printReceipt, isPrinting, lastError };
}
```

### Usage in React View:
```tsx
import React from 'react';
import { useThermalPrinter } from './useThermalPrinter';

export function POSCheckoutButton({ receiptBytes }: { receiptBytes: Uint8Array }) {
  const { printReceipt, isPrinting, lastError } = useThermalPrinter();

  return (
    <div>
      <button onClick={() => printReceipt(receiptBytes)} disabled={isPrinting}>
        {isPrinting ? 'Transmitting to Hardware...' : 'Finalize & Print'}
      </button>
      {lastError && <span className="text-red-500">{lastError}</span>}
    </div>
  );
}
```

---

## 2. Vue 3 Composition API Composable

```typescript
import { ref } from 'vue';

export function useThermalReceipt(endpoint = 'ws://localhost:18570') {
  const isPrinting = ref(false);
  const printError = ref<string | null>(null);

  async function dispatchPrint(bytes: Uint8Array) {
    isPrinting.value = true;
    printError.value = null;

    try {
      const ws = new WebSocket(endpoint);
      await new Promise((resolve, reject) => {
        ws.onopen = () => {
          ws.send(bytes);
          ws.close();
          resolve(true);
        };
        ws.onerror = reject;
      });
    } catch (err: any) {
      printError.value = 'Hardware dispatch failed.';
    } finally {
      isPrinting.value = false;
    }
  }

  return { dispatchPrint, isPrinting, printError };
}
```

---

## 3. Frequently Asked Questions (FAQ)

### How do custom hooks guard against rapid double-clicking by cashiers?
**By tying button attributes to reactive state (`disabled={isPrinting}`).** The button remains disabled until the underlying WebSocket frame or BLE write acknowledges completion.

### Can these hooks be swapped to support WebUSB or Web Bluetooth?
**Yes. By abstracting the transport interface, the hook simply calls `transport.send(payload)`.** Whether the transport dispatches over WebSockets, Web Bluetooth GATT, or WebUSB bulk endpoints, the React and Vue presentation layers remain identical.

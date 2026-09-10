---
title: "Transmitting ESC/POS Byte Arrays to Bluetooth GATT Characteristics"
description: "Master Bluetooth Low Energy GATT architecture. Resolve printer write characteristics, balance writeValueWithResponse vs writeValueWithoutResponse, and stream binary data."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: sending-escpos-byte-arrays-bluetooth-gatt-characteristic
---

In Bluetooth Low Energy (BLE) peripheral communications, all data input and output is channeled through the **GATT (Generic Attribute Profile)** architecture. When interfacing with a thermal printer, streaming ESC/POS commands requires discovering the printer's **Writable Characteristic** and dispatching binary byte payloads (`Uint8Array` / `ArrayBuffer`).

In this guide, we break down GATT tree traversal, evaluate throughput tradeoffs between write methods, and provide an asynchronous JavaScript streaming implementation.

---

## 1. GATT Tree Traversal: Device -> Server -> Service -> Characteristic

BLE streaming follows a nested object pipeline:

```
[ Bluetooth Device: "Mpt-II" ]
          │
          ▼ .gatt.connect()
[ Remote GATT Server ]
          │
          ▼ .getPrimaryService(serviceUuid)
[ Primary Communication Service ]
          │
          ▼ .getCharacteristic(characteristicUuid)
[ Writable Target Characteristic ]
          │
          ▼ .writeValue(Uint8Array)
[ Thermal Printhead Motor ]
```

---

## 2. `writeValueWithResponse` vs. `writeValueWithoutResponse`

The W3C Web Bluetooth API provides two distinct methods for committing byte buffers:

| Method | Execution Mechanics | Latency | Delivery Guarantee |
|---|---|---|---|
| **`writeValueWithResponse`** | Waits for hardware link ACK confirmation | High (~30–50 ms/packet) | 100% Reliable (No dropped packets) |
| **`writeValueWithoutResponse`** | Streams packets unacknowledged | Ultra Low (~5–10 ms/packet) | Risk of buffer drops if unthrottled |

> 💡 **Best Practice:** Check `characteristic.properties.writeWithoutResponse`. If supported, prefer unacknowledged writes throttled with a 10–12 ms inter-packet delay to achieve optimal print throughput without overrunning hardware buffers.

---

## 3. Asynchronous JavaScript Transmission Function

```javascript
export async function streamBytesToGatt(characteristic, bytePayload) {
  const supportsFastWrite = characteristic.properties.writeWithoutResponse;
  const CHUNK_SIZE = 20;

  for (let i = 0; i < bytePayload.length; i += CHUNK_SIZE) {
    const slice = bytePayload.slice(i, i + CHUNK_SIZE);
    
    if (supportsFastWrite) {
      await characteristic.writeValueWithoutResponse(slice);
    } else {
      await characteristic.writeValueWithResponse(slice);
    }

    // Delay buffer to allow physical motor stepping and buffer clearance
    await new Promise(resolve => setTimeout(resolve, 12));
  }
}
```

---

## 4. Frequently Asked Questions (FAQ)

### What causes `DOMException: GATT operation already in progress`?
**This error is thrown when a new `writeValue` operation is invoked before the previous write Promise resolves.** Always sequentialize BLE transmissions using strict `await` chaining, and implement an in-memory queue to prevent overlapping concurrent write calls.

### How do I resolve the correct write characteristic dynamically?
**Query all primary services with `await server.getPrimaryServices()`, then iterate over their characteristics.** Look for the first characteristic where `char.properties.write === true` or `char.properties.writeWithoutResponse === true`; on 99% of BLE receipt printers, this characteristic is the raw ESC/POS endpoint.

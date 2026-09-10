---
title: "Printing QR Codes and EAN-13/Code 128 Barcodes via ESC/POS"
description: "Generate crisp 2D QR codes and 1D Code 128 barcodes natively on thermal receipt printers using GS ( k functions, module scaling, and error correction."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: esc-pos-qr-code-and-barcode-printing
---

In modern receipt engineering, symbologies play a pivotal role: **2D QR Codes** direct patrons to digital invoices, Wi-Fi onboarding, and loyalty surveys, while **1D Barcodes (Code 128 / EAN-13)** accelerate return processing and fulfillment verification.

Web applications can render barcodes either as pre-rasterized bitmap images or by leveraging the printer's **Native Onboard Hardware Barcode Engine (`GS ( k` & `GS k`)**. Using the internal engine slashes payload sizes by over 95%, speeds up printing, and ensures vector-crisp lines for laser scanners.

In this guide, we break down native 2D QR code generation and 1D Code 128 command structures.

---

## 1. Native 2D QR Code Generation: The Four-Stage `GS ( k` Protocol

In the Epson ESC/POS specification, rendering a native QR code requires four sequential operations dispatched to the printer's symbol buffer:

```
[ Stage 1: Select Model ] ──► [ Stage 2: Module Size ] ──► [ Stage 3: Load Data ] ──► [ Stage 4: Print Symbol ]
(Model 2 / Enhanced)          (3-6 Dots Per Module)        (URL or String Payload)       (Commit to Paper)
```

### Complete TypeScript Implementation:
```typescript
export function generateNativeQrEscPos(payloadText: string, moduleScale = 6): Uint8Array {
  const bytes: number[] = [];
  const textBytes = new TextEncoder().encode(payloadText);
  const dataLen = textBytes.length + 3;

  const pL = dataLen % 256;
  const pH = Math.floor(dataLen / 256);

  // 1. Set Model (fn=65): Model 2 (standard QR)
  bytes.push(0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);

  // 2. Set Module Size (fn=67): 1 to 16 dots per module (e.g. 6)
  bytes.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, moduleScale);

  // 3. Set Error Correction Level (fn=69): Level M (15%) -> 0x31
  // Options: L: 0x30 (7%), M: 0x31 (15%), Q: 0x32 (25%), H: 0x33 (30%)
  bytes.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31);

  // 4. Store Symbol Data in Memory Buffer (fn=80)
  bytes.push(0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30);
  textBytes.forEach(b => bytes.push(b));

  // 5. Print Symbol from Memory Buffer (fn=81)
  bytes.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);

  return new Uint8Array(bytes);
}
```

---

## 2. Native 1D Barcode Printing: Code 128 (`GS k`)

For parcel tracking, serial numbers, or loyalty card lookups, Code 128 is the industry standard:

```javascript
export function generateCode128EscPos(barcodeString, heightDots = 80) {
  const bytes = [];
  const textBytes = new TextEncoder().encode(barcodeString);

  // 1. Set Barcode Height in dots (GS h n)
  bytes.push(0x1D, 0x68, heightDots);

  // 2. Set Narrow Bar Width (GS w n -> 2 or 3 dots)
  bytes.push(0x1D, 0x77, 0x02);

  // 3. Human-Readable Interpretation (HRI) position (GS H n -> 2: Below barcode)
  bytes.push(0x1D, 0x48, 0x02);

  // 4. Print Code 128 (GS k 73 len subsetB payload)
  // Subset B marker ({B -> 0x7B 0x42)
  const payloadLen = textBytes.length + 2;
  bytes.push(0x1D, 0x6B, 73, payloadLen, 0x7B, 0x42);
  textBytes.forEach(b => bytes.push(b));

  return new Uint8Array(bytes);
}
```

---

## 3. Frequently Asked Questions (FAQ)

### Why is my printed QR code difficult for smartphones to scan?
**Two common factors cause scan failures: insufficient module size and lack of a quiet zone.** Ensure the QR code has at least 4 module widths of white space on all four sides. If your URL is very long, use a URL shortener to reduce symbol density, and increase the module scaling factor to 6 or 8.

### How do I center a QR code on an 80mm receipt?
**Issue the alignment command `0x1B 0x61 0x01` (ESC a 1 - Center) immediately before dispatching the QR code command sequence.** Restore left alignment afterwards with `0x1B 0x61 0x00` (ESC a 0).

### What should I do if a budget printer ignores the `GS ( k` QR command?
**Certain older or ultra-low-cost POS microcontrollers lack firmware-level 2D QR decoders.** In these environments, generate the QR code as a 1-bit monochrome bitmap in JavaScript using a lightweight library (`qrcode`), then output it using the universal `GS v 0` raster bit image command.

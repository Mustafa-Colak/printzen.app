---
title: "ESC/POS Command Language & Thermal Receipt Printer Programming Guide"
description: "Complete guide to ESC/POS standards, hex control codes, auto-cutter commands, cash drawer kick, QR code printing, and character encoding for web and desktop apps."
printerClass: desktop
brand: "Epson / Generic ESC/POS"
publishDate: 2026-09-10
translationKey: esc-pos-command-language-programming
---

Over 95% of thermal receipt printers across retail, restaurants, logistics, and POS hardware rely on **ESC/POS (Epson Standard Code for Point of Sale)** as their core binary protocol. When developing modern web-based POS software, cloud kitchen systems, or mobile field applications, bypassing bloated OS print dialogs (`window.print()` / Ctrl+P) and streaming raw bytes directly to the thermal head requires mastering ESC/POS.

This engineering guide walks through the fundamental command set, auto-cutter protocols, cash drawer kicks, 2D QR code rendering, and custom character page configuration with clean JavaScript/TypeScript implementations.

---

## 1. How the ESC/POS Architecture Works

ESC/POS is a stream-based binary protocol. The data sent to the printer consists of two primary streams:

1. **Printable Content Bytes:** ASCII or code-page-mapped characters representing text, numbers, and receipt lines (e.g., `Order #142`).
2. **Control Sequences:** Non-printable Escape sequences modifying the hardware state, starting with dedicated control bytes:
   - `ESC` (`0x1B` / `27`): Text formatting, alignment, line pitch, and font selection.
   - `GS` (`0x1D` / `29`): Advanced functions including barcodes, 2D QR codes, graphic bit arrays, and cutter triggers.
   - `FS` (`0x1C` / `28`): Two-byte / CJK international character set controls.
   - `LF` (`0x0A` / `10`): Line Feed — commits the internal buffer and advances the roll paper by one line.

> 💡 **Core Principle:** Thermal printers store commands in their volatile line buffer until an explicit Line Feed (`0x0A` - LF) is received. Always append LF to commit rows to paper.

---

## 2. Essential ESC/POS Command Reference

| Function | Hex Sequence | Decimal Values | Technical Purpose |
|---|---|---|---|
| **Initialize Printer** | `1B 40` | `27 64` | `ESC @` — Clears the buffer and resets hardware settings to factory defaults. |
| **Set Alignment** | `1B 61 n` | `27 97 n` | `ESC a n` — `n=0`: Left, `n=1`: Center, `n=2`: Right. |
| **Character Size** | `1D 21 n` | `29 33 n` | `GS ! n` — Multiplies width and height (e.g., `0x11` for 2x double height/width). |
| **Bold Text** | `1B 45 n` | `27 69 n` | `ESC E n` — `n=1`: Enables emphasized bold text, `n=0`: Disables. |
| **Underline Mode** | `1B 2D n` | `27 45 n` | `ESC - n` — `n=1`: 1-dot underline, `n=2`: 2-dot thick underline, `n=0`: Off. |
| **Invert (Negative)** | `1D 42 n` | `29 66 n` | `GS B n` — Reverses white on black background. |
| **Partial Paper Cut** | `1D 56 42 n` | `29 86 66 n` | `GS V 66 n` — Feeds paper by n dots and performs a partial cut. |
| **Kick Cash Drawer** | `1B 70 00 19 FA` | `27 112 0 25 250` | `ESC p m t1 t2` — Sends a 50ms 24V pulse to the drawer solenoid on pin 2. |

---

## 3. Paper Cutting & Cash Drawer Solenoid Control

### 3.1. Avoiding the "Guillotine Paper Jam" Trap
The thermal printing element is physically situated **15 to 22 mm behind the mechanical knife**. Issuing a cut command (`1D 56 00`) immediately after text causes the final lines to be sliced or jammed inside the housing.

Always feed at least 3 to 4 blank lines before triggering a partial cut:
```javascript
// Feed 4 lines and partial cut (leaves 1 connection dot so receipt doesn't fall)
const CUT_COMMAND = new Uint8Array([0x1B, 0x64, 0x04, 0x1D, 0x56, 0x01]);
```

### 3.2. Triggering the Cash Drawer via RJ11 / RJ12
The modular phone-style jack on the back of receipt printers connects to a 24V solenoid inside the cash drawer. Triggering this requires an electrical pulse:

```javascript
// Send pulse to Pin 2 for 50ms
const OPEN_DRAWER = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
```

---

## 4. Printing 2D QR Codes via ESC/POS

Modern ESC/POS standardizes QR code generation into sequential function codes:

1. **Select Model (GS ( k ... 41):** Model 2 is universally recommended.
2. **Module Size (GS ( k ... 43):** Defines the dot width per module (typically 3 or 4 dots).
3. **Error Correction (GS ( k ... 44):** L (7%), M (15%), Q (25%), H (30%). Medium (M) is best for wrinkled receipt paper.
4. **Store Data & Print (GS ( k ... 42 and 45):** Buffers the payload and executes the print head.

```javascript
function buildQrCodeBytes(text) {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  const len = textBytes.length + 3;
  const pL = len % 256;
  const pH = Math.floor(len / 256);

  return new Uint8Array([
    // Model 2
    0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00,
    // Size: 4 dots
    0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x04,
    // Error Correction: M (15%)
    0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31,
    // Store data
    0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30, ...textBytes,
    // Print QR
    0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30
  ]);
}
```

---

## 5. End-to-End TypeScript ESC/POS Builder

```typescript
export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  init() {
    this.buffer.push(0x1B, 0x40); // Reset
    return this;
  }

  align(alignment: 'left' | 'center' | 'right') {
    const val = alignment === 'center' ? 1 : alignment === 'right' ? 2 : 0;
    this.buffer.push(0x1B, 0x61, val);
    return this;
  }

  bold(enable: boolean) {
    this.buffer.push(0x1B, 0x45, enable ? 1 : 0);
    return this;
  }

  text(str: string) {
    for (let i = 0; i < str.length; i++) {
      this.buffer.push(str.charCodeAt(i));
    }
    return this;
  }

  line(str: string = '') {
    this.text(str);
    this.buffer.push(0x0A); // LF
    return this;
  }

  twoColumnRow(left: string, right: string, totalWidth: number = 42) {
    const spaces = Math.max(1, totalWidth - left.length - right.length);
    this.line(left + ' '.repeat(spaces) + right);
    return this;
  }

  cut() {
    this.buffer.push(0x1B, 0x64, 0x04, 0x1D, 0x56, 0x01);
    return this;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
```

---

## 6. Frequently Asked Questions (FAQ)

### Are ESC/POS commands compatible across all thermal printer brands?
**Yes, ESC/POS is the universal industry standard for thermal receipt hardware.** Brands including Epson, Xprinter, Rongta, Bixolon, Sewoo, and Star Micronics (when operating in ESC/POS mode) support the core command set (text formatting, line feeds, paper cutting, and cash drawer kicks) with identical byte sequences.

### What is the standard column character width for 58 mm and 80 mm printers?
**Standard 80 mm rolls accommodate 42 to 48 characters per line, while 58 mm printers fit 32 characters.** For clean two-column receipt layouts (e.g., product title left-aligned, unit price right-aligned), targeting a 42-character width for 80 mm ensures zero line-wrapping across diverse manufacturers.

### Can ESC/POS commands be sent directly from Google Chrome without installing drivers?
**Yes, modern web browsers support direct raw byte streaming via the Web Bluetooth and WebUSB APIs.** By requesting device access in JavaScript and writing Uint8Array buffers directly to the printer's GATT communication characteristic or USB bulk endpoint, web POS applications can print completely driverless.

### Why is the printer cutting off the last line of the receipt?
**Thermal printer knives are positioned 15 to 20 mm above the printing head.** If a cut command is sent immediately without preceding Line Feed (`0x0A`) characters, the final line remains under the blade. Always append at least 3 to 4 empty lines before triggering a partial cut command.

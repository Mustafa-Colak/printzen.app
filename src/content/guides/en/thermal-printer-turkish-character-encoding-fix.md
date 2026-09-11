---
title: "Fixing Turkish Character Encoding Issues on ESC/POS Thermal Printers"
description: "Resolve corrupted characters, inverted question marks, and distorted glyphs (ğ, ı, ş, ç, ö, ü) on thermal receipt printers using CP857, Windows-1254, and UTF-8."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: thermal-printer-turkish-character-encoding-fix
---

For software engineers and POS system integrators working with thermal receipt printers, few bugs are more notorious than garbled non-ASCII characters: **inverted question marks "¿", misplaced mathematical glyphs, or blank boxes appearing in place of language-specific letters like "ğ", "ı", or "ş"**.

This is not a hardware malfunction, baud rate mismatch, or damaged interface cable. It stems from a byte-level encoding discrepancy between modern web platforms—which communicate natively in **UTF-8 (multibyte Unicode)**—and thermal printer firmware processors, which still rely on **8-bit regional Extended ASCII Code Pages**.

In this technical guide, we dissect ESC/POS code page selection mechanisms, CP857 (IBM DOS) and Windows-1254 (CP1254) lookup tables, byte transformation in Node.js/browser environments, and deterministic fallback transliteration strategies.

---

## 1. Root Cause: Why Do Characters Get Corrupted?

Modern cloud stacks, POS web applications, and database engines serialize strings in **UTF-8**. In UTF-8, standard 7-bit ASCII characters (A-Z, 0-9) occupy a single byte ($0\text{ to }127$). However, extended Latin and international characters require **two full bytes**:

- Letter `ş` in UTF-8: `0xC5 0x9F` (2 bytes)
- Letter `ğ` in UTF-8: `0xC4 0x9F` (2 bytes)
- Letter `ı` (dotless i) in UTF-8: `0xC4 0xB1` (2 bytes)

Legacy thermal printer microcontrollers evaluate stream buffers sequentially in 8-bit increments ($0\text{ to }255$). When raw UTF-8 bytes for `ş` (`0xC5 0x9F`) reach the thermal printhead, the firmware does not interpret them as a single character; it renders **two discrete, unintended symbols** back-to-back, such as `ÅŸ`.

---

## 2. ESC/POS Code Page Architecture

In ESC/POS protocol, bytes ranging from `128` to `255` are mapped to regional alphabets through the **Select Character Code Table** instruction:

$$\text{ESC } t \text{ } n \quad \longrightarrow \quad \text{Hex: } \texttt{0x1B 0x74 [n]}$$

Where `$n$` is the hardware-dependent code page index stored in the printer's onboard character ROM.

### 2.1. CP857 (IBM DOS Turkish Standard)
Across European and Middle Eastern markets, Epson, Bixolon, Star Micronics, and Xprinter devices embed **CP857** as their primary regional character set.

- Epson ESC/POS devices: typically `ESC t 18` (`0x1B 0x74 0x12`) or `ESC t 50`
- Generic Xprinter / POS-58 models: frequently `ESC t 18`, `ESC t 38`, or `ESC t 70`

#### CP857 Character Mapping Matrix:
| Character | Unicode Code Point | CP857 Hex Value | Decimal Equivalent |
|---|---|---|---|
| **ç** | `U+00E7` | `0x87` | 135 |
| **Ç** | `U+00C7` | `0x80` | 128 |
| **ğ** | `U+011F` | `0xA6` | 166 |
| **Ğ** | `U+011E` | `0xA7` | 167 |
| **ı** (dotless) | `U+0131` | `0x8D` | 141 |
| **İ** (dotted capital) | `U+0130` | `0x98` | 152 |
| **ö** | `U+00F6` | `0x94` | 148 |
| **Ö** | `U+00D6` | `0x99` | 153 |
| **ş** | `U+015F` | `0x9F` | 159 |
| **Ş** | `U+015E` | `0x9E` | 158 |
| **ü** | `U+00FC` | `0x81` | 129 |
| **Ü** | `U+00DC` | `0x9A` | 154 |

### 2.2. Windows-1254 (CP1254 / ISO-8859-9)
Windows print spoolers and certain newer thermal controllers adopt Windows-1254 instead of DOS CP857:

| Character | Windows-1254 Hex | CP857 Hex | Comparison |
|---|---|---|---|
| **ğ / Ğ** | `0xF0` / `0xD0` | `0xA6` / `0xA7` | Non-overlapping byte definitions |
| **ı / İ** | `0xFD` / `0xDD` | `0x8D` / `0x98` | Incompatible positions |
| **ş / Ş** | `0xFE` / `0xDE` | `0x9F` / `0x9E` | Incompatible positions |

> ⚠️ **Common Trap:** Sending Windows-1254 encoded bytes to a thermal printer configured for CP857 results in corrupted symbol rendering. The hardware code page switch and the software encoding pipeline must synchronize exactly.

---

## 3. Discovering Supported Code Pages: The Self-Test Receipt

Never guess the code page index value. Every commercial ESC/POS printer provides an internal diagnostics report detailing its active ROM tables:

1. Turn off the printer's power switch.
2. Press and hold down the **FEED** button.
3. While continuing to depress FEED, toggle the power switch on.
4. Release the FEED button when the motor starts printing.
5. Locate the **"Character Code Table"** or **"Page List"** section on the printed receipt:
   - `Page 18: Turkish (CP857)`
   - `Page 50: CP857`
   - `Page 70: Windows-1254`

The index listed here is your exact parameter `$n$` for the `ESC t [n]` command.

---

## 4. Software Implementation: Node.js & Pure JavaScript

### 4.1. Server-Side Node.js Byte Conversion with `iconv-lite`

In Node.js backend services, convert incoming UTF-8 strings into binary CP857 buffers before transmitting over TCP sockets or serial ports:

```typescript
import iconv from 'iconv-lite';

export function createFormattedReceipt(): Buffer {
  const chunks: Buffer[] = [];

  // 1. Initialize Printer (ESC @)
  chunks.push(Buffer.from([0x1B, 0x40]));

  // 2. Select CP857 Code Page (ESC t 18)
  chunks.push(Buffer.from([0x1B, 0x74, 18]));

  // 3. Receipt Payload String
  const receiptBody = 
    "=== PRINTZEN DELUXE BISTRO ===\n" +
    "Date: 10.09.2026 14:35\n" +
    "Table: Garden 04\n" +
    "--------------------------------\n" +
    "1x Kaşarlı Pide          $12.50\n" +
    "1x Acılı Şalgam Suyu      $3.00\n" +
    "1x Fıstıklı Künefe        $8.50\n" +
    "--------------------------------\n" +
    "TOTAL:                   $24.00\n" +
    "Thank You For Dining With Us!\n\n\n";

  // 4. Encode directly into raw CP857 single-byte array
  const encodedPayload = iconv.encode(receiptBody, 'cp857');
  chunks.push(encodedPayload);

  // 5. Full Paper Cut Command (GS V 66 0)
  chunks.push(Buffer.from([0x1D, 0x56, 66, 0]));

  return Buffer.concat(chunks);
}
```

### 4.2. Browser-Side / Web Bluetooth Direct Byte Mapper

In lightweight frontend applications communicating directly over Web Bluetooth or WebUSB without external bundling libraries:

```javascript
function encodeCP857(str) {
  const map = {
    'ç': 0x87, 'Ç': 0x80,
    'ğ': 0xA6, 'Ğ': 0xA7,
    'ı': 0x8D, 'I': 0x49,
    'i': 0x69, 'İ': 0x98,
    'ö': 0x94, 'Ö': 0x99,
    'ş': 0x9F, 'Ş': 0x9E,
    'ü': 0x81, 'Ü': 0x9A
  };

  const buffer = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (map[char] !== undefined) {
      buffer[i] = map[char];
    } else {
      const code = str.charCodeAt(i);
      buffer[i] = code < 128 ? code : 0x3F; // Fallback to '?' for unmapped
    }
  }
  return buffer;
}
```

---

## 5. Hardware Fallback: Deterministic Transliteration

Low-cost portable thermal printers (commonly found in mobile van sales or couriers) frequently lack regional character sets entirely in their onboard ROM. In such environments, sending code page directives has zero effect.

The most resilient production strategy is string **transliteration**—converting accented letters into their closest single-byte ASCII counterparts prior to transmission:

```typescript
export function transliterateAccents(input: string): string {
  return input
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U');
}
```

Printing `"Kasarli Pide"` is clean, legible, and immediately understood by kitchen staff and patrons, whereas printing `"K¿¿arl¿ Pide"` degrades customer trust and causes order fulfillment confusion.

---

## 6. Frequently Asked Questions (FAQ)

### Why does my thermal printer output question marks (?) instead of accented characters?
**A question mark appears when the byte value received by the printer does not map to any defined glyph in the currently active character table.** To fix this, issue the `0x1B 0x74 [n]` command to switch the printer into its designated regional code page (such as CP857 for Turkish or CP1252 for Western Europe) and encode outgoing strings into that matching byte format.

### I sent the ESC/POS code page command, but the characters are still broken. Why?
**The code page index parameter varies by manufacturer and model.** While Epson uses index `18` or `50` for CP857, Xprinter or Star Micronics printers might designate page `38` or `70`. Run a hardware Self-Test by holding down the FEED button during power-up to read the exact index assigned to your regional character table.

### Can thermal printers natively process UTF-8?
**Only a small minority of high-end enterprise models (such as Epson TM-T88VI) feature true native UTF-8 rasterizers.** Over 90% of thermal receipt printers in active commercial operation require single-byte 8-bit encoded streams. Transcoding text into CP857 or Windows-1254 is the universal standard for thermal reliability.

### How does Printzen handle regional character encoding across diverse hardware?
**Printzen's cloud and client drivers automatically profile connected printer models and determine their firmware capabilities.** It dynamically applies the correct hardware code page switches and byte transformations; if a printer lacks regional ROM sets, Printzen seamlessly invokes intelligent transliteration so receipts never print corrupted characters.

## Device-Specific Guides for This Topic



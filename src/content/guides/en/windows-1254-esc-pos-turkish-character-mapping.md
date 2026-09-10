---
title: "Windows-1254 (Turkish) Character Mapping and ESC/POS Configuration"
description: "Configure Windows-1254 (CP1254) on thermal receipt printers. Compare byte mappings against legacy CP857 and eliminate symbol corruption on Windows terminals."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: windows-1254-esc-pos-turkish-character-mapping
---

On Windows-based POS terminals and desktop systems utilizing the native Windows Print Spooler, regional European character sets typically standardize on **Windows-1254 (CP1254)** rather than legacy DOS code pages.

Understanding the byte-level divergence between DOS CP857 and Windows-1254 is essential when supporting mixed hardware environments.

---

## 1. Windows-1254 vs. CP857: Byte Discrepancies

Assuming that all regional character tables share byte assignments is the primary cause of print bugs:

| Character | Unicode Code Point | Windows-1254 Hex | CP857 Hex | Mapping Collision |
|---|---|---|---|---|
| **ğ** (lowercase g-breve) | `U+011F` | **`0xF0`** | **`0xA6`** | ❌ **Non-overlapping address** |
| **Ğ** (uppercase G-breve) | `U+011E` | **`0xD0`** | **`0xA7`** | ❌ **Non-overlapping address** |
| **ı** (lowercase dotless i) | `U+0131` | **`0xFD`** | **`0x8D`** | ❌ **Non-overlapping address** |
| **İ** (uppercase dotted I) | `U+0130` | **`0xDD`** | **`0x98`** | ❌ **Non-overlapping address** |
| **ş** (lowercase s-cedilla) | `U+015F` | **`0xFE`** | **`0x9F`** | ❌ **Non-overlapping address** |
| **Ş** (uppercase S-cedilla) | `U+015E` | **`0xDE`** | **`0x9E`** | ❌ **Non-overlapping address** |

> ⚠️ **Result:** Transmitting CP857 bytes to a thermal printer configured for Windows-1254 prints mathematical symbols or Spanish accented vowels instead of the intended regional letters.

---

## 2. ESC/POS Windows-1254 Selection Directive

On ESC/POS printers with Windows-1254 in firmware ROM, switch tables using:

$$\text{ESC } t \text{ } 70 \quad \longrightarrow \quad \texttt{0x1B 0x74 0x46}$$

### Pure JavaScript Windows-1254 Byte Encoder:
```javascript
export function encodeWindows1254(text) {
  const map = {
    'ğ': 0xF0, 'Ğ': 0xD0,
    'ı': 0xFD, 'İ': 0xDD,
    'ş': 0xFE, 'Ş': 0xDE,
    'ç': 0xE7, 'Ç': 0xC7,
    'ö': 0xF6, 'Ö': 0xD6,
    'ü': 0xFC, 'Ü': 0xDC
  };

  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    bytes[i] = map[ch] !== undefined ? map[ch] : (ch.charCodeAt(0) < 128 ? ch.charCodeAt(0) : 0x3F);
  }
  return bytes;
}
```

---

## 3. Frequently Asked Questions (FAQ)

### Why does printing through the Windows Generic/Text Only driver corrupt characters?
**The Generic / Text Only Windows driver defaults to standard 7-bit US-ASCII.** Open Windows Printer Properties > Device Settings, locate "Code Page Setting", and explicitly select **Windows-1254 (Turkish)** or **DOS 857** to enable the upper 128-byte extended range.

### How should software manage installations with a mix of CP857 and Windows-1254 printers?
**The Printzen SDK supports device hardware profiles.** Each target printer is tagged with its active code page (`CP857` or `WINDOWS-1254`), and outgoing text payloads are automatically serialized into the appropriate byte table at runtime.

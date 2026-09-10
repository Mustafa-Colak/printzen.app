---
title: "CP857 Code Page Setup and Character Mapping for Thermal POS Printers"
description: "Configure the CP857 (IBM DOS Turkish) code page on Epson, Bixolon, and Xprinter POS printers. Includes full hexadecimal lookup table and byte conversion code."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: cp857-code-page-thermal-printers-table-setup
---

Across POS terminals in regional European and Mediterranean markets, non-ASCII regional character support relies on the **CP857 (IBM DOS Turkish)** code page. Because modern web stacks communicate strictly in multi-byte UTF-8, bridging this encoding mismatch is required to prevent corrupted characters on receipts.

In this guide, we provide the complete CP857 hexadecimal mapping matrix, ESC/POS hardware selection directives, and standalone JavaScript byte conversion functions.

---

## 1. Selecting the CP857 Code Page (`ESC t`)

In the ESC/POS specification, hardware table selection is controlled via `ESC t`:

$$\text{ESC } t \text{ } 18 \quad \longrightarrow \quad \texttt{0x1B 0x74 0x12}$$

> 💡 **Note:** Depending on firmware, the page index parameter is typically `18` (`0x12`) or `50` (`0x32`). Always verify the exact index by running a hardware Self-Test print (hold FEED while turning on power).

---

## 2. Complete CP857 Hexadecimal Lookup Table

| Character | Unicode Code Point | CP857 Hex Value | Decimal Equivalent |
|---|---|---|---|
| **ç** (lowercase c-cedilla) | `U+00E7` | `0x87` | 135 |
| **Ç** (uppercase C-cedilla) | `U+00C7` | `0x80` | 128 |
| **ğ** (lowercase g-breve) | `U+011F` | `0xA6` | 166 |
| **Ğ** (uppercase G-breve) | `U+011E` | `0xA7` | 167 |
| **ı** (lowercase dotless i) | `U+0131` | `0x8D` | 141 |
| **İ** (uppercase dotted I) | `U+0130` | `0x98` | 152 |
| **ö** (lowercase o-umlaut) | `U+00F6` | `0x94` | 148 |
| **Ö** (uppercase O-umlaut) | `U+00D6` | `0x99` | 153 |
| **ş** (lowercase s-cedilla) | `U+015F` | `0x9F` | 159 |
| **Ş** (uppercase S-cedilla) | `U+015E` | `0x9E` | 158 |
| **ü** (lowercase u-umlaut) | `U+00FC` | `0x81` | 129 |
| **Ü** (uppercase U-umlaut) | `U+00DC` | `0x9A` | 154 |

---

## 3. Pure JavaScript CP857 Encoder

Convert UTF-8 string data into single-byte CP857 arrays without external packaging dependencies:

```javascript
export function encodeToCP857(inputString) {
  const table = {
    'ç': 0x87, 'Ç': 0x80,
    'ğ': 0xA6, 'Ğ': 0xA7,
    'ı': 0x8D, 'İ': 0x98,
    'ö': 0x94, 'Ö': 0x99,
    'ş': 0x9F, 'Ş': 0x9E,
    'ü': 0x81, 'Ü': 0x9A
  };

  const output = new Uint8Array(inputString.length);
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    if (table[char] !== undefined) {
      output[i] = table[char];
    } else {
      const code = inputString.charCodeAt(i);
      output[i] = code < 128 ? code : 0x3F; // Fallback to '?'
    }
  }
  return output;
}
```

---

## 4. Frequently Asked Questions (FAQ)

### I applied CP857, but characters like "ş" and "ğ" still corrupt while "ç" prints fine?
**This indicates your printer is active in Windows-1254 or ISO-8859-9 rather than CP857.** Characters like "ç" and "ü" share identical byte values across multiple European tables, whereas "ş" and "ğ" reside at different addresses. Switch your active table to Windows-1254 (`ESC t 70` on certain models) or adjust your byte encoder.

### Can CP857 render Cyrillic or Arabic text?
**No, CP857 is an 8-bit regional character table limited to Latin-based alphabets.** To print mixed scripts on a single receipt, you must dynamically toggle code pages between lines or deploy thermal printers equipped with native TrueType or UTF-8 font renderers.

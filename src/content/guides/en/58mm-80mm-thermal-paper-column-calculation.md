---
title: "Calculating Character Columns for 58mm vs. 80mm Thermal Paper"
description: "Prevent awkward line wrapping and broken columns on thermal receipts. Master Font A vs. Font B dot geometries, 32 vs. 48 column budgets, and tabular spacing."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: 58mm-80mm-thermal-paper-column-calculation
---

When designing text-based sales receipts for thermal printers, the most frequent layout failure is an item line or currency value exceeding line boundaries and **wrapping onto the next line, breaking tabular alignment**:

```
1x Double Wagyu Cheeseburger    $18.5
0
```

This distortion occurs when software assumes arbitrary page boundaries without accounting for the printer's physical dot width and active font metrics: **Characters Per Line (CPL)**.

In this guide, we break down dot calculations for 58mm and 80mm rolls, internal font geometries, and deterministic two-column table alignment algorithms.

---

## 1. Paper Widths and Physical Dot Resolutions

Commercial thermal printheads operate at 203 DPI (Dots Per Inch), equivalent to 8 dots per linear millimeter:

| Roll Specification | Physical Paper Width | Printable Head Width | Total Horizontal Dots |
|---|---|---|---|
| **58 mm (Mobile / Handheld)** | 58 mm | 48 mm | **384 dots** |
| **80 mm (Desktop / POS)** | 80 mm | 72 mm | **576 dots** |

---

## 2. Font A vs. Font B: Column Budgets

ESC/POS firmware includes two standardized monospaced character sets in ROM:
- **Font A (Standard):** $12 \times 24$ dots. Legible, bold, and easy to read.
- **Font B (Compressed):** $9 \times 17$ dots. Smaller, compact font used to pack maximum information onto narrow media.

$$\text{Characters Per Line (CPL)} = \left\lfloor \frac{\text{Printable Head Dots}}{\text{Font Dot Width}} \right\rfloor$$

### Column Capacity Reference Table:
| Media Width | Active Font | Glyph Dot Size | Maximum Characters Per Line (CPL) |
|---|---|---|---|
| **58 mm (384 dots)** | **Font A (Default)** | $12 \times 24$ | **32 Characters** |
| **58 mm (384 dots)** | **Font B (Small)** | $9 \times 17$ | **42 Characters** |
| **80 mm (576 dots)** | **Font A (Default)** | $12 \times 24$ | **48 Characters** |
| **80 mm (576 dots)** | **Font B (Small)** | $9 \times 17$ | **64 Characters** |

---

## 3. Dynamic Two-Column Justification Algorithm (JavaScript)

To ensure prices snap firmly to the right margin while long item descriptions truncate gracefully without wrapping:

```javascript
export function justifyReceiptLine(itemTitle, priceStr, maxColumns = 48) {
  const priceLen = priceStr.length;
  const maxTitleLen = maxColumns - priceLen - 1; // Leave at least 1 separating space

  let safeTitle = itemTitle;
  if (itemTitle.length > maxTitleLen) {
    safeTitle = itemTitle.substring(0, maxTitleLen - 2) + '..';
  }

  const spaceCount = maxColumns - safeTitle.length - priceLen;
  const fillSpaces = ' '.repeat(Math.max(1, spaceCount));

  return safeTitle + fillSpaces + priceStr + '\n';
}

// 80mm Font A layout (48 Columns):
console.log(justifyReceiptLine('1x Double Truffle Pizza', '$24.50', 48));

// 58mm Font A layout (32 Columns):
console.log(justifyReceiptLine('1x Double Truffle Pizza', '$24.50', 32));
```

---

## 4. Frequently Asked Questions (FAQ)

### How do I switch between Font A and Font B in ESC/POS?
**Send the `ESC M` command followed by the font index byte.** To switch to compressed Font B ($9\times 17$ dots / 64 columns on 80mm), dispatch `0x1B 0x4D 0x01`. To return to standard Font A ($12\times 24$ dots / 48 columns), dispatch `0x1B 0x4D 0x00`.

### Why does 80mm paper leave unprinted white space on the outer margins?
**Thermal printer mechanisms require 3 to 4 mm of mechanical margin on each side to guide the roll past feed rollers without jamming.** Thus, out of an 80mm physical roll, exactly 72mm is actively heated by the printhead elements, resulting in a fixed 576-dot horizontal resolution.

### Can I use tab stops (`\t`) instead of calculating space counts?
**While ESC/POS supports horizontal tabs (`0x09`) with default 8-character intervals, tabs frequently misalign when mixed with variable-length currency numbers or font resizing.** Calculating exact character lengths and injecting space buffers (` `) guarantees pixel-perfect tabular columns on all printer brands.

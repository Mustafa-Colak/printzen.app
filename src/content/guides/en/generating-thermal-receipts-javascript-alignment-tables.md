---
title: "Generating Thermal Receipts in Pure JavaScript: Alignment, Rules, and Tabular Layouts"
description: "Build clean, professional ESC/POS receipts in browser and Node.js environments. Master centered headers, bold emphasis, two-column justification, and paper cutting."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: generating-thermal-receipts-javascript-alignment-tables
---

Relying on standard browser HTML/CSS rendering and `window.print()` for thermal receipts inevitably leads to blurry rasterized text, unpredictable margins, and failed paper cuts.

The industry standard approach is constructing lightweight, character-bounded **monospaced receipt streams directly in JavaScript** using native ESC/POS command sequences.

---

## 1. Core ESC/POS Typography Commands

| Action | ESC/POS Directive | Hex Sequence | Functional Description |
|---|---|---|---|
| **Initialize Hardware** | `ESC @` | `1B 40` | Resets margins, fonts, and internal parameters. |
| **Center Alignment** | `ESC a 1` | `1B 61 01` | Centers all subsequent lines. |
| **Left Alignment** | `ESC a 0` | `1B 61 00` | Restores default left justification. |
| **Bold Emphasis** | `ESC E 1` | `1B 45 01` | Enables heavy text weighting (`ESC E 0` turns off). |
| **Double Height/Width** | `GS ! 17` | `1D 21 11` | Emphasizes titles at double-scale. |
| **Partial Paper Cut** | `GS V 66 0` | `1D 56 42 00` | Feeds past blade and executes partial cut. |

---

## 2. Standalone JavaScript Receipt Generator

```javascript
export class ThermalReceiptBuilder {
  constructor(columnBudget = 48) {
    this.columns = columnBudget; // 48 for 80mm, 32 for 58mm
    this.buffer = [0x1B, 0x40]; // Initialize hardware
  }

  align(position = 'left') {
    const code = position === 'center' ? 1 : position === 'right' ? 2 : 0;
    this.buffer.push(0x1B, 0x61, code);
    return this;
  }

  bold(enable = true) {
    this.buffer.push(0x1B, 0x45, enable ? 1 : 0);
    return this;
  }

  text(stringPayload = '') {
    const bytes = new TextEncoder().encode(stringPayload + '\n');
    bytes.forEach(b => this.buffer.push(b));
    return this;
  }

  divider(character = '-') {
    return this.text(character.repeat(this.columns));
  }

  tableRow(leftText, rightText) {
    const spaces = Math.max(1, this.columns - leftText.length - rightText.length);
    return this.text(leftText + ' '.repeat(spaces) + rightText);
  }

  cut() {
    this.buffer.push(0x1B, 0x64, 0x03, 0x1D, 0x56, 0x42, 0x00);
    return this;
  }

  build() {
    return new Uint8Array(this.buffer);
  }
}
```

### Usage:
```javascript
const receipt = new ThermalReceiptBuilder(48);

receipt
  .align('center')
  .bold(true)
  .text('PRINTZEN ARTISAN ROASTERS')
  .bold(false)
  .text('Order #8492 - 15:30 PM')
  .divider('=')
  .align('left')
  .tableRow('1x Single Origin Cortado', '$4.50')
  .tableRow('1x Sourdough Croissant', '$5.25')
  .divider('-')
  .bold(true)
  .tableRow('TOTAL CHARGED', '$9.75')
  .bold(false)
  .align('center')
  .text('\nThank You For Dining With Us!\n')
  .cut();

const finalBytes = receipt.build();
```

---

## 3. Frequently Asked Questions (FAQ)

### How do I handle item descriptions that exceed the line column budget?
**Truncate or wrap the title before invoking `tableRow`.** Checking `if (leftText.length > maxBudget) leftText = leftText.slice(0, maxBudget - 2) + '..'` ensures right-aligned price figures remain snapped to the paper edge without dropping to the next line.

### How many characters fit across double-width mode on 80mm rolls?
**Double-width mode (`GS ! 16`) halves the character budget.** On standard 80mm rolls, the column budget decreases from 48 columns to 24 columns. Keep large header titles under 24 characters to prevent unwanted wrapping.

---
title: "Text Rotation and Block Alignment Rules in Zebra ZPL II"
description: "Master typography rotation (90°, 180°, 270°) using ^A font parameters, multi-line paragraph wrapping with ^FB, and precise coordinate alignment in ZPL II."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: zpl-text-rotation-and-coordinate-alignment
---

Logistics and pallet tags frequently require vertical warning text along margins ("FRAGILE", "THIS SIDE UP") or dynamic multi-line shipping address formatting. In ZPL II, text orientation and text wrapping require strict adherence to coordinate geometry.

In this guide, we break down font rotation directives (`^A`), paragraph wrapping blocks (`^FB`), and coordinate math.

---

## 1. Typography Rotation: The `^A` Directive

In ZPL II, orientation is governed by the second parameter of the font definition command:

$$\text{^A} f \text{ } o, \text{ } h, \text{ } w$$

- `$f$`: Font identifier (`0`: Internal scalable font).
- `$o$`: **Orientation Parameter**:
  - `N`: **Normal** (0° - Horizontal left-to-right).
  - `R`: **Rotated** (90° clockwise - Vertical downward).
  - `I`: **Inverted** (180° - Upside down).
  - `B`: **Bottom-Up** (270° clockwise - Vertical upward).
- `$h, w$`: Height and width in printhead dots.

```zpl
^XA
^PW800^LL400
^FX 90-degree vertical sidebar warning:
^FO720,50^A0R,30,30^FDFRAGILE - HANDLE WITH CARE^FS

^FX Standard horizontal header:
^FO50,50^A0N,36,36^FDShipment ID: #4812^FS
^XZ
```

> ⚠️ **Field Origin Anchor Warning:** The field origin `^FOx,y` remains the reference anchor point during rotation. When rotating 90° (`R`), text flows downwards from `(x, y)`; when rotating 270° (`B`), text flows upwards. Ensure coordinates accommodate the rotated length to avoid clipping past the label edge.

---

## 2. Multi-Line Text Wrapping: Field Block (`^FB`)

For customer addresses, item lists, and descriptions that must wrap cleanly inside a bounded width:

$$\text{^FB} a, \text{ } b, \text{ } c, \text{ } d, \text{ } e$$

- `$a$`: Maximum block width in dots.
- `$b$`: Maximum number of lines.
- `$c$`: Line spacing buffer (dots).
- `$d$`: Text justification:
  - `L`: Left-aligned.
  - `C`: Center-aligned.
  - `R`: Right-aligned.
  - `J`: Fully justified.
- `$e$`: Hanging indent for continuation lines.

### Example: Centered 500-Dot Address Block:
```zpl
^XA
^FO50,100^A0N,26,26
^FB500,4,5,C,0
^FD742 Evergreen Terrace, Springfield, OR 97477, United States of America^FS
^XZ
```

---

## 3. Frequently Asked Questions (FAQ)

### How do I center a text block across the entire width of a 4x6 label?
**If the total label width is 800 dots and your text block width is defined as 600 dots (`^FB600,...`), anchor the origin at `^FO100,y`.** The horizontal offset calculation $(800 - 600) / 2 = 100$ guarantees symmetrical margins on both sides of the centered text.

### How do I insert manual line breaks inside a `^FB` block?
**Use the `\&` delimiter sequence within your `^FD` string payload.** For example, `^FDLine One\&Line Two\&Line Three^FS` forces manual line breaks at each occurrence without waiting for auto-wrapping.

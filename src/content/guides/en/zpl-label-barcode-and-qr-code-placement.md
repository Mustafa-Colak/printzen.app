---
title: "Barcode and QR Code Placement in ZPL II: Mastering ^BC and ^BQ Commands"
description: "Engineer scannable Code 128 barcodes and 2D QR codes on Zebra thermal printers. Learn module widths (^BY), error correction levels, and quiet zone rules."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: zpl-label-barcode-and-qr-code-placement
---

On industrial shipping labels, inventory tags, and pallet manifests, barcodes represent the critical payload. Rather than sending pre-rendered raster graphics, generating barcodes natively via ZPL II ensures sharp, vector-grade lines that warehouse optical scanners read effortlessly across steep angles.

In this guide, we break down Code 128 configuration (`^BC`), 2D QR code matrices (`^BQ`), and module ratio controls (`^BY`).

---

## 1. Code 128 Linear Barcodes (`^BC`) and Module Ratios (`^BY`)

For logistics tracking numbers and inventory SKUs, Code 128 is the undisputed global standard. Barcode bar thickness and height are configured using two companion commands:

### 1.1. Module Width Configuration (`^BY`)
Defines the narrow bar width in printhead dots:
```zpl
^BYw,r,h
```
- `w`: Module width (1 to 10 dots). On 203 DPI printheads, `2` or `3` dots is optimal.
- `r`: Wide-to-narrow bar ratio (default: 2.5 to 3.0).
- `h`: Default bar height in dots.

### 1.2. The Code 128 Command (`^BC`)
```zpl
^BCo,h,f,g,e,m
```
- `o`: Orientation (`N`: Normal, `R`: Rotated 90°, `I`: Inverted 180°, `B`: 270°).
- `h`: Barcode height in dots (e.g. 120 dots).
- `f`: Print interpretation line (`Y`: Yes, `N`: No).
- `g`: Interpretation line location (`N`: Below, `Y`: Above).

#### Complete Code 128 Snippet:
```zpl
^XA
^FO50,100^BY3,2.5,120^BCN,120,Y,N,N^FDTR98124765^FS
^XZ
```

---

## 2. 2D QR Code Generation (`^BQ`)

For web URLs, GS1 digital links, and verification hashes, ZPL provides the Model 2 QR engine:

```zpl
^BQo,m,s
```
- `o`: Orientation (`N`: Normal).
- `m`: Model version (`2`: Model 2).
- `s`: Magnification scale (1 to 10 dots). Use `5` or `6` for 203 DPI, and `8` for 300 DPI.

### Data Payload Syntax:
The field data parameter must start with a two-character prefix:
```zpl
^FD[ErrorCorrection][DataMode],[Payload]^FS
```
- **Error Correction:** `H` (30%), `Q` (25%), `M` (15%), `L` (7%).
- **Data Mode:** `A` (Automatic / ASCII).

#### Complete QR Code Snippet:
```zpl
^XA
^FO500,100^BQN,2,6^FDQA,https://printzen.app/track/TR98124765^FS
^XZ
```

---

## 3. Frequently Asked Questions (FAQ)

### Why does the warehouse scanner fail to read my printed barcode?
**This is usually caused by setting the module width too narrow (`^BY1`) or failing to leave a sufficient quiet zone.** At 203 DPI, a 1-dot narrow bar can bleed into adjacent bars if the print darkness is high. Use `^BY2` or `^BY3`, and preserve at least 30 dots of clear white space on both ends of the barcode.

### How do I print barcodes and QR codes side-by-side in ZPL?
**Because ZPL operates on an absolute 2D coordinate system, elements are positioned independently using `^FOx,y`.** Placing your linear barcode at `^FO50,100` and the QR matrix at `^FO520,100` positions both elements along the same horizontal baseline.

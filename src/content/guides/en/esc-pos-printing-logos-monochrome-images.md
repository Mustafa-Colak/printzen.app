---
title: "Printing Company Logos and Monochrome Graphics via ESC/POS"
description: "Convert color images into 1-bit monochrome raster arrays. Master the modern GS v 0 command, Floyd-Steinberg error diffusion dithering, and NV flash storage."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: esc-pos-printing-logos-monochrome-images
---

Printing sharp, prominent brand logos at the head of customer receipts elevates brand credibility and instills customer trust. However, frontend web developers attempting to pipe colorful JPEG or PNG images to thermal printers often encounter smeared, solid-black, or distorted output.

Thermal printers lack shades of gray, transparency layers, and RGB color filters. They operate strictly in a binary state: **heated dots (1 / black) and unheated dots (0 / white)**.

In this guide, we break down image preprocessing, Floyd-Steinberg error diffusion dithering, and the modern standard ESC/POS command: **`GS v 0` (Print Raster Bit Image)**.

---

## 1. Preparing Images for Thermal Media

Before binary serialization, source artwork must undergo three deterministic transformations:
1. **Geometric Scaling:** Standard 80mm receipt paper spans **576 dots (pixels)** at 203 DPI, while 58mm portable rolls span **384 dots**. Scale images down so their width fits within these boundaries.
2. **Grayscale Conversion:** Transform RGB channels into relative luminance values: $Y = 0.299R + 0.587G + 0.114B$.
3. **Dithering (Error Diffusion):** To represent photo gradients or subtle brand drop-shadows using binary dots, apply **Floyd-Steinberg** or **Atkinson** spatial dithering algorithms.

---

## 2. Modern Raster Bit Image Architecture (`GS v 0`)

Legacy `ESC *` commands required cumbersome 8-dot or 24-dot vertical stripe slicing. The modern industry standard supported across all Epson, Star, and Chinese POS printers is **`GS v 0`**:

$$\text{GS } v \text{ } 0 \text{ } m \text{ } xL \text{ } xH \text{ } yL \text{ } yH \text{ } [d_1 \dots d_k]$$

- `$m$`: Density mode (`0`: Normal, `1`: Double-width, `2`: Double-height, `3`: Quadruple).
- `$xL, xH$`: Horizontal byte count ($x = \text{Width in pixels} / 8$). $xL = x \pmod{256}$, $xH = \lfloor x / 256 \rfloor$.
- `$yL, yH$`: Vertical height in dots. $yL = y \pmod{256}$, $yH = \lfloor y / 256 \rfloor$.
- `$[d_1 \dots d_k]$`: Packed 1-bit monochrome data bytes.

### HTML5 Canvas to 1-Bit Monochrome Stream (JavaScript):
```javascript
export function convertCanvasToRasterEscPos(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const rawData = ctx.getImageData(0, 0, width, height).data;

  // Byte width must be padded to full byte boundaries (multiples of 8)
  const byteWidth = Math.ceil(width / 8);
  const xL = byteWidth % 256;
  const xH = Math.floor(byteWidth / 256);
  const yL = height % 256;
  const yH = Math.floor(height / 256);

  const command = [0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH];
  const raster = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < byteWidth; x++) {
      let byte = 0;
      for (let b = 0; b < 8; b++) {
        const px = x * 8 + b;
        if (px < width) {
          const idx = (y * width + px) * 4;
          const lum = 0.299 * rawData[idx] + 0.587 * rawData[idx + 1] + 0.114 * rawData[idx + 2];
          // Threshold: if darker than mid-gray, ignite dot
          if (lum < 128) {
            byte |= (1 << (7 - b));
          }
        }
      }
      raster.push(byte);
    }
  }

  return new Uint8Array([...command, ...raster]);
}
```

---

## 3. Frequently Asked Questions (FAQ)

### Why does my transparent PNG logo print as a solid black rectangle?
**Transparent pixels in PNG files often store RGB values of `(0, 0, 0)` with alpha `0`.** If your image processing script ignores alpha channels and evaluates only RGB luminance, transparent areas evaluate as pure black. Always draw images onto a solid white background canvas (`ctx.fillStyle = '#FFF'; ctx.fillRect(...)`) prior to raster extraction.

### Does streaming a high-resolution logo slow down printing?
**Over USB and Ethernet LAN, transferring a 20 KB logo takes negligible milliseconds.** Over Bluetooth Low Energy (BLE), however, sending 20 KB in 20-byte slices adds 2 to 3 seconds of latency. For BLE setups, store the logo in the printer's onboard non-volatile NV flash memory (`FS q`) during initial setup, then invoke it with a 4-byte call (`FS p 1 0`).

### What is the maximum image width for 58mm mobile thermal printers?
**The printable head width on 58mm rolls is 48 mm, which translates to exactly 384 dots at 203 DPI.** To avoid clipping or unexpected margin wrapping, resize all logo assets to 384 pixels or less before binary serialization.

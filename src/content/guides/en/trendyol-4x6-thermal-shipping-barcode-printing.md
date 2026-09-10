---
title: "Printing 4x6 Inch (100x150mm) Thermal Shipping Barcodes for Trendyol Orders"
description: "Configure Trendyol merchant portals for 100x150mm direct thermal label output. Master Zebra and Xprinter Windows driver settings and eliminate barcode bleed."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: trendyol-4x6-thermal-shipping-barcode-printing
---

Merchants fulfilling orders on regional e-commerce platforms like Trendyol often struggle with default A4 multi-page manifests. When piped to 4x6 inch desktop thermal printers, labels print misaligned, clipped, or scaled down to illegible sizes.

Configuring the seller portal directly for **100 × 150 mm (4 × 6 inch) direct thermal roll format** unlocks high-speed batch printing.

---

## 1. Merchant Dashboard Output Configuration

1. In the **Seller Dashboard**, navigate to **Orders & Shipments**.
2. Locate the **Print Settings** icon (gear symbol) in the top-right header.
3. Switch the Document Output format from standard A4 to **"Thermal Barcode (100x150 mm)"** or **"A6 Format"**.
4. When selecting "Batch Print Barcodes", the portal now exports a consolidated PDF with discrete 100x150 mm pages.

---

## 2. Printer Driver Configuration (Zebra, Xprinter, TSC)

1. Open **Windows Settings > Devices > Printers & Scanners**.
2. Select your label printer and click **Printing Preferences**.
3. Under **Page Setup**:
   - Width: `100.0 mm`
   - Height: `150.0 mm`
   - Media Type: `Labels with Gaps (Die-Cut)`.
4. In the **Graphics / Dithering** tab, set dithering to **"None"**. This prevents rasterization artifacts, keeping linear barcode bars crisp.

---

## 3. Frequently Asked Questions (FAQ)

### Why do courier laser scanners fail to read printed shipping barcodes?
**Excessive thermal darkness burns extra dye, causing black bars to bleed into adjacent white spaces.** Lower the "Print Darkness" setting from 15–20 down to 8–10 in your printer driver. Ensuring sharp, distinct white gaps between bars restores optical read rates.

### Do regional couriers (Yurtiçi, Aras, MNG, Trendyol Express) accept 100x150 mm labels?
**Yes, 100x150 mm (4x6 inch) is the universally accredited carrier shipping label dimension.** Provided the Code 128 tracking barcode, destination address, and package volumetric weight are visible, all major courier sorting facilities scan these labels without exception.

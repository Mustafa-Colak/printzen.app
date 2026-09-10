---
title: "Amazon FBA and MFN Shipping Barcode Standards (4x6 Inch Direct Thermal)"
description: "Master Amazon fulfillment center labeling specifications. Comply with FBA carton box standards, FNSKU item barcode geometries, and native 4x6 ZPL exports."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: amazon-fba-mfn-shipping-barcode-standards
---

Amazon maintains the world's most exacting fulfillment inbound standards. Sending inbound cartons with smudged, improperly sized, or unreadable barcodes to Fulfillment by Amazon (FBA) centers risks immediate inbound refusal, unplanned prep fee penalties, or shipment return at seller expense.

In this guide, we break down FBA carton box labels, Merchant Fulfilled Network (MFN) shipping labels, and FNSKU item barcode standards.

---

## 1. Amazon Fulfillment Label Dimensions

| Label Type | Standard Dimensions | Print Technology | Functional Purpose |
|---|---|---|---|
| **FBA Inbound Carton Label** | **4 × 6" (102 × 152 mm)** | Direct Thermal / Thermal Transfer | Affixed to outer corrugated boxes dispatched to FBA centers. |
| **FNSKU Item Barcode** | **50 × 25 mm (2 × 1")** or 30-up | Direct Thermal / Coated Bond | Scannable unit barcode (`X00...`) attached to retail packaging. |
| **MFN Shipping Label** | **4 × 6" (100 × 150 mm)** | Direct Thermal | Direct-to-consumer parcel label for seller-fulfilled orders. |

---

## 2. Inbound Box Label Placement Rules

1. **Never Place Across Seams or Flaps:** Avoid placing box labels over carton tape joints or flap edges. When warehouse associates cut cartons open with box cutters, split barcodes become unreadable.
2. **Corner Clearance:** Position labels at least 1.25 inches (3 cm) away from all box edges to prevent bending around corners.
3. **Export Native ZPL:** Inside Amazon Seller Central > Shipping Queue, select **"Thermal Printing (4x6 in / ZPL)"**. This bypasses raster PDF intermediate steps, rendering razor-sharp barcodes directly on Zebra and industrial printers.

---

## 3. Frequently Asked Questions (FAQ)

### Does Amazon accept Direct Thermal labels for FBA inbound cartons?
**Yes, direct thermal labels are fully accepted for standard domestic truckload and small parcel deliveries.** However, for maritime container freight or long-term pallet storage, use **Top-Coated Thermal** or Thermal Transfer (resin ribbon) labels to resist extreme transit heat and abrasion.

### How do I print Amazon FBA labels directly from Seller Central without third-party apps?
**When generating box labels in the final shipment creation workflow, select "Thermal printing - 4 x 6 in" as the paper type.** You can stream the resulting `.zpl` file directly over raw TCP sockets (port 9100) or print the formatted 4x6 PDF via your thermal printer driver.

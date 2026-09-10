---
title: "Batch Shipping Label Printing Setup in the Hepsiburada Merchant Portal"
description: "Master bulk shipping label exports for HepsiJet and regional couriers. Configure 100x150mm thermal page layouts, auto-rotation, and print speed optimization."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: hepsiburada-batch-shipping-label-printer-setup
---

Fulfilling orders promptly on major regional marketplaces requires rapid packing and labeling workflows. Exporting labels one by one onto A4 sheets wastes hours, whereas batch-generating thermal labels accelerates warehouse dispatch.

In this guide, we outline batch export parameters and driver optimization for marketplace shipping manifests.

---

## 1. Bulk Export Configuration

1. Log in to the **Merchant Portal** and navigate to **Orders**.
2. Filter for orders in **"Awaiting Packaging"** or **"Ready to Ship"** status.
3. Select desired orders via batch checkboxes.
4. From the **Bulk Actions** dropdown, select **"Print Shipping Barcodes"**.
5. Select **"Thermal Label (100x150 mm)"** or **"A6 Format"** as the document template.
6. Open the resulting multi-page PDF in your print viewer, select your thermal printer, and print directly.

---

## 2. Print Speed and Contrast Balancing

Carrier barcodes (including dense 2D routing matrices) require optimal contrast:
- **Print Speed:** Setting speed excessively high (above 8 IPS / 200 mm/s) on direct thermal media can cause faint, low-contrast bars. Capping speed at **4 to 5 IPS (100–125 mm/s)** ensures solid black saturation.
- **Vertical Margins:** Ensure top and bottom margins have at least 3 mm of clearance to avoid placing barcode bars across media gap notches.

---

## 3. Frequently Asked Questions (FAQ)

### Why do some pages print landscape while others print portrait in batch PDFs?
**This occurs when orders are assigned to different courier networks with distinct label dimensions.** In your PDF print dialog (Chrome or Adobe Reader), enable **"Auto-rotate and center"** to orient all pages vertically onto your 100x150 mm rolls automatically.

### Should I use Direct Thermal or Thermal Transfer media?
**Direct Thermal (Eco Thermal) paper is the global standard for e-commerce parcel logistics.** It requires zero ribbons, costs fractions of a cent per label, and provides more than sufficient durability for the standard 1-to-5 day parcel delivery cycle.

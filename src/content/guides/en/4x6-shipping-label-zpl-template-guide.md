---
title: "Creating a Production 4x6 Inch (100x150mm) Shipping Label Template in ZPL II"
description: "A complete, copy-paste ready 4x6 inch logistics shipping label template in ZPL II. Includes sender/receiver addresses, Code 128 tracking, and QR dispatch codes."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: 4x6-shipping-label-zpl-template-guide
---

In modern parcel shipping and warehousing, the global standard format is the **4 × 6 inch (100 × 150 mm) die-cut direct thermal label**. It provides optimal surface area to present origin/destination addresses, high-density carrier barcodes, package dimensions, and courier scan matrices.

At 203 DPI, a 4x6 inch label maps to an active grid of **812 × 1218 dots**.

---

## 1. Production-Ready 4x6" ZPL II Shipping Label Template

```zpl
^XA
^PW812
^LL1218
^LH0,0

^FX === SECTION 1: Carrier Branding & Class ===
^FO50,40^A0N,40,40^FDPRINTZEN GLOBAL LOGISTICS^FS
^FO50,85^A0N,22,22^FDSERVICE: EXPEDITED NEXT DAY FREIGHT^FS
^FO50,115^GB712,3,3^FS

^FX === SECTION 2: Routing Addresses ===
^FO50,135^A0N,20,20^FDFROM:^FS
^FO50,165^A0N,24,24^FDPrintzen Fulfillment Center Ltd^FS
^FO50,195^A0N,20,20^FDLondon Hub E1 6AN, United Kingdom^FS

^FO420,135^A0N,20,20^FDSENDER TO:^FS
^FO420,165^A0N,28,28^FDSarah Jenkins^FS
^FO420,200^A0N,22,22^FD42 Victoria Road, Suite 10^FS
^FO420,225^A0N,22,22^FDManchester M1 4ET^FS
^FO50,260^GB712,3,3^FS

^FX === SECTION 3: Primary Tracking Barcode ===
^FO80,290^BY3,2.5,130^BCN,130,Y,N,N^FDPRZ-GB-98214^FS

^FX === SECTION 4: Package Manifest Summary ===
^FO50,480^GB712,170,2^FS
^FO70,505^A0N,22,22^FDOrder Reference: #84912^FS
^FO70,540^A0N,22,22^FDPackage Count: 1 Carton^FS
^FO70,575^A0N,22,22^FDPayment Status: Prepaid (Credit Card)^FS
^FO70,610^A0N,22,22^FDWeight / Dimensions: 2.15 KG / 4.7 LBS^FS

^FX === SECTION 5: Courier Verification QR ===
^FO550,495^BQN,2,6^FDQA,https://printzen.app/track/PRZ-GB-98214^FS
^FO550,625^A0N,18,18^FDSCAN FOR POD^FS

^FX === SECTION 6: Legal Footer ===
^FO50,670^GB712,3,3^FS
^FO50,690^A0N,18,18^FDSubject to standard conditions of carriage. Verify carton integrity upon receipt.^FS
^XZ
```

---

## 2. Parameter Breakdown

- `^PW812` & `^LL1218`: Explicitly sets print width and label length in dots, preventing buffer overflows and trailing blank label ejections.
- `^GB712,3,3`: Generates horizontal divider lines 712 dots wide with a 3-dot stroke weight.
- `^BCN,130,Y,N,N`: Code 128 tracking barcode rendered at 130 dots tall with bottom-aligned human-readable text.

---

## 3. Frequently Asked Questions (FAQ)

### Can I run this template on a 300 DPI printer?
**If dispatched to a 300 DPI printhead, the label will scale down by ~33% and print miniature in the top-left corner.** To target 300 DPI, multiply all coordinate offsets and font sizes by $1.478$ (e.g., `^PW1200` and `^LL1800`), or apply ZPL's `^MU` scaling command.

### Why does the printer feed an extra blank label after every job?
**This happens when the printer's media sensor is miscalibrated or when `^LL` is defined longer than the physical gap separation.** Run a gap calibration routine (hold FEED while powering on) and verify that the `^LL` parameter matches your physical die-cut label height.

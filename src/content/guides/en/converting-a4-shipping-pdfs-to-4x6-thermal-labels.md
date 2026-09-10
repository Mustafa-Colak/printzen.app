---
title: "Automatically Converting A4 Shipping PDFs into 4x6 Inch Thermal Labels"
description: "Eliminate microscopic text and wasted margins. Crop A4 and Letter-sized carrier PDF manifests into full-bleed 4x6 inch (100x150mm) direct thermal labels."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: converting-a4-shipping-pdfs-to-4x6-thermal-labels
---

Legacy carrier APIs and older fulfillment plugins frequently generate shipping manifests formatted for standard **A4 or US Letter paper**. In most cases, the actual shipping label occupies only the top-left quadrant of the document, leaving three-quarters of the page blank.

Sending this document directly to a 4x6 inch thermal printer forces the spooler to shrink the full sheet down to roll width, resulting in tiny, illegible barcodes that sorting scanners cannot read.

In this guide, we break down automated cropping techniques to extract the label quadrant and scale it to full 4x6 inch media.

---

## 1. Manual Cropping with Adobe Acrobat Reader

For low-volume operations:

1. Open the A4 PDF in **Adobe Acrobat Reader**.
2. Select **Edit > Take a Snapshot**.
3. Drag a rectangular selection box tightly around the shipping label area, excluding extraneous white space.
4. Right-click the highlighted selection and choose **Print**.
5. In the printer dialog:
   - Target Printer: `Your 4x6 Thermal Label Printer`
   - Page Size: `4x6 inches / 100x150mm`
   - Page Sizing: **"Fit to Printable Area"**.

---

## 2. Server-Side Automated Cropping (Node.js & pdf-lib)

For warehouse automation, crop the quadrant programmatically without manual intervention:

```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

export async function cropA4ToThermal(inputPath, outputPath) {
  const sourceBytes = fs.readFileSync(inputPath);
  const sourceDoc = await PDFDocument.load(sourceBytes);
  const targetDoc = await PDFDocument.create();

  // 100x150 mm in PDF typographical points [283.46, 425.20]
  const targetW = 283.46;
  const targetH = 425.20;

  for (const page of sourceDoc.getPages()) {
    const { width, height } = page.getSize();

    // Isolate Top-Left Quadrant (Note: PDF Y-coordinates originate from bottom-left)
    const cropBox = {
      x: 0,
      y: height / 2,
      width: width / 2,
      height: height / 2
    };

    const embeddedQuadrant = await targetDoc.embedPage(page, cropBox);
    const newPage = targetDoc.addPage([targetW, targetH]);

    newPage.drawPage(embeddedQuadrant, {
      x: 0,
      y: 0,
      width: targetW,
      height: targetH
    });
  }

  const outputBytes = await targetDoc.save();
  fs.writeFileSync(outputPath, outputBytes);
}
```

---

## 3. Frequently Asked Questions (FAQ)

### Does cropping and scaling degrade barcode scanning reliability?
**No, vector elements retain mathematical precision.** Text and lines inside vector PDFs scale up to 100x150 mm with laser-sharp edges, significantly improving scan reliability compared to shrinking full A4 sheets.

### How does Printzen automate PDF cropping?
**Printzen incorporates an automatic bounding-box detection engine.** When an A4 or Letter manifest is routed through Printzen, the engine analyzes white space margins, crops the active label quadrant automatically, and streams it to your 4x6 printer with zero manual intervention.

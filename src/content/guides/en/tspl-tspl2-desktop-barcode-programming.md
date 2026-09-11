---
title: "TSPL & TSPL2 Desktop Barcode Printer Programming Guide"
description: "Master TSPL and TSPL2 printer programming for TSC, Xprinter, and Godex label printers. Complete reference for SIZE, GAP, TEXT, and BARCODE commands."
printerClass: "desktop"
brand: "Generic"
publishDate: 2026-09-11
translationKey: "tspl-ve-tspl2-masaustu-barkod-programlama"
topicCluster: "hub-3"
---

TSPL (Taiwan Semiconductor Programming Language) and its successor TSPL2 serve as the primary native command languages across cost-effective desktop barcode and direct thermal shipping label printers (TSC, Xprinter, Gprinter, Godex). Known for clean, human-readable syntax, TSPL provides rapid label formatting without requiring heavy binary compilers.

## Core TSPL Command Syntax

All TSPL instructions are plain-text statements terminated with CRLF (`\r\n`). A production label payload contains:

```tspl
SIZE 4, 6
GAP 0.12, 0
DIRECTION 1
CLS
TEXT 50,50,"3",0,1,1,"PRINTZEN FULFILLMENT"
BARCODE 50,120,"128",80,1,0,2,4,"TR1234567890"
PRINT 1,1
```

### Command Reference:
- **SIZE:** Sets the physical dimension of the label in inches or millimeters.
- **GAP:** Configures gap/notch distance between consecutive labels.
- **CLS:** Clears the printhead framebuffer. Crucial before every new design.
- **TEXT:** Renders native monospace or proportional bitmap fonts.
- **BARCODE:** Directly instructs hardware to generate Code 128, EAN, or UPC.
- **PRINT:** Dispatches the buffered bitmap to the thermal head.

## Printer-Specific Implementation Guides



---
title: "Configuring Silent Thermal Receipt Printing with CUPS on macOS and Linux"
description: "Master the Common Unix Printing System (CUPS) for thermal receipt printing. Configure raw queues, execute headless lp/lpr commands, and integrate with Node.js."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: macos-linux-cups-silent-thermal-printing
---

On macOS workstations, Linux servers, and embedded Raspberry Pi POS kiosks, the printing subsystem is managed by **CUPS (Common Unix Printing System)**.

CUPS exposes USB and network-attached thermal receipt printers as unified Unix spool queues, allowing backend scripts and desktop agents to dispatch silent print jobs using native `lp` and `lpr` CLI utilities without UI overhead.

---

## 1. Enabling the CUPS Web Interface and Configuring Raw Queues

CUPS runs an administrative web console on `http://localhost:631`.

1. **Enable Web Interface on macOS:**
   Open Terminal and execute:
   ```bash
   cupsctl WebInterface=yes
   ```
2. Navigate to `http://localhost:631/admin` in your browser.
3. Click **Add Printer** and locate your connected USB thermal printer.
4. **Crucial Setting:** In the driver/model selection screen, choose **Raw** > **Raw Queue (en)**. This bypasses CUPS PDF/PostScript rendering filters, transmitting raw ESC/POS binary streams straight to the hardware.

---

## 2. Headless CLI Dispatch and Node.js Integration

Once mapped to a queue name (e.g. `Thermal_Kitchen`), print from the command line:

```bash
# Print raw binary file directly to queue
lp -d Thermal_Kitchen -o raw /path/to/receipt.bin

# Pipeline stream directly via standard input
echo -e "\x1B\x40Hello World\n\x1D\x56\x42\x00" | lp -d Thermal_Kitchen -o raw
```

### Node.js Child Process Integration:
```javascript
import { exec } from 'child_process';
import fs from 'fs';

export function printDirectViaCups(queueName, binaryData) {
  const tmpFile = `/tmp/prz_${Date.now()}.bin`;
  fs.writeFileSync(tmpFile, binaryData);

  exec(`lp -d ${queueName} -o raw ${tmpFile}`, (err) => {
    fs.unlinkSync(tmpFile); // Clean up temp file
    if (err) console.error('CUPS dispatch error:', err.message);
  });
}
```

---

## 3. Frequently Asked Questions (FAQ)

### Why does CUPS advance two feet of blank paper after printing a receipt?
**This happens when a thermal printer is installed with a generic PostScript/PPD driver instead of a "Raw Queue".** Standard PPD drivers assume Letter or A4 document heights. Defining the printer as a Raw Queue instructs CUPS to leave feed and cut handling entirely to the embedded ESC/POS bytes.

### How does CUPS handle offline printers or disconnected USB cables?
**CUPS incorporates an intelligent local disk spooler.** If a printer is powered down or runs out of paper, jobs remain in the local queue (`/var/spool/cups`) and flush immediately upon hardware re-connection without data loss.

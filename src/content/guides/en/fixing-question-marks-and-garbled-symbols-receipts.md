---
title: "Fixing Question Marks (???), Chinese Characters, and Garbled Text on Receipts"
description: "Diagnose and resolve common thermal receipt corruption bugs: question mark floods, unwanted Asian kanji glyphs, runaway paper feeds, and staircase text stepping."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: fixing-question-marks-and-garbled-symbols-receipts
---

Encountering an uncontrollable stream of **question marks (`????`), Asian kanji characters, or yards of continuous blank paper roll ejection** is one of the most frustrating failures in thermal printer integration.

In this troubleshooting guide, we isolate the four primary causes of receipt text distortion and outline the exact corrective protocols.

---

## 1. Symptom 1: Floods of Question Marks ("???")

### Root Cause:
The application is transmitting raw multi-byte UTF-8 bytes to an 8-bit printer, or the byte conversion software is defaulting unmapped character codes to `0x3F` (ASCII `?`).

### Corrective Action:
Prepend the receipt stream with your printer's hardware code page command (e.g. `ESC t 18` for CP857 or `ESC t 16` for WPC1252) and encode outgoing strings into that matching single-byte table before streaming.

---

## 2. Symptom 2: Random Chinese, Japanese, or Korean (CJK) Characters

### Root Cause:
The printer's firmware has its **Chinese Multi-Byte Character Mode (FS &)** enabled by default. Consecutive ASCII bytes with values above 128 are grouped into 2-byte pairs and rendered as Kanji ideographs.

### Corrective Action:
Issue the **Cancel Chinese Character Mode** directive (`FS .`) during printer initialization:
```javascript
// ESC/POS Cancel Chinese Character Mode (FS .)
const disableChineseGlyphs = [0x1C, 0x2E];
```

---

## 3. Symptom 3: Runaway Paper Feed (Endless Paper Spooling)

### Root Cause:
Serial (RS232) or Bluetooth **Baud Rate Mismatch**. If the host computer sends binary data at 115200 baud while the printer's serial UART controller is listening at 9600 baud, bit framing collapses into electrical noise. The printer misinterprets this noise as repeated `LF` (Line Feed) commands.

### Corrective Action:
Print a hardware Self-Test receipt (hold FEED while powering on). Locate the active serial configuration (e.g. `Baud: 9600, Data: 8, Parity: None, Stop: 1`) and match your host serial driver settings exactly.

---

## 4. Symptom 4: "Staircasing" Indented Text

```
Order Line 1
            Order Line 2
                        Order Line 3
```

### Root Cause:
The printer expects a carriage return (`\r` / `0x0D`) alongside every line feed (`\n` / `0x0A`). Receiving only `\n` advances the paper motor one line downward without returning the printhead carriage to the left margin.

### Corrective Action:
Normalize all newline delimiters in your text payloads to `\r\n` (CRLF), or configure the printer's internal DIP switch for "Automatic Carriage Return on LF".

---

## 5. Frequently Asked Questions (FAQ)

### The printer is continuously spewing paper with random symbols. How do I halt it?
**Immediately turn off the physical power switch, disconnect the communication cable, and purge the host OS print spooler queue.** On Windows, open Services (`services.msc`), stop the "Print Spooler" service, delete all stuck `.SPL` files inside `C:\Windows\System32\spool\PRINTERS`, and restart the service.

### Does Printzen automatically safeguard against these corruption bugs?
**Yes, the Printzen client driver applies automatic initialization filters.** It routinely issues the Cancel Chinese Mode directive, normalizes line breaks to CRLF, maps character tables dynamically, and validates serial baud rates before dispatching jobs.

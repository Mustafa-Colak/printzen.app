---
title: "Event, Conference Badge & Practical Automation Ticket Printer Guide"
description: "Deploy high-speed onsite thermal registration desks, conference badge printers, and Practical Automation / Boca FGL & ZPL ticket printers with sub-2-second output."
printerClass: "desktop"
brand: "Generic"
publishDate: 2026-09-11
updatedDate: 2026-10-26
translationKey: "etkinlik-fuar-kongre-ve-yaka-karti-baskisi"
topicCluster: "hub-40"
---

Conference check-in desks, stadium box offices, and self-service admission kiosks rely on high-speed direct [thermal](/guides/network-ethernet-raw-port-9100-socket-architecture/) conference badge and **Practical Automation ticket printer** hardware (alongside Boca Systems and Zebra ZPL units) to produce personalized attendee credentials, fanfold cardstock badges, and QR admission tickets in under 2 seconds upon barcode scanning.

Unlike standard rolled receipt paper, event badges and admission tickets use heavy **140–250 gsm fanfold thermal cardstock** with black timing marks (* reflective black-mark bars*) or precision die-cut notches on the rear liner. Choosing the right protocol (FGL, ZPL II, or ESC/POS) and configuring black-mark optical sensors prevents media jams and multi-ticket feed drift during peak admission surges.

---

## 1. Event Badge & Commercial Ticket Printer Hardware Matrix

| Hardware Series | Primary Use Case | Native Command Protocol | Typical Stock / Media | Max Print Speed |
|---|---|---|---|---|
| **Practical Automation (ITL / ATX Series)** | Kiosk, box office, cinema & transit admission tickets | **FGL (Friendly Ghost Language)** / ZPL / PCL | Fanfold / roll heavy thermal ticket stock (2"–3.25" wide) | Up to 10–12 ips (254–305 mm/s) |
| **Boca Systems (Lemur / Lemur-C / Lemur-S)** | Stadium, theater & museum box office tickets | **FGL** / HP PCL / ZPL emulation | Fanfold thermal ticket cardstock with rear black mark | Up to 10 ips (254 mm/s) |
| **Zebra ZD621 / ZD500 / ZC100** | Onsite conference check-in fanfold badges & wristbands | **ZPL II (Zebra Programming Language)** | 4×3" or 4×6" fanfold cardstock (rear slot feed) & HC100 wristbands | Up to 8 ips (203 mm/s) |
| **Epson ColorWorks (CW-C4000 / C6000) & TM-C3500** | Full-color VIP conference badges & sponsor logos | **ESC/Label** / ZPL II compatibility mode | Matte/glossy inkjet fanfold butterfly & die-cut badges | Up to 4–5 ips full color |
| **Brother QL-820NWBc / TD-4550DNWB** | Tablet/iPad check-in desks (AirPrint / Bluetooth / LAN) | **ESC/P** / Raster / ZPL emulation | DK die-cut badge labels & rear-fed fanfold tags | Up to 6–8 ips |

---

## 2. Programming a Practical Automation Ticket Printer (FGL vs. ZPL)

A **Practical Automation ticket printer** (such as the industrial ITL-2000, ATX-23, or Kiosk ITX series) and Boca Lemur printers standardize on **FGL (Friendly Ghost Language)**—a lightweight ASCII tag language surrounded by angle brackets (`<...>`), while also offering firmware modes for **ZPL II** emulation.

### 2.1. Native FGL Ticket Layout Example
In FGL, coordinates are positioned using `<RCy,x>` (Row, Column in dots), fonts are selected via `<Fn>`, and cutting/ejecting is triggered instantly at the end of the stream (`<p>`):

```text
<CB>
<RC40,60><F9><HW2,2>GLOBAL DEV SUMMIT 2026
<RC110,60><F3><HW1,1>ATTENDEE: ALEXANDRA CHEN
<RC150,60><F3>ROLE: PRINCIPAL SYSTEMS ARCHITECT
<RC200,60><F3>GATE: HALL B - VIP TRACK
<RC60,620><QRv4><eccH>{ticket_id:9841204}<end>
<p>
```

- `<CB>`: Clears the ticket print buffer before rendering variable data.
- `<RCy,x>`: Sets the exact row and column origin on the heavy ticket cardstock.
- `<p>`: Prints the ticket and actuates the heavy-duty rotary guillotine cutter along the black mark boundary.

### 2.2. ZPL II Fanfold Conference Badge Template (4×3 Inch / 203 DPI)
When using a [Zebra printer ZPL](/guides/zebra-zpl-label-printing/) workflow (or a Practical Automation / TSC unit in ZPL emulation mode) with rear-slot fanfold badge stock, configure the media tracking mode to **Mark Sensing (`^MNM`)** so the optical sensor aligns on the rear black timing bar:

```zpl
^XA
^MNM
^PW812
^LL609
^CI28

^FX === Attendee Name & Company ===
^FO50,90^A0N,64,64^FB712,1,0,C^FDALEXANDRA CHEN^FS
^FO50,175^A0N,34,34^FB712,1,0,C^FDCLOUDFLARE INFRASTRUCTURE^FS
^FO80,235^GB652,3,3^FS

^FX === Badge Role Banner ===
^FO80,260^GB652,70,70^FS
^FO80,278^FR^A0N,42,42^FB652,1,0,C^FDSPEAKER / VIP ACCESS^FS

^FX === Check-In & Lead Retrieval QR Code ===
^FO330,360^BQN,2,6^FDQA,https://printzen.app/badge/PRZ-2026-8841^FS
^FO50,550^A0N,22,22^FB712,1,0,C^FDBADGE ID: #PRZ-2026-8841^FS
^XZ
```

---

## 3. Sub-2-Second Check-In Kiosk Architecture

When 2,000 attendees arrive at a conference registration desk within a 30-minute window, browser print dialogs (`Ctrl+P`) and slow PDF raster drivers create severe queues. To achieve sub-2-second check-in printing:

1. **Direct Raw TCP Port 9100 (LAN / Wi-Fi):** Connect the badge or Practical Automation ticket printer via Ethernet on the local check-in VLAN and dispatch raw FGL/ZPL strings over TCP socket port `9100`.
2. **Browser Direct USB (WebUSB):** For Chromebook, Windows, or macOS check-in kiosks tethered via USB, bypass OS print spoolers entirely and [print to a thermal printer via the WebUSB API](/guides/direct-usb-printing-via-webusb-api-thermal-printers/).
3. **Silent Kiosk Mode:** If rendering HTML/CSS badge layouts from a web app, configure Chromium using [Silent Printing in Web Applications (`--kiosk-printing`)](/guides/silent-printing-web-applications-kiosk-mode/) to suppress popup dialogs.

---

## 4. Frequently Asked Questions (FAQ)

### How do I calibrate black-mark fanfold cardstock on a Practical Automation ticket printer?
**Ensure the reflective optical sensor is positioned on the side of the media path matching the printed black timing mark on the underside of the ticket stock.** On Practical Automation ITL/ATX printers, power on the unit with stock loaded so the opto-sensor registers paper reflection vs. black-bar absorption before sending the `<p>` cut command. On Zebra ZPL printers, send `^XA^MNM^JUS^XZ` to switch from web/gap sensing (`^MNY`) to reflective black-mark sensing (`^MNM`).

### Why does my conference badge printer cut through the middle of the next badge?
**The cutter offset or tear-off position (`~TA` in ZPL, or cutter opto-distance in FGL) does not match the distance between the rear black timing mark and the perforation line.** Adjust `~TA` (e.g., `~TA015` or `~TA-010`) in dot increments until the guillotine blade or tear bar lands squarely on the perforation seam.

---
title: "WebUSB API: Direct Byte Transfer to Desktop Thermal Printers"
description: "Use the WebUSB API to send ESC/POS bytes directly from a browser to a USB thermal printer without installing any drivers. Includes Chrome/Edge support, security model, and full code examples."
printerClass: "desktop"
brand: "Epson / Generic"
publishDate: 2026-09-11
translationKey: "webusb-masaustu-yazici-dogrudan-bayt-iletimi"
topicCluster: "hub-11"
---

The WebUSB API enables web pages to communicate with USB devices — including thermal printers — **without any driver installation**. Available in Chrome 61+ and Edge 79+, it eliminates the traditional friction of print driver setup entirely.

## Why WebUSB Matters

Traditional browser printing forces:
- A **Ctrl+P dialog** the user must interact with
- OS-level printer drivers installed
- No silent / automatic printing

WebUSB removes all of these barriers.

## Security Model

WebUSB works only over HTTPS (localhost is exempt for development). Users must approve a permission dialog on the first connection. Subsequent connections to the same device can be automatic.

```javascript
const device = await navigator.usb.requestDevice({
  filters: [
    { vendorId: 0x04b8 }, // Epson
    { vendorId: 0x0519 }, // Star Micronics
    { vendorId: 0x1504 }, // Bixolon
    { vendorId: 0x28e9 }, // Xprinter
  ]
});
```

## Step-by-Step WebUSB Connection

```javascript
class WebUSBPrinter {
  async connect() {
    this.device = await navigator.usb.requestDevice({
      filters: [{ classCode: 7 }] // Printer USB class
    });
    await this.device.open();
    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }
    await this.device.claimInterface(0);
    const iface = this.device.configuration.interfaces[0];
    this.endpointOut = iface.alternates[0].endpoints.find(
      e => e.direction === 'out' && e.type === 'bulk'
    );
  }

  async send(data) {
    const CHUNK = 512;
    for (let i = 0; i < data.length; i += CHUNK) {
      await this.device.transferOut(
        this.endpointOut.endpointNumber,
        new Uint8Array(data.slice(i, i + CHUNK))
      );
    }
  }

  async disconnect() {
    await this.device.releaseInterface(0);
    await this.device.close();
  }
}
```

## Print a Receipt

```javascript
const printer = new WebUSBPrinter();
await printer.connect();

const ESC = 0x1B, GS = 0x1D, LF = 0x0A;
const enc = new TextEncoder();

await printer.send([
  ESC, 0x40,              // initialize
  ESC, 0x61, 0x01,        // center
  ...enc.encode('PRINTZEN CAFE
'),
  ...enc.encode('----------------------------
'),
  ESC, 0x61, 0x00,        // left
  ...enc.encode('Cappuccino x1     $4.50
'),
  LF, LF, LF,
  GS, 0x56, 0x41, 0x03    // full cut
]);
await printer.disconnect();
```

## Browser Support

| Browser | WebUSB | Note |
|---------|--------|------|
| Chrome 61+ | ✅ Full | Desktop + Android |
| Edge 79+ | ✅ Full | Chromium-based |
| Firefox | ❌ None | Standard rejected |
| Safari | ❌ None | Apple policy |

## Common Errors

**Access Denied** — Another process (Windows print spooler) holds the device. Stop the print service or disable printer sharing.

**Interface Claim Failed** — Release the interface first: `await device.releaseInterface(0)`

**Data Sent But Nothing Prints** — Wrong endpoint number selected. Log all endpoints to verify:
```javascript
device.configuration.interfaces.forEach(i => {
  i.alternates[0].endpoints.forEach(e =>
    console.log(e.direction, e.type, e.endpointNumber)
  );
});
```

## FAQ

**Does WebUSB work with all thermal printers?**
Not all. The printer must not be claimed by the OS spooler. Works best on macOS and Linux; on Windows, stop the Print Spooler service first.

**How fast can I transfer data?**
USB 2.0 Full Speed supports ~1 MB/s. Thermal printers print at 200 mm/s max — WebUSB bandwidth is never the bottleneck.

**Will the permission dialog appear every time?**
Only the first time. Subsequent connections use `navigator.usb.getDevices()` for automatic reconnect.

## Printer-Specific Guides for This Topic

- [Bixolon Slp Tx400 Webusb](/guides/bixolon-slp-tx400-webusb-webhid-direct-hardware-communication)
- [Bixolon Spp R200iii Webusb](/guides/bixolon-spp-r200iii-webusb-webhid-direct-hardware-communication)
- [Bixolon Spp R310 Webusb](/guides/bixolon-spp-r310-webusb-webhid-direct-hardware-communication)
- [Bixolon Srp 330ii Webusb](/guides/bixolon-srp-330ii-webusb-webhid-direct-hardware-communication)
- [Bixolon Srp 350iii Webusb](/guides/bixolon-srp-350iii-webusb-webhid-direct-hardware-communication)
- [Bixolon Srp Q300 Webusb](/guides/bixolon-srp-q300-webusb-webhid-direct-hardware-communication)
- [Epson Tm L90 Webusb](/guides/epson-tm-l90-webusb-webhid-direct-hardware-communication)
- [Epson Tm M30ii Webusb](/guides/epson-tm-m30ii-webusb-webhid-direct-hardware-communication)

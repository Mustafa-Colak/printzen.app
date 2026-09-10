---
title: "Android Bluetooth Printer Paired but Won't Print: Root Causes and Fixes"
description: "Resolve Android Bluetooth receipt printer connection deadlocks. Fix SPP UUID socket exceptions, hidden reflection fallbacks, and Android 12+ permissions."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: android-bluetooth-printer-paired-but-not-printing
---

A ubiquitous field support crisis: An Android tablet or smartphone shows the mobile thermal receipt printer as **"Paired"** in the OS Bluetooth menu; however, tapping "Print" in the POS app results in total silence or a generic `IOException: Connection Refused`.

This rarely points to broken hardware. In 99% of incidents, the failure stems from **stale RFCOMM sockets, single-master peripheral lockouts, or missing Android 12+ runtime permissions**.

---

## 1. Diagnostic and Recovery Protocol

### Step 1: Break Multi-Device Connection Deadlocks
Classic Bluetooth thermal printers operate strictly as **single-link point-to-point peripherals**. If another server tablet or courier smartphone nearby holds an open RFCOMM socket, your device will be rejected instantly during socket negotiation.
- Disable Bluetooth on neighboring mobile devices.
- Power-cycle the printer (turn off for 5 seconds, then power on).

### Step 2: Ensure Universal SPP UUID Socket Binding
When writing native Android Java/Kotlin drivers, always bind using the universal Serial Port Profile (SPP) UUID:
```java
UUID STANDARD_SPP = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
BluetoothSocket socket = device.createRfcommSocketToServiceRecord(STANDARD_SPP);
socket.connect();
```

If the standard method throws a connection handshake failure, execute the hidden reflection fallback to bind directly to RFCOMM Channel 1:
```java
Method m = device.getClass().getMethod("createRfcommSocket", new Class[] {int.class});
BluetoothSocket fallbackSocket = (BluetoothSocket) m.invoke(device, 1);
fallbackSocket.connect();
```

---

## 2. Verify Android 12+ Permissions

On Android 12 (API 31) and higher, Google mandates the `BLUETOOTH_CONNECT` permission:
1. Open **Settings > Apps > [Your POS App] > Permissions**.
2. Verify that **"Nearby Devices"** is set to **Allow**.

---

## 3. Frequently Asked Questions (FAQ)

### Does unpairing and re-pairing the printer fix the issue?
**Yes. Android's internal Bluetooth bonding cache occasionally corrupts stale encryption keys.** In Android Settings > Bluetooth, tap the gear icon next to the printer and select "Forget / Unpair". Power-cycle the printer and re-pair using PIN `1234` or `0000`.

### How does Printzen resolve these RFCOMM socket drops?
**Printzen's Android background service incorporates an automated socket recovery daemon.** If an RFCOMM link drops due to distance or sleep timeouts, the daemon cycles socket channels and transparently reconnects before printing queued tickets.

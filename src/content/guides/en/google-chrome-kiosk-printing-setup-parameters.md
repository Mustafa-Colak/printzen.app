---
title: "Google Chrome Kiosk Printing: Setup Flags, Shortcut Parameters, and CSS Rules"
description: "Configure Google Chrome for silent POS printing. Master --kiosk-printing, --disable-print-header-footer flags, and CSS @media print zero-margin rules."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: google-chrome-kiosk-printing-setup-parameters
---

At checkout terminals, the primary bottleneck in software usability is the browser's print preview modal. Each transaction forces cashiers to review an on-screen preview and click "Print".

Chromium browsers (Google Chrome, Microsoft Edge, Brave) feature native command-line startup flags that bypass the print dialog entirely and stream output straight to the hardware.

---

## 1. Essential Chromium Kiosk Printing Flags

| Flag Parameter | Functional Impact |
|---|---|
| `--kiosk-printing` | Suppresses the Ctrl+P preview modal; dispatches `window.print()` directly to default printer. |
| `--kiosk` | Launches browser in full-screen mode, hiding URL bars, bookmarks, and window controls. |
| `--disable-print-header-footer` | Strips automatic header and footer metadata (URL, page numbers, timestamps). |

---

## 2. Desktop Shortcut Configuration (Windows)

1. Duplicate your standard Google Chrome desktop shortcut and rename it **"POS Terminal"**.
2. Right-click the shortcut and open **Properties**.
3. In the **Target** field, append the flags to the executable path:

```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --disable-print-header-footer https://pos.yourstore.com
```

4. Click **Apply** and **OK**. When launched from this shortcut, calling `window.print()` outputs to paper instantly with zero screen dialogs.

---

## 3. CSS Zero-Margin Thermal Formatting

To prevent browsers from injecting unwanted margins around receipt rolls:

```css
@media print {
  @page {
    /* Set roll width to 80mm with dynamic height */
    size: 80mm auto;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
    width: 80mm;
  }
}
```

---

## 4. Frequently Asked Questions (FAQ)

### Which printer does Chrome target when running in kiosk mode?
**`--kiosk-printing` always routes print jobs to the operating system's designated default printer.** To re-route output, you must adjust default printer assignments in Windows Settings or macOS System Settings.

### Can users escape full-screen `--kiosk` mode?
**Standard keyboard shortcuts like F11 and Escape are blocked.** Users can only exit via administrative shortcuts (`Alt + F4` on Windows or `Cmd + Q` on macOS). When combined with Windows Assigned Access (Kiosk Account), cashiers are locked into the POS application exclusively.

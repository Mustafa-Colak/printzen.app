---
title: "Thermal Printer Auto-Cutter and Cash Drawer Kick Commands (ESC/POS)"
description: "Master ESC/POS commands for full cut, partial cut, and firing 24V RJ11/RJ12 cash drawer solenoids. Complete hexadecimal reference and JavaScript code."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: thermal-printer-paper-cut-cash-drawer-commands
---

In retail checkout and food service point-of-sale systems, completing a transaction triggers two distinct physical hardware actions: **cutting the receipt paper (Auto-Cutter)** and **popping open the cash drawer (Drawer Kick)**.

Both physical actions are triggered by concise **ESC/POS byte commands** sent directly to the printer's onboard firmware controller.

---

## 1. Auto-Cutter Commands (`GS V`)

In the Epson ESC/POS specification, the cutting mechanism is controlled via `GS V` (`0x1D 0x56`). Two cut geometries are supported:
1. **Full Cut:** Slices through the roll entirely, dropping the receipt into the output hopper.
2. **Partial Cut:** Leaves a tiny 1–2 mm bridge of paper uncut at the center or edge. This keeps the receipt attached to the roll so it doesn't blow away, allowing staff to tear it away cleanly.

### Command Matrix:
| Cut Mode | ESC/POS Command | Hexadecimal Sequence | Functional Behavior |
|---|---|---|---|
| **Full Cut (Feed & Cut)** | `GS V 65 0` | `1D 56 41 00` | Feeds paper past knife and executes full cut. |
| **Partial Cut (Feed & Cut)** | `GS V 66 0` | `1D 56 42 00` | Feeds paper past knife and leaves 1 bridge point. |
| **Direct Cut (No Feed)** | `GS V 1` | `1D 56 01` | Slices immediately without paper advance. |

> ⚠️ **Critical Rule:** Always prepend cutting commands with 3 blank line feeds (`0x0A 0x0A 0x0A` or `ESC d 3`). The thermal printhead sits approximately 15–20 mm below the physical cutter blade; failing to feed paper will slice through the last line of text.

```javascript
export function generateCutSequence(isPartial = true): Uint8Array {
  return new Uint8Array([
    0x1B, 0x64, 0x03,       // ESC d 3 (advance 3 lines past cutter)
    0x1D, 0x56, isPartial ? 0x42 : 0x41, 0x00 // GS V 66 0 / 65 0
  ]);
}
```

---

## 2. Cash Drawer Kick Command (`ESC p`)

Thermal receipt printers feature a standard 6-pin **RJ11 / RJ12 modular jack** on the rear I/O panel. This port is wired to the 24V (or 12V) solenoid coil inside the under-counter cash drawer.

Transmitting the `ESC p` command sends an electrical pulse to the solenoid, momentarily pulling the latch and releasing the spring-loaded drawer.

$$\text{ESC } p \text{ } m \text{ } t1 \text{ } t2 \quad \longrightarrow \quad \text{Hex: } \texttt{0x1B 0x70 [m] [t1] [t2]}$$

- `$m$`: Connector pin (`0`: Pin 2, `1`: Pin 5). Default is `0`.
- `$t1$`: Pulse ON duration ($t1 \times 2\text{ ms}$). E.g., `25` ($25 \times 2 = 50\text{ ms}$).
- `$t2$`: Pulse OFF duration ($t2 \times 2\text{ ms}$). E.g., `250` ($250 \times 2 = 500\text{ ms}$).

### Standard Cash Drawer Kick (TypeScript):
```typescript
export function openCashDrawer(): Uint8Array {
  // ESC p 0 25 250 -> 50ms pulse on Pin 2
  return new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
}
```

---

## 3. Frequently Asked Questions (FAQ)

### Can I pop open the cash drawer from a web POS without wasting paper?
**Yes, by transmitting only the 5-byte sequence `0x1B 0x70 0x00 0x19 0xFA` over your transport socket without any preceding text or line feeds.** The solenoid trips and opens the till immediately without advancing or cutting the paper roll.

### The printer jammed mid-cut and the red error light is flashing. How do I fix it?
**This is a mechanical cutter jam.** Never pry the cover open with tools. Unclip the small maintenance cover on the front casing to reveal the manual gear wheel (thumbwheel). Rotate the wheel with your finger until the knife retracts fully into its home housing, then pop open the main cover.

### I hear a click when sending the drawer command, but the drawer doesn't open?
**Check the manual key lock on the front of the cash drawer.** If the cylinder lock is turned horizontally to manual lock, the solenoid cannot overpower the bolt. Also verify voltage compatibility: a 24V commercial drawer will not trigger reliably if connected to a low-voltage 12V portable printer.

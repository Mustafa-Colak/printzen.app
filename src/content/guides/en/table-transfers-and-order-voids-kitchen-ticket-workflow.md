---
title: "Handling Table Transfers and Order Voids on Kitchen Receipt Printers"
description: "Prevent food waste and service chaos. Master real-time ticket workflows for table transfers, course cancellations, and inverse-text order void notifications."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: table-transfers-and-order-voids-kitchen-ticket-workflow
---

In restaurant dining rooms, amendments made after initial order entry create high risk for food waste and misdirected delivery. A customer cancels an entree, but without immediate notification to the line cook, the steak gets grilled and discarded. Alternatively, a party moves from Patio 4 to Table 12, but food runners deliver steaming plates to an empty table outside.

Mitigating these errors requires automated, high-visibility **Void and Transfer Tickets** dispatched to prep stations the instant an amendment is finalized.

---

## 1. Item Void Ticket Architecture

When an item is voided, the ticket must look drastically different from normal preparation orders:
- **Inverse Black-on-White Header (`GS B 1`):** A thick, high-contrast banner reading `*** ITEM VOID / CANCELLED ***`.
- **Reason Stamp:** "Customer departure", "Allergy change", or "Server error".
- **Auditory Alert:** Two acoustic buzzer pulses to prompt immediate cessation of prep.

```
================================================
          >>> ITEM VOID / CANCELLED <<<         
TABLE: 08                TIME: 20:45            
SERVER: Michael          VOID ID: #V-412        
------------------------------------------------
[CANCELLED ITEM:]                               
1x Dry-Aged Ribeye Steak                        
* Warning: HALT PREPARATION IMMEDIATELY!        
------------------------------------------------
Reason: Guest departed early.                   
================================================
[2X ACOUSTIC BUZZER PULSE]
```

---

## 2. Table Transfer Ticket Layout

```
================================================
          >>> TABLE TRANSFER NOTICE <<<         
PREVIOUS TABLE: Patio 04                        
NEW DESTINATION: Main Dining 12                 
------------------------------------------------
Server: Sarah            Time: 21:05            
Order Ref: #84912                               
------------------------------------------------
Deliver all pending courses to Table 12.        
================================================
```

---

## 3. Frequently Asked Questions (FAQ)

### Can void tickets print in red ink on two-color kitchen printers?
**Yes. On ribbon impact printers (like the Epson TM-U220), switch to the red ribbon band using `0x1B 0x72 0x01` (ESC r 1).** Printing cancelled items in vivid red makes it physically impossible for line cooks to mistake a void ticket for a new order. Switch back to black using `0x1B 0x72 0x00` (ESC r 0).

### What happens if two tables merge their tabs?
**The POS issues an automated "Table Merge" ticket to both the Kitchen and Expediter stations.** This updates food runners that dishes originally slated for Table 5 and Table 6 should be served together at Table 5.

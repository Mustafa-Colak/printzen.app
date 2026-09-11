---
title: "Electronic Invoice and Tax Receipt Thermal Formatting Guide"
description: "Format e-invoice and tax receipt data for thermal printers. Includes mandatory tax fields, QR code generation, VAT calculation layout, and legal compliance requirements."
printerClass: "desktop"
brand: "Epson / Bixolon"
publishDate: 2026-09-11
translationKey: "gib-earsiv-fatura-bilgi-fisi-termal-formatlama"
topicCluster: "hub-15"
---

Printing legally compliant tax receipts on thermal printers requires including all mandatory fiscal fields. This guide covers the full formatting pipeline from order data to a compliant printed receipt.

## Mandatory Tax Fields

| Field | Example |
|-------|---------|
| Business name | OLYMPUS CAFE LTD |
| Tax ID / VAT No | GB123456789 |
| Date & time | 11/09/2026 14:35 |
| Receipt / invoice number | 2026-000123 |
| VAT rate & amount | VAT (20%): £1.83 |
| Total amount | £10.99 |
| QR verification code | Fiscal authority URL |

## Receipt Builder

```javascript
function buildTaxReceipt(order) {
  const ESC = 0x1B, GS = 0x1D, LF = 0x0A;
  const enc = new TextEncoder();
  const cols = 42;

  function padRow(left, right) {
    return left + ' '.repeat(Math.max(1, cols - left.length - right.length)) + right + '
';
  }

  const cmds = [
    ESC, 0x40,
    ESC, 0x61, 0x01,
    ESC, 0x21, 0x10,
    ...enc.encode(order.businessName + '
'),
    ESC, 0x21, 0x00,
    ...enc.encode('VAT No: ' + order.vatNo + '
'),
    ...enc.encode('-'.repeat(cols) + '
'),
    ESC, 0x61, 0x00,
    ...enc.encode('Receipt: ' + order.receiptNo + '
'),
    ...enc.encode('Date: ' + new Date().toLocaleString() + '
'),
    ...enc.encode('-'.repeat(cols) + '
'),
  ];

  for (const item of order.items) {
    cmds.push(...enc.encode(padRow(item.name + ' x' + item.qty, '£' + (item.price * item.qty).toFixed(2))));
  }

  const vatBase = (order.total / 1.20).toFixed(2);
  const vatAmount = (order.total - parseFloat(vatBase)).toFixed(2);

  cmds.push(
    ...enc.encode('-'.repeat(cols) + '
'),
    ...enc.encode(padRow('Subtotal (ex VAT)', '£' + vatBase)),
    ...enc.encode(padRow('VAT (20%)', '£' + vatAmount)),
    ...enc.encode('-'.repeat(cols) + '
'),
    ESC, 0x45, 0x01,
    ...enc.encode(padRow('TOTAL', '£' + order.total.toFixed(2))),
    ESC, 0x45, 0x00,
    LF, LF, LF,
    GS, 0x56, 0x41, 0x03
  );

  return cmds;
}
```

## FAQ

**Is a thermal receipt legally valid?**
Yes, provided all mandatory fiscal fields are present. Check local tax authority requirements.

**Multiple VAT rates?**
Each rate must appear on a separate line with its own base and amount.

**QR code format?**
Use the ESC/POS GS ( k QR code command sequence with your fiscal authority's verification URL.
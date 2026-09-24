---
title: "Shopify and Cloud E-Commerce Automatic Receipt Printing Integration"
description: "Automatically print receipts on a thermal printer when Shopify orders arrive. Set up order webhooks, verify HMAC signatures, and build a print handler with Node.js and Express."
printerClass: "desktop"
brand: "Epson / Xprinter"
publishDate: 2026-09-11
translationKey: "shopify-bulut-eticaret-fis-entegrasyonu"
topicCluster: "hub-14"
---

Automatically printing receipts when orders arrive in your Shopify store requires just the Shopify webhook system and a Printzen integration. This guide gets you up and running in 30 minutes.

## Architecture

```
Shopify → [orders/create webhook] → Print Handler → Thermal Printer
```

## Register the Webhook

```javascript
const response = await fetch(`https://${shop}.myshopify.com/admin/api/2024-01/webhooks.json`, {
  method: 'POST',
  headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    webhook: { topic: 'orders/create', address: 'https://your-server.com/webhook/order', format: 'json' }
  })
});
```

## Verify Webhook Signature

```javascript
import crypto from 'crypto';
import express from 'express';

const app = express();
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook/order', async (req, res) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const hash = crypto.createHmac('sha256', process.env.SHOPIFY_SECRET).update(req.body).digest('base64');
  if (hash !== hmac) return res.status(401).send('Unauthorized');

  const order = JSON.parse(req.body);
  await printOrder(order);
  res.status(200).send('OK');
});
```

## Build the Receipt

```javascript
async function printOrder(order) {
  const ESC = 0x1B, GS = 0x1D, LF = 0x0A;
  const enc = new TextEncoder();
  const cmds = [
    ESC, 0x40,
    ESC, 0x61, 0x01,
    ...enc.encode(`ORDER #${order.order_number}
`),
    ...enc.encode('----------------------------
'),
  ];
  for (const item of order.line_items) {
    cmds.push(...enc.encode(`${item.name.substring(0,16).padEnd(16)} x${item.quantity}  ${item.price}
`));
  }
  cmds.push(
    ESC, 0x45, 0x01,
    ...enc.encode(`TOTAL: ${order.total_price}
`),
    ESC, 0x45, 0x00,
    LF, LF, LF,
    GS, 0x56, 0x41, 0x03
  );
  await printer.send(cmds);
}
```

## Development with ngrok

```bash
npx ngrok http 3000
# Use generated URL: https://abc123.ngrok.io/webhook/order
```

## FAQ

**What if a webhook is missed?**
Shopify retries failed webhooks for 48 hours. Make your handler idempotent — check order_id before printing to avoid duplicates.

**How do I test without real orders?**
Shopify Admin → Orders → Create order → Send test webhook.

**Multiple printers (kitchen + cashier)?**
Route by product category in `order.line_items`.

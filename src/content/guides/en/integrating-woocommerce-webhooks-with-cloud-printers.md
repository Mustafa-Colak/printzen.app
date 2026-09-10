---
title: "Integrating WooCommerce Webhooks with Cloud Thermal Printers"
description: "Zero-code automated printing. Connect WooCommerce native webhooks to Printzen Cloud Print. Learn JSON payload structures and HMAC-SHA256 signature verification."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: integrating-woocommerce-webhooks-with-cloud-printers
---

If you prefer to avoid editing PHP files or modifying theme code, the cleanest architecture for automated fulfillment printing is leveraging **WooCommerce Native Webhooks**.

Configured directly inside the WordPress dashboard, webhooks dispatch asynchronous HTTP POST events to cloud printing endpoints the moment an order is created or updated.

---

## 1. Dashboard Webhook Configuration

1. Navigate to **WooCommerce > Settings > Advanced > Webhooks**.
2. Click **Add webhook** and complete the form:
   - **Name:** `Printzen Automated Print Dispatch`
   - **Status:** `Active`
   - **Topic:** `Order created` or `Order updated`
   - **Delivery URL:** `https://api.printzen.app/v1/webhooks/woocommerce`
   - **Secret:** Your Printzen Webhook Secret Key
   - **API Version:** `WP REST API Integration v3`
3. Click **Save webhook**.

---

## 2. Inbound HMAC-SHA256 Signature Verification

To authenticate that incoming webhook payloads originate authentically from your WooCommerce installation:

```javascript
import crypto from 'crypto';

export function verifyWooCommerceSignature(rawPayloadString, incomingSignature, secretToken) {
  const hash = crypto
    .createHmac('sha256', secretToken)
    .update(rawPayloadString, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(incomingSignature),
    Buffer.from(hash)
  );
}
```

---

## 3. Frequently Asked Questions (FAQ)

### What is the advantage of Webhooks over custom PHP functions?
**Webhooks require zero code deployments and survive theme updates.** Because configuration lives in the WordPress database rather than theme files, updating your store's theme or child template will never break the printing pipeline.

### Can we trigger thermal shipping labels when an order is marked "Completed"?
**Yes. Listen for `Order updated` events and inspect the `status` field.** When status changes to `completed` or `shipped`, your cloud print service can immediately dispatch a 4x6 inch ZPL shipping label to your warehouse Zebra printer.

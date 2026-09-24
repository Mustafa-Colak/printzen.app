---
title: "Shopify ve Bulut E-Ticaret Platformları için Termal Fiş Entegrasyonu"
description: "Shopify Order webhook, Printzen API ve termal yazıcı entegrasyonuyla yeni sipariş düşünce otomatik fiş basma. Node.js, Express ve ngrok ile geliştirme ortamı kurulumu."
printerClass: "desktop"
brand: "Epson / Xprinter"
publishDate: 2026-09-11
translationKey: "shopify-bulut-eticaret-fis-entegrasyonu"
topicCluster: "hub-14"
---

Shopify mağazanıza gelen siparişlerin otomatik olarak kasadaki termal yazıcıya düşmesi için Shopify webhook sistemi ile Printzen entegrasyonunu kurmanız yeterlidir. Bu rehber, sıfırdan çalışan bir sistemi 30 dakikada kurmanızı sağlar.

## Genel Mimari

```
Shopify → [orders/create webhook] → Printzen Webhook Handler → Termal Yazıcı
```

## Shopify Webhook Kurulumu

Shopify Partner Dashboard veya Admin API üzerinden:

```javascript
// Shopify Admin API ile webhook kaydetme
const response = await fetch(`https://${shop}.myshopify.com/admin/api/2024-01/webhooks.json`, {
  method: 'POST',
  headers: {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    webhook: {
      topic: 'orders/create',
      address: 'https://your-server.com/webhook/shopify/order',
      format: 'json'
    }
  })
});
```

## Webhook İmza Doğrulama

Shopify tüm webhook'lara `X-Shopify-Hmac-Sha256` başlığı ekler:

```javascript
import crypto from 'crypto';
import express from 'express';

const app = express();

// RAW body gerekli (imza kontrolü için)
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook/shopify/order', async (req, res) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body;
  
  // İmzayı doğrula
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(body)
    .digest('base64');
  
  if (hash !== hmac) {
    return res.status(401).send('Unauthorized');
  }
  
  const order = JSON.parse(body);
  await printOrder(order);
  res.status(200).send('OK');
});
```

## Sipariş Fişi Oluşturma

```javascript
async function printOrder(order) {
  const lines = [];
  
  // Başlık
  lines.push({ type: 'header', text: 'SİPARİŞ #' + order.order_number });
  lines.push({ type: 'divider' });
  
  // Müşteri
  lines.push({ type: 'text', text: order.shipping_address?.name || 'Misafir' });
  lines.push({ type: 'text', text: new Date(order.created_at).toLocaleString('tr-TR') });
  lines.push({ type: 'divider' });
  
  // Ürünler
  for (const item of order.line_items) {
    lines.push({
      type: 'row',
      left: `${item.name} x${item.quantity}`,
      right: `${(item.price * item.quantity)} TL`
    });
  }
  
  // Kargo
  if (order.shipping_lines?.length > 0) {
    lines.push({
      type: 'row',
      left: 'Kargo',
      right: order.total_shipping_price_set.shop_money.amount + ' TL'
    });
  }
  
  lines.push({ type: 'divider' });
  lines.push({ type: 'total', text: 'TOPLAM: ' + order.total_price + ' TL' });
  lines.push({ type: 'cut' });
  
  await printzen.print({ lines });
}
```

## Geliştirme Ortamı (ngrok)

Shopify webhook'u localhost'a göndermek için:

```bash
# ngrok kur ve başlat
npx ngrok http 3000

# Oluşan URL'i Shopify webhook adresi olarak kullan:
# https://abc123.ngrok.io/webhook/shopify/order
```

## Shopify App Extension ile POS Entegrasyonu

Shopify POS kullanıyorsanız App Extension ile doğrudan fiş butonu eklenebilir:

```javascript
// shopify.extension.toml
[[extensions]]
type = "pos_ui_extension"
name = "Printzen Receipt"
handle = "printzen-receipt"

// Düğme tanımı
import { Button, useCartState } from '@shopify/retail-ui-extensions-react';

export default function App() {
  const cart = useCartState();
  return (
    <Button
      title="Fiş Bas"
      onPress={() => printCart(cart)}
    />
  );
}
```

## Sık Sorulan Sorular

### Webhook kaçırılırsa sipariş kaybolur mu?
Hayır. Shopify başarısız webhook'ları 48 saat boyunca yeniden dener. Sunucu tarafında idempotent işlem yapın (aynı order_id iki kez basılmasın).

### Test siparişi nasıl oluşturulur?
Shopify Admin > Orders > Create order > Send test webhook ile test edilebilir.

### Çoklu yazıcı (mutfak + kasa) nasıl yönetilir?
`order.line_items` içindeki ürün kategorisine göre hangi yazıcıya gönderileceğini belirleyebilirsiniz.

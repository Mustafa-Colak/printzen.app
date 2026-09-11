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

## Desteklenen Cihazlar

Bu rehberdeki adımlar, ilgili protokolü/arayüzü destekleyen aşağıdaki yazıcı modellerinin tamamı için geçerlidir:

| Marka | Model | Protokol | Arayüzler | Kağıt Genişliği |
|---|---|---|---|---|
| Bixolon | SLP-TX400 | SLCS / BPL-Z | USB, Ethernet, Seri | 104mm |
| Bixolon | SPP-R200III | ESC/POS / CPCL | Bluetooth, Wi-Fi, USB | 58mm |
| Bixolon | SPP-R310 | ESC/POS / CPCL | Bluetooth BLE, USB | 80mm |
| Bixolon | SRP-330II | ESC/POS | USB, Ethernet | 80mm |
| Bixolon | SRP-350III | ESC/POS | USB, Ethernet, Seri | 80mm |
| Bixolon | SRP-Q300 | ESC/POS | Bluetooth, Wi-Fi, USB, Ethernet | 80mm |
| Epson | TM-L90 | ESC/POS | USB, Ethernet | 80mm |
| Epson | TM-m30II | ESC/POS | Bluetooth, Wi-Fi, USB, Ethernet | 80mm / 58mm |
| Epson | TM-P20II | ESC/POS | Bluetooth 5.0, Wi-Fi | 58mm |
| Epson | TM-P80II | ESC/POS | Bluetooth, Wi-Fi | 80mm |
| Epson | TM-T20III | ESC/POS | USB, Ethernet, Seri | 80mm / 58mm |
| Epson | TM-T88VI | ESC/POS | USB, Ethernet, Bluetooth, Wi-Fi | 80mm / 58mm |
| Epson | TM-T88VII | ESC/POS | USB, Ethernet, Wi-Fi | 80mm |
| Godex | DT4x | EZPL | USB, Ethernet, Seri | 108mm |
| Godex | G500 | EZPL / GEPL / GZPL | USB, Ethernet, Seri | 108mm |
| Godex | RT700 | EZPL | USB, Ethernet | 108mm |
| Honeywell | PC42d | ZSim / ESim | USB | 104mm |
| Honeywell | PC42t | Direct Protocol / ZSim / ESim | USB, Ethernet, Seri | 104mm |
| Rongta | RP326 | ESC/POS | USB, Ethernet, Seri | 80mm |
| Rongta | RP410 | TSPL / ESC/POS | USB | 108mm |
| Rongta | RP80 | ESC/POS | USB, Ethernet | 80mm |
| Rongta | RPP02N | ESC/POS | Bluetooth, USB | 58mm |
| Seiko | MP-B30L | ESC/POS / SII SDK | Bluetooth, USB | 80mm |
| Seiko | RP-D10 | ESC/POS | USB, Ethernet, Bluetooth | 80mm |
| Star Micronics | mC-Print3 | StarPRNT | CloudPRNT, Bluetooth, Ethernet, USB | 80mm |
| Star Micronics | SM-L200 | Star Line | Bluetooth 4.0 BLE, USB | 58mm |
| Star Micronics | SM-T300i | Star Line / ESC/POS | Bluetooth (MFi), Seri | 80mm |
| Star Micronics | TSP143III | StarPRNT / ESC/POS | Ethernet, Wi-Fi, USB, Lightning | 80mm |
| Star Micronics | TSP654II | Star Line / ESC/POS | Bluetooth, Ethernet, USB | 80mm |
| Sunmi | V2 Pro | ESC/POS (Sunmi InnerPrinter) | Dahili Donanım, Bluetooth | 58mm |
| TSC | Alpha-3R | TSPL / CPCL / ESC/POS | Bluetooth, USB | 72mm (3 inç) |
| TSC | DA210 | TSPL-EZD | USB | 108mm |
| TSC | DA220 | TSPL-EZD | USB, Ethernet, Bluetooth, Wi-Fi | 108mm |
| TSC | TE200 | TSPL-EZ | USB 2.0 | 108mm |
| TSC | TTP-244 Pro | TSPL | USB, Seri | 108mm |
| Xprinter | XP-365B | TSPL / ESC/POS | USB | 80mm |
| Xprinter | XP-420B | TSPL / ESC/POS | USB, Bluetooth, Ethernet | 108mm (100x150) |
| Xprinter | XP-470B | TSPL | USB | 108mm |
| Xprinter | XP-58IIH | ESC/POS | USB, Bluetooth | 58mm |
| Xprinter | XP-N160II | ESC/POS | USB, Ethernet | 80mm |
| Xprinter | XP-P300 | ESC/POS | Bluetooth, USB | 58mm |
| Xprinter | XP-Q800 | ESC/POS | USB, Ethernet, Seri | 80mm |
| Zebra | GK420d | ZPL II / EPL2 | USB, Ethernet, Seri | 104mm |
| Zebra | GK420t | ZPL II / EPL2 | USB, Ethernet | 104mm |
| Zebra | ZD220 | ZPL II / EPL | USB | 104mm (4 inç) |
| Zebra | ZD420 | ZPL II / EPL | USB, Ethernet, Bluetooth, Wi-Fi | 104mm |
| Zebra | ZD421 | ZPL II / EPL | USB, Ethernet, Bluetooth BLE | 104mm |
| Zebra | ZQ320 Plus | CPCL / ZPL | Bluetooth BLE, Wi-Fi | 80mm (3 inç) |
| Zebra | ZQ520 | CPCL / ZPL | Bluetooth, Wi-Fi | 104mm (4 inç) |
| Zebra | ZT411 | ZPL II | Ethernet, USB, Bluetooth 4.1 | 104mm |


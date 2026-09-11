---
title: "Automating WooCommerce Thermal Receipts and Shipping Labels: Cloud Printing Architecture"
description: "Trigger automatic 80mm ESC/POS packing slips and 4x6 inch ZPL shipping labels the moment a new WooCommerce order enters processing status. Zero manual clicks."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: woocommerce-automatic-thermal-receipt-shipping-label-printing
---

In modern e-commerce and retail fulfillment, fulfillment velocity and picking accuracy dictate customer satisfaction. In stores processing dozens or hundreds of orders daily, having warehouse personnel manually log in to the WordPress dashboard, locate individual orders, generate PDF invoices, and trigger browser print dialogs creates severe operational bottlenecks.

The industry-standard solution is **Zero-Touch Automated Fulfillment Printing**: The instant a customer completes checkout and the WooCommerce order transitions to `processing`, warehouse thermal receipt printers automatically generate itemized pick lists while adjacent barcode label printers generate carrier shipping labels.

In this comprehensive guide, we cover WooCommerce Webhook triggers, WordPress action hooks (`woocommerce_order_status_processing`), 80mm ESC/POS layout formatting, and 4x6 inch (100x150 mm) ZPL logistics label generation.

---

## 1. WooCommerce Order Fulfillment Architecture

Converting an e-commerce order into physical paper output operates through three architectural patterns:

```
[ Customer Places Order ] ──► [ WooCommerce Backend ]
                                       │
                   ┌───────────────────┴───────────────────┐
                   ▼                                       ▼
       [ Webhook Dispatch ]                      [ REST API Polling ]
                   │                                       │
                   ▼                                       ▼
        [ Printzen Cloud Hub ]                   [ On-Premises Service ]
                   │                                       │
                   ▼                                       ▼
       [ Warehouse Receipt ]                    [ Shipping Label Printer ]
        (80mm Packing Slip)                      (4x6" ZPL Barcode)
```

1. **WooCommerce Webhook:** Fires an asynchronous JSON payload to your printing endpoint on events like `order.created` or `order.updated`.
2. **REST API Polling:** A local client application polls the WooCommerce REST API (`/wp-json/wc/v3/orders`) on a recurring interval (e.g., every 30 seconds).
3. **WordPress Action Hook:** Custom PHP inside `functions.php` or a dedicated mu-plugin listening directly to order status changes and posting payloads to cloud print servers.

---

## 2. Capturing Orders in Real-Time via WordPress Hooks

The most deterministic trigger for paid orders is the `woocommerce_order_status_processing` action hook. The following PHP script extracts line items, customer details, and shipping metadata, dispatching the payload to the Printzen Cloud Print API:

```php
<?php
// Add to your child theme functions.php or custom plugin:

add_action('woocommerce_order_status_processing', 'printzen_dispatch_auto_print', 10, 1);

function printzen_dispatch_auto_print($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) return;

    $order_payload = [
        'order_id'       => $order->get_id(),
        'order_number'   => $order->get_order_number(),
        'created_at'     => $order->get_date_created()->date('Y-m-d H:i'),
        'customer_name'  => $order->get_formatted_billing_full_name(),
        'phone'          => $order->get_billing_phone(),
        'shipping_addr'  => $order->get_formatted_shipping_address(),
        'payment_method' => $order->get_payment_method_title(),
        'total'          => $order->get_total(),
        'currency'       => $order->get_currency(),
        'line_items'     => []
    ];

    foreach ($order->get_items() as $item_id => $item) {
        $product = $item->get_product();
        $order_payload['line_items'][] = [
            'name'     => $item->get_name(),
            'sku'      => $product ? $product->get_sku() : 'N/A',
            'quantity' => $item->get_quantity(),
            'subtotal' => $item->get_subtotal()
        ];
    }

    // Dispatch to Printzen Cloud Print Hub
    $endpoint = 'https://api.printzen.app/v1/print/order';
    $api_key  = defined('PRINTZEN_API_KEY') ? PRINTZEN_API_KEY : get_option('printzen_api_key');
    if (!$api_key) {
        return;
    }

    wp_remote_post($endpoint, [
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type'  => 'application/json'
        ],
        'body'    => wp_json_encode($order_payload),
        'timeout' => 15
    ]);
}
```

---

## 3. Designing 80mm ESC/POS Packing Slips

Thermal receipt media is physically bounded by fixed character columns. Standard 80mm paper accommodates **48 columns in Font A** (12x24 dots) and **64 columns in Font B** (9x17 dots).

### 48-Column Itemized Warehouse Pick List Example:
```
================================================
           PRINTZEN BOUTIQUE STORE              
               Order: #84920                    
Date: 2026-09-10 15:42     Payment: Credit Card 
------------------------------------------------
Customer: Johnathan Miller                      
Phone: +1 (555) 019-2834                        
Address: 742 Evergreen Terrace, Springfield, OR 
------------------------------------------------
ITEM DESCRIPTION               QTY        PRICE 
------------------------------------------------
Oversize Heavyweight Tee (L)     2       $54.00 
Slim Fit Selvedge Denim (32)     1       $85.00 
Full Grain Leather Wallet        1       $35.00 
------------------------------------------------
Subtotal:                               $174.00 
Shipping (Expedited Air):                 $0.00 
Tax (8.5% Included):                     $14.79 
TOTAL:                                  $174.00 
================================================
          WAREHOUSE PICK & PACK SLIP            
   Verify item SKU and count prior to seal.     
[QR CODE / ORDER DISPATCH LINK]
```

---

## 4. Automatic 4 × 6 Inch (100 × 150 mm) Shipping Label Generation

Once items are packed, warehouse staff can immediately apply the carrier barcode shipping label generated for the same order without accessing carrier web dashboards:

```zpl
^XA
^PW812^LL1218
^FO50,50^A0N,36,36^FDWOOCOMMERCE SHIPMENT DISPATCH^FS
^FO50,95^GB712,3,3^FS

^FO50,120^A0N,24,24^FDOrder ID: #84920^FS
^FO450,120^A0N,24,24^FDDate: 2026-09-10^FS

^FO50,160^A0N,28,28^FDShip To: Johnathan Miller^FS
^FO50,200^A0N,22,22^FD742 Evergreen Terrace, Springfield, OR^FS
^FO50,230^A0N,22,22^FDPhone: +1 (555) 019-2834^FS
^FO50,265^GB712,2,2^FS

^FX Tracking Barcode
^FO100,310^BY3,2.5,120^BCN,120,Y,N,N^FDWC-84920-USA^FS

^FX Packing Summary
^FO50,480^GB712,180,2^FS
^FO70,505^A0N,22,22^FDContents: 3 Apparel Items^FS
^FO70,540^A0N,22,22^FDWeight / Dim: 1.45 KG / 3.2 LBS^FS
^FO70,575^A0N,22,22^FDPayment: Prepaid (Stripe Online)^FS
^FO50,680^GB712,3,3^FS
^XZ
```

---

## 5. Routing by Product Category: Kitchen, Bar, and Packing Stations

For ghost kitchens, bakeries, or multi-department fulfillment operations running on WooCommerce, single orders often contain items that must be routed to disparate physical stations:

- **Kitchen / Cold Prep:** Receives only lines categorized as food.
- **Bar / Drink Station:** Receives only lines categorized as beverages.
- **Cashier / Expediter:** Receives the consolidated customer receipt.

This is cleanly implemented in PHP by evaluating `$item->get_product()->get_category_ids()` and appending target routing tags (`station: 'kitchen'`, `station: 'bar'`) to the JSON payload.

---

## 6. Frequently Asked Questions (FAQ)

### Can orders print automatically late at night when all warehouse computers are shut down?
**Yes, when leveraging Printzen Cloud Print, no local host computer needs to remain active.** Order payloads are dispatched directly to the cloud. Network-connected thermal printers (via LAN, Wi-Fi, or the Printzen IoT bridge adapter) maintain a lightweight outbound socket to the cloud hub, printing incoming jobs 24/7 autonomously.

### How do I trigger printing when an order is cancelled or refunded?
**You can register handlers for the `woocommerce_order_status_cancelled` and `woocommerce_order_status_refunded` WordPress hooks.** This enables you to print a high-priority "ORDER CANCELLED" alert directly to kitchen or packing stations to immediately halt fulfillment and prevent inventory waste.

### How do I add my custom logo to the thermal packing slip?
**Thermal printers process graphic assets as 1-bit monochrome bitmaps.** When you upload your PNG logo to the Printzen administration console, it is automatically transcoded into optimized ESC/POS raster byte sequences (`GS v 0`) and prepended to your receipt template header.

### Are carrier formats like FedEx, UPS, DHL, or regional couriers supported?
**Yes, major carrier shipping APIs provide label data as 4x6 inch ZPL or raw thermal streams.** Printzen ingests carrier tracking identifiers and renders compliant Code 128 / PDF417 barcodes directly onto your Zebra, TSC, or Xprinter industrial label units.

## Supported Devices

The steps in this guide apply to all of the following printer models that support the relevant protocol/interface:

| Brand | Model | Protocol | Interfaces | Paper Width |
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

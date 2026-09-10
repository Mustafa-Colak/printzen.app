---
title: "Triggering Automatic Receipts on New WooCommerce Orders via PHP Hooks"
description: "Eliminate manual print clicks in WooCommerce. Automatically trigger thermal pick lists and packing slips the moment an order transitions to processing."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: woocommerce-trigger-automatic-receipt-new-order
---

Manually refreshing the WordPress admin panel to locate new orders, generate PDFs, and trigger browser print dialogs wastes time and causes dispatch delays in busy stores.

The robust pattern is registering a deterministic server-side action hook that dispatches an automated print job the moment payment is verified and the order transitions to **Processing**.

---

## 1. Registering the `woocommerce_order_status_processing` Action

Add the following production PHP snippet to your child theme's `functions.php` or a dedicated mu-plugin:

```php
add_action('woocommerce_order_status_processing', 'printzen_auto_print_on_payment', 10, 1);

function printzen_auto_print_on_payment($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) return;

    $payload = [
        'order_id'     => $order->get_id(),
        'order_number' => $order->get_order_number(),
        'customer'     => $order->get_formatted_billing_full_name(),
        'phone'        => $order->get_billing_phone(),
        'total'        => $order->get_total(),
        'items'        => []
    ];

    foreach ($order->get_items() as $item) {
        $payload['items'][] = [
            'name'     => $item->get_name(),
            'qty'      => $item->get_quantity(),
            'subtotal' => $item->get_subtotal()
        ];
    }

    // Post asynchronously to Printzen Cloud API
    wp_remote_post('https://api.printzen.app/v1/print/order', [
        'headers' => [
            'Authorization' => 'Bearer PRZ_LIVE_KEY_HERE',
            'Content-Type'  => 'application/json'
        ],
        'body'    => wp_json_encode($payload),
        'timeout' => 4 // Short timeout prevents cart blocking
    ]);
}
```

---

## 2. Supporting Cash on Delivery (COD) and Manual Invoices

For orders placed via bank wire or Cash on Delivery where status initializes as `on-hold`:

```php
add_action('woocommerce_order_status_on-hold', 'printzen_auto_print_on_payment', 10, 1);
```

---

## 3. Frequently Asked Questions (FAQ)

### Will dispatching an outbound API call slow down the customer's checkout experience?
**No, by applying a tight HTTP timeout (`timeout => 4`) or offloading the dispatch to the WooCommerce Action Scheduler background queue.** The customer lands on the "Thank You" order confirmation page instantaneously while fulfillment tickets print in the warehouse.

### What happens if the physical receipt printer is powered off when an order arrives?
**Printzen's cloud spooler maintains persistent queuing.** Outbound jobs remain securely buffered in the cloud until the local printer reconnects, flushing queued orders immediately without data loss.

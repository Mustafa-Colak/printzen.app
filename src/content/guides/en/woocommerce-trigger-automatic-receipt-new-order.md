---
title: "Asynchronous Non-Blocking Receipt Printing in WooCommerce via Action Scheduler"
description: "Eliminate checkout latency. Learn how to trigger automatic thermal receipt printing asynchronously using WooCommerce Action Scheduler background queues."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: woocommerce-trigger-automatic-receipt-new-order
---

As store volume scales, dispatching direct synchronous HTTP requests to thermal printers during the checkout transition introduces severe performance bottlenecks. To ensure zero cart abandonment and prevent payment gateway webhook timeouts (Stripe, PayPal, Adyen), order printing must always be handled via an **asynchronous, non-blocking queue**.

In this guide, we examine how to configure WooCommerce's built-in background engine—**Action Scheduler**—for instant fulfillment printing. For packaging slip design and carrier routing, consult our flagship [WooCommerce Automatic Thermal Receipt & Shipping Label Printing Guide](/guides/woocommerce-automatic-thermal-receipt-shipping-label-printing).

---

## 1. The Dangers of Synchronous `wp_remote_post`

A common developer anti-pattern is attaching synchronous HTTP calls directly to the order processing hook:

```php
// ❌ ANTI-PATTERN: Synchronous calls freeze the checkout flow!
add_action('woocommerce_order_status_processing', function($order_id) {
    wp_remote_post('https://api.printzen.app/v1/print/order', [
        'body'    => json_encode(['order_id' => $order_id]),
        'timeout' => 5 // ⚠️ This is NOT asynchronous! It blocks the PHP thread for up to 5 seconds.
    ]);
});
```

### Risks of Synchronous Dispatch:
1. **Checkout Latency:** If local printer connectivity fluctuates, the buyer's browser remains frozen on the payment spinner.
2. **Duplicate Transactions:** Frustrated customers frequently double-click or refresh while the thread hangs.
3. **Webhook Timeouts:** When payment gateways notify your server via webhooks, delayed 200 OK responses cause repetitive webhook retries.

---

## 2. Production Architecture: WooCommerce Action Scheduler

Integrated into WooCommerce core since version 3.5, **Action Scheduler** delivers high-throughput database-backed job queuing. Instead of holding up checkout, a background action is enqueued in under 5ms:

```php
<?php
/**
 * Step 1: Enqueue async printing job on order status transition
 */
add_action('woocommerce_order_status_processing', 'printzen_schedule_receipt_job', 10, 1);
add_action('woocommerce_order_status_completed', 'printzen_schedule_receipt_job', 10, 1);

function printzen_schedule_receipt_job($order_id) {
    if (function_exists('as_enqueue_async_action')) {
        as_enqueue_async_action(
            'printzen_async_print_receipt',
            ['order_id' => $order_id],
            'printzen-printing'
        );
    }
}

/**
 * Step 2: Background worker handler executing decoupled from the checkout thread
 */
add_action('printzen_async_print_receipt', 'printzen_execute_async_receipt', 10, 1);

function printzen_execute_async_receipt($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) {
        return;
    }

    // Secure credentials via wp-config.php constant or database option
    $api_key = defined('PRINTZEN_API_KEY') ? PRINTZEN_API_KEY : get_option('printzen_api_key');
    if (empty($api_key)) {
        error_log('[Printzen] API key missing. Order ID: ' . $order_id);
        return;
    }

    $payload = [
        'order_id'       => $order->get_id(),
        'order_number'   => $order->get_order_number(),
        'customer'       => $order->get_formatted_billing_full_name(),
        'phone'          => $order->get_billing_phone(),
        'payment_method' => $order->get_payment_method_title(),
        'total'          => (float) $order->get_total(),
        'currency'       => $order->get_currency(),
        'items'          => []
    ];

    foreach ($order->get_items() as $item) {
        $product = $item->get_product();
        $payload['items'][] = [
            'name'     => $item->get_name(),
            'sku'      => $product ? $product->get_sku() : '-',
            'quantity' => $item->get_quantity(),
            'subtotal' => (float) $item->get_subtotal()
        ];
    }

    // Dispatch to Printzen Cloud Print API
    $response = wp_remote_post('https://api.printzen.app/v1/print/order', [
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json'
        ],
        'body'        => wp_json_encode($payload),
        'timeout'     => 15,
        'data_format' => 'body'
    ]);

    if (is_wp_error($response)) {
        error_log('[Printzen] Cloud Print error: ' . $response->get_error_message());
    }
}
```

---

## 3. Frequently Asked Questions (FAQ)

### Does setting a short `timeout => 5` make `wp_remote_post` asynchronous?
**No.** The `timeout` parameter only designates when PHP should abandon waiting for a response; execution remains fully blocking during that interval. True non-blocking execution requires `'blocking' => false` or Action Scheduler.

### How quickly does an Action Scheduler job execute?
**Typically within 1 to 3 seconds.** WooCommerce runs queue runners on page hits and system crontabs, ensuring immediate physical ticket dispatch.

### Where should I store the Printzen API key securely?
Define the constant in your root `wp-config.php`:
```php
define('PRINTZEN_API_KEY', 'prz_live_your_secret_token_here');
```
This protects your secret from being checked into version control.

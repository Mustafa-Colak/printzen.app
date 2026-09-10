---
title: "Splitting WooCommerce Kitchen and Delivery Receipts Across Multiple Printers"
description: "Route WooCommerce food orders dynamically by category. Send hot food prep tickets to the kitchen line and consolidated delivery slips to the courier packing station."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: splitting-woocommerce-kitchen-and-delivery-receipts
---

When running cloud ghost kitchens, bakeries, or delivery restaurants on WooCommerce, sending an entire order to a single printer creates operational gridlock.

The optimal workflow partitions order line items by **Product Category**: hot entrees route to the **Kitchen Line Printer**, beverages route to the **Barista Station**, and courier delivery addresses with payment details route to the **Expediter / Delivery Station**.

---

## 1. Category-Based Routing Logic in PHP

Evaluate line items using WooCommerce product taxonomy categories:

```php
function route_order_across_stations($order_id) {
    $order = wc_get_order($order_id);
    
    $kitchen_lines = [];
    $beverage_lines = [];

    foreach ($order->get_items() as $item) {
        $product = $item->get_product();
        $categories = $product ? $product->get_category_ids() : [];

        // Category IDs: 15 = Food, 18 = Drinks
        if (in_array(15, $categories)) {
            $kitchen_lines[] = $item->get_name() . ' x ' . $item->get_quantity();
        } elseif (in_array(18, $categories)) {
            $beverage_lines[] = $item->get_name() . ' x ' . $item->get_quantity();
        }
    }

    // 1. Dispatch to Kitchen Printer (Only if food items exist)
    if (!empty($kitchen_lines)) {
        dispatch_print_job('STATION_KITCHEN', $kitchen_lines);
    }

    // 2. Dispatch to Barista Printer (Only if drinks exist)
    if (!empty($beverage_lines)) {
        dispatch_print_job('STATION_BAR', $beverage_lines);
    }

    // 3. Dispatch Master Courier Packing Slip
    dispatch_print_job('STATION_EXPEDITER', [
        'order_id' => $order->get_id(),
        'address'  => $order->get_formatted_shipping_address(),
        'phone'    => $order->get_billing_phone(),
        'total'    => $order->get_total()
    ]);
}
```

---

## 2. Frequently Asked Questions (FAQ)

### Will the kitchen printer fire if a customer orders only beverages?
**No. Because of the `!empty($kitchen_lines)` conditional check, the kitchen printer remains idle if an order contains zero kitchen items.** This avoids paper waste and eliminates cook distraction.

### Can we omit currency prices on kitchen prep tickets?
**Yes. Line cooks do not need to see monetary pricing.** The kitchen prep ticket formats only quantities, item names, and custom preparation notes, while the courier packing manifest presents itemized totals, taxes, and collected payment amounts.

---
title: "Customizing WooCommerce Thermal Receipt Templates: Logos, Taxes, and Customer Notes"
description: "Engineer production-ready 80mm ESC/POS receipt templates for WooCommerce. Format product variations, tax breakdowns, gift messages, and order QR codes."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: customizing-woocommerce-thermal-receipt-templates
---

Attempting to scale standard A4 desktop PDF invoices down onto 80mm or 58mm thermal rolls results in microscopic, unreadable fonts and excessive blank margins.

A production-grade WooCommerce thermal receipt must feature your monochrome brand logo at the head, cleanly display item attributes (Size/Color), provide explicit tax breakdowns, and highlight special customer fulfillment notes.

---

## 1. Production 80mm Layout Grid (48 Columns)

```
================================================
           [MONOCHROME 1-BIT BRAND LOGO]        
             PRINTZEN APPAREL BOUTIQUE          
                 Order ID: #84912               
Date: 2026-09-10 16:20     Payment: Stripe Card 
------------------------------------------------
Customer: Sarah Jenkins                         
Phone: +1 (555) 019-2834                        
------------------------------------------------
ITEM DESCRIPTION               QTY        PRICE 
------------------------------------------------
Oversize Fleece Hoodie (M)       1       $85.00 
  * Color: Onyx Black                           
Classic Selvedge Denim (32)      1      $120.00 
------------------------------------------------
Subtotal:                               $205.00 
Shipping (Expedited Air):                 $0.00 
Tax (8.25% Included):                    $15.63 
TOTAL DUE:                              $205.00 
================================================
Customer Note:                                  
"Please wrap in gift tissue and include ribbon."
================================================
          Thank You For Shopping Small!         
             [ORDER DISPATCH QR CODE]
```

---

## 2. Extracting Attributes and Notes in PHP

Extract variation metadata and order notes from the WooCommerce core object:

```php
function extract_clean_order_items($order) {
    $items = [];
    foreach ($order->get_items() as $item) {
        $title = $item->get_name();
        
        // Extract variation meta (e.g. Size: Medium, Color: Navy)
        $meta_data = [];
        foreach ($item->get_formatted_meta_data() as $meta) {
            $meta_data[] = $meta->display_key . ': ' . strip_tags($meta->display_value);
        }
        if (!empty($meta_data)) {
            $title .= ' [' . implode(', ', $meta_data) . ']';
        }

        $items[] = [
            'name'     => $title,
            'qty'      => $item->get_quantity(),
            'total'    => $item->get_total()
        ];
    }
    return $items;
}

// Fetch customer checkout note
$special_instructions = $order->get_customer_note();
```

---

## 3. Frequently Asked Questions (FAQ)

### How do I prevent long product titles from breaking the price column?
**Enforce a strict character truncation budget.** If an item name exceeds 28 characters on 80mm paper, truncate the string with an ellipsis (`mb_substr($title, 0, 26) . '..'`) or wrap the text across two lines, keeping the quantity and price snapped to the outer edges.

### Can I include a dynamic QR code linking to digital customer invoices?
**Yes, pass the order's public view URL (`$order->get_view_order_url()`) into your ESC/POS QR generation routine.** Customers scanning the paper receipt on their smartphone are immediately routed to digital receipts, tracking updates, and return portals.

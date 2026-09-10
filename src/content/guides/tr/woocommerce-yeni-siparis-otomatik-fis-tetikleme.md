---
title: "WooCommerce Yeni Sipariş Düştüğünde Otomatik Fiş Tetikleme Rehberi"
description: "WordPress ve WooCommerce mağazanızda ödeme tamamlandığı anda depodaki veya mutfaktaki termal yazıcıdan otomatik fiş basma PHP mimarisi."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: woocommerce-trigger-automatic-receipt-new-order
---

WooCommerce mağazanızda günde onlarca sipariş alıyorsanız, her siparişi manuel olarak takip edip fiş yazdırmak personelin dikkatini dağıtır ve teslimatları geciktirir.

Doğru yaklaşım, sipariş durumu **"İşleniyor" (Processing)** aşamasına geçtiği anda sunucu tarafında bir kanca (Hook) tetikleyerek fiziksel yazıcıya otomatik baskı emri göndermektir.

---

## 1. WordPress `woocommerce_order_status_processing` Kancası

Kredi kartı veya havale ödemesi onaylandığında WooCommerce sipariş durumunu `processing` yapar. Aşağıdaki PHP kodu, mağazanızın `functions.php` dosyasına eklenerek yazdırma servisine anlık istek fırlatır:

```php
add_action('woocommerce_order_status_processing', 'printzen_trigger_auto_receipt', 10, 1);

function printzen_trigger_auto_receipt($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) return;

    // Fiş verilerini hazırla
    $payload = [
        'order_id'      => $order->get_id(),
        'order_number'  => $order->get_order_number(),
        'customer'      => $order->get_formatted_billing_full_name(),
        'phone'         => $order->get_billing_phone(),
        'total'         => $order->get_total(),
        'items'         => []
    ];

    foreach ($order->get_items() as $item) {
        $payload['items'][] = [
            'name' => $item->get_name(),
            'qty'  => $item->get_quantity(),
            'subtotal' => $item->get_subtotal()
        ];
    }

    // Printzen Cloud API çağrısı
    wp_remote_post('https://api.printzen.app/v1/print/order', [
        'headers' => [
            'Authorization' => 'Bearer PRZ_LIVE_KEY_BURAYA',
            'Content-Type'  => 'application/json'
        ],
        'body'    => wp_json_encode($payload),
        'timeout' => 5 // Müşteri sepetini bekletmemek için kısa timeout
    ]);
}
```

---

## 2. Kapıda Ödeme (COD) Siparişleri İçin Kanca

Eğer müşterileriniz kapıda nakit veya kartla ödeme seçeneğini kullanıyorsa, sipariş durumu `processing` yerine doğrudan `on-hold` veya `processing` olabilir. Her iki durumu da yakalamak için:

```php
add_action('woocommerce_order_status_on-hold', 'printzen_trigger_auto_receipt', 10, 1);
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Sunucudan yapılan bu API isteği müşterinin ödeme tamamlama ekranını yavaşlatır mı?
**Hayır, `timeout => 5` verilerek veya WordPress'in dahili asenkron kuyruk yapısı (Action Scheduler) kullanılarak istek arka plana atılabilir.** Müşteri anında "Siparişiniz Alındı" teşekkür sayfasını görürken fiş depoda saniyeler içinde basılır.

### Yazıcının kağıdı biterse sipariş yazdırma isteği kaybolur mu?
**Printzen Bulut Kuyruğu (Queue Engine) sayesinde istek kaybolmaz.** Yazıcı çevrimdışı olsa bile iş kuyrukta güvenle saklanır; rulo takıldığı veya yazıcı açıldığı anda bekleyen tüm sipariş fişleri sırayla otomatik olarak basılır.

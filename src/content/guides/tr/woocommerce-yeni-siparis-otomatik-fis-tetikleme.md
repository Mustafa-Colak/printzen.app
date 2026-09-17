---
title: "WooCommerce Action Scheduler ile Asenkron ve Non-Blocking Fiş Tetikleme Mimarisi"
description: "WooCommerce sipariş ödemesi tamamlandığında kasayı ve ödeme ekranını kilitlemeden, Action Scheduler arka plan kuyruğu ile otomatik termal fiş yazdırma."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: woocommerce-trigger-automatic-receipt-new-order
---

WooCommerce mağazanızda sipariş hacmi arttıkça, yeni sipariş anında doğrudan HTTP istekleriyle fiziksel yazıcıyı veya bulut yazdırma API'sini tetiklemek ciddi performans darboğazlarına yol açar. Ödeme anında müşteriyi bekletmemek ve ödeme ağ geçidi (iyzico, Stripe, PayTR) webhook'larında zaman aşımı (timeout) yaşamamak için fiş yazdırma işlemleri mutlaka **asenkron ve non-blocking** bir kuyruk üzerinden yürütülmelidir.

Bu rehberde, WooCommerce'in yerel arka plan iş motoru olan **Action Scheduler** kullanarak sıfır gecikmeli fiş tetikleme mimarisini inceleyeceğiz. Kargo barkodu tasarımı ve çoklu yazıcı yönlendirmeleri için ana [WooCommerce Otomatik Termal Fiş ve Kargo Etiketi Yazdırma](/tr/rehberler/woocommerce-otomatik-termal-fis-kargo-etiketi-yazdirma/) amiral rehberimize başvurabilirsiniz.

---

## 1. Neden Senkron `wp_remote_post` Kullanılmamalı?

Geliştiricilerin en sık yaptığı hata, `woocommerce_order_status_processing` kancasına doğrudan senkron bir HTTP çağrısı bağlamaktır:

```php
// ❌ HATALI YAKLAŞIM: Senkron çağrı kasayı kilitler!
add_action('woocommerce_order_status_processing', function($order_id) {
    wp_remote_post('https://api.printzen.app/v1/print/order', [
        'body'    => json_encode(['order_id' => $order_id]),
        'timeout' => 5 // ⚠️ Bu istek asenkron DEĞİLDİR! 5 saniye boyunca PHP thread'ini bloke eder.
    ]);
});
```

### Senkron İsteklerin Doğurduğu Riskler:
1. **Checkout Donması:** Müşteri "Siparişi Onayla" butonuna bastıktan sonra mağaza sunucusu termal yazıcı API'sinden yanıt bekler. Ağda 1-2 saniyelik bir yavaşlama olduğunda müşteri ekranı donar.
2. **Çift Çekim Riski:** Sayfa geciktiğinde kullanıcı butona tekrar basabilir veya tarayıcıyı yenileyebilir.
3. **Webhook Zaman Aşımları:** Ödeme kuruluşu sunucunuza `payment_success` bildirimi gönderirken yazıcı çağrısı yüzünden 200 OK yanıtı gecikirse, ödeme kuruluşu bildirimi başarısız sayıp tekrar dener.

---

## 2. Doğru Çözüm: WooCommerce Action Scheduler ile Asenkron Kuyruklama

WooCommerce 3.5'ten bu yana çekirdeğe dahil olan **Action Scheduler**, yüksek trafikli mağazalarda veritabanı destekli arka plan iş kuyruğu sağlar. Sipariş işlenirken tek satırla kuyruğa bir iş bırakılır ve müşteri milisaniyeler içinde teşekkür sayfasına yönlendirilir.

Aşağıdaki kodu temanızın `functions.php` dosyasına veya özel bir eklentiye ekleyin:

```php
<?php
/**
 * Adım 1: Sipariş "Processing" durumuna geçtiğinde kuyruğa iş ekle
 */
add_action('woocommerce_order_status_processing', 'printzen_schedule_receipt_job', 10, 1);
add_action('woocommerce_order_status_completed', 'printzen_schedule_receipt_job', 10, 1);

function printzen_schedule_receipt_job($order_id) {
    // Action Scheduler ile arka plan işi planla (Hemen çalıştırılmak üzere enqueued)
    if (function_exists('as_enqueue_async_action')) {
        as_enqueue_async_action(
            'printzen_async_print_receipt',
            ['order_id' => $order_id],
            'printzen-printing'
        );
    }
}

/**
 * Adım 2: Arka planda çalışan fiş yazdırma işleyicisi (Worker)
 */
add_action('printzen_async_print_receipt', 'printzen_execute_async_receipt', 10, 1);

function printzen_execute_async_receipt($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) {
        return;
    }

    // Güvenli API Anahtarı: wp-config.php veya options tablosundan çekilir
    $api_key = defined('PRINTZEN_API_KEY') ? PRINTZEN_API_KEY : get_option('printzen_api_key');
    if (empty($api_key)) {
        error_log('[Printzen] API anahtarı tanımlanmamış. Sipariş ID: ' . $order_id);
        return;
    }

    // Fiş yükünü hazırla
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

    // Printzen Bulut Servisi çağrısı
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
        error_log('[Printzen] Yazdırma API hatası: ' . $response->get_error_message());
    }
}
```

---

## 3. Kapıda Ödeme (COD) ve Havale Senaryoları

- **Kapıda Ödeme (COD):** Sipariş genellikle `processing` statüsünde açılır, yukarıdaki kanca bunu doğrudan yakalar.
- **Banka Havalesi (BACS):** Sipariş önce `on-hold` statüsünde bekler. Muhasebe havaleyi onaylayıp siparişi `processing` yaptığı an iş kuyruğa girer ve depodaki fiş yazıcıdan adisyon dökülür.
- **Manuel Fiş Tekrarı:** İptal veya rulo sıkışması gibi durumlarda, sipariş panelinden tek tıkla Action Scheduler işini yeniden tetiklemek için admin paneline özel bir "Fişi Tekrar Bas" meta kutusu eklenebilir.

---

## 4. Sıkça Sorulan Sorular (SSS)

### `timeout => 5` parametresi isteği arka plana atmaz mı?
**Kesinlikle hayır.** `wp_remote_post()` fonksiyonunda `timeout` değeri yalnızca sunucunun ne kadar süre cevap bekleyeceğini belirtir; istek senkron olarak PHP thread'ini bloke etmeye devam eder. Bir çağrıyı gerçekten non-blocking yapmak için ya `'blocking' => false` parametresi kullanılmalı ya da yukarıda gösterildiği gibi Action Scheduler tercih edilmelidir.

### Action Scheduler ile kuyruklanan fiş kaç saniyede basılır?
**Normal şartlarda 1 ila 3 saniye içinde basılır.** WooCommerce dahili cron döngüsü veya sunucu tarafında yapılandırılmış bir sistem crontab (`wp-cron.php`) aracılığıyla bekleyen eylemleri neredeyse anında işler.

### Güvenli API anahtarı `wp-config.php` dosyasına nasıl eklenir?
WordPress ana dizinindeki `wp-config.php` dosyasına şu satırı eklemeniz önerilir:
```php
define('PRINTZEN_API_KEY', 'prz_live_your_secret_token_here');
```
Böylece anahtarınız veritabanında saklanmaz ve Git geçmişine sızma riski ortadan kalkar.

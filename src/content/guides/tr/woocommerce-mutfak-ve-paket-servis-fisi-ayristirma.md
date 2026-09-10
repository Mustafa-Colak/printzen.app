---
title: "WooCommerce Mutfak ve Paket Servis Fişlerini Ayrı Yazıcılara Gönderme"
description: "WooCommerce restoran ve fırın siparişlerinde kategori bazlı yazdırma. Mutfak yazıcısına hazırlık fişi, paket servis masasına kurye adisyonu yönlendirme mimarisi."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: splitting-woocommerce-kitchen-and-delivery-receipts
---

WooCommerce platformunu online yemek siparişi, pastane veya fırın teslimatları için kullanan işletmelerde tek bir siparişin tüm içeriğinin tek bir yazıcıya gitmesi operasyonu kilitler.

İdeal akışta; pizzalar ve burgerler **Mutfak Fiş Yazıcısına (Kitchen Printer)** düşerken, içecekler ve tatlılar **Barista Yazıcısına**, kurye teslimat adresi ve ödeme detaylarını içeren konsolide liste ise **Paketleme / Kurye Masasına** yönlendirilmelidir.

---

## 1. Kategori ve İstasyon Eşleme Mantığı

WooCommerce ürün kategorilerine göre hedef yazıcı kimliklerini belirleme:

```php
function route_order_items_to_printers($order_id) {
    $order = wc_get_order($order_id);
    
    $kitchen_items = [];
    $bar_items     = [];
    $delivery_info = [
        'order_id' => $order->get_id(),
        'address'  => $order->get_formatted_shipping_address(),
        'phone'    => $order->get_billing_phone(),
        'total'    => $order->get_total()
    ];

    foreach ($order->get_items() as $item) {
        $product = $item->get_product();
        $categories = $product ? $product->get_category_ids() : [];

        // Örnek Kategori ID: 15 = Sıcak Yemekler, 18 = İçecekler
        if (in_array(15, $categories)) {
            $kitchen_items[] = $item->get_name() . ' x ' . $item->get_quantity();
        } elseif (in_array(18, $categories)) {
            $bar_items[] = $item->get_name() . ' x ' . $item->get_quantity();
        }
    }

    // 1. Mutfak Yazıcısına Gönder (Yalnızca yemek varsa)
    if (!empty($kitchen_items)) {
        send_to_printer('MUTFAK_YAZICI_IP', $kitchen_items);
    }

    // 2. Bar Yazıcısına Gönder (Yalnızca içecek varsa)
    if (!empty($bar_items)) {
        send_to_printer('BAR_YAZICI_IP', $bar_items);
    }

    // 3. Paketleme Masasına Gönder (Kurye teslimat fişi)
    send_to_printer('KURYE_MASASI_YAZICI_IP', $delivery_info);
}
```

---

## 2. Sıkça Sorulan Sorular (SSS)

### Müşteri sadece içecek sipariş ettiğinde mutfak yazıcısı boş fiş basar mı?
**Hayır, yukarıdaki mimaride `if (!empty($kitchen_items))` kontrolü yapıldığı için o istasyona ait bir ürün yoksa yazıcı kesinlikle tetiklenmez.** Kağıt israfı ve personelin gereksiz yere meşgul edilmesi önlenir.

### Mutfak fişinde fiyatlar gizlenip kurye fişinde gösterilebilir mi?
**Evet, aşçıların ürün fiyatlarını görmesine gerek yoktur.** Mutfak fişi şablonunda yalnızca ürün isimleri, adetler ve pişirme notları ("Az acılı") basılırken; kurye paketleme fişinde ara toplam, kargo bedeli ve tahsilat tutarı detaylı olarak basılır.

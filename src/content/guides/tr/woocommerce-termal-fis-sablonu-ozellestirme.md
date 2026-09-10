---
title: "WooCommerce Termal Fiş Şablonu Özelleştirme: Logo, Vergi ve Müşteri Notları"
description: "WooCommerce siparişleri için profesyonel 80mm termal fiş şablonu tasarlama. Logo ekleme, KDV dökümü, varyasyon detayları ve QR kod entegrasyonu."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: customizing-woocommerce-thermal-receipt-templates
---

Standart e-ticaret PDF faturaları A4 boyutunda tasarlandığı için bunları 80mm veya 58mm termal fiş yazıcıdan basmaya çalıştığınızda yazılar mikroskobik boyuta iner ve kenar boşlukları kağıdı israf eder.

Mükemmel bir WooCommerce termal fişi; mağaza logosunu en başta barındırmalı, ürün varyasyonlarını (Beden/Renk) net göstermeli, KDV oranlarını dökümlemeli ve müşterinin sipariş notunu vurgulamalıdır.

---

## 1. 80mm Termal Fiş Mimarisi (48 Kolon)

```
================================================
           [1-BIT MONOKROM MAĞAZA LOGOSU]       
             PRINTZEN BOUTIQUE İSTANBUL         
                Sipariş No: #84912              
Tarih: 10.09.2026 16:20     Ödeme: Kredi Kartı  
------------------------------------------------
Müşteri: Zeynep Kaya                            
Telefon: +90 542 999 88 77                      
------------------------------------------------
ÜRÜN ADI                       ADET       FİYAT 
------------------------------------------------
Oversize Hoodie (Siyah / M)       1   850.00 TL 
Deri Sırt Çantası (Kahve)         1  1200.00 TL 
------------------------------------------------
Ara Toplam:                           2050.00 TL
Kargo Ücreti:                            0.00 TL
KDV (%20 Dahil):                       341.67 TL
GENEL TOPLAM:                         2050.00 TL
================================================
Müşteri Notu:                                   
"Lütfen hediye paketi yapıp kurdele bağlayınız."
================================================
          Bizi Tercih Ettiğiniz İçin            
               Teşekkür Ederiz!                 
           [SİPARİŞ TAKİP QR KODU]
```

---

## 2. Varyasyon ve Müşteri Notlarını PHP ile Çekme

WooCommerce sipariş objesinden varyasyon detaylarını (örneğin Renk: Siyah, Beden: XL) ve müşterinin kasada girdiği özel notları temiz şekilde çeken PHP fonksiyonu:

```php
function get_formatted_thermal_items($order) {
    $lines = [];
    foreach ($order->get_items() as $item) {
        $name = $item->get_name();
        
        // Varyasyon meta verilerini ekle
        $meta_strings = [];
        foreach ($item->get_formatted_meta_data() as $meta) {
            $meta_strings[] = $meta->display_key . ': ' . strip_tags($meta->display_value);
        }
        if (!empty($meta_strings)) {
            $name .= ' (' . implode(', ', $meta_strings) . ')';
        }

        $lines[] = [
            'name'     => $name,
            'qty'      => $item->get_quantity(),
            'price'    => wc_price($item->get_total(), ['currency' => $order->get_currency()])
        ];
    }
    return $lines;
}

// Müşteri notunu çekme
$customer_note = $order->get_customer_note();
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Ürün isimleri çok uzun olduğunda fiş tablosu neden bozuluyor?
**Ürün başlığı 30 karakteri aştığında fiyat sütununu alt satıra iterek tablonun kaymasına yol açar.** Fiş motorunuzda ürün başlığını maksimum 28 karaktere kırpan (`mb_substr($name, 0, 26) . '..'`) bir formatlama kuralı uygulamalısınız.

### Fişin en altına müşteri faturasını görüntüleyebileceği bir QR kod nasıl eklenir?
**Siparişin "View Order" URL'sini (`$order->get_view_order_url()`) ESC/POS dahili QR komutuna (`GS ( k`) parametre olarak geçebilirsiniz.** Müşteri fişteki karekodu telefonuyla okuttuğunda doğrudan online e-faturasına veya kargo takip sayfasına yönlendirilir.

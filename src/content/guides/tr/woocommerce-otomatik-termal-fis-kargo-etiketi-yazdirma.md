---
title: "WooCommerce Otomatik Termal Fiş ve Kargo Etiketi Yazdırma Rehberi: Bulut Sipariş Otomasyonu"
description: "WooCommerce mağazanızda yeni sipariş düştüğünde termal fiş yazıcıdan ve 100x150 mm etiket yazıcıdan hiçbir butona basmadan otomatik çıktı alma mimarisi."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: woocommerce-automatic-thermal-receipt-shipping-label-printing
---

E-ticaret operasyonlarında hız ve sıfır hata, müşteri memnuniyetinin ve kargo teslimat performansının temel taşıdır. Günde onlarca veya yüzlerce sipariş alan bir WooCommerce mağazasında; personelin WordPress yönetim paneline girip siparişleri tek tek açması, PDF fatura üretmesi, önizleme penceresinden "Yazdır" demesi ciddi bir operasyonel darboğaz yaratır.

Modern e-ticaret lojistiğinde doğru yaklaşım, **Sıfır Temaslı Yazdırma (Zero-Touch Printing)** mimarisidir: Müşteri web sitenizden siparişi onayladığı ve ödeme "İşleniyor" (Processing) durumuna geçtiği anda, depodaki termal fiş yazıcısı otomatik olarak paketleme fişini basar, yanındaki barkod yazıcı ise kargo sevkiyat etiketini hazırlar.

Bu kapsamlı rehberde; WooCommerce Webhook mimarisini, PHP aksiyon kancalarını (`woocommerce_order_status_processing`), 80mm ESC/POS fiş şablonu oluşturmayı ve 100x150 mm kargo barkod entegrasyonunu adım adım ele alıyoruz.

---

## 1. WooCommerce Sipariş Otomasyon Mimarisi

Bir WooCommerce siparişinin fiziksel fiş veya etikete dönüşmesi üç ana yöntemle gerçekleştirilebilir:

```
[ Müşteri Siparişi Verir ] ──► [ WooCommerce Backend ]
                                       │
                   ┌───────────────────┴───────────────────┐
                   ▼                                       ▼
        [ Yöntem A: Webhook ]                    [ Yöntem B: REST API Polling ]
                   │                                       │
                   ▼                                       ▼
      [ Printzen Cloud Hub ]                     [ Yerel Depo Servisi ]
                   │                                       │
                   ▼                                       ▼
        [ Depo Termal Yazıcı ]                  [ Depo Etiket Yazıcı ]
         (80mm Toplama Fişi)                     (100x150 mm Kargo ZPL)
```

1. **WooCommerce Webhook:** Mağazanızda `order.created` veya `order.updated` tetiklendiğinde WooCommerce sunucusu yazdırma servisine anlık bir JSON yükü (Payload) fırlatır. En hızlı ve modern yöntemdir.
2. **REST API Polling:** Depoda çalışan yerel bir yazılım, WooCommerce REST API üzerinden her 30 saniyede bir yeni siparişleri sorgular.
3. **WordPress Action Hook:** Tema veya eklenti düzeyinde `functions.php` içine yazılan özel bir PHP kancası ile sipariş durum değişiminde doğrudan bulut yazdırma kuyruğuna veri aktarılır.

---

## 2. WordPress Action Hook ile Anlık Sipariş Yakalama

Sipariş ödemesi başarıyla tamamlandığında tetiklenen en güvenilir WordPress kancası `woocommerce_order_status_processing` aksiyonudur. Aşağıdaki PHP kod bloğu, yeni siparişi yakalar ve Printzen Cloud Print API'sine iletir:

```php
<?php
// functions.php veya özel eklenti içerisine ekleyin:

add_action('woocommerce_order_status_processing', 'printzen_auto_print_order', 10, 1);

function printzen_auto_print_order($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) return;

    // Sipariş verilerini topla
    $order_data = [
        'order_id'       => $order->get_id(),
        'order_number'   => $order->get_order_number(),
        'created_at'     => $order->get_date_created()->date('d.m.Y H:i'),
        'customer_name'  => $order->get_formatted_billing_full_name(),
        'customer_phone' => $order->get_billing_phone(),
        'shipping_addr'  => $order->get_formatted_shipping_address(),
        'payment_method' => $order->get_payment_method_title(),
        'total'          => $order->get_total(),
        'currency'       => $order->get_currency(),
        'items'          => []
    ];

    foreach ($order->get_items() as $item_id => $item) {
        $product = $item->get_product();
        $order_data['items'][] = [
            'name'     => $item->get_name(),
            'sku'      => $product ? $product->get_sku() : '-',
            'quantity' => $item->get_quantity(),
            'subtotal' => $item->get_subtotal()
        ];
    }

    // Printzen Cloud API'sine gönder
    $api_url = 'https://api.printzen.app/v1/print/order';
    $api_key = defined('PRINTZEN_API_KEY') ? PRINTZEN_API_KEY : get_option('printzen_api_key');
    if (!$api_key) {
        return;
    }

    wp_remote_post($api_url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type'  => 'application/json'
        ],
        'body'    => wp_json_encode($order_data),
        'timeout' => 15
    ]);
}
```

---

## 3. Termal Fiş Şablonu: 80mm ESC/POS Biçimlendirme

WooCommerce siparişlerini termal fiş formatında basarken standart 80mm (veya 58mm) genişlik sınırlarına uyulmalıdır. Standart 80mm kağıt Font A ile **48 kolon**, Font B ile **64 kolon** metin alır.

### 48-Kolon Sipariş Toplama Fişi Örneği:
```
================================================
           PRINTZEN BOUTIQUE STORE              
               Sipariş: #84920                  
Tarih: 10.09.2026 15:42    Ödeme: Kredi Kartı  
------------------------------------------------
Müşteri: Mehmet Öztürk                          
Telefon: +90 532 111 22 33                      
Adres: Barbaros Bulvarı No:42 Beşiktaş/İstanbul 
------------------------------------------------
ÜRÜN ADI                       ADET       FİYAT 
------------------------------------------------
Oversize Pamuklu Tişört (L)       2   700.00 TL 
Slim Fit Denim Jean (32/30)       1   850.00 TL 
Deri Kartlık (Siyah)              1   250.00 TL 
------------------------------------------------
Ara Toplam:                           1800.00 TL
Kargo (Yurtiçi Kargo):                  0.00 TL
KDV (%20 Dahil):                       300.00 TL
GENEL TOPLAM:                         1800.00 TL
================================================
            DEPO TOPLAMA VE PAKETLEME           
     Bu fiş sevkiyat kontrol amaçlıdır.         
[QR KOD / SİPARİŞ TAKİP LİNKİ]
```

---

## 4. 100x150 mm Kargo Sevkiyat Barkodu Entegrasyonu

Depo ekibi fişteki ürünleri toplayıp koliye koyduktan sonra, aynı sipariş için anında **Zebra ZPL kargo etiketi** de basılabilir. WooCommerce siparişindeki takip numarasını veya sipariş ID'sini Code 128 barkoduna dönüştürerek doğrudan etiket yazıcıya gönderen ZPL şablonu:

```zpl
^XA
^PW812^LL1218
^FO50,50^A0N,36,36^FDWOOCOMMERCE SEVKIYAT ETİKETİ^FS
^FO50,95^GB712,3,3^FS

^FO50,120^A0N,24,24^FDSiparis No: #84920^FS
^FO450,120^A0N,24,24^FDTarih: 10.09.2026^FS

^FO50,160^A0N,28,28^FDAlici: Mehmet Ozturk^FS
^FO50,200^A0N,22,22^FDBarbaros Bulvari No:42 Besiktas / Istanbul^FS
^FO50,230^A0N,22,22^FDTel: +90 532 111 22 33^FS
^FO50,265^GB712,2,2^FS

^FX Kargo Takip Barkodu
^FO100,310^BY3,2.5,120^BCN,120,Y,N,N^FDWC-84920-TR^FS

^FX Urun Ozet Kutusu
^FO50,480^GB712,180,2^FS
^FO70,505^A0N,22,22^FDIcerik: 3 Kalem Tekstil Urunu^FS
^FO70,540^A0N,22,22^FDAgirlik: 1.45 KG / 2 DESI^FS
^FO70,575^A0N,22,22^FDOdeme Tipi: Pesin Odendi (Online)^FS
^FO50,680^GB712,3,3^FS
^XZ
```

---

## 5. Çoklu Yazıcı Yönlendirme: Mutfak, Bar ve Depo Ayrıştırması

Eğer WooCommerce siteniz bir restoran, unlu mamul veya hızlı tüketim işletmesi için kullanılıyorsa, tek bir siparişteki ürünleri kategorilerine göre farklı yazıcılara bölüştürmek gerekir:

- **Mutfak Fiş Yazıcısı:** Sadece "Yemekler", "Sıcak Başlangıçlar" kategorisindeki ürünleri basar.
- **Bar / İçecek Yazıcısı:** Sadece "İçecekler" ve "Tatlılar" kategorisindeki ürünleri basar.
- **Kasa / Muhasebe Yazıcısı:** Siparişin tamamını ve toplam tutarı içeren müşteri adisyonunu basar.

Bu mantık, yukarıdaki PHP kodunda `$item->get_product()->get_category_ids()` kontrolü yapılarak ilgili kategorideki ürünlerin hedef yazıcıya yönlendirilmesiyle kolayca kurgulanır.

---

## 6. Sıkça Sorulan Sorular (SSS)

### Müşteri gece sipariş verdiğinde bilgisayarım kapalıyken sipariş basılır mı?
**Evet, Printzen Bulut Yazdırma servisi kullanıldığında bilgisayarınızın açık olmasına gerek yoktur.** Sipariş doğrudan bulut kuyruğuna işlenir. Mağazanızdaki Wi-Fi veya Ethernet bağlantılı termal yazıcı (veya Printzen IoT köprü cihazı) bulut ile sürekli iletişim halinde olduğu için, web siteniz açık olduğu sürece siparişler 7/24 otomatik olarak basılır.

### WooCommerce'te iptal edilen veya iade edilen siparişler için otomatik fiş basılabilir mi?
**Evet, `woocommerce_order_status_cancelled` veya `woocommerce_order_status_refunded` kancaları kullanılarak iade/iptal durumlarında da yazıcı tetiklenebilir.** Böylece depoya veya mutfağa kırmızı renkli ya da çift çizgili bir "SİPARİŞ İPTAL EDİLDİ" uyarısı basılarak hazırlığın derhal durdurulması sağlanır.

### Termal fiş üzerine mağaza logomu nasıl ekleyebilirim?
**Termal yazıcılar logoları 1-bit siyah-beyaz monokrom bitmap olarak kabul eder.** Printzen panelinden logonuzu yüklediğinizde, sistem logonuzu otomatik olarak yazıcının ESC/POS veya ZPL grafik formatına dönüştürür ve her sipariş fişinin en üstüne jilet netliğinde basılmasını sağlar.

### Farklı kargo firmalarının (Yurtiçi, Aras, MNG, Sürat) etiket formatları destekleniyor mu?
**Evet, tüm büyük kargo firmalarının API'leri 100x150 mm boyutunda ZPL veya PDF etiket çıktısı üretir.** WooCommerce kargo entegrasyonu eklentilerinizden dönen kargo takip kodları doğrudan ZPL barkod şablonuna gömülerek Zebra, Xprinter veya TSC etiket yazıcılarından tek bir tıkla otomatik yazdırılabilir.

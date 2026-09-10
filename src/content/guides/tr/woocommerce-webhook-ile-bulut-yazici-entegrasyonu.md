---
title: "WooCommerce Webhook ile Bulut Termal Yazıcı Entegrasyonu Rehberi"
description: "WordPress kodlarına dokunmadan WooCommerce Webhook'ları üzerinden Printzen Bulut Yazdırma servisine bağlanma, JSON payload yapısı ve imza doğrulama."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: integrating-woocommerce-webhooks-with-cloud-printers
---

WooCommerce sitenizde özel PHP kodları yazmak veya functions.php dosyasını düzenlemek istemiyorsanız, en temiz ve standart yöntem **WooCommerce Dahili Webhook Altyapısını** kullanmaktır.

WooCommerce yönetim panelinden tanımlanan bir webhook, mağazanızda yeni bir sipariş oluştuğunda veya sipariş durumu değiştiğinde doğrudan Printzen Bulut Yazdırma uç noktasına asenkron bir HTTP POST isteği gönderir.

---

## 1. WooCommerce Panelinden Webhook Kurulumu

1. WordPress Yönetim Paneli > **WooCommerce > Ayarlar > Gelişmiş > Webhook'lar** sekmesine gidin.
2. **"Webhook Ekle"** butonuna tıklayın ve şu parametreleri doldurun:
   - **Ad:** `Printzen Otomatik Fiş Yazdırma`
   - **Durum:** `Etkin (Active)`
   - **Konu (Topic):** `Sipariş oluşturuldu (Order created)` veya `Sipariş güncellendi (Order updated)`
   - **Teslimat URL'si:** `https://api.printzen.app/v1/webhooks/woocommerce`
   - **Gizli Anahtar (Secret):** Printzen panelinizden aldığınız Webhook Doğrulama Anahtarı
   - **API Sürümü:** `WP REST API Entegrasyonu v3`
3. **"Webhook'u Kaydet"** butonuna tıklayın.

---

## 2. Webhook İmza Güvenliği (HMAC-SHA256 Doğrulama)

Sunucunuza gelen webhook isteklerinin gerçekten WooCommerce mağazanızdan geldiğini doğrulamak için HTTP başlığındaki `x-wc-webhook-signature` değeri kontrol edilir:

```javascript
import crypto from 'crypto';

export function verifyWooCommerceWebhook(rawBody, signatureHeader, secretKey) {
  const calculatedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawBody, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(calculatedSignature)
  );
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Webhook kullanmak ile özel PHP eklentisi kullanmak arasındaki fark nedir?
**Webhook'lar sıfır kod kurulumu sağlar ve tema güncellemelerinden kesinlikle etkilenmez.** WordPress sitenizin teması veya PHP sürümü güncellense bile webhook ayarları veritabanında saklandığı için sistem kesintisiz çalışmaya devam eder.

### Sipariş kargo durumuna geçtiğinde etiket yazıcısını otomatik tetikleyebilir miyim?
**Evet, Topic olarak "Sipariş güncellendi" seçip koşul olarak sipariş durumunun `completed` veya `shipped` olmasını dinleyebilirsiniz.** Böylece depo personeli siparişi kargoya hazır olarak işaretlediği anda Zebra etiket yazıcısından otomatik kargo barkodu çıkar.

---
title: "Yemeksepeti, Getir ve Trendyol Yemek Siparişlerini Tek Bir Adisyon Yazıcısında Toplama"
description: "Farklı online yemek platformlarından gelen siparişleri 5 farklı tablet yerine tek bir merkezi termal yazıcıda otomatik toplama ve yazdırma mimarisi."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: consolidating-online-delivery-orders-single-pos-printer
---

Günümüz restoranlarında kasanın arkasında karşılaşılan en trajikomik manzara, her online yemek platformu için ayrı bir tablet ve her tabletin yanına konulmuş ayrı bir küçük Bluetooth yazıcıdır: Yemeksepeti için bir yazıcı, Getir Yemek için ikinci bir yazıcı, Trendyol Yemek için üçüncü bir yazıcı ve Migros Yemek için dördüncü bir yazıcı!

Bu donanım karmaşası; priz yetersizliğine, sürekli biten rulo takibine ve personelin farklı cihazlardaki siparişleri kaçırmasına yol açar.

Modern restoran mühendisliğinde çözüm, **Tüm Sipariş Kanallarını Tek Bir Merkezi Termal Yazıcıda Toplama (Omnichannel Delivery Consolidation)** mimarisidir.

---

## 1. Konsolidasyon Mimarisi Nasıl Çalışır?

```
[ Yemeksepeti API ] ──┐
[ Getir Yemek API ] ──┼──► [ Printzen Restoran Hub ] ──► [ Tek Bir Ethernet / Wi-Fi Mutfak Yazıcısı ]
[ Trendyol Yemek  ] ──┤        (Kanal Etiketi: GETİR, YEMEKSEPETİ)
[ Kendi Web Siteniz ] ─┘
```

Tüm kanallardan gelen webhook veya sipariş bildirimleri merkezi bir yazılım havuzunda toplanır; siparişin hangi kanaldan geldiğini belirten devasa bir başlıkla tek bir yüksek hızlı termal yazıcıya yönlendirilir.

---

## 2. Konsolide Paket Servis Fişi Tasarımı

```
================================================
           >>> GETİR YEMEK SİPARİŞİ <<<         
Sipariş Kodu: #GTR-98214                        
Teslimat: GETİR KURYESİ ALACAK (Saat: 19:40)    
------------------------------------------------
Müşteri: Murat Can                              
Telefon: 0850 *** ** 12 (Maskelenmiş Numara)    
Adres: Esentepe Mah. Büyükdere Cad. No:19 D:4   
------------------------------------------------
1x Gurme Cheeseburger Menü             220.00 TL
   * İçecek: Kutu Kola (Zero)                   
   * Patates: Baharatlı                         
1x Çıtır Soğan Halkası (8'li)           65.00 TL
------------------------------------------------
Ödeme: ONLİNE ÖDENDİ (Tahsilat Yapmayın!)       
TOPLAM:                                285.00 TL
================================================
Kurye Teslim Kodu: 4291                         
[3 KEZ SESLİ BUZZER UYARISI]
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Tablet uygulamalarının bluetooth bağlantısını kapatıp siparişleri sadece API'den alabilir miyiz?
**Evet, yemek platformlarının restoran entegrasyon API'leri aktifleştirildiğinde siparişler doğrudan bulut yazılımınıza düşer.** Restoranda tablet ekranını açık tutmaya veya her platformun kendi mini yazıcısını bağlamaya gerek kalmaz.

### Farklı platformların fişlerini renk veya logo ile nasıl ayırt edebiliriz?
**Fişin en üstüne ilgili platformun logosu (örneğin Getir veya Yemeksepeti logosu) ESC/POS grafik komutuyla basılabilir.** Ayrıca kanal ismi (TRENDYOL / GETİR) ters renk (siyah zemin üstüne beyaz yazı) olarak basılarak kurye paketleme masasında karışıklık sıfıra indirilir.

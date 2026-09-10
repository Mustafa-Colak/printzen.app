---
title: "Masa Taşıma ve Sipariş İptal Fişlerinin Mutfak İletişimi Rehberi"
description: "Restoranda masa değiştirme veya sipariş iptalinde mutfak karmaşasını önleme. Ters renkli iptal başlıkları, masa taşıma bildirimleri ve aşçı uyarı şablonları."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: table-transfers-and-order-voids-kitchen-ticket-workflow
---

Restoran operasyonlarında en yüksek maliyet ve fire yaratan anlar, sipariş verildikten sonra yaşanan değişikliklerdir: Müşteri siparişi iptal eder ama mutfağın haberi olmadığı için yemek pişirilir ve çöpe gider; ya da müşteri bahçedeki Masa 4'ten salondaki Masa 12'ye geçer ancak garson yemeği boş masaya götürür.

Bu operasyonel kayıpları sıfıra indirmek için POS sisteminin mutfak yazıcılarına anında **Özel Durum Fişleri (Void & Transfer Tickets)** fırlatması şarttır.

---

## 1. Ürün İptal Fişi (Order Void Ticket)

Bir yemek iptal edildiğinde basılan fiş, normal sipariş fişlerinden görsel olarak tamamen ayrışmalıdır:
- **Ters Renk Başlık (`GS B 1`):** Siyah zemin üzerine beyaz yazıyla devasa `*** URUN IPTAL EDILDI ***` yazısı.
- **İptal Nedeni:** "Müşteri vazgeçti", "Alerji uyarısı" veya "Hatalı giriş" ibaresi.
- **Sesli Uyarı:** Şefin hazırlığı derhal durdurması için 2 kez buzzer sesi.

```
================================================
          >>> URUN IPTAL EDILDI <<<             
MASA: 08                 SAAT: 20:45            
GARSON: Ahmet            IPTAL NO: #V-412       
------------------------------------------------
[IPTAL EDILEN KALEM:]                           
1x Kuzu Pirzola Izgara                          
* Not: Pisirme asamasindaysa DERHAL DURDURUN!   
------------------------------------------------
Iptal Nedeni: Musteri masadan erken ayrildi.    
================================================
[2 KEZ BUZZER SESİ]
```

---

## 2. Masa Taşıma Fişi (Table Transfer Ticket)

```
================================================
          >>> MASA TASIMA BILDIRIMI <<<         
ESKI MASA: Bahce 04                             
YENI MASA: Salon 12 (Ic Mekan)                  
------------------------------------------------
Garson: Selin            Saat: 21:05            
Siparis Referansi: #84912                       
------------------------------------------------
Hazirlanan tabaklar artik YENI MASA'ya (Salon 12)
servis edilecektir.                             
================================================
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Mutfakta iki renkli (siyah/kırmızı) nokta vuruşlu yazıcı varsa iptal fişi kırmızı basılabilir mi?
**Evet! Epson TM-U220 gibi iki renkli şerit kullanan yazıcılarda `0x1B 0x72 0x01` (ESC r 1) komutu ile kırmızı şeride geçilebilir.** İptal fişinin tamamını veya iptal edilen ürünün üstünü kırmızı mürekkeple basmak şeflerin gözünden kaçmasını imkansız kılar. Standart siyah şeride dönmek için `0x1B 0x72 0x00` (ESC r 0) gönderilir.

### Masa birleştirme durumunda adisyonlar nasıl birleştirilir?
**Sistem "Masa Birleştirme" (Table Merge) fişi basarak Mutfak ve Bar'a önceki iki masa kodunun artık tek bir hesapta toplandığını bildirir.** Böylece mutfak tabakları ortak servis eder.

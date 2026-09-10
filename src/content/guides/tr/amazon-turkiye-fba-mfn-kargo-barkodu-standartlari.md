---
title: "Amazon FBA ve MFN Kargo Barkodu Standartları: 100x150 mm Termal Etiketleme"
description: "Amazon Lojistik (FBA) koli etiketleri ve Satıcı Tarafından Gönderim (MFN) için termal yazıcı standartları. FNSKU ürün barkodu ve ZPL koli etiketi rehberi."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: amazon-fba-mfn-shipping-barcode-standards
---

Amazon, küresel fulfillment merkezlerinde (FBA - Fulfillment by Amazon) dünyanın en katı barkod ve etiketleme kurallarını uygular. Amazon deposuna gönderilen bir kolideki barkodun silik olması, yanlış boyutta basılması veya okunamaması; ürünlerin depoya kabul edilmemesine, ek "Plansız Hazırlık Ücreti" cezaları kesilmesine veya sevkiyatın iade edilmesine yol açabilir.

Bu rehberde, Amazon FBA koli etiketleri, MFN (Satıcı Gönderimi) kargo barkodları ve ürün bazlı FNSKU etiket standartlarını inceliyoruz.

---

## 1. Amazon Etiket Türleri ve Standart Ölçüler

| Etiket Türü | Standart Ölçü | Baskı Tipi | Açıklama |
|---|---|---|---|
| **FBA Koli / Sevkiyat Etiketi** | **100 × 150 mm (4×6")** | Termal Etiket | Amazon FBA deposuna giden her dış kolinin üzerine yapıştırılır. |
| **FNSKU Ürün Barkodu** | **50 × 25 mm** veya **A4 27'li** | Termal / Kuşe | Her bir ürünün kendi ambalajına yapıştırılan benzersiz Amazon barkodu (`X00...`). |
| **MFN Kargo Etiketi** | **100 × 150 mm (4×6")** | Direkt Termal | Satıcının kendi deposundan müşteriye gönderdiği standart kargo etiketi. |

---

## 2. Amazon FBA Koli Etiketi Yerleşim Kuralları

1. **Koli Dikişlerine / Bantlara Yapıştırmayın:** Etiketi kolinin koli bandıyla kapatılan ek yerine veya kenar kıvrımlarına yapıştırmayın. Depo personeli koliyi bıçakla açarken barkod kesilebilir.
2. **Koli Başına 2 Etiket (Palet Sevkiyatı):** Paletli FBA sevkiyatlarında paletin her dört köşesine veya koli üzerine net görünecek şekilde en az 3 cm kenar payı bırakılarak yapıştırılmalıdır.
3. **ZPL Çıktı Formatı:** Amazon Seller Central > "Gönderi Oluştur" ekranından etiket formatı olarak **"Thermal Printing (ZPL / 4x6 in)"** seçildiğinde, Zebra yazıcınız için en net vektörel çıktı üretilir.

---

## 3. Sıkça Sorulan Sorular (SSS)

### Amazon FBA depoları eko termal etiketleri kabul eder mi?
**Evet, standart e-ticaret karton kolileri için direkt termal (eko termal) etiketler kabul edilir.** Ancak deniz aşırı konteyner sevkiyatlarında veya aylarca depoda kalacak paletlerde güneş ışığı ve sürtünmeden etkilenmeyen **Lamine Termal (Top Termal)** veya ribonlu transfer etiketler tercih edilmelidir.

### Amazon Seller Central'dan 4x6 ZPL formatında etiket nasıl indirilir?
**Kargo Kuyruğu (Shipping Queue) > "Etiketleri Yazdır" adımında "Termal Yazıcı (4x6 inç)" seçeneğini işaretlediğinizde Amazon size doğrudan `.zpl` veya tek sayfalı 4x6 PDF dosyası verir.** Bu dosya Printzen veya Zebra Setup Utilities ile tek tıkla basılabilir.

---
title: "Trendyol Siparişleri İçin 100x150 mm Termal Barkod Yazdırma Rehberi"
description: "Trendyol satıcı panelinden 100x150 mm termal kargo barkodu alma, yazıcı sürücü ayarları, Trendyol Express kargo entegrasyonu ve toplu etiket basımı."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: trendyol-4x6-thermal-shipping-barcode-printing
---

Trendyol pazar yerinde satış yapan mağazaların en sık karşılaştığı sorunlardan biri, satıcı panelinden alınan kargo barkodlarının standart A4 formatında gelmesi ve 100x150 mm termal etiket yazıcıya gönderildiğinde küçük veya kayık basılmasıdır.

Doğru yapılandırmayla Trendyol satıcı panelini doğrudan **100 × 150 mm direkt termal rulo formatına** geçirebilir ve günde yüzlerce siparişi saniyeler içinde basabilirsiniz.

---

## 1. Trendyol Satıcı Paneli Barkod Formatı Ayarı

1. **Trendyol Satıcı Paneli** > **Sipariş & Sevkiyat** menüsüne gidin.
2. Sayfanın sağ üstündeki **"Yazdırma Ayarları"** (Çark simgesi) butonuna tıklayın.
3. Çıktı Formatı olarak **"Termal Barkod (100x150 mm)"** veya **"A6 Formatı"** seçeneğini işaretleyin.
4. Bu ayar yapıldığında, paneldeki "Toplu Barkod Yazdır" butonuna tıkladığınızda sistem A4 yerine doğrudan 100x150 mm boyutlarında tek tek sayfalanmış bir PDF dosyası üretir.

---

## 2. Windows Termal Yazıcı Sürücü Ayarları (Zebra, Xprinter, TSC)

1. Windows **Denetim Masası > Aygıtlar ve Yazıcılar** menüsünü açın.
2. Etiket yazıcınıza sağ tıklayıp **Yazdırma Tercihleri (Printing Preferences)** seçin.
3. **Sayfa Yapısı (Page Setup)** sekmesinde:
   - Genişlik: `100.0 mm`
   - Yükseklik: `150.0 mm`
   - Ortam Türü: `Aralıklı Etiket (Labels with Gaps)` olarak ayarlayın.
4. **Grafikler (Graphics / Dithering)** sekmesinde ditherleme modunu **"Yok (None)"** yapın. Bu ayar barkod çizgilerinin bulanıklaşmasını engeller, jilet gibi siyah basılmasını sağlar.

---

## 3. Sıkça Sorulan Sorular (SSS)

### Trendyol kargo barkodunun üzerindeki QR kod ve barkod kargo şubesinde neden okunmuyor?
**Yazıcı kafa koyuluğu (Darkness) aşırı yüksek olduğunda siyah çizgiler genişleyerek aradaki beyaz boşlukları kapatır (Bleeding).** Yazıcı tercihlerinden "Darkness" ayarını 15-20 arasından 8-10 seviyesine indirin. Barkod çizgileri birbirine yapışmadığı anda el terminalleri anında okuyacaktır.

### Trendyol Express haricindeki kargo firmaları (Aras, Yurtiçi, Sürat) bu etiketi kabul eder mi?
**Evet, 100x150 mm Türkiye'deki tüm kargo firmalarının resmi kabul ettiği standart boyuttur.** Fiş üzerinde Kargo Takip Barkodu, Alıcı Adresi ve Desi bilgisi yer aldığı sürece tüm kuryeler bu barkodu sorunsuz okur.

---
title: "100x150 mm Kargo Barkod Şablonu Hazırlama Rehberi (ZPL Kodlarıyla)"
description: "E-ticaret ve kargo dağıtımı için standart 100x150 mm (4x6 inç) ZPL II sevkiyat etiketi şablonu. Gönderici, alıcı, kargo takip barkodu ve QR kod entegrasyonu."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: 4x6-shipping-label-zpl-template-guide
---

E-ticaret lojistiğinde en yaygın kullanılan fiziksel etiket standardı **100 × 150 mm (yaklaşık 4 × 6 inç)** boyutudur. Bu boyut; gönderici/alıcı adreslerini, büyük bir kargo takip barkodunu, sipariş kalemlerini ve mobil kurye QR kodunu tek bir yüzeyde rahatça barındırabilecek ideal alan sunar.

203 DPI çözünürlükteki bir Zebra veya uyumlu etiket yazıcısında 100x150 mm'lik bir alan **800 × 1200 dot** matrisine karşılık gelir.

---

## 1. Üretime Hazır 100x150 mm ZPL Kargo Şablonu

Aşağıdaki kod bloğu; Trendyol Express, HepsiJet, Yurtiçi Kargo veya özel depo sevkiyatlarında doğrudan kullanılabilecek tam bir ZPL II şablonudur:

```zpl
^XA
^PW812
^LL1218
^LH0,0

^FX === 1. BÖLÜM: Üst Başlık & Servis Tipi ===
^FO50,40^A0N,40,40^FDPRINTZEN EXPRESS LOJISTIK^FS
^FO50,85^A0N,22,22^FDSERVİS: STANDART ERTESİ GÜN TESLİMAT^FS
^FO50,115^GB712,3,3^FS

^FX === 2. BÖLÜM: Adres Blokları ===
^FO50,135^A0N,20,20^FDGÖNDERİCİ:^FS
^FO50,165^A0N,24,24^FDPrintzen Depo A.Ş.^FS
^FO50,195^A0N,20,20^FDIstanbul Lojistik Merkezi, Turkiye^FS

^FO420,135^A0N,20,20^FDALICI:^FS
^FO420,165^A0N,28,28^FDSelim Yildiz^FS
^FO420,200^A0N,22,22^FDCumhuriyet Cad. No:14 D:8^FS
^FO420,225^A0N,22,22^FDCankaya / Ankara^FS
^FO50,260^GB712,3,3^FS

^FX === 3. BÖLÜM: Kargo Takip Barkodu (Code 128) ===
^FO80,290^BY3,2.5,130^BCN,130,Y,N,N^FDPRZ-TR-98214^FS

^FX === 4. BÖLÜM: Sipariş Özet Kutusu ===
^FO50,480^GB712,170,2^FS
^FO70,505^A0N,22,22^FDSiparis Referansi: #84912^FS
^FO70,540^A0N,22,22^FDKoli / Paket Adedi: 1 Koli^FS
^FO70,575^A0N,22,22^FDDurum: Pesin Odendi (Kredi Karti)^FS
^FO70,610^A0N,22,22^FDAgirlik / Hacim: 2.15 KG / 3 DESI^FS

^FX === 5. BÖLÜM: QR Kod & Kurye Doğrulama ===
^FO550,495^BQN,2,6^FDQA,https://printzen.app/track/PRZ-TR-98214^FS
^FO550,625^A0N,18,18^FDKURYEYE OKUTUN^FS

^FX === 6. BÖLÜM: Alt Yasal Metin ===
^FO50,670^GB712,3,3^FS
^FO50,690^A0N,18,18^FDTasiyici guvencesi altindadir. Hasarli koliyi tutanakla teslim aliniz.^FS
^XZ
```

---

## 2. ZPL Kodunun Bölüm Analizi

- `^PW812` ve `^LL1218`: Etiketin genişliğini 812 dot (101.5 mm), uzunluğunu 1218 dot (152.2 mm) olarak kilitler. Yazıcının hafıza taşmasını ve fazladan boş etiket atmasını önler.
- `^GB712,3,3`: Bölümler arasına 712 dot genişliğinde, 3 dot kalınlığında şık ayırıcı çizgiler çeker.
- `^BCN,130,Y,N,N`: Kargo takip barkodunu 130 dot yükseklikte basar, insan gözüyle okunabilir metni barkodun hemen altına yerleştirir.

---

## 3. Sıkça Sorulan Sorular (SSS)

### Bu şablonu 300 DPI bir yazıcıda kullanabilir miyim?
**Doğrudan kullanırsanız etiket 100x150 mm yerine yaklaşık 67x101 mm boyutunda sol üst köşeye basılır.** 300 DPI yazıcılar için tüm koordinatları ve font büyüklüklerini $300 / 203 \approx 1.478$ katsayısıyla çarpmalı veya ZPL'deki `^MU` ölçekleme komutundan yararlanmalısınız.

### Etiket yazıcı her baskıda bir dolu bir boş etiket atıyor, neden?
**Bu hata yazıcının sensör modunun (Gap/Notch) yanlış ayarlanmasından veya `^LL` değerinin fiziksel etiketten uzun tanımlanmasından kaynaklanır.** Yazıcının FEED tuşuna basılı tutarak sensör kalibrasyonu yapın ve `^LL1218` değerini fiziksel etiket yüksekliğinize göre ince ayarlayın.

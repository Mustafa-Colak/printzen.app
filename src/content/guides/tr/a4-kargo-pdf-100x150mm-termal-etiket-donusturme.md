---
title: "A4 Kargo PDF'lerini 100x150 mm Termal Etikete Otomatik Dönüştürme Rehberi"
description: "Pazaryerlerinden veya kargo entegrasyonlarından gelen A4 formatındaki PDF kargo etiketlerini otomatik kırpıp 100x150 mm termal boyuta getirme yöntemleri."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: converting-a4-shipping-pdfs-to-4x6-thermal-labels
---

Birçok eski kargo entegrasyonu veya e-ticaret altyapısı kargo etiketlerini standart **A4 kağıt boyutunda (210 × 297 mm)** üretir. Genellikle etiketin kendisi bu koca A4 sayfasının sadece sol üst çeyreğini (A6 - 105 × 148 mm) kaplar; geri kalan 3/4'lük alan ise tamamen boş beyaz kağıttır.

Bu A4 PDF'ini doğrudan 100x150 mm termal yazıcıya gönderirseniz yazıcı tüm A4'ü küçülterek basmaya çalışır; barkodlar ve metinler mikroskobik boyuta iner ve okunamaz hale gelir.

Bu rehberde, A4 PDF'lerini otomatik olarak kırpıp (Crop) 100x150 mm termal etiket formatına getiren çözümleri inceliyoruz.

---

## 1. Yöntem 1: PDF Okuyucu ile Anlık Kırpma (Adobe Acrobat / Chrome)

Yazılım geliştirmeden manuel basım yapan işletmeler için en hızlı yöntem:

1. A4 PDF dosyasını **Adobe Acrobat Reader** ile açın.
2. Üst menüden **Düzenle > Anlık Görüntü Al (Snapshot Tool)** aracını seçin.
3. Farenizle yalnızca kargo etiketinin bulunduğu alanı (beyaz boşlukları hariç tutarak) dikdörtgen içine alın.
4. Sağ tıklayıp **Yazdır** deyin.
5. Yazdırma penceresinde:
   - Yazıcı: `Termal Etiket Yazıcınız`
   - Sayfa Boyutu: `100x150 mm`
   - Sayfa Ölçekleme: **"Yazdırılabilir Alana Sığdır" (Fit to Printable Area)** seçeneğini işaretleyin.

---

## 2. Yöntem 2: Node.js ile Otomatik Sunucu Taraflı Kırpma (Headless Crop)

Eğer deponuzda her siparişte otomatik kırpma yapmak istiyorsanız, açık kaynaklı `pdf-lib` kütüphanesiyle A4 sayfasının sol üst çeyreğini kesip yeni bir 100x150 mm sayfaya yerleştirebilirsiniz:

```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

export async function cropA4To100x150(inputPdfPath, outputPdfPath) {
  const existingPdfBytes = fs.readFileSync(inputPdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const outDoc = await PDFDocument.create();

  // 100x150 mm'nin nokta karşılığı: 283.46 x 425.20 pt
  const targetWidth = 283.46;
  const targetHeight = 425.20;

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();

    // Sol üst çeyreğin koordinatları (PDF'te Y ekseni alttan başlar)
    const cropBox = {
      x: 0,
      y: height / 2,
      width: width / 2,
      height: height / 2
    };

    const embeddedPage = await outDoc.embedPage(page, cropBox);
    const newPage = outDoc.addPage([targetWidth, targetHeight]);

    newPage.drawPage(embeddedPage, {
      x: 0,
      y: 0,
      width: targetWidth,
      height: targetHeight
    });
  }

  const outBytes = await outDoc.save();
  fs.writeFileSync(outputPdfPath, outBytes);
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Kırpılan barkodun kalitesi veya çözünürlüğü bozulur mu?
**Vektörel PDF dosyalarında kırpma işlemi hiçbir kalite kaybına yol açmaz.** PDF içindeki çizgiler ve fontlar matematiksel vektörler olduğu için 100x150 mm boyutuna büyütüldüğünde jilet gibi net basılır.

### Printzen A4 kargo etiketlerini otomatik kırpabilir mi?
**Evet, Printzen Bulut Dönüştürücüsü yüklenen A4 kargo belgelerindeki beyaz kenar boşluklarını otomatik tespit eder (Auto-Bounding Box Detection), barkod alanını kırpar ve 100x150 mm yazıcınıza mükemmel ölçeklenmiş olarak basar.**

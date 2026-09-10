---
title: "HTML/CSS İçeriğini Termal Yazıcı İçin 1-Bit Dithered Monokrom Yapma Rehberi"
description: "Web arayüzlerini (HTML/CSS) termal fiş yazıcıda basmak için html2canvas ve Floyd-Steinberg ditherleme kullanarak 1-bit monokrom raster baytlarına dönüştürme."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: rendering-html-css-to-1bit-dithered-thermal-printer-canvas
---

Bazen bir faturayı veya karmaşık bir sipariş arayüzünü ESC/POS komutlarıyla satır satır kodlamak yerine, halihazırda var olan şık bir **HTML/CSS bileşenini doğrudan termal yazıcıya basmak** çok daha pratik olabilir.

Ancak tarayıcının standart `window.print()` fonksiyonu gri tonları bulanıklaştırır ve kenar boşlukları bırakır. 

Bu rehberde; HTML/CSS DOM elemanını `html2canvas` ile yakalayıp **Floyd-Steinberg Hata Difüzyonu Ditherleme** algoritmasıyla 1-bit monokrom siyah/beyaz grafik formatına (`GS v 0`) dönüştürmeyi inceliyoruz.

---

## 1. Mimari Akış: DOM -> Canvas -> Dithering -> ESC/POS Raster

```
[ HTML/CSS Fiş Bileşeni ]
            │
            ▼ (html2canvas ile 576px genişlikte çiz)
   [ HTML5 Canvas (RGB) ]
            │
            ▼ (Floyd-Steinberg Hata Difüzyonu)
 [ 1-Bit Monokrom Piksel Matrisi ]
            │
            ▼ (GS v 0 Raster Byte Dizisi)
 [ Termal Yazıcı Kafa Isıtma ]
```

---

## 2. Floyd-Steinberg Ditherleme Algoritması (JavaScript)

Floyd-Steinberg algoritması, bir pikseli siyaha (0) veya beyaza (255) yuvarlarken oluşan kuantizasyon hatasını komşu 4 piksele dağıtarak fotoğraflarda ve gri kutularda gazete baskısı gibi doğal gölgeler üretir:

$$\text{Hata Dağılımı:} \quad \text{Sağ: } \frac{7}{16}, \quad \text{Sol-Alt: } \frac{3}{16}, \quad \text{Alt: } \frac{5}{16}, \quad \text{Sağ-Alt: } \frac{1}{16}$$

```javascript
export function applyFloydSteinbergDither(ctx, width, height) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;

  // Gri tonlama matrisi oluştur
  const gray = new Float32Array(width * height);
  for (let i = 0; i < d.length; i += 4) {
    gray[i / 4] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldVal = gray[idx];
      const newVal = oldVal < 128 ? 0 : 255;
      gray[idx] = newVal;
      const err = oldVal - newVal;

      // Hataları komşu piksellere dağıt
      if (x + 1 < width) gray[idx + 1] += (err * 7) / 16;
      if (x - 1 >= 0 && y + 1 < height) gray[(y + 1) * width + (x - 1)] += (err * 3) / 16;
      if (y + 1 < height) gray[(y + 1) * width + x] += (err * 5) / 16;
      if (x + 1 < width && y + 1 < height) gray[(y + 1) * width + (x + 1)] += (err * 1) / 16;

      // Canvas'a siyah veya beyaz olarak geri yaz
      const pxIdx = idx * 4;
      d[pxIdx] = d[pxIdx + 1] = d[pxIdx + 2] = newVal;
      d[pxIdx + 3] = 255; // Opak
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### HTML'den resim üretip basmak fiş yazdırmayı yavaşlatır mı?
**Modern tarayıcılarda `html2canvas` ve ditherleme işlemi ortalama 50-100 milisaniye sürer.** Üretilen 1-bit monokrom baytlar doğrudan USB veya Ethernet üzerinden aktarıldığında fiş neredeyse anında basılır.

### Ditherleme metinlerin ve küçük harflerin kenarlarını bozar mı?
**Çok küçük fontlarda (10px altı) ditherleme harf kenarlarında kumlanma yapabilir.** Bunu önlemek için HTML tasarımında metinlerin yer aldığı alanlarda katı `#000000` (tam siyah) renk kullanılmalı, ditherleme ise sadece logolar ve gri arka planlı kutucuklar için devreye girmelidir.

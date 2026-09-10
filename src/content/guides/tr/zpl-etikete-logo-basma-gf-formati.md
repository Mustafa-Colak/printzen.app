---
title: "ZPL ile Etikete Şirket Logosu Basma: ^GF Grafik Formatı Rehberi"
description: "Zebra etiket yazıcılarında marka logosu basma kılavuzu. ^GF (Graphic Field) komutu, 1-bit monokrom hex dönüşümü ve kalıcı flash bellek depolama."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: zpl-label-logo-printing-gf-graphic-format
---

Kargo sevkiyat ve ürün etiketlerinin en üstünde yer alan kurumsal logo, markanın güvenilirliğini pekiştirir. Zebra ZPL II dilinde doğrudan PNG veya JPEG formatında resim gönderilemez; tüm görseller **1-bit monokrom (siyah/beyaz) ham hexadecimal veri dizisine** dönüştürülmelidir.

ZPL'de grafik çizimi için kullanılan temel komut **`^GF` (Graphic Field)** komutudur.

---

## 1. `^GF` Komutunun Sözdizimi ve Parametreleri

$$\text{^GFA, } b, \text{ } t, \text{ } w, \text{ } [data]$$

- `A`: Veri sıkıştırma türü (`A`: Standart Hex ASCII, en yaygın ve uyumlu mod).
- `$b$`: Veri bayt sayısı (Görselin toplam bayt büyüklüğü).
- `$t$`: Toplam bayt sayısı (Piksel padding dahil).
- `$w$`: Satır başına bayt sayısı ($\text{Piksel Genişliği} / 8$).
- `$[data]$`: Piksel baytlarının ardışık onaltılık (hexadecimal) dizisi.

---

## 2. JavaScript ile PNG'yi ZPL ^GF Formatına Dönüştürme

Aşağıdaki Node.js/tarayıcı fonksiyonu, bir canvas görüntüsünü doğrudan ZPL `^GF` komut bloğuna çevirir:

```javascript
export function canvasToZplGraphic(canvas, x = 50, y = 50) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height).data;

  const byteWidth = Math.ceil(width / 8);
  const totalBytes = byteWidth * height;

  let hexData = '';

  for (let h = 0; h < height; h++) {
    for (let b = 0; b < byteWidth; b++) {
      let byteVal = 0;
      for (let bit = 0; bit < 8; bit++) {
        const px = b * 8 + bit;
        if (px < width) {
          const idx = (h * width + px) * 4;
          const lum = 0.299 * imgData[idx] + 0.587 * imgData[idx + 1] + 0.114 * imgData[idx + 2];
          // 128'den koyu ise nokta ısıt (siyah = 1)
          if (lum < 128) {
            byteVal |= (1 << (7 - bit));
          }
        }
      }
      hexData += byteVal.toString(16).padStart(2, '0').toUpperCase();
    }
  }

  return `^FO${x},${y}^GFA,${totalBytes},${totalBytes},${byteWidth},${hexData}^FS\n`;
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Logoyu yazıcının hafızasına kalıcı kaydedip her seferinde göndermekten nasıl kurtulurum?
**`~DG` (Download Graphics) komutu ile logoyu yazıcının `R:` (RAM) veya `E:` (Flash) belleğine bir kez yükleyebilirsiniz.** Örneğin `~DGE:LOGO.GRF,...` ile logoyu kaydettikten sonra, etiketlerinizin içinde yalnızca `^FO50,50^XGE:LOGO.GRF,1,1^FS` çağrısını yaparak veri boyutunu 50 kat azaltabilirsiniz.

### ZPL logo çıktısı neden aşırı soluk veya tırtıklı çıkıyor?
**Kaynak görselin çözünürlüğü yazıcının DPI değerine (203 veya 300) tam uymadığında yeniden ölçekleme sırasında pikseller bozulur.** Logoyu tasarım programında önceden 1-bit siyah/beyaz ve tam basılacak piksel boyutunda (örneğin 300x120 piksel) hazırlamak en net sonucu verir.

---
title: "ESC/POS ile Fiş Üzerine Logo ve Monokrom Resim Basma Yöntemleri"
description: "Termal fiş yazıcılarda şirket logosu ve grafik basma mimarisi. GS v 0 raster bit image komutu, Atkinson dithering ve 1-bit monokrom dönüştürme."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: esc-pos-printing-logos-monochrome-images
---

Termal fişlerin en üstünde yer alan kurumsal şirket logoları, markanızın profesyonelliğini artırır ve müşteriye güven verir. Ancak web geliştiricileri için renkli bir PNG veya JPEG görselini termal yazıcıda bastırmak sıklıkla bulanık, kapkara veya bozuk şekillerle sonuçlanır.

Termal yazıcılar renk tonlarını, şeffaflığı veya gri tonlamaları tanımaz; yalnızca **ısıtılan siyah nokta (1) veya ısıtılmayan beyaz nokta (0)** mantığıyla çalışır.

Bu rehberde; görselleri 1-bit monokrom piksellere dönüştürmeyi, Floyd-Steinberg ditherleme tekniğini ve modern ESC/POS standardı olan **`GS v 0` (Raster Bit Image)** komutunu inceliyoruz.

---

## 1. Görseli Termal Baskıya Hazırlama (Dithering & Eşikleme)

Bir görseli termal yazıcıya göndermeden önce 3 aşamadan geçirilmelidir:
1. **Yeniden Boyutlandırma (Resize):** 80mm kağıtlar maksimum **576 nokta (piksel)**, 58mm kağıtlar maksimum **384 nokta** genişlik alır. Logonuzun genişliği bu piksel değerlerini aşmamalıdır.
2. **Gri Tonlama (Grayscale):** $Y = 0.299R + 0.587G + 0.114B$ formülü ile pikseller griye çevrilir.
3. **Ditherleme (Hata Difüzyonu):** Fotoğraflardaki gölgeleri ve yumuşak geçişleri siyah-beyaz nokta yoğunluğuyla hissettirmek için **Floyd-Steinberg** veya **Atkinson** algoritması uygulanır.

---

## 2. Modern Raster Bit Image Komutu (`GS v 0`)

Eski `ESC *` (Bit-image) komutu yavaştır ve satır satır dikey dilimleme gerektirir. Modern Epson ve uyumlu tüm yazıcılarda standart **`GS v 0`** komutudur:

$$\text{GS } v \text{ } 0 \text{ } m \text{ } xL \text{ } xH \text{ } yL \text{ } yH \text{ } [d_1 \dots d_k]$$

- `$m$`: Yoğunluk modu (`0`: Normal, `1`: Çift genişlik, `2`: Çift yükseklik, `3`: Dört kat büyüklük). Genellikle `0` kullanılır.
- `$xL, xH$`: Yatay bayt sayısı ($x = \text{Genişlik} / 8$). $xL = x \pmod{256}$, $xH = \lfloor x / 256 \rfloor$.
- `$yL, yH$`: Dikey piksel (nokta) yüksekliği. $yL = y \pmod{256}$, $yH = \lfloor y / 256 \rfloor$.
- `$[d_1 \dots d_k]$`: 1-bit monokrom piksel bayt dizisi.

### HTML5 Canvas ile Monokrom Bayt Üretme (JavaScript):
```javascript
export function convertImageToEscPos(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height).data;

  // Genişlik 8'in katı olmalı (padding)
  const byteWidth = Math.ceil(width / 8);
  const xL = byteWidth % 256;
  const xH = Math.floor(byteWidth / 256);
  const yL = height % 256;
  const yH = Math.floor(height / 256);

  const header = [0x1D, 0x76, 0x30, 0, xL, xH, yL, yH];
  const rasterBytes = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < byteWidth; x++) {
      let byte = 0;
      for (let b = 0; b < 8; b++) {
        const px = x * 8 + b;
        if (px < width) {
          const idx = (y * width + px) * 4;
          // Parlaklık hesabı
          const brightness = 0.299 * imgData[idx] + 0.587 * imgData[idx + 1] + 0.114 * imgData[idx + 2];
          // Eşik: 128'den koyu ise siyah (1)
          if (brightness < 128) {
            byte |= (1 << (7 - b));
          }
        }
      }
      rasterBytes.push(byte);
    }
  }

  return new Uint8Array([...header, ...rasterBytes]);
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Termal fişte basılan logo neden simsiyah bir dikdörtgen olarak çıkıyor?
**Logonuz şeffaf arka planlı (transparent PNG) ise ve şeffaf piksellerin arka planı siyah (alpha=0, RGB=0,0,0) olarak yorumlanıyorsa tüm logo zemin kapkara basılır.** Çözüm için logonuzu beyaz arka planlı monokrom bir PNG olarak kaydedin veya canvas üzerine resmi çizmeden önce `ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, width, height);` ile zemini beyaza boyayın.

### Logoyu her fişte yazıcıya göndermek fiş basımını yavaşlatır mı?
**Ethernet ve USB bağlantılarda 10-20 KB'lık bir logo verisi milisaniyeler içinde iletilir ve hız farkı hissedilmez.** Ancak düşük hızlı Bluetooth (BLE) bağlantılarda logoyu her fişte göndermek 2-3 saniye gecikme yaratabilir. Bu durumda logoyu yazıcının dahili flash NV belleğine (`FS q` komutuyla) kalıcı kaydedip her fişte sadece `FS p 1 0` çağrısıyla basmak performansı katlar.

### 58mm mobil yazıcılarda logo genişliği en fazla kaç piksel olmalıdır?
**58mm fiş kağıtlarında efektif baskı genişliği 48mm'dir; bu da 203 DPI çözünürlükte tam 384 piksele denk gelir.** Logolarınızın kenarlardan taşmaması ve sağa sola kaymaması için görsel genişliğini tam olarak 384 piksele (veya ortalı basmak için 200-250 piksele) ölçeklemelisiniz.

---
title: "58mm ve 80mm Fiş Kağıtlarında Karakter Kolon Sayısı ve Tablo Hesaplama"
description: "Termal fiş tasarımında satır taşmalarını önleyin. Font A ve Font B piksel boyutları, 32 vs 48 kolon genişliği ve dinamik sağa/sola hizalama matematiği."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: 58mm-80mm-thermal-paper-column-calculation
---

Termal fiş yazıcılar için metin tabanlı fiş tasarlarken en sık yaşanan tasarım hatası, bir ürün satırının veya fiyat bilgisinin sağ tarafta sığmayıp **alt satıra kayması ve tüm tablonun darmadağın olmasıdır**:

```
1x Double Burger Menü        180.0
0 TL
```

Bu bozulmanın nedeni, termal yazıcının fiziksel kağıt genişliğine ve seçilen dahili yazı tipine (Font A vs Font B) bağlı olan **Maksimum Kolon Sayısının (Characters Per Line - CPL)** doğru hesaplanmamasıdır.

Bu rehberde; 58mm ve 80mm kağıtların nokta (dot) matematiğini, font genişliklerini ve mükemmel hizalanmış iki kolonlu fatura tablosu algoritmalarını inceliyoruz.

---

## 1. Kağıt Genişliği ve Nokta (Dot) Matematiği

Termal yazıcı kafaları 203 DPI (inç başına 203 nokta / 1 mm'de 8 nokta) çözünürlüğe sahiptir:

| Kağıt Ölçüsü | Fiziksel Rulo Genişliği | Efektif Baskı Alanı | Toplam Yatay Nokta (Dots) |
|---|---|---|---|
| **58 mm (Mobil / El Tipi)** | 58 mm | 48 mm | **384 nokta** |
| **80 mm (Masaüstü / POS)** | 80 mm | 72 mm | **576 nokta** |

---

## 2. Font A vs. Font B: Karakter Kolon Kapasitesi

ESC/POS yazıcıların ROM belleğinde iki standart dahili font bulunur:
- **Font A (Standart):** $12 \times 24$ nokta. Okunması kolay, kalın ve belirgindir.
- **Font B (Sıkıştırılmış):** $9 \times 17$ nokta. Daha küçüktür, tek bir satıra daha fazla karakter sığdırmak için kullanılır.

$$\text{Maksimum Kolon Sayısı} = \left\lfloor \frac{\text{Toplam Baskı Noktası}}{\text{Font Nokta Genişliği}} \right\rfloor$$

### Kolon Kapasite Tablosu:
| Kağıt Tipi | Font Tipi | Font Boyutu (Nokta) | Maksimum Karakter / Kolon (CPL) |
|---|---|---|---|
| **58 mm (384 nokta)** | **Font A (Varsayılan)** | $12 \times 24$ | **32 Karakter** |
| **58 mm (384 nokta)** | **Font B (Küçük)** | $9 \times 17$ | **42 Karakter** |
| **80 mm (576 nokta)** | **Font A (Varsayılan)** | $12 \times 24$ | **48 Karakter** |
| **80 mm (576 nokta)** | **Font B (Küçük)** | $9 \times 17$ | **64 Karakter** |

---

## 3. Dinamik Sağa ve Sola Yaslama Algoritması (JavaScript)

Satır taşmalarını önlemek için sol taraftaki ürün adını belirli bir uzunlukta kesmeli (truncate), sağdaki fiyatı sağa dayamalı ve arayı boşluklarla (` `) doldurmalısınız:

```javascript
export function formatReceiptLine(leftText, rightText, maxColumns = 48) {
  // Sağ metin uzunluğu (örn: " 180.00 TL" -> 10 karakter)
  const rightLen = rightText.length;
  
  // Sol metin için kalan maksimum alan
  const maxLeftLen = maxColumns - rightLen - 1; // En az 1 boşluk bırak

  let truncatedLeft = leftText;
  if (leftText.length > maxLeftLen) {
    truncatedLeft = leftText.substring(0, maxLeftLen - 2) + '..';
  }

  // Araya eklenecek boşluk sayısı
  const spacesNeeded = maxColumns - truncatedLeft.length - rightLen;
  const spaces = ' '.repeat(Math.max(1, spacesNeeded));

  return truncatedLeft + spaces + rightText + '\n';
}

// 80mm Font A için kullanım (48 Kolon):
console.log(formatReceiptLine('1x Karisik Pizza (Buyuk)', '240.00 TL', 48));
// 58mm Font A için kullanım (32 Kolon):
console.log(formatReceiptLine('1x Karisik Pizza (Buyuk)', '240.00 TL', 32));
```

---

## 4. Sıkça Sorulan Sorular (SSS)

### 80mm yazıcıda fontu daha küçük yapıp satıra daha çok yazı nasıl sığdırabilirim?
**ESC/POS'ta Font B moduna geçerek satır genişliğini 48 karakterden 64 karaktere çıkarabilirsiniz.** Yazıcıya `0x1B 0x4D 0x01` (`ESC M 1`) komutunu gönderdiğinizde yazıcı sıkıştırılmış $9\times 17$ fonta geçer. Standart $12\times 24$ Font A'ya dönmek için `0x1B 0x4D 0x00` (`ESC M 0`) komutu kullanılır.

### Fişin kenarlarında neden boşluk kalıyor, metinler tam kenara yanaşmıyor?
**Termal yazıcılar kağıdın sağında ve solunda mekanik besleme için 3-5 mm'lik basılamaz güvenlik marjı (Margin) bırakır.** 80mm kağıdın 80 milimetresine birden baskı yapılamaz; efektif basılabilir alan 72 milimetredir (576 dot). Bu marj donanımsal bir gerekliliktir.

### Fiyatları ve ürünleri tabla (Tab / \t) karakteri ile hizalayabilir miyim?
**ESC/POS protokolünde tab karakteri (`0x09`) varsayılan olarak her 8 kolonda bir durur ancak font değişikliklerinde kaymalara sebep olur.** En güvenli ve deterministik yöntem, yukarıdaki algoritmadaki gibi karakter uzunluklarını sayarak araya dinamik boşluk eklemektir.

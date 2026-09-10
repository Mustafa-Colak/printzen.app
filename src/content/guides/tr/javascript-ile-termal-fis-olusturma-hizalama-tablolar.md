---
title: "JavaScript ile Termal Fiş Oluşturma: Hizalama, Çizgiler ve Tablo Düzenleri"
description: "Tarayıcıda veya Node.js'te saf JavaScript ile ESC/POS fiş tasarımı. Ortalanmış başlıklar, çift kolonlu tablolar, kalın fontlar ve ayırıcı çizgiler."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: generating-thermal-receipts-javascript-alignment-tables
---

Termal fiş yazıcılarla çalışan geliştiricilerin en sık yaptığı hata, web sayfalarındaki HTML/CSS tablolarını doğrudan `window.print()` ile yazdırmaya çalışmaktır. Bu yöntem; kağıt kenarlarında devasa boşluklar bırakır, yazı fontlarını piksellendirir ve kağıt kesmeyi tetikleyemez.

Doğru yaklaşım; doğrudan yazıcının donanım komutlarını kullanarak **saf JavaScript ile karakter tabanlı monospaced fiş motoru (Receipt Generator)** inşa etmektir.

---

## 1. Temel ESC/POS Metin Biçimlendirme Komutları

| Eylem | ESC/POS Komutu | Hex Değeri | Açıklama |
|---|---|---|---|
| **Yazıcıyı Sıfırla** | `ESC @` | `1B 40` | Varsayılan font, boyut ve ayarlara döner. |
| **Metni Ortala** | `ESC a 1` | `1B 61 01` | Sonraki tüm satırları ortalar. |
| **Sola Yasla** | `ESC a 0` | `1B 61 00` | Standart sola dayalı metin akışı. |
| **Kalın (Bold) Aç** | `ESC E 1` | `1B 45 01` | Metni kalınlaştırır. (`ESC E 0` ile kapanır). |
| **Çift Boyut Font** | `GS ! 17` | `1D 21 11` | Çift yükseklik ve çift genişlik (Büyük başlık). |
| **Kağıt Kes** | `GS V 66 0` | `1D 56 42 00` | Kağıdı besler ve kısmi keser. |

---

## 2. Sıfırdan JavaScript Fiş Oluşturucu Sınıfı

```javascript
export class SimpleReceipt {
  constructor(columns = 48) {
    this.columns = columns; // 80mm için 48, 58mm için 32
    this.bytes = [0x1B, 0x40]; // ESC @ Başlat
  }

  align(type = 'left') {
    const val = type === 'center' ? 1 : type === 'right' ? 2 : 0;
    this.bytes.push(0x1B, 0x61, val);
    return this;
  }

  bold(enable = true) {
    this.bytes.push(0x1B, 0x45, enable ? 1 : 0);
    return this;
  }

  line(text = '') {
    const encoded = new TextEncoder().encode(text + '\n');
    encoded.forEach(b => this.bytes.push(b));
    return this;
  }

  divider(char = '-') {
    return this.line(char.repeat(this.columns));
  }

  row(left, right) {
    const spaces = Math.max(1, this.columns - left.length - right.length);
    return this.line(left + ' '.repeat(spaces) + right);
  }

  cut() {
    // 3 satır boşluk + Kes
    this.bytes.push(0x1B, 0x64, 0x03, 0x1D, 0x56, 0x42, 0x00);
    return this;
  }

  getBytes() {
    return new Uint8Array(this.bytes);
  }
}
```

### Kullanım Örneği:
```javascript
const receipt = new SimpleReceipt(48);

receipt
  .align('center')
  .bold(true)
  .line('PRINTZEN ARTISAN KAHVE')
  .bold(false)
  .line('Masa: Bahce 04 - Saat: 15:30')
  .divider('=')
  .align('left')
  .row('1x Cortado Kahve', '45.00 TL')
  .row('1x San Sebastian Cheesecake', '90.00 TL')
  .divider('-')
  .bold(true)
  .row('TOPLAM ODENEN', '135.00 TL')
  .bold(false)
  .align('center')
  .line('\nAfiyet Olsun. Yine Bekleriz!\n')
  .cut();

const finalBytes = receipt.getBytes();
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Ürün başlığı uzun olduğunda sağdaki fiyat alt satıra kaymasın diye ne yapmalıyım?
**`row(left, right)` metodunda sol metni maksimum `columns - right.length - 1` karakterle sınırlandırmalısınız.** `left.substring(0, maxLen - 2) + '..'` uygulayarak uzun ürün adlarını temiz şekilde kısaltabilirsiniz.

### Çift genişlikli font açıkken bir satıra kaç karakter sığar?
**Çift genişlik modunda (`GS ! 16`) her karakter 2 kat yer kaplar; dolayısıyla 80mm kağıttaki kapasite 48 kolondan 24 kolona düşer.** Büyük başlıklar yazarken satırın 24 karakteri geçmemesine dikkat etmelisiniz.

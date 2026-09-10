---
title: "Termal Fiş Yazıcılarda CP857 Kod Sayfası Kurulumu ve Karakter Tablosu"
description: "Epson, Bixolon ve Xprinter yazıcılarda CP857 (Turkish DOS) kod sayfası kurulumu. ESC t 18 komutu, 12 Türkçe harfin hex tablosu ve bayt dönüşümü."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: cp857-code-page-thermal-printers-table-setup
---

Türkiye'deki perakende ve POS terminallerinde kullanılan termal fiş yazıcılarının %90'ında Türkçe karakter desteği **CP857 (IBM DOS Turkish)** kod sayfası üzerinden sunulur. Modern web uygulamaları UTF-8 ile çalıştığı için bu iki dünya arasında köprü kurulmadığında fişlerdeki `ş, ğ, ı, ö, ç, ü` harfleri bozulur.

Bu kılavuzda; CP857 karakter tablosunun tam hex haritasını, ESC/POS kod sayfası komutunu ve JavaScript bayt dönüştürücüsünü sunuyoruz.

---

## 1. CP857 Kod Sayfası Seçim Komutu (`ESC t`)

ESC/POS standardında yazıcıyı CP857 moduna geçirmek için şu komut gönderilir:

$$\text{ESC } t \text{ } 18 \quad \longrightarrow \quad \texttt{0x1B 0x74 0x12}$$

> 💡 **Not:** Bazı Epson yazıcılarda indeks `18` (Hex `0x12`), bazı modellerde ise `50` (Hex `0x32`) olabilir. Yazıcınızdan Self-Test raporu alarak "Turkish / CP857" karşısındaki sayfa numarasını teyit edin.

---

## 2. Eksiksiz CP857 Türkçe Karakter Hex Tablosu

| Karakter | Unicode Kod Noktası | CP857 Hex Değeri | Ondalık (Dec) |
|---|---|---|---|
| **ç** (küçük ç) | `U+00E7` | `0x87` | 135 |
| **Ç** (büyük Ç) | `U+00C7` | `0x80` | 128 |
| **ğ** (küçük yumuşak g) | `U+011F` | `0xA6` | 166 |
| **Ğ** (büyük Yumuşak G) | `U+011E` | `0xA7` | 167 |
| **ı** (noktasız küçük ı) | `U+0131` | `0x8D` | 141 |
| **İ** (noktalı büyük İ) | `U+0130` | `0x98` | 152 |
| **ö** (küçük ö) | `U+00F6` | `0x94` | 148 |
| **Ö** (büyük Ö) | `U+00D6` | `0x99` | 153 |
| **ş** (küçük ş) | `U+015F` | `0x9F` | 159 |
| **Ş** (büyük Ş) | `U+015E` | `0x9E` | 158 |
| **ü** (küçük ü) | `U+00FC` | `0x81` | 129 |
| **Ü** (büyük Ü) | `U+00DC` | `0x9A` | 154 |

---

## 3. Pure JavaScript CP857 Bayt Dönüştürücü

Harici kütüphaneye ihtiyaç duymadan UTF-8 string'i doğrudan CP857 Uint8Array'e dönüştüren fonksiyon:

```javascript
export function toCP857Bytes(text) {
  const map = {
    'ç': 0x87, 'Ç': 0x80,
    'ğ': 0xA6, 'Ğ': 0xA7,
    'ı': 0x8D, 'İ': 0x98,
    'ö': 0x94, 'Ö': 0x99,
    'ş': 0x9F, 'Ş': 0x9E,
    'ü': 0x81, 'Ü': 0x9A
  };

  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (map[ch] !== undefined) {
      bytes.push(map[ch]);
    } else {
      const code = ch.charCodeAt(0);
      bytes.push(code < 128 ? code : 0x3F);
    }
  }
  return new Uint8Array(bytes);
}
```

---

## 4. Sıkça Sorulan Sorular (SSS)

### CP857 komutunu verdim ama sadece "ş" ve "ğ" harfleri bozuk çıkıyor, neden?
**Bu durum, yazıcınızın CP857 yerine ISO-8859-9 veya Windows-1254 tablosunda olmasından kaynaklanır.** "ç, ö, ü" harfleri standart Latin-1'de de bulunduğu için doğru basılırken, Türkçeye özgü "ş" ve "ğ" harflerinin kodları bu iki tabloda farklıdır. Yazıcınızı Windows-1254 tablosuna geçirmeyi deneyin.

### CP857 tüm dilleri destekler mi?
**Hayır, CP857 sadece Türkçe ve temel Latin dillerini destekleyen 8-bit bir tablodur.** Kiril, Arapça veya Yunanca karakterleri aynı fiş üzerinde basmak için yazıcının kod sayfasını dinamik olarak değiştirmek veya UTF-8 destekli kurumsal yazıcılar kullanmak gerekir.

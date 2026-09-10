---
title: "Windows-1254 (Turkish) ile ESC/POS Türkçe Karakter Eşleme Rehberi"
description: "Windows POS yazıcılarında Windows-1254 (CP1254) karakter seti kurulumu. CP857 ile arasındaki farklar, hex bayt eşleme tablosu ve sürücü ayarları."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: windows-1254-esc-pos-turkish-character-mapping
---

Windows tabanlı POS terminalleri ve Windows Spooler sürücüleri kullanan termal yazıcı sistemlerinde Türkçe karakter standardı genellikle **Windows-1254 (CP1254 / ISO-8859-9 türevi)** olarak yapılandırılır. 

DOS döneminden kalma CP857 ile modern Windows-1254 arasındaki bayt yerleşim farklarını bilmek, özellikle karma donanım kullanan işletmelerde karakter bozulmalarını çözmenin anahtarıdır.

---

## 1. Windows-1254 vs. CP857: Kritik Bayt Farkları

Geliştiricilerin en çok yanıldığı nokta, bir Türkçe karakter tablosunun diğeriyle aynı baytları kullandığını varsaymaktır:

| Karakter | Unicode | Windows-1254 Hex | CP857 Hex | Durum |
|---|---|---|---|---|
| **ğ** (küçük yumuşak g) | `U+011F` | **`0xF0`** | **`0xA6`** | ❌ **Tamamen Farklı Bayt** |
| **Ğ** (büyük Yumuşak G) | `U+011E` | **`0xD0`** | **`0xA7`** | ❌ **Tamamen Farklı Bayt** |
| **ı** (noktasız küçük ı) | `U+0131` | **`0xFD`** | **`0x8D`** | ❌ **Tamamen Farklı Bayt** |
| **İ** (noktalı büyük İ) | `U+0130` | **`0xDD`** | **`0x98`** | ❌ **Tamamen Farklı Bayt** |
| **ş** (küçük ş) | `U+015F` | **`0xFE`** | **`0x9F`** | ❌ **Tamamen Farklı Bayt** |
| **Ş** (büyük Ş) | `U+015E` | **`0xDE`** | **`0x9E`** | ❌ **Tamamen Farklı Bayt** |
| **ç / Ç** | `U+00E7 / C7` | `0xE7 / 0xC7` | `0x87 / 0x80` | ❌ **Farklı Bayt** |

> ⚠️ **Sonuç:** Yazıcı Windows-1254 modundayken CP857 baytları (`0xA6`, `0x9F` vb.) gönderirseniz ekranda İspanyolca aksanlı harfler veya anlamsız matematik sembolleri basılır.

---

## 2. ESC/POS Windows-1254 Seçim Komutu

Modern yazıcılarda Windows-1254 tablosu genellikle şu indeksle açılır:

$$\text{ESC } t \text{ } 70 \quad \longrightarrow \quad \texttt{0x1B 0x74 0x46}$$

Bazı Xprinter veya POS-58 modellerinde ise `ESC t 38` veya `ESC t 56` kullanılır.

### JavaScript Windows-1254 Bayt Haritası:
```javascript
export function toWindows1254Bytes(str) {
  const winMap = {
    'ğ': 0xF0, 'Ğ': 0xD0,
    'ı': 0xFD, 'İ': 0xDD,
    'ş': 0xFE, 'Ş': 0xDE,
    'ç': 0xE7, 'Ç': 0xC7,
    'ö': 0xF6, 'Ö': 0xD6,
    'ü': 0xFC, 'Ü': 0xDC
  };

  const buffer = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    buffer[i] = winMap[char] !== undefined ? winMap[char] : (char.charCodeAt(0) < 128 ? char.charCodeAt(0) : 0x3F);
  }
  return buffer;
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Windows yazıcı sürücüsü üzerinden basarken karakterler neden bozuluyor?
**Windows Print Spooler varsayılan olarak "Generic / Text Only" modunda ASCII 7-bit filtreleme yapabilir.** Yazıcı Özellikleri > Aygıt Ayarları sekmesinden "Kod Sayfası" ayarını **Windows-1254 (Turkish)** olarak seçmeli veya sürücünün font yerine doğrudan grafik (Raster) basmasını sağlamalısınız.

### Web uygulamasında hem Windows-1254 hem CP857 yazıcılar varsa nasıl yönetmeliyiz?
**Printzen SDK gibi modern kütüphaneler yazıcı donanım profilini (Printer Profile) tanımlama imkanı sunar.** Her yazıcıya profilinde `codePage: 'CP857'` veya `'WINDOWS-1254'` atanır; SDK gönderilecek metni hedef donanıma göre otomatik olarak doğru bayt dizisine dönüştürür.

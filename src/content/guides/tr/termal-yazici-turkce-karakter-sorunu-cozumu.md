---
title: "Termal Fiş Yazıcılarda Türkçe Karakter Sorunu ve Kesin Çözüm Rehberi"
description: "Termal yazıcılarda Ğ, İ, Ş, ç, ö, ü karakterlerinin bozulması, soru işareti veya garip simgeler basılması sorununu CP857, Windows-1254 ve UTF-8 kod sayfalarıyla çözün."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: thermal-printer-turkish-character-encoding-fix
---

Termal fiş yazıcılarla çalışan yazılım geliştiricilerin ve POS entegratörlerinin karşılaştığı en kronik problem, Türkçe karakterlerin fiş üzerinde bozuk çıkmasıdır: **"ş" yerine ters soru işareti "¿", "ı" yerine garip bir grafik sembolü, "ğ" yerine boşluk veya silik bir kutucuk basılması**.

Bu sorun bir donanım arızası veya kablo bozukluğu değildir. Termal yazıcıların dahili ROM belleğinde metinlerin nasıl yorumlanacağını belirleyen **kod sayfası (Code Page) mimarisi** ile modern web sistemlerinin varsayılan standardı olan **UTF-8 (Unicode)** arasındaki bayt uyuşmazlığından kaynaklanır.

Bu kapsamlı mühendislik kılavuzunda; ESC/POS kod sayfası mantığını, CP857 (DOS) ve Windows-1254 (CP1254) tablolarını, JavaScript/Node.js ile bayt dönüşümünü ve donanım desteği olmayan yazıcılar için akıllı transliterasyon mimarisini inceliyoruz.

---

## 1. Sorunun Kök Nedeni: Neden Türkçe Karakterler Bozulur?

Modern web ve bulut sistemleri metinleri **UTF-8** ile kodlar. UTF-8'de standart İngilizce ASCII karakterleri (A-Z, 0-9) tek bir bayt (0-127 arası) ile temsil edilirken; Türkçe'ye özgü harfler (`ç, ğ, ı, ö, ş, ü, Ç, Ğ, İ, Ö, Ş, Ü`) **2 baytlık diziler** olarak bellekte saklanır:

- `ş` harfi UTF-8'de: `0xC5 0x9F` (2 bayt)
- `ğ` harfi UTF-8'de: `0xC4 0x9F` (2 bayt)
- `ı` harfi UTF-8'de: `0xC4 0xB1` (2 bayt)

Geleneksel termal fiş yazıcıların mikrodenetleyicileri ise 8-bit genişletilmiş ASCII (0-255 arası) dünyasında yaşar. Yazıcıya UTF-8 formatında `ş` (`0xC5 0x9F`) gönderdiğinizde, yazıcı bunu tek bir harf olarak değil; **arka arkaya gelen bağımsız iki farklı grafik sembolü** olarak algılar. Sonuç olarak fişte `ÅŸ` gibi anlamsız glifler belirir.

---

## 2. Termal Yazıcı Kod Sayfaları (Code Pages)

Termal yazıcılarda 128 ile 255 arasındaki baytların hangi bölgesel alfabelere karşılık geleceği **Kod Sayfası (Code Page)** komutuyla seçilir. ESC/POS standardında kod sayfası seçimi şu komutla yapılır:

$$\text{ESC } t \text{ } n \quad \longrightarrow \quad \text{Hex: } \texttt{0x1B 0x74 [n]}$$

Buradaki `$n$` parametresi yazıcının donanım üreticisine göre değişen kod sayfası indeks numarasıdır.

### 2.1. CP857 (IBM DOS / Türk Standardı)
Türkiye pazarındaki Epson, Bixolon, Xprinter ve Hoin yazıcıların büyük çoğunluğunda Türkçe karakter seti **CP857** olarak gömülüdür.

- Epson modellerinde genellikle: `ESC t 18` (Hex: `1B 74 12`) veya `ESC t 50`
- Xprinter / Çin modellerinde: `ESC t 18`, `ESC t 38` veya `ESC t 70`

#### CP857 Türkçe Karakter Hex Tablosu:
| Karakter | Unicode (Hex) | CP857 Hex Değeri | Ondalık (Dec) |
|---|---|---|---|
| **ç** | `U+00E7` | `0x87` | 135 |
| **Ç** | `U+00C7` | `0x80` | 128 |
| **ğ** | `U+011F` | `0xA6` | 166 |
| **Ğ** | `U+011E` | `0xA7` | 167 |
| **ı** (noktasız) | `U+0131` | `0x8D` | 141 |
| **İ** (noktalı) | `U+0130` | `0x98` | 152 |
| **ö** | `U+00F6` | `0x94` | 148 |
| **Ö** | `U+00D6` | `0x99` | 153 |
| **ş** | `U+015F` | `0x9F` | 159 |
| **Ş** | `U+015E` | `0x9E` | 158 |
| **ü** | `U+00FC` | `0x81` | 129 |
| **Ü** | `U+00DC` | `0x9A` | 154 |

### 2.2. Windows-1254 (CP1254 / ISO-8859-9)
Windows tabanlı sürücüler ve bazı modern yazıcılar Windows-1254 tablosunu kullanır:

| Karakter | Windows-1254 Hex | CP857 Hex | Fark |
|---|---|---|---|
| **ğ / Ğ** | `0xF0` / `0xD0` | `0xA6` / `0xA7` | Tamamen farklı bayt dizilimi |
| **ı / İ** | `0xFD` / `0xDD` | `0x8D` / `0x98` | Farklı bayt |
| **ş / Ş** | `0xFE` / `0xDE` | `0x9F` / `0x9E` | Farklı bayt |

> ⚠️ **En Yaygın Hata:** Yazıcıyı CP857 moduna alıp veriyi Windows-1254 ile kodlanmış baytlarla gönderirseniz "ş" harfi kutu veya yanlış simge olarak çıkar. Kod sayfası seçimi ile gönderilen baytların haritası birebir eşleşmelidir.

---

## 3. Kod Sayfasını Öğrenme: Yazıcı Self-Test Raporu

Kullandığınız fiş yazıcının hangi kod sayfasını hangi indeks numarasıyla desteklediğini tahmin etmek yerine yazıcıdan **Self-Test (Dahili Durum) Raporu** almalısınız:

1. Yazıcının güç anahtarını kapatın.
2. Kağıt besleme (**FEED**) tuşuna parmağınızı basılı tutun.
3. Parmağınızı FEED tuşundan çekmeden güç anahtarını açın.
4. Yazıcı ciyaklama sesi verip ilk parametreleri basmaya başlayınca FEED tuşunu bırakın.
5. Yazdırılan fişin en altındaki **"Character Code Table"** veya **"Page List"** bölümünü inceleyin:
   - `Page 18: Turkish (CP857)`
   - `Page 50: CP857`
   - `Page 70: Windows-1254`

Burada görünen sayfa numarası, göndermeniz gereken `ESC t [n]` komutunun `$n$` parametresidir.

---

## 4. Yazılım Katmanında Çözüm Uygulaması (Node.js & JavaScript)

### 4.1. Node.js `iconv-lite` ile Bayt Dönüşümü

Node.js ortamında UTF-8 metinleri CP857 bayt dizisine çevirmek için endüstri standardı `iconv-lite` kütüphanesidir:

```typescript
import iconv from 'iconv-lite';

export function buildTurkishReceipt(): Buffer {
  const buffers: Buffer[] = [];

  // 1. Yazıcıyı Başlat (ESC @)
  buffers.push(Buffer.from([0x1B, 0x40]));

  // 2. Kod Sayfasını CP857 olarak seç (ESC t 18 -> 0x1B, 0x74, 0x12)
  buffers.push(Buffer.from([0x1B, 0x74, 18]));

  // 3. Yazdırılacak Türkçe Metin
  const receiptText = 
    "=== PRINTZEN LEZZET RESTORAN ===\n" +
    "Sipariş Tarihi: 10.09.2026 14:35\n" +
    "Masa: Bahçe 04\n" +
    "--------------------------------\n" +
    "1x Kaşarlı Pide          240.00 TL\n" +
    "1x Acılı Şalgam Suyu      45.00 TL\n" +
    "1x Fıstıklı Künefe       180.00 TL\n" +
    "--------------------------------\n" +
    "TOPLAM:                  465.00 TL\n" +
    "Afiyet Olsun. Yine Bekleriz!\n\n\n";

  // 4. Metni CP857 baytlarına dönüştür
  const encodedBody = iconv.encode(receiptText, 'cp857');
  buffers.push(encodedBody);

  // 5. Kağıt Kes (GS V 66 0 -> Tam Kesim)
  buffers.push(Buffer.from([0x1D, 0x56, 66, 0]));

  return Buffer.concat(buffers);
}
```

### 4.2. Tarayıcı Ortamında (Frontend / Pure JS) Bayt Eşleme

Frontend'de veya harici kütüphane eklenemeyen Web Bluetooth / WebUSB senaryolarında, 12 Türkçe karakteri doğrudan CP857 bayt karşılıklarına dönüştüren saf fonksiyon:

```javascript
function encodeTurkishCP857(text) {
  const cp857Map = {
    'ç': 0x87, 'Ç': 0x80,
    'ğ': 0xA6, 'Ğ': 0xA7,
    'ı': 0x8D, 'I': 0x49,
    'i': 0x69, 'İ': 0x98,
    'ö': 0x94, 'Ö': 0x99,
    'ş': 0x9F, 'Ş': 0x9E,
    'ü': 0x81, 'Ü': 0x9A
  };

  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (cp857Map[char] !== undefined) {
      bytes.push(cp857Map[char]);
    } else {
      const code = char.charCodeAt(0);
      // Standart ASCII aralığı
      bytes.push(code < 128 ? code : 0x3F); // Tanınmayanlara '?'
    }
  }
  return new Uint8Array(bytes);
}
```

---

## 5. Donanımı Değiştirilemeyen Yazıcılar İçin: Transliterasyon (Yumuşatma)

Bazı çok ucuz taşınabilir mobil fiş yazıcılarında (veya Uzak Doğu menşeli etiket makinelerinde) ROM belleğinde Türkçe karakter tablosu hiç bulunmaz. Bu yazıcılara CP857 gönderseniz bile harfler yine bozuk çıkar.

Bu durumda en temiz ve profesyonel yaklaşım, baskı öncesinde Türkçe karakterleri uluslararası ASCII karşılıklarına dönüştürmektir (**Transliteration**):

```javascript
export function transliterateTurkish(str) {
  return str
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U');
}
```

*Örnek Sonuç:*
- Girdi: `Kaşarlı Pide, Fıstıklı Künefe, Acılı Şalgam`
- Çıktı: `Kasarli Pide, Fistikli Kunefe, Acili Salgam`

Fişte `K¿¿arl¿ Pide` gibi çirkin semboller yerine `Kasarli Pide` yazması, müşteri gözünde çok daha temiz ve okunabilir bir sonuç sunar.

---

## 6. Sıkça Sorulan Sorular (SSS)

### Termal yazıcıda Türkçe karakterler neden soru işareti (?) olarak çıkıyor?
**Yazıcıya gönderdiğiniz verinin bayt kodları, yazıcının o an aktif olan karakter tablosunda (Code Page) tanımlı bir glife karşılık gelmediğinde yazıcı güvenlik mekanizması olarak soru işareti basar.** Çözüm için yazdırma işleminden hemen önce `0x1B 0x74 18` komutu gönderilerek yazıcının CP857 (Turkish) moduna geçirilmesi ve gönderilen string'in CP857 bayt dizisine dönüştürülmesi gerekir.

### ESC/POS kod sayfası komutu gönderdiğim halde yazıcı neden Türkçe basmıyor?
**Bunun en yaygın nedeni, yazıcının marka ve modeline göre Türkçe kod sayfası indeks numarasının farklı olmasıdır.** Örneğin Epson yazıcılarda CP857 için `18` veya `50` değeri kullanılırken, bazı Xprinter veya Posiflex modellerinde `38` veya `70` numarası atanmış olabilir. Yazıcının FEED tuşuna basılı tutarak açıp Self-Test fişi yazdırarak "Page List" altındaki doğru Türkçe tablo numarasını teyit etmelisiniz.

### Termal yazıcılar UTF-8'i doğrudan desteklemez mi?
**Yeni nesil bazı kurumsal Epson modelleri (örneğin TM-T88VI veya TM-T20III) UTF-8 modunu (FS ( C komutuyla) desteklese de, piyasadaki POS ve fiş yazıcılarının %90'ı 8-bit tek baytlık genişletilmiş ASCII kullanır.** Dolayısıyla güvenilir ve tüm yazıcılarda çalışan bir sistem kurmak için metinlerin yazıcıya gönderilmeden önce CP857 veya Windows-1254 formatına dönüştürülmesi endüstri standardıdır.

### Fiş yazıcıda Türkçe karakter sorununu tamamen çözmek için Printzen ne sunar?
**Printzen mobil ve bulut servisleri; bağlı yazıcının donanım modelini, ROM sürümünü ve kod sayfası yeteneğini otomatik olarak algılar.** Gönderdiğiniz UTF-8 metinleri yazıcının desteklediği en uygun kod sayfasına (CP857, Windows-1254) şeffaf şekilde dönüştürür; yazıcıda Türkçe ROM desteği yoksa akıllı transliterasyon uygulayarak fişlerin hiçbir zaman bozulmadan, kusursuz basılmasını sağlar.

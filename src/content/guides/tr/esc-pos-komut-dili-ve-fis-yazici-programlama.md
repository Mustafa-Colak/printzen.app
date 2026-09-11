---
title: "ESC/POS Komut Dili ve Termal Fiş Yazıcı Programlama Kılavuzu"
description: "Web ve masaüstü yazılımlar için ESC/POS standartları, hex kontrol kodları, kağıt kesici, para çekmecesi tetikleme, barkod/QR basımı ve Türkçe karakter mimarisi."
printerClass: desktop
brand: "Epson / Generic ESC/POS"
publishDate: 2026-09-10
translationKey: esc-pos-command-language-programming
---

Modern perakende, restoran, kargo ve otomasyon sistemlerinde kullanılan termal fiş yazıcılarının %95'inden fazlası, temel iletişim protokolü olarak **ESC/POS (Epson Standard Code for Point of Sale)** dilini kullanır. Tarayıcı tabanlı bir web POS, bulut restoran adisyonu veya mobil sipariş uygulaması geliştirirken işletim sisteminin standart yazdırma pencerelerini (Ctrl+P) atlayıp doğrudan termal kafaya bayt akıtmak istediğinizde bilmeniz gereken yegane standart ESC/POS'tur.

Bu kapsamlı rehberde; kontrol baytlarının mantığından kağıt kesmeye, nakit çekmecesini açmaktan 2D QR kod ve Türkçe karakter kod sayfalarına kadar tüm ESC/POS mimarisini çalışan JavaScript/TypeScript örnekleriyle ele alıyoruz.

---

## 1. ESC/POS Mimarisi Nasıl Çalışır?

ESC/POS, satır odaklı (*stream-based*) bir ikili (binary) iletişim protokolüdür. Yazıcıya gönderilen veriler temelde ikiye ayrılır:

1. **Basılacak Metin Baytları:** ASCII veya yerel kod sayfasına karşılık gelen harf, rakam ve semboller (Örn: `Siparis No: 142`).
2. **Kontrol Komutları:** Yazıcının donanımsal davranışını değiştiren kaçış (Escape) dizilimleri. Bu komutlar her zaman özel bir kontrol baytıyla başlar:
   - `ESC` (Hex: `0x1B`, Desimal: `27`): Temel metin, biçimlendirme ve sayfa ayarları.
   - `GS` (Hex: `0x1D`, Desimal: `29`): Barkod, QR kod, kesici ve görsel gibi gelişmiş fonksiyonlar.
   - `FS` (Hex: `0x1C`, Desimal: `28`): Çince/Japonca veya iki baytlık geniş karakter komutları.
   - `LF` (Hex: `0x0A`, Desimal: `10`): Satır besleme (*Line Feed*) — tamponu basar ve kağıdı bir satır ilerletir.

> 💡 **Temel Kural:** Termal yazıcılar çoğu komutu bir satır sonu (`0x0A` - LF) alana kadar dahili tampon belleğinde (*print buffer*) bekletir. Satırın fiziksel kağıda çıkması için metinlerin sonuna mutlaka `LF` eklenmelidir.

---

## 2. En Çok Kullanılan Temel Kontrol Komutları

Aşağıdaki tablo, bir satış fişinde veya adisyonda ihtiyaç duyacağınız temel kontrol komutlarını hex ve işlev bazında özetler:

| Fonksiyon | Hex Komut Dizilimi | Desimal Karşılığı | Açıklama & Parametreler |
|---|---|---|---|
| **Yazıcıyı Sıfırla (Initialize)** | `1B 40` | `27 64` | `ESC @` — Yazıcıyı varsayılan fabrika durumuna getirir. Fiş başlangıcında zorunludur. |
| **Metin Hizalama (Align)** | `1B 61 n` | `27 97 n` | `ESC a n` — `n=0`: Sola, `n=1`: Ortala, `n=2`: Sağa hizalar. |
| **Yazı Büyüklüğü (Size)** | `1D 21 n` | `29 33 n` | `GS ! n` — Bit 0-3: Yükseklik çarpanı, Bit 4-7: Genişlik çarpanı (0x00: Normal, 0x11: 2x2 Çift). |
| **Kalın Yazı (Bold)** | `1B 45 n` | `27 69 n` | `ESC E n` — `n=1`: Kalın (Bold) açar, `n=0`: Kapatır. |
| **Altı Çizili (Underline)** | `1B 2D n` | `27 45 n` | `ESC - n` — `n=1`: 1 nokta alt çizgi, `n=2`: 2 nokta kalın alt çizgi, `n=0`: Kapalı. |
| **Ters Renk (Invert/White-Black)** | `1D 42 n` | `29 66 n` | `GS B n` — Siyah zemin üzerine beyaz yazı (Negatif baskı). |
| **Otomatik Kağıt Kesme (Cut)** | `1D 56 42 n` | `29 86 66 n` | `GS V 66 n` — Kağıdı n nokta ilerletir ve kısmi kesim (Partial Cut) yapar. |
| **Çekmece Açma (Drawer Kick)** | `1B 70 00 19 FA` | `27 112 0 25 250` | `ESC p m t1 t2` — Kasa çekmecesinin solenoid bobinine 50ms darbe voltajı gönderir. |

---

## 3. Otomatik Kağıt Kesici (Auto-Cutter) ve Nakit Çekmecesi Tetikleme

### 3.1. Kağıt Kesiminde "Giyotin Kilitlenmesi" Tuzağı
Birçok yazılımcı fiş metninin hemen ardından `1D 56 00` (tam kesim) gönderir. Ancak termal kafa ile giyotin bıçağı arasında fiziksel olarak **15 ila 22 mm mesafe** vardır. Eğer metinden sonra en az 3-4 boş satır besleme (`LF`) yapmadan kesim komutu verirseniz, son satır bıçağın altında kalır veya kesilir.

Doğru kesme protokolü:
```javascript
// 4 satır kağıt besle ve kısmi kes (1 tutucu nokta bırakır, yere düşmez)
const CUT_COMMAND = new Uint8Array([0x1B, 0x64, 0x04, 0x1D, 0x56, 0x01]);
```

### 3.2. Para Çekmecesini Tetikleme (Pulse Drawer)
Fiş yazıcılarının arkasında yer alan RJ11/RJ12 telefon soketi benzeri port, aslında para çekmecesinin 24V solenoid bobinine bağlıdır. Fiş çıktığı an çekmecenin "çıt" sesiyle fırlaması için şu komut dizisi kullanılır:

```javascript
// Pin 2'ye bağlı çekmeceyi 50ms tetikle
const OPEN_DRAWER = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
```

---

## 4. Termal Fişe Karekod (QR Code) ve Barkod Basımı

ESC/POS standardında modern 2D QR kod basımı 4 ardışık fonksiyondan oluşur:

1. **Model Seçimi (GS ( k ... 41):** Model 2 (en yaygın standart) seçilir.
2. **Hücre Boyutu / Büyüklük (GS ( k ... 43):** Modül piksel genişliği ayarlanır (Örn: `3` veya `4` piksel).
3. **Hata Düzeltme Seviyesi (GS ( k ... 44):** L (%7), M (%15), Q (%25), H (%30). Fiş kağıtları buruşabildiği için **M (%15)** veya **Q (%25)** tavsiye edilir.
4. **Veriyi Depolama ve Yazdırma (GS ( k ... 42 ve 45):** URL veya metin tampona yazılır ve basılır.

```javascript
function buildQrCodeBytes(text) {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  const len = textBytes.length + 3;
  const pL = len % 256;
  const pH = Math.floor(len / 256);

  return new Uint8Array([
    // 1. QR Model 2
    0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00,
    // 2. Modül Boyutu: 4 nokta
    0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x04,
    // 3. Hata Düzeltme Seviyesi: M
    0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31,
    // 4. Veri yükleme
    0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30, ...textBytes,
    // 5. QR Kodu Ekrana Bas
    0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30
  ]);
}
```

---

## 5. Termal Fişte Türkçe Karakter Çözümü: CP857 ve Windows-1254

Standart bir termal yazıcıya JavaScript'in yerel UTF-8 karakterleriyle `Ş, Ğ, İ, ı, ö, ü, ç` gönderdiğinizde yazıcı bu baytları tanıyamaz ve fişte `?`, `├` gibi anlamsız glifler çıkar.

Bunun kesin çözümü yazıcıya doğru kod sayfasını (*Code Page*) seçtirmektir:

```javascript
// 1. Yazıcıyı CP857 (DOS Turkish) kod sayfasına al
const SET_CP857 = new Uint8Array([0x1B, 0x74, 0x12]); // Bazı modellerde 18 (0x12) veya 25 (0x19)

// 2. Türkçe Karakterleri CP857 Hex Baytlarına Dönüştürme Tablosu
const CP857_MAP = {
  'ç': 0x87, 'Ç': 0x80,
  'ğ': 0xA7, 'Ğ': 0xA6,
  'ı': 0x8D, 'I': 0x49,
  'i': 0x69, 'İ': 0x98,
  'ö': 0x94, 'Ö': 0x99,
  'ş': 0x9F, 'Ş': 0x9E,
  'ü': 0x81, 'Ü': 0x9A
};
```

---

## 6. JavaScript ile Uçtan Uca Fiş Oluşturma Örneği

Aşağıdaki saf TypeScript/JavaScript modülü; harici hiçbir kütüphaneye bağımlı kalmadan temiz bir 80mm satış adisyon bayt dizisi üretir:

```typescript
export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  init() {
    this.buffer.push(0x1B, 0x40); // ESC @ (Reset)
    return this;
  }

  align(alignment: 'left' | 'center' | 'right') {
    const val = alignment === 'center' ? 1 : alignment === 'right' ? 2 : 0;
    this.buffer.push(0x1B, 0x61, val);
    return this;
  }

  bold(enable: boolean) {
    this.buffer.push(0x1B, 0x45, enable ? 1 : 0);
    return this;
  }

  text(str: string) {
    // CP857 tablosuna göre bayt kodlama
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const byte = CP857_MAP[char] || str.charCodeAt(i);
      this.buffer.push(byte);
    }
    return this;
  }

  line(str: string = '') {
    this.text(str);
    this.buffer.push(0x0A); // LF
    return this;
  }

  twoColumnRow(left: string, right: string, totalWidth: number = 42) {
    const spaceCount = Math.max(1, totalWidth - left.length - right.length);
    this.line(left + ' '.repeat(spaceCount) + right);
    return this;
  }

  divider(char: string = '-', width: number = 42) {
    this.line(char.repeat(width));
    return this;
  }

  cut() {
    this.buffer.push(0x1B, 0x64, 0x04); // 4 satır besle
    this.buffer.push(0x1D, 0x56, 0x01); // Kısmi kesim
    return this;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
```

---

## 7. Sıkça Sorulan Sorular (SSS)

### ESC/POS komutları her marka termal yazıcıda çalışır mı?
**Evet, ESC/POS termal fiş yazıcıları arasında evrensel kabul edilen bir endüstri standardıdır.** Epson, Xprinter, Rongta, Sewoo, Bixolon ve Star Micronics (ESC/POS modunda) gibi pazardaki markaların neredeyse tümü temel komut setini (hizalama, kalın yazı, kağıt kesme, çekmece açma) birebir destekler. Yalnızca 2D QR kod ve logo basma komutlarının bazı ucuz klon modellerde alt fonksiyon numaraları değişiklik gösterebilir.

### 58 mm ve 80 mm yazıcılar için satır genişliği kaç karakter olmalıdır?
**80 mm yazıcılarda standart fontla 42 ila 48 karakter, 58 mm yazıcılarda ise 32 karakterdir.** Fiş şablonu tasarlarken sol ve sağ kolonları hizalı basmak için (örneğin ürün adı solda, fiyatı en sağda) 80 mm rulolar için toplam 42 karakterlik bir satır genişliğini referans almak tüm yazıcılarda taşma yapmadan kusursuz görünüm sağlar.

### Termal yazıcıda kağıt kesilmiyor veya kesici kilitleniyorsa ne yapılmalıdır?
**Genellikle komuttan önce yeterli satır besleme (Line Feed) yapılmamasından veya tam kesim bıçak aşınmasından kaynaklanır.** Yazıcı kapağını açıp bıçak çarkını manuel olarak geri çevirin. Yazılım tarafında ise tam kesim (`0x1D 0x56 0x00`) yerine daima 4 satır boşluk bırakıp kısmi kesim (`0x1D 0x56 0x01`) komutunu kullanın; kısmi kesim bıçağın ömrünü 3 kat uzatır ve fişin yere düşmesini önler.

### Tarayıcıdan (Chrome) ESC/POS komutları doğrudan gönderilebilir mi?
**Evet, Web Bluetooth API veya WebUSB API kullanılarak hiçbir harici sürücüye ihtiyaç duymadan doğrudan gönderilebilir.** Standart `window.print()` yazdırma fonksiyonu tarayıcı marjinleri ve A4 diyaloğu çıkardığı için kullanılamaz; bunun yerine Web Bluetooth veya Printzen Web SDK ile yazıcının GATT karakteristik servisine doğrudan `Uint8Array` bayt dizisi iletilir.

### Fiş yazıcıda Türkçe karakterler neden '?' veya garip şekiller olarak çıkıyor?
**Yazıcının dahili kod sayfası varsayılan olarak CP437 (İngilizce/ASCII) kaldığı için UTF-8 Türkçe baytları eşleşmez.** Çözüm için fişin en başında `0x1B 0x74 0x12` komutu ile yazıcı donanımı CP857 (DOS Turkish) veya Windows-1254 moduna alınmalı; gönderilen JavaScript metni de ilgili hex karakter karşılıklarına dönüştürülerek bayt dizisi halinde yazıcıya iletilmelidir.

## ESC/POS Komut Referans Tablosu

| Komut | Hex | Açıklama |
|-------|-----|----------|
| ESC @ | 1B 40 | Yazıcıyı başlangıç durumuna sıfırla |
| ESC E n | 1B 45 01/00 | Kalın yazı aç/kapat |
| ESC ! n | 1B 21 nn | Bileşik karakter stili |
| GS V m | 1D 56 41/42 | Kağıt kesme (full/partial cut) |
| ESC p m t1 t2 | 1B 70 | Para çekmecesi aç |
| GS k m | 1D 6B | Barkod basmaya geçiş |
| ESC t n | 1B 74 | Karakter kod sayfası seç |

## ESC/POS ile Gerçek Kod Örneği

```javascript
// Printzen SDK ile ESC/POS komutları
import { PrintzenPrinter } from '@printzen/sdk';

const printer = new PrintzenPrinter({ interface: 'bluetooth' });
await printer.connect();

// Fiş başlığı
await printer.write([
  0x1B, 0x40,        // sıfırla
  0x1B, 0x61, 0x01,  // ortala
  0x1B, 0x21, 0x10,  // büyük font
]);
await printer.text('KAFE OLIMPOS
');
await printer.text('================================
');

// Ürün satırı
await printer.write([0x1B, 0x61, 0x00]); // sola hizala
await printer.text('Americano x2          30.00 TL
');

// Toplam
await printer.write([0x1B, 0x45, 0x01]); // kalın
await printer.text('TOPLAM:               30.00 TL
');
await printer.write([0x1B, 0x45, 0x00]); // kalın kapat

// Kağıt kes + para çekmecesi aç
await printer.write([
  0x1D, 0x56, 0x41, 0x03,  // full cut
  0x1B, 0x70, 0x00, 0x19, 0xFA // para çekmecesi
]);
await printer.disconnect();
```

## ESC/POS Bağlantı Türleri

### USB (WebUSB)
Modern tarayıcılarda WebUSB API ile yazıcıya doğrudan bağlanabilirsiniz:
```javascript
const device = await navigator.usb.requestDevice({
  filters: [{ vendorId: 0x04b8 }] // Epson vendor ID
});
await device.open();
await device.selectConfiguration(1);
await device.claimInterface(0);
```

### Ethernet (Raw TCP Port 9100)
Ağ üzerinden bağlantı için port 9100 kullanılır:
```javascript
const ws = new WebSocket('ws://yazici-ip:9100');
ws.binaryType = 'arraybuffer';
ws.send(new Uint8Array([0x1B, 0x40, ...]));
```

### Bluetooth (Web Bluetooth API)
```javascript
const device = await navigator.bluetooth.requestDevice({
  filters: [{ namePrefix: 'TM-T' }],
  optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
});
```

## ESC/POS Moda Göre Yazıcı Davranışları

### Sayfa Modu vs Satır Modu
- **Satır Modu (Line Mode):** Varsayılan. Her satır yazıldıkça kağıt ilerler.
- **Sayfa Modu (Page Mode):** ESC L ile aktif edilir. Fiş tamamen oluşturulur, tek seferde basılır.

### Yazı Büyüklükleri
ESC ! komutuyla 8 farklı karakter büyüklüğü seçilebilir:
- Normal: 0x00
- Çift geniş: 0x20
- Çift yüksek: 0x10
- 2x (her iki yon): 0x30

## Yaygın ESC/POS Hataları ve Çözümleri

### 1. Türkçe Karakterler Bozuk Çıkıyor
Kod sayfasını manuel ayarlayın: `ESC t 19` (0x1B 0x74 0x13) CP857 Türkçe.

### 2. Barkod Okunmuyor
GS k komutundan önce minimum 3 boşluk satırı (0x0A 0x0A 0x0A) bırakın.

### 3. Yazıcı ESC @ Sonrası Tepki Vermiyor
Bazı yazıcılarda reset sonrası 100ms bekleme (setTimeout) gerekir.

### 4. Para Çekmecesi Açılmıyor
RJ-11 yerine RJ-12 kablo kullandığınızdan emin olun. Pin 2 (24V) – Pin 5 (GND) olmalı.

## Desteklenen Yazıcılar ve Uyumluluk

ESC/POS tüm büyük markalar tarafından desteklenir:
- **Epson:** TM-T20III, TM-T88VI, TM-T88VII, TM-m30II
- **Xprinter:** XP-420B, XP-365B, XP-470B
- **Star Micronics:** TSP143III, TSP654II (StarPRNT üzerinden)
- **Bixolon:** SRP-330II, SRP-350III, SRP-Q300
- **Generic:** Çin yapımı 80mm termal yazıcıların %90'ı


## Bu Konudaki Yazıcı Modeli Rehberleri

- [Bixolon Slp Tx400 Esc](/tr/rehber/bixolon-slp-tx400-esc-pos-komut-dili-ve-fis-yazici-programlama)
- [Bixolon Spp R200iii Esc](/tr/rehber/bixolon-spp-r200iii-esc-pos-komut-dili-ve-fis-yazici-programlama)
- [Bixolon Spp R310 Esc](/tr/rehber/bixolon-spp-r310-esc-pos-komut-dili-ve-fis-yazici-programlama)
- [Bixolon Srp 330ii Esc](/tr/rehber/bixolon-srp-330ii-esc-pos-komut-dili-ve-fis-yazici-programlama)
- [Bixolon Srp 350iii Esc](/tr/rehber/bixolon-srp-350iii-esc-pos-komut-dili-ve-fis-yazici-programlama)
- [Bixolon Srp Q300 Esc](/tr/rehber/bixolon-srp-q300-esc-pos-komut-dili-ve-fis-yazici-programlama)
- [Epson Tm L90 Esc](/tr/rehber/epson-tm-l90-esc-pos-komut-dili-ve-fis-yazici-programlama)
- [Epson Tm M30ii Esc](/tr/rehber/epson-tm-m30ii-esc-pos-komut-dili-ve-fis-yazici-programlama)

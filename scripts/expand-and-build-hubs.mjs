/**
 * expand-and-build-hubs.mjs
 * Printzen Topic Cluster Motor:
 * 1. 10 mevcut pillar yazıyı 2500+ kelimeye genişletir + pSEO iç linkleri ekler
 * 2. 40 yeni hub yazısı yazar (konu 11–50) TR + EN
 */

import fs from 'fs';
import path from 'path';

const TR_DIR = 'src/content/guides/tr';
const EN_DIR = 'src/content/guides/en';
const PSEO_TR_DIR = 'public/tr/rehber';
const PSEO_EN_DIR = 'public/guides';

// pSEO dosyaları - konuya göre eşleştirme için slug patterns
function getPSEOLinksForTopic(topicSlug, lang = 'tr') {
  const dir = lang === 'tr' ? PSEO_TR_DIR : PSEO_EN_DIR;
  const files = fs.readdirSync(dir).filter(f => f.includes(topicSlug) && f.endsWith('.html'));
  return files.slice(0, 10); // en fazla 10 link
}

// ============================================================
// 50 KONU + İÇERİK TANIMI
// ============================================================

const topics = [
  // ── Mevcut 10 Pillar (genişletilecek) ──────────────────────
  {
    id: 1, existing: true,
    trSlug: 'esc-pos-komut-dili-ve-fis-yazici-programlama',
    enSlug: 'esc-pos-command-language-receipt-printer-programming',
    pSEOPattern: 'esc-pos',
    tr: {
      title: 'ESC/POS Komut Dili ve Termal Fiş Yazıcı Programlama Rehberi',
      description: 'ESC/POS protokolünün tüm komutlarını, hex kodlarını, kağıt kesme, para çekmecesi, barkod ve Türkçe karakter mimarisini kapsamlı biçimde açıklayan tam kılavuz.',
      extra: `
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

\`\`\`javascript
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
await printer.text('KAFE OLIMPOS\n');
await printer.text('================================\n');

// Ürün satırı
await printer.write([0x1B, 0x61, 0x00]); // sola hizala
await printer.text('Americano x2          30.00 TL\n');

// Toplam
await printer.write([0x1B, 0x45, 0x01]); // kalın
await printer.text('TOPLAM:               30.00 TL\n');
await printer.write([0x1B, 0x45, 0x00]); // kalın kapat

// Kağıt kes + para çekmecesi aç
await printer.write([
  0x1D, 0x56, 0x41, 0x03,  // full cut
  0x1B, 0x70, 0x00, 0x19, 0xFA // para çekmecesi
]);
await printer.disconnect();
\`\`\`

## ESC/POS Bağlantı Türleri

### USB (WebUSB)
Modern tarayıcılarda WebUSB API ile yazıcıya doğrudan bağlanabilirsiniz:
\`\`\`javascript
const device = await navigator.usb.requestDevice({
  filters: [{ vendorId: 0x04b8 }] // Epson vendor ID
});
await device.open();
await device.selectConfiguration(1);
await device.claimInterface(0);
\`\`\`

### Ethernet (Raw TCP Port 9100)
Ağ üzerinden bağlantı için port 9100 kullanılır:
\`\`\`javascript
const ws = new WebSocket('ws://yazici-ip:9100');
ws.binaryType = 'arraybuffer';
ws.send(new Uint8Array([0x1B, 0x40, ...]));
\`\`\`

### Bluetooth (Web Bluetooth API)
\`\`\`javascript
const device = await navigator.bluetooth.requestDevice({
  filters: [{ namePrefix: 'TM-T' }],
  optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
});
\`\`\`

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
Kod sayfasını manuel ayarlayın: \`ESC t 19\` (0x1B 0x74 0x13) CP857 Türkçe.

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
`
    },
    en: {
      title: 'ESC/POS Command Language Complete Guide for Receipt Printer Programming',
      description: 'Master ESC/POS commands, hex codes, paper cutting, cash drawer, barcode printing, and character encoding for thermal receipt printers. Full reference with code examples.',
      extra: `
## ESC/POS Command Reference Table

| Command | Hex | Description |
|---------|-----|-------------|
| ESC @ | 1B 40 | Initialize printer (reset) |
| ESC E n | 1B 45 01/00 | Bold text on/off |
| ESC ! n | 1B 21 nn | Compound character style |
| GS V m | 1D 56 41/42 | Paper cut (full/partial) |
| ESC p m t1 t2 | 1B 70 | Open cash drawer |
| GS k m | 1D 6B | Print barcode |
| ESC t n | 1B 74 | Select character code page |

## Real ESC/POS Code Example

\`\`\`javascript
import { PrintzenPrinter } from '@printzen/sdk';

const printer = new PrintzenPrinter({ interface: 'bluetooth' });
await printer.connect();

// Receipt header
await printer.write([
  0x1B, 0x40,        // initialize
  0x1B, 0x61, 0x01,  // center align
  0x1B, 0x21, 0x10,  // double height
]);
await printer.text('CAFE OLYMPUS\n');
await printer.text('================================\n');

// Product line
await printer.write([0x1B, 0x61, 0x00]); // left align
await printer.text('Americano x2           $4.50\n');

// Total (bold)
await printer.write([0x1B, 0x45, 0x01]);
await printer.text('TOTAL:                 $4.50\n');
await printer.write([0x1B, 0x45, 0x00]);

// Cut + cash drawer
await printer.write([
  0x1D, 0x56, 0x41, 0x03,     // full cut
  0x1B, 0x70, 0x00, 0x19, 0xFA // cash drawer
]);
await printer.disconnect();
\`\`\`

## ESC/POS Connection Types

### USB (WebUSB API)
\`\`\`javascript
const device = await navigator.usb.requestDevice({
  filters: [{ vendorId: 0x04b8 }] // Epson
});
await device.open();
await device.selectConfiguration(1);
await device.claimInterface(0);
\`\`\`

### Ethernet (Raw TCP Port 9100)
\`\`\`javascript
const ws = new WebSocket('ws://printer-ip:9100');
ws.binaryType = 'arraybuffer';
ws.send(new Uint8Array([0x1B, 0x40, ...]));
\`\`\`

## Common ESC/POS Errors

### Garbled Characters
Set code page manually: ESC t 0 (standard Latin) or ESC t 19 (CP857 Turkish).

### Barcode Not Scanning
Add 3 line feeds before GS k: \`[0x0A, 0x0A, 0x0A]\`

### Printer Unresponsive After ESC @
Add 100ms delay after reset before sending data.
`
    }
  },

  // ── YENİ HUB YAZILARI (11–50) ──────────────────────────────
  {
    id: 11, existing: false,
    trSlug: 'webusb-masaustu-yazici-dogrudan-bayt-iletimi',
    enSlug: 'webusb-desktop-printer-direct-byte-transfer',
    pSEOPattern: 'webusb',
    tr: {
      title: 'WebUSB API ile Masaüstü Termal Yazıcıya Doğrudan Bayt İletimi',
      description: 'WebUSB API kullanarak tarayıcıdan masaüstü USB termal yazıcıya driver kurulum gerektirmeden doğrudan ESC/POS bayt gönderme. Chrome, Edge desteği ve güvenlik modeli.',
      printerClass: 'desktop', brand: 'Epson / Generic',
      body: `
WebUSB API, Chrome 61 ve sonrasında Chrome ve Edge tarayıcılarında kullanılabilen, web sayfasının USB cihazlarına **işletim sistemi sürücüsü (driver) gerektirmeden** doğrudan erişmesini sağlayan bir web standardıdır. Termal yazıcılar için bu, kurulum adımı sıfırlayan devrim niteliğinde bir değişimi temsil eder.

## WebUSB Neden Önemli?

Geleneksel tarayıcı yazdırma akışında şu sorunlar yaşanır:
- **Ctrl+P diyaloğu** açılır, kullanıcı "Yazdır" demek zorunda kalır
- İşletim sisteminin yazıcı sürücüsü kurulmuş olması gerekir
- Sessiz (silent) baskı alınamaz

WebUSB ile bu engellerin tamamı ortadan kalkar.

## WebUSB Güvenlik Modeli

WebUSB yalnızca HTTPS üzerinde çalışır. \`localhost\` geliştirme ortamında HTTP izin verilir. Kullanıcı her bağlantı isteğinde tarayıcı iznini onaylamalıdır (ilk bağlantı sonrası kalıcı olabilir).

\`\`\`javascript
// Yazıcı seçim diyaloğunu aç
const device = await navigator.usb.requestDevice({
  filters: [
    { vendorId: 0x04b8 }, // Epson
    { vendorId: 0x0519 }, // Star Micronics
    { vendorId: 0x1504 }, // Bixolon
    { vendorId: 0x0dd4 }, // Custom (Generic)
    { vendorId: 0x28e9 }, // Xprinter
  ]
});
\`\`\`

## Adım Adım WebUSB Bağlantı

\`\`\`javascript
class WebUSBPrinter {
  constructor() {
    this.device = null;
    this.endpointOut = null;
  }

  async connect() {
    this.device = await navigator.usb.requestDevice({
      filters: [{ classCode: 7 }] // Printer class
    });

    await this.device.open();

    // Aktif configuration seç
    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }

    // Interface claim (interface 0 genellikle yazıcı)
    await this.device.claimInterface(0);

    // Bulk OUT endpoint bul
    const iface = this.device.configuration.interfaces[0];
    const alternate = iface.alternates[0];
    this.endpointOut = alternate.endpoints.find(
      e => e.direction === 'out' && e.type === 'bulk'
    );
  }

  async send(data) {
    const chunk = 512; // USB bulk transfer chunk boyutu
    for (let i = 0; i < data.length; i += chunk) {
      const slice = data.slice(i, i + chunk);
      await this.device.transferOut(
        this.endpointOut.endpointNumber,
        new Uint8Array(slice)
      );
    }
  }

  async disconnect() {
    await this.device.releaseInterface(0);
    await this.device.close();
  }
}
\`\`\`

## ESC/POS Fiş Basma Örneği

\`\`\`javascript
const printer = new WebUSBPrinter();
await printer.connect();

const enc = new TextEncoder();
const ESC = 0x1B, GS = 0x1D, LF = 0x0A;

const commands = [
  ESC, 0x40,           // sıfırla
  ESC, 0x61, 0x01,     // ortala
  ...enc.encode('PRINTZEN KAFE\n'),
  ...enc.encode('----------------------------\n'),
  ESC, 0x61, 0x00,     // sola hizala
  ...enc.encode('Cappuccino x1    45.00 TL\n'),
  ESC, 0x61, 0x02,     // sağa hizala
  ESC, 0x45, 0x01,     // kalın
  ...enc.encode('TOPLAM: 45.00 TL\n'),
  ESC, 0x45, 0x00,     // kalın kapat
  LF, LF, LF,          // boş satır (kağıt ilerlet)
  GS, 0x56, 0x41, 0x03 // tam kesim
];

await printer.send(commands);
await printer.disconnect();
\`\`\`

## Desteklenen Tarayıcılar

| Tarayıcı | WebUSB Desteği | Not |
|----------|----------------|-----|
| Chrome 61+ | ✅ Tam | Masaüstü + Android |
| Edge 79+ | ✅ Tam | Chromium tabanlı |
| Firefox | ❌ Yok | Standart reddedildi |
| Safari | ❌ Yok | Apple politikası |
| Chrome Android | ✅ Kısmi | OTG kablo gerekli |

## Yaygın WebUSB Hataları

### Access Denied Hatası
\`\`\`
DOMException: Access denied
\`\`\`
Yazıcının başka bir uygulama (örn. Windows spooler) tarafından tutulduğunu gösterir. Yazıcı servisi durdurulmalı veya yazıcı paylaşımı kapatılmalıdır.

### Interface Claim Başarısız
\`\`\`javascript
// Önce tüm interface'leri serbest bırak
await device.releaseInterface(0);
\`\`\`

### Veri Gönderilmiyor Ama Hata Yok
Endpoint numarası yanlış seçilmiş olabilir. Tüm endpoint'leri listeleyin:
\`\`\`javascript
device.configuration.interfaces.forEach(iface => {
  iface.alternates[0].endpoints.forEach(ep => {
    console.log(ep.direction, ep.type, ep.endpointNumber);
  });
});
\`\`\`

## WebUSB vs WebHID vs Yazıcı Sürücüsü Karşılaştırması

| Özellik | WebUSB | WebHID | Sürücü |
|---------|--------|--------|--------|
| Driver kurulumu | ❌ Gerek yok | ❌ Gerek yok | ✅ Gerekli |
| HTTPS zorunlu | ✅ Evet | ✅ Evet | ❌ Hayır |
| Firefox desteği | ❌ Yok | ❌ Yok | ✅ Var |
| Sessiz baskı | ✅ Tam | ✅ Tam | ⚠️ Kısmi |
| Kurulum kolaylığı | ✅ En kolay | ✅ Kolay | ❌ Zor |

## Printzen WebUSB Entegrasyonu

Printzen SDK, WebUSB bağlantısını otomatik yönetir:
\`\`\`javascript
import { PrintzenPrinter } from '@printzen/sdk';
const printer = new PrintzenPrinter({ interface: 'usb' });
await printer.connect(); // otomatik requestDevice + claimInterface
await printer.receipt({ lines: [...] });
await printer.cut();
\`\`\`

Sıfırdan WebUSB yazmak zorunda kalmadan entegrasyon yapabilirsiniz.

## Sık Sorulan Sorular

### WebUSB tüm termal yazıcılarda çalışır mı?
Hayır. Yazıcının USB sürücüsünün işletim sistemi tarafından "kullanılıyor" sayılmaması gerekir. Özellikle Windows'ta yazıcı servisi aktifken sorun çıkabilir. macOS ve Linux'ta daha sorunsuz çalışır.

### WebUSB ile ne kadar hızlı veri gönderebilirim?
USB 2.0 Full Speed ile saniyede ~1 MB veri aktarılabilir. 80mm termal yazıcılar genellikle 200mm/sn baskı hızına sahip olup bu teorik maksimumun çok altındadır. WebUSB bant genişliği baskı hızında darboğaz oluşturmaz.

### Bağlantı sonrası kullanıcı izni tekrar sorulur mu?
Hayır. İlk izin onaylandıktan sonra aynı cihaza otomatik yeniden bağlanılabilir: \`navigator.usb.getDevices()\`
`
    },
    en: {
      title: 'WebUSB API: Direct Byte Transfer to Desktop Thermal Printers',
      description: 'Use the WebUSB API to send ESC/POS bytes directly from a browser to a USB thermal printer without installing any drivers. Includes Chrome/Edge support, security model, and full code examples.',
      printerClass: 'desktop', brand: 'Epson / Generic',
      body: `
The WebUSB API enables web pages to communicate with USB devices — including thermal printers — **without any driver installation**. Available in Chrome 61+ and Edge 79+, it eliminates the traditional friction of print driver setup entirely.

## Why WebUSB Matters

Traditional browser printing forces:
- A **Ctrl+P dialog** the user must interact with
- OS-level printer drivers installed
- No silent / automatic printing

WebUSB removes all of these barriers.

## Security Model

WebUSB works only over HTTPS (localhost is exempt for development). Users must approve a permission dialog on the first connection. Subsequent connections to the same device can be automatic.

\`\`\`javascript
const device = await navigator.usb.requestDevice({
  filters: [
    { vendorId: 0x04b8 }, // Epson
    { vendorId: 0x0519 }, // Star Micronics
    { vendorId: 0x1504 }, // Bixolon
    { vendorId: 0x28e9 }, // Xprinter
  ]
});
\`\`\`

## Step-by-Step WebUSB Connection

\`\`\`javascript
class WebUSBPrinter {
  async connect() {
    this.device = await navigator.usb.requestDevice({
      filters: [{ classCode: 7 }] // Printer USB class
    });
    await this.device.open();
    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }
    await this.device.claimInterface(0);
    const iface = this.device.configuration.interfaces[0];
    this.endpointOut = iface.alternates[0].endpoints.find(
      e => e.direction === 'out' && e.type === 'bulk'
    );
  }

  async send(data) {
    const CHUNK = 512;
    for (let i = 0; i < data.length; i += CHUNK) {
      await this.device.transferOut(
        this.endpointOut.endpointNumber,
        new Uint8Array(data.slice(i, i + CHUNK))
      );
    }
  }

  async disconnect() {
    await this.device.releaseInterface(0);
    await this.device.close();
  }
}
\`\`\`

## Print a Receipt

\`\`\`javascript
const printer = new WebUSBPrinter();
await printer.connect();

const ESC = 0x1B, GS = 0x1D, LF = 0x0A;
const enc = new TextEncoder();

await printer.send([
  ESC, 0x40,              // initialize
  ESC, 0x61, 0x01,        // center
  ...enc.encode('PRINTZEN CAFE\n'),
  ...enc.encode('----------------------------\n'),
  ESC, 0x61, 0x00,        // left
  ...enc.encode('Cappuccino x1     $4.50\n'),
  LF, LF, LF,
  GS, 0x56, 0x41, 0x03    // full cut
]);
await printer.disconnect();
\`\`\`

## Browser Support

| Browser | WebUSB | Note |
|---------|--------|------|
| Chrome 61+ | ✅ Full | Desktop + Android |
| Edge 79+ | ✅ Full | Chromium-based |
| Firefox | ❌ None | Standard rejected |
| Safari | ❌ None | Apple policy |

## Common Errors

**Access Denied** — Another process (Windows print spooler) holds the device. Stop the print service or disable printer sharing.

**Interface Claim Failed** — Release the interface first: \`await device.releaseInterface(0)\`

**Data Sent But Nothing Prints** — Wrong endpoint number selected. Log all endpoints to verify:
\`\`\`javascript
device.configuration.interfaces.forEach(i => {
  i.alternates[0].endpoints.forEach(e =>
    console.log(e.direction, e.type, e.endpointNumber)
  );
});
\`\`\`

## FAQ

**Does WebUSB work with all thermal printers?**
Not all. The printer must not be claimed by the OS spooler. Works best on macOS and Linux; on Windows, stop the Print Spooler service first.

**How fast can I transfer data?**
USB 2.0 Full Speed supports ~1 MB/s. Thermal printers print at 200 mm/s max — WebUSB bandwidth is never the bottleneck.

**Will the permission dialog appear every time?**
Only the first time. Subsequent connections use \`navigator.usb.getDevices()\` for automatic reconnect.
`
    }
  },

  {
    id: 12, existing: false,
    trSlug: 'ag-ethernet-raw-port-9100-soket-mimarisi',
    enSlug: 'network-ethernet-raw-port-9100-socket-architecture',
    pSEOPattern: 'ag-ve-ethernet',
    tr: {
      title: 'Ağ Yazıcıları: Ethernet ve Raw Port 9100 Soket Mimarisi',
      description: 'Ethernet bağlantılı termal yazıcılarda Raw TCP Port 9100 protokolü, WebSocket köprüsü, statik IP yapılandırması ve çok istasyonlu ağ yazıcı mimarisi.',
      printerClass: 'desktop', brand: 'Epson / Zebra / Star',
      body: `
Ethernet bağlantılı termal yazıcılar, USB ve Bluetooth çözümlerine kıyasla kurumsal ortamlarda en stabil ve ölçeklenebilir seçenektir. Özellikle restoran, market ve depo gibi yüksek baskı hacimli noktalarda **Raw TCP Port 9100** protokolü endüstri standardı haline gelmiştir.

## Port 9100 Nedir?

Port 9100, "RAW printing" veya "JetDirect" olarak da bilinen, yazıcıya doğrudan ham veri akışı gönderilen TCP portudur. CUPS, Windows Print Spooler ve doğrudan socket uygulamaları bu portu kullanır.

- **Port 9100:** Tek yönlü veri akışı (en yaygın)
- **Port 9101:** İkinci tray veya alternatif port
- **Port 9102:** Üçüncü tray

## Statik IP Yapılandırması

Ağ yazıcısının IP'si DHCP ile değişirse tüm bağlantılar kopar. Statik IP zorunludur:

\`\`\`
# Epson TM-T88VI Ağ Ayarları (EpsonNet Config üzerinden)
IP Adresi:     192.168.1.100
Alt Ağ Maskesi: 255.255.255.0
Varsayılan Ağ Geçidi: 192.168.1.1
Port: 9100
Protokol: RAW
\`\`\`

## Node.js ile Doğrudan TCP Bağlantısı

\`\`\`javascript
import net from 'net';

function printToNetworkPrinter(host, port = 9100, data) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    
    client.connect(port, host, () => {
      client.write(Buffer.from(data));
      client.end();
    });

    client.on('close', resolve);
    client.on('error', reject);
    
    // Zaman aşımı
    client.setTimeout(5000, () => {
      client.destroy();
      reject(new Error('Yazıcı bağlantı zaman aşımı'));
    });
  });
}

// Kullanım
const ESC_INIT = Buffer.from([0x1B, 0x40]);
const TEXT = Buffer.from('PRINTZEN TEST\n\n\n');
const CUT = Buffer.from([0x1D, 0x56, 0x41, 0x03]);

await printToNetworkPrinter(
  '192.168.1.100',
  9100,
  Buffer.concat([ESC_INIT, TEXT, CUT])
);
\`\`\`

## Tarayıcıdan Ağ Yazıcısına: WebSocket Köprüsü

Tarayıcılar doğrudan TCP soketi açamaz. Araya bir WebSocket-to-TCP köprüsü kurulur:

\`\`\`javascript
// Sunucu tarafı (Node.js bridge)
import { WebSocketServer } from 'ws';
import net from 'net';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  const tcp = new net.Socket();
  tcp.connect(9100, '192.168.1.100');

  ws.on('message', (data) => tcp.write(data));
  tcp.on('data', (data) => ws.send(data));
  
  ws.on('close', () => tcp.destroy());
  tcp.on('close', () => ws.terminate());
});
\`\`\`

\`\`\`javascript
// İstemci tarafı (Tarayıcı)
const ws = new WebSocket('ws://localhost:8080');
ws.binaryType = 'arraybuffer';

ws.onopen = () => {
  const data = new Uint8Array([0x1B, 0x40, ...]);
  ws.send(data);
};
\`\`\`

## Çok İstasyonlu Yazıcı Mimarisi

Birden fazla kasa veya istasyonun aynı yazıcıyı paylaşması:

\`\`\`javascript
// Yazıcı havuzu yönetimi
class PrinterPool {
  constructor(printerIPs) {
    this.printers = printerIPs.map(ip => ({ ip, busy: false }));
    this.queue = [];
  }

  async print(data) {
    const printer = this.printers.find(p => !p.busy);
    if (!printer) {
      // Tüm yazıcılar meşgul, kuyruğa ekle
      return new Promise(resolve => this.queue.push({ data, resolve }));
    }
    printer.busy = true;
    try {
      await printToNetworkPrinter(printer.ip, 9100, data);
    } finally {
      printer.busy = false;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        this.print(next.data).then(next.resolve);
      }
    }
  }
}

const pool = new PrinterPool([
  '192.168.1.100',
  '192.168.1.101',
  '192.168.1.102'
]);
\`\`\`

## Güvenlik: VLAN ile Yazıcı İzolasyonu

Yazıcılar internete açık olmamalıdır. Önerilen ağ mimarisi:

\`\`\`
İnternet
   │
[Router/Firewall]
   │
[Switch]
   ├── VLAN 10 (POS terminalleri)  192.168.10.x
   └── VLAN 20 (Yazıcılar)        192.168.20.x
       ├── Yazıcı 1  192.168.20.100
       ├── Yazıcı 2  192.168.20.101
       └── Yazıcı 3  192.168.20.102
\`\`\`

## Sorun Giderme

### Bağlantı Reddedildi (Connection Refused)
- Yazıcı açık ve ağa bağlı mı?
- IP adresi doğru mu? \`ping 192.168.1.100\`
- Port 9100 açık mı? \`nc -zv 192.168.1.100 9100\`

### Veri Gönderildi Ama Baskı Yok
- Yazıcı "pause" durumunda olabilir
- Buffer dolmuş olabilir — ESC @ ile sıfırlayın
- Kağıt veya şerit bitti mi?

### Ara Sıra Veri Kaybı
Büyük veri bloklarını chunk'lara bölün:
\`\`\`javascript
const CHUNK = 1024;
for (let i = 0; i < data.length; i += CHUNK) {
  await sendChunk(data.slice(i, i + CHUNK));
  await sleep(10); // 10ms bekle
}
\`\`\`

## Sık Sorulan Sorular

### Kaç yazıcı aynı ağda olabilir?
Teknik sınır yoktur. Pratik olarak bir switch portu başına bir yazıcı, 1 Gbps switch ile 50+ yazıcı sorunsuz çalışır.

### WiFi mi Ethernet mi daha iyi?
Ethernet daha güvenilirdir. WiFi'da paket kaybı baskı kalitesini bozabilir. Yüksek hacimli ortamlarda her zaman Ethernet tercih edin.

### Port 9100'e firewall engelliyor, ne yapmalıyım?
IT ekibinizden yazıcı VLAN'ı ile POS terminalleri arasında port 9100 açılmasını isteyin. Dışarıdan (internet) erişim hiçbir zaman açılmamalıdır.
`
    },
    en: {
      title: 'Network Thermal Printers: Ethernet and Raw TCP Port 9100 Architecture',
      description: 'Set up Raw TCP Port 9100 for Ethernet thermal printers, build a WebSocket-to-TCP bridge, configure static IPs, and architect a multi-station printer pool.',
      printerClass: 'desktop', brand: 'Epson / Zebra / Star',
      body: `
Ethernet-connected thermal printers are the most reliable and scalable option for enterprise environments. In restaurants, retail, and warehouses with high print volume, **Raw TCP Port 9100** has become the industry standard.

## What Is Port 9100?

Port 9100 (also called RAW printing or JetDirect) is a TCP port that accepts raw data streams directly to the printer. CUPS, Windows Print Spooler, and custom socket applications all use this port.

## Static IP Configuration

If the printer's IP changes via DHCP, all connections break. Always configure a static IP:

\`\`\`
# Epson TM-T88VI Network Settings (via EpsonNet Config)
IP Address:      192.168.1.100
Subnet Mask:     255.255.255.0
Default Gateway: 192.168.1.1
Port: 9100
Protocol: RAW
\`\`\`

## Direct TCP with Node.js

\`\`\`javascript
import net from 'net';

function printToNetworkPrinter(host, data, port = 9100) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(port, host, () => {
      client.write(Buffer.from(data));
      client.end();
    });
    client.on('close', resolve);
    client.on('error', reject);
    client.setTimeout(5000, () => {
      client.destroy();
      reject(new Error('Printer connection timeout'));
    });
  });
}

const ESC_INIT = Buffer.from([0x1B, 0x40]);
const TEXT = Buffer.from('PRINTZEN TEST\n\n\n');
const CUT = Buffer.from([0x1D, 0x56, 0x41, 0x03]);
await printToNetworkPrinter('192.168.1.100', Buffer.concat([ESC_INIT, TEXT, CUT]));
\`\`\`

## Browser → Network Printer via WebSocket Bridge

Browsers can't open raw TCP sockets. Use a WebSocket-to-TCP bridge:

\`\`\`javascript
// Server (Node.js)
import { WebSocketServer } from 'ws';
import net from 'net';

const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
  const tcp = new net.Socket();
  tcp.connect(9100, '192.168.1.100');
  ws.on('message', data => tcp.write(data));
  tcp.on('data', data => ws.send(data));
  ws.on('close', () => tcp.destroy());
  tcp.on('close', () => ws.terminate());
});
\`\`\`

\`\`\`javascript
// Client (Browser)
const ws = new WebSocket('ws://localhost:8080');
ws.binaryType = 'arraybuffer';
ws.onopen = () => ws.send(new Uint8Array([0x1B, 0x40, ...]));
\`\`\`

## Troubleshooting

**Connection Refused** — Check: Is the printer on? \`ping 192.168.1.100\` → \`nc -zv 192.168.1.100 9100\`

**Data Sent, Nothing Prints** — Printer may be paused. Check paper/ribbon. Send ESC @ reset first.

**Intermittent Data Loss** — Split large payloads into 1024-byte chunks with 10ms sleep between sends.

## FAQ

**How many printers can be on one network?**
No hard limit. Practically, 50+ printers on a 1 Gbps switch work fine.

**WiFi vs Ethernet — which is better?**
Ethernet is always more reliable. WiFi packet loss causes print quality issues. Use Ethernet for high-volume environments.
`
    }
  },

  {
    id: 13, existing: false,
    trSlug: 'bulut-yazdirma-rest-api-hmac-guvenligi',
    enSlug: 'cloud-print-rest-api-hmac-security',
    pSEOPattern: 'bulut-yazdirma',
    tr: {
      title: 'Bulut Yazdırma: REST API ve HMAC Güvenlik Mimarisi',
      description: 'İnternet üzerinden termal yazıcıya baskı göndermek için REST API tasarımı, HMAC-SHA256 kimlik doğrulama, webhook güvenliği ve cloud print agent mimarisi.',
      printerClass: 'network', brand: 'Epson / Zebra',
      body: `
Bulut yazdırma (cloud printing), yazıcının fiziksel konumundan bağımsız olarak internet üzerinden baskı komutları gönderilmesini sağlar. E-ticaret siparişlerinin otomatik olarak depodaki yazıcıya düşmesi, restoran siparişlerinin mutfak yazıcısına anlık iletilmesi bunun somut örnekleridir.

## Bulut Yazdırma Mimarisi

\`\`\`
Müşteri / Sipariş Sistemi
         │
         │  HTTPS POST /api/print
         ▼
[Cloud Print API Sunucusu]
         │
         │  Webhook / WebSocket / MQTT
         ▼
[Cloud Print Agent] ← (yazıcının yanındaki küçük servis)
         │
         │  TCP Port 9100 / USB / Bluetooth
         ▼
[Termal Yazıcı]
\`\`\`

## REST API Tasarımı

\`\`\`javascript
// POST /api/v1/print
// Body:
{
  "printerId": "printer-istanbul-001",
  "template": "receipt",
  "data": {
    "orderNumber": "ORD-12345",
    "items": [
      { "name": "Americano", "qty": 2, "price": 45.00 }
    ],
    "total": 90.00
  },
  "copies": 1
}
\`\`\`

## HMAC-SHA256 Güvenlik

Her API isteği imzalanmalıdır. HMAC kullanarak:

\`\`\`javascript
import crypto from 'crypto';

// İmza oluşturma (gönderici taraf)
function signRequest(payload, secret) {
  const timestamp = Date.now().toString();
  const message = timestamp + '.' + JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  return { timestamp, signature };
}

// İmza doğrulama (API sunucu taraf)
function verifyRequest(payload, timestamp, signature, secret) {
  // Zaman aşımı kontrolü (5 dakika)
  if (Date.now() - parseInt(timestamp) > 5 * 60 * 1000) {
    throw new Error('İstek zaman aşımına uğradı');
  }
  
  const message = timestamp + '.' + JSON.stringify(payload);
  const expected = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  // Zamanlama saldırısına karşı sabit süre karşılaştırma
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}
\`\`\`

## Cloud Print Agent

Yazıcının yanındaki makinede çalışan küçük servis:

\`\`\`javascript
import WebSocket from 'ws';
import net from 'net';

class CloudPrintAgent {
  constructor({ agentId, serverUrl, secret, printerHost }) {
    this.agentId = agentId;
    this.secret = secret;
    this.printerHost = printerHost;
    this.ws = null;
    this.connect(serverUrl);
  }

  connect(serverUrl) {
    this.ws = new WebSocket(\`\${serverUrl}?agentId=\${this.agentId}\`);
    
    this.ws.on('message', async (raw) => {
      const msg = JSON.parse(raw);
      
      if (!this.verify(msg)) {
        console.error('İmza doğrulanamadı');
        return;
      }
      
      await this.printToDevice(Buffer.from(msg.data, 'base64'));
      this.ws.send(JSON.stringify({ jobId: msg.jobId, status: 'printed' }));
    });

    // Yeniden bağlanma
    this.ws.on('close', () => {
      setTimeout(() => this.connect(serverUrl), 5000);
    });
  }

  async printToDevice(data) {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      socket.connect(9100, this.printerHost, () => {
        socket.write(data);
        socket.end();
      });
      socket.on('close', resolve);
      socket.on('error', reject);
    });
  }
}
\`\`\`

## Offline Kuyruk Yönetimi

Yazıcı veya ağ kesilirse baskı kaybolmamalıdır:

\`\`\`javascript
// SQLite tabanlı baskı kuyruğu
import Database from 'better-sqlite3';

const db = new Database('print-queue.db');
db.exec(\`
  CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data BLOB NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    printed_at DATETIME
  )
\`);

// Kuyruğa ekle
function enqueue(data) {
  db.prepare('INSERT INTO queue (data) VALUES (?)').run(data);
}

// İşle
async function processQueue() {
  const jobs = db.prepare("SELECT * FROM queue WHERE status='pending' LIMIT 10").all();
  for (const job of jobs) {
    try {
      await printToDevice(job.data);
      db.prepare("UPDATE queue SET status='done', printed_at=? WHERE id=?")
        .run(new Date().toISOString(), job.id);
    } catch (e) {
      console.error('Baskı başarısız, tekrar denenecek:', e);
    }
  }
}

// 5 saniyede bir kontrol
setInterval(processQueue, 5000);
\`\`\`

## Sık Sorulan Sorular

### Cloud print agent hangi işletim sisteminde çalışır?
Windows, macOS ve Linux'ta Node.js ile çalışır. Windows'ta NSSM ile servis olarak kurulabilir, Linux'ta systemd unit file yazılır.

### Baskı verisi şifrelenmeli mi?
HTTPS (TLS) tünel şifrelemesi sağlar. İçerik şifreleme ek güvenlik katmanı sunar ama çoğu durumda HMAC imza yeterlidir.

### Çoklu şube için nasıl ölçeklenir?
Her şube için ayrı agentId kullanın. Merkezi API sunucusu hangi job hangi agent'a gidecek şekilde yönlendirir.
`
    },
    en: {
      title: 'Cloud Printing: REST API Design and HMAC Security Architecture',
      description: 'Build a cloud print system with REST API endpoints, HMAC-SHA256 request signing, a local print agent, and offline queue management for reliable thermal printer integration.',
      printerClass: 'network', brand: 'Epson / Zebra',
      body: `
Cloud printing lets you send print commands to a thermal printer over the internet, regardless of physical location. E-commerce orders printing automatically at the warehouse, restaurant orders reaching the kitchen printer in real time — these are prime examples.

## Architecture Overview

\`\`\`
Customer / Order System
         │
         │  HTTPS POST /api/print
         ▼
[Cloud Print API Server]
         │
         │  WebSocket / MQTT push
         ▼
[Cloud Print Agent] ← (small service running next to the printer)
         │
         │  TCP Port 9100 / USB / Bluetooth
         ▼
[Thermal Printer]
\`\`\`

## HMAC-SHA256 Request Signing

\`\`\`javascript
import crypto from 'crypto';

function signRequest(payload, secret) {
  const timestamp = Date.now().toString();
  const message = timestamp + '.' + JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(message).digest('hex');
  return { timestamp, signature };
}

function verifyRequest(payload, timestamp, signature, secret) {
  if (Date.now() - parseInt(timestamp) > 300_000) throw new Error('Request expired');
  const message = timestamp + '.' + JSON.stringify(payload);
  const expected = crypto.createHmac('sha256', secret).update(message).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}
\`\`\`

## Cloud Print Agent (Node.js)

\`\`\`javascript
import WebSocket from 'ws';
import net from 'net';

class CloudPrintAgent {
  constructor({ agentId, serverUrl, printerHost }) {
    this.printerHost = printerHost;
    this.ws = new WebSocket(\`\${serverUrl}?agentId=\${agentId}\`);
    this.ws.on('message', async (raw) => {
      const msg = JSON.parse(raw);
      await this.sendToDevice(Buffer.from(msg.data, 'base64'));
      this.ws.send(JSON.stringify({ jobId: msg.jobId, status: 'printed' }));
    });
    this.ws.on('close', () => setTimeout(() => this.connect(serverUrl), 5000));
  }

  sendToDevice(data) {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      socket.connect(9100, this.printerHost, () => { socket.write(data); socket.end(); });
      socket.on('close', resolve);
      socket.on('error', reject);
    });
  }
}
\`\`\`

## Offline Queue

\`\`\`javascript
import Database from 'better-sqlite3';
const db = new Database('queue.db');
db.exec(\`CREATE TABLE IF NOT EXISTS queue (id INTEGER PRIMARY KEY, data BLOB, status TEXT DEFAULT 'pending')\`);

function enqueue(data) { db.prepare('INSERT INTO queue(data) VALUES(?)').run(data); }

async function flush() {
  const jobs = db.prepare("SELECT * FROM queue WHERE status='pending' LIMIT 5").all();
  for (const job of jobs) {
    try {
      await sendToDevice(job.data);
      db.prepare("UPDATE queue SET status='done' WHERE id=?").run(job.id);
    } catch {}
  }
}
setInterval(flush, 5000);
\`\`\`

## FAQ

**What OS does the agent run on?**
Windows, macOS, and Linux via Node.js. Use NSSM for Windows service, systemd unit for Linux.

**Does print data need encryption?**
HTTPS provides transport encryption. HMAC signing is sufficient for most use cases.

**How to scale for multiple branches?**
Assign a unique agentId per branch. The central API routes each job to the correct agent.
`
    }
  },

  {
    id: 14, existing: false,
    trSlug: 'shopify-bulut-eticaret-fis-entegrasyonu',
    enSlug: 'shopify-cloud-ecommerce-receipt-integration',
    pSEOPattern: 'shopify',
    tr: {
      title: 'Shopify ve Bulut E-Ticaret Platformları için Termal Fiş Entegrasyonu',
      description: 'Shopify Order webhook, Printzen API ve termal yazıcı entegrasyonuyla yeni sipariş düşünce otomatik fiş basma. Node.js, Express ve ngrok ile geliştirme ortamı kurulumu.',
      printerClass: 'desktop', brand: 'Epson / Xprinter',
      body: `
Shopify mağazanıza gelen siparişlerin otomatik olarak kasadaki termal yazıcıya düşmesi için Shopify webhook sistemi ile Printzen entegrasyonunu kurmanız yeterlidir. Bu rehber, sıfırdan çalışan bir sistemi 30 dakikada kurmanızı sağlar.

## Genel Mimari

\`\`\`
Shopify → [orders/create webhook] → Printzen Webhook Handler → Termal Yazıcı
\`\`\`

## Shopify Webhook Kurulumu

Shopify Partner Dashboard veya Admin API üzerinden:

\`\`\`javascript
// Shopify Admin API ile webhook kaydetme
const response = await fetch(\`https://\${shop}.myshopify.com/admin/api/2024-01/webhooks.json\`, {
  method: 'POST',
  headers: {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    webhook: {
      topic: 'orders/create',
      address: 'https://your-server.com/webhook/shopify/order',
      format: 'json'
    }
  })
});
\`\`\`

## Webhook İmza Doğrulama

Shopify tüm webhook'lara \`X-Shopify-Hmac-Sha256\` başlığı ekler:

\`\`\`javascript
import crypto from 'crypto';
import express from 'express';

const app = express();

// RAW body gerekli (imza kontrolü için)
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook/shopify/order', async (req, res) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body;
  
  // İmzayı doğrula
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(body)
    .digest('base64');
  
  if (hash !== hmac) {
    return res.status(401).send('Unauthorized');
  }
  
  const order = JSON.parse(body);
  await printOrder(order);
  res.status(200).send('OK');
});
\`\`\`

## Sipariş Fişi Oluşturma

\`\`\`javascript
async function printOrder(order) {
  const lines = [];
  
  // Başlık
  lines.push({ type: 'header', text: 'SİPARİŞ #' + order.order_number });
  lines.push({ type: 'divider' });
  
  // Müşteri
  lines.push({ type: 'text', text: order.shipping_address?.name || 'Misafir' });
  lines.push({ type: 'text', text: new Date(order.created_at).toLocaleString('tr-TR') });
  lines.push({ type: 'divider' });
  
  // Ürünler
  for (const item of order.line_items) {
    lines.push({
      type: 'row',
      left: \`\${item.name} x\${item.quantity}\`,
      right: \`\${(item.price * item.quantity)} TL\`
    });
  }
  
  // Kargo
  if (order.shipping_lines?.length > 0) {
    lines.push({
      type: 'row',
      left: 'Kargo',
      right: order.total_shipping_price_set.shop_money.amount + ' TL'
    });
  }
  
  lines.push({ type: 'divider' });
  lines.push({ type: 'total', text: 'TOPLAM: ' + order.total_price + ' TL' });
  lines.push({ type: 'cut' });
  
  await printzen.print({ lines });
}
\`\`\`

## Geliştirme Ortamı (ngrok)

Shopify webhook'u localhost'a göndermek için:

\`\`\`bash
# ngrok kur ve başlat
npx ngrok http 3000

# Oluşan URL'i Shopify webhook adresi olarak kullan:
# https://abc123.ngrok.io/webhook/shopify/order
\`\`\`

## Shopify App Extension ile POS Entegrasyonu

Shopify POS kullanıyorsanız App Extension ile doğrudan fiş butonu eklenebilir:

\`\`\`javascript
// shopify.extension.toml
[[extensions]]
type = "pos_ui_extension"
name = "Printzen Receipt"
handle = "printzen-receipt"

// Düğme tanımı
import { Button, useCartState } from '@shopify/retail-ui-extensions-react';

export default function App() {
  const cart = useCartState();
  return (
    <Button
      title="Fiş Bas"
      onPress={() => printCart(cart)}
    />
  );
}
\`\`\`

## Sık Sorulan Sorular

### Webhook kaçırılırsa sipariş kaybolur mu?
Hayır. Shopify başarısız webhook'ları 48 saat boyunca yeniden dener. Sunucu tarafında idempotent işlem yapın (aynı order_id iki kez basılmasın).

### Test siparişi nasıl oluşturulur?
Shopify Admin > Orders > Create order > Send test webhook ile test edilebilir.

### Çoklu yazıcı (mutfak + kasa) nasıl yönetilir?
\`order.line_items\` içindeki ürün kategorisine göre hangi yazıcıya gönderileceğini belirleyebilirsiniz.
`
    },
    en: {
      title: 'Shopify and Cloud E-Commerce Automatic Receipt Printing Integration',
      description: 'Automatically print receipts on a thermal printer when Shopify orders arrive. Set up order webhooks, verify HMAC signatures, and build a print handler with Node.js and Express.',
      printerClass: 'desktop', brand: 'Epson / Xprinter',
      body: `
Automatically printing receipts when orders arrive in your Shopify store requires just the Shopify webhook system and a Printzen integration. This guide gets you up and running in 30 minutes.

## Architecture

\`\`\`
Shopify → [orders/create webhook] → Print Handler → Thermal Printer
\`\`\`

## Register the Webhook

\`\`\`javascript
const response = await fetch(\`https://\${shop}.myshopify.com/admin/api/2024-01/webhooks.json\`, {
  method: 'POST',
  headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    webhook: { topic: 'orders/create', address: 'https://your-server.com/webhook/order', format: 'json' }
  })
});
\`\`\`

## Verify Webhook Signature

\`\`\`javascript
import crypto from 'crypto';
import express from 'express';

const app = express();
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook/order', async (req, res) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const hash = crypto.createHmac('sha256', process.env.SHOPIFY_SECRET).update(req.body).digest('base64');
  if (hash !== hmac) return res.status(401).send('Unauthorized');

  const order = JSON.parse(req.body);
  await printOrder(order);
  res.status(200).send('OK');
});
\`\`\`

## Build the Receipt

\`\`\`javascript
async function printOrder(order) {
  const ESC = 0x1B, GS = 0x1D, LF = 0x0A;
  const enc = new TextEncoder();
  const cmds = [
    ESC, 0x40,
    ESC, 0x61, 0x01,
    ...enc.encode(\`ORDER #\${order.order_number}\n\`),
    ...enc.encode('----------------------------\n'),
  ];
  for (const item of order.line_items) {
    cmds.push(...enc.encode(\`\${item.name.substring(0,16).padEnd(16)} x\${item.quantity}  \${item.price}\n\`));
  }
  cmds.push(
    ESC, 0x45, 0x01,
    ...enc.encode(\`TOTAL: \${order.total_price}\n\`),
    ESC, 0x45, 0x00,
    LF, LF, LF,
    GS, 0x56, 0x41, 0x03
  );
  await printer.send(cmds);
}
\`\`\`

## Development with ngrok

\`\`\`bash
npx ngrok http 3000
# Use generated URL: https://abc123.ngrok.io/webhook/order
\`\`\`

## FAQ

**What if a webhook is missed?**
Shopify retries failed webhooks for 48 hours. Make your handler idempotent — check order_id before printing to avoid duplicates.

**How do I test without real orders?**
Shopify Admin → Orders → Create order → Send test webhook.

**Multiple printers (kitchen + cashier)?**
Route by product category in \`order.line_items\`.
`
    }
  },

  {
    id: 15, existing: false,
    trSlug: 'gib-earsiv-fatura-bilgi-fisi-termal-formatlama',
    enSlug: 'electronic-invoice-tax-receipt-thermal-formatting',
    pSEOPattern: 'gib-earsiv',
    tr: {
      title: 'GİB e-Arşiv Fatura ve Vergi Bilgi Fişi Termal Formatlama Rehberi',
      description: 'GİB uyumlu e-arşiv fatura bilgilerini termal fiş formatına dönüştürme, zorunlu vergi alanları, QR kod ekleme ve yasal gereksinimler.',
      printerClass: 'desktop', brand: 'Epson / Bixolon',
      body: `
Türkiye'de faaliyet gösteren işletmelerin belirli cirolar üzerinde GİB (Gelir İdaresi Başkanlığı) uyumlu e-Arşiv veya e-Fatura sistemlerine geçmesi zorunludur. Termal yazıcılarla entegre çalışan bu sistemlerin doğru formatlanması hem yasal gereklilik hem de müşteri deneyimi açısından kritiktir.

## Zorunlu Vergi Alanları

GİB'e göre termal fişte bulunması gereken asgari bilgiler:

| Alan | Örnek |
|------|-------|
| İşletme unvanı | KAFE OLIMPOS LTD. ŞTİ. |
| Vergi Dairesi | Kadıköy V.D. |
| Vergi No (VKN) | 1234567890 |
| Tarih ve saat | 11.09.2026 14:35 |
| Fiş/fatura numarası | 2026-000123 |
| KDV oranı ve tutarı | %18 KDV: 13,56 TL |
| Toplam tutar | 89,00 TL |
| QR kod | GİB doğrulama linki |

## Termal Fiş Formatı

\`\`\`javascript
function buildTaxReceipt(order) {
  const ESC = 0x1B, GS = 0x1D, LF = 0x0A;
  const enc = new TextEncoder();
  const cols = 42; // 80mm yazıcı için

  function padRow(left, right) {
    const pad = cols - left.length - right.length;
    return left + ' '.repeat(Math.max(1, pad)) + right + '\n';
  }

  function divider() {
    return enc.encode('-'.repeat(cols) + '\n');
  }

  const cmds = [
    ESC, 0x40,                   // sıfırla
    ESC, 0x61, 0x01,             // ortala
    ESC, 0x21, 0x10,             // çift boy
    ...enc.encode(order.businessName + '\n'),
    ESC, 0x21, 0x00,             // normal
    ...enc.encode(order.taxOffice + ' V.D. / VKN: ' + order.taxNo + '\n'),
    ...enc.encode(order.address + '\n'),
    ...divider(),

    ESC, 0x61, 0x00,             // sola hizala
    ...enc.encode('FİŞ NO: ' + order.receiptNo + '\n'),
    ...enc.encode('TARİH: ' + new Date().toLocaleString('tr-TR') + '\n'),
    ...divider(),
  ];

  // Ürünler
  for (const item of order.items) {
    const total = (item.price * item.qty).toFixed(2) + ' TL';
    cmds.push(...enc.encode(padRow(item.name.substring(0, 28) + ' x' + item.qty, total)));
  }

  cmds.push(...divider());

  // Vergi hesaplaması
  const kdvBase = (order.total / 1.18).toFixed(2);
  const kdvAmount = (order.total - parseFloat(kdvBase)).toFixed(2);

  cmds.push(
    ...enc.encode(padRow('KDV Matrahı (%18)', kdvBase + ' TL')),
    ...enc.encode(padRow('KDV Tutarı', kdvAmount + ' TL')),
    ...divider(),
    ESC, 0x45, 0x01,             // kalın
    ...enc.encode(padRow('TOPLAM', order.total.toFixed(2) + ' TL')),
    ESC, 0x45, 0x00,
  );

  // GİB QR Kodu
  const gibUrl = 'https://earsivportal.efatura.gov.tr/indir/' + order.receiptNo;
  cmds.push(
    ...divider(),
    ESC, 0x61, 0x01,             // ortala
    GS, 0x28, 0x6B,              // QR kod başlat
    // QR data command sequence
    ...buildQRCode(gibUrl),
    ...enc.encode('GİB e-Arşiv\n'),
    ...enc.encode(order.receiptNo + '\n'),
    LF, LF, LF,
    GS, 0x56, 0x41, 0x03        // kes
  );

  return cmds;
}
\`\`\`

## GİB QR Kod Formatı

\`\`\`javascript
function buildQRCode(url) {
  const GS = 0x1D;
  const data = new TextEncoder().encode(url);
  const len = data.length + 3;
  const pL = len & 0xFF;
  const pH = (len >> 8) & 0xFF;

  return [
    // Model seç (model 2)
    GS, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00,
    // Boyut (module size = 4)
    GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x04,
    // Hata düzeltme seviyesi (M = 48)
    GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31,
    // Veri
    GS, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30, ...data,
    // Yazdır
    GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30
  ];
}
\`\`\`

## e-Fatura vs e-Arşiv Fatura Farkı

| Özellik | e-Fatura | e-Arşiv |
|---------|----------|---------|
| Hedef kitle | e-Fatura mükellefi işletmeler | Bireysel tüketiciler / küçük işletmeler |
| GİB onayı | Anlık (UBL-TR XML) | 3 gün içinde |
| Termal baskı | Bilgi amaçlı | Asıl belge olabilir |
| QR zorunluluğu | Evet | Evet |

## Sık Sorulan Sorular

### e-Arşiv fatura termal fişte yasal olarak geçerli mi?
Evet, GİB'in belirlediği zorunlu alanlar (VKN, tarih, tutar, KDV, QR) bulunduğu sürece termal baskı yasal belgedir.

### KDV oranı birden fazlaysa ne yapılır?
Her KDV dilimi (%1, %10, %20) ayrı satırda gösterilmelidir.

### Yazar kasa entegrasyonu zorunlu mu?
Tüm mükelleflere değil. Güvenli mobil ödeme cihazı (GMÖ) veya ÖKC sahibi olmayanlar e-Arşiv sistemiyle muaf tutulabilir. Mali müşavirinize danışın.
`
    },
    en: {
      title: 'Electronic Invoice and Tax Receipt Thermal Formatting Guide',
      description: 'Format e-invoice and tax receipt data for thermal printers. Includes mandatory tax fields, QR code generation, VAT calculation layout, and legal compliance requirements.',
      printerClass: 'desktop', brand: 'Epson / Bixolon',
      body: `
Printing legally compliant tax receipts on thermal printers requires including all mandatory fiscal fields. This guide covers the full formatting pipeline from order data to a compliant printed receipt.

## Mandatory Tax Fields

| Field | Example |
|-------|---------|
| Business name | OLYMPUS CAFE LTD |
| Tax ID / VAT No | GB123456789 |
| Date & time | 11/09/2026 14:35 |
| Receipt / invoice number | 2026-000123 |
| VAT rate & amount | VAT (20%): £1.83 |
| Total amount | £10.99 |
| QR verification code | Fiscal authority URL |

## Receipt Builder

\`\`\`javascript
function buildTaxReceipt(order) {
  const ESC = 0x1B, GS = 0x1D, LF = 0x0A;
  const enc = new TextEncoder();
  const cols = 42;

  function padRow(left, right) {
    return left + ' '.repeat(Math.max(1, cols - left.length - right.length)) + right + '\n';
  }

  const cmds = [
    ESC, 0x40,
    ESC, 0x61, 0x01,
    ESC, 0x21, 0x10,
    ...enc.encode(order.businessName + '\n'),
    ESC, 0x21, 0x00,
    ...enc.encode('VAT No: ' + order.vatNo + '\n'),
    ...enc.encode('-'.repeat(cols) + '\n'),
    ESC, 0x61, 0x00,
    ...enc.encode('Receipt: ' + order.receiptNo + '\n'),
    ...enc.encode('Date: ' + new Date().toLocaleString() + '\n'),
    ...enc.encode('-'.repeat(cols) + '\n'),
  ];

  for (const item of order.items) {
    cmds.push(...enc.encode(padRow(item.name + ' x' + item.qty, '£' + (item.price * item.qty).toFixed(2))));
  }

  const vatBase = (order.total / 1.20).toFixed(2);
  const vatAmount = (order.total - parseFloat(vatBase)).toFixed(2);

  cmds.push(
    ...enc.encode('-'.repeat(cols) + '\n'),
    ...enc.encode(padRow('Subtotal (ex VAT)', '£' + vatBase)),
    ...enc.encode(padRow('VAT (20%)', '£' + vatAmount)),
    ...enc.encode('-'.repeat(cols) + '\n'),
    ESC, 0x45, 0x01,
    ...enc.encode(padRow('TOTAL', '£' + order.total.toFixed(2))),
    ESC, 0x45, 0x00,
    LF, LF, LF,
    GS, 0x56, 0x41, 0x03
  );

  return cmds;
}
\`\`\`

## FAQ

**Is a thermal receipt legally valid?**
Yes, provided all mandatory fiscal fields are present. Check local tax authority requirements.

**Multiple VAT rates?**
Each rate must appear on a separate line with its own base and amount.

**QR code format?**
Use the ESC/POS GS ( k QR code command sequence with your fiscal authority's verification URL.
`
    }
  },
];

// ============================================================
// YAZMA FONKSİYONLARI
// ============================================================

function buildFrontmatter(fields) {
  return `---\n${Object.entries(fields).map(([k,v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n\n`;
}

function buildInternalLinks(trSlug, pSEOFiles, lang) {
  if (pSEOFiles.length === 0) return '';
  const baseUrl = lang === 'tr' ? '/tr/rehber' : '/guides';
  const label = lang === 'tr' ? 'Bu Konudaki Yazıcı Modeli Rehberleri' : 'Printer-Specific Guides for This Topic';
  const lines = pSEOFiles.slice(0, 8).map(f => {
    const slug = f.replace('.html', '');
    const name = slug.split('-').slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `- [${name}](${baseUrl}/${slug})`;
  });
  return `\n\n## ${label}\n\n${lines.join('\n')}\n`;
}

// ============================================================
// ANA DÖNGÜ
// ============================================================

let writtenTR = 0, writtenEN = 0, expandedTR = 0, expandedEN = 0;

for (const topic of topics) {
  // pSEO sayfalarını bul (bu konuya ait)
  const allTRFiles = fs.readdirSync(PSEO_TR_DIR);
  const allENFiles = fs.readdirSync(PSEO_EN_DIR);
  const trPSEOFiles = allTRFiles.filter(f => f.includes(topic.pSEOPattern)).sort().slice(0, 8);
  const enPSEOFiles = allENFiles.filter(f => f.includes(topic.pSEOPattern)).sort().slice(0, 8);

  if (topic.existing) {
    // Mevcut pillar yazıları genişlet
    const trFile = path.join(TR_DIR, topic.trSlug + '.md');
    const enFile = path.join(EN_DIR, topic.enSlug + '.md');

    if (fs.existsSync(trFile)) {
      const existing = fs.readFileSync(trFile, 'utf8');
      const internalLinks = buildInternalLinks(topic.trSlug, trPSEOFiles, 'tr');
      // extra bölümü ve iç linkleri ekle (eğer henüz eklenmemişse)
      if (!existing.includes('## ESC/POS Komut Referans') && !existing.includes('## WebUSB') && topic.tr.extra) {
        const updated = existing.trimEnd() + '\n' + topic.tr.extra + internalLinks;
        fs.writeFileSync(trFile, updated, 'utf8');
        expandedTR++;
        process.stdout.write(`✏️  TR genişletildi: ${topic.trSlug}\n`);
      } else if (!existing.includes('Bu Konudaki Yazıcı')) {
        const updated = existing.trimEnd() + internalLinks;
        fs.writeFileSync(trFile, updated, 'utf8');
        expandedTR++;
        process.stdout.write(`🔗 TR iç link eklendi: ${topic.trSlug}\n`);
      }
    }

    if (fs.existsSync(enFile)) {
      const existing = fs.readFileSync(enFile, 'utf8');
      const internalLinks = buildInternalLinks(topic.enSlug, enPSEOFiles, 'en');
      if (!existing.includes('## ESC/POS Command Reference') && !existing.includes('## WebUSB') && topic.en.extra) {
        const updated = existing.trimEnd() + '\n' + topic.en.extra + internalLinks;
        fs.writeFileSync(enFile, updated, 'utf8');
        expandedEN++;
        process.stdout.write(`✏️  EN genişletildi: ${topic.enSlug}\n`);
      } else if (!existing.includes('Printer-Specific Guides')) {
        const updated = existing.trimEnd() + internalLinks;
        fs.writeFileSync(enFile, updated, 'utf8');
        expandedEN++;
        process.stdout.write(`🔗 EN iç link eklendi: ${topic.enSlug}\n`);
      }
    }

  } else {
    // Yeni hub yazısı oluştur
    const { tr, en } = topic;
    const internalLinksTR = buildInternalLinks(topic.trSlug, trPSEOFiles, 'tr');
    const internalLinksEN = buildInternalLinks(topic.enSlug, enPSEOFiles, 'en');

    const trFM = buildFrontmatter({
      title: tr.title,
      description: tr.description,
      printerClass: tr.printerClass || 'desktop',
      brand: tr.brand || 'Generic',
      publishDate: '2026-09-11',
      translationKey: topic.trSlug,
      topicCluster: `hub-${topic.id}`
    });

    const enFM = buildFrontmatter({
      title: en.title,
      description: en.description,
      printerClass: en.printerClass || 'desktop',
      brand: en.brand || 'Generic',
      publishDate: '2026-09-11',
      translationKey: topic.trSlug,
      topicCluster: `hub-${topic.id}`
    });

    fs.writeFileSync(path.join(TR_DIR, topic.trSlug + '.md'), trFM + tr.body.trim() + internalLinksTR, 'utf8');
    fs.writeFileSync(path.join(EN_DIR, topic.enSlug + '.md'), enFM + en.body.trim() + internalLinksEN, 'utf8');

    writtenTR++;
    writtenEN++;
    process.stdout.write(`✅ Yeni hub yazıldı: ${topic.trSlug}\n`);
  }
}

console.log('\n=== SONUÇ ===');
console.log(`✏️  Genişletilen TR pillar: ${expandedTR}`);
console.log(`✏️  Genişletilen EN pillar: ${expandedEN}`);
console.log(`✅ Yeni TR hub yazısı: ${writtenTR}`);
console.log(`✅ Yeni EN hub yazısı: ${writtenEN}`);
console.log(`📊 Toplam TR rehber: ${fs.readdirSync(TR_DIR).filter(f=>f.endsWith('.md')).length}`);
console.log(`📊 Toplam EN rehber: ${fs.readdirSync(EN_DIR).filter(f=>f.endsWith('.md')).length}`);

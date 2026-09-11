import fs from 'fs';
import path from 'path';

const TR_DIR = 'src/content/guides/tr';
const EN_DIR = 'src/content/guides/en';
const PSEO_TR_DIR = 'public/tr/rehber';
const PSEO_EN_DIR = 'public/guides';

function getPseoLinks(pattern, lang = 'tr') {
  const dir = lang === 'tr' ? PSEO_TR_DIR : PSEO_EN_DIR;
  const files = fs.readdirSync(dir).filter(f => f.includes(pattern) && f.endsWith('.html'));
  const baseUrl = lang === 'tr' ? '/tr/rehber' : '/guides';
  const label = lang === 'tr' ? 'Popüler Model Özelinde Bu Konudaki Rehberler' : 'Device-Specific Guides for This Topic';
  
  const links = files.slice(0, 10).map(f => {
    const slug = f.replace('.html', '');
    const cleanName = slug.split('-').slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `- [${cleanName}](${baseUrl}/${slug})`;
  });

  return `\n\n## ${label}\n\n${links.join('\n')}\n`;
}

const PILLARS = [
  // 2. Zebra ZPL
  {
    trFile: 'zebra-zpl-etiket-yazdirma.md',
    enFile: 'zebra-zpl-label-printing.md',
    pattern: 'zebra-zpl',
    trExtra: `
## ZPL II Komut Yapısı ve Temel Mimarisi

Zebra Programlama Dili (ZPL II), barkod ve kargo etiketleri tasarımında küresel standarttır. Tüm ZPL kodları \`^XA\` ile başlar ve \`^XZ\` ile sonlanır. ZPL'in temel avantajı, raster grafik göndermek yerine etiket yazıcısının dahili işlemcisine komut vererek metin, çizgi ve barkodları yerel donanım çözünürlüğünde (203 DPI, 300 DPI veya 600 DPI) piksel hassasiyetinde çizdirmesidir.

### Koordinat Sistemi (^FO vs ^FT)
- **^FO (Field Origin):** Belirtilen X ve Y koordinatını metnin veya nesnenin **sol üst** köşesi olarak kabul eder.
- **^FT (Field Typeset):** Taban çizgisi (baseline) orijinli yerleşim sağlar, özellikle farklı font boyutlarının aynı taban çizgisinde hizalanmasında kullanılır.

\`\`\`zpl
^XA
^PW812
^LL1218
^FO50,50^A0N,40,40^FDPRINTZEN BULUT ETİKET SİSTEMİ^FS
^FO50,110^GB712,3,3^FS
^FO50,150^BY3,3,100^BCN,100,Y,N,N^FD1234567890^FS
^FO50,290^A0N,30,30^FDGonderici: Printzen Depo A.S.^FS
^FO50,330^A0N,30,30^FDAlici: Ahmet Yilmaz - Kadikoy / Istanbul^FS
^FO50,380^GB712,2,2^FS
^FO50,420^BQN,2,6^FDQA,https://printzen.app/track/1234567890^FS
^FO220,440^A0N,32,32^FDKARGO TAKIP KAREKODU^FS
^FO220,480^A0N,24,24^FDSon Teslimat: 24 Saat Icinde^FS
^XZ
\`\`\`

## ZPL ile Yüksek Hızlı Baskı Optimizasyonu

Büyük depolarda dakikada yüzlerce etiket basılırken ZPL şablonlarının performansı doğrudan ciroya etki eder:
1. **Şablon Saklama (^DF ve ^XF):** Sürekli aynı tasarımı göndermek yerine etiket şablonunu yazıcının Flash belleğine \`^DFE:CARGO.ZPL\` ile kaydedip, yalnızca değişken verileri \`^XFE:CARGO.ZPL^FN1^FDVeri^FS\` şeklinde aktarabilirsiniz. Bu işlem ağ trafiğini %90 oranında düşürür.
2. **Grafik Formatlama (^GF vs PNG):** Etiket üzerine logo basarken doğrudan bitmap göndermek yerine ZPL'in \`^GF\` (Graphic Field) sıkıştırılmış ASCII hex formatını kullanın. Printzen SDK, logolarınızı tarayıcıda doğrudan optimize edilmiş \`^GF\` koduna çevirir.
3. **DPI Farklılıklarını Yönetme:** 203 DPI yazıcıda 8 nokta/mm (100x150 mm = 812x1218 nokta) hesaplanırken, 300 DPI yazıcıda 12 nokta/mm (1200x1800 nokta) hesaplanır. ZPL koordinatlarını dinamik katsayı ile çarparak tüm modellere uyumlu kılabilirsiniz.
`,
    enExtra: `
## ZPL II Architecture and Coordinate Mechanics

Zebra Programming Language (ZPL II) is the global benchmark for thermal barcode and shipping label generation. All ZPL payloads begin with \`^XA\` and terminate with \`^XZ\`. Rather than sending heavy raster bitmaps over the network, ZPL instructs the printer's onboard firmware to render scalable fonts, geometric shapes, and barcode vectors at native printhead resolution (203, 300, or 600 DPI).

### Positioning with ^FO vs ^FT
- **^FO (Field Origin):** Anchors elements at the **top-left** corner coordinates (X, Y).
- **^FT (Field Typeset):** Anchors elements at the **baseline**, ideal for multilingual typesetting where different font sizes share a common baseline.

\`\`\`zpl
^XA
^PW812
^LL1218
^FO50,50^A0N,40,40^FDPRINTZEN CLOUD PRINT SYSTEM^FS
^FO50,110^GB712,3,3^FS
^FO50,150^BY3,3,100^BCN,100,Y,N,N^FD1234567890^FS
^FO50,290^A0N,30,30^FDSender: Warehouse Hub Logistics^FS
^FO50,330^A0N,30,30^FDRecipient: John Doe - London UK^FS
^FO50,380^GB712,2,2^FS
^FO50,420^BQN,2,6^FDQA,https://printzen.app/track/1234567890^FS
^FO220,440^A0N,32,32^FDSCAN TO TRACK SHIPMENT^FS
^XZ
\`\`\`

## High-Throughput Warehouse ZPL Optimizations

In high-velocity fulfilment centres printing thousands of labels per hour, payload size and transmission latency are critical:
1. **Template Storage (^DF and ^XF):** Store recurring layouts in printer flash memory using \`^DFR:TEMPLATE.ZPL\` and recall them dynamically with \`^XFR:TEMPLATE.ZPL^FN1^FDData^FS\`. This reduces network payload by up to 90%.
2. **Graphic Optimization (^GF):** Compress brand logos into native ASCII hex graphic blocks (\`^GF\`) instead of sending raw image bitmaps. Printzen SDK performs this conversion automatically in the client browser.
3. **DPI Cross-Compatibility:** 203 DPI printers use 8 dots/mm (812x1218 for 4x6"), whereas 300 DPI printers use 12 dots/mm (1200x1800). Scale coordinates dynamically using Printzen's unified resolution driver.
`
  },

  // 3. Türkçe Karakter
  {
    trFile: 'termal-yazici-turkce-karakter-sorunu-cozumu.md',
    enFile: 'thermal-printer-turkish-character-encoding-fix.md',
    pattern: 'turkce-karakter',
    trExtra: `
## Donanımsal Kod Sayfası Tablosu ve Byte Haritalama

Termal yazıcılar ASCII standardının ilk 128 karakterini (0-127) evrensel olarak doğru basarken, 128-255 arasındaki genişletilmiş karakter kümesi seçili kod sayfasına (Code Page) göre tamamen farklı harflere karşılık gelir. Türkçe karakterlerin (\`ğ, Ğ, ş, Ş, ı, İ, ö, Ö, ü, Ü, ç, Ç\`) bozulmasının ana sebebi, yazıcının varsayılan olarak PC437 (USA) veya PC850 (Multilingual) tablosunda kalmasıdır.

### Kod Sayfaları Karşılaştırması

| Kod Sayfası | ESC t Parametresi | Türkçe Kapsamı | Kararlılık |
|---|---|---|---|
| **CP857 (DOS Turkish)** | \`ESC t 19\` (0x13) | Tam (Tüm Türkçe harfler mevcuttur) | ⭐⭐⭐⭐⭐ En kararlı |
| **Windows-1254** | \`ESC t 30\` veya \`ESC t 70\` | Tam (Windows ANSI uyumlu) | ⭐⭐⭐⭐ Yaygın |
| **ISO-8859-9** | Modele göre değişir | Tam (Latin-5) | ⭐⭐⭐ Eski sistemler |
| **UTF-8 (Native)** | Özel firmware gerektirir | Evrensel Unicode | ⭐⭐ Sadece yeni nesil |

### JavaScript ile Güvenli CP857 Byte Dönüştürücü

\`\`\`javascript
function encodeTurkishCP857(text) {
  const map = {
    'ğ': 0xA7, 'Ğ': 0xA6,
    'ı': 0x8D, 'İ': 0x98,
    'ş': 0x9F, 'Ş': 0x9E,
    'ç': 0x87, 'Ç': 0x80,
    'ü': 0x81, 'Ü': 0x9A,
    'ö': 0x94, 'Ö': 0x99
  };

  const bytes = [];
  // Kod sayfasını CP857 yap: ESC t 19 (0x1B 0x74 0x13)
  bytes.push(0x1B, 0x74, 0x13);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (map[char] !== undefined) {
      bytes.push(map[char]);
    } else {
      const code = char.charCodeAt(0);
      bytes.push(code < 128 ? code : 0x3F); // Tanınmayan harf yerine '?'
    }
  }
  return new Uint8Array(bytes);
}
\`\`\`

## Firmware Desteklemiyorsa: İkili Fallback Stratejisi
Yazıcı donanımı hiçbir Türkçe kod sayfasını desteklemiyorsa iki kesin çözüm vardır:
1. **ASCII Sanitization (Karakter Temizleme):** \`ş -> s, ğ -> g, ı -> i, ç -> c, ö -> o, ü -> u\` harita fonksiyonu çalıştırılır. Fiş okunabilir kalır, soru işareti veya garip simgeler çıkmaz.
2. **1-Bit Bitmap Baskı:** Metin tarayıcı canvas'ında çizilir ve yazıcıya doğrudan siyah-beyaz raster imaj (ESC * veya GS v 0) olarak gönderilir. Bu yöntemde yazıcının dil desteği ne olursa olsun %100 kusursuz Türkçe çıktı alınır.
`,
    enExtra: `
## Thermal Hardware Code Page Mapping & Byte Serialization

Standard ASCII covers characters 0 through 127 reliably across all receipt printers. However, extended ASCII characters (128 to 255) depend strictly on the active hardware Code Page register. When international characters such as Turkish (\`ş, ğ, ı, ö, ü, ç\`), German umlauts, or Nordic accents print as random symbols, question marks, or broken lines, it indicates a mismatch between the host encoding and the printer's active code page.

### Code Page Comparison Table

| Code Page | ESC/POS Code | Turkish / Regional Coverage | Stability |
|---|---|---|---|
| **CP857 (DOS Turkish)** | \`ESC t 19\` (0x13) | Complete Turkish coverage | ⭐⭐⭐⭐⭐ Highest |
| **Windows-1254** | \`ESC t 30\` / \`ESC t 70\` | Full Latin-5 (Windows ANSI) | ⭐⭐⭐⭐ Modern standard |
| **ISO-8859-9** | Hardware dependent | Latin-5 standard | ⭐⭐⭐ Legacy support |
| **UTF-8 (Native)** | Specialized firmware | Universal multi-byte | ⭐⭐ Selected devices |

### Robust Binary Transcoder Example

\`\`\`javascript
export function transcodeExtendedAscii(text, codePageCmd = [0x1B, 0x74, 0x13]) {
  const charMap = {
    'ğ': 0xA7, 'Ğ': 0xA6,
    'ı': 0x8D, 'İ': 0x98,
    'ş': 0x9F, 'Ş': 0x9E,
    'ç': 0x87, 'Ç': 0x80,
    'ü': 0x81, 'Ü': 0x9A,
    'ö': 0x94, 'Ö': 0x99
  };

  const buffer = [...codePageCmd];
  for (const ch of text) {
    if (charMap[ch] !== undefined) {
      buffer.push(charMap[ch]);
    } else {
      const code = ch.charCodeAt(0);
      buffer.push(code < 128 ? code : 0x3F);
    }
  }
  return new Uint8Array(buffer);
}
\`\`\`

## Fallback Protocols for Unsupported Firmware
When physical hardware does not support custom code pages:
1. **ASCII Transliteration:** Map accents to base equivalents (\`ş -> s, ğ -> g, ö -> o\`). Receipts remain clean and legible without garbage characters.
2. **Canvas Rasterization:** Render receipts in an offscreen HTML5 Canvas and transmit as 1-bit monochrome bitmaps. This guarantees 100% typography precision regardless of printer firmware age.
`
  },

  // 4. Web Bluetooth
  {
    trFile: 'web-bluetooth-termal-yazici-baglantisi.md',
    enFile: 'web-bluetooth-thermal-printer-setup.md',
    pattern: 'web-bluetooth',
    trExtra: `
## Web Bluetooth API ile Mobil ve Web POS Mimarisi

Modern Chrome, Edge ve Chromium tabanlı tarayıcılarda çalışan Web Bluetooth API, web sayfalarının kullanıcı cihazına hiçbir ek yazılım, sürücü ya da köprü kurmadan taşınabilir Bluetooth termal yazıcılarla doğrudan BLE (Bluetooth Low Energy) üzerinden konuşmasını sağlar.

### GATT Protokolü ve Yazıcı Servisleri
Termal yazıcılar veri iletimi için standart veya özel GATT servis UUID'leri kullanır:
- Standart Yazıcı Servis UUID'si: \`000018f0-0000-1000-8000-00805f9b34fb\`
- Veri Yazma Karakteristiği: \`00002af1-0000-1000-8000-00805f9b34fb\`
- Şeffaf Seri Aktarım (ISSC / Vendor-specific): \`e7810a71-73ae-499d-8c15-faa9aef0c3f2\`

### Bluetooth MTU Limiti ve 20-Bayt Parçalama (Chunking)

Bluetooth LE bağlantılarında varsayılan MTU (Maximum Transmission Unit) değeri 23 bayttır (3 bayt protokol başlığı düşüldüğünde efektif veri kapasitesi **20 bayt** kalır). Tek seferde 20 bayttan büyük bir fiş verisi göndermeye çalışırsanız tarayıcı \`GATT operation failed\` hatası fırlatır veya yazıcı veriyi eksik alıp satır atlar:

\`\`\`javascript
async function sendRawInChunks(characteristic, data, chunkSize = 20, delayMs = 15) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await characteristic.writeValueWithoutResponse(chunk);
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
\`\`\`

## iOS (iPhone / iPad) Web Bluetooth Kısıtları ve Çözümü
Apple, Safari tarayıcısında Web Bluetooth standardını gizlilik gerekçesiyle yerel olarak desteklemez. iOS ortamında web tabanlı termal yazdırma yapmanın iki kanıtlanmış yolu vardır:
1. **Bluefy / WebBLE Tarayıcıları:** App Store'da bulunan ve Web Bluetooth API'sini JavaScript bridge üzerinden enjekte eden özel tarayıcılar.
2. **Printzen Cloud Print Köprüsü:** iOS cihazı doğrudan bulut sunucusuna WebSocket veya HTTP POST ile fişi iletir, restorandaki veya mağazadaki yazıcıya bağlı Printzen ajanı saniyeler içinde çıktıyı verir.
`,
    enExtra: `
## Web Bluetooth API for Browser-Based POS Systems

The Web Bluetooth API allows web applications running in modern Chromium browsers (Chrome, Edge, Opera) to communicate directly with mobile thermal receipt and label printers via BLE (Bluetooth Low Energy) without installing local drivers or desktop helper agents.

### GATT Services & Characteristic Discovery
Thermal printers expose data endpoints via specific GATT service UUIDs:
- Common Thermal Service: \`000018f0-0000-1000-8000-00805f9b34fb\`
- Write Characteristic: \`00002af1-0000-1000-8000-00805f9b34fb\`
- Vendor Transparent UART (ISSC/Custom): \`e7810a71-73ae-499d-8c15-faa9aef0c3f2\`

### Managing the 20-Byte BLE MTU Constraint
The default BLE Maximum Transmission Unit (MTU) restricts payload size to 23 bytes (yielding **20 bytes** of usable payload after protocol overhead). Writing unchunked buffers exceeding 20 bytes results in dropped packets or fatal GATT transmission exceptions:

\`\`\`javascript
export async function transmitBleChunks(characteristic, payload, chunkSize = 20, throttleMs = 12) {
  for (let offset = 0; offset < payload.length; offset += chunkSize) {
    const segment = payload.slice(offset, offset + chunkSize);
    await characteristic.writeValueWithoutResponse(segment);
    if (throttleMs > 0) {
      await new Promise(r => setTimeout(r, throttleMs));
    }
  }
}
\`\`\`

## Overcoming iOS Safari Constraints
Apple does not support Web Bluetooth natively in mobile Safari. To print from iPhones and iPads:
1. **Dedicated BLE Shells:** Use browsers like Bluefy or WebBLE from the App Store which inject the full Web Bluetooth spec into WKWebView.
2. **Printzen Cloud Queue Architecture:** The iOS web client transmits print jobs via HTTPS to Printzen's cloud backend, which dispatches tasks instantly to LAN-connected printers.
`
  },

  // 5. Sessiz Yazdırma
  {
    trFile: 'web-uygulamalarinda-sessiz-yazdirma-silent-print.md',
    enFile: 'silent-printing-web-applications-kiosk-mode.md',
    pattern: 'sessiz-yazdirma',
    trExtra: `
## Web POS ve Perakendede Sessiz Baskı (Silent Print) Standartları

Web tabanlı bir perakende veya restoran yazılımında her satış sonrasında standart tarayıcı yazdırma penceresinin (\`Ctrl+P\` / \`window.print()\`) açılması, kasiyerin fazladan onay vermesini gerektirir, saniyeler kaybettirir ve yoğun saatlerde kasa kuyruklarına yol açar. Gerçek anlamda kurumsal bir Web POS sisteminde baskının **kullanıcıya hiçbir diyalog göstermeden doğrudan yazıcıdan fırlaması (silent printing)** zorunludur.

### Yöntem 1: Chrome / Edge Kiosk Printing Parametresi

Masaüstü terminallerde en pratik yöntem, Chromium tarayıcısını özel bayraklarla çalıştırmaktır:

\`\`\`bash
# Windows Chrome Kiosk Printing Kısayol Hedefi:
"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --kiosk --kiosk-printing --disable-print-preview https://pos.magaza.com

# macOS Terminal Başlatma Komutu:
/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --kiosk-printing --app=https://pos.magaza.com
\`\`\`

- \`--kiosk-printing\`: Yazdırma diyaloğunu tamamen atlar ve varsayılan işletim sistemi yazıcısına anında baskı gönderir.
- \`--kiosk\`: Tarayıcıyı tam ekran yapar, adres çubuğunu ve kapatma butonlarını gizler.

### Yöntem 2: Yerel WebSocket Köprüsü (Localhost Bridge)

Kiosk modu tüm bilgisayarı kilitlediği için standart ofis veya karma kullanımlarda uygun olmayabilir. İkinci ve en güçlü yöntem, arka planda çalışan hafif bir yerel WebSocket servisidir (Printzen Desktop Agent):

\`\`\`javascript
const socket = new WebSocket('ws://127.0.0.1:8765');
socket.onopen = () => {
  socket.send(JSON.stringify({
    action: 'print_raw',
    printerName: 'Epson_TM_T20III',
    data: btoa(String.fromCharCode(...escPosByteArray))
  }));
};
\`\`\`

Bu mimaride web sayfası HTTPS üzerinde çalışırken dahi WSS veya güvenli yerel tünel üzerinden masaüstü servisine bayt akıtır. Kasiyer hiçbir diyalog görmez, fiş 300 milisaniye içinde kesilir.
`,
    enExtra: `
## Silent & Automated Printing Architecture for Web POS

In commercial retail and hospitality setups, presenting the default browser print modal (\`window.print()\`) on every transaction introduces fatal friction. Cashiers must manually click "Print", navigate margin selections, and dismiss popups. A professional web-based POS requires **zero-click, headless silent printing**.

### Approach 1: Chromium Kiosk Printing Flags

For dedicated checkout hardware, launch Chrome or Edge with headless execution arguments:

\`\`\`bash
# Windows shortcut target:
"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --kiosk --kiosk-printing --disable-print-preview https://pos.store.com

# macOS command line execution:
/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --kiosk-printing --app=https://pos.store.com
\`\`\`

- \`--kiosk-printing\`: Bypasses the print preview dialogue and routes jobs directly to the OS default printer.
- \`--kiosk\`: Enforces full-screen lockdown, hiding OS chrome and address bars.

### Approach 2: Localhost WebSocket Print Agent

When kiosk mode is too restrictive for general-purpose workstations, deploy a background tray agent (such as Printzen Desktop Bridge) exposing a local socket endpoint:

\`\`\`javascript
const bridge = new WebSocket('ws://127.0.0.1:8765');
bridge.onopen = () => {
  bridge.send(JSON.stringify({
    action: 'print_raw',
    printer: 'Epson_TM_T20III',
    payload: btoa(String.fromCharCode(...binaryPayload))
  }));
};
\`\`\`

This delivers sub-500ms zero-dialogue receipt and label cutting while maintaining full browser application fluidity.
`
  },

  // 6. WooCommerce
  {
    trFile: 'woocommerce-otomatik-termal-fis-kargo-etiketi-yazdirma.md',
    enFile: 'woocommerce-automatic-thermal-receipt-shipping-label-printing.md',
    pattern: 'woocommerce',
    trExtra: `
## WooCommerce Webhook ve Otomatik Baskı Hattı

WooCommerce altyapısıyla çalışan e-ticaret sitelerinde yeni bir sipariş oluşturulduğunda ("Processing" veya "Completed" statüsüne geçtiğinde), depodaki kargo barkod yazıcısından 100x150 mm kargo etiketinin, mağaza kasasından ise sevk fişinin otomatik çıkması operasyonel hız kazandırır.

### WordPress Webhook Yapılandırması
1. **WooCommerce > Ayarlar > Gelişmiş > Webhook'lar** menüsüne gidin.
2. Yeni webhook ekleyin:
   - **Konu:** Sipariş Oluşturuldu (\`order.created\`) veya Sipariş Güncellendi (\`order.updated\`)
   - **Durum:** Etkin
   - **Teslimat URL'si:** \`https://api.printzen.app/v1/webhooks/woocommerce\`
   - **Gizli Anahtar (Secret):** Güvenli bir HMAC anahtarı tanımlayın

\`\`\`php
// functions.php içine doğrudan özel tetikleyici ekleme:
add_action('woocommerce_order_status_processing', 'printzen_trigger_auto_print', 10, 1);

function printzen_trigger_auto_print($order_id) {
    $order = wc_get_order($order_id);
    $payload = [
        'order_id' => $order_id,
        'customer' => $order->get_formatted_shipping_full_name(),
        'items' => [],
        'total' => $order->get_total(),
        'shipping_method' => $order->get_shipping_method()
    ];

    foreach ($order->get_items() as $item) {
        $payload['items'][] = [
            'name' => $item->get_name(),
            'quantity' => $item->get_quantity(),
            'sku' => $item->get_product()->get_sku()
        ];
    }

    wp_remote_post('https://api.printzen.app/v1/jobs/auto', [
        'headers' => [
            'Authorization' => 'Bearer ' . PRINTZEN_API_KEY,
            'Content-Type' => 'application/json'
        ],
        'body' => json_encode($payload)
    ]);
}
\`\`\`

## Kargo ve Fiş Ayrıştırma Mimarisi
- **Mutfak / Hazırlık Fişi:** 80 mm termal kağıda sipariş listesi ve toplama kalemleri dökülür.
- **Kargo Barkodu:** 100x150 mm termal etikete taşıyıcı barkodu ve müşteri teslimat adresi ZPL veya TSPL olarak aktarılır.
`,
    enExtra: `
## Automated WooCommerce Print Pipeline Architecture

When an order transitions to "Processing" or "Completed" in WooCommerce, dispatching a 4x6" shipping barcode to the warehouse printer and a packing receipt to the fulfilment desk automatically prevents manual bottlenecking.

### Webhook Configuration Workflow
1. Navigate to **WooCommerce > Settings > Advanced > Webhooks**.
2. Create a new trigger:
   - **Topic:** Order created (\`order.created\`) or Order updated (\`order.updated\`)
   - **Status:** Active
   - **Delivery URL:** \`https://api.printzen.app/v1/webhooks/woocommerce\`
   - **Secret:** Generate a high-entropy HMAC secret

\`\`\`php
// Optional custom webhook hook in WordPress:
add_action('woocommerce_order_status_processing', 'printzen_dispatch_cloud_print', 10, 1);

function printzen_dispatch_cloud_print($order_id) {
    $order = wc_get_order($order_id);
    $payload = [
        'order_id' => $order_id,
        'shipping_name' => $order->get_formatted_shipping_full_name(),
        'total' => $order->get_total(),
        'items' => array_map(fn($item) => [
            'title' => $item->get_name(),
            'qty' => $item->get_quantity(),
            'sku' => $item->get_product()->get_sku()
        ], $order->get_items())
    ];

    wp_remote_post('https://api.printzen.app/v1/jobs/auto', [
        'headers' => [
            'Authorization' => 'Bearer ' . PRINTZEN_API_KEY,
            'Content-Type' => 'application/json'
        ],
        'body' => json_encode($payload)
    ]);
}
\`\`\`
`
  },

  // 7. Pazaryeri Kargo
  {
    trFile: 'pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon.md',
    enFile: 'ecommerce-marketplace-shipping-label-printing-guide.md',
    pattern: 'pazaryeri-kargo',
    trExtra: `
## Pazaryeri Kargo Etiketlerinde Dönüştürme ve Kırpma Mimarisi

Trendyol, Hepsiburada, Amazon Türkiye, N11 ve Çiçeksepeti satıcı panelleri çoğu zaman kargo etiketlerini standart A4 formatında veya kenarlarında geniş boşluklar bulunan PDF belgeleri olarak üretir. Bu PDF'leri 100x150 mm termal etiket yazıcılarına (Zebra ZD220, Xprinter XP-420B, TSC DA210 vb.) doğrudan göndermek etiketlerin küçülmesine, barkod çizgilerinin birbirine girmesine ve kargo şubelerinde optik okuyucuların barkodu okuyamamasına neden olur.

### Otomatik Kırpma (PDF Cropping) ve Yeniden Ölçeklendirme
1. **Dahili Vektör Analizi:** PDF belgesindeki barkod koordinatları tespit edilir.
2. **Boşlukların Temizlenmesi:** A4 kenar boşlukları atılarak sadece etiket alanı 100x150 mm oranına kilitlenir.
3. **Döndürme (Rotation):** Yatay gelen etiketler saat yönünde 90 derece döndürülerek yazıcının kağıt akış yönüne hizalanır.
4. **1-Bit Dönüşümü:** Renkli veya gri tonlamalı PDF alanları Floyd-Steinberg dithering algoritmasıyla 203 DPI saf siyah/beyaz raster veriye çevrilir.

\`\`\`javascript
// Printzen Etiket Kırpma Motoru Örneği:
import { cropAndScalePDF } from '@printzen/label-processor';

const thermalZpl = await cropAndScalePDF({
  inputPdfBuffer: rawA4Pdf,
  targetDpi: 203,
  labelWidthMm: 100,
  labelHeightMm: 150,
  autoRotate: true,
  outputFormat: 'zpl' // Zebra için ZPL, Xprinter için TSPL
});
\`\`\`
`,
    enExtra: `
## Marketplace Shipping Label Transformation & PDF Cropping

E-commerce marketplaces (Amazon, eBay, Walmart, Trendyol) frequently generate shipping barcodes as full-page A4/Letter PDF sheets flanked by wide white margins. Sending these directly to 4x6" thermal label printers (Zebra, TSC, Xprinter) causes heavy scaling degradation, rendering high-density Code 128 and 2D barcodes unreadable by courier optical scanners.

### The Automated Thermal Transformation Pipeline
1. **Bounding Box Detection:** Parse the PDF vector tree to locate the primary shipping barcode coordinates.
2. **Margin Trimming:** Strip away non-essential white space and crop tightly around the 100x150 mm boundary.
3. **Orientation Normalization:** Rotate landscape labels 90° clockwise to align with vertical thermal feed direction.
4. **Monochrome Quantization:** Convert multi-shade documents into 1-bit binary raster maps at native 203/300 DPI.

\`\`\`javascript
import { processShippingLabel } from '@printzen/label-processor';

const binaryPayload = await processShippingLabel({
  pdfData: incomingPdfBuffer,
  dpi: 203,
  widthInches: 4,
  heightInches: 6,
  targetProtocol: 'ZPL' // Outputs optimized ^GFA vector blocks
});
\`\`\`
`
  },

  // 8. Restoran & Mutfak
  {
    trFile: 'restoran-kafe-mutfak-adisyon-yazdirma-mimarisi.md',
    enFile: 'restaurant-kitchen-order-ticket-kot-printing-architecture.md',
    pattern: 'restoran-kafe-mutfak',
    trExtra: `
## Restoran Mutfak Adisyon Mimarisi ve İstasyon Dağıtımı

Yoğun bir restoranda sipariş anında servis garsonunun girdiği siparişlerin doğru mutfak istasyonlarına milisaniyeler içinde hatasız dağıtılması gerekir. Soğuk mezelerin mutfağa, kokteyllerin bara, sıcak ana yemeklerin ise ızgara bölümüne anında gitmesi operasyonel başarıyı belirler.

### Mutfak Yazıcılarında Donanımsal Gereksinimler
- **Ethernet (Kablolu Ağ):** Mutfak ortamındaki fırınlar, mikrodalgalar ve paslanmaz çelik tezgahlar Bluetooth ve Wi-Fi sinyallerini zayıflatır. Mutfak adisyon yazıcıları mutlaka Ethernet (Port 9100) üzerinden bağlanmalıdır.
- **Sesli Buzzer & Işıklı Alarm:** Gürültülü mutfak ortamında aşçıların yeni siparişi fark etmesi için yazıcının arkasındaki RJ-11 portuna bağlı harici sesli buzzer tetiklenmelidir:
  - ESC/POS Buzzer Komutu: \`ESC p 0 50 250\` (0x1B 0x70 0x00 0x32 0xFA)
- **Suya ve Yağa Dayanıklı Kağıt:** Mutfak buharında kararmayan kaliteli lamine termal rulolar kullanılmalıdır.

\`\`\`javascript
// İstasyon Bazlı Ayrıştırma Kuralı Örneği:
function routeOrderTickets(order) {
  const barItems = order.items.filter(i => i.category === 'drink' || i.category === 'bar');
  const kitchenItems = order.items.filter(i => i.category !== 'drink' && i.category !== 'bar');

  if (barItems.length > 0) {
    printToStation('192.168.1.150', formatBarTicket(order, barItems)); // Bar Yazıcısı
  }
  if (kitchenItems.length > 0) {
    printToStation('192.168.1.160', formatKitchenTicket(order, kitchenItems)); // Ana Mutfak
  }
}
\`\`\`
`,
    enExtra: `
## Kitchen Order Ticket (KOT) Routing Architecture

In high-volume hospitality environments, kitchen throughput depends on instant, error-free ticket dispatching. Appetizers must route to the cold station, cocktails to the service bar, and entrees to the hot grill line without human intervention.

### Critical Hardware Requirements for Kitchens
- **Hardwired Ethernet (Port 9100):** Kitchen environments packed with stainless steel counters, microwaves, and industrial ovens degrade 2.4 GHz wireless signals. Always run Cat6 Ethernet to kitchen stations.
- **Audible Buzzer & Optical Alarms:** To alert line cooks during peak rush hours, trigger the RJ-11 buzzer port on every print:
  - ESC/POS Cash Drawer / Buzzer Command: \`ESC p 0 50 250\` (\`0x1B 0x70 0x00 0x32 0xFA\`)
- **Heat-Resistant Thermal Stock:** Use top-coated, BPA-free thermal rolls to prevent tickets from darkening near heat lamps.

\`\`\`javascript
export function dispatchOrder(order) {
  const drinks = order.items.filter(i => i.department === 'beverage');
  const hotKitchen = order.items.filter(i => i.department === 'kitchen');

  if (drinks.length) sendRawTcp('192.168.1.201', 9100, formatTicket(order, drinks));
  if (hotKitchen.length) sendRawTcp('192.168.1.202', 9100, formatTicket(order, hotKitchen));
}
\`\`\`
`
  },

  // 9. Bluetooth Sorun Giderme
  {
    trFile: 'bluetooth-termal-yazici-baglanti-sorunlari-rehberi.md',
    enFile: 'bluetooth-thermal-printer-troubleshooting-guide.md',
    pattern: 'bluetooth-termal-yazici',
    trExtra: `
## Bluetooth Termal Yazıcı Bağlantı Hataları Teşhis Matrisi

Bluetooth termal yazıcılarda yaşanan bağlantı kopmaları ve çıktı alamama problemleri çoğunlukla donanım arızasından değil, protokol uyuşmazlıkları ve işletim sistemi Bluetooth önbellek kilitlenmelerinden kaynaklanır.

### En Sık Karşılaşılan 4 Sorun ve Çözümleri

1. **"Cihaz Eşleşti Ancak Yazmıyor" (Paired but not Printing):**
   - **Sebep:** Android cihaz yazıcıyı klasik kulaklık/ses profili veya HID klavye olarak kaydetmiş olabilir.
   - **Çözüm:** Bluetooth ayarlarından cihazın eşleşmesini kaldırın (Unpair). Yazıcıyı kapatıp açın. Eşleştirme yaparken PIN kodunu (0000 veya 1234) girdikten sonra doğrudan Web Bluetooth veya Printzen POS uygulamasından arama yapın.

2. **Satır Atlama ve Fişin Yarım Kalması (Buffer Overflow):**
   - **Sebep:** Yazıcının dahili RAM tamponu (genellikle 4 KB - 16 KB) dolduğunda gelen baytları atması.
   - **Çözüm:** Büyük görselleri ve uzun metinleri 512 baytlık paketlere bölün ve her paket arasına 15-20 ms gecikme koyun.

3. **Mobil Yazıcının Uyku Moduna Geçmesi ve Uyanmaması:**
   - **Sebep:** Batarya koruma devresi 3 dakika veri gelmediğinde Bluetooth modülünü kapatır.
   - **Çözüm:** Yazıcının DIP switch ayarlarından veya Printzen SDK'nın \`keepAlivePing()\` fonksiyonu ile 60 saniyede bir boş byte (0x00) göndererek bağlantıyı sıcak tutun.
`,
    enExtra: `
## Bluetooth Thermal Printer Diagnostic Matrix

Bluetooth communication failures in field and mobile printers are almost universally attributable to pairing cache corruption, MTU mismatches, or sleep timeout triggers rather than hardware defects.

### Primary Failure Modes & Remediation

1. **Paired but Not Printing (Silent Hang):**
   - **Root Cause:** The host OS bound the printer as an unhandled generic HID device or audio profile instead of RFCOMM/SPP.
   - **Resolution:** Unpair the device. Clear Bluetooth OS cache. Re-pair using default passcode \`0000\` or \`1234\`, then initialize communication strictly through explicit GATT endpoints.

2. **Truncated Receipts & Buffer Overflows:**
   - **Root Cause:** Exceeding the printer's onboard FIFO buffer (typically 4 KB to 32 KB).
   - **Resolution:** Implement client-side rate throttling. Transmit binary payloads in 512-byte slices throttled by 15ms pauses.

3. **Peripheral Sleep Disconnects:**
   - **Root Cause:** Energy-saving firmware entering deep sleep after 180 seconds of bus inactivity.
   - **Resolution:** Configure Printzen SDK's background heartbeat to transmit zero-byte keepalive pings every 45 seconds.
`
  },

  // 10. SDK Mimarisi
  {
    trFile: 'web-uygulamalari-termal-yazdirma-sdk-mimarisi.md',
    enFile: 'thermal-printing-sdk-architecture-javascript-react-vue.md',
    pattern: 'web-uygulamalari-termal-yazdirma',
    trExtra: `
## Modern Web Yazdırma SDK Mimarisi (NPM / TypeScript)

Web tabanlı kurumsal uygulamalarda termal yazıcı entegrasyonu yapılırken en büyük zorluk; Bluetooth, USB, Ağ (Ethernet) ve Bulut bağlantı protokollerinin her birinin farklı API'lere sahip olmasıdır. İyi kurgulanmış bir Termal Yazdırma SDK'sı, tüm bu donanım kanallarını tek bir soyutlama katmanı (Hardware Abstraction Layer - HAL) arkasında toplamalıdır.

### Çok Katmanlı SDK Mimarisi

\`\`\`
[React / Vue / Next.js Web Uygulaması]
                  │
        [Printzen High-Level SDK]
     (Fis Tasarımı, Dithering, Fontlar)
                  │
     [Hardware Abstraction Layer (HAL)]
  ┌───────────────┼───────────────┬───────────────┐
  ▼               ▼               ▼               ▼
[Web Bluetooth] [WebUSB]    [WebSocket TCP] [Cloud Queue]
  (BLE GATT)      (USB Bulk)  (Port 9100)     (HTTPS API)
\`\`\`

### TypeScript ile Birleşik Yazıcı Arayüzü

\`\`\`typescript
export interface IThermalPrinter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  write(bytes: Uint8Array): Promise<void>;
  getStatus(): Promise<PrinterStatus>;
}

export class ThermalPrinterFactory {
  static create(type: 'bluetooth' | 'usb' | 'network' | 'cloud', config: any): IThermalPrinter {
    switch (type) {
      case 'bluetooth': return new WebBluetoothTransport(config);
      case 'usb': return new WebUsbTransport(config);
      case 'network': return new NetworkSocketTransport(config);
      case 'cloud': return new CloudQueueTransport(config);
      default: throw new Error(\`Bilinmeyen donanım kanalı: \${type}\`);
    }
  }
}
\`\`\`
`,
    enExtra: `
## Modern Thermal Printing SDK Architecture (TypeScript / NPM)

The primary engineering challenge when integrating thermal printing into web applications is transport fragmentation: Web Bluetooth, WebUSB, Raw TCP, and Cloud Queues all expose completely different asynchronous communication semantics. A world-class Thermal Printing SDK resolves this by implementing a unified Hardware Abstraction Layer (HAL).

### The Multi-Tier Architecture

\`\`\`
[React / Vue / Svelte Host Application]
                  │
         [Printzen Core SDK]
    (Templating, Dithering, Font Tables)
                  │
    [Hardware Abstraction Layer (HAL)]
  ┌───────────────┼───────────────┬───────────────┐
  ▼               ▼               ▼               ▼
[Web Bluetooth] [WebUSB]     [Raw Socket TCP] [Cloud REST API]
  (BLE GATT)      (Bulk OUT)   (Port 9100)      (MQTT / Push)
\`\`\`

### Unified TypeScript Transport Contract

\`\`\`typescript
export interface IThermalTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(payload: Uint8Array): Promise<void>;
  queryStatus(): Promise<{ paperOk: boolean; coverClosed: boolean }>;
}
\`\`\`
`
  }
];

let updatedCount = 0;

for (const p of PILLARS) {
  const trPath = path.join(TR_DIR, p.trFile);
  const enPath = path.join(EN_DIR, p.enFile);

  const trLinks = getPseoLinks(p.pattern, 'tr');
  const enLinks = getPseoLinks(p.pattern, 'en');

  if (fs.existsSync(trPath)) {
    let content = fs.readFileSync(trPath, 'utf8');
    if (!content.includes('## ZPL II Komut') && !content.includes('## Donanımsal Kod Sayfası') && !content.includes('## Web Bluetooth API ile Mobil') && !content.includes('## Web POS ve Perakendede') && !content.includes('## WooCommerce Webhook') && !content.includes('## Pazaryeri Kargo Etiketlerinde') && !content.includes('## Restoran Mutfak Adisyon') && !content.includes('## Bluetooth Termal Yazıcı Bağlantı Hataları') && !content.includes('## Modern Web Yazdırma SDK Mimarisi')) {
      content = content.trimEnd() + '\n' + p.trExtra;
    }
    if (!content.includes('Popüler Model Özelinde')) {
      content = content.trimEnd() + trLinks;
    }
    fs.writeFileSync(trPath, content, 'utf8');
    process.stdout.write(`✅ TR Pillar Genişletildi: ${p.trFile}\n`);
    updatedCount++;
  }

  if (fs.existsSync(enPath)) {
    let content = fs.readFileSync(enPath, 'utf8');
    if (!content.includes('## ZPL II Architecture') && !content.includes('## Thermal Hardware Code Page') && !content.includes('## Web Bluetooth API for Browser') && !content.includes('## Silent & Automated Printing') && !content.includes('## Automated WooCommerce Print') && !content.includes('## Marketplace Shipping Label') && !content.includes('## Kitchen Order Ticket (KOT)') && !content.includes('## Bluetooth Thermal Printer Diagnostic') && !content.includes('## Modern Thermal Printing SDK Architecture')) {
      content = content.trimEnd() + '\n' + p.enExtra;
    }
    if (!content.includes('Device-Specific Guides')) {
      content = content.trimEnd() + enLinks;
    }
    fs.writeFileSync(enPath, content, 'utf8');
    process.stdout.write(`✅ EN Pillar Genişletildi: ${p.enFile}\n`);
    updatedCount++;
  }
}

console.log(`\n🎉 Toplam ${updatedCount} pillar dosyası başarıyla zenginleştirildi ve pSEO iç linkleri eklendi!`);

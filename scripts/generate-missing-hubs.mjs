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
  const label = lang === 'tr' ? 'Popüler Yazıcı Modeli Özelinde Kılavuzlar' : 'Printer-Specific Implementation Guides';
  
  const links = files.slice(0, 10).map(f => {
    const slug = f.replace('.html', '');
    const cleanName = slug.split('-').slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `- [${cleanName}](${baseUrl}/${slug})`;
  });

  return `\n\n## ${label}\n\n${links.join('\n')}\n`;
}

// 40 Kapsamlı Konu Kılavuz Veritabanı
const REMAINING_TOPICS = [
  {
    id: 3,
    slugTr: 'tspl-ve-tspl2-masaustu-barkod-programlama',
    slugEn: 'tspl-tspl2-desktop-barcode-programming',
    pattern: 'tspl-ve-tspl2',
    titleTr: 'TSPL ve TSPL2 Masaüstü Barkod Yazıcı Programlama Kılavuzu',
    titleEn: 'TSPL & TSPL2 Desktop Barcode Printer Programming Guide',
    descTr: 'TSC, Xprinter ve Godex masaüstü etiket yazıcılarında kullanılan TSPL/TSPL2 dili komutları, SIZE, GAP, TEXT, BARCODE ve sensör kalibrasyon kuralları.',
    descEn: 'Master TSPL and TSPL2 printer programming for TSC, Xprinter, and Godex label printers. Complete reference for SIZE, GAP, TEXT, and BARCODE commands.',
    trBody: `
TSPL (Taiwan Semiconductor Programming Language) ve onun geliştirilmiş sürümü olan TSPL2, dünya çapında özellikle fiyat/performans odaklı masaüstü termal etiket yazıcılarında (TSC, Xprinter, Gprinter, Godex vb.) en çok tercih edilen etiket dillerinden biridir. ZPL kadar yaygın olan bu dil, çok daha basit ve okunabilir komut yapısıyla geliştiricilere hızlı entegrasyon imkanı sunar.

## Temel TSPL Komut Yapısı

TSPL komutları metin tabanlıdır ve her komut yeni bir satırda (\`\\r\\n\`) çalıştırılır. Bir etiket basımı temel olarak şu komut bloklarını içerir:

\`\`\`tspl
SIZE 100 mm, 150 mm
GAP 3 mm, 0 mm
DIRECTION 1
CLS
TEXT 50,50,"3",0,1,1,"PRINTZEN E-TICARET KARGO"
BARCODE 50,120,"128",80,1,0,2,4,"TR1234567890"
PRINT 1,1
\`\`\`

### Komutların Teknik Anlamları:
- **SIZE w, h:** Etiketin milimetre veya inç cinsinden genişlik ve yüksekliğini belirler. Örneğin 100x150 mm standart kargo etiketi için \`SIZE 100 mm, 150 mm\` yazılır.
- **GAP m, n:** İki etiket arasındaki boşluk (gap) yüksekliğini tanımlar. Standart rulolarda gap genellikle 2-3 mm arasındadır.
- **DIRECTION 0 | 1:** Etiketin yazıcı kafasından çıkış yönünü tersine çevirir (180 derece döndürme).
- **CLS:** Yazıcının dahili görüntü tamponunu (image buffer) temizler. Her yeni etiketten önce mutlaka çağrılmalıdır.
- **TEXT x, y, "font", rot, x-mul, y-mul, "content":** Belirtilen koordinata dahili donanım fontuyla metin çizer.
- **BARCODE x, y, "type", height, human-readable, rot, narrow, wide, "code":** Otomatik vektörel barkod üretir.
- **PRINT m, n:** Hazırlanan etiketi m kopya ve n set halinde anında termal kafadan çıkarır.

## TSPL ile QR Kod ve 2D Barkod Basımı

\`\`\`tspl
QRCODE 50,250,L,5,A,0,"M2,S7","https://printzen.app/track/TR123"
\`\`\`

- **L | M | Q | H:** Hata düzeltme (Error Correction) seviyesi. Kargo etiketlerinde genellikle 'M' (%15) veya 'Q' (%25) tercih edilir.
- **Cell width (1-10):** Karekodun her bir modülünün piksel genişliği. 203 DPI yazıcıda 4-6 arası ideal okunabilirlik sağlar.

## JavaScript / Node.js ile TSPL Paketi Oluşturma

\`\`\`javascript
export function buildTsplLabel(data) {
  let cmd = '';
  cmd += 'SIZE 100 mm, 150 mm\\r\\n';
  cmd += 'GAP 3 mm, 0 mm\\r\\n';
  cmd += 'DIRECTION 1\\r\\n';
  cmd += 'CLS\\r\\n';
  cmd += \`TEXT 40,40,"4",0,1,1,"\${data.storeName}"\\r\\n\`;
  cmd += \`TEXT 40,90,"2",0,1,1,"Musteri: \${data.customerName}"\\r\\n\`;
  cmd += \`BARCODE 40,150,"128",90,1,0,2,4,"\${data.trackingNo}"\\r\\n\`;
  cmd += \`QRCODE 500,150,H,4,A,0,"M2,S7","\${data.qrData}"\\r\\n\`;
  cmd += 'PRINT 1,1\\r\\n';
  return new TextEncoder().encode(cmd);
}
\`\`\`
`,
    enBody: `
TSPL (Taiwan Semiconductor Programming Language) and its successor TSPL2 serve as the primary native command languages across cost-effective desktop barcode and direct thermal shipping label printers (TSC, Xprinter, Gprinter, Godex). Known for clean, human-readable syntax, TSPL provides rapid label formatting without requiring heavy binary compilers.

## Core TSPL Command Syntax

All TSPL instructions are plain-text statements terminated with CRLF (\`\\r\\n\`). A production label payload contains:

\`\`\`tspl
SIZE 4, 6
GAP 0.12, 0
DIRECTION 1
CLS
TEXT 50,50,"3",0,1,1,"PRINTZEN FULFILLMENT"
BARCODE 50,120,"128",80,1,0,2,4,"TR1234567890"
PRINT 1,1
\`\`\`

### Command Reference:
- **SIZE:** Sets the physical dimension of the label in inches or millimeters.
- **GAP:** Configures gap/notch distance between consecutive labels.
- **CLS:** Clears the printhead framebuffer. Crucial before every new design.
- **TEXT:** Renders native monospace or proportional bitmap fonts.
- **BARCODE:** Directly instructs hardware to generate Code 128, EAN, or UPC.
- **PRINT:** Dispatches the buffered bitmap to the thermal head.
`
  },
  {
    id: 4,
    slugTr: 'cpcl-mobil-kurye-ve-saha-yazdirma-protokolu',
    slugEn: 'cpcl-mobile-courier-field-printing-protocol',
    pattern: 'cpcl-mobil-kurye',
    titleTr: 'CPCL Mobil Kurye ve Saha Yazdırma Protokolü Kılavuzu',
    titleEn: 'CPCL Mobile Courier & Field Printing Protocol Guide',
    descTr: 'Taşınabilir kemer tipi mobil yazıcılarda kullanılan CPCL protokolü mimarisi, pil koruma optimizasyonları ve saha teslimat fişi tasarımı.',
    descEn: 'Comprehensive guide to CPCL protocol for portable mobile belt printers. Low battery management, lightweight payloads, and field receipt printing.',
    trBody: `
CPCL (Comtec Printer Control Language), mobil kargo kuryeleri, otopark görevlileri, elektrik/su sayaç okuma personeli ve saha satış ekiplerinin kemer tipi taşınabilir yazıcılarında (Zebra QLn/ZQ serisi, Bixolon SPP serisi, Rongta mobil yazıcılar) kullanılan ultra hafif bir komut dilidir.

## CPCL Neden Mobil Sistemlerde Tercih Edilir?
ZPL ve TSPL gibi masaüstü dilleri tüm etiketi hafızada büyük bir piksel tamponuna işlerken, CPCL doğrudan **satır odaklı (streaming line-oriented)** mimariye sahiptir. Bu sayede:
1. Mobil yazıcının mikroişlemcisi ve RAM'i minimum seviyede yorulur.
2. Batarya tüketimi %40'a varan oranda azalır.
3. Bluetooth BLE üzerinden iletilen toplam bayt paketi çok küçüktür, bu da transfer süresini kısaltır.

## CPCL Kod Bloğu Anatomisi

\`\`\`cpcl
! 0 200 200 600 1
PAGE-WIDTH 576
TEXT 4 0 30 40 PRINTZEN MOBIL KURYE
TEXT 7 0 30 90 Teslimat Fisi #TR-9982
LINE 30 130 540 130 2
TEXT 7 0 30 150 Musteri: Ayse Demir
TEXT 7 0 30 180 Tutar: 145.50 TL (Kredi Karti)
BARCODE 128 1 1 50 30 230 TR9982718
PRINT
\`\`\`

- **! 0 200 200 600 1:** Başlangıç satırı. Orijin (0), X-DPI (200), Y-DPI (200), maksimum yükseklik (600 dot) ve kopya adedi (1).
- **PAGE-WIDTH 576:** 80 mm (72 mm baskı alanı) yazıcı için sayfa genişliği sınırı.
- **TEXT font size x y text:** Belirtilen font ve koordinata metin yerleştirir.
- **BARCODE type width ratio height x y data:** 1D barkod üretir.
- **PRINT:** Baskıyı başlatır ve kağıdı yırtma çizgisine (tear-bar) ilerletir.
`,
    enBody: `
CPCL (Comtec Printer Control Language) is a specialized streaming protocol designed for rugged mobile belt printers deployed in logistics, traffic enforcement, utility billing, and route accounting (e.g., Zebra ZQ, Bixolon SPP).

## Why Mobile Fleets Rely on CPCL
Unlike frame-buffered page languages, CPCL processes documents sequentially as a stream of line vectors. This architecture provides:
- Minimal onboard RAM footprint.
- Significant reduction in CPU wake time, directly extending battery runtime.
- Ultra-compact byte payloads ideal for low-energy Bluetooth transmission.
`
  },
  {
    id: 5,
    slugTr: 'epl-ve-epl2-eski-nesil-etiket-emulasyonu',
    slugEn: 'epl-epl2-legacy-label-emulation-architecture',
    pattern: 'epl-ve-epl2',
    titleTr: 'EPL ve EPL2 Eski Nesil Etiket Mimarisi ve Emülasyon Rehberi',
    titleEn: 'EPL & EPL2 Legacy Label Architecture and Emulation Guide',
    descTr: 'Eltron kökenli EPL/EPL2 barkod komut yapısı, N/q/Q/A/B komutları ve modern ZPL/TSPL sistemlerine kod kaybı olmadan dönüştürme metotları.',
    descEn: 'Architectural guide to legacy Eltron Programming Language (EPL/EPL2). Understand N, q, Q, A, B commands and migrate legacy code to modern ZPL/TSPL.',
    trBody: `
EPL (Eltron Programming Language) ve EPL2, 1990'lar ve 2000'lerin başında Zebra'nın Eltron'u satın almasıyla etiket dünyasında standart haline gelen ilk nesil sayfa tanımlama dillerindendir. Günümüzde birçok eski hastane otomasyonu, kargo şubesi ve kurumsal ERP sistemi halen EPL formatında çıktı üretmektedir.

## EPL2 Komut Yapısı

EPL2 komutları tek harfli direktiflerle çalışır ve son derece kompakttır:

\`\`\`epl
N
q812
Q1218,24
A50,50,0,4,1,1,N,"PRINTZEN DEPO KABUL"
B50,120,0,1,3,6,80,B,"123456789"
P1
\`\`\`

- **N (New):** Belleği sıfırlar ve yeni bir etiket başlatır.
- **q (width):** Etiketin nokta (dot) cinsinden genişliğini tanımlar (812 dot = 100 mm).
- **Q (height, gap):** Etiket yüksekliğini ve gap mesafesini belirler.
- **A (ASCII text):** Metin çizer (x, y, rotation, font, h-mul, v-mul, reverse, data).
- **B (Barcode):** Barkod basar (Code 128, EAN vb.).
- **P (Print):** Baskıyı gerçekleştirir.
`,
    enBody: `
EPL (Eltron Programming Language) represents the foundational page description standard acquired by Zebra Technologies. A vast corpus of enterprise healthcare, supply chain, and postal infrastructure still emits EPL2 streams. Modern cloud printing platforms must maintain native backward compatibility with these legacy streams.
`
  },
  {
    id: 6,
    slugTr: 'star-line-mode-ve-starprnt-fis-protokolleri',
    slugEn: 'star-line-mode-starprnt-receipt-protocols',
    pattern: 'star-line-mode',
    titleTr: 'Star Line Mode ve StarPRNT Fiş Yazıcı Protokolleri Kılavuzu',
    titleEn: 'Star Line Mode & StarPRNT Receipt Printer Protocols Guide',
    descTr: 'Star Micronics masaüstü ve mutfak yazıcılarının emülasyon farkları, Star Line Mode komutları ve ESC/POS uyumluluk katmanları.',
    descEn: 'Comprehensive guide to Star Micronics Star Line Mode and StarPRNT command architectures. Learn emulation nuances, CloudPRNT integration, and ESC/POS layers.',
    trBody: `
Star Micronics, özellikle perakende, kiosk ve restoran sektöründe Epson'ın en büyük küresel rakibidir. Star yazıcılar (TSP143, TSP654 vb.) fabrika çıkışında ya **Star Line Mode** ya da modern **StarPRNT** protokolüyle gelir.

## Star Line Mode vs ESC/POS Farkları
- **Kesici Komutu:** ESC/POS \`GS V\` kullanırken, Star yazıcılar \`ESC d 2\` veya \`ESC d 3\` komutlarını kullanır.
- **Çekmece Açma:** ESC/POS \`ESC p\` kullanırken, Star \`BEL\` (0x07) karakteriyle çekmece solenoidini tetikler.
- **Hizalama:** Star \`ESC a n\` yapısını kullanır.
`,
    enBody: `
Star Micronics dominates the hospitality, mPOS, and kiosk landscape. Their hardware relies either on classic Star Line Mode or the contemporary unified StarPRNT emulation protocol.
`
  },
  {
    id: 7,
    slugTr: 'satir-modu-vs-raster-sayfa-modu',
    slugEn: 'line-mode-vs-raster-page-mode',
    pattern: 'satir-modu-vs-raster',
    titleTr: 'Satır Modu (Line Mode) vs Raster Sayfa Modu Karşılaştırması',
    titleEn: 'Line Mode vs Raster Page Mode: Architectural Deep Dive',
    descTr: 'Belleği kısıtlı termal cihazlarda satır satır akıtılan veri ile tüm fişin 1-bit monokrom bitmap tamponuna işlenip tek seferde basılması arasındaki hız ve hafıza farkları.',
    descEn: 'Deep architectural comparison between streaming Line Mode and Page/Raster Mode in thermal receipt printing. Memory efficiency, typography freedom, and speed benchmarks.',
    trBody: `
Termal yazdırma mimarisinde en temel mühendislik tercihlerinden biri, çıktının **Satır Modu (Standard Line Mode)** ile mi yoksa **Sayfa / Raster Modu (Page Mode)** ile mi basılacağıdır.

### Karşılaştırma Matrisi

| Kriter | Satır Modu (Line Mode) | Sayfa / Raster Modu (Page Mode) |
|---|---|---|
| **Bellek Tüketimi** | Çok düşük (birkaç satır buffer) | Yüksek (Tam etiket framebuffer'ı) |
| **Baskı Gecikmesi** | Sıfır (bayt geldikçe kafa basar) | Tampon dolana kadar bekler |
| **Tipografi & Düzen** | Sınırlı (sadece sabit kolonlar) | Sınırsız (HTML/CSS, serbest koordinat) |
| **Karakter Kod Sayfası** | Yazıcı firmware'ine bağımlı | Bağımsız (tüm fontlar çizilir) |
`,
    enBody: `
In embedded receipt and barcode architecture, choosing between streaming Line Mode and buffered Page/Raster Mode dictates latency, memory overhead, and graphic fidelity.
`
  },
  {
    id: 10,
    slugTr: 'webusb-ve-webhid-ile-kablolu-donanim-iletisimi',
    slugEn: 'webusb-webhid-direct-hardware-communication',
    pattern: 'webusb-ve-webhid',
    titleTr: 'WebUSB ve WebHID ile Tarayıcıdan Kablolu Doğrudan Donanım İletişimi',
    titleEn: 'Direct Hardware Communication with WebUSB and WebHID APIs',
    descTr: 'USB kablosuyla bağlı termal yazıcıları tarayıcı seviyesinde Vendor ID (VID) ve Product ID (PID) ile talep etme, USB endpoint yapılandırması ve sürücüsüz web baskısı.',
    descEn: 'Connect to wired USB thermal printers directly from Chromium browsers using WebUSB and WebHID without local drivers. Full vendor claim and endpoint guide.',
    trBody: `
WebUSB ve WebHID standartları, Chrome ve Edge tarayıcılarının masaüstünde işletim sistemi seviyesinde yazıcı sürücüsü (Windows spooler) aracı olmadan doğrudan USB aygıtlarıyla iletişim kurmasını sağlar.

\`\`\`javascript
// WebUSB ile doğrudan USB Yazıcı İletişimi
const device = await navigator.usb.requestDevice({
  filters: [{ classCode: 7 }] // 7 = Printer Class
});
await device.open();
await device.selectConfiguration(1);
await device.claimInterface(0);

const endpoint = device.configuration.interfaces[0].alternates[0].endpoints.find(
  e => e.direction === 'out'
);

const data = new TextEncoder().encode('\\x1B@PRINTZEN USB TEST\\n\\n\\x1DV\\x41\\x03');
await device.transferOut(endpoint.endpointNumber, data);
\`\`\`
`,
    enBody: `
WebUSB and WebHID web standards allow Chromium-powered web applications to interface with USB thermal devices directly without installing vendor-specific operating system print drivers.
`
  },
  {
    id: 11,
    slugTr: 'ag-ve-ethernet-raw-port-9100-soket-mimarisi',
    slugEn: 'network-ethernet-raw-port-9100-socket-architecture',
    pattern: 'ag-ve-ethernet-raw-port-9100',
    titleTr: 'Ağ ve Ethernet Raw TCP/IP Port 9100 Soket Mimarisi Kılavuzu',
    titleEn: 'Network & Ethernet Raw TCP/IP Port 9100 Socket Architecture',
    descTr: 'Yerel ağdaki termal yazıcılara doğrudan port 9100 Raw Socket açarak işletim sistemi kuyruklarını bypass eden milisaniyelik veri akışı.',
    descEn: 'Direct socket architecture over TCP port 9100 for network thermal printers. Zero spooling, sub-second printing latency, and IP allocation best practices.',
    trBody: `
Yerel ağda (LAN) çalışan termal yazıcılar için standart iletişim yöntemi **Raw TCP Port 9100**'dür. Windows veya CUPS kuyruklarını aradan çıkararak doğrudan sokete bayt aktarmak, restoran mutfaklarında ve lojistik merkezlerinde gecikmeyi sıfıra indirir.
`,
    enBody: `
Raw TCP socket communication over port 9100 represents the most robust protocol for local area network (LAN) receipt and barcode deployment.
`
  },
  {
    id: 12,
    slugTr: 'wifi-termal-yazici-altyapisi-ve-ag-guvenligi',
    slugEn: 'wifi-thermal-printer-setup-network-security',
    pattern: 'wifi-termal-yazici',
    titleTr: 'Wi-Fi Termal Yazıcı Altyapısı ve Kurumsal Ağ Güvenliği Kılavuzu',
    titleEn: 'Enterprise Wi-Fi Thermal Printer Infrastructure and Network Security',
    descTr: 'Kablosuz restoran ve depo yazıcılarının WPA2/WPA3 kurumsal ağlara tanıtılması, IP çakışmalarını önleme ve uyku modu ağ kopmalarını engelleme.',
    descEn: 'Deploy wireless Wi-Fi thermal printers in enterprise networks. Covers WPA2/WPA3 isolation, DHCP lease reservations, and sleep-mode disconnect prevention.',
    trBody: `
Wi-Fi termal yazıcılar, kablo çekmenin imkansız olduğu restoran açık alanlarında ve gezici perakende stantlarında esneklik sağlar. Ancak kurumsal ağlarda doğru yapılandırılmadığında en büyük arıza kaynağı haline gelir.
`,
    enBody: `
Deploying Wi-Fi thermal printers in high-throughput enterprise hospitality requires precise DHCP reservation, network segmentation, and power-saving management.
`
  },
  {
    id: 13,
    slugTr: 'bluetooth-eslesme-protokolleri-spp-vs-ble-gatt',
    slugEn: 'bluetooth-pairing-protocols-spp-vs-ble-gatt',
    pattern: 'bluetooth-eslesme-protokolleri',
    titleTr: 'Bluetooth Eşleşme Protokolleri: Klasik SPP vs BLE GATT',
    titleEn: 'Bluetooth Pairing Protocols: Classic SPP vs Modern BLE GATT',
    descTr: 'Klasik Bluetooth Seri Port Profili (SPP/RFCOMM) ile Düşük Enerjili Bluetooth (BLE) arasındaki mimari farklar ve mobil işletim sistemi izinleri.',
    descEn: 'Deep architectural comparison between Classic Bluetooth SPP (RFCOMM) and BLE GATT for thermal receipt and barcode peripherals.',
    trBody: `
Bluetooth donanımlarında iki farklı teknoloji nesli bulunur: Klasik Bluetooth (Bluetooth Classic 2.1/3.0 - SPP) ve Düşük Enerjili Bluetooth (Bluetooth Low Energy 4.0/5.0 - BLE GATT).
`,
    enBody: `
Understanding the functional divergence between Classic Bluetooth Serial Port Profile (SPP) and modern Bluetooth Low Energy (BLE) GATT is fundamental for reliable mobile POS engineering.
`
  },
  {
    id: 14,
    slugTr: 'seri-port-rs232-ve-sanal-com-cozumleri',
    slugEn: 'serial-rs232-virtual-com-port-solutions',
    pattern: 'seri-port-rs232',
    titleTr: 'Seri Port RS-232 ve Sanal COM Çözümleri Rehberi',
    titleEn: 'Serial RS-232 & Virtual COM Port Solutions for Thermal Printers',
    descTr: 'Endüstriyel barkod terazileri, eski kasa terminalleri, baud rate ayarları, parity, stop bit ve USB-Seri dönüştürücü kararlılığı.',
    descEn: 'Complete hardware guide for RS-232 serial interfaces and Virtual COM ports on thermal devices. Baud rates, flow control, and Web Serial API integration.',
    trBody: `
RS-232 seri port iletişimi yarım asırlık bir teknoloji olmasına rağmen, endüstriyel ortamlarda ve market terazi entegrasyonlarında elektromanyetik parazitlere karşı en dayanıklı arabirimdir.
`,
    enBody: `
RS-232 serial communication remains an indispensable standard in industrial manufacturing, retail scales, and harsh embedded environments.
`
  },
  {
    id: 15,
    slugTr: 'coklu-istasyon-ve-paralel-yazici-yonlendirme',
    slugEn: 'multi-station-parallel-printer-routing',
    pattern: 'coklu-istasyon-ve-paralel',
    titleTr: 'Çoklu İstasyon ve Paralel Yazıcı Yönlendirme Mimarisi',
    titleEn: 'Multi-Station & Parallel Printer Routing Architecture',
    descTr: 'Bir satış işleminin tek tıkla hem kasiyer fişine (USB), hem mutfağa (Ethernet), hem bara (Wi-Fi) eşzamanlı ve hatasız dağıtılması.',
    descEn: 'Architecting parallel dispatch systems to split orders simultaneously between cashier, kitchen, bar, and packaging stations across mixed network topologies.',
    trBody: `
Bir restoranda veya çok katlı mağazada gerçekleşen tek bir sipariş, farklı lokasyonlardaki birden fazla yazıcıya parçalanarak gönderilmelidir.
`,
    enBody: `
Modern retail and hospitality demand simultaneous multi-target job dispatching across diverse network interfaces without blocking client checkout threads.
`
  },
  {
    id: 16,
    slugTr: 'sanal-yazici-simulatorleri-ve-test-ortamlari',
    slugEn: 'virtual-printer-simulators-dev-environments',
    pattern: 'sanal-yazici-simulatorleri',
    titleTr: 'Sanal Yazıcı Simülatörleri ve Geliştirici Test Ortamları',
    titleEn: 'Virtual Printer Simulators & Local Dev Environments Guide',
    descTr: 'Fiziksel donanım masada yokken yazılımcıların ESC/POS ve ZPL kodlarını tarayıcıda piksel piksel önizlemesini sağlayan simülatör araçları.',
    descEn: 'Emulate thermal receipt and label hardware locally. Preview ESC/POS and ZPL vector streams in browsers without physical printer hardware.',
    trBody: `
Fiziksel bir termal fiş veya etiket yazıcısı masanızda olmadan da yazılım geliştirebilirsiniz. Sanal yazıcı araçları, gönderilen ham bayt akışlarını anında tarayıcıda görsel bir fişe dönüştürür.
`,
    enBody: `
Building robust printing workflows without physical hardware on every developer's desk requires high-fidelity virtual emulation environments.
`
  },
  {
    id: 18,
    slugTr: 'cloud-print-agent-ve-arka-plan-servisleri',
    slugEn: 'cloud-print-agent-background-desktop-services',
    pattern: 'cloud-print-agent',
    titleTr: 'Cloud Print Agent ve Arka Plan Masaüstü Servisleri Mimarisi',
    titleEn: 'Cloud Print Agent & Background Desktop Services Architecture',
    descTr: 'İşletmenin bilgisayarında arka planda sessizce çalışan Windows Tray ve macOS Menubar ajanları, WebSocket bağlantıları ve yerel yazıcı yönetimi.',
    descEn: 'Architecting resilient background desktop print daemons for Windows and macOS. Tray services, local WebSocket bridges, and auto-update pipelines.',
    trBody: `
Web tabanlı bir bulut yazılımının yerel yazıcılara erişmesini sağlayan en profesyonel yöntem, işletmenin bilgisayarında bir kere kurulan arka plan servisidir (Desktop Print Agent).
`,
    enBody: `
Desktop print agents act as the missing bridge between zero-trust HTTPS cloud platforms and unauthenticated local hardware peripherals.
`
  },
  {
    id: 19,
    slugTr: 'webhook-ve-mqtt-ile-uzaktan-anlik-yazdirma',
    slugEn: 'remote-realtime-printing-webhooks-mqtt',
    pattern: 'webhook-ve-mqtt',
    titleTr: 'Webhook ve MQTT ile Uzaktan Anlık Yazdırma Mimarisi',
    titleEn: 'Remote Real-Time Printing with Webhooks and MQTT Architecture',
    descTr: 'Bulut sunucusunda oluşan siparişin, dükkandaki bilgisayara veya akıllı yazıcıya MQTT ile sıfır gecikmeyle iletilmesi ve basılması.',
    descEn: 'Architecting zero-latency remote print infrastructure using lightweight MQTT pub/sub messaging and signed secure Webhooks.',
    trBody: `
Sipariş geldiğinde yazıcının saniyeler içinde fişi çıkarması için istemcinin sürekli sunucuyu sorgulaması (HTTP polling) yerine çift yönlü anlık iletim protokolleri (MQTT / WebSockets) kullanılır.
`,
    enBody: `
Eliminating HTTP polling in remote order printing requires persistent bidirectional pub/sub architectures powered by MQTT and secure webhooks.
`
  },
  {
    id: 20,
    slugTr: 'mixed-content-guvenligi-ve-https-localhost-engeli',
    slugEn: 'mixed-content-security-https-localhost-block-fix',
    pattern: 'mixed-content-guvenligi',
    titleTr: 'Mixed Content Güvenliği ve HTTPS-Localhost Engeli Çözümü',
    titleEn: 'Mixed Content Security & HTTPS-to-Localhost Connectivity Fix',
    descTr: 'HTTPS web sitesinden kullanıcının yerel ağındaki güvensiz HTTP/ws yazıcı IP sine bağlanırken tarayıcıların uyguladığı Mixed Content engellerini aşma yolları.',
    descEn: 'Resolve browser Mixed Content blocking when modern HTTPS applications attempt to interface with insecure HTTP/WS local network printers.',
    trBody: `
Modern tarayıcılar güvenlik gereği HTTPS ile açılmış bir web sitesinin yerel ağdaki \`http://\` veya \`ws://\` adreslerine bağlanmasını "Mixed Content" (Karma İçerik) kuralıyla engeller.
`,
    enBody: `
Modern browser security models categorically prohibit HTTPS origins from making plaintext HTTP or WS requests to private LAN or localhost endpoints.
`
  },
  {
    id: 21,
    slugTr: 'offline-kuyruklama-ve-ag-kesintisi-dayanikliligi',
    slugEn: 'offline-print-queueing-network-fault-tolerance',
    pattern: 'offline-kuyruklama',
    titleTr: 'Offline Kuyruklama ve Ağ Kesintisi Dayanıklılığı Mimarisi',
    titleEn: 'Offline Print Queueing & Network Fault-Tolerance Architecture',
    descTr: 'İnternet veya Wi-Fi koptuğunda satışın durmaması için fişlerin tarayıcı IndexedDB veya yerel belleğe alınması ve otomatik ardışık basım mekanizması.',
    descEn: 'Build resilient offline print queue engines with client-side IndexedDB persistence, idempotent job IDs, and automatic network reconnection flushes.',
    trBody: `
Perakende kasasında veya restoranda internet bağlantısının kopması ticareti durduramaz. Sağlam bir yazdırma motoru, fişleri yerel IndexedDB kuyruğuna alıp bağlantı geldiğinde sırayla basmalıdır.
`,
    enBody: `
A mission-critical POS system must never drop a print job due to transient Wi-Fi drops or broadband ISP outages.
`
  },
  {
    id: 22,
    slugTr: 'zincir-magazalar-cok-subeli-merkezi-baski',
    slugEn: 'multi-branch-centralized-print-management-retail',
    pattern: 'zincir-magazalar',
    titleTr: 'Zincir Mağazalar İçin Çok Şubeli Merkezi Baskı Yönetimi',
    titleEn: 'Centralized Multi-Branch Print Fleet Management for Retail',
    descTr: 'Yüzlerce şubesi olan markalarda tüm şube yazıcılarının bulut panelden online/offline durumunun izlenmesi ve merkezi şablon güncellemesi.',
    descEn: 'Scale thermal printer fleets across hundreds of franchise locations. Real-time telemetry, centralized template dispatch, and remote firmware monitoring.',
    trBody: `
Franchise ve zincir mağazalarda tüm şubelerin fatura ve fiş şablonlarının merkezden tek tıkla güncellenebilmesi operasyonel maliyeti minimuma indirir.
`,
    enBody: `
Enterprise multi-location retail chains demand centralized visibility over hardware health, ink/paper status, and unified template deployments.
`
  },
  {
    id: 23,
    slugTr: 'iki-yonlu-donanim-telemetrisi-status-uyarilari',
    slugEn: 'bi-directional-hardware-telemetry-status-alerts',
    pattern: 'iki-yonlu-donanim-telemetrisi',
    titleTr: 'İki Yönlü Donanım Telemetrisi (Bi-Directional Status) Rehberi',
    titleEn: 'Bi-Directional Hardware Telemetry & Real-Time Alert Architecture',
    descTr: 'Yazıcıdan geri bildirim alma: Kağıt bitti (Paper Out), kapak açık (Cover Open), kafa aşırı ısındı ve kağıt azaldı gerçek zamanlı uyarıları.',
    descEn: 'Listen to hardware interrupts and status registers in thermal printers: Paper Out, Cover Open, Head Overheat, and Low Paper alerts in real time.',
    trBody: `
Yazdırma komutu göndermek kadar, yazıcının durumunu gerçek zamanlı okuyabilmek de önemlidir. ESC/POS \`DLE EOT n\` komutları donanım arızalarını anında bildirir.
`,
    enBody: `
Enterprise POS reliability requires asynchronous duplex communication to query thermal printhead temperature, cutter status, and paper reservoir sensors.
`
  },
  {
    id: 24,
    slugTr: 'bulut-yazdirma-rest-api-ve-hmac-guvenligi',
    slugEn: 'cloud-print-rest-api-hmac-security-standards',
    pattern: 'bulut-yazdirma-rest-api',
    titleTr: 'Bulut Yazdırma REST API ve HMAC Güvenlik Mimarisi Standartları',
    titleEn: 'Cloud Print REST API & HMAC Security Architecture Standards',
    descTr: 'Üçüncü parti yazılımların tek bir POST isteğiyle yazıcıdan fiş çıkarmasını sağlayan REST API standartları ve HMAC imza güvenliği.',
    descEn: 'Architecting developer-first Cloud Print REST APIs. Secure payload delivery with HMAC-SHA256 signatures, replay attack prevention, and rate limiting.',
    trBody: `
Bulut tabanlı bir yazdırma SaaS altyapısı, harici geliştiricilere güvenli, hızlı ve öngörülebilir bir REST API sunmalıdır.
`,
    enBody: `
A production-grade Cloud Print REST API must enforce high-entropy payload signatures (HMAC-SHA256) to guarantee message integrity across public internet relays.
`
  },
  {
    id: 26,
    slugTr: 'shopify-ve-bulut-eticaret-fisi-entegrasyonu',
    slugEn: 'shopify-cloud-receipt-packing-slip-integration',
    pattern: 'shopify-ve-bulut-eticaret',
    titleTr: 'Shopify ve Bulut E-Ticaret Sipariş Fişi Entegrasyon Rehberi',
    titleEn: 'Shopify Cloud Order Receipt & Packing Slip Integration Guide',
    descTr: 'Shopify Order Webhook altyapısıyla fiziksel mağaza ve depolara anında sipariş fişi akışı ve paketleme kontrol listesi otomasyonu.',
    descEn: 'Streamline Shopify order fulfillment with automated thermal receipt and packing slip dispatch via Shopify Admin Webhooks and Printzen.',
    trBody: `
Shopify mağazanıza düşen her siparişin depoda otomatik olarak 100x150 mm sevk etiketine veya faturaya dönüşmesi e-ticaret süreçlerini hızlandırır.
`,
    enBody: `
Automating Shopify physical store and fulfillment center thermal output eliminates manual label generation bottlenecks.
`
  },
  {
    id: 28,
    slugTr: 'yemek-siparis-platformlari-entegrasyonu-adisyon',
    slugEn: 'online-food-delivery-pos-printer-integration',
    pattern: 'yemek-siparis-platformlari',
    titleTr: 'Yemek Sipariş Platformları Entegrasyonu: Yemeksepeti, Getir, Trendyol Yemek',
    titleEn: 'Online Food Delivery Integration: Aggregate Multi-Platform Orders',
    descTr: 'Yemek platformlarının bildirimlerini tek bir merkezde toplayıp tek bir 80 mm termal mutfak yazıcısına standart adisyon formatında dökme.',
    descEn: 'Consolidate multiple food delivery aggregators onto a single 80mm thermal receipt printer with unified kitchen ticket typography.',
    trBody: `
Restoranların en büyük çilesi, her yemek siparişi platformu için ayrı bir tablet ve ayrı bir yazıcı bulundurma zorunluluğudur.
`,
    enBody: `
Hospitality kitchens waste vital counter space managing individual tablets and proprietary printers for each third-party delivery marketplace.
`
  },
  {
    id: 29,
    slugTr: 'gib-earsiv-fatura-ve-bilgi-fisi-termal-formatlama',
    slugEn: 'electronic-invoice-tax-receipt-thermal-formatting',
    pattern: 'gib-earsiv-fatura',
    titleTr: 'GİB E-Arşiv Fatura ve Bilgi Fişi Termal Formatlama Kılavuzu',
    titleEn: 'Electronic Fiscal Invoice & Tax Receipt Thermal Formatting Guide',
    descTr: 'Gelir İdaresi Başkanlığı (GİB) mevzuatına uygun 58 mm ve 80 mm rulo kağıt üzerinde e-arşiv fatura bilgi fişi tasarımı ve zorunlu alanlar.',
    descEn: 'Format legally compliant electronic tax receipts and fiscal information slips on 58mm/80mm thermal rolls with dynamic QR verification.',
    trBody: `
Türkiye'de e-Arşiv fatura mükellefi işletmelerin müşteriye teslim ettiği bilgi fişlerinde VKN, KDV dökümü, tarih, saat ve GİB doğrulama karekodu zorunludur.
`,
    enBody: `
Fiscal regulatory mandates across international jurisdictions require strict receipt layout compliance, tax breakdown tables, and dynamic cryptographic QR codes.
`
  },
  {
    id: 30,
    slugTr: 'e-irsaliye-koli-sevk-ve-gs1-128-barkod-basimi',
    slugEn: 'packing-slips-dispatch-notes-gs1-128-barcodes',
    pattern: 'e-irsaliye-koli-sevk',
    titleTr: 'E-İrsaliye, Koli İçi Sevk ve GS1-128 Barkod Basımı Kılavuzu',
    titleEn: 'Packing Slips, Dispatch Notes & GS1-128 Barcodes Guide',
    descTr: 'Toptan ve B2B sevkiyatlarda koli dışı etiketleri, SSCC (Seri Sevkiyat Konteyner Kodu) barkodları ve zincir market teslimat etiketleri.',
    descEn: 'Design enterprise B2B dispatch documentation, outer carton logistics labels, and GS1-128 SSCC shipping container codes.',
    trBody: `
B2B lojistik ve zincir market sevkiyatlarında koli üzerindeki GS1-128 (UCC/EAN-128) ve SSCC barkod standartları hatasız basılmalıdır.
`,
    enBody: `
Logistics carton labeling requires strict compliance with GS1 application identifiers (AI) and standardized SSCC barcode dimensioning.
`
  },
  {
    id: 31,
    slugTr: 'kargo-tasiyici-api-ve-pdf-etiket-donusturme',
    slugEn: 'courier-carrier-apis-pdf-thermal-conversion',
    pattern: 'kargo-tasiyici-api',
    titleTr: 'Kargo Taşıyıcı API Formatları ve PDF Dönüştürme Mimarisi',
    titleEn: 'Courier Carrier APIs & Automated PDF to Thermal Conversion',
    descTr: 'Kargo firmalarının API lerinden dönen ZPL ve PDF etiket verilerini ölçeklendirerek termal yazıcıya otomatik gönderme.',
    descEn: 'Integrate carrier webhooks and REST endpoints. Automatically transform inbound carrier shipping label PDFs into direct thermal raster streams.',
    trBody: `
Lojistik taşıyıcı API'lerinden dönen etiket verileri genellikle karmaşık PDF veya ZPL formatlarındadır.
`,
    enBody: `
Carrier integration requires ingesting varied API payloads (Base64 PDF, ZPL, PNG) and converting them into uniform thermal printhead instructions.
`
  },
  {
    id: 32,
    slugTr: 'musteri-iade-ve-depo-mal-kabul-barkodlari',
    slugEn: 'customer-returns-warehouse-receiving-barcodes',
    pattern: 'musteri-iade-ve-depo',
    titleTr: 'Müşteri İade ve Depo Mal Kabul Barkodları Otomasyonu',
    titleEn: 'Customer Returns & Warehouse Receiving Barcode Workflows',
    descTr: 'E-ticaret iade süreçlerinde müşteriye gönderilen dinamik QR kodlar ve depoda ürün kabul anında tek tuşla basılan kontrol barkodları.',
    descEn: 'Streamline reverse logistics with automated RMA barcode generation, return shipping slips, and warehouse intake scan verification.',
    trBody: `
Tersine lojistik (iade yönetimi) operasyonlarında ürünün depoya giriş anında barkodlanması kayıp kaçak oranlarını düşürür.
`,
    enBody: `
Automating reverse logistics intake requires dynamic RMA barcode tracking labels generated instantaneously at warehouse loading docks.
`
  },
  {
    id: 34,
    slugTr: 'perakende-hizli-satis-ve-market-kasa-sistemleri',
    slugEn: 'fast-retail-pos-high-volume-cashier-systems',
    pattern: 'perakende-hizli-satis',
    titleTr: 'Perakende Hızlı Satış (Fast-Retail) ve Market Kasa Sistemleri',
    titleEn: 'Fast-Retail Point of Sale & High-Volume Cashier Systems',
    descTr: 'Yüksek müşteri sirkülasyonunda 1 saniyenin altında 80 mm fiş kesme, barkodlu terazi çıktısı entegrasyonu ve promosyon kuponu basımı.',
    descEn: 'Architect ultra-fast POS receipt workflows for high-volume retail checkouts. Sub-second auto-cutting and integrated scale barcode parsing.',
    trBody: `
Market ve perakende kasalarında her saniye kritiktir. 80 mm termal yazıcıların saniyede 250-300 mm hızla fiş kesmesi kasa kuyruklarını önler.
`,
    enBody: `
High-density supermarket checkouts require print pipelines capable of rendering itemized receipts and firing guillotine cutters in under 800 milliseconds.
`
  },
  {
    id: 35,
    slugTr: 'depo-toplama-pick-pack-ve-mobil-koridor-etiketleme',
    slugEn: 'warehouse-pick-pack-mobile-aisle-labeling',
    pattern: 'depo-toplama-pick-pack',
    titleTr: 'Depo Toplama (Pick & Pack) ve Mobil Koridor Etiketleme',
    titleEn: 'Warehouse Pick & Pack and Mobile Aisle Labeling Architecture',
    descTr: 'El terminali veya Android telefonla eşleşen kemer tipi mobil yazıcılarla depo rafları arasında gezerek ürün bazında barkod basımı.',
    descEn: 'Equip warehouse pickers with wearable mobile thermal label printers for on-demand bin labeling, cross-docking, and pack verification.',
    trBody: `
Depo personeli ürün toplarken raftan aldığı her ürüne anında mobil yazıcıdan etiket basarak sevkiyat hatalarını sıfıra indirir.
`,
    enBody: `
Deploying belt-mounted portable thermal label printers directly onto picking carts eliminates unnecessary trips to static packing desks.
`
  },
  {
    id: 36,
    slugTr: 'otopark-vale-arac-yikama-barkod-otomasyonu',
    slugEn: 'parking-valet-car-wash-barcode-ticketing',
    pattern: 'otopark-vale-arac-yikama',
    titleTr: 'Otopark, Vale ve Araç Yıkama Barkod Otomasyonu Rehberi',
    titleEn: 'Parking, Valet & Car Wash Barcode Ticketing Automation',
    descTr: 'Araç giriş anında plaka, tarih ve barkod içeren giriş bileti basımı; çıkışta barkod okutularak süre ve ücret tahsilat fişi oluşturma.',
    descEn: 'Design automated thermal ticketing workflows for parking garages, valet kiosks, and car washes with dynamic entry barcodes.',
    trBody: `
Otopark giriş kiosklarında araç plakasıyla eşleştirilen termal barkod biletleri, çıkışta tek saniyede ücret hesaplamasını sağlar.
`,
    enBody: `
Parking and valet operations demand instant, weather-resilient thermal ticket generation featuring high-contrast optical 1D/2D barcodes.
`
  },
  {
    id: 37,
    slugTr: 'siramatik-ve-numarator-kiosk-biletleme-sistemleri',
    slugEn: 'queue-management-number-dispensing-kiosks',
    pattern: 'siramatik-ve-numarator',
    titleTr: 'Sıramatik ve Numaratör Kiosk Biletleme Sistemleri Kılavuzu',
    titleEn: 'Queue Management & Self-Service Number Dispensing Kiosks',
    descTr: 'Banka, noter ve kamu kurumlarında kiosk üzerinden sıra numarası, bekleyen kişi sayısı ve tahmini süre içeren bilet baskısı.',
    descEn: 'Build resilient ticketing pipelines for self-service queue kiosks, public service counters, and waiting room token dispensers.',
    trBody: `
Sıramatik sistemlerinde kullanılan gömülü (kiosk) termal yazıcılar, otomatik kağıt sunucu (presenter) ve geri çekme mekanizmalarıyla çalışır.
`,
    enBody: `
Kiosk queue management requires specialized embedded thermal mechanisms equipped with paper presenter loops and auto-retract jam prevention.
`
  },
  {
    id: 38,
    slugTr: 'kuru-temizleme-terzi-ve-servis-emanet-fisleri',
    slugEn: 'dry-cleaning-repair-shop-service-intake-tickets',
    pattern: 'kuru-temizleme-terzi',
    titleTr: 'Kuru Temizleme, Terzi ve Teknik Servis Emanet Fişleri Rehberi',
    titleEn: 'Dry Cleaning, Tailoring & Repair Shop Intake Tickets Guide',
    descTr: 'Yıkamaya, kimyasala ve neme dayanıklı özel kumaş/yırtılmaz etiketlere parça takip barkodu ve müşteri kabul formlarının basımı.',
    descEn: 'Print durable, chemical-resistant tracking tags and customer claim receipts for dry cleaners, tailors, and repair workshops.',
    trBody: `
Kuru temizlemede kıyafetlerin üzerine zımbalanan termal etiketlerin 90 derece sıcak su ve kimyasal deterjanlara dayanıklı sentetik kağıt olması gerekir.
`,
    enBody: `
Service intake in dry cleaning and electronics repair relies on waterproof, thermal-stable synthetic tag stock to track customer property through washing cycles.
`
  },
  {
    id: 39,
    slugTr: 'saglik-klinik-veteriner-ve-numune-etiketleme',
    slugEn: 'healthcare-clinic-veterinary-specimen-labeling',
    pattern: 'saglik-klinik-veteriner',
    titleTr: 'Sağlık, Klinik, Veteriner ve Laboratuvar Numune Etiketleme',
    titleEn: 'Healthcare, Clinic, Veterinary & Laboratory Specimen Labels',
    descTr: 'Kan tüpü, serum ve numunelere yapıştırılan 2D DataMatrix barkodlar, hasta takip bileklikleri ve sterilizasyon etiketleri.',
    descEn: 'Ensure zero-error clinical specimen tracking with high-density DataMatrix labels, patient wristbands, and cryogenic vial tagging.',
    trBody: `
Sağlık kuruluşlarında kan tüpü ve laboratuvar numuneleri için basılan 2D DataMatrix etiketler hasta güvenliğinin temelidir.
`,
    enBody: `
Clinical specimen collection requires 300 DPI thermal precision to render ultra-dense DataMatrix codes onto miniature test tube diameters.
`
  },
  {
    id: 40,
    slugTr: 'etkinlik-fuar-kongre-ve-yaka-karti-baskisi',
    slugEn: 'event-conference-badge-ticket-printing',
    pattern: 'etkinlik-fuar-kongre',
    titleTr: 'Etkinlik, Fuar, Kongre ve Yaka Kartı Baskısı Kılavuzu',
    titleEn: 'Event, Expo, Conference Badge & Ticket Fast Printing Guide',
    descTr: 'Kayıt bankolarında katılımcı geldiğinde 2 saniyede isim, unvan ve QR kodlu yaka kartı / giriş bileti termal baskısı.',
    descEn: 'Deploy fast onsite thermal registration desks to print attendee badges, credentials, and QR wristbands in under 2 seconds.',
    trBody: `
Fuar ve kongre girişlerinde binlerce katılımcının kapıda beklemeden 2 saniyede QR kodlu yaka kartını alması için direkt termal karton baskı kullanılır.
`,
    enBody: `
Conference check-in desks rely on high-speed direct thermal badge printers to produce personalized attendee credentials instantly upon badge scanning.
`
  },
  {
    id: 42,
    slugTr: 'termal-baski-kalitesi-silik-yazma-ve-kararma-cozumu',
    slugEn: 'faded-thermal-print-quality-darkness-fix',
    pattern: 'termal-baski-kalitesi',
    titleTr: 'Termal Baskı Kalitesi: Silik Yazma ve Kararma Problemleri Çözümü',
    titleEn: 'Faded Thermal Print Quality: Darkness, Heat & Contrast Fix',
    descTr: 'Baskının açık gri çıkması, barkodların optik okuyucular tarafından taranamaması, yazıcı koyuluk ayarı ve kafa voltajı optimizasyonu.',
    descEn: 'Diagnose faint receipts, unreadable barcodes, and blackened thermal rolls. Adjust print darkness, strobe pulse times, and platen pressure.',
    trBody: `
Termal baskının soluk veya silik çıkmasının en yaygın nedenleri; yetersiz voltaj, yanlış kağıt tipi seçimi veya yazıcı koyuluk (Darkness / Density) ayarının düşük olmasıdır.
`,
    enBody: `
Faded thermal imaging degrades barcode scanning read rates. Resolving poor optical density requires calibrating darkness registers and thermal strobe pulse duration.
`
  },
  {
    id: 43,
    slugTr: 'kagit-sikismasi-ve-kesici-bicak-kilitlenmesi-cozumu',
    slugEn: 'paper-jam-clearing-auto-cutter-lock-fix',
    pattern: 'kagit-sikismasi-ve-kesici',
    titleTr: 'Kağıt Sıkışması ve Otomatik Kesici Bıçak Kilitlenmesi Çözümü',
    titleEn: 'Paper Jam Clearing & Auto-Cutter Guillotine Lock Recovery',
    descTr: 'Fiş kağıdının bıçağa dolanması, kısmi kesim vs tam kesim ayarları, giyotin bıçağın manuel kurtarma çarkı ile açılması.',
    descEn: 'Safely recover from thermal receipt paper jams and locked guillotine cutter blades using manual thumbwheels and firmware reset sequences.',
    trBody: `
Termal fiş yazıcılarında otomatik kesici bıçağın (auto-cutter) kağıt üzerinde kilitlenmesi durumunda zorla kapağı açmaya çalışmak dişlileri kırabilir.
`,
    enBody: `
Guillotine auto-cutter jams can permanently strip stepper motor gears if operators force the printer cover open without releasing the manual thumbwheel.
`
  },
  {
    id: 44,
    slugTr: 'etiket-sensor-kalibrasyonu-bos-etiket-atlama-cozumu',
    slugEn: 'label-sensor-calibration-blank-label-skipping',
    pattern: 'etiket-sensor-kalibrasyonu',
    titleTr: 'Etiket Sensör Kalibrasyonu ve Boş Etiket Atlama Hatası Çözümü',
    titleEn: 'Label Sensor Calibration & Blank Label Skipping Troubleshooting',
    descTr: 'Yazıcının her baskıdan sonra fazladan 1 veya 2 boş etiket fırlatması; Gap ve Black Mark optik sensör kalibrasyonu.',
    descEn: 'Fix frustrating blank label skipping on thermal barcode printers. Calibrate Transmissive (Gap) and Reflective (Black Mark) optical media sensors.',
    trBody: `
Barkod yazıcınız her baskıdan sonra fazladan boş etiket fırlatıyorsa, yazıcı iki etiket arasındaki boşluğu (gap) optik olarak algılayamıyor demektir.
`,
    enBody: `
When thermal barcode printers continuously feed blank labels after printing, the transmissive or reflective optical media sensors require voltage recalibration.
`
  },
  {
    id: 45,
    slugTr: 'termal-kafa-tph-temizligi-ve-beyaz-cizgi-hatasi',
    slugEn: 'thermal-printhead-cleaning-white-lines-lifespan',
    pattern: 'termal-kafa-tph-temizligi',
    titleTr: 'Termal Kafa (TPH) Ömrü, Temizlik Protokolü ve Beyaz Çizgi Hatası',
    titleEn: 'Thermal Printhead (TPH) Maintenance: White Lines & Lifespan',
    descTr: 'Etiket tozu ve yapışkan kalıntılarının kafa üzerinde oluşturduğu beyaz çizgiler; saf izopropil alkol ile bakım ve kafa yanmasını önleme.',
    descEn: 'Prevent permanent thermal element burn-out and eliminate vertical white print streaks using 99% pure isopropyl alcohol maintenance routines.',
    trBody: `
Çıktılarda dikey boyunca uzanan beyaz çizgiler, termal baskı kafasının (TPH) o noktasındaki mikro ısıtıcı rezistansların toz veya yanma nedeniyle çalışmadığını gösterir.
`,
    enBody: `
Vertical white voids running down printed receipts and barcode labels signal dead micro-resistors on the thermal printhead assembly (TPH).
`
  },
  {
    id: 46,
    slugTr: 'termal-rulo-kagit-standartlari-bpa-free-eko-lamine',
    slugEn: 'thermal-paper-standards-bpa-free-eco-top-coated',
    pattern: 'termal-rulo-kagit-standartlari',
    titleTr: 'Termal Rulo Kağıt Standartları: BPA Free, Eko vs Lamine Kağıt',
    titleEn: 'Thermal Paper Standards: BPA-Free, Eco vs Top-Coated Rolls',
    descTr: 'Fiş kağıtlarında sağlık standartları (Bisfenol A içermeyen rulolar), sıcağa ve ışığa maruz kaldığında kararmayan lamine termal kağıt seçimi.',
    descEn: 'Select the correct thermal paper roll stock for health compliance (BPA-free) and archival durability (Top-coated vs Eco-thermal).',
    trBody: `
Termal fiş kağıtları kimyasal kaplamaları sayesinde mürekkepsiz baskı sağlar. Ancak ucuz kağıtlarda bulunan BPA (Bisfenol A) maddesi insan sağlığı için zararlıdır.
`,
    enBody: `
Direct thermal paper utilizes leuco-dye chemical coatings to produce black imaging without ink ribbons. Modern regulatory frameworks mandate BPA-free stock.
`
  },
  {
    id: 48,
    slugTr: 'react-nextjs-vue-icin-usethermalprinter-kancasi',
    slugEn: 'react-nextjs-vue-use-thermal-printer-hook',
    pattern: 'react-nextjs-vue-icin',
    titleTr: 'React, Next.js ve Vue.js İçin useThermalPrinter Kancası (Hook)',
    titleEn: 'useThermalPrinter Reactive Hooks for React, Next.js & Vue.js',
    descTr: 'Modern SPA ve SSR web uygulamalarında yazıcı bağlantı durumunu, pil seviyesini ve baskı kuyruğunu yöneten reaktif kancalar.',
    descEn: 'Manage thermal printer connection states, battery telemetry, and queue states cleanly in modern web frameworks using the useThermalPrinter hook.',
    trBody: `
React, Next.js ve Vue tabanlı modern web POS arayüzlerinde yazıcı durumunu reaktif olarak yönetmek için \`useThermalPrinter\` kancası kullanılır.

\`\`\`tsx
import { useThermalPrinter } from '@printzen/react';

export function CheckoutButton({ receiptData }) {
  const { isConnected, printReceipt, connect, status } = useThermalPrinter({
    transport: 'bluetooth'
  });

  return (
    <button onClick={() => isConnected ? printReceipt(receiptData) : connect()}>
      {isConnected ? 'Hemen Yazdır' : 'Yazıcıya Bağlan'}
    </button>
  );
}
\`\`\`
`,
    enBody: `
Integrating thermal printer telemetry and dispatch pipelines into modern component-driven frontends requires robust reactive hook abstractions.
`
  },
  {
    id: 49,
    slugTr: 'react-native-ve-flutter-mobil-termal-baski',
    slugEn: 'react-native-flutter-mobile-thermal-printing',
    pattern: 'react-native-ve-flutter',
    titleTr: 'React Native ve Flutter ile Mobil Termal Baskı Kütüphaneleri',
    titleEn: 'Cross-Platform Mobile Thermal Printing: React Native & Flutter',
    descTr: 'Android ve iOS mobil uygulamalarda tek kod tabanıyla hem Bluetooth hem Wi-Fi termal yazıcılara doğrudan ESC/POS ve ZPL gönderme.',
    descEn: 'Unify mobile receipt and barcode label printing across iOS and Android using React Native and Flutter native peripheral bridges.',
    trBody: `
Saha satış ve kurye mobil uygulamalarında tek kod tabanıyla hem Android hem de iOS üzerinde Bluetooth ve Wi-Fi termal yazıcılara sorunsuz baskı gönderebilirsiniz.
`,
    enBody: `
Developing courier and field sales apps requires multiplatform Bluetooth and network printer support across iOS and Android from a unified codebase.
`
  },
  {
    id: 50,
    slugTr: 'termal-fis-sablonlama-ve-1-bit-dithering-motoru',
    slugEn: 'thermal-receipt-template-design-1-bit-dithering',
    pattern: 'termal-fis-sablonlama',
    titleTr: 'Termal Fiş Şablonlama ve 1-Bit Floyd-Steinberg Dithering Motoru',
    titleEn: 'Thermal Receipt Template Design & 1-Bit Floyd-Steinberg Dithering',
    descTr: 'HTML ve CSS ile tasarlanan karmaşık fatura şablonlarını termal kafanın basabileceği monokrom 1-bit siyah-beyaz piksel matrisine dönüştürme.',
    descEn: 'Render complex HTML/CSS layouts into high-contrast 1-bit monochrome bitmap buffers using Floyd-Steinberg error-diffusion dithering algorithms.',
    trBody: `
Termal yazıcılar gri tonlama veya renk basamaz; her piksel ya tamamen siyahtır ya da beyazdır. Fotoğrafları ve logoları kaliteli basmak için Floyd-Steinberg dithering algoritması kullanılır.
`,
    enBody: `
Thermal printheads are binary devices: each micro-heating element is either fully energized (black) or deactivated (white). Rendering photography demands error diffusion dithering.
`
  }
];

let trCount = 0;
let enCount = 0;

for (const t of REMAINING_TOPICS) {
  const trFile = path.join(TR_DIR, `${t.slugTr}.md`);
  const enFile = path.join(EN_DIR, `${t.slugEn}.md`);

  const trLinks = getPseoLinks(t.pattern, 'tr');
  const enLinks = getPseoLinks(t.pattern, 'en');

  const trFrontmatter = `---
title: ${JSON.stringify(t.titleTr)}
description: ${JSON.stringify(t.descTr)}
printerClass: "desktop"
brand: "Generic"
publishDate: "2026-09-11"
translationKey: ${JSON.stringify(t.slugTr)}
topicCluster: "hub-${t.id}"
---

`;

  const enFrontmatter = `---
title: ${JSON.stringify(t.titleEn)}
description: ${JSON.stringify(t.descEn)}
printerClass: "desktop"
brand: "Generic"
publishDate: "2026-09-11"
translationKey: ${JSON.stringify(t.slugTr)}
topicCluster: "hub-${t.id}"
---

`;

  if (!fs.existsSync(trFile)) {
    fs.writeFileSync(trFile, trFrontmatter + t.trBody.trim() + trLinks, 'utf8');
    trCount++;
  }

  if (!fs.existsSync(enFile)) {
    fs.writeFileSync(enFile, enFrontmatter + t.enBody.trim() + enLinks, 'utf8');
    enCount++;
  }
}

console.log(`\n🎉 TAMAMLANDI: ${trCount} yeni TR Hub + ${enCount} yeni EN Hub dosyası oluşturuldu!`);
console.log(`Toplam TR Rehber Dosyası: ${fs.readdirSync(TR_DIR).filter(f => f.endsWith('.md')).length}`);
console.log(`Toplam EN Rehber Dosyası: ${fs.readdirSync(EN_DIR).filter(f => f.endsWith('.md')).length}`);

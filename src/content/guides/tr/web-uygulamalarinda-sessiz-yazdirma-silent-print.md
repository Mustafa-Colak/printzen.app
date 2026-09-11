---
title: "Web Uygulamalarında Sessiz Yazdırma (Silent Print) Rehberi: Ctrl+P Diyaloğunu Atlayarak Otomatik Baskı"
description: "Web POS ve bulut ERP sistemlerinde tarayıcı yazdırma penceresini (Ctrl+P) tamamen devre dışı bırakarak termal yazıcıdan tek tıkla veya otomatik sessiz fiş çıkarma mimarisi."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: silent-printing-web-applications-kiosk-mode
---

Bir süpermarkette kasada beklerken kasiyerin her satıştan sonra ekranda beliren "Yazdır" penceresine tıklayıp `Enter` tuşuna bastığını hayal edin. Bu durum, saniyelerin kritik olduğu perakende, kafe ve depo operasyonlarında kabul edilemez bir zaman ve iş gücü kaybıdır.

Geleneksel tarayıcı JavaScript'i (`window.print()`), güvenlik ve kullanıcı gizliliği gerekçesiyle **her zaman işletim sisteminin veya tarayıcının yazdırma önizleme diyaloğunu açar**. Tarayıcı sandbox yapısı, web sayfasının kullanıcının açık onayı olmadan fiziksel yazıcı motorunu tetiklemesine izin vermez.

Peki modern bulut POS yazılımları, e-ticaret sevkiyat masaları ve mutfak sipariş ekranları **tek bir tıkla veya sipariş düştüğü anda sıfır kullanıcı müdahalesiyle** nasıl sessiz fiş basar?

Bu kapsamlı mühendislik kılavuzunda; Google Chrome Kiosk Printing bayraklarından yerel WebSocket Tray Agent mimarisine, CUPS raw spooler yöntemlerinden bulut yazdırma servislerine kadar tüm çözümleri inceliyoruz.

---

## 1. Yöntem 1: Google Chrome Kiosk Printing Modu (`--kiosk-printing`)

Masaüstü bilgisayarlarda (Windows, macOS, Linux) ve POS terminallerinde kullanılan en pratik ve maliyetsiz yöntem, Chromium tabanlı tarayıcıları özel bir başlatma parametresiyle çalıştırmaktır.

Google Chrome'a `--kiosk-printing` parametresi verildiğinde, web sayfasından tetiklenen `window.print()` fonksiyonu sistem yazdırma diyaloğunu ekrana getirmez; işletim sisteminde **varsayılan (default) olarak atanmış yazıcıya ve varsayılan kağıt boyutuna doğrudan baskı emri gönderir**.

### 1.1. Windows Ortamında Kurulum
1. Masaüstündeki Google Chrome kısayoluna sağ tıklayıp **Özellikler (Properties)** seçeneğini açın.
2. **Hedef (Target)** satırının en sonuna bir boşluk bırakarak şu parametreyi ekleyin:
   ```cmd
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing https://pos.sirketiniz.com
   ```
3. Eğer terminalin tam ekran modunda açılmasını ve personelin tarayıcı adres çubuğuna müdahale etmesini engellemek isterseniz `--kiosk` parametresini de ekleyin:
   ```cmd
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing https://pos.sirketiniz.com
   ```

### 1.2. macOS Ortamında Terminalden Başlatma
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk-printing \
  --args "https://pos.sirketiniz.com"
```

### 1.3. Linux (Ubuntu / Debian / Raspberry Pi) Otomasyonu
```bash
google-chrome --noerrdialogs --disable-infobars --kiosk-printing https://pos.sirketiniz.com &
```

> ⚠️ **Kiosk Printing Kısıtlamaları:**
> - Birden fazla yazıcı kullanan işletmelerde (örneğin hem mutfak adisyon yazıcısı hem kasa fiş yazıcısı) yetersiz kalır; çünkü Chrome her zaman sadece *tek bir varsayılan yazıcıya* basar.
> - Çıktılar grafik tabanlı PDF/HTML rasterize motorundan geçtiği için metinler ham ESC/POS kadar jilet gibi keskin olmayabilir ve kağıt kesme mekanizması her yazıcı sürücüsünde düzgün tetiklenmeyebilir.

---

## 2. Yöntem 2: Yerel Arka Plan Servisi (Localhost WebSocket Agent)

Kurumsal ERP, çok şubeli restoran ve e-ticaret depolama yazılımlarının tercih ettiği modern endüstri standardı **Local Agent (Yerel Ajan)** mimarisidir.

Bu modelde, istemci bilgisayarın arka planında (System Tray / Windows Service) çok hafif bir yerel servis (Node.js, Go veya C# ile yazılmış) çalışır. Bu servis `localhost:18570` gibi bir port üzerinden WebSocket veya yerel HTTP sunucusu açar:

```
[ Web POS (Bulut / Tarayıcı) ]
           │
           │ (WebSocket / wss://localhost:18570)
           ▼
[ Printzen Local Agent (Arka Plan Servisi) ]
     ├───► Yazıcı 1: Kasa Fişi (USB ESC/POS)
     ├───► Yazıcı 2: Mutfak Adisyonu (Ethernet IP: 192.168.1.200)
     └───► Yazıcı 3: Kargo Barkodu (Zebra ZPL USB)
```

### 2.1. Web Uygulamasından Gönderilen JavaScript İsteği
```javascript
class SilentPrinterClient {
  constructor(port = 18570) {
    this.ws = new WebSocket(`ws://localhost:${port}`);
    this.ws.onopen = () => console.log('Local Print Agent bağlandı.');
    this.ws.onerror = (err) => console.error('Ajan bulunamadı:', err);
  }

  printRaw(printerName, rawCommands) {
    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Yazdırma servisi aktif değil.');
    }

    const payload = {
      action: 'PRINT_RAW',
      targetPrinter: printerName, // 'Epson_TM_T20', 'Zebra_ZD220' vs.
      data: Array.from(rawCommands) // Byte array
    };

    this.ws.send(JSON.stringify(payload));
  }
}

// Kullanım:
const client = new SilentPrinterClient();
const escPosBytes = new Uint8Array([0x1B, 0x40, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x0A, 0x1D, 0x56, 66, 0]);
client.printRaw('KASA_YAZICI', escPosBytes);
```

### Bu Mimari Neden Üstündür?
1. **Sıfır İletişim Penceresi:** Kullanıcı ekranda hiçbir yazdırma diyaloğu görmez.
2. **Çoklu Yazıcı Yönlendirmesi:** Aynı web sayfasından mutfak yazıcısına adisyon, kasa yazıcısına fiş, etiket yazıcısına kargo barkodu aynı anda ve bağımsız yönlendirilebilir.
3. **Gerçek ESC/POS & ZPL Desteği:** Kağıt otomatik kesilir, para çekmecesi zınk diye açılır, barkodlar pikselleşmeden vektörel basılır.

---

## 3. Yöntem 3: Buluttan Doğrudan Yazdırma (Cloud Webhook / Polling)

Mobil tabletlerin, akıllı telefonların veya şubelerdeki izole cihazların kullanıldığı senaryolarda istemci bilgisayara yerel bir yazılım kurmak mümkün olmayabilir. Bu senaryoda **Bulut Tabanlı Yazdırma (Cloud Print)** devreye girer:

1. Web POS veya e-ticaret sitenizde (WooCommerce, Shopify vb.) yeni bir sipariş oluşur.
2. Sunucunuz yazdırma işini bir veritabanı kuyruğuna (Queue) ekler veya doğrudan IoT termal yazıcının IP adresine MQTT / Webhook ile fırlatır.
3. Mağazadaki ağa bağlı (Wi-Fi/Ethernet) termal yazıcı veya mağazadaki Printzen IoT Kutusu bulut kuyruğunu dinler ve sipariş düştüğü anda otomatik fişi basar.

Bu modelde kasiyerin veya kullanıcının tarayıcısında hiçbir sayfa açık olmasa bile (örneğin müşteri gece saat 03:00'te web sitenizden online sipariş verdiğinde) mutfaktaki fiş yazıcısı otomatik olarak çalışır ve kağıdı keser.

---

## 4. Karşılaştırma ve Seçim Tablosu

| Özellik | Chrome Kiosk Printing | Local WebSocket Agent | Bulut Tabanlı Yazdırma (Printzen) |
|---|---|---|---|
| **Diyalog Atlama (Sessiz)** | Evet (Ctrl+P yok) | Evet (Ctrl+P yok) | Evet (Tamamen Arka Planda) |
| **Çoklu Yazıcı Desteği** | Hayır (Tek varsayılan) | Evet (Sınırsız) | Evet (İstasyon Bazlı Dağıtım) |
| **ESC/POS & Çekmece Kontrolü** | Sürücüye bağımlı | Tam Donanım Kontrolü | Tam Donanım Kontrolü |
| **Mobil / Tablet Desteği** | Zayıf (Yalnızca Masaüstü) | Yerel PC Gerekir | Mükemmel (Tüm Cihazlar) |
| **Kurulum Karmaşıklığı** | Düşük (Kısayol parametresi) | Orta (Ajan kurulumu) | Sıfır İstemci Kurulumu |

---

## 5. Sıkça Sorulan Sorular (SSS)

### Normal bir web sayfasından kullanıcının haberi olmadan arkadan fiş basılabilir mi?
**Hayır, modern tarayıcıların güvenlik (Sandbox) politikaları gereği hiçbir web sitesi kullanıcının izni olmadan işletim sistemi yazıcısına doğrudan erişemez.** Bunu yapabilmek için ya tarayıcının `--kiosk-printing` bayrağıyla özel olarak başlatılması, ya Web Bluetooth/WebUSB üzerinden kullanıcı onayı alınması, ya da bilgisayarda çalışan bir yerel arka plan servisinin (Printzen Local Agent) bulunması şarttır.

### Chrome Kiosk Printing modunda yazıcı seçimi nasıl yapılır?
**`--kiosk-printing` parametresi her zaman işletim sisteminin (Windows, macOS veya Linux) "Varsayılan Yazıcı" (Default Printer) olarak belirlediği aygıtı kullanır.** Başka bir yazıcıya çıktı göndermek istiyorsanız işletim sistemi ayarlarından varsayılan yazıcıyı değiştirmeniz gerekir. Çoklu yazıcı senaryolarında Kiosk modu yerine WebSocket Agent mimarisi kullanılmalıdır.

### Kiosk Printing ile fiş basarken kenar boşlukları ve üst/alt bilgi (tarih, URL) nasıl gizlenir?
**CSS içerisine `@page { margin: 0; }` kuralı eklenerek tarayıcının varsayılan kenar boşlukları sıfırlanabilir.** Ayrıca Chrome başlatma komutuna `--disable-print-header-footer` bayrağı eklenerek sayfanın üstünde ve altında çıkan URL, sayfa numarası ve tarih bilgileri tamamen kaldırılabilir.

### Para çekmecesini açma ve kağıt kesme komutları Kiosk Printing ile çalışır mı?
**Kiosk Printing HTML çıktısını yazıcı sürücüsü üzerinden bastığı için ham ESC/POS komutlarını doğrudan yorumlayamaz.** Ancak Windows Yazıcı Özellikleri > Aygıt Ayarları (Device Settings) sekmesinden sürücü düzeyinde *"Baskı Başında Çekmeceyi Aç"* ve *"Baskı Sonunda Kağıdı Kes"* seçenekleri aktif edilerek bu işlemler sürücüye devredilebilir.

## Desteklenen Cihazlar

Bu rehberdeki adımlar, ilgili protokolü/arayüzü destekleyen aşağıdaki yazıcı modellerinin tamamı için geçerlidir:

| Marka | Model | Protokol | Arayüzler | Kağıt Genişliği |
|---|---|---|---|---|
| Bixolon | SLP-TX400 | SLCS / BPL-Z | USB, Ethernet, Seri | 104mm |
| Bixolon | SPP-R200III | ESC/POS / CPCL | Bluetooth, Wi-Fi, USB | 58mm |
| Bixolon | SPP-R310 | ESC/POS / CPCL | Bluetooth BLE, USB | 80mm |
| Bixolon | SRP-330II | ESC/POS | USB, Ethernet | 80mm |
| Bixolon | SRP-350III | ESC/POS | USB, Ethernet, Seri | 80mm |
| Bixolon | SRP-Q300 | ESC/POS | Bluetooth, Wi-Fi, USB, Ethernet | 80mm |
| Epson | TM-L90 | ESC/POS | USB, Ethernet | 80mm |
| Epson | TM-m30II | ESC/POS | Bluetooth, Wi-Fi, USB, Ethernet | 80mm / 58mm |
| Epson | TM-P20II | ESC/POS | Bluetooth 5.0, Wi-Fi | 58mm |
| Epson | TM-P80II | ESC/POS | Bluetooth, Wi-Fi | 80mm |
| Epson | TM-T20III | ESC/POS | USB, Ethernet, Seri | 80mm / 58mm |
| Epson | TM-T88VI | ESC/POS | USB, Ethernet, Bluetooth, Wi-Fi | 80mm / 58mm |
| Epson | TM-T88VII | ESC/POS | USB, Ethernet, Wi-Fi | 80mm |
| Godex | DT4x | EZPL | USB, Ethernet, Seri | 108mm |
| Godex | G500 | EZPL / GEPL / GZPL | USB, Ethernet, Seri | 108mm |
| Godex | RT700 | EZPL | USB, Ethernet | 108mm |
| Honeywell | PC42d | ZSim / ESim | USB | 104mm |
| Honeywell | PC42t | Direct Protocol / ZSim / ESim | USB, Ethernet, Seri | 104mm |
| Rongta | RP326 | ESC/POS | USB, Ethernet, Seri | 80mm |
| Rongta | RP410 | TSPL / ESC/POS | USB | 108mm |
| Rongta | RP80 | ESC/POS | USB, Ethernet | 80mm |
| Rongta | RPP02N | ESC/POS | Bluetooth, USB | 58mm |
| Seiko | MP-B30L | ESC/POS / SII SDK | Bluetooth, USB | 80mm |
| Seiko | RP-D10 | ESC/POS | USB, Ethernet, Bluetooth | 80mm |
| Star Micronics | mC-Print3 | StarPRNT | CloudPRNT, Bluetooth, Ethernet, USB | 80mm |
| Star Micronics | SM-L200 | Star Line | Bluetooth 4.0 BLE, USB | 58mm |
| Star Micronics | SM-T300i | Star Line / ESC/POS | Bluetooth (MFi), Seri | 80mm |
| Star Micronics | TSP143III | StarPRNT / ESC/POS | Ethernet, Wi-Fi, USB, Lightning | 80mm |
| Star Micronics | TSP654II | Star Line / ESC/POS | Bluetooth, Ethernet, USB | 80mm |
| Sunmi | V2 Pro | ESC/POS (Sunmi InnerPrinter) | Dahili Donanım, Bluetooth | 58mm |
| TSC | Alpha-3R | TSPL / CPCL / ESC/POS | Bluetooth, USB | 72mm (3 inç) |
| TSC | DA210 | TSPL-EZD | USB | 108mm |
| TSC | DA220 | TSPL-EZD | USB, Ethernet, Bluetooth, Wi-Fi | 108mm |
| TSC | TE200 | TSPL-EZ | USB 2.0 | 108mm |
| TSC | TTP-244 Pro | TSPL | USB, Seri | 108mm |
| Xprinter | XP-365B | TSPL / ESC/POS | USB | 80mm |
| Xprinter | XP-420B | TSPL / ESC/POS | USB, Bluetooth, Ethernet | 108mm (100x150) |
| Xprinter | XP-470B | TSPL | USB | 108mm |
| Xprinter | XP-58IIH | ESC/POS | USB, Bluetooth | 58mm |
| Xprinter | XP-N160II | ESC/POS | USB, Ethernet | 80mm |
| Xprinter | XP-P300 | ESC/POS | Bluetooth, USB | 58mm |
| Xprinter | XP-Q800 | ESC/POS | USB, Ethernet, Seri | 80mm |
| Zebra | GK420d | ZPL II / EPL2 | USB, Ethernet, Seri | 104mm |
| Zebra | GK420t | ZPL II / EPL2 | USB, Ethernet | 104mm |
| Zebra | ZD220 | ZPL II / EPL | USB | 104mm (4 inç) |
| Zebra | ZD420 | ZPL II / EPL | USB, Ethernet, Bluetooth, Wi-Fi | 104mm |
| Zebra | ZD421 | ZPL II / EPL | USB, Ethernet, Bluetooth BLE | 104mm |
| Zebra | ZQ320 Plus | CPCL / ZPL | Bluetooth BLE, Wi-Fi | 80mm (3 inç) |
| Zebra | ZQ520 | CPCL / ZPL | Bluetooth, Wi-Fi | 104mm (4 inç) |
| Zebra | ZT411 | ZPL II | Ethernet, USB, Bluetooth 4.1 | 104mm |


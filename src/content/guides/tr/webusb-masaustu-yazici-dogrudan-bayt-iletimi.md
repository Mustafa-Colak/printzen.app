---
title: "WebUSB API ile Masaüstü Termal Yazıcıya Doğrudan Bayt İletimi"
description: "WebUSB API kullanarak tarayıcıdan masaüstü USB termal yazıcıya driver kurulum gerektirmeden doğrudan ESC/POS bayt gönderme. Chrome, Edge desteği ve güvenlik modeli."
printerClass: "desktop"
brand: "Epson / Generic"
publishDate: 2026-09-11
translationKey: "webusb-masaustu-yazici-dogrudan-bayt-iletimi"
topicCluster: "hub-11"
---

WebUSB API, Chrome 61 ve sonrasında Chrome ve Edge tarayıcılarında kullanılabilen, web sayfasının USB cihazlarına **işletim sistemi sürücüsü (driver) gerektirmeden** doğrudan erişmesini sağlayan bir web standardıdır. Termal yazıcılar için bu, kurulum adımı sıfırlayan devrim niteliğinde bir değişimi temsil eder.

## WebUSB Neden Önemli?

Geleneksel tarayıcı yazdırma akışında şu sorunlar yaşanır:
- **Ctrl+P diyaloğu** açılır, kullanıcı "Yazdır" demek zorunda kalır
- İşletim sisteminin yazıcı sürücüsü kurulmuş olması gerekir
- Sessiz (silent) baskı alınamaz

WebUSB ile bu engellerin tamamı ortadan kalkar.

## WebUSB Güvenlik Modeli

WebUSB yalnızca HTTPS üzerinde çalışır. `localhost` geliştirme ortamında HTTP izin verilir. Kullanıcı her bağlantı isteğinde tarayıcı iznini onaylamalıdır (ilk bağlantı sonrası kalıcı olabilir).

```javascript
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
```

## Adım Adım WebUSB Bağlantı

```javascript
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
```

## ESC/POS Fiş Basma Örneği

```javascript
const printer = new WebUSBPrinter();
await printer.connect();

const enc = new TextEncoder();
const ESC = 0x1B, GS = 0x1D, LF = 0x0A;

const commands = [
  ESC, 0x40,           // sıfırla
  ESC, 0x61, 0x01,     // ortala
  ...enc.encode('PRINTZEN KAFE
'),
  ...enc.encode('----------------------------
'),
  ESC, 0x61, 0x00,     // sola hizala
  ...enc.encode('Cappuccino x1    45.00 TL
'),
  ESC, 0x61, 0x02,     // sağa hizala
  ESC, 0x45, 0x01,     // kalın
  ...enc.encode('TOPLAM: 45.00 TL
'),
  ESC, 0x45, 0x00,     // kalın kapat
  LF, LF, LF,          // boş satır (kağıt ilerlet)
  GS, 0x56, 0x41, 0x03 // tam kesim
];

await printer.send(commands);
await printer.disconnect();
```

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
```
DOMException: Access denied
```
Yazıcının başka bir uygulama (örn. Windows spooler) tarafından tutulduğunu gösterir. Yazıcı servisi durdurulmalı veya yazıcı paylaşımı kapatılmalıdır.

### Interface Claim Başarısız
```javascript
// Önce tüm interface'leri serbest bırak
await device.releaseInterface(0);
```

### Veri Gönderilmiyor Ama Hata Yok
Endpoint numarası yanlış seçilmiş olabilir. Tüm endpoint'leri listeleyin:
```javascript
device.configuration.interfaces.forEach(iface => {
  iface.alternates[0].endpoints.forEach(ep => {
    console.log(ep.direction, ep.type, ep.endpointNumber);
  });
});
```

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
```javascript
import { PrintzenPrinter } from '@printzen/sdk';
const printer = new PrintzenPrinter({ interface: 'usb' });
await printer.connect(); // otomatik requestDevice + claimInterface
await printer.receipt({ lines: [...] });
await printer.cut();
```

Sıfırdan WebUSB yazmak zorunda kalmadan entegrasyon yapabilirsiniz.

## Sık Sorulan Sorular

### WebUSB tüm termal yazıcılarda çalışır mı?
Hayır. Yazıcının USB sürücüsünün işletim sistemi tarafından "kullanılıyor" sayılmaması gerekir. Özellikle Windows'ta yazıcı servisi aktifken sorun çıkabilir. macOS ve Linux'ta daha sorunsuz çalışır.

### WebUSB ile ne kadar hızlı veri gönderebilirim?
USB 2.0 Full Speed ile saniyede ~1 MB veri aktarılabilir. 80mm termal yazıcılar genellikle 200mm/sn baskı hızına sahip olup bu teorik maksimumun çok altındadır. WebUSB bant genişliği baskı hızında darboğaz oluşturmaz.

### Bağlantı sonrası kullanıcı izni tekrar sorulur mu?
Hayır. İlk izin onaylandıktan sonra aynı cihaza otomatik yeniden bağlanılabilir: `navigator.usb.getDevices()`

## Bu Konudaki Yazıcı Modeli Rehberleri

- [Bixolon Slp Tx400 Webusb](/tr/rehber/bixolon-slp-tx400-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Bixolon Spp R200iii Webusb](/tr/rehber/bixolon-spp-r200iii-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Bixolon Spp R310 Webusb](/tr/rehber/bixolon-spp-r310-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Bixolon Srp 330ii Webusb](/tr/rehber/bixolon-srp-330ii-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Bixolon Srp 350iii Webusb](/tr/rehber/bixolon-srp-350iii-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Bixolon Srp Q300 Webusb](/tr/rehber/bixolon-srp-q300-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Epson Tm L90 Webusb](/tr/rehber/epson-tm-l90-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Epson Tm M30ii Webusb](/tr/rehber/epson-tm-m30ii-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)

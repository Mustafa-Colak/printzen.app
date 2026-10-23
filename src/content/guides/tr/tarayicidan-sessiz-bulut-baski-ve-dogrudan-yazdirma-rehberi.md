---
updatedDate: 2026-10-23
title: "Tarayıcıdan Sessiz Bulut Baskı (Silent Cloud Printing): WebUSB, WebSocket ve Port 9100 Mimarisi"
description: "Web POS, WMS ve SaaS uygulamalarında tarayıcı yazdırma penceresini (window.print) atlayarak WebUSB, WebSocket köprüsü ve TCP Port 9100 üzerinden doğrudan ZPL ve ESC/POS sessiz baskı mimarisi."
printerClass: desktop
brand: Generic
publishDate: 2026-10-23
translationKey: silent-cloud-printing-browser-architecture
---

Modern bulut tabanlı satış noktası (**Web POS**), depo yönetim sistemi (**WMS**), restoran mutfak ekranı (**KDS**) ve e-ticaret sipariş karşılama yazılımlarında karşılaşılan en büyük darboğaz, web tarayıcılarının güvenlik kum havuzu (*browser sandbox*) nedeniyle fiziksel donanımlara doğrudan erişimi kısıtlamasıdır. Standart bir web uygulamasında `window.print()` çağrıldığında işletim sisteminin yazdırma önizleme penceresi açılır; kullanıcının her fiş veya kargo etiketi için yazıcı seçmesi, kenar boşluğu ayarlaması ve **"Yazdır"** butonuna tıklaması gerekir. Günde binlerce siparişin çıktığı bir depoda veya yoğun bir perakende kasasında bu diyalog penceresi işlem başına **4 ile 7 saniye** zaman kaybına ve PDF ölçekleme kaynaklı barkod okunmama hatalarına yol açar.

**Tarayıcıdan Sessiz Bulut Baskı (Silent Cloud Printing)** mimarisi, işletim sistemi yazdırma penceresini ve grafiksel PDF sürücü katmanını tamamen devre dışı bırakarak ham **ZPL II**, **ESC/POS** veya **TSPL** bayt dizilerini milisaniyeler içinde doğrudan termal yazıcıya iletir.

Bu mühendislik rehberinde; tarayıcıdan sıfır tıklamayla (*zero-click*) sessiz baskı almanın 4 temel mimarisini, **WebUSB / Web Bluetooth** donanım apilerini, yerel **WebSocket — TCP 9100** köprü servisini, bulut kuyruk (**MQTT / Webhook**) mimarisini ve üretime hazır kod örneklerini inceliyoruz.

---

## 1. Neden `window.print()` ve PDF Sürücüleri Termal Yazıcılarda Başarısız Olur?

Geleneksel masaüstü lazer veya mürekkep püskürtmeli yazıcılar sayfa bazlı grafik görüntülerini (`PDF`, `PostScript`, `GDI`) işlemek üzere tasarlanmıştır. Buna karşılık `203 DPI` (`8 nokta/mm`) ve `300 DPI` (`11,8 nokta/mm`) çözünürlüklü termal fiş ve barkod etiket yazıcıları, ısıtıcı kafa elemanlarını doğrudan kontrol eden **komut tabanlı (native command)** cihazlardır:

1. **Barkod Kenar Bulanıklığı (Anti-Aliasing & Dithering Sorunu):** Tarayıcıda HTML/CSS veya PDF olarak çizilen bir `GS1-128` veya `GS1 DataMatrix` barkod işletim sistemi sürücüsünden geçtiğinde gri tonlamalı yumuşatma (*anti-aliasing*) uygulanır. Termal kafa yalnızca siyah (`1`) veya beyaz (`0`) basabildiği için gri pikseller rastgele noktalara (*dithering*) dönüşür ve barkod çubuk kalınlıkları bozularak **[2D karekod okuyucularda](https://rebo.com.tr/barkod-ve-2d-karekod-okuyucu-secim-rehberi-karsilastirma/)** okuma hatası üretir.
2. **Diyalog Penceresi ve Operatör Hatası:** Kasiyer veya depo personeli her etikette açılan pencerede yanlışlıkla farklı bir yazıcı seçebilir ya da `"Sayfaya Sığdır (Fit to Page)"` seçeneğini açık unutarak etiket koordinatlarını kaydırabilir.
3. **Donanım Komutlarının Kaybı:** Grafiksel yazdırma sürücüleri üzerinden para çekmecesi açma (`0x1B 0x70`), giyotin bıçakla tam/yarım kağıt kesme (`0x1D 0x56`) veya RFID çip kodlama (`^RFW`) gibi donanımsal komutları dinamik olarak tetiklemek son derece zordur.

---

## 2. Sessiz Bulut ve Tarayıcı Baskısı İçin 4 Temel Mimari Karşılaştırması

Uygulamanızın çalıştığı cihaza (Masaüstü PC, Android El Terminali, Tablet POS veya Sunucu Arka Ucu) göre seçebileceğiniz 4 sessiz yazdırma yöntemi şunlardır:

| Mimari Yöntem | Bağlantı Arayüzü | Ek Kurulum Gereksinimi | Gecikme Süresi (Latency) | İdeal Kullanım Senaryosu |
| :--- | :--- | :--- | :--- | :--- |
| **1. WebUSB & Web Bluetooth API** | USB (`Bulk Out`) / BLE GATT | **Sıfır Kurulum** (Doğrudan Chromium tarayıcıdan) | `15 – 60 ms` | Tek kasalı Web POS, mobil saha satış, USB/Bluetooth yazıcılar |
| **2. Yerel WebSocket — TCP 9100 Köprüsü** | `ws://127.0.0.1` ➔ `TCP 9100` / USB | Hafif yerel ajan servisi (Node.js / Go / Printzen) | `10 – 35 ms` | Çok yazıcılı mağaza, depo paketleme masaları, yerel ağ (LAN) |
| **3. Bulut Kuyruk (Webhook / MQTT Agent)** | `HTTPS / WSS` ➔ Yerel Ağ Yazıcısı | Depo sunucusunda veya uç cihazda bulut dinleyici | `80 – 250 ms` | ERP/WMS arka ucundan otomatik sipariş ve mutfak fişi basımı |
| **4. Android Print Service Köprüsü** | Android OS `Intent` / `WebSocket` | Android Printzen servis uygulaması | `20 – 50 ms` | **[Endüstriyel Android el terminalleri](https://rebo.com.tr/endustriyel-el-terminali-ve-dokunmatik-pos-terminali-secim-rehberi/)** ve mobil POS |

---

## 3. Yöntem 1: WebUSB API ile Sürücüsüz ve Diyalogsız Doğrudan Baskı

Chromium tabanlı tarayıcılar (Chrome, Edge, Opera), HTTPS üzerinde çalışan web uygulamalarının kullanıcıdan yalnızca **tek bir kez** cihaz erişim izni alarak USB portuna bağlı termal yazıcıya doğrudan ham bayt dizisi göndermesine olanak tanır. İlk eşleşmeden sonra `navigator.usb.getDevices()` ile yazıcı otomatik tanınır ve hiçbir pencere açılmadan sessizce baskı alınır:

```javascript
// WebUSB üzerinden Termal Yazıcıya Sıfır Diyalogla Ham ZPL II / ESC-POS Gönderimi
class SilentWebUsbPrinter {
  constructor() {
    this.device = null;
    this.interfaceNumber = 0;
    this.endpointOut = 1;
  }

  async connect(vendorId = null) {
    // Daha önce izin verilmiş cihazları kontrol et (Sessiz otomatik bağlantı)
    const pairedDevices = await navigator.usb.getDevices();
    this.device = vendorId
      ? pairedDevices.find(d => d.vendorId === vendorId)
      : pairedDevices[0];

    // İlk kez bağlanılıyorsa kullanıcıdan tek seferlik USB seçimi iste
    if (!this.device) {
      const filters = vendorId ? [{ vendorId }] : [];
      this.device = await navigator.usb.requestDevice({ filters });
    }

    await this.device.open();
    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }

    // Yazıcı Bulk-Out uç noktasını (Endpoint) otomatik bul
    for (const iface of this.device.configuration.interfaces) {
      for (const alt of iface.alternates) {
        const outEp = alt.endpoints.find(e => e.direction === 'out' && e.type === 'bulk');
        if (outEp) {
          this.interfaceNumber = iface.interfaceNumber;
          this.endpointOut = outEp.endpointNumber;
          break;
        }
      }
    }

    await this.device.claimInterface(this.interfaceNumber);
    return true;
  }

  async printRawZpl(zplString) {
    if (!this.device || !this.device.opened) {
      await this.connect();
    }
    const encoder = new TextEncoder(); // UTF-8 (^CI28 uyumlu)
    const payload = encoder.encode(zplString);

    // Büyük etiket şablonlarını 4096 baytlık paketler halinde gönder
    const CHUNK_SIZE = 4096;
    for (let offset = 0; offset < payload.byteLength; offset += CHUNK_SIZE) {
      const chunk = payload.slice(offset, offset + CHUNK_SIZE);
      await this.device.transferOut(this.endpointOut, chunk);
    }
  }
}
```

Kablosuz taşınabilir yazıcılar için aynı mimarinin Bluetooth karşılığını [Web Bluetooth ile Termal Yazıcı Bağlantısı](/tr/rehberler/web-bluetooth-termal-yazici-baglantisi/) rehberimizde bulabilirsiniz.

---

## 4. Yöntem 2: Yerel WebSocket Köprüsü ile Ağdaki (`TCP 9100`) Yazıcılara Sessiz Baskı

Web tarayıcıları güvenlik kuralları gereği yerel ağdaki bir yazıcının **Raw TCP `9100` (JetDirect)** soketine doğrudan bağlanamaz. Ancak bilgisayar veya yerel sunucu üzerinde çalışan 50 satırlık hafif bir **WebSocket ➔ TCP 9100 Köprüsü**, bulut üzerindeki SaaS uygulamanızın yerel ağdaki tüm Ethernet/Wi-Fi barkod ve fiş yazıcılarına milisaniyeler içinde sessiz baskı göndermesini sağlar:

```javascript
// Yerel Köprü Servisi (Node.js): ws://127.0.0.1:8181 -> TCP Port 9100
import { WebSocketServer } from 'ws';
import net from 'net';

const wss = new WebSocketServer({ host: '127.0.0.1', port: 8181 });

wss.on('connection', (ws) => {
  ws.on('message', (rawMessage) => {
    try {
      // Beklenen JSON: { "printerIp": "192.168.1.200", "port": 9100, "data": "^XA^CI28..." }
      const job = JSON.parse(rawMessage.toString('utf8'));
      const client = new net.Socket();
      client.setTimeout(5000);

      client.connect(job.port || 9100, job.printerIp, () => {
        client.write(Buffer.from(job.data, 'utf8'), () => {
          client.end();
          ws.send(JSON.stringify({ status: 'ok', printerIp: job.printerIp }));
        });
      });

      client.on('error', (err) => {
        ws.send(JSON.stringify({ status: 'error', message: err.message }));
      });
    } catch (e) {
      ws.send(JSON.stringify({ status: 'error', message: e.message }));
    }
  });
});
```

Bu mimari sayesinde:
- Depo paketleme masasında barkod okutulduğu anda, web arayüzü `ws://127.0.0.1:8181` adresine [ZPL II kargo etiketi şablonunu](/tr/rehberler/zebra-zpl-etiket-yazdirma/) iletir.
- Köprü servisi veriyi `192.168.1.200:9100` adresindeki endüstriyel yazıcıya veya konveyör hattındaki **[Rebo-Label otomatik yaz-yapıştır (Print & Apply) sistemine](https://rebolabel.com/blog/otomatik-etiketleme-makinesi-print-apply-secim-rehberi/)** doğrudan basar.
- Baskı öncesinde şablon koordinatlarını fiziksel etiket harcamadan test etmek için [Çevrimiçi ZPL Etiket Önizleme ve Test Rehberi](/tr/rehberler/cevrimici-zpl-etiket-onizleme-ve-test-rehberi/) adımlarını kullanabilirsiniz.

---

## 5. Sıkça Sorulan Sorular (SSS)

### Web tarayıcısından hiçbir kurulum yapmadan `window.print()` penceresini tamamen kapatabilir miyiz?
Güvenlik nedeniyle standart `window.print()` çağrısı kullanıcının onayı olmadan sessizce çalıştırılamaz (yalnızca özel `--kiosk-printing` bayrağıyla başlatılan yerel Chrome kısayollarında çalışır). Ancak **WebUSB API** veya **Web Bluetooth API** kullandığınızda `window.print()` hiç çağrılmaz; ham ZPL veya ESC/POS verisi doğrudan donanım portuna aktarıldığı için ek bir program kurmadan %100 sessiz baskı alınır.

### HTTPS üzerindeki bir bulut uygulaması yerel ağdaki `ws://127.0.0.1` köprüsüne bağlanabilir mi (Mixed Content)?
Evet. W3C **Secure Contexts** standardına göre `127.0.0.1` ve `localhost` adresleri güvenli geri dönüş (*loopback*) kabul edilir. Bu sayede `https://uygulamaniz.com` adresinde çalışan bir bulut yazılımı, kullanıcının bilgisayarındaki `ws://127.0.0.1:8181` WebSocket servisine karma içerik (*Mixed Content*) hatası almadan bağlanabilir.

### Android el terminallerinde ve tabletlerde tarayıcıdan sessiz baskı nasıl yapılır?
Android cihazlarda çalışan Chrome tarayıcısı üzerinden hem **Web Bluetooth** hem de **Printzen Android Print Service** köprüsü kullanılabilir. Web uygulamanız yerel WebSocket veya Android Intent bağlantısıyla fiş/etiket verisini arka planda çalışan Printzen servisine iletir ve Bluetooth, Wi-Fi (`Port 9100`) veya USB OTG yazıcıdan anında sessiz çıktı alınır.

### Sessiz baskı sırasında yazıcının kağıdının bittiğini veya kapağının açık olduğunu nasıl anlarız?
`TCP 9100` veya `WebUSB` üzerinden çift yönlü (*bi-directional*) iletişim kurulduğunda, ZPL yazıcılara `~HS` (*Host Status Return*), ESC/POS fiş yazıcılara ise `DLE EOT` (`0x10 0x04 0x01`) gerçek zamanlı durum sorgusu gönderilir. Yazıcıdan dönen durum baytları okunarak *"Etiket Bitti (Paper Out)"*, *"Kafa Açık (Head Up)"* veya *"Ribon Bitti"* uyarıları doğrudan web ekranında kullanıcıya gösterilir.

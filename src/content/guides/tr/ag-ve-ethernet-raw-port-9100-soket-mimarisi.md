---
title: "Ağ Yazıcıları: Ethernet ve Raw Port 9100 Soket Mimarisi"
description: "Ethernet bağlantılı termal yazıcılarda Raw TCP Port 9100 protokolü, WebSocket köprüsü, statik IP yapılandırması ve çok istasyonlu ağ yazıcı mimarisi."
printerClass: "desktop"
brand: "Epson / Zebra / Star"
publishDate: 2026-09-11
translationKey: "ag-ethernet-raw-port-9100-soket-mimarisi"
topicCluster: "hub-12"
---

Ethernet bağlantılı termal yazıcılar, USB ve Bluetooth çözümlerine kıyasla kurumsal ortamlarda en stabil ve ölçeklenebilir seçenektir. Özellikle restoran, market ve depo gibi yüksek baskı hacimli noktalarda **Raw TCP Port 9100** protokolü endüstri standardı haline gelmiştir.

## Port 9100 Nedir?

Port 9100, "RAW printing" veya "JetDirect" olarak da bilinen, yazıcıya doğrudan ham veri akışı gönderilen TCP portudur. CUPS, Windows Print Spooler ve doğrudan socket uygulamaları bu portu kullanır.

- **Port 9100:** Tek yönlü veri akışı (en yaygın)
- **Port 9101:** İkinci tray veya alternatif port
- **Port 9102:** Üçüncü tray

## Statik IP Yapılandırması

Ağ yazıcısının IP'si DHCP ile değişirse tüm bağlantılar kopar. Statik IP zorunludur:

```
# Epson TM-T88VI Ağ Ayarları (EpsonNet Config üzerinden)
IP Adresi:     192.168.1.100
Alt Ağ Maskesi: 255.255.255.0
Varsayılan Ağ Geçidi: 192.168.1.1
Port: 9100
Protokol: RAW
```

## Node.js ile Doğrudan TCP Bağlantısı

```javascript
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
const TEXT = Buffer.from('PRINTZEN TEST


');
const CUT = Buffer.from([0x1D, 0x56, 0x41, 0x03]);

await printToNetworkPrinter(
  '192.168.1.100',
  9100,
  Buffer.concat([ESC_INIT, TEXT, CUT])
);
```

## Tarayıcıdan Ağ Yazıcısına: WebSocket Köprüsü

Tarayıcılar doğrudan TCP soketi açamaz. Araya bir WebSocket-to-TCP köprüsü kurulur:

```javascript
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
```

```javascript
// İstemci tarafı (Tarayıcı)
const ws = new WebSocket('ws://localhost:8080');
ws.binaryType = 'arraybuffer';

ws.onopen = () => {
  const data = new Uint8Array([0x1B, 0x40, ...]);
  ws.send(data);
};
```

## Çok İstasyonlu Yazıcı Mimarisi

Birden fazla kasa veya istasyonun aynı yazıcıyı paylaşması:

```javascript
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
```

## Güvenlik: VLAN ile Yazıcı İzolasyonu

Yazıcılar internete açık olmamalıdır. Önerilen ağ mimarisi:

```
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
```

## Sorun Giderme

### Bağlantı Reddedildi (Connection Refused)
- Yazıcı açık ve ağa bağlı mı?
- IP adresi doğru mu? `ping 192.168.1.100`
- Port 9100 açık mı? `nc -zv 192.168.1.100 9100`

### Veri Gönderildi Ama Baskı Yok
- Yazıcı "pause" durumunda olabilir
- Buffer dolmuş olabilir — ESC @ ile sıfırlayın
- Kağıt veya şerit bitti mi?

### Ara Sıra Veri Kaybı
Büyük veri bloklarını chunk'lara bölün:
```javascript
const CHUNK = 1024;
for (let i = 0; i < data.length; i += CHUNK) {
  await sendChunk(data.slice(i, i + CHUNK));
  await sleep(10); // 10ms bekle
}
```

## Sık Sorulan Sorular

### Kaç yazıcı aynı ağda olabilir?
Teknik sınır yoktur. Pratik olarak bir switch portu başına bir yazıcı, 1 Gbps switch ile 50+ yazıcı sorunsuz çalışır.

### WiFi mi Ethernet mi daha iyi?
Ethernet daha güvenilirdir. WiFi'da paket kaybı baskı kalitesini bozabilir. Yüksek hacimli ortamlarda her zaman Ethernet tercih edin.

### Port 9100'e firewall engelliyor, ne yapmalıyım?
IT ekibinizden yazıcı VLAN'ı ile POS terminalleri arasında port 9100 açılmasını isteyin. Dışarıdan (internet) erişim hiçbir zaman açılmamalıdır.

## Desteklenen Cihazlar

Bu rehberdeki adımlar, ilgili protokolü/arayüzü destekleyen aşağıdaki yazıcı modellerinin tamamı için geçerlidir:

| Marka | Model | Protokol | Arayüzler | Kağıt Genişliği |
|---|---|---|---|---|
| Bixolon | SLP-TX400 | SLCS / BPL-Z | USB, Ethernet, Seri | 104mm |
| Bixolon | SPP-R200III | ESC/POS / CPCL | Bluetooth, Wi-Fi, USB | 58mm |
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
| Honeywell | PC42t | Direct Protocol / ZSim / ESim | USB, Ethernet, Seri | 104mm |
| Rongta | RP326 | ESC/POS | USB, Ethernet, Seri | 80mm |
| Rongta | RP80 | ESC/POS | USB, Ethernet | 80mm |
| Seiko | RP-D10 | ESC/POS | USB, Ethernet, Bluetooth | 80mm |
| Star Micronics | mC-Print3 | StarPRNT | CloudPRNT, Bluetooth, Ethernet, USB | 80mm |
| Star Micronics | TSP143III | StarPRNT / ESC/POS | Ethernet, Wi-Fi, USB, Lightning | 80mm |
| Star Micronics | TSP654II | Star Line / ESC/POS | Bluetooth, Ethernet, USB | 80mm |
| TSC | DA220 | TSPL-EZD | USB, Ethernet, Bluetooth, Wi-Fi | 108mm |
| Xprinter | XP-420B | TSPL / ESC/POS | USB, Bluetooth, Ethernet | 108mm (100x150) |
| Xprinter | XP-N160II | ESC/POS | USB, Ethernet | 80mm |
| Xprinter | XP-Q800 | ESC/POS | USB, Ethernet, Seri | 80mm |
| Zebra | GK420d | ZPL II / EPL2 | USB, Ethernet, Seri | 104mm |
| Zebra | GK420t | ZPL II / EPL2 | USB, Ethernet | 104mm |
| Zebra | ZD420 | ZPL II / EPL | USB, Ethernet, Bluetooth, Wi-Fi | 104mm |
| Zebra | ZD421 | ZPL II / EPL | USB, Ethernet, Bluetooth BLE | 104mm |
| Zebra | ZQ320 Plus | CPCL / ZPL | Bluetooth BLE, Wi-Fi | 80mm (3 inç) |
| Zebra | ZQ520 | CPCL / ZPL | Bluetooth, Wi-Fi | 104mm (4 inç) |
| Zebra | ZT411 | ZPL II | Ethernet, USB, Bluetooth 4.1 | 104mm |


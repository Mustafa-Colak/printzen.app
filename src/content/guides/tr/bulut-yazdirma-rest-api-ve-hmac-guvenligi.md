---
title: "Bulut Yazdırma: REST API ve HMAC Güvenlik Mimarisi"
description: "İnternet üzerinden termal yazıcıya baskı göndermek için REST API tasarımı, HMAC-SHA256 kimlik doğrulama, webhook güvenliği ve cloud print agent mimarisi."
printerClass: "desktop"
brand: "Epson / Zebra"
publishDate: 2026-09-11
translationKey: "bulut-yazdirma-rest-api-hmac-guvenligi"
topicCluster: "hub-13"
---

Bulut yazdırma (cloud printing), yazıcının fiziksel konumundan bağımsız olarak internet üzerinden baskı komutları gönderilmesini sağlar. E-ticaret siparişlerinin otomatik olarak depodaki yazıcıya düşmesi, restoran siparişlerinin mutfak yazıcısına anlık iletilmesi bunun somut örnekleridir.

## Bulut Yazdırma Mimarisi

```
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
```

## REST API Tasarımı

```javascript
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
```

## HMAC-SHA256 Güvenlik

Her API isteği imzalanmalıdır. HMAC kullanarak:

```javascript
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
```

## Cloud Print Agent

Yazıcının yanındaki makinede çalışan küçük servis:

```javascript
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
    this.ws = new WebSocket(`${serverUrl}?agentId=${this.agentId}`);
    
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
```

## Offline Kuyruk Yönetimi

Yazıcı veya ağ kesilirse baskı kaybolmamalıdır:

```javascript
// SQLite tabanlı baskı kuyruğu
import Database from 'better-sqlite3';

const db = new Database('print-queue.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data BLOB NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    printed_at DATETIME
  )
`);

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
```

## Sık Sorulan Sorular

### Cloud print agent hangi işletim sisteminde çalışır?
Windows, macOS ve Linux'ta Node.js ile çalışır. Windows'ta NSSM ile servis olarak kurulabilir, Linux'ta systemd unit file yazılır.

### Baskı verisi şifrelenmeli mi?
HTTPS (TLS) tünel şifrelemesi sağlar. İçerik şifreleme ek güvenlik katmanı sunar ama çoğu durumda HMAC imza yeterlidir.

### Çoklu şube için nasıl ölçeklenir?
Her şube için ayrı agentId kullanın. Merkezi API sunucusu hangi job hangi agent'a gidecek şekilde yönlendirir.

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


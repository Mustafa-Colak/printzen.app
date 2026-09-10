---
title: "Yerel WebSocket Arka Plan Servisi (Tray Agent) ile Raw Yazdırma Mimarisi"
description: "Web tabanlı POS ve ERP sistemlerinde localhost WebSocket arka plan servisi kurarak doğrudan USB/LAN termal yazıcılara ham ESC/POS ve ZPL baytları iletme mimarisi."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: local-websocket-background-tray-agent-raw-printing
---

Kurumsal SaaS, perakende mağaza zincirleri ve depo lojistik yazılımlarında en yaygın ve kararlı mimari, **Yerel Arka Plan Yazdırma Servisi (Localhost Tray Agent)** desenidir.

Bu modelde; kullanıcının masaüstü bilgisayarında sistem tepsisinde (System Tray) sessizce çalışan hafif bir servis yer alır. Tarayıcıda çalışan web uygulamanız, `ws://localhost:18570` adresine WebSocket üzerinden bağlanır ve ham bayt dizilerini (ESC/POS veya ZPL) yerel servise iletir.

---

## 1. Local Agent Mimarisi Nasıl Çalışır?

```
[ Web Uygulaması (Chrome / Safari / Edge) ]
                    │
                    ▼ (ws://localhost:18570 üzerinden JSON & Binary)
[ Printzen Local Agent (Tray Service - Go / Node / C#) ]
                    ├──► USB Yazıcı 1: Kasa Fişi (Windows Raw Spooler)
                    ├──► USB Yazıcı 2: Kargo Barkodu (Zebra ZPL)
                    └──► LAN Yazıcı 3: Mutfak Adisyonu (TCP Socket 192.168.1.200:9100)
```

---

## 2. Web Tarafında İstemci Kodu (JavaScript)

```javascript
class PrintzenAgentClient {
  constructor(port = 18570) {
    this.url = `ws://localhost:${port}`;
    this.ws = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        console.log('Printzen Yerel Ajanına bağlandı.');
        resolve();
      };
      this.ws.onerror = (err) => reject(new Error('Ajan çalışmıyor.'));
    });
  }

  async printRaw(targetPrinter, binaryPayload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    const payload = {
      action: 'PRINT_RAW',
      printer: targetPrinter,
      // Baytları base64 veya dizi olarak ilet
      data: Array.from(binaryPayload)
    };

    this.ws.send(JSON.stringify(payload));
  }
}
```

---

## 3. Güvenlik ve Karışık İçerik (Mixed Content) Yönetimi

Web siteniz `https://` ile çalışırken `ws://localhost` bağlantısı kurmak modern tarayıcılarda serbesttir (W3C Mixed Content spesifikasyonunda `localhost` güvenli kabul edilir). Ancak bazı sıkı güvenlik politikalarında yerel bir self-signed SSL sertifikası üretilerek `wss://localhost:18570` üzerinden tam şifreli haberleşme sağlanır.

---

## 4. Sıkça Sorulan Sorular (SSS)

### Yerel servis bilgisayarı yavaşlatır veya çok RAM tüketir mi?
**Hayır, Go veya optimize edilmiş C# ile derlenen modern bir Tray Agent arka planda yalnızca 5-15 MB RAM tüketir ve %0 CPU kullanır.** Yalnızca yazdırma emri geldiğinde aktifleşip işi milisaniyeler içinde işletim sistemi biriktiricisine devreder.

### Windows kullanıcı izinleri (UAC) her seferinde onay ister mi?
**Hayır, servis kurulum esnasında bir defaya mahsus Windows Başlangıç (Startup) klasörüne veya Windows Hizmetleri (Services) arasına kaydedilir.** Bilgisayar her açıldığında arka planda sessizce başlar ve kullanıcıdan hiçbir yetki istemez.

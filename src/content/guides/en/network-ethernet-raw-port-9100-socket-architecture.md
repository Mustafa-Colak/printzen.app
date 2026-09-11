---
title: "Network Thermal Printers: Ethernet and Raw TCP Port 9100 Architecture"
description: "Set up Raw TCP Port 9100 for Ethernet thermal printers, build a WebSocket-to-TCP bridge, configure static IPs, and architect a multi-station printer pool."
printerClass: "desktop"
brand: "Epson / Zebra / Star"
publishDate: 2026-09-11
translationKey: "ag-ethernet-raw-port-9100-soket-mimarisi"
topicCluster: "hub-12"
---

Ethernet-connected thermal printers are the most reliable and scalable option for enterprise environments. In restaurants, retail, and warehouses with high print volume, **Raw TCP Port 9100** has become the industry standard.

## What Is Port 9100?

Port 9100 (also called RAW printing or JetDirect) is a TCP port that accepts raw data streams directly to the printer. CUPS, Windows Print Spooler, and custom socket applications all use this port.

## Static IP Configuration

If the printer's IP changes via DHCP, all connections break. Always configure a static IP:

```
# Epson TM-T88VI Network Settings (via EpsonNet Config)
IP Address:      192.168.1.100
Subnet Mask:     255.255.255.0
Default Gateway: 192.168.1.1
Port: 9100
Protocol: RAW
```

## Direct TCP with Node.js

```javascript
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
const TEXT = Buffer.from('PRINTZEN TEST


');
const CUT = Buffer.from([0x1D, 0x56, 0x41, 0x03]);
await printToNetworkPrinter('192.168.1.100', Buffer.concat([ESC_INIT, TEXT, CUT]));
```

## Browser → Network Printer via WebSocket Bridge

Browsers can't open raw TCP sockets. Use a WebSocket-to-TCP bridge:

```javascript
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
```

```javascript
// Client (Browser)
const ws = new WebSocket('ws://localhost:8080');
ws.binaryType = 'arraybuffer';
ws.onopen = () => ws.send(new Uint8Array([0x1B, 0x40, ...]));
```

## Troubleshooting

**Connection Refused** — Check: Is the printer on? `ping 192.168.1.100` → `nc -zv 192.168.1.100 9100`

**Data Sent, Nothing Prints** — Printer may be paused. Check paper/ribbon. Send ESC @ reset first.

**Intermittent Data Loss** — Split large payloads into 1024-byte chunks with 10ms sleep between sends.

## FAQ

**How many printers can be on one network?**
No hard limit. Practically, 50+ printers on a 1 Gbps switch work fine.

**WiFi vs Ethernet — which is better?**
Ethernet is always more reliable. WiFi packet loss causes print quality issues. Use Ethernet for high-volume environments.
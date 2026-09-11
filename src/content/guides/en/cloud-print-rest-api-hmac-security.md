---
title: "Cloud Printing: REST API Design and HMAC Security Architecture"
description: "Build a cloud print system with REST API endpoints, HMAC-SHA256 request signing, a local print agent, and offline queue management for reliable thermal printer integration."
printerClass: "desktop"
brand: "Epson / Zebra"
publishDate: 2026-09-11
translationKey: "bulut-yazdirma-rest-api-hmac-guvenligi"
topicCluster: "hub-13"
---

Cloud printing lets you send print commands to a thermal printer over the internet, regardless of physical location. E-commerce orders printing automatically at the warehouse, restaurant orders reaching the kitchen printer in real time — these are prime examples.

## Architecture Overview

```
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
```

## HMAC-SHA256 Request Signing

```javascript
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
```

## Cloud Print Agent (Node.js)

```javascript
import WebSocket from 'ws';
import net from 'net';

class CloudPrintAgent {
  constructor({ agentId, serverUrl, printerHost }) {
    this.printerHost = printerHost;
    this.ws = new WebSocket(`${serverUrl}?agentId=${agentId}`);
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
```

## Offline Queue

```javascript
import Database from 'better-sqlite3';
const db = new Database('queue.db');
db.exec(`CREATE TABLE IF NOT EXISTS queue (id INTEGER PRIMARY KEY, data BLOB, status TEXT DEFAULT 'pending')`);

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
```

## FAQ

**What OS does the agent run on?**
Windows, macOS, and Linux via Node.js. Use NSSM for Windows service, systemd unit for Linux.

**Does print data need encryption?**
HTTPS provides transport encryption. HMAC signing is sufficient for most use cases.

**How to scale for multiple branches?**
Assign a unique agentId per branch. The central API routes each job to the correct agent.
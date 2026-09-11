#!/usr/bin/env node
/**
 * Printzen.app haftalık Google Search Console raporu.
 *
 * Kimlik bilgisi kaynağı (öncelik sırasıyla):
 *   1. GSC_SERVICE_ACCOUNT_KEY ortam değişkeni (ham JSON string) — CI'da kullanılır.
 *   2. --key-path ile verilen dosya yolu — yerel çalıştırma için.
 *
 * Kullanım:
 *   node scripts/gsc-report.mjs
 *   node scripts/gsc-report.mjs --key-path ../master-publisher/credentials/gsc-rebo-key.json
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SITE_URL = 'sc-domain:printzen.app';

class GSCClient {
  constructor(key) {
    this.key = key;
    this.token = null;
    this.tokenExpiresAt = 0;
  }

  static fromEnvOrFile(keyPath) {
    if (process.env.GSC_SERVICE_ACCOUNT_KEY) {
      return new GSCClient(JSON.parse(process.env.GSC_SERVICE_ACCOUNT_KEY));
    }
    if (!keyPath) {
      throw new Error('GSC_SERVICE_ACCOUNT_KEY ortam değişkeni yok ve --key-path verilmedi.');
    }
    const resolved = path.resolve(keyPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`GSC service account key bulunamadı: ${resolved}`);
    }
    return new GSCClient(JSON.parse(fs.readFileSync(resolved, 'utf8')));
  }

  async getAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    if (this.token && this.tokenExpiresAt > now + 60) return this.token;

    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const claim = Buffer.from(JSON.stringify({
      iss: this.key.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })).toString('base64url');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${header}.${claim}`);
    const signature = sign.sign(this.key.private_key, 'base64url');
    const jwt = `${header}.${claim}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    const data = await res.json();
    if (!data.access_token) {
      throw new Error(`Google access token alınamadı: ${JSON.stringify(data)}`);
    }
    this.token = data.access_token;
    this.tokenExpiresAt = now + (data.expires_in || 3600);
    return this.token;
  }

  async querySearchAnalytics(siteUrl, { startDate, endDate, dimensions = [], rowLimit = 25 }) {
    const token = await this.getAccessToken();
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
    });
    return await res.json();
  }
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

function fmtRow(r, keyLabels) {
  const keys = (r.keys || []).map((k, i) => `${keyLabels[i] ? keyLabels[i] + ': ' : ''}${k}`).join(' | ');
  return `| ${keys} | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(2)}% | ${r.position.toFixed(1)} |`;
}

async function main() {
  const args = process.argv.slice(2);
  const keyPathIdx = args.indexOf('--key-path');
  const keyPath = keyPathIdx !== -1 ? args[keyPathIdx + 1] : undefined;

  const client = GSCClient.fromEnvOrFile(keyPath);

  const today = new Date();
  const end = new Date(today); end.setDate(end.getDate() - 2); // GSC verisi ~2 gün gecikmeli gelir
  const start = new Date(end); start.setDate(start.getDate() - 6); // son 7 günlük pencere

  const startStr = fmtDate(start);
  const endStr = fmtDate(end);

  const [totals, pages, queries] = await Promise.all([
    client.querySearchAnalytics(SITE_URL, { startDate: startStr, endDate: endStr, dimensions: [] }),
    client.querySearchAnalytics(SITE_URL, { startDate: startStr, endDate: endStr, dimensions: ['page'], rowLimit: 15 }),
    client.querySearchAnalytics(SITE_URL, { startDate: startStr, endDate: endStr, dimensions: ['query'], rowLimit: 15 }),
  ]);

  const t = totals.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  const lines = [];
  lines.push(`# Printzen GSC Haftalık Rapor — ${startStr} → ${endStr}`);
  lines.push('');
  lines.push(`**Toplam:** ${t.clicks} tıklama, ${t.impressions} gösterim, %${(t.ctr * 100).toFixed(2)} CTR, ortalama pozisyon ${t.position.toFixed(1)}`);
  lines.push('');
  lines.push('## En çok gösterim alan sayfalar');
  lines.push('');
  lines.push('| Sayfa | Tıklama | Gösterim | CTR | Pozisyon |');
  lines.push('|---|---|---|---|---|');
  (pages.rows || []).forEach(r => lines.push(fmtRow(r, [])));
  lines.push('');
  lines.push('## En çok gösterim alan sorgular');
  lines.push('');
  lines.push('| Sorgu | Tıklama | Gösterim | CTR | Pozisyon |');
  lines.push('|---|---|---|---|---|');
  (queries.rows || []).forEach(r => lines.push(fmtRow(r, [])));
  lines.push('');

  const report = lines.join('\n');
  console.log(report);

  if (process.env.WRITE_REPORT_FILE) {
    const outDir = 'reports/gsc';
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${endStr}.md`);
    fs.writeFileSync(outPath, report);
    console.log(`\n📝 Rapor dosyaya yazıldı: ${outPath}`);
  }
}

main().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});

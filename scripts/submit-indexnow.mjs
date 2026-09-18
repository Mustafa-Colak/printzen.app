import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const HOST = 'printzen.app';
const KEY = '696ff7b1aa88b00022949823129a5232';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_PATH = path.join(projectRoot, 'dist', 'sitemap-0.xml');

async function getUrls() {
  const customUrl = process.argv[2];
  if (customUrl && customUrl.startsWith('http')) {
    return [customUrl];
  }

  if (fs.existsSync(SITEMAP_PATH)) {
    const xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
    const urls = Array.from(matches, m => m[1]);
    if (urls.length > 0) return urls;
  }

  return [
    `https://${HOST}/`,
    `https://${HOST}/tr/`,
    `https://${HOST}/guides/android-bluetooth-printer-setup/`,
    `https://${HOST}/tr/rehberler/android-bluetooth-yazici-kurulumu/`,
    `https://${HOST}/guides/zebra-zpl-label-printing/`,
    `https://${HOST}/tr/rehberler/zebra-zpl-etiket-yazdirma/`,
    `https://${HOST}/guides/bluetooth-thermal-printer-troubleshooting-guide/`,
    `https://${HOST}/tr/rehberler/bluetooth-termal-yazici-baglanti-sorunlari-rehberi/`,
  ];
}

async function submitIndexNow() {
  const urlList = await getUrls();
  console.log(`[IndexNow] ${urlList.length} URL hazırlanıyor...`);
  console.log(`[IndexNow] Host: ${HOST}`);
  console.log(`[IndexNow] Key Location: ${KEY_LOCATION}`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    console.log(`[IndexNow] HTTP Yanıt Kodu: ${res.status} (${res.statusText || 'OK'})`);

    if (res.status === 200 || res.status === 202) {
      console.log('✅ [IndexNow] Başarıyla iletildi! Arama motorları (Bing, Yandex, Seznam, Naver vb.) bilgilendirildi.');
      console.log('İletilen URL’ler:');
      urlList.forEach(u => console.log(` - ${u}`));
    } else {
      const text = await res.text();
      console.warn(`⚠️ [IndexNow] Beklenmeyen durum (${res.status}):`, text);
    }
  } catch (err) {
    console.error('❌ [IndexNow] Gönderim hatası:', err.message);
  }
}

submitIndexNow();

---
title: "Web Bluetooth ile Tarayıcıdan Direkt Termal Yazdırma Rehberi (Sürücüsüz Web POS)"
description: "Herhangi bir sürücü veya ara yazılım kurmadan Google Chrome üzerinden Bluetooth termal fiş yazıcılara ESC/POS komutları gönderme mimarisi ve MTU veri akışı yönetimi."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: web-bluetooth-thermal-printer-setup
---

Modern web tabanlı POS (Satış Noktası), kafe sipariş ve saha satış sistemlerinde en büyük operasyonel zorluk, tarayıcıdan fiş yazdırmaktır. Geleneksel yöntemlerde işletmeler; işletim sistemi sürücüleri kurmak, Windows Print Spooler yapılandırmak veya yerel arka plan servisleri (Electron, Tray Agent) çalıştırmak zorunda kalır.

**Web Bluetooth API**, bu karmaşık ara katmanları tamamen ortadan kaldırır. Google Chrome, Microsoft Edge ve Opera gibi Chromium tabanlı modern tarayıcılarda çalışan saf bir JavaScript koduyla; tablet veya bilgisayarınızdan doğrudan taşınabilir bir Bluetooth termal yazıcıya bağlanabilir ve milisaniyeler içinde ESC/POS fiş basabilirsiniz.

Bu kapsamlı mühendislik rehberinde; Web Bluetooth mimarisini, GATT servis ve karakteristik eşleşmesini, Bluetooth 20-byte MTU paketleme sınırını ve üretime hazır tam bir JavaScript sürücüsüz yazdırma kütüphanesini ele alıyoruz.

---

## 1. Web Bluetooth Mimarisi ve Güvenlik Gereksinimleri

Tarayıcıların donanım seviyesinde Bluetooth cihazlarına erişmesi yüksek güvenlik önlemleri gerektirir. W3C Web Bluetooth standardı şu temel kurallara bağlıdır:

1. **Yalnızca Güvenli Bağlantı (HTTPS):** Web Bluetooth API yalnızca `https://` protokolü üzerinden veya yerel geliştirme için `localhost` ortamında çalışır.
2. **Kullanıcı Etkileşimi Zorunluluğu (User Gesture):** Bir web sayfası arka planda gizlice Bluetooth taraması yapamaz. `navigator.bluetooth.requestDevice()` çağrısı mutlaka bir buton tıklaması (`click`), dokunma (`touchstart`) gibi doğrudan bir kullanıcı hareketi tarafından tetiklenmelidir.
3. **Chromium Desteği:** Android Chrome, Windows 10/11 Chrome/Edge, macOS Chrome ve ChromeOS üzerinde yerel olarak desteklenir. (iOS Safari için Bluefy veya WebBLE gibi özel tarayıcılar gerekir).

---

## 2. Bluetooth GATT, Servisler ve Karakteristikler

Bluetooth Low Energy (BLE) ve klasik Bluetooth SPP üzerinden haberleşen termal yazıcılar, **GATT (Generic Attribute Profile)** mimarisini kullanır. Bir yazıcıya veri gönderebilmek için yazıcının **Veri Yazma Karakteristiğine (Write Characteristic)** erişmeniz gerekir.

Piyasadaki termal yazıcıların (Epson, Xprinter, Zebra, Hoin, Goojprt) kullandığı standart Servis UUID'leri şunlardır:

| Servis Tipi | Servis UUID | Karakteristik UUID (Yazma) | Üretici / Model |
|---|---|---|---|
| **Standart Yazıcı Servisi** | `000018f0-0000-1000-8000-00805f9b34fb` | `00002af1-0000-1000-8000-00805f9b34fb` | Standart BLE Yazıcılar |
| **Özel SPP Seri Port Servisi** | `0000e781-0000-1000-8000-00805f9b34fb` | `0000bef8-0000-1000-8000-00805f9b34fb` | Çoğu Taşınabilir 58mm/80mm |
| **Xprinter / Generic BLE** | `49535343-fe7d-4ae5-8fa9-9fafd205e455` | `49535343-8841-43f4-a8d4-ecbe34729bb3` | Xprinter, Zjiang, Milestone |

---

## 3. En Büyük Tuzak: 20-Byte MTU Limiti ve Akış Kontrolü

Web Bluetooth üzerinden bir termal yazıcıya 2 KB boyutunda bir fiş verisini tek seferde `characteristic.writeValue()` ile gönderirseniz tarayıcı derhal **`NetworkError: GATT operation failed`** hatası fırlatır veya yazıcı satırları atlayarak sadece fişin ilk 2-3 satırını basar.

**Nedeni BLE MTU (Maximum Transmission Unit) sınırıdır.** Standart BLE paket boyutu 23 bayttır; 3 bayt protokol başlığı düşüldüğünde net veri yükü **20 bayttır**.

### Çözüm: Paket Parçalama (Chunking) Algoritması
Yazdırılacak bayt dizisi (Uint8Array) 20'şer baytlık dilimlere bölünmeli ve her dilim yazıcıya sırayla gönderilmelidir. Taşma (buffer overflow) yaşanmaması için her paket arasına 10-20 milisaniye gecikme konulmalıdır:

```javascript
async function sendChunkedData(characteristic, data, chunkSize = 20, delayMs = 15) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    // writeValueWithoutResponse daha hızlıdır; desteklenmiyorsa writeValueWithResponse kullanılır
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValueWithResponse(chunk);
    }
    
    // Yazıcı buffer'ının rahatlaması için kısa gecikme
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
```

---

## 4. Baştan Sona Çalışan Web Bluetooth POS Yazdırma Kodu

Aşağıdaki JavaScript kodu; cihaz eşleştirme, bağlantı kurma, ESC/POS fiş verisi üretme ve dilimleyerek yazdırma adımlarının tamamını içerir:

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Web Bluetooth Termal Yazdırma Demo</title>
</head>
<body>
  <h2>Printzen Web Bluetooth Yazdırma</h2>
  <button id="btnPrint" style="padding: 12px 24px; font-size: 16px; cursor: pointer;">
    Bluetooth Fiş Yazıcıya Bağlan ve Yazdır
  </button>

  <script>
    document.getElementById('btnPrint').addEventListener('click', async () => {
      try {
        console.log('Bluetooth cihaz taranıyor...');
        
        // 1. Kullanıcıdan cihaz seçmesini iste
        const device = await navigator.bluetooth.requestDevice({
          filters: [
            { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
            { services: ['0000e781-0000-1000-8000-00805f9b34fb'] },
            { services: ['49535343-fe7d-4ae5-8fa9-9fafd205e455'] }
          ],
          optionalServices: [
            '000018f0-0000-1000-8000-00805f9b34fb',
            '0000e781-0000-1000-8000-00805f9b34fb',
            '49535343-fe7d-4ae5-8fa9-9fafd205e455'
          ]
        });

        console.log('Cihaza bağlanılıyor:', device.name);
        const server = await device.gatt.connect();

        // 2. Aktif servisi ve yazma karakteristiğini bul
        let targetCharacteristic = null;
        const services = await server.getPrimaryServices();
        
        for (const service of services) {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              targetCharacteristic = char;
              break;
            }
          }
          if (targetCharacteristic) break;
        }

        if (!targetCharacteristic) {
          throw new Error('Yazıcıda yazılabilir GATT karakteristiği bulunamadı.');
        }

        console.log('Karakteristik bulundu, fiş hazırlanıyor...');

        // 3. ESC/POS Fiş Komutlarını Hazırla
        const commands = [];
        
        // ESC @ -> Yazıcıyı sıfırla
        commands.push(0x1B, 0x40);
        
        // ESC a 1 -> Ortala
        commands.push(0x1B, 0x61, 0x01);
        
        // Metin verisi: Başlık
        const titleBytes = new TextEncoder().encode("PRINTZEN WEB POS\nSiparis Fisi\n--------------------------------\n");
        titleBytes.forEach(b => commands.push(b));
        
        // ESC a 0 -> Sola hizala
        commands.push(0x1B, 0x61, 0x00);
        
        const bodyBytes = new TextEncoder().encode(
          "1x Filtre Kahve             65.00 TL\n" +
          "1x Havuclu Kek              85.00 TL\n" +
          "--------------------------------\n" +
          "TOPLAM:                    150.00 TL\n\n" +
          "Web Bluetooth ile Yazdirildi.\n\n\n"
        );
        bodyBytes.forEach(b => commands.push(b));

        // GS V 66 0 -> Kağıt Kes
        commands.push(0x1D, 0x56, 66, 0);

        const payload = new Uint8Array(commands);

        // 4. 20-baytlık dilimler halinde gönder
        console.log('Baskı verisi gönderiliyor...');
        const CHUNK_SIZE = 20;
        for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
          const slice = payload.slice(i, i + CHUNK_SIZE);
          if (targetCharacteristic.properties.writeWithoutResponse) {
            await targetCharacteristic.writeValueWithoutResponse(slice);
          } else {
            await targetCharacteristic.writeValueWithResponse(slice);
          }
          await new Promise(r => setTimeout(r, 15));
        }

        console.log('Fiş başarıyla yazdırıldı!');
        
      } catch (error) {
        console.error('Yazdırma hatası:', error);
        alert('Yazdırma başarısız: ' + error.message);
      }
    });
  </script>
</body>
</html>
```

---

## 5. Tarayıcı ve Platform Uyumluluk Tablosu

| Platform / İşletim Sistemi | Tarayıcı | Web Bluetooth Durumu | Notlar |
|---|---|---|---|
| **Android** | Google Chrome | Tam Destek (Kullanıma Hazır) | Konum (Location) ve Bluetooth açık olmalı |
| **Windows 10 / 11** | Chrome / Edge | Tam Destek | Windows Bluetooth Ayarlarından eşleştirme gerekebilir |
| **macOS** | Google Chrome | Tam Destek | Sistem Tercihlerinde Chrome için Bluetooth izni verilmeli |
| **ChromeOS** | Standart Tarayıcı | Mükemmel Yerel Destek | POS kiosk terminalleri için ideal |
| **iOS / iPadOS** | Safari | Desteklenmiyor | Apple Safari Web Bluetooth'u engeller; Bluefy tarayıcısı kullanılabilir |

---

## 6. Sıkça Sorulan Sorular (SSS)

### Web Bluetooth ile yazdırmak için bilgisayara yazıcı sürücüsü kurmak gerekir mi?
**Hayır, Web Bluetooth doğrudan işletim sisteminin Bluetooth radyo katmanıyla konuşur ve yazıcı sürücülerine (Driver) tamamen baypas eder.** Tarayıcı, ham ESC/POS baytlarını doğrudan yazıcının GATT karakteristiğine ilettiği için herhangi bir driver veya Windows Print Spooler kurulumuna ihtiyaç yoktur.

### Web Bluetooth fiş yazıcıyı bulamıyor veya listede göstermiyor, neden?
**Bu durum genellikle `requestDevice` çağrısındaki `filters` parametresinin çok kısıtlayıcı olmasından veya yazıcının klasik Bluetooth (Bluetooth Classic 2.0/3.0) kullanıp BLE (Bluetooth Low Energy 4.0+) desteklememesinden kaynaklanır.** Eski model bazı termal yazıcılar sadece Bluetooth SPP Classic destekler ve Web Bluetooth API tarafından taranamayabilir. Ayrıca cihazın başka bir telefona bağlı olmadığından emin olunmalıdır.

### Baskı sırasında yazıcı neden donuyor veya satırları yarım kesiyor?
**Bunun temel sebebi Bluetooth MTU sınırının (20 bayt) aşılmasıdır.** Veriyi tek bir blok halinde göndermeye çalıştığınızda yazıcının dahili alıcı tamponu (buffer) taşar. Veriyi mutlaka 20'şer baytlık paketlere bölmeli ve paketler arasına 10-15 milisaniye gecikme eklemelisiniz.

### iOS (iPhone ve iPad) cihazlarda tarayıcıdan Bluetooth fiş yazdırmak mümkün müdür?
**Apple Safari Web Bluetooth API'sini desteklememektedir.** Ancak App Store'dan indirebileceğiniz **Bluefy** veya **WebBLE** gibi özel geliştirici tarayıcıları Web Bluetooth standardını iOS üzerinde tam olarak destekler. Kurumsal projelerde saha ekiplerine bu tarayıcılar üzerinden Web POS kullandırılabilir veya Printzen Cloud Print servisi tercih edilebilir.

## Web Bluetooth API ile Mobil ve Web POS Mimarisi

Modern Chrome, Edge ve Chromium tabanlı tarayıcılarda çalışan Web Bluetooth API, web sayfalarının kullanıcı cihazına hiçbir ek yazılım, sürücü ya da köprü kurmadan taşınabilir Bluetooth termal yazıcılarla doğrudan BLE (Bluetooth Low Energy) üzerinden konuşmasını sağlar.

### GATT Protokolü ve Yazıcı Servisleri
Termal yazıcılar veri iletimi için standart veya özel GATT servis UUID'leri kullanır:
- Standart Yazıcı Servis UUID'si: `000018f0-0000-1000-8000-00805f9b34fb`
- Veri Yazma Karakteristiği: `00002af1-0000-1000-8000-00805f9b34fb`
- Şeffaf Seri Aktarım (ISSC / Vendor-specific): `e7810a71-73ae-499d-8c15-faa9aef0c3f2`

### Bluetooth MTU Limiti ve 20-Bayt Parçalama (Chunking)

Bluetooth LE bağlantılarında varsayılan MTU (Maximum Transmission Unit) değeri 23 bayttır (3 bayt protokol başlığı düşüldüğünde efektif veri kapasitesi **20 bayt** kalır). Tek seferde 20 bayttan büyük bir fiş verisi göndermeye çalışırsanız tarayıcı `GATT operation failed` hatası fırlatır veya yazıcı veriyi eksik alıp satır atlar:

```javascript
async function sendRawInChunks(characteristic, data, chunkSize = 20, delayMs = 15) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await characteristic.writeValueWithoutResponse(chunk);
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
```

## iOS (iPhone / iPad) Web Bluetooth Kısıtları ve Çözümü
Apple, Safari tarayıcısında Web Bluetooth standardını gizlilik gerekçesiyle yerel olarak desteklemez. iOS ortamında web tabanlı termal yazdırma yapmanın iki kanıtlanmış yolu vardır:
1. **Bluefy / WebBLE Tarayıcıları:** App Store'da bulunan ve Web Bluetooth API'sini JavaScript bridge üzerinden enjekte eden özel tarayıcılar.
2. **Printzen Cloud Print Köprüsü:** iOS cihazı doğrudan bulut sunucusuna WebSocket veya HTTP POST ile fişi iletir, restorandaki veya mağazadaki yazıcıya bağlı Printzen ajanı saniyeler içinde çıktıyı verir.

## Popüler Model Özelinde Bu Konudaki Rehberler

- [Bixolon Slp Tx400 Web](/tr/rehber/bixolon-slp-tx400-web-bluetooth-termal-yazici-baglantisi)
- [Bixolon Spp R200iii Web](/tr/rehber/bixolon-spp-r200iii-web-bluetooth-termal-yazici-baglantisi)
- [Bixolon Spp R310 Web](/tr/rehber/bixolon-spp-r310-web-bluetooth-termal-yazici-baglantisi)
- [Bixolon Srp 330ii Web](/tr/rehber/bixolon-srp-330ii-web-bluetooth-termal-yazici-baglantisi)
- [Bixolon Srp 350iii Web](/tr/rehber/bixolon-srp-350iii-web-bluetooth-termal-yazici-baglantisi)
- [Bixolon Srp Q300 Web](/tr/rehber/bixolon-srp-q300-web-bluetooth-termal-yazici-baglantisi)
- [Epson Tm L90 Web](/tr/rehber/epson-tm-l90-web-bluetooth-termal-yazici-baglantisi)
- [Epson Tm M30ii Web](/tr/rehber/epson-tm-m30ii-web-bluetooth-termal-yazici-baglantisi)
- [Epson Tm P20ii Web](/tr/rehber/epson-tm-p20ii-web-bluetooth-termal-yazici-baglantisi)
- [Epson Tm P80ii Web](/tr/rehber/epson-tm-p80ii-web-bluetooth-termal-yazici-baglantisi)

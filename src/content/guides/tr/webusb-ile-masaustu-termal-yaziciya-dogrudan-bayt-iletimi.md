---
title: "WebUSB ile Masaüstü Termal Yazıcıya Doğrudan USB Byte İletimi Rehberi"
description: "Google Chrome ve Edge üzerinden USB termal fiş ve etiket yazıcılara sıfır sürücüyle doğrudan ESC/POS ve ZPL baytları gönderme WebUSB API mimarisi."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: direct-usb-printing-via-webusb-api-thermal-printers
---

Tarayıcı üzerinden USB yazıcıya yazdırma denildiğinde akla ilk gelen şey işletim sistemi sürücüsüdür. Ancak modern Chromium tarayıcılarda (Chrome, Edge, Opera) yer alan **WebUSB API**, web uygulamalarının USB portuna takılı bir termal yazıcıyla doğrudan ikili (binary) düzeyde haberleşmesine olanak tanır.

Bu teknoloji sayesinde; Windows, macOS veya Linux bilgisayara hiçbir yazıcı sürücüsü (Driver) kurmadan, doğrudan web sayfasından USB kablosu üzerinden saniyede megabaytlarca hızla ham ESC/POS fiş veya ZPL kargo etiketi basabilirsiniz.

---

## 1. WebUSB Çalışma Prensibi: Bulk Out Transfer

USB yazıcılar standart USB iletişiminde **Toplu Çıkış (Bulk Out Endpoint)** mimarisini kullanır:

```
[ Web Sayfası (JavaScript) ] ──► navigator.usb.requestDevice()
                                              │
                                              ▼ (USB Configuration & Claim Interface)
                                 device.transferOut(endpointNumber, dataBytes)
                                              │
                                              ▼ (Doğrudan USB Kablosu)
                                 [ Termal Yazıcı Mikrodenetleyicisi ]
```

---

## 2. Sıfırdan Çalışan WebUSB Yazdırma Kodu (JavaScript)

```html
<!DOCTYPE html>
<html>
<body>
  <button id="btnUsbPrint">USB Termal Yazıcıya Bağlan ve Yazdır</button>

  <script>
    document.getElementById('btnUsbPrint').addEventListener('click', async () => {
      try {
        // 1. Kullanıcıdan USB Cihazını Seçmesini İste
        // Vendor ID'ler: Epson (0x04B8), Xprinter (0x0416 / 0x1FC9), Zebra (0x0A5F)
        const device = await navigator.usb.requestDevice({
          filters: [
            { vendorId: 0x04b8 }, // Epson
            { vendorId: 0x0a5f }, // Zebra
            { vendorId: 0x0416 }  // Winbond / Xprinter
          ]
        });

        console.log('Cihaz seçildi:', device.productName);

        // 2. USB Bağlantısını Aç
        await device.open();
        await device.selectConfiguration(1);

        // 3. Yazıcı Arayüzünü (Interface) Sahiplen
        // Standart yazıcılarda yazıcı arayüzü genellikle interface 0'dır
        await device.claimInterface(0);

        // 4. ESC/POS Fiş Komutlarını Hazırla
        const commands = [
          0x1B, 0x40, // ESC @ Başlat
          0x1B, 0x61, 0x01, // Ortala
          ...new TextEncoder().encode("PRINTZEN WEBUSB POS\nDogrudan USB ile Yazdirildi!\n\n"),
          0x1D, 0x56, 66, 0 // Kağıt Kes
        ];
        const payload = new Uint8Array(commands);

        // 5. Bulk Out Endpoint'e Gönder (Genellikle endpoint 1 veya 2)
        // Endpoint numarasını arayüz tanımlayıcısından dinamik de bulabilirsiniz
        await device.transferOut(1, payload);

        console.log('Yazdırma başarılı!');
        await device.close();

      } catch (err) {
        console.error('WebUSB Hatası:', err);
        alert('USB Yazdırma Hatası: ' + err.message);
      }
    });
  </script>
</body>
</html>
```

---

## 3. Windows Ortamında En Önemli Kural: WinUSB Sürücüsü

Windows'ta işletim sistemi yazıcıyı varsayılan olarak kendi yazdırma biriktiricisine (spooler) kilitler. WebUSB'nin USB portunu tarayıcıya devredebilmesi için:
- Ücretsiz **Zadig** aracı indirilerek yazıcının sürücüsü bir defaya mahsus **"WinUSB"** olarak değiştirilmelidir. (macOS, Linux ve ChromeOS'ta bu işleme gerek yoktur, doğrudan çalışır).

---

## 4. Sıkça Sorulan Sorular (SSS)

### WebUSB internet olmadan yerel ağda veya offline çalışır mı?
**Evet, WebUSB tamamen istemci tarafında (Client-Side) yerel USB veriyolu üzerinde çalışır.** Bilgisayarın internet bağlantısı kesilse bile WebUSB ile fiş ve etiket basımı kesintisiz devam eder.

### WebUSB ile Bluetooth arasındaki en büyük fark nedir?
**Hız ve stabilitedir.** Bluetooth Low Energy 20-baytlık paket kısıtına sahipken, WebUSB tek seferde binlerce baytı (veya devasa ZPL grafiklerini) 1 milisaniyede yazıcıya aktarır. Masaüstü ve sabit POS terminalleri için WebUSB çok daha üstün bir performansa sahiptir.

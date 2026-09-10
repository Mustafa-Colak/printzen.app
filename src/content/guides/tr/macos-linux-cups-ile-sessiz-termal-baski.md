---
title: "macOS ve Linux'ta CUPS ile Sessiz Termal Baskı Konfigürasyonu"
description: "Apple Mac ve Linux (Ubuntu/Raspberry Pi) sistemlerde CUPS yazdırma mimarisi. lp ve lpr komutlarıyla terminalden veya web sunucusundan doğrudan sessiz baskı."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: macos-linux-cups-silent-thermal-printing
---

macOS ve Linux tabanlı POS terminallerinde (özellikle Raspberry Pi ile çalışan kiosk sistemlerinde) yazdırma altyapısının temelini **CUPS (Common Unix Printing System)** oluşturur. 

CUPS, USB veya ağa bağlı termal yazıcıları işletim sistemine birer kuyruk olarak bağlar ve komut satırından `lp` veya `lpr` araçlarıyla hiçbir grafik arayüz olmadan sessizce ham veri basılmasını sağlar.

---

## 1. CUPS Web Arayüzünü Açma ve Yazıcı Tanımlama

macOS ve Linux'ta CUPS varsayılan olarak `http://localhost:631` portu üzerinden bir web yönetim paneli sunar.

1. **macOS'ta CUPS Web Panelini Aktif Etme:**
   Terminali açıp şu komutu çalıştırın:
   ```bash
   cupsctl WebInterface=yes
   ```
2. Tarayıcınızda `http://localhost:631/admin` adresine gidin.
3. **"Add Printer"** butonuna tıklayın ve USB ile bağlı termal yazıcınızı seçin.
4. Model seçimi ekranında ham veri basabilmek için **"Raw" > "Raw Queue"** seçeneğini işaretleyin. Böylece CUPS hiçbir filtreleme veya dönüştürme yapmadan baytları doğrudan yazıcıya iletir.

---

## 2. Terminalden ve Node.js Üzerinden Ham Baskı (`lp` / `lpr`)

Yazıcınız CUPS üzerinde `Termal_Kasa` adıyla tanımlandıktan sonra, terminalden doğrudan dosya veya bayt akışı basabilirsiniz:

```bash
# Ham metin dosyasını doğrudan sessiz yazdır
lp -d Termal_Kasa -o raw fis.txt

# veya pipe ile doğrudan komut gönderme
echo -e "\x1B\x40Fis Basligi\n\x1D\x56\x42\x00" | lp -d Termal_Kasa -o raw
```

### Node.js Child Process ile Entegrasyon:
```javascript
import { exec } from 'child_process';
import fs from 'fs';

export function printViaCups(printerQueueName, binaryBuffer) {
  const tempPath = `/tmp/receipt_${Date.now()}.bin`;
  fs.writeFileSync(tempPath, binaryBuffer);

  exec(`lp -d ${printerQueueName} -o raw ${tempPath}`, (error) => {
    fs.unlinkSync(tempPath); // Geçici dosyayı sil
    if (error) console.error('CUPS baskı hatası:', error.message);
  });
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### macOS'ta CUPS ile yazdırırken kağıdın altında neden metrelerce boşluk kalıyor?
**Yazıcı "Raw Queue" yerine standart bir sürücüyle tanımlandığında CUPS varsayılan olarak A4 veya Letter kağıt boyutu atar.** Bu sorunu çözmek için ya yazıcıyı mutlaka "Raw Queue" olarak tanımlamalı ya da `lp -o media=Custom.80x200mm` parametresiyle kağıt uzunluğunu sınırlandırmalısınız.

### Raspberry Pi kiosk sisteminde internet kesildiğinde CUPS kuyruğu ne yapar?
**CUPS yerel bir biriktiricidir (Local Spooler).** İnternet bağlantısı olmasa bile gelen yazdırma işlerini yerel diskte kuyruklar; yazıcı açıldığı veya hazır olduğu anda sırayla basar, hiçbir iş kaybolmaz.

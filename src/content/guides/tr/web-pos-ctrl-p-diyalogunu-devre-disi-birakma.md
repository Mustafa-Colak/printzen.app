---
title: "Masaüstü Web POS'larda Ctrl+P Diyaloğunu Tamamen Devre Dışı Bırakma"
description: "Web tabanlı kasa ve sipariş sistemlerinde tarayıcı yazdırma önizleme penceresini engellemenin 3 yolu: Chrome Kiosk, Electron.js ve WebSocket Agent."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: disabling-ctrl-p-print-preview-dialog-web-pos
---

Web teknolojileriyle (React, Vue, Angular) geliştirilen modern POS ve sipariş yazılımlarının en büyük handikabı, tarayıcının yerleşik `window.print()` fonksiyonunun her çağrıldığında ekranın ortasına **Ctrl+P Yazdırma Penceresi** fırlatmasıdır. Bu pencere hem satışı yavaşlatır hem de kasiyerin yanlışlıkla başka bir yazıcı veya kağıt boyutu seçerek sistemi bozmasına zemin hazırlar.

Bu rehberde, Web POS projelerinde Ctrl+P diyaloğunu tamamen devre dışı bırakmanın mimari yöntemlerini kıyaslıyoruz.

---

## 1. Yöntem Kıyaslama Tablosu

| Yöntem | Diyaloğu Engeller mi? | Kurulum Kolaylığı | Çoklu Yazıcı Desteği | Ham ESC/POS Desteği |
|---|---|---|---|---|
| **Chrome `--kiosk-printing`** | ✅ Evet | Çok Kolay (Kısayol Parametresi) | ❌ Hayır (Yalnızca varsayılan) | ❌ Hayır (HTML/Raster) |
| **Electron.js `webContents.print`** | ✅ Evet (`silent: true`) | Orta (Masaüstü Uygulaması) | ✅ Evet (Cihaz adına göre) | ❌ Kısmi |
| **Printzen Yerel WebSocket Ajanı** | ✅ Evet | Kolay (Arka Plan Servisi) | ✅ Sınırsız Yazıcı | ✅ **Tam Donanım Kontrolü** |

---

## 2. Electron.js Kullanarak Sessiz Yazdırma (`silent: true`)

Eğer Web POS uygulamanızı Electron ile paketliyorsanız, `silent: true` parametresiyle yazdırma penceresini tamamen görünmez kılabilirsiniz:

```javascript
// Electron Main Process (main.js)
ipcMain.on('print-receipt', (event, printerDeviceName) => {
  const win = BrowserWindow.getFocusedWindow();
  
  win.webContents.print({
    silent: true,              // Ctrl+P diyaloğunu açma!
    printBackground: true,
    deviceName: printerDeviceName // Hedef yazıcı adı
  }, (success, failureReason) => {
    if (!success) console.error('Baskı başarısız:', failureReason);
  });
});
```

---

## 3. Saf Web İçin En İdeal Çözüm: WebSocket Tray Agent

Uygulamanızı Electron'a bağımlı kılmak istemiyorsanız ve doğrudan buluttan (SaaS) çalıştırmak istiyorsanız, istemci bilgisayara kurulan 2 MB'lık hafif bir arka plan servisi (Printzen Agent) mükemmel bir köprü kurar:

```
[ Web POS (Bulut Tarayıcı) ] ──► [ WebSocket: localhost:18570 ] ──► [ Termal Yazıcı (Raw Spooler) ]
```

Web sayfası `window.print()` çağırmak yerine yerel WebSocket portuna tek bir JSON mesajı fırlatır; ekranda hiçbir pencere belirmeden fiş milisaniyeler içinde basılır.

---

## 4. Sıkça Sorulan Sorular (SSS)

### Normal bir web sayfasında JavaScript ile `window.print()` penceresi tamamen kapatılabilir mi?
**Hayır, hiçbir tarayıcı (Chrome, Firefox, Safari) saf web sayfalarının güvenlik sandbox'ını delip kullanıcı onayı olmadan fiziksel yazıcıya erişmesine izin vermez.** Bu kısıtlamayı aşmak için tarayıcının ya `--kiosk-printing` bayrağıyla başlatılması ya da bilgisayarda bir yerel arka plan servisinin bulunması teknik olarak zorunludur.

### Kiosk Printing ile sessiz basarken kağıt kesme nasıl otomatik tetiklenir?
**Windows Yazıcı Tercihleri > Gelişmiş Ayarlar sekmesinden "Baskı Sonunda Kağıdı Kes" seçeneğini aktif etmelisiniz.** Böylece Chrome HTML çıktısını yazıcı sürücüsüne ilettiğinde, sürücü işin sonuna otomatik kağıt kesme komutunu ekler.

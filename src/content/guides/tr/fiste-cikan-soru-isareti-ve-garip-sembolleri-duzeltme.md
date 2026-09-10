---
title: "Termal Fişte Çıkan '?' ve Garip Sembolleri Düzeltme Rehberi"
description: "Fiş yazıcıdan metin yerine soru işareti, Çince karakterler, sonsuz kağıt akışı veya bozuk harfler çıkmasının nedenleri ve 4 adımlı kesin çözüm protokolü."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: fixing-question-marks-and-garbled-symbols-receipts
---

Termal fiş yazıcılarla çalışırken en sinir bozucu an, gönderdiğiniz fiş metni yerine kağıtta yüzlerce **soru işareti (`????`), Çince karakterler, garip matematik sembolleri veya durmaksızın metrelerce boş kağıt fırlatılmasıdır**.

Bu rehberde, fişte çıkan sembol anomalilerini 4 ana kategoride sınıflandırıyor ve adım adım çözüm protokolünü sunuyoruz.

---

## 1. Belirti 1: Tüm Türkçe Harfler Yerine "?" Basılması

### Nedeni:
Web uygulamanızdan gönderilen metin UTF-8 olarak kalmıştır veya yazılımınızın kod sayfası dönüştürücüsü tanımadığı karakterlerin yerine varsayılan güvenlik karakteri olarak `0x3F` (`?`) basmaktadır.

### Çözüm:
Yazdırma akışının en başına yazıcının Türkçe kod sayfası komutunu ekleyin (`ESC t 18` -> `0x1B, 0x74, 18`) ve string'i `iconv-lite` ile `cp857` bayt dizisine dönüştürerek gönderin.

---

## 2. Belirti 2: Anlamsız Çince / Japonca Karakterlerin Çıkması

### Nedeni:
Yazıcının **Dahili Çince Modu (FS & / Chinese Mode)** açık kalmıştır veya gönderdiğiniz 2 baytlık UTF-8 dizileri yazıcı tarafından Çince GBK / Big5 çift baytlık karakter olarak yorumlanmaktadır.

### Çözüm:
Her fişin en başında Çince modunu kapatma komutunu (**FS .**) gönderin:
```javascript
// ESC/POS Çince Karakter Modunu Kapatma (FS .)
const disableChineseMode = [0x1C, 0x2E];
```

---

## 3. Belirti 3: Yazıcının Metrelerce Boş Kağıt Fırlatması (Runaway Feed)

### Nedeni:
Seri port (RS232) veya Bluetooth bağlantısında **Baud Rate (İletişim Hızı)** uyuşmazlığı vardır. Örneğin bilgisayar 115200 baud ile veri basarken yazıcı 9600 baud ile dinliyorsa, gelen sinyaller gürültü (noise) olarak algılanır ve yazıcı komutları sürekli kağıt besleme olarak yorumlar.

### Çözüm:
Yazıcının FEED tuşuna basılı tutarak açıp Self-Test raporu alın. Raporda yazan `Baudrate: 9600` veya `19200` değerini işletim sistemi seri port ayarlarında birebir aynı yapın.

---

## 4. Belirti 4: Metinlerin Sağa Doğru Basamak Gibi Kayması

```
Satir 1
       Satir 2
              Satir 3
```

### Nedeni:
Yazıcı ESC/POS standardında satır sonu için hem **CR (Carriage Return - 0x0D)** hem de **LF (Line Feed - 0x0A)** beklerken, uygulamanız yalnızca `\n` (LF) göndermektedir.

### Çözüm:
Metinlerinizdeki `\n` karakterlerini `\r\n` ile değiştirin veya yazıcıya otomatik satır başı yapma komutu (`ESC 2` veya DIP switch ayarı) verin.

---

## 5. Sıkça Sorulan Sorular (SSS)

### Yazıcı durmaksızın anlamsız semboller basıyor, nasıl durdurabilirim?
**Yazıcının güç anahtarını derhal kapatın, USB/Ethernet kablosunu çekin ve bilgisayardaki Windows Print Spooler kuyruğunu temizleyin.** Windows Hizmetler (services.msc) altından "Yazdırma Biriktiricisi" servisini durdurun, `C:\Windows\System32\spool\PRINTERS` klasöründeki tüm geçici dosyaları silin ve servisi yeniden başlatın.

### Printzen tüm bu sembol ve karakter hatalarını otomatik engeller mi?
**Evet, Printzen Akıllı Sürücü Motoru; Çince modunu kapatma, satır sonu normalizasyonu (\r\n), otomatik kod sayfası eşleme ve baud rate senkronizasyonunu sürücü düzeyinde otomatik uygular.**

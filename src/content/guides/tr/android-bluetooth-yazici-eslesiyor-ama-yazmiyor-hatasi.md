---
title: "Android Telefonda Bluetooth Yazıcı Eşleşiyor Ama Yazmıyor Hatası ve Çözümü"
description: "Android telefon veya tablette termal fiş yazıcı eşleşmiş görünmesine rağmen yazdırmama sorunu. SPP UUID çakışması, izin blokajı ve soket onarımı."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: android-bluetooth-printer-paired-but-not-printing
---

Saha kuryelerinin ve mobil satış elemanlarının en sık yaşadığı kabus: Telefonun Bluetooth ayarlarında termal yazıcı **"Eşleştirildi" (Paired)** olarak görünmektedir; ancak POS uygulamasına girip "Yazdır" butonuna basıldığında cihaz hiç tepki vermez veya "Yazıcıyla bağlantı kurulamadı" hatası fırlatır.

Bu sorun yazıcının bozuk olduğunu göstermez. Sorunun %99'u Android'in **SPP (Seri Port Profili) soket kilitlenmesi, arka planda başka bir cihazın bağlantıyı rehin tutması veya Android 12+ Nearby Devices izin blokajından** kaynaklanır.

---

## 1. Adım Adım Sorun Giderme Protokolü

### Adım 1: Diğer Cihazların Bağlantısını Kontrol Edin
Bluetooth Classic termal yazıcılar **aynı anda yalnızca tek bir cihaza** bağlanabilir. Eğer yazıcı yakındaki başka bir personelin telefonuna veya tablete bağlıysa, sizin cihazınız eşleşmiş görünse bile soket açamaz (`Socket closed / Connection refused`).
- Çevredeki diğer cihazların Bluetooth'unu kapatın.
- Yazıcının güç düğmesini kapatıp 5 saniye bekleyin ve tekrar açın.

### Adım 2: Standart SPP UUID ile Soket Açın
Android Java/Kotlin uygulamasında yazıcıya bağlanırken evrensel Serial Port Profile UUID'si kullanılmalıdır:
```java
// Evrensel Standart SPP UUID
UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
BluetoothSocket socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
socket.connect();
```
Eğer standart soket bağlantısı `IOException` veriyorsa, Android'in gizli yansıtma (reflection) metodunu deneyin:
```java
Method m = device.getClass().getMethod("createRfcommSocket", new Class[] {int.class});
socket = (BluetoothSocket) m.invoke(device, 1); // Port 1 üzerinden bağlan
socket.connect();
```

---

## 2. Android 12+ İzin Kontrolü

Android 12 ve üzerinde uygulamanın "Konum" izninden ziyade **"Civardaki Cihazlar" (BLUETOOTH_CONNECT)** iznine sahip olması zorunludur.
1. Telefonunuzun **Ayarlar > Uygulamalar > [POS Uygulamanız] > İzinler** menüsüne gidin.
2. "Civardaki Cihazlar" izninin açık olduğundan emin olun.

---

## 3. Sıkça Sorulan Sorular (SSS)

### Yazıcıyı Bluetooth menüsünden silip tekrar eşleştirmek işe yarar mı?
**Evet, Android'in Bluetooth önbelleği (Bonding Cache) zaman zaman bozulabilir.** Ayarlar > Bluetooth menüsünden yazıcının yanındaki dişli simgesine basıp "Eşleştirmeyi Unut" deyin. Yazıcıyı kapatıp açın ve `1234` veya `0000` PIN koduyla sıfırdan eşleştirin.

### Printzen mobil uygulaması bu bağlantı kopmalarını nasıl engelliyor?
**Printzen Android Servisi arka planda soketi sürekli izler ve kilitlenen RFCOMM kanallarını otomatik temizler (Auto-Socket Recovery).** Sinyal koptuğunda kullanıcıya hata göstermeden soketi yeniden inşa eder ve bekleyen fişi anında basar.

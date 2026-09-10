---
title: "Bluetooth Termal Yazıcı Bağlantı ve İletişim Sorunları Rehberi: Android, iOS ve Windows Sorun Giderme"
description: "Bluetooth termal yazıcı eşleşiyor ama yazdırmıyor mu? PIN kodu hataları (0000/1234), Android 12+ izinleri, iOS MFi kısıtları ve uyku modu kopmalarının kesin çözümü."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: bluetooth-thermal-printer-troubleshooting-guide
---

Taşınabilir mobil termal yazıcılar; saha satış ekipleri, kuryeler, otopark görevlileri ve mobil servis elemanları için vazgeçilmez donanımlardır. Ancak Bluetooth tabanlı mobil yazdırma ekosistemi, sahada en çok teknik arıza ve destek talebi oluşturan alandır:

- *"Yazıcı telefonla eşleşti görünüyor ama uygulamadan basınca tepki vermiyor."*
- *"PIN kodunu giriyorum (0000 veya 1234), 'Eşleştirilemedi' hatası veriyor."*
- *"İlk fişi basıyor, 5 dakika sonra bağlantı kopuyor ve telefonu yeniden başlatmadan bağlanmıyor."*
- *"Android'i güncelledik, POS uygulaması artık yazıcıyı hiç görmüyor."*

Bu problemler donanımsal bozukluktan ziyade; **Bluetooth profil uyumsuzlukları (SPP vs BLE), mobil işletim sistemi güvenlik izinleri (Android 12+ Runtime Permissions), iOS MFi kısıtlamaları ve yazıcı güç tasarrufu (Sleep Mode) parametrelerinden** kaynaklanır.

Bu kapsamlı teknik sorun giderme rehberinde, mobil termal yazıcılarda yaşanan tüm bağlantı krizlerini işletim sistemi bazında teşhis edip çözüme kavuşturuyoruz.

---

## 1. Bluetooth Protokolü Ayrımı: Classic SPP vs. BLE (Bluetooth Low Energy)

Sorun gidermenin ilk adımı, yazıcınızın hangi Bluetooth standardıyla çalıştığını bilmektir:

| Özellik | Bluetooth Classic (SPP - Seri Port Profili) | Bluetooth Low Energy (BLE 4.0 / 5.0) |
|---|---|---|
| **Eşleştirme Gereksinimi** | Telefonun Bluetooth menüsünden PIN ile eşleştirilir | Telefon menüsünde eşleştirilmez; doğrudan uygulama içinden bağlanır |
| **İletişim Tipi** | Sanal Seri Port (RFCOMM Socket) | GATT Servisleri & Karakteristikler |
| **Android Desteği** | Mükemmel (Geleneksel POS standardı) | Mükemmel |
| **Apple iOS (iPhone/iPad)** | ❌ **Çalışmaz** (Apple MFi çipi lisansı zorunludur) | ✅ **Tam Uyumlu** (Tüm iOS cihazlarda çalışır) |
| **Hız ve Paket Boyutu** | Yüksek veri akışı (Kısıtlama yok) | 20-Bayt MTU paketleme zorunluluğu |

> ⚠️ **En Kritik iOS Kuralı:** Eğer ucuz bir taşınabilir yazıcı satın aldıysanız ve üzerinde Apple logosu / "MFi Certified" ibaresi yoksa, bu yazıcı iPhone ile Bluetooth Classic SPP üzerinden asla haberleşemez. iPhone ve iPad ile sadece **BLE destekli** yazıcılar veya MFi lisanslı modeller çalışabilir.

---

## 2. Android 12, 13 ve 14 İzin Krizleri: Yazıcı Görünmüyor Hatası

Google, Android 12 (API düzeyi 31) ile birlikte Bluetooth izin mimarisini baştan aşağı değiştirdi. Eski POS uygulamaları Android 12 ve üzeri telefonlara yüklendiğinde yazıcıyı tarayamaz veya bağlanamaz.

### Gerekli İzinler (AndroidManifest.xml):
```xml
<!-- Android 11 ve öncesi için -->
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- Android 12+ (API 31+) için Zorunlu İzinler -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" 
                 android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

### Kullanıcı Tarafında Çözüm Adımları:
1. Telefonun **Ayarlar > Uygulamalar > [POS Uygulamanız] > İzinler** menüsüne gidin.
2. **"Civardaki Cihazlar" (Nearby Devices)** izninin "İzin Verildi" olarak işaretlendiğinden emin olun.
3. Android 11 ve öncesinde telefonun **Konum (GPS)** servisi kapalıysa Bluetooth taraması sonuç vermez; Konum servisinin açık olduğunu kontrol edin.

---

## 3. PIN Kodu ve Eşleştirme Hataları (0000 vs 1234)

Bluetooth Classic yazıcılarda eşleştirme esnasında PIN kodu reddediliyorsa:
1. **Fabrika Standartları:** Taşınabilir termal yazıcıların %95'i varsayılan olarak `1234` veya `0000` PIN kodunu kullanır. Nadir modellerde `8888` veya `1111` geçerlidir.
2. **Eşleşme Tablosu Doluluğu:** Yazıcının dahili belleğinde kayıtlı cihaz sayısı dolmuş olabilir (genelde maksimum 4 veya 8 cihaz). Yazıcının FEED tuşuna basılı tutarak Self-Test fişi çıkartın ve fabrika sıfırlaması (Reset) yapın.
3. **Mevcut Bağlantı Çakışması:** Bluetooth yazıcılar aynı anda **yalnızca tek bir ana cihaza (Master)** bağlanabilir. Yazıcı yakındaki başka bir garsonun tabletine veya kuryenin telefonuna bağlıysa, sizin cihazınız eşleşmeyi reddeder. Diğer cihazların Bluetooth'unu kapatın.

---

## 4. Uyku Modu (Auto-Sleep) ve Bağlantı Kopması Sorunu

Mobil termal yazıcılar batarya ömrünü korumak amacıyla varsayılan olarak 2 veya 3 dakika işlem yapılmadığında **"Derin Uyku Modu"na (Deep Sleep)** geçer.

Uyku moduna geçen bir yazıcı Bluetooth radyo devresini kapatır. Kullanıcı bir sonraki satışı yapmaya çalıştığında uygulama "Cihaz Bulunamadı" hatası verir.

### Kalıcı Çözüm:
1. **Yazıcı Yapılandırma Aracı:** Yazıcı üreticisinin (Xprinter, Hoin, Goojprt) Windows ayar yazılımını indirerek USB kablosu ile bağlayın.
2. **Sleep Timer Kapatma:** "Auto Sleep Timer" veya "Power Management" değerini `0` (Devre Dışı / Disabled) veya maksimum süreye (60 dakika) çekin.
3. **Yazılımsal Heartbeat (Keep-Alive):** Mobil POS uygulamanızın arka planında her 45 saniyede bir yazıcıya 1 baytlık boş durum sorgulama komutu (`DLE EOT 1` -> `0x10 0x04 0x01`) göndererek yazıcının uyanık kalmasını sağlayın.

---

## 5. Windows Bluetooth COM Port Sanallaştırma Hataları

Windows bilgisayarlarda bir Bluetooth termal yazıcı eşleştirildiğinde Windows buna otomatik bir sanal seri port (**Incoming / Outgoing COM Port**) atar:

1. Windows Ayarları > Bluetooth > Diğer Bluetooth Seçenekleri > **COM Bağlantı Noktaları** sekmesini açın.
2. **Giden (Outgoing)** olarak tanımlanan COM port numarasını not edin (Örn: `COM4`).
3. POS veya etiket yazılımınızda yazıcı tipi olarak "Seri Port / COM" seçip bu port numarasını ve baud rate değerini (genelde `9600` veya `115200`) tanımlayın.

---

## 6. Sıkça Sorulan Sorular (SSS)

### Yazıcı Bluetooth listesinde görünüyor ama bağlanırken "Hata: Bağlantı reddedildi" diyor?
**Bu durum %99 olasılıkla yazıcının halihazırda başka bir telefona veya tablete bağlı olmasından kaynaklanır.** Bluetooth termal yazıcılar noktadan-noktaya (P2P) çalışır ve aynı anda sadece tek bir aktif veri kanalı açabilir. Çevredeki diğer personelin telefonlarında Bluetooth'u kapatıp yazıcıyı kapatıp açarak tekrar deneyin.

### iPhone'um Bluetooth menüsünde taşınabilir fiş yazıcıyı neden hiç görmüyor?
**Apple iOS, Bluetooth Classic SPP (Seri Port) protokolünü MFi çipi olmayan standart çevre birimlerine kapatmıştır.** Yazıcınız BLE (Bluetooth Low Energy) moduna sahip değilse, iPhone'un yerel Bluetooth arama ekranında asla görünmez. Bu yazıcıları iPhone ile kullanmak için App Store'dan üreticinin özel BLE uygulamasını açmalı veya BLE destekli bir yazıcıya geçmelisiniz.

### Bluetooth yazıcı ilk 3-4 satırı basıp aniden duruyor ve kırmızı ışık yakıyor, sebebi nedir?
**Bu hata yazıcı kafa aşırı ısınmasından (Overheat), düşük pil seviyesinden veya veri tamponu (Buffer) taşmasından kaynaklanır.** Yazıcı pille çalışırken batarya voltajı kritik seviyenin altına düştüğünde motoru besleyemez ve baskıyı yarıda keser. Cihazı şarja takıp tekrar deneyin ve gönderilen verinin 20-baytlık dilimler halinde iletildiğinden emin olun.

### Printzen mobil uygulaması Bluetooth bağlantı kopmalarını nasıl önlüyor?
**Printzen Mobil Yazdırma Servisi akıllı bir "Otomatik Yeniden Bağlanma ve Kuyruklama" (Auto-Reconnect & Retry Queue) mekanizmasına sahiptir.** Yazıcı uykuya geçtiğinde veya operatör kapsama alanı dışına çıktığında yazdırma işleri kaybolmaz; yazıcı tekrar kapsama alanına girdiği anda arka planda otomatik olarak bağlanır ve bekleyen tüm fişleri basar.

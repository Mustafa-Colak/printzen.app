# Printzen.app — 50 Ana Konu ve Kategori Mimarisi (İçerik Omurgası)

Bu belge, **Printzen.app** (Bulut Tabanlı Termal Fiş & Etiket Yazdırma SaaS ve Web SDK) platformunun uzun vadeli içerik stratejisini, kategori omurgasını ve silolanmış (*topic clusters*) ana konu kümelerini tanımlar. 

Belirlenen 50 ana konu başlığının her biri; altında onlarca bağımsız donanım incelemesi, yazılım geliştirici kılavuzu, hazır kod örnekleri (JS/Python/PHP/Dart) ve sorun giderme rehberleri barındıracak birer **"İçerik Hub'ı"** olarak kurgulanmıştır.

---

## 🖨️ A. Termal Yazıcı Komut Dilleri & Protokoller (1 - 8)

1. **ESC/POS Komut Dili & Fiş Yazıcı Programlama Standartları**
   - Epson tarafından geliştirilen endüstri standardı ESC/POS protokolü, hex/ASCII kontrol karakterleri, font stilleri, satır aralıkları, otomatik kağıt kesici (GS V) ve para çekmecesi tetikleme (DLE DC4) komutları.
2. **Zebra ZPL & ZPL II Etiket Programlama Dili**
   - Endüstriyel barkod ve kargo etiketleri için ZPL II mimarisi (^XA, ^XZ, ^FO, ^FD), etiket orijin koordinat matematiği, gömülü ölçeklenebilir fontlar, kutu/çizgi çizimleri ve DPI dönüşümleri.
3. **TSPL / TSPL2 Programlama Dili**
   - TSC, Xprinter, Gprinter ve Godex masaüstü etiket yazıcılarının kullandığı TSPL dili; SIZE, GAP, CLS, TEXT, BARCODE komutları ve sensör kalibrasyon yönergeleri.
4. **CPCL Mobil Saha Yazdırma Protokolü**
   - Kurye, lojistik ve saha personeli taşınabilir el yazıcılarında kullanılan satır odaklı CPCL dili, batarya koruma optimizasyonları ve mobil etiket formatlama.
5. **EPL & EPL2 Eski Nesil Etiket Mimarisi (Legacy Support)**
   - Eltron kökenli eski yazıcılar için EPL komut yapısı, N/q/Q/A/B komutları ve modern ZPL/TSPL sistemlerine kod kaybı olmadan dönüştürme metotları.
6. **Star Line & StarPRNT Protokolleri**
   - Star Micronics masaüstü ve mutfak yazıcılarının emülasyon farkları, Star Line Mode komutları ve ESC/POS uyumluluk katmanları.
7. **Satır Modu (Line Mode) vs Sayfa/Raster Modu (Page Mode)**
   - Belleği kısıtlı cihazlarda satır satır akıtılan veri ile tüm fişin 1-bit monokrom bitmap tamponuna (framebuffer) işlenip tek seferde basılması arasındaki hız ve hafıza farkları.
8. **Karakter Kod Sayfaları (Code Pages) & Türkçe Karakter Mimarisi**
   - Termal yazıcılarda `ş, ğ, ı, ö, ü, ç` harflerinin bozulmadan basılması: CP857 (DOS Turkish), Windows-1254, ISO-8859-9 ve modern UTF-8 desteği olan yazıcılarda donanımsal kod sayfası seçimi (ESC t n).

---

## 🔌 B. Bağlantı Teknolojileri & Donanım Arayüzleri (9 - 16)

9. **Web Bluetooth API ile Tarayıcıdan Direkt Termal Baskı**
   - Chrome, Edge ve Opera tarayıcılarda hiçbir yerel sürücü veya köprü yazılım kurmadan doğrudan Web Bluetooth API ile yazıcıya bağlanma, GATT servisleri ve TX/RX veri iletimi.
10. **WebUSB & WebHID ile Kablolu Doğrudan Donanım İletişimi**
    - USB kablosuyla bağlı yazıcıları tarayıcı seviyesinde Vendor ID (VID) ve Product ID (PID) ile talep etme, USB endpoint yapılandırması ve sürücüsüz masaüstü web baskısı.
11. **Ağ & Ethernet (Raw TCP/IP Port 9100) Soket Mimarisi**
    - Yerel ağdaki (LAN) termal yazıcılara doğrudan port 9100 Raw Socket açarak işletim sistemi kuyruklarını bypass eden milisaniyelik doğrudan veri akışı ve IP sabitleme.
12. **Wi-Fi Termal Yazıcı Altyapısı & Kurumsal Ağ Güvenliği**
    - Kablosuz restoran ve depo yazıcılarının WPA2/WPA3 kurumsal ağlara tanıtılması, IP çakışmalarını önleme, DHCP kiralama süresi yönetimi ve uyku modu ağ kopmaları.
13. **Bluetooth Eşleşme (Pairing) Protokolleri: SPP vs BLE GATT**
    - Klasik Bluetooth Seri Port Profili (SPP / RFCOMM) ile Bluetooth Düşük Enerji (BLE) arasındaki mimari farklar, mobil işletim sistemi izinleri ve eşleşme PIN senaryoları.
14. **Seri Port (RS-232 / COM Port) & Sanal COM Çözümleri**
    - Endüstriyel barkod terazileri, eski kasa arkası terminaller, baud rate (9600-115200), parity, stop bit ve FTDI/CH340 USB-Seri dönüştürücü kararlılığı.
15. **Çoklu İstasyon & Paralel Yazıcı Yönlendirme (Routing)**
    - Bir satış işleminin tek tıkla hem kasiyer fişine (USB), hem sıcak mutfağa (Ethernet), hem soğuk meze/bara (Wi-Fi) eşzamanlı ve hatasız dağıtılması.
16. **Sanal Yazıcı Simülatörleri & Geliştirici Test Ortamları**
    - Fiziksel donanım masada yokken yazılımcıların ESC/POS ve ZPL kodlarını tarayıcıda veya terminalde piksel piksel önizlemesini sağlayan emülatör araçları.

---

## ☁️ C. Bulut Yazdırma (Cloud Print) & Sessiz Baskı Mimarisi (17 - 24)

17. **Sessiz Yazdırma (Silent / Raw Printing) Mimarisi**
    - Tarayıcının standart `window.print()` / Ctrl+P diyalog penceresini (A4 marjinleri, başlık/tarih ekleri) tamamen devre dışı bırakıp doğrudan ham termal byte gönderme yöntemleri.
18. **Cloud Print Agent & Arka Plan Masaüstü Servisleri**
    - İşletmenin bilgisayarında arka planda sessizce çalışan Windows Tray ve macOS Menubar ajanları, WebSocket bağlantıları ve yerel yazıcı havuzu yönetimi.
19. **Webhook & MQTT ile Uzaktan Anlık Yazdırma**
    - Bulut ERP/e-ticaret sunucusunda oluşan bir siparişin, dükkandaki bilgisayar veya akıllı yazıcıya MQTT/WebSocket ile sıfır gecikmeyle iletilmesi ve anında basılması.
20. **Mixed Content Güvenliği & HTTPS-Localhost İletişim Engelleri**
    - Güvenli HTTPS web sitesinden kullanıcının yerel ağındaki güvensiz HTTP/ws yazıcı IP'sine bağlanırken tarayıcıların uyguladığı Mixed Content güvenlik blokajlarını aşma stratejileri (WSS / Yerel TLS Sertifikasyonu).
21. **Offline Kuyruklama & Bağlantı Kesintisi Dayanıklılığı**
    - İnternet veya Wi-Fi koptuğunda satışın durmaması için fişlerin tarayıcı IndexedDB veya yerel belleğe alınması; ağ geldiğinde otomatik ardışık basım (Retry mechanism).
22. **Zincir Mağazalar & Çok Şubeli Merkezi Baskı Yönetimi**
    - Yüzlerce şubesi olan perakende ve franchise markalarında tüm şube yazıcılarının bulut panelden online/offline durumunun izlenmesi ve merkezi şablon güncellemesi.
23. **İki Yönlü Donanım Telemetrisi (Bi-Directional Status)**
    - Yazıcıdan geri bildirim alma: Kağıt bitti (Paper Out), kapak açık (Cover Open), kafa aşırı ısındı (Head Overheat) ve kağıt azaldı (Paper Near End) gerçek zamanlı uyarıları.
24. **Bulut Yazdırma REST API & Güvenlik Mimarisi**
    - Üçüncü parti yazılımların tek bir cURL / POST isteğiyle dükkandaki yazıcıdan fiş çıkarmasını sağlayan REST API standartları, API Key ve HMAC imza güvenliği.

---

## 🛒 D. E-Ticaret, Pazaryeri & Kargo Yazdırma Otomasyonu (25 - 32)

25. **WooCommerce Otomatik Termal Fiş ve Kargo Etiketi Yazdırma**
    - WooCommerce mağazasında yeni sipariş durumuna ("İşleniyor", "Tamamlandı") göre depoda anında 100x150 mm kargo barkodu, mağazada adisyon basımı.
26. **Shopify & Bulut E-Ticaret Fiş Entegrasyonu**
    - Shopify Order Webhook altyapısıyla fiziksel mağaza ve depolara anında sipariş fişi akışı, paketleme kontrol listesi (Packing Slip) otomasyonu.
27. **Pazaryeri Kargo Barkodu Otomasyonu (Trendyol, Hepsiburada, Amazon)**
    - Pazaryerlerinden gelen A4 formatındaki karmaşık PDF etiketlerin 100x150 mm termal etiket ölçüsüne otomatik kırpılması, döndürülmesi ve yazdırılması.
28. **Yemek Sipariş Platformları Entegrasyonu (Yemeksepeti, Getir, Trendyol Yemek)**
    - 3 farklı platformun tablet ve bildirimlerini tek bir merkezde toplayıp tek bir 80 mm termal mutfak yazıcısına standart adisyon formatında dökme.
29. **GİB E-Arşiv Fatura & Bilgi Fişi Termal Formatlama**
    - Gelir İdaresi Başkanlığı (GİB) mevzuatına uygun 58 mm ve 80 mm rulo kağıt üzerinde e-arşiv fatura bilgi fişi tasarımı, zorunlu mali alanlar ve QR karekod basımı.
30. **E-İrsaliye, Koli İçi Sevk & GS1-128 Barkod Basımı**
    - Toptan ve B2B sevkiyatlarda koli dışı etiketleri, SSCC (Seri Sevkiyat Konteyner Kodu) barkodları ve zincir market teslimat etiketleri.
31. **Kargo Entegratörleri & Taşıyıcı API Formatları**
    - Yurtiçi Kargo, Aras Kargo, MNG, Sendeo, PTT ve HepsiJET API'lerinden dönen ZPL ve PDF etiket verilerini ölçeklendirerek termal yazıcıya gönderme.
32. **Müşteri İade & Depo Kabul Barkodları**
    - E-ticaret iade süreçlerinde müşteriye gönderilen dinamik QR kodlar ve depoda ürün kabul anında tek tuşla basılan kontrol barkodları.

---

## 🏢 E. Sektörel Kullanım Senaryoları & İş Akışları (33 - 40)

33. **Restoran, Kafe & Bar Mutfak Adisyon Mimarisi**
    - Masa numarası, sipariş saati, garson adı, porsiyon ve özel notlar içeren dayanıklı adisyon tasarımları; mutfak ve bar yazıcı ayrıştırması.
34. **Perakende Hızlı Satış (Fast-Retail) & Market Kasaları**
    - Yüksek müşteri sirkülasyonunda 1 saniyenin altında 80 mm fiş kesme, barkodlu terazi çıktısı entegrasyonu ve promosyon kuponu basımı.
35. **Depo Toplama (Pick & Pack) & Mobil Koridor Etiketleme**
    - El terminali veya Android telefonla eşleşen kemer tipi mobil yazıcılarla depo rafları arasında gezerek ürün bazında barkod basımı.
36. **Otopark, Vale & Araç Yıkama Otomasyonu**
    - Araç giriş anında plaka, tarih ve barkod içeren giriş bileti basımı; çıkışta barkod okutularak süre ve ücret tahsilat fişi oluşturma.
37. **Sıramatik & Numaratör Biletleme Sistemleri**
    - Banka, noter ve kamu kurumlarında kiosk üzerinden sıra numarası, bekleyen kişi sayısı ve tahmini süre içeren bilet baskısı.
38. **Kuru Temizleme, Terzi & Teknik Servis Emanet Fişleri**
    - Yıkamaya, kimyasala ve neme dayanıklı özel kumaş/yırtılmaz etiketlere parça takip barkodu ve müşteri kabul formlarının basımı.
39. **Sağlık, Klinik, Veteriner & Laboratuvar Numune Etiketleme**
    - Kan tüpü, serum ve idrar numunelerine yapıştırılan 2D DataMatrix barkodlar, hasta takip bileklikleri ve sterilizasyon etiketleri.
40. **Etkinlik, Fuar, Kongre & Yaka Kartı Baskısı**
    - Kayıt bankolarında katılımcı geldiğinde 2 saniyede isim, unvan ve QR kodlu yaka kartı / giriş bileti termal baskısı.

---

## 🔧 F. Donanım Sorun Giderme, Kalibrasyon & Bakım (41 - 46)

41. **Bluetooth Yazıcı Eşleşme & İletişim Hataları Rehberi**
    - "Cihaz eşleşti ancak çıktı vermiyor", eşleşme PIN kodunun kabul edilmemesi (0000 / 1234), bağlantı zaman aşımı ve Bluetooth önbellek temizliği.
42. **Termal Baskı Kalitesi, Silik Yazma & Kararma Problemleri**
    - Baskının açık gri çıkması, barkodların okuyucular tarafından taranamaması, yazıcı koyuluk (darkness/density) ayarı ve kafa voltajı optimizasyonu.
43. **Kağıt Sıkışması & Otomatik Kesici (Auto-Cutter) Kilitlenmesi**
    - Fiş kağıdının bıçağa dolanması, kısmi kesim (partial cut) vs tam kesim (full cut) ayarları, giyotin bıçağın manuel kurtarma çarkı ile açılması.
44. **Etiket Kalibrasyonu & Sürekli Boş Etiket Fırlatma Hatası**
    - Yazıcının her baskıdan sonra fazladan 1 veya 2 boş etiket atması; Transmissive (Gap) ve Reflective (Black Mark) optik sensör kalibrasyonu.
45. **Termal Kafa (TPH) Ömrü, Temizlik Protokolü & Değişimi**
    - Etiket tozu ve yapışkan kalıntılarının kafa üzerinde oluşturduğu beyaz çizgiler; %99 saf izopropil alkol ile periyodik bakım ve kafa yanmasını önleme.
46. **Termal Rulo Kağıt Standartları (BPA Free, Eko vs Lamine)**
    - Fiş kağıtlarında sağlık standartları (Bisfenol A içermeyen rulolar), sıcağa/ışığa maruz kaldığında kararmayan lamine termal kağıt seçimi.

---

## 💻 G. Geliştirici (Developer) Araçları & SDK Mimarisi (47 - 50)

47. **JavaScript / TypeScript Modern Web Print SDK**
    - Web geliştiriciler için NPM üzerinden kurulan, Web Bluetooth, WebUSB ve WebSocket bağlantılarını tek bir soyutlama altında toplayan SDK yapısı.
48. **React, Next.js & Vue.js Termal Yazıcı Kancaları (Hooks)**
    - Modern SPA ve SSR web uygulamalarında yazıcı bağlantı durumunu, pil seviyesini ve baskı kuyruğunu yöneten `useThermalPrinter` reaktif kancaları.
49. **React Native & Flutter ile Mobil Yazdırma Kütüphaneleri**
    - Android ve iOS mobil uygulamalarda tek kod tabanıyla hem Bluetooth hem Wi-Fi termal yazıcılara doğrudan ESC/POS ve ZPL paketi gönderme.
50. **Termal Fiş Şablonlama & 1-Bit Monokrom Görsel Dithering Motoru**
    - HTML ve CSS ile tasarlanan karmaşık fatura/grafik şablonlarını termal kafanın basabileceği monokrom 1-bit siyah-beyaz piksel matrisine (Floyd-Steinberg dithering) dönüştürme.

---

## 🏆 10 Amiral Rehber (Pillar) ve 40 Destekleyici Yazı (Satellite) Piramidi

| Amiral Rehber (Tier-1 Pillar - 1.500 - 2.500+ Kelime) | Destekleyici Uzman Yazıları (Tier-2 Satellite - 800 - 1.200 Kelime) |
|---|---|
| **1. ESC/POS Komut Dili ve Fiş Yazıcı Programlama Rehberi** | • 1.1: Termal Yazıcıda Kağıt Kesme ve Para Çekmecesi Açma Komutları<br>• 1.2: ESC/POS ile Fiş Üzerine Logo ve Monokrom Resim Basma Yöntemleri<br>• 1.3: 58mm ve 80mm Fiş Kağıtlarında Karakter Kolon Sayısı Hesaplama<br>• 1.4: ESC/POS ile Fişe Karekod (QR Code) ve EAN-13 Barkod Ekleme |
| **2. Zebra ZPL Programlama ve Etiket Tasarım Rehberi** | • 2.1: ZPL ile Etikete Barkod ve Karekod Yerleştirme (^B3, ^BQ Komutları)<br>• 2.2: ZPL ile Etikete Şirket Logosu Basma: ^GF Grafik Formatı<br>• 2.3: 100x150 mm Kargo Barkod Şablonu Hazırlama (Örnek Kodlarla)<br>• 2.4: ZPL Etikette Metin Döndürme ve Koordinat Hizalama Kuralları |
| **3. Termal Yazıcılarda Türkçe Karakter Sorunu ve Kesin Çözüm Rehberi** | • 3.1: Termal Fiş Yazıcılarda CP857 Kod Sayfası Kurulumu ve Tablosu<br>• 3.2: Windows-1254 (Turkish) ile ESC/POS Türkçe Karakter Eşleme<br>• 3.3: Termal Yazıcı UTF-8 Desteklemiyorsa Ne Yapılmalı? Karakter Temizleme<br>• 3.4: Fişte Çıkan '?' ve Garip Sembolleri Düzeltme Rehberi |
| **4. Web Bluetooth ile Tarayıcıdan Direkt Termal Yazdırma Rehberi** | • 4.1: Web Bluetooth API Tarayıcı İzinleri ve Güvenlik Gereksinimleri<br>• 4.2: Bluetooth GATT Karakteristiğine ESC/POS Byte Array Gönderme<br>• 4.3: Bluetooth 20-Byte (MTU) Veri Parçalama ve Akış Kontrolü<br>• 4.4: iPhone ve iPad (iOS) Web Bluetooth ile Yazdırma Çözümleri |
| **5. Web Uygulamalarında Sessiz Yazdırma (Silent Print) Rehberi** | • 5.1: Google Chrome Kiosk Printing Modu Kurulumu ve Parametreleri<br>• 5.2: Masaüstü Web POS'larda Ctrl+P Diyaloğunu Tamamen Devre Dışı Bırakma<br>• 5.3: Yerel WebSocket Arka Plan Servisi (Tray Agent) ile Raw Yazdırma<br>• 5.4: macOS ve Linux'ta CUPS ile Sessiz Termal Baskı Konfigürasyonu |
| **6. WooCommerce Otomatik Termal Fiş ve Kargo Etiketi Yazdırma Rehberi** | • 6.1: WooCommerce Yeni Sipariş Düştüğünde Otomatik Fiş Tetikleme<br>• 6.2: WooCommerce Termal Fiş Şablonu Özelleştirme (Logo, Vergi, Notlar)<br>• 6.3: WooCommerce Mutfak ve Paket Servis Fişlerini Ayrı Yazıcılara Gönderme<br>• 6.4: WooCommerce Webhook ile Bulut Yazıcı Entegrasyonu |
| **7. E-Ticaret Pazaryeri Kargo Etiketi Yazdırma Rehberi** | • 7.1: Trendyol Siparişleri İçin 100x150 mm Termal Barkod Yazdırma<br>• 7.2: Hepsiburada Satıcı Paneli Toplu Kargo Etiketi Baskı Ayarları<br>• 7.3: A4 Kargo PDF'lerini 100x150 mm Termal Etikete Otomatik Dönüştürme<br>• 7.4: Amazon Türkiye FBA ve MFN Kargo Barkodu Standartları |
| **8. Restoran ve Kafe Mutfak Adisyon Yazdırma Mimarisi** | • 8.1: Mutfak ve Bar Yazıcılarını Masadan Bağımsız Ayrıştırma Kuralları<br>• 8.2: Yemeksepeti ve Getir Siparişlerini Tek Bir Adisyon Yazıcısında Toplama<br>• 8.3: Restoran Fiş Yazıcısına Sesli Uyarı (Buzzer) ve Alarm Bağlama<br>• 8.4: Masa Taşıma ve Sipariş İptal Fişlerinin Mutfak İletişimi |
| **9. Bluetooth Termal Yazıcı Bağlantı ve İletişim Sorunları Rehberi** | • 9.1: Android Telefonda Bluetooth Yazıcı Eşleşiyor Ama Yazmıyor Hatası<br>• 9.2: Termal Yazıcı Bluetooth Eşleşme PIN Kodu Sorunları (0000 / 1234)<br>• 9.3: Bluetooth Yazıcıda Satır Atlama ve Yarım Yazdırma Problemi<br>• 9.4: Taşınabilir Mobil Yazıcı Batarya ve Uyku Modu (Sleep) Yönetimi |
| **10. Modern Web Uygulamaları İçin Termal Yazdırma SDK Mimarisi** | • 10.1: JavaScript ile Termal Fiş Oluşturma: Hizalama, Çizgiler ve Tablolar<br>• 10.2: HTML/CSS İçeriğini Termal Yazıcı İçin 1-Bit Dithered Monokrom Yapma<br>• 10.3: React ve Vue Projelerinde Termal Yazıcı Entegrasyon Kancaları (Hooks)<br>• 10.4: WebUSB ile Masaüstü Termal Yazıcıya Doğrudan USB Byte İletimi |

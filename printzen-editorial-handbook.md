# Printzen.app — Editoryal ve Teknik Yazım El Kitabı

**Arketip:** `SAAS_DEVTOOL_CLOUD_PRINT`  
**Domain:** printzen.app  
**Bağlı Olduğu Konsorsiyum:** Master Publisher Consortium

---

## 1. Misyon & Yayın Felsefesi

Printzen.app; geliştiriciler, e-ticaret satıcıları, restoran işletmecileri ve SaaS sağlayıcıları için **bulut ve mobil termal yazdırma standartları, donanım optimizasyonları ve SDK kılavuzları** sunan küresel otorite platformudur.

Üç temel sac ayağı vardır:
1. **Yazılım Geliştirici Kılavuzları (Developer Guides):** Web Bluetooth, WebUSB, Raw Socket (TCP 9100) ve REST API ile web/mobil uygulamalardan termal yazıcılara doğrudan bağlanma yönergeleri ve çalışan kod blokları.
2. **Donanım & Protokol Karar Desteği:** ESC/POS, Zebra ZPL, TSPL ve CPCL dillerinin teknik komut referansları, kod sayfası (Code Page CP857/Windows-1254) tabloları.
3. **Sorun Giderme & Operasyon:** Bluetooth eşleşme sorunları, silik baskı, kağıt kesmeme, kargo etiketi boyutlandırma ve sessiz yazdırma (kiosk printing) problemlerine kesin çözümler.

---

## 2. Marka Sesi ve Tonu

- **Mühendislik temelli, doğrudan, çözüm odaklı.** Kod örneklerinde gereksiz kütüphane bağımlılığı yaratılmaz; standart Web API'leri ve yalın JavaScript/TypeScript tercih edilir.
- **Yasaklı kalıplar:** "İnanılmaz hızlı yazdırın", "dünyanın en iyi çözümü" gibi hamasi pazarlama dili; doğrulanmamış donanım iddiaları.
- **İzin verilen dil:** "GATT karakteristik spesifikasyonuna göre", "20-byte MTU kısıtlaması nedeniyle", "üretici dokümantasyonunda belirtildiği üzere", "kullanıcı testlerinde gözlemlenen sonuç".
- **Terminoloji Uyumu:** `master-publisher/glossary/MASTER_GLOSSARY.md` bağlayıcıdır.

---

## 3. Hedef Kitle Personaları

1. **SaaS & Web POS Geliştiricisi:** Kendi bulut restoran/kasa yazılımını termal fiş yazıcılarına sürücüsüz bağlamak istiyor.
2. **E-Ticaret & Depo Yöneticisi:** Trendyol, Hepsiburada, WooCommerce siparişlerini 100x150 mm termal etiket yazıcıdan tek tıkla otomatik dökmek istiyor.
3. **Kafe/Restoran İşletmecisi:** Paket servis siparişlerini ve mutfak adisyonlarını sessizce, personelin karşısına diyalog penceresi çıkmadan bastırmak istiyor.
4. **Saha Satış & Kurye Entegratörü:** Android veya iOS el terminallerinden Bluetooth taşınabilir yazıcıya fatura ve bilgi fişi göndermek istiyor.

---

## 4. İki Kademeli İçerik Standardı (10 Pillar + 40 Satellite)

* **Tier-1 Amiral Rehberler (Pillar):** 1.500 - 2.500+ kelime, kapsamlı protokol analizleri, karşılaştırma tabloları, çalışan kod blokları ve SSS bölümü.
* **Tier-2 Destekleyici Rehberler (Satellite):** 800 - 1.200 kelime, spesifik bir teknik hatayı veya entegrasyon senaryosunu çözen odaklanmış rehberler.
* **SSS (FAQ) Zorunluluğu:** Her rehberin sonunda `SearchIntentFAQAgent` standardına uygun en az 4-5 maddelik doğrudan yanıtlar içeren SSS bloğu bulunmalıdır.

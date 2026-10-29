---
updatedDate: 2026-10-23
title: "Çevrimiçi ZPL Etiket Önizleme, Sanal Emülasyon ve Sıfır İsrafla Test Rehberi"
description: "ZPL II etiket şablonlarını fiziksel termal yazıcı olmadan tarayıcıda önizleme, 203/300/600 DPI yoğunluk emülasyonu, GS1 2D karekod doğrulaması ve sıfır etiket israfı mimarisi."
printerClass: industrial
brand: Zebra
publishDate: 2026-10-23
translationKey: online-zpl-viewer-label-preview
---

Depo yönetim sistemleri (WMS), e-ticaret kargo entegrasyonları ve fabrika üretim hatları için **ZPL II (Zebra Programming Language)** şablonları geliştirirken karşılaşılan en büyük operasyonel kayıp; her koordinat (`^FO`), barkod boyutu (`^BY`) veya yazı tipi (`^A0`) değişikliğinde fiziksel yazıcıdan onlarca deneme etiketi basılmasıdır. Özellikle **UL 969 Silvermat**, **Poliimid (Kapton)** veya **UHF RFID** gibi yüksek birim maliyetli endüstriyel etiket rulolarında deneme-yanılma yöntemiyle şablon tasarlamak hem ciddi sarf malzemesi israfına yol açar hem de yazılım geliştirme sürecini yavaşlatır.

**Çevrimiçi ZPL Etiket Önizleme (Online ZPL Viewer)** ve sanal ZPL emülasyon motorları, ham ASCII ZPL komut dizilerini milisaniyeler içinde gerçek DPI ölçeğinde (`8 dpmm`, `12 dpmm`, `24 dpmm`) PNG veya PDF görüntüsüne dönüştürerek fiziksel bir yazıcıya ihtiyaç duymadan %100 piksel doğruluğunda test imkânı sunar.

Bu kapsamlı mühendislik rehberinde; sanal ZPL yorumlayıcılarının çalışma mimarisini, DPI ve milimetre dönüşüm matematiğini, **GS1 DataMatrix (`^BXN`)** ve **GS1 Digital Link QR (`^BQN`)** kodlarının ekran üzerinde nasıl doğrulandığını ve CI/CD yazılım süreçlerine otomatik etiket testi entegrasyonunu inceliyoruz.

---

## 1. Sanal ZPL Emülasyon Motoru Nasıl Çalışır?

Fiziksel bir endüstriyel termal yazıcıda (örneğin 203 DPI, 300 DPI veya 600 DPI baskı ünitelerinde), TCP/IP `9100` portundan veya USB üzerinden gelen `^XA ... ^XZ` veri paketi yazıcının dahili RAM belleğinde (Bitmap Framebuffer) siyah-beyaz (`1-bit monochrome`) bir nokta matrisine dönüştürülür.

Tarayıcı tabanlı veya REST API tabanlı bir **ZPL Önizleme Motoru (Virtual ZPL Renderer)** da birebir aynı adımları yazılımsal olarak yürütür:

1. **Sözdizimi Ayrıştırma (Lexical & Command Parsing):** Gelen metin akışındaki `^XA` başlangıç ve `^XZ` bitiş komutları arasındaki tüm kontrol ifadeleri (`^PW`, `^LL`, `^CI28`, `^FO`, `^GB`, `^BC`, `^BQ`, `^BX`, `^GF`) sırasıyla ayrıştırılır.
2. **Sanal Tuval Oluşturma (Virtual Canvas Allocation):** Seçilen baskı yoğunluğu (`dpmm` — milimetre başına nokta) ve etiket genişlik/uzunluk (`mm` veya `inç`) değerlerine göre bellekte sanal bir piksel matrisi açılır.
3. **Vektörel Font ve Barkod Çizimi (Rasterization):** Ölçeklenebilir ZPL yazı tipleri (`Font 0`), grafik kutular (`^GB`) ve 1D/2D barkod sembolojileri tam sayı nokta (integer dot) kurallarına göre sanal tuvale işlenir.
4. **Görsel ve Kalite Doğrulama Çıktısı:** Oluşturulan sanal etiket anında ekranda görüntülenir; taşan metinler, üst üste binen barkodlar veya eksik `^FS` (*Field Separator*) hataları tek bir fiziksel etiket bile harcanmadan tespit edilir.

---

## 2. Önizleme Doğruluğu İçin DPI ve Nokta Yoğunluğu (`dpmm`) Eşleştirmesi

Çevrimiçi bir ZPL önizleme aracında yapılan en yaygın hata, 300 DPI bir yazıcı için yazılmış ZPL kodunu 203 DPI (`8 dpmm`) ayarında önizlemektir. ZPL II dilinde tüm koordinatlar ve boyutlar **nokta (dot)** cinsinden tanımlandığı için, yanlış yoğunluk seçildiğinde etiket ekrana sığmaz veya olduğundan çok küçük görünür.

Önizleme aracında seçmeniz gereken doğru parametre tablosu şöyledir:

| Yazıcı Çözünürlüğü (DPI) | Milimetre Başına Nokta (`dpmm`) | 1 Nokta Fiziksel Boyutu | 100 × 150 mm (`4 × 6 inç`) Etiket Tuvali | İdeal Kullanım Alanı |
| :--- | :--- | :--- | :--- | :--- |
| **203 DPI** | **8 dpmm** (`8 nokta/mm`) | `0,125 mm` | `800 × 1200 nokta` (`^PW800` / `^LL1200`) | Standart kargo, e-ticaret ve koli sevkiyat etiketleri |
| **300 DPI** | **12 dpmm** (`11,8 nokta/mm`) | `0,084 mm` | `1181 × 1772 nokta` (`^PW1181` / `^LL1772`) | Perakende GS1 2D QR, DataMatrix, ilaç ve AB DPP etiketleri |
| **600 DPI** | **24 dpmm** (`23,6 nokta/mm`) | `0,042 mm` | `2362 × 3543 nokta` (`^PW2362` / `^LL3543`) | Elektronik devre kartı (PCB), kablo ve mikro komponent etiketleri |

Örneğin 300 DPI (`12 dpmm`) çözünürlüklü bir endüstriyel yazıcı veya **[Rebo-Label otomatik etiketleme sistemi](https://rebolabel.com/blog/otomatik-etiketleme-makinesi-print-apply-secim-rehberi/)** için `100 × 150 mm` boyutunda bir şablon test ediyorsanız, önizleme aracında mutlaka **`12 dpmm (300 DPI)`** ve **`4 × 6 inç (100 × 150 mm)`** ayarını seçmelisiniz.

---

## 3. Örnek Uygulama: GS1-128, DataMatrix ve Türkçe UTF-8 İçeren ZPL Şablonunu Test Etme

Aşağıdaki üretim seviyesindeki ZPL II şablonu; `^CI28` (UTF-8 Türkçe karakter desteği), `^BXN` (GS1 DataMatrix `FNC1` ayırıcılı) ve `^BCN` (GS1-128 doğrusal barkod) komutlarını bir arada barındırır. Bu kodu herhangi bir çevrimiçi ZPL önizleme aracında `12 dpmm (300 DPI)` modunda test edebilirsiniz:

```zpl
^XA
^CI28
^PW1181
^LL800
^LH0,0

^FX --- Üst Başlık ve Çerçeve ---
^FO40,40^GB1100,720,4^FS
^FO70,70^A0N,42,42^FDENDÜSTRİYEL SEVKİYAT VE İZLENEBİLİRLİK ETİKETİ^FS
^FO70,130^GB1040,3,3^FS

^FX --- Ürün ve Parti Bilgileri (UTF-8 Türkçe) ---
^FO70,160^A0N,32,32^FDÜRÜN GTIN (01): 08690000000018^FS
^FO70,210^A0N,32,32^FDPARTİ NO (10): LOT2026-TR | SKT (17): 31.12.2027^FS
^FO70,260^A0N,32,32^FDSERİ NO (21): SN-9948102^FS

^FX --- Sağ Üst: GS1 DataMatrix (ISO/IEC 16022 - 6x6 Nokta) ---
^FO820,160^BXN,6,200,,,,_
^FD_101086900000000181727123110LOT2026_121SN9948102^FS

^FX --- Alt Bölüm: GS1-128 Lojistik Barkodu ---
^FO70,380^BY3,3,180^BCN,180,Y,N,N,D
^FD(01)08690000000018(17)271231(10)LOT2026^FS

^XZ
```

### Önizleme Ekranında Kontrol Edilmesi Gereken 4 Kritik Nokta

1. **Türkçe Karakter Doğrulaması (`^CI28`):** `Ğ, Ü, Ş, İ, Ö, Ç` harflerinin bozuk semboller yerine tam UTF-8 karşılıklarıyla çıkıp çıkmadığını kontrol edin. Eğer bozuk görünüyorsa [ZPL Türkçe Karakter Sorunu ve `^CI28` Çözümü](/tr/rehberler/zebra-zpl-etiket-yazdirma/) adımlarını uygulayın.
2. **Sessiz Bölge (Quiet Zone) İhlali:** Barkodun veya 2D karekodun sağ/sol/üst/alt kenarlarının çerçeve çizgisine (`^GB`) temas etmediğinden emin olun. DataMatrix için en az `1X`, QR Kod ve 1D barkodlar için en az `4X` beyaz boşluk kalmalıdır.
3. **Dinamik Veri Taşması (Field Overflow):** Uzun ürün adlarının veya 20 karakterlik parti numaralarının etiketin sağ kenarından (`^PW`) dışarı taşıp taşmadığını `^FB` (*Field Block*) komutuyla sınırlandırarak test edin.
4. **Akıllı Telefon ve 2D Okuyucu Testi:** Önizleme ekranında oluşan karekodu doğrudan cep telefonunuzun kamerasıyla veya masaüstü 2D barkod okuyucuyla ekrandan okutarak `AI (01)`, `AI (10)`, `AI (17)` ve `AI (21)` verilerinin doğru ayrıştığını doğrulayın.

---

## 4. Sanal Testten Gerçek Üretim Hattına Geçiş: WebUSB, TCP 9100 ve Otomatik Aplikatörler

Şablonunuzu çevrimiçi ZPL önizleme aracında sıfır etiket israfıyla doğruladıktan sonra, canlı ortamda yazdırma işlemini 3 farklı mimariyle devreye alabilirsiniz:

- **Web Tarayıcıdan Doğrudan Yazdırma:** [Web Bluetooth](/tr/rehberler/web-bluetooth-termal-yazici-baglantisi/) veya Android Print Service köprüsüyle sürücüsüz olarak mobil ve masaüstü yazıcılara doğrudan ZPL akışı gönderebilirsiniz.
- **ERP / WMS Raw Socket (Port 9100) Basımı:** SAP, Logo, Netsis veya özel Node.js/Python arka uç servislerinizden yazıcının yerel IP adresine (`TCP 9100`) doğrudan ZPL paketleri iletebilirsiniz.
- **Yüksek Hızlı Konveyörlerde Yaz-Yapıştır (Print & Apply):** Saniyede birden fazla kolinin veya sevkiyat paletinin geçtiği fabrikalarda, doğrulanan ZPL şablonlarınızı **[Rebo-Label 6 eksenli robotik otomatik etiketleme makinelerine](https://rebolabel.com/)** göndererek basılan etiketin ±0,5 mm hassasiyetle ürüne yapıştırılmasını ve kameralı sistemle kontrol edilmesini sağlayabilirsiniz.

---

## 5. Sıkça Sorulan Sorular (SSS)

### Çevrimiçi ZPL önizleme aracında neden barkodum etiketin dışına taşıyor?
Bunun temel nedeni önizleme aracındaki nokta yoğunluğu (`dpmm` / `DPI`) ayarı ile ZPL kodunuzun hedeflediği yazıcı çözünürlüğünün uyuşmamasıdır. Örneğin 300 DPI (`12 dpmm`) için yazılmış `^FO900,200` koordinatı, 203 DPI (`8 dpmm`) ve 100 mm genişliğindeki (`800 nokta`) bir tuvalde etiketin sağından dışarı taşar. Önizleme ayarını yazıcınızın gerçek DPI değerine eşitleyin.

### Ekranda önizlenen QR veya DataMatrix barkodu telefon kamerasıyla okutabilir miyim?
Evet. Sanal ZPL emülatörünün ürettiği görüntü vektörel nokta doğruluğuna sahip olduğu için, bilgisayar ekranındaki önizleme görüntüsünü doğrudan akıllı telefon kameranızla veya 2D barkod okuyucunuzla okutarak GS1 uygulama tanımlayıcılarının (`01`, `10`, `17`, `21`) doğruluğunu fiziksel baskı almadan test edebilirsiniz.

### ZPL kodundaki `^GF` (Graphic Field) logoları önizlemede görünür mü?
Evet. Standart ZPL II yorumlayıcıları `^GFA` (ASCII Hex) ve `^GFB` (Binary) formatındaki sıkıştırılmış моноkrom bitmap logoları çözerek etiket önizlemesi üzerinde tam konumunda gösterir. Logolarınızı ZPL formatına dönüştürmek için [ZPL Etikete Logo Basma (`^GF`) Rehberi](/tr/rehberler/zpl-etikete-logo-basma-gf-formati/) kılavuzumuzu inceleyebilirsiniz.

### Yazılım test süreçlerinde (CI/CD) binlerce ZPL etiketini otomatik doğrulayabilir miyiz?
Evet. ZPL şablonlarınızı üretim ortamına almadan önce otomatik birim testlerinde (unit tests) `^XA` ve `^XZ` blok dengesini, `^PW` sınırlarını aşan `^FO` koordinatlarını ve zorunlu GS1 uygulama tanımlayıcılarını deterministik olarak denetleyerek hatalı şablonların depoya ulaşmasını engelleyebilirsiniz. Çok katmanlı tedarikçi ağlarında ve ERP entegrasyonlarında şablon kilitleme için [Tedarikçi Portalı ve ERP Sistemlerinden Merkezi ZPL/TSPL Etiket Şablon Yönetimi](/tr/rehberler/tedarikci-portali-merkezi-zpl-etiket-sablonu-yonetisimi-ve-erp-bulut-baski/) rehberimizi inceleyebilirsiniz.

---
title: "E-Ticaret Pazaryeri Kargo Etiketi Yazdırma Rehberi: Trendyol, Hepsiburada, Amazon 100x150 mm Barkod"
description: "Trendyol, Hepsiburada ve Amazon siparişlerinde A4 kağıt israfına son verin. 100x150 mm termal etiket yazıcılarla toplu barkod ve sevkiyat etiketi basma rehberi."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: ecommerce-marketplace-shipping-label-printing-guide
---

Türkiye'de ve dünyada e-ticaret satıcılarının en büyük operasyonel maliyet kalemlerinden biri kargo paketleme ve etiketleme sürecidir. Birçok satıcı işe ilk başladığında sipariş kargo barkodlarını standart A4 kağıda basar, makasla dörde böler ve şeffaf koli bandıyla paketlerin üzerine yapıştırır.

Bu yöntem günde 10 siparişte sürdürülebilir görünse de; **sipariş sayısı 50'yi aştığında tam bir operasyonel kabusa dönüşür**:
- A4 toner, kağıt ve koli bandı maliyetleri termal etiketin 3 katına çıkar.
- Şeffaf koli bandı barkod okuyucuların lazer ışığını yansıtarak kargo şubelerinde okuma hatalarına ve paketlerin kaybolmasına yol açar.
- Paket başına harcanan süre 45 saniyeden 3 saniyeye inebilecekken saatlerce mesai harcanır.

E-ticaret lojistiğinin küresel standardı **100 × 150 mm (Akredite Kargo Boyutu - 4×6 inç) direkt termal etiket** kullanımıdır. Bu rehberde; Trendyol, Hepsiburada ve Amazon satıcı panellerinden toplu termal etiket almayı, A4 PDF'leri 100x150 mm boyuta kırpmayı ve API üzerinden doğrudan ZPL yazdırma mimarisini inceliyoruz.

---

## 1. Pazaryeri Kargo Etiketi Standartları ve Karşılaştırması

| Pazaryeri | Standart Boyut | Desteklenen Formatlar | Kargo Barkod Tipi | Entegre Kargo Firmaları |
|---|---|---|---|---|
| **Trendyol** | 100 × 150 mm / A5 | PDF, ZPL, PNG | Code 128 (Kargo Takip No) | Trendyol Express, Yurtiçi, Aras, MNG, Sürat |
| **Hepsiburada** | 100 × 150 mm / A6 | PDF, Ham ZPL | Code 128 + HepsiJet Barkodu | HepsiJet, Yurtiçi, Aras, PTT |
| **Amazon TR** | 100 × 150 mm (4×6") | ZPL II, PDF | Code 128 / PDF417 | Kolay Gelsin, MNG, DHL |

---

## 2. A4 PDF Kargo Etiketlerini 100x150 mm Termal Formata Kırpma

Pazaryeri panelleri bazen tek bir A4 sayfası içerisine 4 adet kargo etiketi yerleştirilmiş PDF dosyaları üretir. Bu dosyayı standart bir masaüstü termal yazıcıya gönderirseniz etiketler küçülür, kenarlara taşar veya okunamaz hale gelir.

### Otomatik Kırpma (Auto-Crop) Yöntemi:
1. **Windows Sürücü Ayarları Üzerinden:**
   - Yazıcı Özellikleri > Tercihler > Sayfa Yapısı sekmesinden kağıt boyutunu **100 mm Genişlik, 150 mm Yükseklik** olarak tanımlayın.
   - "Sayfaya Sığdır" (Fit to Printable Area) seçeneğini işaretleyin.
2. **Yazılım Tabanlı Kırpma (PDF Crop):**
   - Node.js veya Python kullanarak A4 sayfayı 4 eşit koordinata bölen ve her bir çeyreği ayrı bir 100x150 mm sayfaya dönüştüren otomasyon:

```javascript
import { PDFDocument } from 'pdf-lib';

async function splitA4ToThermalLabels(a4PdfBytes) {
  const srcDoc = await PDFDocument.load(a4PdfBytes);
  const outDoc = await PDFDocument.create();

  // 100x150 mm'nin nokta (point) karşılığı: [283.46, 425.20]
  const thermalWidth = 283.46;
  const thermalHeight = 425.20;

  for (const page of srcDoc.getPages()) {
    const { width, height } = page.getSize();
    
    // A4'ü 4 kadrana böl: Sol-Üst, Sağ-Üst, Sol-Alt, Sağ-Alt
    const quadrants = [
      { x: 0, y: height / 2, w: width / 2, h: height / 2 },
      { x: width / 2, y: height / 2, w: width / 2, h: height / 2 },
      { x: 0, y: 0, w: width / 2, h: height / 2 },
      { x: width / 2, y: 0, w: width / 2, h: height / 2 }
    ];

    for (const q of quadrants) {
      const embedded = await outDoc.embedPage(page, q);
      const newPage = outDoc.addPage([thermalWidth, thermalHeight]);
      newPage.drawPage(embedded, {
        x: 0,
        y: 0,
        width: thermalWidth,
        height: thermalHeight
      });
    }
  }

  return await outDoc.save();
}
```

---

## 3. Trendyol API ile Doğrudan ZPL Barkod Yazdırma

Trendyol Satıcı API'si, sipariş paketlendiğinde kargo etiketini doğrudan **ham ZPL formatında** döndürebilir. PDF renderlama aşamasını tamamen atlayarak yazıcıya milisaniyeler içinde ham veri basmanızı sağlayan akış:

```
[ Trendyol API: /suppliers/{id}/packages ]
                   │
                   ▼ (Kargo Takip No & ZPL String)
       [ Printzen Entegratörü ]
                   │
                   ▼ (Port 9100 / Raw Socket)
       [ Zebra / Xprinter Termal Barkod Yazıcı ]
```

### Node.js ile Trendyol Kargo Etiketi Basma Örneği:
```typescript
import net from 'net';

async function fetchAndPrintTrendyolLabel(packageId: number, printerIp: string) {
  // 1. Trendyol API'den ZPL verisini çek
  const response = await fetch(`https://api.trendyol.com/sapigw/suppliers/YOUR_SUPPLIER_ID/packages/${packageId}/label`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from('API_KEY:API_SECRET').toString('base64'),
      'Accept': 'application/x-zpl'
    }
  });

  const zplData = await response.text();

  // 2. Ham ZPL'i doğrudan yazıcının 9100 portuna ilet
  const client = new net.Socket();
  client.connect(9100, printerIp, () => {
    client.write(zplData, () => {
      client.end();
      console.log(`Paket #${packageId} kargo etiketi basıldı.`);
    });
  });
}
```

---

## 4. Termal Direkt (Direct Thermal) vs Termal Transfer (Ribonlu)

Kargo etiketi seçerken yapılacak en kritik donanım tercihi kağıt tipidir:

| Özellik | Direkt Termal (Eko Termal) | Termal Transfer (Ribonlu) |
|---|---|---|
| **Ribon (Şerit) İhtiyacı** | Yok (Sıfır ek sarf malzemesi) | Var (Vaks veya Reçine Ribon) |
| **Baskı Maliyeti** | Son derece ucuz | Orta / Yüksek |
| **Dayanıklılık Ömrü** | 3 - 6 Ay (Işık ve ısıyla solar) | 2 - 10 Yıl (Solmaz, çizilmez) |
| **Kullanım Alanı** | **Kargo ve Sevkiyat Etiketleri** | Demirbaş, Dondurucu, Kimyasal |

> 💡 **Tavsiye:** E-ticaret kargo etiketleri ortalama 1-5 gün içinde alıcıya ulaştığı için **Direkt Termal (Eko Termal)** etiketler en ekonomik ve hızlı çözümdür. Ribon takma zahmeti olmadan rulo bittikçe sadece yeni kağıt takarak baskıya devam edebilirsiniz.

---

## 5. Sıkça Sorulan Sorular (SSS)

### Kargo barkodunun üzerine şeffaf koli bandı yapıştırmak neden zararlıdır?
**Termal kağıtlar ısıya ve kimyasallara duyarlıdır; koli bandının yapışkanındaki solventler birkaç saat içinde termal siyahlığı soldurarak yazıları yok edebilir.** Ayrıca koli bandının parlak yüzeyi, kargo aktarma merkezlerindeki otomatik lazer tarayıcıların ışığını kırarak okuma hatalarına ve kargonun gecikmesine yol açar. Kendinden yapışkanlı 100x150 mm termal etiketler banda ihtiyaç duymadan doğrudan kolinin üzerine yapıştırılmalıdır.

### Trendyol ve Hepsiburada panellerinden tek tıkla toplu etiket basılabilir mi?
**Evet, her iki pazaryerinin de satıcı panelinde "Toplu İşlemler" menüsü altından seçilen tüm siparişler için tek bir birleşik PDF kargo etiketi oluşturulabilir.** Bu PDF dosyasını Google Chrome veya Printzen masaüstü aracına gönderdiğinizde, 100x150 mm yazıcınız ardı ardına saniyede 3-4 etiket hızında tüm siparişleri otomatik basar.

### Zebra dışındaki uygun fiyatlı etiket yazıcılar (Xprinter, Hoin) Trendyol etiketlerini basabilir mi?
**Evet, piyasadaki Xprinter XP-420B, XP-470B veya Hoin gibi popüler direkt termal etiket yazıcılarının tamamı TSPL ve ZPL emülasyonu sunar.** Bu yazıcılar Windows'ta 100x150 mm etiket boyutuna ayarlandığında tüm pazaryeri kargo etiketlerini hatasız ve yüksek hızda basabilir.

### Kargo poşetleri üzerindeki etiket yağmurda veya sürtünmede silinir mi?
**Standart eko termal etiketler hafif sürtünme ve kısa süreli neme karşı dayanıklıdır.** Ancak uzun mesafeli sevkiyatlarda veya sıvı temas riski olan ürünlerde, yüzeyi polietilen korumalı **"Lamine Termal" (Top Termal)** etiketler tercih edilmelidir. Lamine termal etiketler su, yağ ve aşırı sürtünmeye maruz kalsa bile barkod okunabilirliğini korur.

## Popüler Model Özelinde Bu Konudaki Rehberler

- [Bixolon Slp Tx400 Pazaryeri](/tr/rehber/bixolon-slp-tx400-pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon)
- [Bixolon Spp R200iii Pazaryeri](/tr/rehber/bixolon-spp-r200iii-pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon)
- [Bixolon Spp R310 Pazaryeri](/tr/rehber/bixolon-spp-r310-pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon)
- [Bixolon Srp 330ii Pazaryeri](/tr/rehber/bixolon-srp-330ii-pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon)
- [Bixolon Srp 350iii Pazaryeri](/tr/rehber/bixolon-srp-350iii-pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon)
- [Bixolon Srp Q300 Pazaryeri](/tr/rehber/bixolon-srp-q300-pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon)
- [Epson Tm L90 Pazaryeri](/tr/rehber/epson-tm-l90-pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon)
- [Epson Tm M30ii Pazaryeri](/tr/rehber/epson-tm-m30ii-pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon)
- [Epson Tm P20ii Pazaryeri](/tr/rehber/epson-tm-p20ii-pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon)
- [Epson Tm P80ii Pazaryeri](/tr/rehber/epson-tm-p80ii-pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon)

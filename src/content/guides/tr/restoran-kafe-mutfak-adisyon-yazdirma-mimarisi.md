---
title: "Restoran ve Kafe Mutfak Adisyon Yazdırma Mimarisi: Masaüstü, Paket Servis ve İstasyon Dağıtımı"
description: "Restoran POS sistemlerinde mutfak sipariş fişi (KOT) mimarisi. Sıcak mutfak, bar ve paket servis ayrıştırması, sesli buzzer alarmları ve nokta vuruşlu yazıcı seçimi."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: restaurant-kitchen-order-ticket-kot-printing-architecture
---

Yoğun bir cuma akşamı restoranda servis anı; garsonların sipariş girdiği, şeflerin tabak hazırladığı ve paket kuryelerinin kapıda beklediği yüksek tempolu bir operasyondur. Bu karmaşada mutfak adisyon yazıcısının bir siparişi kaçırması, yemeğin yanlış istasyona gitmesi veya fişin gürültüde duyulmaması; mutfakta kaosa, müşteri memnuniyetsizliğine ve iptal edilen sipariş maliyetlerine yol açar.

Profesyonel restoran otomasyonunda mutfak yazdırma süreci, sıradan bir fiş basma işlemi değildir. Bu mimari; **İstasyon Dağıtımı (Routing), Sipariş Değişiklik Yönetimi (Modifications & Voids), Donanım Sesli Uyarıları (Buzzer/Alarm) ve Ağ Hata Toleransı (Failover)** üzerine kurulmalıdır.

Bu mühendislik rehberinde; KOT (Kitchen Order Ticket) yazdırma mimarisini, termal vs nokta vuruşlu (dot-matrix) yazıcı farklarını, ESC/POS donanım buzzer komutlarını ve istasyon bazlı JavaScript dağıtım motorunu inceliyoruz.

---

## 1. Mutfak İstasyon Dağıtımı (KOT Routing) Mimarisi

Bir masaya oturan müşteriler aynı anda çorba, bonfile ızgara, mevsim salatası, buzlu kokteyl ve künefe sipariş ettiğinde; bu siparişin tek bir fiş olarak tek bir yere gitmesi operasyonu felç eder. 

Sistem her kalemi kendi hazırlık istasyonuna bağımsız olarak bölüştürmelidir:

```
[ Garson Tableti / Web POS ] ──► [ Sipariş: Masa 12 ]
                                         │
       ┌──────────────────┬──────────────┴───────────────┬──────────────────┐
       ▼                  ▼                              ▼                  ▼
[ Sıcak Mutfak ]    [ Soğuk & Meze ]               [ Bar / Barista ]    [ Şef Pas (Expediter) ]
 - Çorba             - Mevsim Salata                - Kokteyl            - Konsolide Özet Fiş
 - Bonfile Izgara    - Haydari                      - Filtre Kahve       - Masa 12 Tüm Kalemler
 (IP: 192.168.1.201) (IP: 192.168.1.202)            (IP: 192.168.1.203)  (IP: 192.168.1.200)
```

### 1.1. İstasyon Filtreleme Algoritması (JavaScript)
```typescript
interface OrderItem {
  name: string;
  qty: number;
  station: 'HOT_KITCHEN' | 'COLD_PREP' | 'BAR';
  notes?: string; // Örn: "Az pişmiş, tuzsuz"
}

export function routeOrderToPrinters(items: OrderItem[]): Map<string, OrderItem[]> {
  const stationBatches = new Map<string, OrderItem[]>();

  for (const item of items) {
    if (!stationBatches.has(item.station)) {
      stationBatches.set(item.station, []);
    }
    stationBatches.get(item.station)!.push(item);
  }

  return stationBatches;
}
```

---

## 2. Sıcak Mutfakta Donanım Seçimi: Termal vs Nokta Vuruşlu (Dot-Matrix)

Mutfak fiş yazıcısı seçerken yapılan en ölümcül hata, ocak veya ızgara yakınına standart **Termal Yazıcı** yerleştirmektir:

- **Termal Kağıdın Zayıflığı:** Termal kağıt $60^\circ\text{C}$ sıcaklığın üzerine çıktığında yüzeyindeki kimyasal katman kararır. Ocak buharına maruz kalan termal fiş 10 dakika içinde tamamen kömür gibi karararak okunamaz hale gelir.
- **Nokta Vuruşlu (Impact Dot-Matrix) Çözüm:** Epson TM-U220 gibi şeritli nokta vuruşlu yazıcılar standart düz kağıda mekanik iğneler ve mürekkepli şerit (ribbon) ile basar. Sıcaklıktan, nemden veya yağdan kesinlikle etkilenmez; ayrıca iğnelerin çıkardığı mekanik ses gürültülü mutfaklarda doğal bir dikkat çekici uyarandır.

| Kriter | Termal Fiş Yazıcı (Epson TM-T20) | Nokta Vuruşlu Yazıcı (Epson TM-U220) |
|---|---|---|
| **Baskı Hızı** | 200 - 300 mm/s (Işık hızında) | 4.7 satır/s (Yavaş) |
| **Sıcak & Buhar Dayanımı** | Zayıf (Kararır, silinir) | **Mükemmel (Etkilenmez)** |
| **Baskı Sesi** | Sıfır (Sessiz) | Mekanik Takırtı (Şefler için avantaj) |
| **İki Renkli Baskı** | Tek renk (Siyah) | İki renk (Siyah / Kırmızı Şerit) |
| **Önerilen İstasyon** | Bar, Kasa, Soğuk Meze Hazırlık | **Izgara, Fırın, Ocak Arkası** |

---

## 3. Donanım Buzzer (Sesli Alarm) ve Flaşör Komutları

Gürültülü bir mutfakta fişin sessizce çıkması siparişin gözden kaçmasına sebep olur. ESC/POS protokolünde harici buzzer'ı veya yazıcının dahili hoparlörünü öttürmek için özel donanım komutları kullanılır:

```typescript
// Epson ESC/POS Dahili Buzzer Çaldırma Komutu (ESC ( A)
export function getBuzzerCommand(beepCount = 3, intervalMs = 200): Uint8Array {
  // ESC ( A pL pH fn m t1 t2
  // fn=97, m=beepCount, t1=ses süresi, t2=sessizlik süresi
  return new Uint8Array([
    0x1B, 0x28, 0x41, // ESC ( A
    0x04, 0x00,       // Parametre uzunluğu (4 bayt)
    0x61,             // fn = 97
    beepCount,        // Çalma sayısı
    0x02,             // Ton / Süre
    0x02              // Bekleme aralığı
  ]);
}

// Para çekmecesi portuna (RJ11) bağlı harici alarmı tetikleme (ESC p 0 25 250)
export function getExternalRelayAlarm(): Uint8Array {
  return new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
}
```

---

## 4. Sipariş Değişiklik Yönetimi: İptal, İkram ve Notlar

Mutfak operasyonunda en çok karışıklık yaratan senaryolar sipariş sonradan değiştirildiğinde yaşanır:
1. **Ürün İptali (Void):** Fişin başında devasa fontla `*** IPTAL EDILDI ***` yazmalı, iptal edilen ürünün üstü çizilmeli veya kırmızı şeritle basılmalıdır.
2. **Özel Notlar (Modifiers):** "Soğansız", "Acısız", "Glutensiz" gibi alerjen veya müşteri tercihleri **Ters Renk (Negatif / Beyaz zemin üstüne siyah yazı - GS B 1)** olarak basılmalıdır:

```javascript
// ESC/POS Negatif Metin Modu Açma (GS B 1)
const enableNegative = [0x1D, 0x42, 0x01];
// Kapatma (GS B 0)
const disableNegative = [0x1D, 0x42, 0x00];
```

---

## 5. Standart Mutfak Adisyonu (KOT) Şablonu

```
================================================
           *** MUTFAK ADISYONU ***              
Masa: 14                 Garson: Caner          
Saat: 20:15              Siparis No: #482       
------------------------------------------------
[ADET]  [URUN ADI]                              
------------------------------------------------
 2x     Dana Antrikot Izgara                    
        * Pisim: Orta-Iyi                       
        * Not: Biberiye sosu ayri olsun         

 1x     Karisik Pizza (Buyuk Boy)               
        >>> [SOĞANSIZ - MANTARSIZ] <<<          

 1x     Kremali Mantarli Makarna                
------------------------------------------------
Not: Masa 14 siparisi acele istemektedir.        
================================================
[KAĞIT KESME KOMUTU] + [3 KEZ BUZZER SESİ]
```

---

## 6. Sıkça Sorulan Sorular (SSS)

### Mutfak yazıcısında neden USB yerine Ethernet (LAN) veya Wi-Fi tercih edilmelidir?
**Mutfaklar ile kasa bilgisayarları arasındaki mesafe genellikle 10-30 metredir; standart USB kabloları 5 metreden sonra sinyal kaybı yaşar.** Ethernet (LAN) kabloları ise 100 metreye kadar kayıpsız veri taşır ve tek bir merkezi POS sunucusundan ağdaki onlarca farklı istasyon yazıcısına (Mutfak, Bar, Fırın) aynı anda erişim imkanı sağlar.

### Mutfak yazıcısının kağıdı bittiğinde sipariş kaybolur mu?
**Printzen ve profesyonel POS sistemleri "Kağıt Sonu Sensörü" (Paper Out Sensor) desteğiyle donanımı sürekli izler.** Yazıcı kağıtsız kaldığında veya kapağı açıkken sistem yazdırma işlemini askıya alır, ekranda kırmızı bir garson uyarısı fırlatır ve yeni rulo takıldığı anda bekleyen tüm mutfak fişlerini sırasıyla otomatik olarak basar.

### Sıcak mutfakta termal yazıcı kullanılırsa ne olur?
**Termal yazıcı kağıdı ısıya duyarlıdır; fırın, ocak veya ızgara yakınına konulan bir termal fiş 10-15 dakika içinde sıcaklığın etkisiyle tamamen kararır ve yazılar okunamaz hale gelir.** Bu nedenle yüksek sıcaklık ve yağ buharı olan sıcak hazırlık istasyonlarında mutlaka nokta vuruşlu (mürekkepli şeritli) yazıcılar (Epson TM-U220 vb.) tercih edilmelidir.

### Mutfak adisyon fişine sesli ikaz (Buzzer) nasıl bağlanır?
**Mutfak yazıcılarının arkasında bulunan RJ11 (Kasa/Çekmece) portuna harici bir 24V akustik buzzer veya flaşörlü lamba takılabilir.** Sipariş basıldığı anda ESC/POS çekmece açma darbesi (`0x1B 0x70`) gönderilerek buzzer tetiklenir ve aşçılar fişi alana kadar sesli veya ışıklı uyarı verilir.

## Desteklenen Cihazlar

Bu rehberdeki adımlar, ilgili protokolü/arayüzü destekleyen aşağıdaki yazıcı modellerinin tamamı için geçerlidir:

| Marka | Model | Protokol | Arayüzler | Kağıt Genişliği |
|---|---|---|---|---|
| Bixolon | SLP-TX400 | SLCS / BPL-Z | USB, Ethernet, Seri | 104mm |
| Bixolon | SPP-R200III | ESC/POS / CPCL | Bluetooth, Wi-Fi, USB | 58mm |
| Bixolon | SPP-R310 | ESC/POS / CPCL | Bluetooth BLE, USB | 80mm |
| Bixolon | SRP-330II | ESC/POS | USB, Ethernet | 80mm |
| Bixolon | SRP-350III | ESC/POS | USB, Ethernet, Seri | 80mm |
| Bixolon | SRP-Q300 | ESC/POS | Bluetooth, Wi-Fi, USB, Ethernet | 80mm |
| Epson | TM-L90 | ESC/POS | USB, Ethernet | 80mm |
| Epson | TM-m30II | ESC/POS | Bluetooth, Wi-Fi, USB, Ethernet | 80mm / 58mm |
| Epson | TM-P20II | ESC/POS | Bluetooth 5.0, Wi-Fi | 58mm |
| Epson | TM-P80II | ESC/POS | Bluetooth, Wi-Fi | 80mm |
| Epson | TM-T20III | ESC/POS | USB, Ethernet, Seri | 80mm / 58mm |
| Epson | TM-T88VI | ESC/POS | USB, Ethernet, Bluetooth, Wi-Fi | 80mm / 58mm |
| Epson | TM-T88VII | ESC/POS | USB, Ethernet, Wi-Fi | 80mm |
| Godex | DT4x | EZPL | USB, Ethernet, Seri | 108mm |
| Godex | G500 | EZPL / GEPL / GZPL | USB, Ethernet, Seri | 108mm |
| Godex | RT700 | EZPL | USB, Ethernet | 108mm |
| Honeywell | PC42d | ZSim / ESim | USB | 104mm |
| Honeywell | PC42t | Direct Protocol / ZSim / ESim | USB, Ethernet, Seri | 104mm |
| Rongta | RP326 | ESC/POS | USB, Ethernet, Seri | 80mm |
| Rongta | RP410 | TSPL / ESC/POS | USB | 108mm |
| Rongta | RP80 | ESC/POS | USB, Ethernet | 80mm |
| Rongta | RPP02N | ESC/POS | Bluetooth, USB | 58mm |
| Seiko | MP-B30L | ESC/POS / SII SDK | Bluetooth, USB | 80mm |
| Seiko | RP-D10 | ESC/POS | USB, Ethernet, Bluetooth | 80mm |
| Star Micronics | mC-Print3 | StarPRNT | CloudPRNT, Bluetooth, Ethernet, USB | 80mm |
| Star Micronics | SM-L200 | Star Line | Bluetooth 4.0 BLE, USB | 58mm |
| Star Micronics | SM-T300i | Star Line / ESC/POS | Bluetooth (MFi), Seri | 80mm |
| Star Micronics | TSP143III | StarPRNT / ESC/POS | Ethernet, Wi-Fi, USB, Lightning | 80mm |
| Star Micronics | TSP654II | Star Line / ESC/POS | Bluetooth, Ethernet, USB | 80mm |
| Sunmi | V2 Pro | ESC/POS (Sunmi InnerPrinter) | Dahili Donanım, Bluetooth | 58mm |
| TSC | Alpha-3R | TSPL / CPCL / ESC/POS | Bluetooth, USB | 72mm (3 inç) |
| TSC | DA210 | TSPL-EZD | USB | 108mm |
| TSC | DA220 | TSPL-EZD | USB, Ethernet, Bluetooth, Wi-Fi | 108mm |
| TSC | TE200 | TSPL-EZ | USB 2.0 | 108mm |
| TSC | TTP-244 Pro | TSPL | USB, Seri | 108mm |
| Xprinter | XP-365B | TSPL / ESC/POS | USB | 80mm |
| Xprinter | XP-420B | TSPL / ESC/POS | USB, Bluetooth, Ethernet | 108mm (100x150) |
| Xprinter | XP-470B | TSPL | USB | 108mm |
| Xprinter | XP-58IIH | ESC/POS | USB, Bluetooth | 58mm |
| Xprinter | XP-N160II | ESC/POS | USB, Ethernet | 80mm |
| Xprinter | XP-P300 | ESC/POS | Bluetooth, USB | 58mm |
| Xprinter | XP-Q800 | ESC/POS | USB, Ethernet, Seri | 80mm |
| Zebra | GK420d | ZPL II / EPL2 | USB, Ethernet, Seri | 104mm |
| Zebra | GK420t | ZPL II / EPL2 | USB, Ethernet | 104mm |
| Zebra | ZD220 | ZPL II / EPL | USB | 104mm (4 inç) |
| Zebra | ZD420 | ZPL II / EPL | USB, Ethernet, Bluetooth, Wi-Fi | 104mm |
| Zebra | ZD421 | ZPL II / EPL | USB, Ethernet, Bluetooth BLE | 104mm |
| Zebra | ZQ320 Plus | CPCL / ZPL | Bluetooth BLE, Wi-Fi | 80mm (3 inç) |
| Zebra | ZQ520 | CPCL / ZPL | Bluetooth, Wi-Fi | 104mm (4 inç) |
| Zebra | ZT411 | ZPL II | Ethernet, USB, Bluetooth 4.1 | 104mm |


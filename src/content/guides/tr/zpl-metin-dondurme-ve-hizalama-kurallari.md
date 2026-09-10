---
title: "ZPL Etikette Metin Döndürme ve Koordinat Hizalama Kuralları"
description: "Zebra ZPL II'de metinleri 90°, 180°, 270° döndürme. ^A font rotasyonu, ^FB çok satırlı metin bloğu ve sağa/sola/ortalı hizalama teknikleri."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: zpl-text-rotation-and-coordinate-alignment
---

Kargo ve palet etiketlerinde bazı metinlerin etiketin kenarında dikine (90 derece) yazılması (örneğin "DİKKAT KIRILIR", "BU TARAFI YUKARI" veya koli sıra numarası) gerekebilir. Ayrıca çok satırlı ürün açıklamalarını veya adres bloklarını kutu sınırlarına göre otomatik kaydırmak (word-wrap) ve ortalamak ZPL tasarımının en kritik konusudur.

Bu rehberde; font rotasyon parametrelerini (`^A`), metin bloğu formatlama komutunu (`^FB`) ve koordinat hizalama matematiğini inceliyoruz.

---

## 1. Metin Döndürme: `^A` Font Rotasyon Parametreleri

ZPL'de metin döndürme, font seçim komutu olan `^A` içerisindeki yön parametresi ile kontrol edilir:

$$\text{^A} f \text{ } o, \text{ } h, \text{ } w$$

- `$f$`: Font adı (`0`: Ölçeklenebilir dahili font).
- `$o$`: **Yönlendirme (Orientation / Rotation)**:
  - `N`: **Normal** (0° - Standart yatay yazı).
  - `R`: **Rotated** (90° - Saat yönünde dik yazı).
  - `I`: **Inverted** (180° - Baş aşağı ters yazı).
  - `B`: **Bottom-Up** (270° - Aşağıdan yukarıya dik yazı).
- `$h, w$`: Font yüksekliği ve genişliği (dot cinsinden).

```zpl
^XA
^PW800^LL400
^FX Kenarda 90 derece dikey uyarı yazısı:
^FO720,50^A0R,30,30^FDKIRILACAK ESYA - DIKKAT!^FS

^FX Normal yatay başlık:
^FO50,50^A0N,36,36^FDSiparis Paket No: #4812^FS
^XZ
```

> ⚠️ **Döndürmede Başlangıç Noktası (Field Origin) Uyarısı:** `^FOx,y` başlangıç noktası metin döndürüldüğünde de referans noktasıdır. 90° (`R`) döndürdüğünüzde metin aşağıya doğru akar; 270° (`B`) döndürdüğünüzde yukarıya doğru akar. Koordinat verirken yazının etiket sınırlarından dışarı taşmamasına dikkat edin.

---

## 2. Çok Satırlı Metin ve Otomatik Blok Hizalama (`^FB`)

Adres veya ürün açıklaması gibi uzun metinlerin belirlenen genişlikte otomatik alt satıra geçmesi ve hizalanması için `^FB` (Field Block) komutu kullanılır:

$$\text{^FB} a, \text{ } b, \text{ } c, \text{ } d, \text{ } e$$

- `$a$`: Metin bloğunun maksimum genişliği (dot cinsinden).
- `$b$`: Maksimum satır sayısı.
- `$c$`: Satırlar arası ek boşluk (dot).
- `$d$`: Metin hizalaması:
  - `L`: Sola yasla (Left).
  - `C`: Ortala (Center).
  - `R`: Sağa yasla (Right).
  - `J`: İki yana yasla (Justified).
- `$e$`: İkinci ve sonraki satırlar için girinti (indent).

### Örnek 400-Dot Genişliğinde Ortalı Metin Bloğu:
```zpl
^XA
^FO50,100^A0N,26,26
^FB500,4,5,C,0
^FDAkdeniz Mah. Ataturk Cad. No:14 Kat:3 Daire:8 Konak / Izmir / Turkiye^FS
^XZ
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Metni etiketin tam ortasına matematiksel olarak nasıl yerleştiririm?
**Etiketinizin toplam genişliği 800 dot ise ve 600 dot genişliğinde bir metin bloğu açacaksanız, `^FO100,y` koordinatını verip `^FB600,n,0,C` tanımlamalısınız.** Sol boşluk: $(800 - 600) / 2 = 100$ dot olur ve blok içindeki metin tam sayfanın ortasına hizalanır.

### ZPL'de satır sonunu (`\n`) manuel olarak nasıl zorlarım?
**`^FB` komutu tanımlıyken metin içinde `\&` karakteri satır atlama (Carriage Return / Line Feed) görevi görür.** Örneğin `^FDSatır 1\&Satır 2\&Satır 3^FS` yazdığınızda ZPL her `\&` gördüğü yerde metni alt satıra kırar.

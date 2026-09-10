---
title: "ESC/POS ile Fişe Karekod (QR Code) ve EAN-13 Barkod Ekleme Rehberi"
description: "Termal fiş üzerine 2D QR kod ve 1D EAN-13/Code 128 barkod yerleştirme. GS ( k fonksiyon komutları, modül boyutu ve hata düzeltme seviyesi ayarları."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: esc-pos-qr-code-and-barcode-printing
---

Modern fiş tasarımlarında barkod ve karekodlar hayati bir rol oynar: Müşterinin faturaya veya sipariş takip sayfasına ulaşması için **QR Kod (Karekod)**, kasada iade işlemi veya kargo teslimatı için ise **1D Barkod (Code 128 / EAN-13)** kullanılır.

Web uygulamasından fişe barkod eklemenin iki yolu vardır: Görsel (image) olarak basmak veya yazıcının **dahili donanım barkod motorunu (Native ESC/POS Commands)** kullanmak. Dahili motoru kullanmak; veri boyutunu %95 azaltır, baskı hızını artırır ve lazer barkod okuyucuların anında yakalayabileceği jilet netliğinde çizgiler üretir.

Bu rehberde; ESC/POS 2D QR kod fonksiyonlarını (`GS ( k`) ve 1D barkod komutlarını (`GS k`) inceliyoruz.

---

## 1. Dahili QR Kod (Karekod) Basma: Dört Aşamalı `GS ( k` Mimarisi

ESC/POS standardında karekod basmak tek bir komutla değil, yazıcı tamponuna sırayla gönderilen 4 ardışık adımla gerçekleştirilir:

```
[ Adım 1: Model Seçimi ] ──► [ Adım 2: Modül Boyutu ] ──► [ Adım 3: Veri Yükleme ] ──► [ Adım 4: Yazdır! ]
(Model 2 / Standart)         (3-6 Nokta / Piksel)         (URL veya Metin)              (Kağıda Dök)
```

### TypeScript ile Tam QR Kod Üreteci:
```typescript
export function generateQrCodeEscPos(urlOrText: string, moduleSize = 6): Uint8Array {
  const bytes: number[] = [];
  const textBytes = new TextEncoder().encode(urlOrText);
  const textLen = textBytes.length + 3; // pL ve pH için offset

  const pL = textLen % 256;
  const pH = Math.floor(textLen / 256);

  // 1. QR Kod Modeli Seç (fn=65): Model 2
  bytes.push(0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);

  // 2. Modül Boyutu Belirle (fn=67): 1-16 arası nokta (Örn: 6)
  bytes.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, moduleSize);

  // 3. Hata Düzeltme Seviyesi (fn=69): Seviye M (%15) -> 0x31
  // Seviyeler: L: 0x30 (%7), M: 0x31 (%15), Q: 0x32 (%25), H: 0x33 (%30)
  bytes.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31);

  // 4. Veriyi Hafızaya Yükle (fn=80)
  bytes.push(0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30);
  textBytes.forEach(b => bytes.push(b));

  // 5. Hafızadaki QR Kodu Yazdır (fn=81)
  bytes.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);

  return new Uint8Array(bytes);
}
```

---

## 2. 1D Barkod Basma: EAN-13 ve Code 128 (`GS k`)

Ürün barkodu (EAN-13) veya sipariş takip kodu (Code 128) için `GS k` komutu kullanılır:

### 2.1. Code 128 Barkod Komut Bloğu:
```javascript
export function generateCode128EscPos(barcodeText, heightDots = 80) {
  const bytes = [];
  const textBytes = new TextEncoder().encode(barcodeText);

  // 1. Barkod Yüksekliği (GS h n)
  bytes.push(0x1D, 0x68, heightDots);

  // 2. Çizgi Genişliği Modülü (GS w n -> 2 veya 3 nokta)
  bytes.push(0x1D, 0x77, 0x02);

  // 3. İnsan Tarafından Okunabilir Metin Konumu (GS H n -> 2: Barkodun Altı)
  bytes.push(0x1D, 0x48, 0x02);

  // 4. Code 128 Barkod Bas (GS k 73 len data)
  // Code 128'de verinin başına alt küme belirteci {B eklenir ({B -> 0x7B 0x42)
  const payloadLen = textBytes.length + 2;
  bytes.push(0x1D, 0x6B, 73, payloadLen, 0x7B, 0x42);
  textBytes.forEach(b => bytes.push(b));

  return new Uint8Array(bytes);
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### QR kod yazıcıda neden küçük çıkıyor veya telefonla taranamıyor?
**QR kodun taranabilmesi için fiziksel boyutunun en az 20x20 mm olması ve "sessiz alan" (Quiet Zone / çevresindeki beyaz boşluk) bulunması gerekir.** Modül boyutunu `GS ( k` komutunda `moduleSize: 6` veya `8` yaparak karekodu büyütebilirsiniz. Ayrıca URL çok uzunsa karekod çok karmaşıklaşır; kısa link (URL shortener) kullanmak taranabilirliği artırır.

### Karekodu fişin tam ortasına nasıl hizalarım?
**QR kod komutlarını göndermeden önce `0x1B 0x61 0x01` (ESC a 1 - Ortala) komutunu göndermelisiniz.** QR kod basımı bittikten sonra metin akışını sola almak için `0x1B 0x61 0x00` (ESC a 0) göndermeyi unutmayın.

### Bazı ucuz yazıcılar `GS ( k` komutuna tepki vermiyor, nedeni nedir?
**Bazı çok eski veya düşük maliyetli Çin menşeli yazıcıların ROM'unda donanımsal QR motoru bulunmaz.** Bu tür yazıcılarda en güvenilir alternatif, JavaScript tarafında bir kütüphane (`qrcode`) kullanarak QR kodu 1-bit monokrom bitmape çevirmek ve `GS v 0` raster resim komutuyla basmaktır.

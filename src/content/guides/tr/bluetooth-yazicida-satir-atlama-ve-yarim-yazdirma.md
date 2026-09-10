---
title: "Bluetooth Termal Yazıcıda Satır Atlama ve Yarım Yazdırma Problemi ve Çözümü"
description: "Fiş yazdırırken bazı satırların kaybolması, fişin ortasında baskının durması veya kırmızı ışık yanması sorunu. RX buffer taşması ve akış kontrolü rehberi."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: bluetooth-printer-skipping-lines-half-printed-receipts
---

Bluetooth termal fiş yazıcılarla çalışırken en tehlikeli arızalardan biri, fişin başarıyla basılmış gibi görünmesi ama **ortadaki 3-4 ürünün hiç basılmaması (satır atlama)** veya **fişin tam toplam tutar kısmında aniden durup kırmızı hata ışığı yakmasıdır**.

Bu durum kasada eksik adisyon çıkmasına, restoranda mutfağa giden siparişin eksik hazırlanmasına ve müşteri ile işletme arasında ciddi hesap tartışmalarına yol açar.

Bu rehberde; satır atlamanın donanımsal ve yazılımsal nedenlerini ve kesin çözüm yöntemlerini inceliyoruz.

---

## 1. Neden Satırlar Atlanır? (RX Buffer Overflow)

Taşınabilir ucuz termal yazıcıların mikrodenetleyicilerinde (RAM) gelen verileri tutan **Alıcı Tamponu (RX Buffer)** son derece küçüktür (genellikle sadece 1 KB ile 4 KB arası).

```
[ Telefon / Tablet: 50 KB/s Hızında Veri Akıtır ]
                        │
                        ▼ (Aşırı Hızlı Akış)
        [ Yazıcı RX Buffer: 2 KB (DOLDU!) ] ──► [ FAZLA BAYTLAR ÇÖPE ATILIR! ]
                        │
                        ▼ (Termal Kafa Saniyede Sadece 50 Satır Isıtabilir)
             [ Kağıda Eksik Fiş Çıkar ]
```

Yazıcı kağıdı ısıtıp mekanik motorla ilerletirken gelen veriyi işlemekte gecikirse, hafıza taşar ve aradaki satırlar sanki hiç gönderilmemiş gibi kaybolur.

---

## 2. Yazılımsal Çözüm: Akış Kontrolü (Flow Control & Throttling)

Uygulamanız Bluetooth üzerinden fiş basarken tüm metni tek bir `write` işlemiyle boca etmemelidir:

```javascript
// ✅ DOĞRU: Her 100 baytta bir veya her satırda 15ms bekleme ekleyin
async function printWithSafeFlowControl(characteristic, bytes) {
  const CHUNK = 32; // 32-baytlık güvenli paketler
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.slice(i, i + CHUNK);
    await characteristic.writeValue(slice);
    // Yazıcı kafa motorunun yetişmesi için gecikme
    await new Promise(r => setTimeout(r, 15));
  }
}
```

---

## 3. Donanımsal Neden: Düşük Batarya Voltajı Çökmesi (Brown-Out)

Termal yazıcılar metin basarken bataryadan anlık olarak **1.5 ila 2.5 Amper arası çok yüksek pik akım** çeker:
- Eğer batarya şarjı %20'nin altındaysa veya pil eskimişse, kafa aynı anda çok sayıda noktayı ısıttığında (örneğin kalın bir siyah çizgi veya QR kod basarken) pil voltajı aniden 7.4V'tan 5V'un altına düşer (**Brown-Out Reset**).
- Yazıcı kendini korumaya alarak aniden yeniden başlar (Reset atar) ve fiş yarım kalır.

---

## 4. Sıkça Sorulan Sorular (SSS)

### Yazıcı fişin yarısında kırmızı ışık yakıp ötüyor, sebebi nedir?
**Bu durum %90 ihtimalle kağıt rulosunun bitmek üzere olmasından (Paper End Sensörü) veya bataryanın ısıtma akımını karşılayamamasından kaynaklanır.** Cihazı şarja takarak ve rulo yuvasını kontrol ederek tekrar deneyin.

### Yoğun siyah logolar basarken yazıcı neden yavaşlıyor veya duruyor?
**Termal kafa aşırı ısınma korumasına (Thermal Overheat Protection) girer.** Kafa sıcaklığı $65^\circ\text{C}$ üzerine çıktığında donanım otomatik olarak baskıyı durdurur, kafa soğuyana kadar bekler. Çözüm için logonun siyah yoğunluğunu azaltmalı (Dithering) veya yazıcı ayarlarından "Darkness" seviyesini düşürmelisiniz.

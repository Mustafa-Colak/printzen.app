---
title: "Bluetooth GATT Karakteristiğine ESC/POS Byte Array Gönderme Rehberi"
description: "Web Bluetooth ile termal yazıcının GATT yazma karakteristiğini bulma, writeValueWithResponse vs writeValueWithoutResponse farkı ve bayt dizisi iletimi."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: sending-escpos-byte-arrays-bluetooth-gatt-characteristic
---

Bluetooth Low Energy (BLE) mimarisinde veri alışverişi **GATT (Generic Attribute Profile)** protokolü üzerinden gerçekleşir. Bir termal yazıcıya bağlandığınızda, fiş metinlerini ve kesme komutlarını iletmek için yazıcının **Yazılabilir Karakteristiğine (Writable Characteristic)** erişmeniz ve bu karakteristiğe ikili bir bayt dizisi (`Uint8Array` / `ArrayBuffer`) yazmanız gerekir.

Bu rehberde; GATT servis hiyerarşisini, yazma yöntemleri arasındaki performans farklarını ve JavaScript kodlama adımlarını inceliyoruz.

---

## 1. GATT Hiyerarşisi: Device -> Server -> Service -> Characteristic

BLE veri iletimi iç içe geçmiş bir ağaç yapısı gibidir:

```
[ Bluetooth Device: "Mpt-II" ]
          │
          ▼ .gatt.connect()
[ GATT Server ]
          │
          ▼ .getPrimaryService(serviceUuid)
[ Primary Service: 0000e781-... ]
          │
          ▼ .getCharacteristic(characteristicUuid)
[ Writable Characteristic: 0000bef8-... ]
          │
          ▼ .writeValue(Uint8Array)
[ Fiziksel Yazıcı Baskı Kafası ]
```

---

## 2. `writeValueWithResponse` vs. `writeValueWithoutResponse`

BLE standardında karakteristiğe veri yazarken iki farklı metod bulunur:

| Metod | Çalışma Prensibi | Hız | Güvenilirlik |
|---|---|---|---|
| **`writeValueWithResponse`** | Her paketten sonra yazıcıdan ACK (onay) bekler | Yavaş (~30-50 ms/paket) | Çok Yüksek (Paket kaybı olmaz) |
| **`writeValueWithoutResponse`** | Onay beklemeden arka arkaya fırlatır | Işık Hızında (~5-10 ms/paket) | Tampon dolarsa paket düşebilir |

> 💡 **Tavsiye:** Fiş basarken yüksek hız elde etmek için önce karakteristiğin `properties.writeWithoutResponse` yeteneğini kontrol edin; destekleniyorsa araya 10-15 ms gecikme koyarak bu metodu kullanın.

---

## 3. Baştan Sona JavaScript Gönderim Fonksiyonu

```javascript
export async function writeEscPosToCharacteristic(characteristic, bytePayload) {
  // Karakteristiğin desteklediği yazma modu
  const useFastWrite = characteristic.properties.writeWithoutResponse;

  const CHUNK_SIZE = 20; // 20-baytlık dilimler
  for (let i = 0; i < bytePayload.length; i += CHUNK_SIZE) {
    const chunk = bytePayload.slice(i, i + CHUNK_SIZE);
    
    if (useFastWrite) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValueWithResponse(chunk);
    }

    // Donanım tamponunun nefes alması için kısa bekleme
    await new Promise(r => setTimeout(r, 12));
  }
}
```

---

## 4. Sıkça Sorulan Sorular (SSS)

### `GATT operation already in progress` hatası neden alınır?
**Bir önceki `writeValue` işlemi henüz tamamlanmadan ardışık ikinci bir `writeValue` çağrısı tetiklendiğinde tarayıcı bu hatayı fırlatır.** Bu hatayı önlemek için döngüde mutlaka `await` kullanılmalı ve eşzamanlı (asenkron paralel) yazma girişimleri bir kuyruk mekanizması ile sıraya dizilmelidir.

### Yazıcımın karakteristik UUID'sini bilmiyorsam nasıl bulabilirim?
**`const services = await server.getPrimaryServices();` ile tüm servisleri çekip içlerindeki karakteristikleri döngüyle tarayabilirsiniz.** `char.properties.write === true` veya `writeWithoutResponse === true` olan ilk karakteristik neredeyse tüm fiş yazıcılarında doğru veri portudur.

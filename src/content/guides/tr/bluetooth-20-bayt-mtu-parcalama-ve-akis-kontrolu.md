---
title: "Bluetooth 20-Byte (MTU) Veri Parçalama ve Akış Kontrolü Kılavuzu"
description: "BLE termal yazıcılarda 20-byte MTU limitini aşma, GATT buffer taşmalarını önleme, paket parçalama (chunking) ve gecikme (throttling) algoritmaları."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: bluetooth-20-byte-mtu-slicing-flow-control
---

Web Bluetooth veya mobil BLE uygulamaları geliştirirken karşılaşılan en yaygın kriz şudur: Yazıcıya 500 baytlık bir fiş metni gönderirsiniz; yazıcı fişin ilk satırını basar, ardından donar ve tarayıcı konsolunda **`NetworkError: GATT operation failed`** hatası patlar.

Bu hatanın donanım bozukluğuyla ilgisi yoktur; nedeni Bluetooth Low Energy standardının temel taşı olan **MTU (Maximum Transmission Unit - Maksimum İletim Birimi)** sınırıdır.

---

## 1. BLE MTU Sınırı Nedir? Neden 20 Bayt?

Bluetooth Low Energy (BLE 4.0 / 4.2) protokolünde varsayılan ATT (Attribute Protocol) paket boyutu **23 bayttır**:
- 1 Bayt: Opcode (Komut Tipi)
- 2 Bayt: Attribute Handle (Hedef Karakteristik Adresi)
- **Geriye Kalan Net Veri Yükü (Payload): 20 Bayt**

$$\text{Maksimum Güvenli Paket Boyutu} = 23 - 3 = \mathbf{20\text{ Bayt}}$$

Bir yazıcıya tek bir `writeValue` çağrısıyla 20 bayttan büyük veri gönderdiğinizde, mikrodenetleyici paketi parçalayamaz ve iletişim protokol seviyesinde çöker.

---

## 2. Paket Parçalama (Chunking / Slicing) ve Gecikme Algoritması

Tam bir fiş çıktısı oluşturabilmek için veriyi 20'şer baytlık dilimlere bölmeli ve her dilim arasında yazıcının mekanik adım motorunun ve dahili RAM tamponunun rahatlaması için küçük bir bekleme süresi (**Throttling Delay**) bırakmalısınız:

```typescript
export async function sendThrottledBleData(
  characteristic: BluetoothRemoteGATTCharacteristic,
  data: Uint8Array,
  chunkSize = 20,
  delayBetweenChunksMs = 15
): Promise<void> {
  const totalChunks = Math.ceil(data.length / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, data.length);
    const chunk = data.slice(start, end);

    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValueWithResponse(chunk);
    }

    // Donanım akış kontrolü gecikmesi
    if (delayBetweenChunksMs > 0 && i < totalChunks - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenChunksMs));
    }
  }
}
```

---

## 3. İdeal Gecikme Süresi (Delay) Nasıl Seçilir?

- **0 ms (Gecikmesiz):** `writeValueWithResponse` kullanılıyorsa teorik olarak gecikme gerekmeyebilir; ancak her pakette ACK beklenmesi 1 KB'lık bir fişin 3 saniyede basılmasına yol açar.
- **10 - 15 ms:** `writeValueWithoutResponse` ile birlikte mükemmel denge noktasıdır. Fiş 0.5 saniyede akar ve donanım tamponu asla taşmaz.
- **25+ ms:** Düşük pilli veya eski işlemcili çok ucuz mobil yazıcılarda satır atlama yaşanıyorsa gecikmeyi 25 milisaniyeye çıkarmak stabiliteyi kurtarır.

---

## 4. Sıkça Sorulan Sorular (SSS)

### BLE 5.0 yazıcılarda MTU boyutu 256 veya 512 bayta çıkarılamaz mı?
**Web Bluetooth API şu an için JavaScript üzerinden istemci kontrollü MTU müzakeresi (MTU Exchange Request) yapılmasına izin vermemektedir.** Tarayıcı motoru işletim sistemi düzeyinde otomatik anlaştığı MTU'yu kullanır; ancak tüm yazıcı modelleriyle (%100 uyumluluk için) veriyi daima en küçük ortak payda olan 20 baytlık paketlere bölmek altın kuraldır.

### Çok hızlı yazdırınca yazıcının bazı satırları atlamasının sebebi nedir?
**Bunun nedeni "Buffer Overflow" (Tampon Bellek Taşması) durumudur.** Termal yazıcının mikrodenetleyicisi Bluetooth radyosundan gelen veriyi termal kafa ısıtma hızından daha hızlı aldığında, yetişemediği baytları bellekten atar. Paketler arası 15 ms gecikme eklemek bu sorunu tamamen yok eder.

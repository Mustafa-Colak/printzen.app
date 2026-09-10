---
title: "Taşınabilir Mobil Termal Yazıcı Batarya ve Uyku Modu (Sleep) Yönetimi"
description: "Mobil fiş yazıcılarının pil ömrünü uzatma, derin uyku modu (deep sleep) kopmalarını önleme, keep-alive heartbeat sinyalleri ve güç optimizasyonu."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: portable-thermal-printer-battery-sleep-mode-management
---

Saha satış temsilcileri, kuryeler ve otopark görevlileri için taşınabilir Bluetooth termal yazıcının şarjının günün ortasında bitmesi veya yazıcının sürekli uykuya dalarak bağlantıyı koparması büyük bir verimlilik kaybıdır.

Bir yandan bataryanın 8-10 saatlik bir vardiyayı rahatça çıkarması istenirken, diğer yandan personelin her fiş basışında "Cihaz Uyanıyor..." diye 10 saniye beklememesi gerekir.

Bu rehberde; termal yazıcı güç tasarrufu mimarisini, Auto-Sleep sürelerinin ayarlanmasını ve Keep-Alive (Uyanık Tutma) sinyallerini inceliyoruz.

---

## 1. Termal Yazıcı Güç Tüketim Modları

| Güç Modu | Akım Tüketimi | Bluetooth Durumu | Uyanma Süresi |
|---|---|---|---|
| **Aktif Baskı (Printing)** | **1.5 A - 2.5 A** (Pik Güç) | Bağlı ve Aktif | Anında |
| **Bekleme (Standby)** | 30 mA - 60 mA | Radyo Açık, Dinlemede | Anında (< 100 ms) |
| **Derin Uyku (Deep Sleep)** | < 1 mA | **Radyo Kapalı (Bağlantı Kopar)** | 3 - 8 Saniye (Yeniden Bağlantı) |

---

## 2. Derin Uyku Kopmalarını Önleme: Keep-Alive Kalp Atışı (Heartbeat)

Eğer yazıcınız 3 dakika işlem yapılmadığında Bluetooth'u tamamen kapatıyorsa, uygulamanız arka planda her 60 saniyede bir yazıcıya zararsız bir **Durum Sorgulama Baytı (DLE EOT)** gönderebilir:

```javascript
// DLE EOT 1 -> Yazıcı durumunu sorgula (Yazıcıyı uyandırır, kağıt harcamaz)
export function startKeepAliveHeartbeat(characteristic, intervalMs = 60000) {
  const pingByte = new Uint8Array([0x10, 0x04, 0x01]);

  return setInterval(async () => {
    try {
      await characteristic.writeValueWithoutResponse(pingByte);
      console.log('Keep-alive sinyali gonderildi.');
    } catch (err) {
      console.warn('Yazici uykuya dalmis olabilir:', err.message);
    }
  }, intervalMs);
}
```

---

## 3. Batarya Ömrünü 2 Katına Çıkarma Tüyoları

1. **Baskı Koyuuluğunu (Darkness) Azaltın:** Termal noktaların ısıtılma süresini 100 µs yerine 70 µs yapmak pil tüketimini doğrudan %30 azaltır ve kağıt yine gayet net okunur.
2. **Gereksiz Siyah Alanları ve Logoları Kaldırın:** Katı siyah zeminler pilden maksimum akım çeker. Logoları Floyd-Steinberg ditherleme ile seyreltin.
3. **Kağıt Kesme ve Boş Satırları Sınırlandırın:** Fişin altında gereksiz 10 satır boşluk bırakmak motorun fazladan dönmesine ve bataryanın tükenmesine neden olur.

---

## 4. Sıkça Sorulan Sorular (SSS)

### Taşınabilir termal yazıcının pili tam şarjla kaç fiş basabilir?
**Sağlıklı bir 2000 mAh lityum bataryaya sahip standart 58mm bir mobil yazıcı, tek şarjla ortalama 150 ila 250 adet standart uzunlukta (15 cm) fiş basabilir.** Baskı yoğunluğu ve bekleme süresi bu sayıyı etkiler.

### Araç şarj kiti ile yazıcı sürekli şarjda tutulursa batarya bozulur mu?
**Yeni nesil yazıcıların çoğunda aşırı şarj koruması (BMS) bulunur.** Ancak yaz yaz aylarında torpido gözünde veya araç içinde $50^\circ\text{C}$ üzeri sıcaklıklarda sürekli şarjda bırakmak lityum pillerin şişmesine yol açabilir; araç çalışmadığında cihaz gölgede muhafaza edilmelidir.

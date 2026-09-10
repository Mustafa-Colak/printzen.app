---
title: "Termal Yazıcı Bluetooth Eşleşme PIN Kodu Sorunları ve Çözümü (0000 / 1234)"
description: "Bluetooth fiş ve etiket yazıcılarda PIN kodu reddedildi veya eşleştirilemedi hatası. Fabrika PIN kodları listesi, Self-Test ile PIN öğrenme ve sıfırlama."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: thermal-printer-bluetooth-pin-code-pairing-issues
---

Yeni bir taşınabilir termal fiş yazıcıyı telefon veya bilgisayarla eşleştirmeye çalışırken ekranda beliren en sinir bozucu uyarı **"PIN kodu yanlış veya cihaz eşleştirilemedi"** hatasıdır. Kutunun içinden çıkan kullanım kılavuzunda yazan şifreyi girseniz bile bazı cihazlar eşleşmeyi reddeder.

Bu rehberde; marka bazında varsayılan PIN kodlarını, yazıcının gerçek şifresini Self-Test ile öğrenmeyi ve kilitlenen Bluetooth modüllerini sıfırlamayı ele alıyoruz.

---

## 1. Üreticiye Göre Varsayılan Bluetooth PIN Kodları

Taşınabilir termal yazıcıların %95'i aşağıdaki 4 şifreden birini kullanır:

| Marka / Model Grubu | Varsayılan PIN Kodu | Alternatif PIN |
|---|---|---|
| **Epson, Bixolon, Star** | `0000` | `1234` |
| **Xprinter, Milestone, Zjiang, Hoin** | `1234` | `0000` |
| **Goojprt, PeriPage, Taşınabilir Mini 58mm** | `1234` | `8888` |
| **Zebra Taşınabilir (ZQ Serisi)** | `0000` | `1234` veya PIN'siz |
| **Rongta, Posiflex** | `0000` | `1111` |

---

## 2. Yazıcının Gerçek PIN Kodunu Öğrenme: Self-Test Raporu

Tahmin yürütmek yerine yazıcının dahili belleğindeki şifreyi doğrudan kağıda bastırabilirsiniz:

1. Yazıcının güç düğmesini kapatın.
2. Kağıt besleme (**FEED**) butonuna basılı tutun.
3. Parmağınızı FEED butonundan çekmeden açma-kapama düğmesini açın.
4. Yazıcı mekanik bir sesle test fişini basmaya başladığında FEED butonunu bırakın.
5. Fişin üzerindeki **"Bluetooth Info"** veya **"PIN / Passkey"** satırını bulun:
   - `Bluetooth Name: MPT-II`
   - `Pin Code: 1234` (veya `0000`)
   - `BD Address: 66:32:B1:84:92:14`

Burada yazan değer yazıcının kesin ve güncel eşleşme şifresidir.

---

## 3. Sıkça Sorulan Sorular (SSS)

### Doğru PIN kodunu girdiğim halde telefon neden "Eşleştirilemedi" hatası veriyor?
**Yazıcının dahili Bluetooth eşleşme tablosu dolmuş olabilir.** Birçok ucuz mobil yazıcı hafızasında en fazla 4 veya 8 telefonun eşleşme kaydını tutabilir. Kapasite dolduğunda yeni cihazları reddeder. Yazıcıyı kapatıp açarken FEED + POWER tuşuna 10 saniye basılı tutarak veya Windows USB yapılandırma aracından fabrika ayarlarına sıfırlayarak (Factory Reset) hafızayı temizleyin.

### PIN kodu olmadan şifresiz eşleşen termal yazıcılar var mı?
**Evet, Bluetooth 4.0 ve üzeri BLE (Low Energy) moduna sahip yeni nesil yazıcılar "Just Works" (Şifresiz Güvenli Eşleşme) standardını kullanır.** Bu yazıcılar telefonun ayarlar menüsünde PIN sormaz; doğrudan POS uygulaması içinden tek dokunuşla bağlanır.

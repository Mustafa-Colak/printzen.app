---
title: "Restoran Fiş Yazıcısına Sesli Uyarı (Buzzer) ve Alarm Bağlama Rehberi"
description: "Mutfak adisyon yazıcılarına harici buzzer ve flaşör lamba bağlama. RJ11 kasa portu üzerinden 24V alarm tetikleme ve ESC/POS ses komutları."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: connecting-audio-buzzers-and-flashing-alarms-receipt-printers
---

Gürültülü bir restoran mutfağında tava cızırtıları, bulaşıkhane sesleri ve davlumbaz uğultusu arasında sessizce çıkan bir kağıt fişi hiçbir aşçı fark edemez. Siparişin 15 dakika boyunca yazıcıda asılı kalması ve müşteri şikayeti gelmesi restoranlarda sıkça yaşanan bir kabustur.

Bu sorunun kesin çözümü, mutfak adisyon yazıcısına **Harici Akustik Buzzer (Sesli Siren)** veya **Flaşörlü LED Lamba** bağlamaktır.

---

## 1. Donanım Bağlantısı: RJ11 / RJ12 Kasa Portu

Termal yazıcıların arkasında bulunan standart RJ11 (Kasa Çekmecesi) portu, aslında 24V elektrik darbesi veren bir röle anahtarıdır.

1. Piyasada satılan standart "Restoran Fiş Yazıcı Buzzerı" aparatını alın (üzerinde küçük bir hoparlör ve LED ışık bulunur).
2. Buzzerın RJ11 kablosunu yazıcının arkasındaki kasa simgeli porta takın.
3. Bazı kurumsal Epson modellerinde (Epson TM-T88VI veya TM-U220) yazıcının dahili gövdesine gömülü piezo buzzer (Internal Buzzer) da bulunabilir.

---

## 2. ESC/POS ile Buzzer'ı Tetikleme Komutları

### Yöntem A: RJ11 Portuna Elektrik Darbesi Gönderme (`ESC p`)
Harici takılan tüm buzzer modelleri bu komutla çalar:
```javascript
// ESC p 0 25 250 -> Pin 2'ye 50ms elektrik darbesi ver
const triggerExternalBuzzer = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
```

### Yöntem B: Epson Dahili Ses Komutu (`ESC ( A`)
Yazıcının kendi dahili hoparlörünü öttürmek için:
```javascript
// 3 kez kesik kesik biple
const triggerInternalBeep = new Uint8Array([
  0x1B, 0x28, 0x41, 0x04, 0x00, 0x61, 0x03, 0x02, 0x02
]);
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Fiş basıldıktan sonra aşçı fişi alana kadar buzzerın sürekli ötmesini sağlayabilir miyim?
**Evet, akıllı "Sensörlü Mutfak Buzzerları" fiş kağıdının çıkış haznesinde optik bir sensör barındırır.** Fiş basıldığında alarm çalmaya başlar; aşçı fişi eline alıp çekene kadar lamba yanıp söner ve sesli ikaz susmaz.

### Buzzer ses seviyesi çok yüksek gelirse kısılabilir mi?
**Harici buzzerların çoğunun arkasında ses seviyesini (Düşük / Yüksek / Kapalı) ayarlayan küçük bir mekanik sürgü anahtarı bulunur.** Açık mutfak veya bar alanlarında ses seviyesi "Düşük" moduna alınabilir.

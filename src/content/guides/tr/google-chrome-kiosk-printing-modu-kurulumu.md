---
title: "Google Chrome Kiosk Printing Modu Kurulumu ve Parametreleri Rehberi"
description: "Google Chrome'da --kiosk-printing ve --kiosk bayraklarıyla yazdırma diyaloğunu tamamen atlayarak tek tıkla sessiz fiş basma konfigürasyonu."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: google-chrome-kiosk-printing-setup-parameters
---

Kasa noktalarında (POS) kasiyerlerin hızını kesen en büyük etken, her fiş basımında tarayıcının ekrana getirdiği **Yazdırma Önizleme (Print Preview)** penceresidir. 

Chromium tabanlı tarayıcılar (Google Chrome, Microsoft Edge, Brave, Opera), bu pencereyi tamamen kapatıp yazdırma işini doğrudan varsayılan yazıcıya göndermek için özel bir **Kiosk Printing** moduna sahiptir.

---

## 1. Temel Başlatma Parametreleri (Chrome Flags)

| Parametre | Görevi |
|---|---|
| `--kiosk-printing` | Yazdırma penceresini (Ctrl+P diyaloğunu) atlar, doğrudan varsayılan yazıcıya basar. |
| `--kiosk` | Tarayıcıyı tam ekran açar; adres çubuğunu, sekmeleri ve pencere kapatma butonlarını gizler. |
| `--disable-print-header-footer` | Sayfanın üstünde ve altında çıkan URL, tarih ve sayfa numarası yazılarını siler. |

---

## 2. Windows Kısayolu Üzerinde Yapılandırma

1. Masaüstündeki Google Chrome kısayolunu kopyalayıp adını **"POS Kiosk"** yapın.
2. Sağ tıklayıp **Özellikler (Properties)** seçin.
3. **Hedef (Target)** satırının sonuna aşağıdaki gibi parametreleri ekleyin:

```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --disable-print-header-footer https://kasa.magazaniz.com
```

4. "Uygula" ve "Tamam" diyerek pencereyi kapatın. Artık bu kısayola tıklandığında açılan sayfada `window.print()` tetiklendiği anda fiş doğrudan fiziksel yazıcıdan çıkacaktır.

---

## 3. CSS ile Sayfa Boyutu ve Kenar Boşluklarını Sıfırlama

Kiosk Printing modunda tarayıcının fiş kağıdının kenarlarında beyaz boşluk bırakmaması için web sayfanızın CSS'ine şu kuralı eklemelisiniz:

```css
@media print {
  @page {
    /* 80mm rulo için genişlik: 80mm, yükseklik: otomatik */
    size: 80mm auto;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
    width: 80mm;
  }
}
```

---

## 4. Sıkça Sorulan Sorular (SSS)

### Kiosk Printing modunda hangi yazıcıya çıktı gideceğini nasıl seçerim?
**`--kiosk-printing` parametresi her zaman işletim sisteminde (Windows/macOS) "Varsayılan Yazıcı" (Default Printer) olarak işaretlenmiş cihaza basar.** Başka bir cihaza basmak istiyorsanız Windows Ayarları > Yazıcılar menüsünden varsayılan yazıcıyı değiştirmeniz gerekir.

### Personelin Kiosk tam ekran modundan çıkmasını nasıl engellerim?
**`--kiosk` parametresi F11 veya Esc tuşlarıyla tam ekrandan çıkılmasını engeller.** Çıkış yapmak için sadece `Alt + F4` tuş kombinasyonu çalışır. Windows Kiosk kullanıcı hesabı (Assigned Access) ile birleştirildiğinde personel işletim sistemi masaüstüne asla erişemez.

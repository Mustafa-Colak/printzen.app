---
updatedDate: 2026-09-24
title: "Android'de Bluetooth Termal Yazıcı Kurulumu"
description: "Android telefon veya tabletinizi Bluetooth termal yazıcıya bağlayıp sistem yazdırma menüsünden fiş veya etiket basmayı öğrenin."
printerClass: mobile
publishDate: 2026-07-06
translationKey: android-bluetooth-printer-setup
---

Android'in yerleşik Print Service çerçevesi, bir yazdırma servisi kurulduğunda herhangi bir uygulamadan (Chrome, Google Docs, e-ticaret uygulamaları vb.) doğrudan termal yazıcıya baskı almanıza izin verir. Bu rehber, Bluetooth bağlantılı bir termal yazıcıyı Android cihazınıza tanıtma adımlarını anlatır.

## 1. Yazıcıyı eşleştirin

Yazıcıyı açın ve Android'in Bluetooth ayarlarından (Ayarlar → Bağlı cihazlar → Yeni cihaz eşle) yazıcıyı bulup eşleştirin. Çoğu termal yazıcıda varsayılan eşleştirme PIN'i `0000` veya `1234`'tür.

## 2. Yazdırma servisini kurun

Bir Print Service uygulaması (örneğin Mobile Print Service), Android'e "bu cihazlara yazdırabilirim" bilgisini veren köprüdür. Uygulamayı kurduktan sonra Ayarlar → Yazdırma bölümünden servisin etkin olduğunu doğrulayın.

## 3. Yazıcıyı ekleyin

Yazdırma servisi uygulamasını açıp eşleştirdiğiniz Bluetooth yazıcıyı listeden seçin. Yazıcı markasına göre bağlantı protokolü (örneğin ESC/POS) otomatik algılanır.

## 4. Herhangi bir uygulamadan yazdırın

Artık Chrome'da bir sayfayı, Google Dosyalar'da bir belgeyi veya herhangi bir uygulamanın paylaşım/yazdırma menüsünü kullanarak sistem yazdırma dialogunu açtığınızda yazıcınızı seçenekler arasında görebilirsiniz.

## Sık karşılaşılan sorunlar

- **Yazıcı listede görünmüyor** — Bluetooth eşleştirmesinin tamamlandığından ve yazdırma servisinin Ayarlar'da etkin olduğundan emin olun.
- **Baskı alınıyor ama bozuk çıkıyor** — yazıcının komut dilinin (ESC/POS, SII SDK vb.) yazdırma servisi tarafından desteklendiğinden emin olun; desteklenmeyen bir komut dili karakter/barkod bozulmalarına yol açabilir.
- **Bağlantı sık kopuyor** — Bluetooth menzili ve pil tasarrufu modlarının bağlantıyı kesmediğinden emin olun.

## Sıkça Sorulan Sorular (SSS)

### Android cihazınızda Bluetooth yazıcıyı nasıl kurarım?

Android cihazınızda Bluetooth termal yazıcıyı kurmak için öncelikle cihazı Bluetooth üzerinden eşleştirin (Ayarlar → Bağlı Cihazlar). Yazdırma servisi uygulamasını yükleyip yazıcınızı eklediğinizde, sistem otomatik olarak protokolü algılayacaktır. Yazıcı görünmüyorsa, Bluetooth eşleştirmesinin tamamlandığını ve yazdırma servisinin etkin olduğundan emin olun.

### Android Bluetooth eşleştirmede PIN kodu veya şifre isterse ne yapmalıyım?

Eşleştirme esnasında şifre (PIN) sorulduğunda en yaygın fabrika varsayılan kodlarını deneyin: `0000`, `1234`, `1111` veya `8888`. Çoğu termal yazıcıda cihaz kapalıyken besleme (FEED) tuşuna basılı tutup açarak bir self-test (öz denetim) fişi yazdırabilirsiniz; fabrika varsayılan PIN kodu genellikle bu fişin en altında açıkça belirtilir.

### Bir termal yazıcıyı Android cihazıma nasıl bağlayabilirim?

Termal yazıcınızı Android cihazınıza bağlamak için: (1) Bluetooth üzerinden eşleştirme yapın ve varsayılan PIN'ler gibi `0000` veya `1234` kullanın. (2) Ayarlar → Yazdırma'dan bir yazdırma hizmeti uygulaması yükleyin ve etkinleştirin. (3) Yazdırma hizmeti uygulamasını açın, eşleşmiş yazıcınızı seçin ve protokol tespitini onaylayın. (4) Herhangi bir uygulamada sistem yazdırma diyalogunu kullanarak içeriği doğrudan yazıcıya gönderin. Kurulum sırasında Bluetooth'un etkin olduğundan ve yazıcının erişim范围内 olduğundan emin olun.

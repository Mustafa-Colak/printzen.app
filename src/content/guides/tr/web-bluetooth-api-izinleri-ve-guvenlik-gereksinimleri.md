---
title: "Web Bluetooth API Tarayıcı İzinleri ve Güvenlik Gereksinimleri Kılavuzu"
description: "Tarayıcıdan termal yazıcıya bağlanırken HTTPS zorunluluğu, User Gesture (kullanıcı jesti) kuralları ve chrome://flags üzerinden Bluetooth izinlerini yapılandırma."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: web-bluetooth-api-permissions-security-requirements
---

Web Bluetooth API, web sayfalarının kullanıcı bilgisayarındaki veya tabletindeki Bluetooth çevre birimleriyle doğrudan iletişim kurmasını sağlayan devrim niteliğinde bir W3C standardıdır. Ancak doğrudan donanıma erişim sağladığı için tarayıcı geliştiricileri çok katı güvenlik bariyerleri uygulamıştır.

Bu güvenlik kurallarını bilmeyen geliştiriciler sıklıkla `SecurityError: Must be handling a user gesture to show a permission request` veya `DOMException: Origin is not secure` hatalarıyla karşılaşır.

---

## 1. Güvenli Bağlantı Zorunluluğu (Secure Context / HTTPS)

Web Bluetooth API yalnızca **Secure Context** olarak tanımlanan ortamlarda aktiftir:
- Canlı sunucularda mutlaka geçerli bir **SSL/TLS sertifikası (`https://`)** bulunmalıdır. HTTP üzerinden açılan sayfalarda `navigator.bluetooth` objesi `undefined` olarak döner.
- **İstisna:** Yerel geliştirme ortamları olan `http://localhost`, `http://127.0.0.1` güvenli kabul edilir ve sertifikasız test yapılabilir.

---

## 2. Kullanıcı Etkileşimi Zorunluluğu (Transient User Activation)

Bir web sitesi sayfa açılır açılmaz arka planda gizlice Bluetooth taraması başlatamaz:

$$\text{Tıklama / Dokunma} \quad \longrightarrow \quad \texttt{navigator.bluetooth.requestDevice()} \quad \longrightarrow \quad \text{İzin Diyaloğu}$$

```javascript
// ❌ HATALI: Sayfa yüklenirken çağrılırsa SecurityError fırlatır
window.addEventListener('load', async () => {
  await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
});

// ✅ DOĞRU: Kullanıcı bir butona bizzat tıkladığında çağrılmalıdır
document.getElementById('connectBtn').addEventListener('click', async () => {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }]
  });
});
```

---

## 3. Chrome Flags ve Masaüstü Yapılandırması

Özellikle Windows ve Linux ortamlarında Chrome'un Bluetooth cihazları sorunsuz taraması için şu ayarlar gerekebilir:
1. Adres çubuğuna `chrome://flags` yazın.
2. **"Experimental Web Platform features"** seçeneğini bulun ve `Enabled` yapın.
3. Linux sistemlerde BlueZ servisinin çalıştığından emin olun (`sudo systemctl status bluetooth`).

---

## 4. Sıkça Sorulan Sorular (SSS)

### Yerel ağdaki (192.168.1.50 gibi) test sunucumda Web Bluetooth çalışmıyor, neden?
**Tarayıcılar yerel IP adreslerini (localhost hariç) güvenli bölge (Secure Context) saymaz.** Geliştirme aşamasında test cihazından bu IP'ye erişebilmek için Chrome'u `--unsafely-treat-insecure-origin-as-secure="http://192.168.1.50:3000"` parametresiyle başlatmalı veya ngrok gibi bir HTTPS tüneli kullanmalısınız.

### Kullanıcı bir kez izin verdikten sonra her fişte tekrar cihaz seçmek zorunda mı?
**Hayır, bağlantı açık kaldığı sürece aynı oturumda tek tıkla doğrudan fiş basılabilir.** Hatta Chrome'un yeni `navigator.bluetooth.getDevices()` API'si sayesinde daha önce izin verilmiş cihazlar taranmadan arka planda sessizce tekrar bağlanabilir.

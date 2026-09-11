---
title: "WebUSB ve WebHID ile Tarayıcıdan Kablolu Doğrudan Donanım İletişimi"
description: "USB kablosuyla bağlı termal yazıcıları tarayıcı seviyesinde Vendor ID (VID) ve Product ID (PID) ile talep etme, USB endpoint yapılandırması ve sürücüsüz web baskısı."
printerClass: "desktop"
brand: "Generic"
publishDate: 2026-09-11
translationKey: "webusb-ve-webhid-ile-kablolu-donanim-iletisimi"
topicCluster: "hub-10"
---

WebUSB ve WebHID standartları, Chrome ve Edge tarayıcılarının masaüstünde işletim sistemi seviyesinde yazıcı sürücüsü (Windows spooler) aracı olmadan doğrudan USB aygıtlarıyla iletişim kurmasını sağlar.

```javascript
// WebUSB ile doğrudan USB Yazıcı İletişimi
const device = await navigator.usb.requestDevice({
  filters: [{ classCode: 7 }] // 7 = Printer Class
});
await device.open();
await device.selectConfiguration(1);
await device.claimInterface(0);

const endpoint = device.configuration.interfaces[0].alternates[0].endpoints.find(
  e => e.direction === 'out'
);

const data = new TextEncoder().encode('\x1B@PRINTZEN USB TEST\n\n\x1DV\x41\x03');
await device.transferOut(endpoint.endpointNumber, data);
```

## Popüler Yazıcı Modeli Özelinde Kılavuzlar

- [Bixolon Slp Tx400 Webusb](/tr/rehber/bixolon-slp-tx400-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Bixolon Spp R200iii Webusb](/tr/rehber/bixolon-spp-r200iii-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Bixolon Spp R310 Webusb](/tr/rehber/bixolon-spp-r310-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Bixolon Srp 330ii Webusb](/tr/rehber/bixolon-srp-330ii-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Bixolon Srp 350iii Webusb](/tr/rehber/bixolon-srp-350iii-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Bixolon Srp Q300 Webusb](/tr/rehber/bixolon-srp-q300-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Epson Tm L90 Webusb](/tr/rehber/epson-tm-l90-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Epson Tm M30ii Webusb](/tr/rehber/epson-tm-m30ii-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Epson Tm P20ii Webusb](/tr/rehber/epson-tm-p20ii-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)
- [Epson Tm P80ii Webusb](/tr/rehber/epson-tm-p80ii-webusb-ve-webhid-ile-kablolu-donanim-iletisimi)

---
title: "Termal Yazıcı UTF-8 Desteklemiyorsa Ne Yapılmalı? Karakter Temizleme ve Transliterasyon"
description: "Ucuz mobil fiş yazıcılarında Türkçe ve özel karakter ROM desteği yoksa ne yapılır? Akıllı transliterasyon, ASCII temizleme ve okunabilir fiş basma mimarisi."
printerClass: mobile
brand: Epson
publishDate: 2026-09-10
translationKey: thermal-printer-utf8-fallback-character-sanitization
---

E-ticaret veya saha satış operasyonlarında bazen sahada kullanılan taşınabilir mobil yazıcılar son derece düşük maliyetli, Uzak Doğu menşeli cihazlar olabilir. Bu yazıcıların dahili ROM belleğinde ne UTF-8 desteği ne de CP857 / Windows-1254 Türkçe tabloları bulunur.

Bu tür bir yazıcıya Türkçe karakter içeren bir fiş gönderdiğinizde, yazıcı bu harfleri ya tamamen yutar (boşluk bırakır) ya da garip simgeler (`¿, ®, ¤`) basarak fişi okunamaz hale getirir.

Donanımı değiştiremediğiniz bu senaryoda uygulanacak en temiz mühendislik çözümü **Akıllı Karakter Temizleme (Transliteration & Sanitization)** mimarisidir.

---

## 1. Transliterasyon Mantığı: Anlamı Bozmadan ASCII'ye Dönüştürme

Transliterasyon, özel bölgesel harfleri fonetik ve görsel olarak en yakın standart 7-bit ASCII karşılıklarına dönüştürme işlemidir:

$$\text{Kaşarlı Pide} \quad \xrightarrow{\text{Transliterasyon}} \quad \text{Kasarli Pide}$$

```
[ Ham UTF-8 Giriş ] ──► [ Karakter Temizleyici ] ──► [ Standart ASCII Çıktı ]
"Çilekli Dondurma"        (Regex Eşleme)              "Cilekli Dondurma"
```

Müşteri veya mutfak personeli için fişte `¿ilekli Dondurma` görmek son derece amatör ve kafa karıştırıcıdır; ancak `Cilekli Dondurma` yazması son derece temiz, net ve %100 okunabilirdir.

---

## 2. Üretime Hazır JavaScript Transliterasyon Kütüphanesi

```typescript
export function sanitizeThermalString(input: string): string {
  if (!input) return '';

  return input
    // Türkçe Karakter Eşlemeleri
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    // Yaygın Diğer Avrupa / Para Sembolleri
    .replace(/€/g, 'EUR')
    .replace(/₺/g, 'TL')
    .replace(/£/g, 'GBP')
    // Standart olmayan kontrol karakterlerini temizle (0-31 arası hariç LF, CR)
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Transliterasyon uygulandığında e-Arşiv veya resmi fişlerde yasal sorun oluşur mu?
**Taşınabilir mobil fiş yazıcılarından basılan sipariş fişleri, adisyonlar veya kargo toplama listeleri "Bilgi Fişi" (Informational Slip) niteliğindedir; mali mühürlü resmi fatura değildir.** Resmi e-Arşiv faturanın kendisi zaten Gelir İdaresi Başkanlığı'na (GİB) XML/PDF formatında UTF-8 olarak iletilir. Dolayısıyla fiziksel bilgi fişinde Türkçe harflerin Latin karşılıklarıyla çıkması hiçbir yasal engel teşkil etmez.

### Türk Lirası simgesi (₺) termal fişte neden hep bozuk çıkıyor?
**₺ simgesi Unicode tablosuna nispeten yeni eklenmiş bir karakterdir (`U+20BA`) ve eski termal yazıcıların hiçbirinde bulunmaz.** Fiş tasarımında `₺` simgesi yerine evrensel olan `TL` ibaresi kullanmak tüm yazıcı modellerinde %100 uyumluluk sağlar.

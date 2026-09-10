---
title: "Hepsiburada Satıcı Paneli Toplu Kargo Etiketi Baskı Ayarları Rehberi"
description: "Hepsiburada satıcı portalında toplu kargo barkodu oluşturma, HepsiJet termal etiket şablonları, 100x150 mm sayfa hizalama ve yazdırma tüyoları."
printerClass: industrial
brand: Zebra
publishDate: 2026-09-10
translationKey: hepsiburada-batch-shipping-label-printer-setup
---

Hepsiburada satıcılarının siparişleri zamanında kargoya verebilmesi için HepsiJet veya anlaşmalı diğer kargo barkodlarını hızlıca basması gerekir. Panelden alınan etiketlerin tek tek A4 kağıda basılması saatler sürerken; toplu işlem özelliğiyle yüzlerce etiket saniyeler içinde termal yazıcıya gönderilebilir.

Bu rehberde, Hepsiburada satıcı panelinde toplu kargo etiketi ayarlarını ve yazıcı optimizasyonunu inceliyoruz.

---

## 1. Hepsiburada Panelinde Toplu Etiket Alma Adımları

1. **Hepsiburada Satıcı Paneli** > **Siparişlerim** ekranına gelin.
2. Durumu **"Paketlenecek"** veya **"Kargolanacak"** olan tüm siparişleri sol taraftaki onay kutularıyla (checkbox) seçin.
3. Üst barda beliren **"Toplu İşlemler" > "Kargo Barkodlarını Yazdır"** seçeneğine tıklayın.
4. Çıkan pencerede şablon türü olarak **"Termal Etiket (100x150 mm)"** veya **"A6"** formatını seçin.
5. İndirilen PDF dosyasını açıp yazdırma diyaloğunda kağıt boyutunu `100x150 mm` olarak seçip doğrudan yazdırın.

---

## 2. HepsiJet ve Barkod Okunabilirlik Kriterleri

HepsiJet barkodlarında hem standart Code 128 kargo takip kodu hem de dağıtım merkezi aktarma kodlarını içeren karekodlar bulunur:
- **Baskı Hızı (Print Speed):** Çok yüksek hızlar (8 IPS üzeri) direkt termal kağıtta çizgilerin silik çıkmasına yol açabilir. Sürücüden baskı hızını **4 IPS (100 mm/s)** olarak ayarlamak okunabilirliği maksimize eder.
- **Dikey Hizalama:** Etiketin üst ve alt kenarlarında en az 3 mm boşluk bırakılmalıdır, aksi halde barkod çubukları etiket ayrım çentiğine (gap) denk gelip kesilebilir.

---

## 3. Sıkça Sorulan Sorular (SSS)

### Toplu PDF indirildiğinde bazı sayfalar neden yatay (Landscape), bazıları dikey geliyor?
**Bu durum siparişlerde farklı kargo firmaları (örneğin biri PTT, diğeri HepsiJet) seçildiğinde oluşabilir.** PDF görüntüleyicinizde (Adobe Acrobat veya Chrome) yazdırma penceresinde **"Sayfa Yönünü Otomatik Algıla" (Auto-rotate and center pages)** seçeneğini işaretlerseniz tüm sayfalar otomatik olarak dikine 100x150 mm formatına oturur.

### Hepsiburada siparişleri için ribonlu mu ribonsuz etiket mi kullanmalıyım?
**Eko Termal (ribonsuz) etiketler kargo paketleri için en ekonomik ve standart çözümdür.** Ribonlu transfer etiketler yalnızca aylar boyunca açık havada veya dondurucu depolarda bekleyecek sanayi ürünleri için gereklidir.

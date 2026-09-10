---
title: "Restoran POS Sistemlerinde Mutfak ve Bar Yazıcılarını Ayrıştırma Kuralları"
description: "Restoran ve kafelerde adisyon yönlendirme mimarisi. Sıcak yemekleri mutfağa, kokteyl ve kahveleri bara yönlendiren kategori bazlı filtreleme algoritmaları."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: splitting-kitchen-and-bar-order-tickets
---

Bir restoranda sipariş hızının ve servis senkronizasyonunun temeli, adisyonların ilgili hazırlık istasyonlarına doğru ve anında ulaşmasıdır. Garson tek bir masa için masaya ait siparişi girdiğinde, aşçıların içecek siparişlerini görüp kafalarının karışması veya barmenin ızgara etlerle ilgisi olmayan bir fiş alması ciddi bir operasyonel verimsizliktir.

Bu rehberde; restoran POS sistemlerinde ürün kategorilerine, pişirme sürelerine ve hazırlık istasyonlarına göre adisyon ayrıştırma (KOT Dispatch) kurallarını inceliyoruz.

---

## 1. İstasyon Matrisi: Kategori Eşleme Tablosu

Restoran menüsü sistemde tanımlanırken her ürün kategorisine bir **Hazırlık İstasyonu (Prep Station)** atanmalıdır:

| Ürün Kategorisi | Hedef İstasyon | Yazıcı Konumu | Donanım Tipi |
|---|---|---|---|
| Izgaralar, Tavalar, Çorbalar | `HOT_KITCHEN` | Sıcak Mutfak Hattı | Nokta Vuruşlu (TM-U220) |
| Soğuk Mezeler, Salatalar | `COLD_PREP` | Soğuk Hazırlık Masası | Termal (TM-T20) |
| Alkollü İçecekler, Kokteyller | `BAR` | Ana Bar Bankosu | Termal Fiş Yazıcı |
| Kahveler, Çaylar, Tatlılar | `BARISTA` | Kahve İstasyonu | Termal Fiş Yazıcı |

---

## 2. Ayrıştırma Algoritması (TypeScript)

```typescript
export interface OrderItem {
  name: string;
  qty: number;
  station: 'HOT_KITCHEN' | 'BAR' | 'COLD_PREP';
  notes?: string;
}

export function splitOrderForStations(tableNo: string, items: OrderItem[]) {
  const stationGroups = new Map<string, OrderItem[]>();

  for (const item of items) {
    if (!stationGroups.has(item.station)) {
      stationGroups.set(item.station, []);
    }
    stationGroups.get(item.station)!.push(item);
  }

  // Her istasyon için bağımsız KOT üret ve ilgili IP'ye fırlat
  stationGroups.forEach((stationItems, station) => {
    const kotPayload = generateKotReceipt(tableNo, station, stationItems);
    dispatchToStationPrinter(station, kotPayload);
  });
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Bir masadan aynı anda hem başlangıç hem ana yemek istendiğinde mutfak bunu nasıl anlar?
**Adisyon fişinde "Servis Sırası" (Course / Aşama) tanımlanmalıdır.** Fiş üzerinde `--- 1. AŞAMA: BAŞLANGIÇ ---` ve `--- 2. AŞAMA: ANA YEMEK ---` başlıkları açılarak aşçıların yemekleri sırayla çıkarması sağlanır.

### Müşteri siparişe sonradan ek bir içecek isterse bar yazıcısı önceki siparişleri tekrar basar mı?
**Hayır, profesyonel POS sistemleri "Delta / Yeni Kalemler" kontrolü uygular.** Masaya yapılan eklemelerde sadece yeni eklenen içecekler basılır; fişin en üstüne `*** İLAVE SİPARİŞ ***` ibaresi eklenir.

---
title: "Termal Yazıcıda Kağıt Kesme ve Para Çekmecesi Açma Komutları (ESC/POS)"
description: "ESC/POS ile tam kesim (full cut), kısmi kesim (partial cut) ve RJ11 portuna bağlı para çekmecesini otomatik fırlatma komutları kılavuzu."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: thermal-printer-paper-cut-cash-drawer-commands
---

Bir perakende veya restoran kasasında fiş yazdırıldığında iki fiziksel eylem gerçekleşir: Fişin altından **otomatik kağıt kesilmesi (Auto-Cutter)** ve nakit ödeme alındığında kasanın altındaki metal **para çekmecesinin (Cash Drawer) zınk diye açılması**.

Her iki eylem de işletim sistemi penceresi olmadan, doğrudan yazıcı mikrodenetleyicisine gönderilen özel **ESC/POS makine komutları** ile yönetilir.

---

## 1. Kağıt Kesme Komutları (GS V)

Epson ESC/POS standardında kağıt kesme mekanizması `GS V` (`0x1D 0x56`) komutu ile kontrol edilir. İki temel kesim modu bulunur:
1. **Tam Kesim (Full Cut):** Kağıdı baştan sona tamamen keserek koparır. Fiş müşterinin eline veya hazneye düşer.
2. **Kısmi Kesim (Partial Cut):** Kağıdın ortasında veya kenarında 1-2 mm'lik ince bir bağlantı noktası bırakır. Fiş rulo üzerinde asılı kalır, rüzgarda uçup kaybolmaz, personel hafifçe çekerek koparır.

### Kesme Komut Tablosu:
| Kesim Tipi | ESC/POS Komutu | Hex Formatı | Açıklama |
|---|---|---|---|
| **Tam Kesim (Full Cut)** | `GS V 65 0` | `1D 56 41 00` | Kağıdı besler ve tamamen keser. |
| **Kısmi Kesim (Partial Cut)** | `GS V 66 0` | `1D 56 42 00` | Kağıdı besler ve 1 noktadan tutarak kısmi keser. |
| **Beslemesiz Kısmi Kesim** | `GS V 1` | `1D 56 01` | Kağıdı ilerletmeden anında keser (Metin kesiğe denk gelebilir). |

> ⚠️ **Kritik Kural:** Kesme komutundan önce daima 3-4 satır boşluk (`0x0A 0x0A 0x0A` veya `ESC d 3`) bırakılmalıdır. Aksi halde yazıcı kafası ile bıçak arasındaki 15-20 mm'lik fiziksel mesafe nedeniyle fişin son satırı kesik çizgisinin üstünde kalır ve bölünür.

```javascript
function getCutCommand(isPartial = true) {
  // 3 satır ilerlet + Kes
  return new Uint8Array([
    0x1B, 0x64, 0x03,       // ESC d 3 (3 satır kağıt besle)
    0x1D, 0x56, isPartial ? 0x42 : 0x41, 0x00 // GS V 66 0 / 65 0
  ]);
}
```

---

## 2. Para Çekmecesini Açma Komutu (ESC p)

Termal fiş yazıcılarının arkasında bir telefon jakına benzeyen 6 pinli **RJ11 / RJ12 konnektörü** bulunur. Bu konnektör kasanın altındaki para çekmecesinin 24V (veya 12V) solenoid bobinine bağlanır.

Yazıcıya `ESC p` komutu gönderildiğinde, yazıcı bu pine milisaniyeler süren bir elektrik darbesi (Pulse) verir; solenoid mıknatıslanarak çekmece yay mekanizmasını serbest bırakır.

$$\text{ESC } p \text{ } m \text{ } t1 \text{ } t2 \quad \longrightarrow \quad \text{Hex: } \texttt{0x1B 0x70 [m] [t1] [t2]}$$

- `$m$`: Çekmece pini (`0`: Pin 2, `1`: Pin 5). Genellikle `0` kullanılır.
- `$t1$`: Açma darbe süresi ($t1 \times 2\text{ ms}$). Örn: `25` ($25 \times 2 = 50\text{ ms}$).
- `$t2$`: Kapanma bekleme süresi ($t2 \times 2\text{ ms}$). Örn: `250` ($250 \times 2 = 500\text{ ms}$).

### Standart Çekmece Açma Kodu (JavaScript):
```javascript
export function openCashDrawer(): Uint8Array {
  // ESC p 0 25 250 -> Pin 2 üzerinden 50ms pulse
  return new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
}
```

---

## 3. Sıkça Sorulan Sorular (SSS)

### Para çekmecesini fiş basmadan sadece butona basarak nasıl açabilirim?
**Yazıcıya metin göndermeden sadece 5 baytlık `0x1B 0x70 0x00 0x19 0xFA` komutunu ileterek kağıt harcamadan çekmeceyi açabilirsiniz.** Web POS yazılımlarında "Çekmeceyi Aç" butonu oluşturup tıklandığında yalnızca bu bayt dizisini göndererek kasa açılışı sağlanır.

### Yazıcım kağıdı keserken dişliler sıkışıyor ve kırmızı hata ışığı yanıyor, ne yapmalıyım?
**Bu duruma bıçak sıkışması (Cutter Jam) denir.** Yazıcının ön kapağını zorlamayın. Ön paneldeki küçük kapakçığı tırnağınızla açın; içerideki plastik çarkı (thumbwheel) parmağınızla çevirerek bıçağın başlangıç yuvasına geri dönmesini sağlayın, ardından kapağı kapatıp açın.

### Çekmece açma komutu gönderdiğim halde tık sesi geliyor ama çekmece fırlamıyor?
**Bu arıza genellikle çekmecenin arkasındaki mekanik anahtarın kilitli kalmasından veya solenoid voltaj uyuşmazlığından kaynaklanır.** Çekmece anahtarının dik (otomatik) konumda olduğunu kontrol edin. Ayrıca 24V ile çalışan bir çekmeceyi 12V çıkış veren düşük güçlü bir mobil yazıcıya bağladıysanız darbe gücü yayı itmeye yetmeyebilir.

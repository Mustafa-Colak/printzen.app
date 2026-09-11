---
title: "Modern Web Uygulamaları İçin Termal Yazdırma SDK Mimarisi: JS, React ve Vue Geliştirici Kılavuzu"
description: "React, Vue ve saf JavaScript web projelerinde termal fiş ve etiket yazdırma mimarisi. useThermalPrinter React hook'u, taşıyıcı katman soyutlaması ve ESC/POS builder."
printerClass: desktop
brand: Epson
publishDate: 2026-09-10
translationKey: thermal-printing-sdk-architecture-javascript-react-vue
---

Geleneksel web geliştiricileri için tarayıcı üzerinden fiziksel bir donanıma (termal fiş yazıcı, barkod makinesi) erişmek genellikle karmaşık ve korkutucu görünür. Çoğu proje, internetten kopyalanmış ham bayt dizileriyle (`[0x1B, 0x40, ...]`) başlar; ancak proje büyüdükçe bağlantı kopmaları, Türkçe karakter hataları, farklı kağıt genişlikleri (58mm vs 80mm) ve donanım taşıyıcıları (WebUSB, Web Bluetooth, Yerel WebSocket, Bulut API) kodu içinden çıkılmaz bir spagettiye dönüştürür.

Modern kurumsal SaaS, e-ticaret ve POS projelerinde sürdürülebilir bir termal yazdırma deneyimi sunmanın yolu **Katmanlı bir Termal Yazdırma SDK Mimarisi** kurmaktır.

Bu kılavuzda; Taşıyıcı Katman Soyutlaması (Transport Abstraction), ESC/POS Komut İnşa Edici (Builder Pattern), React kancaları (`useThermalPrinter`) ve Vue composable yapılarını sıfırdan inşa ediyoruz.

---

## 1. Dört Katmanlı Termal Yazdırma SDK Mimarisi

Temiz bir SDK şu dört bağımsız katmandan oluşmalıdır:

```
┌─────────────────────────────────────────────────────────┐
│ Katman 4: UI Katmanı (React Hooks, Vue Composables)      │
│  - useThermalPrinter(), <ReceiptPreview />              │
├─────────────────────────────────────────────────────────┤
│ Katman 3: Belge İnşa Edici (ESC/POS & ZPL Builder)      │
│  - .text(), .table(), .barcode(), .cut(), .buzzer()     │
├─────────────────────────────────────────────────────────┤
│ Katman 2: Kodlama & Karakter Motoru (Encoder & Dither)  │
│  - CP857 / Windows-1254 Dönüştürücü, Atkinson Dithering │
├─────────────────────────────────────────────────────────┤
│ Katman 1: Taşıyıcı / İletişim Katmanı (Transport Layer) │
│  - WebUSB, Web Bluetooth, WebSocket Agent, Cloud API   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Katman 1: Taşıyıcı Katman Soyutlaması (Transport Interface)

Yazıcının USB, Bluetooth veya ağ üzerinden bağlanması uygulama mantığını ilgilendirmemelidir. Tüm taşıyıcılar ortak bir TypeScript arayüzünü (Interface) uygulamalıdır:

```typescript
export interface IPrinterTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(bytes: Uint8Array): Promise<void>;
  isConnected(): boolean;
  getDeviceName(): string;
}

// WebSocket Yerel Ajan Taşıyıcısı Örneği
export class WebSocketTransport implements IPrinterTransport {
  private socket: WebSocket | null = null;
  constructor(private url: string = 'ws://localhost:18570') {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);
      this.socket.binaryType = 'arraybuffer';
      this.socket.onopen = () => resolve();
      this.socket.onerror = (err) => reject(err);
    });
  }

  async disconnect(): Promise<void> {
    this.socket?.close();
    this.socket = null;
  }

  async send(bytes: Uint8Array): Promise<void> {
    if (!this.isConnected()) throw new Error('Yazıcı soketi bağlı değil.');
    this.socket!.send(bytes);
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getDeviceName(): string {
    return 'Local Print Agent';
  }
}
```

---

## 3. Katman 3: ESC/POS Belge İnşa Edici (Receipt Builder)

Zincirleme (Method Chaining) tasarımıyla çalışan tip güvenli fiş oluşturucu:

```typescript
export class ReceiptBuilder {
  private buffer: number[] = [];

  constructor(private columns: 32 | 48 = 48) {
    // ESC @ -> Başlat
    this.buffer.push(0x1B, 0x40);
  }

  align(align: 'left' | 'center' | 'right'): this {
    const val = align === 'center' ? 1 : align === 'right' ? 2 : 0;
    this.buffer.push(0x1B, 0x61, val);
    return this;
  }

  text(str: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str + '\n');
    bytes.forEach(b => this.buffer.push(b));
    return this;
  }

  bold(enable: boolean): this {
    this.buffer.push(0x1B, 0x45, enable ? 1 : 0);
    return this;
  }

  tableRow(leftText: string, rightText: string): this {
    const spaceCount = this.columns - leftText.length - rightText.length;
    const spaces = ' '.repeat(Math.max(1, spaceCount));
    return this.text(leftText + spaces + rightText);
  }

  divider(): this {
    return this.text('-'.repeat(this.columns));
  }

  cut(partial = false): this {
    // GS V m
    this.buffer.push(0x1D, 0x56, partial ? 66 : 65, 0);
    return this;
  }

  build(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
```

---

## 4. Katman 4: React Kancası (`useThermalPrinter`)

React bileşenlerinizde yazdırma durumunu, hata yönetimini ve donanım bağlantısını tek satırda yönetin:

```typescript
import { useState, useCallback } from 'react';
import { IPrinterTransport } from './transports';
import { ReceiptBuilder } from './ReceiptBuilder';

export function useThermalPrinter(transport: IPrinterTransport) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const print = useCallback(async (builderCallback: (b: ReceiptBuilder) => void) => {
    setIsPrinting(true);
    setError(null);

    try {
      if (!transport.isConnected()) {
        await transport.connect();
      }

      const builder = new ReceiptBuilder();
      builderCallback(builder);
      const payload = builder.build();

      await transport.send(payload);
    } catch (err: any) {
      setError(err.message || 'Yazdırma sırasında bilinmeyen bir hata oluştu.');
      console.error('Thermal Print Error:', err);
    } finally {
      setIsPrinting(false);
    }
  }, [transport]);

  return { print, isPrinting, error, isConnected: transport.isConnected() };
}
```

### React Bileşeninde Kullanımı:
```tsx
import React from 'react';
import { useThermalPrinter } from './useThermalPrinter';
import { WebSocketTransport } from './transports';

const localTransport = new WebSocketTransport();

export function CheckoutButton({ order }: { order: any }) {
  const { print, isPrinting, error } = useThermalPrinter(localTransport);

  const handleCheckout = () => {
    print((builder) => {
      builder
        .align('center')
        .bold(true)
        .text('PRINTZEN CAFE POS')
        .bold(false)
        .divider()
        .align('left')
        .tableRow('1x Cappuccino', '65.00 TL')
        .tableRow('1x Kruvasan', '80.00 TL')
        .divider()
        .bold(true)
        .tableRow('TOPLAM', '145.00 TL')
        .align('center')
        .text('\nAfiyet Olsun!\n\n')
        .cut();
    });
  };

  return (
    <div>
      <button onClick={handleCheckout} disabled={isPrinting}>
        {isPrinting ? 'Yazdırılıyor...' : 'Siparişi Tamamla ve Fiş Bas'}
      </button>
      {error && <p style={{ color: 'red' }}>Hata: {error}</p>}
    </div>
  );
}
```

---

## 5. Vue 3 Composable Mimarisi (`usePrintQueue`)

Vue 3 Composition API kullanan ekipler için reaktif yazdırma kuyruğu:

```typescript
import { ref } from 'vue';
import { IPrinterTransport } from './transports';

export function usePrintQueue(transport: IPrinterTransport) {
  const queue = ref<Uint8Array[]>([]);
  const isBusy = ref(false);

  async function enqueue(bytes: Uint8Array) {
    queue.value.push(bytes);
    if (!isBusy.value) {
      await processQueue();
    }
  }

  async function processQueue() {
    if (queue.value.length === 0) return;
    isBusy.value = true;

    try {
      if (!transport.isConnected()) await transport.connect();
      while (queue.value.length > 0) {
        const job = queue.value.shift()!;
        await transport.send(job);
      }
    } catch (e) {
      console.error('Queue Processing Error:', e);
    } finally {
      isBusy.value = false;
    }
  }

  return { enqueue, queueLength: queue.value.length, isBusy };
}
```

---

## 6. Sıkça Sorulan Sorular (SSS)

### Neden doğrudan `window.print()` yerine özel bir Termal SDK kullanılmalıdır?
**`window.print()` tüm sayfayı A4 kağıt mantığıyla PDF olarak renderlar; bu da fişlerin kenarlarında devasa boşluklar bırakır, gri metin piksellenmesi yaratır ve kağıt kesme mekanizmasını tetikleyemez.** Özel bir ESC/POS SDK'sı ise doğrudan yazıcı donanımına konuşarak milisaniyeler içinde jilet gibi keskin metinler, hizalı tablolar ve otomatik kağıt kesme üretir.

### Web uygulamasında müşteri fişi basılırken donanım koparsa nasıl yönetilir?
**SDK mimarimizdeki Taşıyıcı Katman (Transport Layer) "Promise Tabanlı Yeniden Bağlanma" (Reconnect with Exponential Backoff) desenini uygular.** Yazıcı kablosu anlık çıktığında veya Bluetooth koptuğunda SDK kuyruğu hafızada tutar ve bağlantı sağlandığı anda bekleyen fişi tekrar göndermeyi dener.

### 58mm ve 80mm kağıt genişlikleri SDK'da dinamik olarak nasıl ayarlanır?
**`ReceiptBuilder` sınıfı kolon parametresi (`columns`) ile başlatılır.** 58mm kağıtlar için standart kolon genişliği 32 karakterken, 80mm kağıtlar için 48 karakterdir. Kullanıcının profilindeki kağıt ayarına göre builder'a `columns: 32` veya `48` geçilerek tablo çizgileri ve hizalamalar dinamik olarak hesaplanır.

### Printzen Web SDK'sı tüm bu özellikleri hazır olarak sunuyor mu?
**Evet, Printzen JavaScript / TypeScript SDK'sı (`@printzen/sdk`); tüm modern framework'ler (React, Vue, Angular, Svelte) için hazır hook'lar, ESC/POS & ZPL builder'ları, Floyd-Steinberg resim ditherleme ve çoklu taşıyıcı desteğini tek bir NPM paketinde sunar.**

## Popüler Model Özelinde Bu Konudaki Rehberler

- [Bixolon Slp Tx400 Web](/tr/rehber/bixolon-slp-tx400-web-uygulamalari-termal-yazdirma-sdk-mimarisi)
- [Bixolon Spp R200iii Web](/tr/rehber/bixolon-spp-r200iii-web-uygulamalari-termal-yazdirma-sdk-mimarisi)
- [Bixolon Spp R310 Web](/tr/rehber/bixolon-spp-r310-web-uygulamalari-termal-yazdirma-sdk-mimarisi)
- [Bixolon Srp 330ii Web](/tr/rehber/bixolon-srp-330ii-web-uygulamalari-termal-yazdirma-sdk-mimarisi)
- [Bixolon Srp 350iii Web](/tr/rehber/bixolon-srp-350iii-web-uygulamalari-termal-yazdirma-sdk-mimarisi)
- [Bixolon Srp Q300 Web](/tr/rehber/bixolon-srp-q300-web-uygulamalari-termal-yazdirma-sdk-mimarisi)
- [Epson Tm L90 Web](/tr/rehber/epson-tm-l90-web-uygulamalari-termal-yazdirma-sdk-mimarisi)
- [Epson Tm M30ii Web](/tr/rehber/epson-tm-m30ii-web-uygulamalari-termal-yazdirma-sdk-mimarisi)
- [Epson Tm P20ii Web](/tr/rehber/epson-tm-p20ii-web-uygulamalari-termal-yazdirma-sdk-mimarisi)
- [Epson Tm P80ii Web](/tr/rehber/epson-tm-p80ii-web-uygulamalari-termal-yazdirma-sdk-mimarisi)

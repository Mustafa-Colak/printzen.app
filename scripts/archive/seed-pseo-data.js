import fs from 'fs';
import path from 'path';

// 50 Ana Konu Listesi (printzen-50-ana-konu.md dosyasından)
export const MAIN_TOPICS = [
  // A. Termal Yazıcı Komut Dilleri & Protokoller (1-8)
  { id: 1, title: 'ESC/POS Komut Dili ve Fiş Yazıcı Programlama Standartları', cluster: 'A' },
  { id: 2, title: 'Zebra ZPL & ZPL II Etiket Programlama Dili', cluster: 'A' },
  { id: 3, title: 'TSPL ve TSPL2 Masaüstü Barkod Programlama Dili', cluster: 'A' },
  { id: 4, title: 'CPCL Mobil Kurye ve Saha Yazdırma Protokolü', cluster: 'A' },
  { id: 5, title: 'EPL ve EPL2 Eski Nesil Etiket Emülasyon Mimarisi', cluster: 'A' },
  { id: 6, title: 'Star Line Mode ve StarPRNT Fiş Yazıcı Protokolleri', cluster: 'A' },
  { id: 7, title: 'Satır Modu (Line Mode) vs Sayfa/Raster Modu (Page Mode)', cluster: 'A' },
  { id: 8, title: 'Karakter Kod Sayfaları (Code Pages) ve Türkçe Karakter Mimarisi', cluster: 'A' },

  // B. Bağlantı Teknolojileri & Donanım Arayüzleri (9-16)
  { id: 9, title: 'Web Bluetooth API ile Tarayıcıdan Direkt Termal Baskı', cluster: 'B' },
  { id: 10, title: 'WebUSB ve WebHID ile Kablolu Doğrudan Donanım İletişimi', cluster: 'B' },
  { id: 11, title: 'Ağ ve Ethernet (Raw TCP/IP Port 9100) Soket Mimarisi', cluster: 'B' },
  { id: 12, title: 'Wi-Fi Termal Yazıcı Altyapısı ve Kurumsal Ağ Güvenliği', cluster: 'B' },
  { id: 13, title: 'Bluetooth Eşleşme Protokolleri: SPP vs BLE GATT', cluster: 'B' },
  { id: 14, title: 'Seri Port (RS-232 / COM Port) ve Sanal COM Çözümleri', cluster: 'B' },
  { id: 15, title: 'Çoklu İstasyon ve Paralel Yazıcı Yönlendirme (Routing)', cluster: 'B' },
  { id: 16, title: 'Sanal Yazıcı Simülatörleri ve Geliştirici Test Ortamları', cluster: 'B' },

  // C. Bulut Yazdırma & Sessiz Baskı Mimarisi (17-24)
  { id: 17, title: 'Sessiz Yazdırma (Silent / Raw Printing) Mimarisi', cluster: 'C' },
  { id: 18, title: 'Cloud Print Agent ve Arka Plan Masaüstü Servisleri', cluster: 'C' },
  { id: 19, title: 'Webhook ve MQTT ile Uzaktan Anlık Yazdırma', cluster: 'C' },
  { id: 20, title: 'Mixed Content Güvenliği ve HTTPS-Localhost İletişim Engelleri', cluster: 'C' },
  { id: 21, title: 'Offline Kuyruklama ve Bağlantı Kesintisi Dayanıklılığı', cluster: 'C' },
  { id: 22, title: 'Zincir Mağazalar ve Çok Şubeli Merkezi Baskı Yönetimi', cluster: 'C' },
  { id: 23, title: 'İki Yönlü Donanım Telemetrisi (Bi-Directional Status)', cluster: 'C' },
  { id: 24, title: 'Bulut Yazdırma REST API ve HMAC Güvenlik Mimarisi', cluster: 'C' },

  // D. E-Ticaret, Pazaryeri & Kargo Yazdırma (25-32)
  { id: 25, title: 'WooCommerce Otomatik Termal Fiş ve Kargo Etiketi Yazdırma', cluster: 'D' },
  { id: 26, title: 'Shopify ve Bulut E-Ticaret Fiş Entegrasyonu', cluster: 'D' },
  { id: 27, title: 'Pazaryeri Kargo Barkodu Otomasyonu (Trendyol, Hepsiburada, Amazon)', cluster: 'D' },
  { id: 28, title: 'Yemek Sipariş Platformları Entegrasyonu (Yemeksepeti, Getir, Trendyol Yemek)', cluster: 'D' },
  { id: 29, title: 'GİB E-Arşiv Fatura ve Bilgi Fişi Termal Formatlama', cluster: 'D' },
  { id: 30, title: 'E-İrsaliye, Koli İçi Sevk ve GS1-128 Barkod Basımı', cluster: 'D' },
  { id: 31, title: 'Kargo Entegratörleri ve Taşıyıcı API Formatları (Yurtiçi, Aras, MNG)', cluster: 'D' },
  { id: 32, title: 'Müşteri İade ve Depo Mal Kabul Barkodları', cluster: 'D' },

  // E. Sektörel Kullanım Senaryoları & İş Akışları (33-40)
  { id: 33, title: 'Restoran, Kafe ve Bar Mutfak Adisyon Mimarisi', cluster: 'E' },
  { id: 34, title: 'Perakende Hızlı Satış (Fast-Retail) ve Market Kasaları', cluster: 'E' },
  { id: 35, title: 'Depo Toplama (Pick & Pack) ve Mobil Koridor Etiketleme', cluster: 'E' },
  { id: 36, title: 'Otopark, Vale ve Araç Yıkama Otomasyonu', cluster: 'E' },
  { id: 37, title: 'Sıramatik ve Numaratör Biletleme Sistemleri', cluster: 'E' },
  { id: 38, title: 'Kuru Temizleme, Terzi ve Teknik Servis Emanet Fişleri', cluster: 'E' },
  { id: 39, title: 'Sağlık, Klinik, Veteriner ve Laboratuvar Numune Etiketleme', cluster: 'E' },
  { id: 40, title: 'Etkinlik, Fuar, Kongre ve Yaka Kartı Baskısı', cluster: 'E' },

  // F. Donanım Sorun Giderme, Kalibrasyon & Bakım (41-46)
  { id: 41, title: 'Bluetooth Yazıcı Eşleşme ve İletişim Hataları Rehberi', cluster: 'F' },
  { id: 42, title: 'Termal Baskı Kalitesi, Silik Yazma ve Kararma Problemleri', cluster: 'F' },
  { id: 43, title: 'Kağıt Sıkışması ve Otomatik Kesici (Auto-Cutter) Kilitlenmesi', cluster: 'F' },
  { id: 44, title: 'Etiket Kalibrasyonu ve Sürekli Boş Etiket Fırlatma Hatası', cluster: 'F' },
  { id: 45, title: 'Termal Kafa (TPH) Ömrü, Temizlik Protokolü ve Değişimi', cluster: 'F' },
  { id: 46, title: 'Termal Rulo Kağıt Standartları (BPA Free, Eko vs Lamine)', cluster: 'F' },

  // G. Geliştirici Araçları & SDK Mimarisi (47-50)
  { id: 47, title: 'JavaScript ve TypeScript Modern Web Print SDK', cluster: 'G' },
  { id: 48, title: 'React, Next.js ve Vue.js Termal Yazıcı Kancaları (Hooks)', cluster: 'G' },
  { id: 49, title: 'React Native ve Flutter ile Mobil Yazdırma Kütüphaneleri', cluster: 'G' },
  { id: 50, title: 'Termal Fiş Şablonlama ve 1-Bit Monokrom Dithering Motoru', cluster: 'G' }
];

console.log('Top Topics loaded:', MAIN_TOPICS.length);

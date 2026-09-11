import fs from 'fs';
import path from 'path';

const ROOT_DIR = '/Users/mustafa.colak/developer/printzen-website';
const TR_PSEO_DIR = path.join(ROOT_DIR, 'public/tr/rehber');
const EN_PSEO_DIR = path.join(ROOT_DIR, 'public/guides');

fs.mkdirSync(TR_PSEO_DIR, { recursive: true });
fs.mkdirSync(EN_PSEO_DIR, { recursive: true });

// 50 Popüler Termal & Barkod Donanım Modeli
const HARDWARE_MODELS = [
  // Epson (Fiş & POS Standartları)
  { brand: 'Epson', model: 'TM-T20III', type: 'Fiş Yazıcı', typeEn: 'Receipt Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['USB', 'Ethernet', 'Seri'], width: '80mm / 58mm', cutter: 'Var', baud: '38400' },
  { brand: 'Epson', model: 'TM-T88VI', type: 'Fiş Yazıcı', typeEn: 'Receipt Printer', proto: 'ESC/POS', dpi: 180, ifaces: ['USB', 'Ethernet', 'Bluetooth', 'Wi-Fi'], width: '80mm / 58mm', cutter: 'Var', baud: '115200' },
  { brand: 'Epson', model: 'TM-T88VII', type: 'Ultra Hızlı Fiş Yazıcı', typeEn: 'Ultra-Fast POS Printer', proto: 'ESC/POS', dpi: 180, ifaces: ['USB', 'Ethernet', 'Wi-Fi'], width: '80mm', cutter: 'Var', baud: '115200' },
  { brand: 'Epson', model: 'TM-m30II', type: 'Kompakt Mobil/Tablet POS', typeEn: 'Compact Tablet POS', proto: 'ESC/POS', dpi: 203, ifaces: ['Bluetooth', 'Wi-Fi', 'USB', 'Ethernet'], width: '80mm / 58mm', cutter: 'Var', baud: '38400' },
  { brand: 'Epson', model: 'TM-P20II', type: 'Mobil Kemer Tipi Fiş Yazıcı', typeEn: 'Mobile Belt Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['Bluetooth 5.0', 'Wi-Fi'], width: '58mm', cutter: 'Yok (Tear-bar)', baud: '115200' },
  { brand: 'Epson', model: 'TM-P80II', type: 'Mobil 80mm Saha Yazıcısı', typeEn: 'Mobile 80mm Field Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['Bluetooth', 'Wi-Fi'], width: '80mm', cutter: 'Yok (Tear-bar)', baud: '115200' },
  { brand: 'Epson', model: 'TM-L90', type: 'Termal Etiket & Fiş Yazıcı', typeEn: 'Thermal Label & Receipt Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['USB', 'Ethernet'], width: '80mm', cutter: 'Var', baud: '38400' },

  // Xprinter (E-Ticaret & Kargo & Perakende)
  { brand: 'Xprinter', model: 'XP-420B', type: 'Direkt Termal Kargo Etiket Yazıcısı', typeEn: 'Direct Thermal Shipping Label Printer', proto: 'TSPL / ESC/POS', dpi: 203, ifaces: ['USB', 'Bluetooth', 'Ethernet'], width: '108mm (100x150)', cutter: 'Yok (Tear-bar)', baud: '9600' },
  { brand: 'Xprinter', model: 'XP-365B', type: 'Termal Barkod & Etiket Yazıcısı', typeEn: 'Thermal Barcode & Label Printer', proto: 'TSPL / ESC/POS', dpi: 203, ifaces: ['USB'], width: '80mm', cutter: 'Yok (Tear-bar)', baud: '9600' },
  { brand: 'Xprinter', model: 'XP-470B', type: 'Kargo Etiketi Barkod Yazıcı', typeEn: 'Shipping Label Barcode Printer', proto: 'TSPL', dpi: 203, ifaces: ['USB'], width: '108mm', cutter: 'Yok', baud: '9600' },
  { brand: 'Xprinter', model: 'XP-N160II', type: '80mm Fiş & Adisyon Yazıcısı', typeEn: '80mm Receipt & Kitchen Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['USB', 'Ethernet'], width: '80mm', cutter: 'Var (Otomatik)', baud: '19200' },
  { brand: 'Xprinter', model: 'XP-58IIH', type: '58mm Kompakt Fiş Yazıcı', typeEn: '58mm Compact Receipt Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['USB', 'Bluetooth'], width: '58mm', cutter: 'Yok (Tırtıklı)', baud: '9600' },
  { brand: 'Xprinter', model: 'XP-Q800', type: 'Yüksek Hızlı Mutfak Fiş Yazıcısı', typeEn: 'High-Speed Kitchen Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['USB', 'Ethernet', 'Seri'], width: '80mm', cutter: 'Var', baud: '19200' },
  { brand: 'Xprinter', model: 'XP-P300', type: 'Mobil Bluetooth Fiş Yazıcı', typeEn: 'Mobile Bluetooth Receipt Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['Bluetooth', 'USB'], width: '58mm', cutter: 'Yok', baud: '9600' },

  // Zebra (Endüstriyel & ZPL Lideri)
  { brand: 'Zebra', model: 'ZD220', type: 'Masaüstü Termal Barkod Yazıcı', typeEn: 'Desktop Thermal Barcode Printer', proto: 'ZPL II / EPL', dpi: 203, ifaces: ['USB'], width: '104mm (4 inç)', cutter: 'Opsiyonel', baud: '9600' },
  { brand: 'Zebra', model: 'ZD420', type: 'Gelişmiş Masaüstü Etiket Yazıcı', typeEn: 'Advanced Desktop Label Printer', proto: 'ZPL II / EPL', dpi: 203, ifaces: ['USB', 'Ethernet', 'Bluetooth', 'Wi-Fi'], width: '104mm', cutter: 'Var', baud: '115200' },
  { brand: 'Zebra', model: 'ZD421', type: 'Yeni Nesil Akıllı Barkod Yazıcı', typeEn: 'Next-Gen Smart Barcode Printer', proto: 'ZPL II / EPL', dpi: 300, ifaces: ['USB', 'Ethernet', 'Bluetooth BLE'], width: '104mm', cutter: 'Var', baud: '115200' },
  { brand: 'Zebra', model: 'GK420d', type: 'Direkt Termal Masaüstü Yazıcı', typeEn: 'Direct Thermal Desktop Printer', proto: 'ZPL II / EPL2', dpi: 203, ifaces: ['USB', 'Ethernet', 'Seri'], width: '104mm', cutter: 'Yok', baud: '9600' },
  { brand: 'Zebra', model: 'GK420t', type: 'Termal Transfer Ribonlu Yazıcı', typeEn: 'Thermal Transfer Ribbon Printer', proto: 'ZPL II / EPL2', dpi: 203, ifaces: ['USB', 'Ethernet'], width: '104mm', cutter: 'Opsiyonel', baud: '9600' },
  { brand: 'Zebra', model: 'ZT411', type: 'Ağır Sanayi Endüstriyel Yazıcı', typeEn: 'Heavy-Duty Industrial Printer', proto: 'ZPL II', dpi: 300, ifaces: ['Ethernet', 'USB', 'Bluetooth 4.1'], width: '104mm', cutter: 'Opsiyonel Giyotin', baud: '115200' },
  { brand: 'Zebra', model: 'ZQ320 Plus', type: 'Saha Kurye Mobil Fiş/Etiket Yazıcısı', typeEn: 'Field Courier Mobile Printer', proto: 'CPCL / ZPL', dpi: 203, ifaces: ['Bluetooth BLE', 'Wi-Fi'], width: '80mm (3 inç)', cutter: 'Yok', baud: '115200' },
  { brand: 'Zebra', model: 'ZQ520', type: 'Askeri Standart Darbeye Dayanıklı Mobil Yazıcı', typeEn: 'Rugged Military-Grade Mobile Printer', proto: 'CPCL / ZPL', dpi: 203, ifaces: ['Bluetooth', 'Wi-Fi'], width: '104mm (4 inç)', cutter: 'Yok', baud: '115200' },

  // Bixolon (Kore Mühendisliği POS & Mobil)
  { brand: 'Bixolon', model: 'SRP-330II', type: 'Ekonomik POS Fiş Yazıcısı', typeEn: 'Economic POS Receipt Printer', proto: 'ESC/POS', dpi: 180, ifaces: ['USB', 'Ethernet'], width: '80mm', cutter: 'Var', baud: '38400' },
  { brand: 'Bixolon', model: 'SRP-350III', type: 'Endüstri Standardı Restoran Fiş Yazıcısı', typeEn: 'Industry Standard Restaurant Printer', proto: 'ESC/POS', dpi: 180, ifaces: ['USB', 'Ethernet', 'Seri'], width: '80mm', cutter: 'Var', baud: '38400' },
  { brand: 'Bixolon', model: 'SRP-Q300', type: 'Küp Tasarım mPOS Fiş Yazıcısı', typeEn: 'Cube Design mPOS Receipt Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['Bluetooth', 'Wi-Fi', 'USB', 'Ethernet'], width: '80mm', cutter: 'Var', baud: '115200' },
  { brand: 'Bixolon', model: 'SPP-R200III', type: 'Mobil 58mm Bluetooth Fiş Yazıcı', typeEn: 'Mobile 58mm Bluetooth Printer', proto: 'ESC/POS / CPCL', dpi: 203, ifaces: ['Bluetooth', 'Wi-Fi', 'USB'], width: '58mm', cutter: 'Yok', baud: '115200' },
  { brand: 'Bixolon', model: 'SPP-R310', type: 'Mobil 80mm Fiş & Etiket Yazıcısı', typeEn: 'Mobile 80mm Receipt & Label Printer', proto: 'ESC/POS / CPCL', dpi: 203, ifaces: ['Bluetooth BLE', 'USB'], width: '80mm', cutter: 'Yok', baud: '115200' },
  { brand: 'Bixolon', model: 'SLP-TX400', type: 'Masaüstü Termal Transfer Barkod Yazıcı', typeEn: 'Desktop Thermal Transfer Barcode Printer', proto: 'SLCS / BPL-Z', dpi: 203, ifaces: ['USB', 'Ethernet', 'Seri'], width: '104mm', cutter: 'Var', baud: '115200' },

  // Star Micronics (Restoran & Kiosk & Apple Standartları)
  { brand: 'Star Micronics', model: 'TSP143III', type: 'LAN & Wi-Fi Fiş Yazıcısı', typeEn: 'LAN & Wi-Fi Receipt Printer', proto: 'StarPRNT / ESC/POS', dpi: 203, ifaces: ['Ethernet', 'Wi-Fi', 'USB', 'Lightning'], width: '80mm', cutter: 'Var', baud: '115200' },
  { brand: 'Star Micronics', model: 'TSP654II', type: 'Ağır Hizmet Mutfak Yazıcısı', typeEn: 'Heavy Duty Kitchen Printer', proto: 'Star Line / ESC/POS', dpi: 203, ifaces: ['Bluetooth', 'Ethernet', 'USB'], width: '80mm', cutter: 'Var', baud: '38400' },
  { brand: 'Star Micronics', model: 'mC-Print3', type: 'Kompakt Çoklu Arayüz mPOS Yazıcısı', typeEn: 'Compact Multi-Interface mPOS Printer', proto: 'StarPRNT', dpi: 203, ifaces: ['CloudPRNT', 'Bluetooth', 'Ethernet', 'USB'], width: '80mm', cutter: 'Var', baud: '115200' },
  { brand: 'Star Micronics', model: 'SM-L200', type: 'BLE Düşük Enerji Mobil Yazıcı', typeEn: 'BLE Low Energy Mobile Printer', proto: 'Star Line', dpi: 203, ifaces: ['Bluetooth 4.0 BLE', 'USB'], width: '58mm', cutter: 'Yok', baud: '9600' },
  { brand: 'Star Micronics', model: 'SM-T300i', type: 'Dayanıklı Mobil Fiş Yazıcısı', typeEn: 'Rugged Mobile Receipt Printer', proto: 'Star Line / ESC/POS', dpi: 203, ifaces: ['Bluetooth (MFi)', 'Seri'], width: '80mm', cutter: 'Yok', baud: '115200' },

  // TSC & Godex (Masaüstü Barkod & Etiket Üstatları)
  { brand: 'TSC', model: 'TE200', type: '4 inç Masaüstü Termal Transfer Yazıcı', typeEn: '4-inch Desktop Thermal Transfer Printer', proto: 'TSPL-EZ', dpi: 203, ifaces: ['USB 2.0'], width: '108mm', cutter: 'Opsiyonel', baud: '9600' },
  { brand: 'TSC', model: 'TTP-244 Pro', type: 'Endüstri Standardı Ribonlu Barkod Yazıcı', typeEn: 'Industry Standard Ribbon Barcode Printer', proto: 'TSPL', dpi: 203, ifaces: ['USB', 'Seri'], width: '108mm', cutter: 'Yok', baud: '9600' },
  { brand: 'TSC', model: 'DA210', type: 'Kompakt Direkt Termal Kargo Yazıcısı', typeEn: 'Compact Direct Thermal Shipping Printer', proto: 'TSPL-EZD', dpi: 203, ifaces: ['USB'], width: '108mm', cutter: 'Yok', baud: '9600' },
  { brand: 'TSC', model: 'DA220', type: 'Ethernet & Wi-Fi Kargo Barkod Yazıcısı', typeEn: 'Ethernet & Wi-Fi Shipping Label Printer', proto: 'TSPL-EZD', dpi: 203, ifaces: ['USB', 'Ethernet', 'Bluetooth', 'Wi-Fi'], width: '108mm', cutter: 'Var', baud: '115200' },
  { brand: 'TSC', model: 'Alpha-3R', type: '3 inç Mobil Saha Barkod Yazıcısı', typeEn: '3-inch Mobile Field Barcode Printer', proto: 'TSPL / CPCL / ESC/POS', dpi: 203, ifaces: ['Bluetooth', 'USB'], width: '72mm (3 inç)', cutter: 'Yok', baud: '115200' },
  { brand: 'Godex', model: 'G500', type: 'Dayanıklı Masaüstü Barkod Yazıcı', typeEn: 'Durable Desktop Barcode Printer', proto: 'EZPL / GEPL / GZPL', dpi: 203, ifaces: ['USB', 'Ethernet', 'Seri'], width: '108mm', cutter: 'Opsiyonel', baud: '9600' },
  { brand: 'Godex', model: 'RT700', type: 'Gelişmiş Çok Amaçlı Etiket Yazıcısı', typeEn: 'Advanced Multi-Purpose Label Printer', proto: 'EZPL', dpi: 203, ifaces: ['USB', 'Ethernet'], width: '108mm', cutter: 'Var', baud: '115200' },
  { brand: 'Godex', model: 'DT4x', type: 'Ekonomik Direkt Termal Masaüstü Yazıcı', typeEn: 'Economical Direct Thermal Desktop Printer', proto: 'EZPL', dpi: 203, ifaces: ['USB', 'Ethernet', 'Seri'], width: '108mm', cutter: 'Yok', baud: '9600' },

  // Rongta & Hoperf & Sunmi (POS & Perakende Çözümleri)
  { brand: 'Rongta', model: 'RPP02N', type: 'Taşınabilir Mini Mobil Fiş Yazıcı', typeEn: 'Portable Mini Mobile Receipt Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['Bluetooth', 'USB'], width: '58mm', cutter: 'Yok', baud: '9600' },
  { brand: 'Rongta', model: 'RP326', type: '80mm Restoran Mutfak Fiş Yazıcısı', typeEn: '80mm Restaurant Kitchen Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['USB', 'Ethernet', 'Seri'], width: '80mm', cutter: 'Var', baud: '19200' },
  { brand: 'Rongta', model: 'RP410', type: 'Termal Kargo Barkod Yazıcısı', typeEn: 'Thermal Shipping Barcode Printer', proto: 'TSPL / ESC/POS', dpi: 203, ifaces: ['USB'], width: '108mm', cutter: 'Yok', baud: '9600' },
  { brand: 'Rongta', model: 'RP80', type: 'Ağır Hizmet Kasa Fiş Yazıcısı', typeEn: 'Heavy Duty Cashier Receipt Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['USB', 'Ethernet'], width: '80mm', cutter: 'Var', baud: '38400' },
  { brand: 'Seiko', model: 'MP-B30L', type: 'Mobil Dayanıklı Etiket & Fiş Yazıcı', typeEn: 'Mobile Rugged Label & Receipt Printer', proto: 'ESC/POS / SII SDK', dpi: 203, ifaces: ['Bluetooth', 'USB'], width: '80mm', cutter: 'Yok', baud: '115200' },
  { brand: 'Seiko', model: 'RP-D10', type: 'Kompakt İki Yönlü Çıkışlı POS Yazıcı', typeEn: 'Compact Dual-Exit POS Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['USB', 'Ethernet', 'Bluetooth'], width: '80mm', cutter: 'Var', baud: '115200' },
  { brand: 'Honeywell', model: 'PC42t', type: 'Masaüstü Ribonlu Barkod Yazıcı', typeEn: 'Desktop Ribbon Barcode Printer', proto: 'Direct Protocol / ZSim / ESim', dpi: 203, ifaces: ['USB', 'Ethernet', 'Seri'], width: '104mm', cutter: 'Opsiyonel', baud: '9600' },
  { brand: 'Honeywell', model: 'PC42d', type: 'Kompakt Direkt Termal Kargo Yazıcı', typeEn: 'Compact Direct Thermal Shipping Printer', proto: 'ZSim / ESim', dpi: 203, ifaces: ['USB'], width: '104mm', cutter: 'Yok', baud: '9600' },
  { brand: 'Sunmi', model: 'V2 Pro', type: 'Dahili Termal Yazıcılı Android POS Terminali', typeEn: 'Android POS Terminal with Built-in Printer', proto: 'ESC/POS (Sunmi InnerPrinter)', dpi: 203, ifaces: ['Dahili Donanım', 'Bluetooth'], width: '58mm', cutter: 'Yok', baud: '115200' }
];

// 50 Ana Konu Listesi ve Doğal Dil Tamlamaları (processNoun)
const MAIN_TOPICS = [
  // A. Termal Yazıcı Komut Dilleri & Protokoller (1-8)
  { id: 1, title: 'ESC/POS Komut Dili ve Fiş Yazıcı Programlama', titleEn: 'ESC/POS Command Language & Receipt Printer Programming', slugTr: 'esc-pos-komut-dili-ve-fis-yazici-programlama', slugEn: 'esc-pos-command-language-receipt-printer-programming', nounTr: 'ESC/POS komut mimarisi ve fiş yazdırma' },
  { id: 2, title: 'Zebra ZPL & ZPL II Etiket Programlama Dili', titleEn: 'Zebra ZPL & ZPL II Label Programming Language', slugTr: 'zebra-zpl-etiket-yazdirma', slugEn: 'zebra-zpl-label-printing', nounTr: 'ZPL etiket formatlama ve koordinat çizimi' },
  { id: 3, title: 'TSPL ve TSPL2 Masaüstü Barkod Programlama', titleEn: 'TSPL & TSPL2 Desktop Barcode Programming', slugTr: 'tspl-ve-tspl2-masaustu-barkod-programlama', slugEn: 'tspl-tspl2-desktop-barcode-programming', nounTr: 'TSPL barkod tasarımı ve etiket kalibrasyonu' },
  { id: 4, title: 'CPCL Mobil Kurye ve Saha Yazdırma Protokolü', titleEn: 'CPCL Mobile Courier & Field Printing Protocol', slugTr: 'cpcl-mobil-kurye-ve-saha-yazdirma-protokolu', slugEn: 'cpcl-mobile-courier-field-printing-protocol', nounTr: 'CPCL saha dağıtım ve mobil fiş basımı' },
  { id: 5, title: 'EPL ve EPL2 Eski Nesil Etiket Emülasyonu', titleEn: 'EPL & EPL2 Legacy Label Emulation Architecture', slugTr: 'epl-ve-epl2-eski-nesil-etiket-emulasyonu', slugEn: 'epl-epl2-legacy-label-emulation-architecture', nounTr: 'EPL etiket dönüştürme ve emülasyon' },
  { id: 6, title: 'Star Line Mode ve StarPRNT Fiş Protokolleri', titleEn: 'Star Line Mode & StarPRNT Receipt Protocols', slugTr: 'star-line-mode-ve-starprnt-fis-protokolleri', slugEn: 'star-line-mode-starprnt-receipt-protocols', nounTr: 'StarPRNT satır modu ve mutfak adisyon basımı' },
  { id: 7, title: 'Satır Modu (Line Mode) vs Raster Sayfa Modu', titleEn: 'Line Mode vs Raster Page Mode Comparison', slugTr: 'satir-modu-vs-raster-sayfa-modu', slugEn: 'line-mode-vs-raster-page-mode', nounTr: 'satır modu ve raster sayfa modu optimizasyonu' },
  { id: 8, title: 'Karakter Kod Sayfaları ve Türkçe Karakter Çözümü', titleEn: 'Character Code Pages & Turkish Encoding Fix', slugTr: 'termal-yazici-turkce-karakter-sorunu-cozumu', slugEn: 'thermal-printer-turkish-character-encoding-fix', nounTr: 'CP857 donanımsal Türkçe kod sayfası yapılandırması' },

  // B. Bağlantı Teknolojileri & Donanım Arayüzleri (9-16)
  { id: 9, title: 'Web Bluetooth API ile Tarayıcıdan Direkt Baskı', titleEn: 'Direct Printing from Browser via Web Bluetooth API', slugTr: 'web-bluetooth-termal-yazici-baglantisi', slugEn: 'web-bluetooth-thermal-printer-setup', nounTr: 'Web Bluetooth GATT üzerinden doğrudan fiş yazdırma' },
  { id: 10, title: 'WebUSB ve WebHID ile Kablolu Donanım İletişimi', titleEn: 'Direct Hardware Communication with WebUSB & WebHID', slugTr: 'webusb-ve-webhid-ile-kablolu-donanim-iletisimi', slugEn: 'webusb-webhid-direct-hardware-communication', nounTr: 'WebUSB ile sürücüsüz masaüstü kablolu yazdırma' },
  { id: 11, title: 'Ağ ve Ethernet Raw TCP/IP Port 9100 Soket Mimarisi', titleEn: 'Network & Ethernet Raw TCP/IP Port 9100 Architecture', slugTr: 'ag-ve-ethernet-raw-port-9100-soket-mimarisi', slugEn: 'network-ethernet-raw-port-9100-socket-architecture', nounTr: 'Ethernet port 9100 doğrudan TCP soket bağlantısı' },
  { id: 12, title: 'Wi-Fi Termal Yazıcı Altyapısı ve Ağ Güvenliği', titleEn: 'Wi-Fi Thermal Printer Setup & Network Security', slugTr: 'wifi-termal-yazici-altyapisi-ve-ag-guvenligi', slugEn: 'wifi-thermal-printer-setup-network-security', nounTr: 'Wi-Fi ağ kurulumu ve kablosuz bağlantı kararlılığı' },
  { id: 13, title: 'Bluetooth Eşleşme Protokolleri: SPP vs BLE GATT', titleEn: 'Bluetooth Pairing Protocols: Classic SPP vs BLE GATT', slugTr: 'bluetooth-eslesme-protokolleri-spp-vs-ble-gatt', slugEn: 'bluetooth-pairing-protocols-spp-vs-ble-gatt', nounTr: 'Bluetooth SPP ve BLE GATT profil eşleşmesi' },
  { id: 14, title: 'Seri Port RS-232 ve Sanal COM Çözümleri', titleEn: 'Serial RS-232 Port & Virtual COM Port Solutions', slugTr: 'seri-port-rs232-ve-sanal-com-cozumleri', slugEn: 'serial-rs232-virtual-com-port-solutions', nounTr: 'RS-232 seri COM port ve baud rate yapılandırması' },
  { id: 15, title: 'Çoklu İstasyon ve Paralel Yazıcı Yönlendirme', titleEn: 'Multi-Station & Parallel Printer Routing Architecture', slugTr: 'coklu-istasyon-ve-paralel-yazici-yonlendirme', slugEn: 'multi-station-parallel-printer-routing', nounTr: 'çoklu istasyon sipariş dağıtımı ve paralel yönlendirme' },
  { id: 16, title: 'Sanal Yazıcı Simülatörleri ve Test Ortamları', titleEn: 'Virtual Printer Simulators & Dev Test Environments', slugTr: 'sanal-yazici-simulatorleri-ve-test-ortamlari', slugEn: 'virtual-printer-simulators-dev-environments', nounTr: 'sanal yazıcı emülasyonu ve test geliştirme' },

  // C. Bulut Yazdırma & Sessiz Baskı Mimarisi (17-24)
  { id: 17, title: 'Web Uygulamalarında Sessiz Yazdırma (Silent Print)', titleEn: 'Silent Printing in Web Applications (Kiosk Mode)', slugTr: 'web-uygulamalarinda-sessiz-yazdirma-silent-print', slugEn: 'silent-printing-web-applications-kiosk-mode', nounTr: 'sıfır diyalog penceresiz sessiz yazdırma' },
  { id: 18, title: 'Cloud Print Agent ve Arka Plan Masaüstü Servisi', titleEn: 'Cloud Print Agent & Background Desktop Services', slugTr: 'cloud-print-agent-ve-arka-plan-servisleri', slugEn: 'cloud-print-agent-background-desktop-services', nounTr: 'arka plan masaüstü ajanı ve yerel WebSocket köprüsü' },
  { id: 19, title: 'Webhook ve MQTT ile Uzaktan Anlık Yazdırma', titleEn: 'Remote Real-Time Printing with Webhooks & MQTT', slugTr: 'webhook-ve-mqtt-ile-uzaktan-anlik-yazdirma', slugEn: 'remote-realtime-printing-webhooks-mqtt', nounTr: 'MQTT ve Webhook tabanlı uzaktan gerçek zamanlı baskı' },
  { id: 20, title: 'Mixed Content Güvenliği ve HTTPS-Localhost Engeli', titleEn: 'Mixed Content Security & HTTPS to Localhost Block Fix', slugTr: 'mixed-content-guvenligi-ve-https-localhost-engeli', slugEn: 'mixed-content-security-https-localhost-block-fix', nounTr: 'tarayıcı Mixed Content engelinin aşılması ve güvenli WSS tüneli' },
  { id: 21, title: 'Offline Kuyruklama ve Ağ Kesintisi Dayanıklılığı', titleEn: 'Offline Print Queueing & Network Fault Tolerance', slugTr: 'offline-kuyruklama-ve-ag-kesintisi-dayanikliligi', slugEn: 'offline-print-queueing-network-fault-tolerance', nounTr: 'çevrimdışı fiş kuyruklama ve ağ kesintisi dayanıklılığı' },
  { id: 22, title: 'Zincir Mağazalar İçin Çok Şubeli Merkezi Baskı', titleEn: 'Multi-Branch Centralized Print Management for Retail Chains', slugTr: 'zincir-magazalar-cok-subeli-merkezi-baski', slugEn: 'multi-branch-centralized-print-management-retail', nounTr: 'merkezi şube yönetimi ve bulut şablon dağıtımı' },
  { id: 23, title: 'İki Yönlü Donanım Telemetrisi (Bi-Directional Status)', titleEn: 'Bi-Directional Hardware Telemetry & Real-Time Alerts', slugTr: 'iki-yonlu-donanim-telemetrisi-status-uyarilari', slugEn: 'bi-directional-hardware-telemetry-status-alerts', nounTr: 'kağıt bitti ve kapak açık donanım telemetrisi takibi' },
  { id: 24, title: 'Bulut Yazdırma REST API ve HMAC Güvenlik Mimarisi', titleEn: 'Cloud Print REST API & HMAC Security Standards', slugTr: 'bulut-yazdirma-rest-api-ve-hmac-guvenligi', slugEn: 'cloud-print-rest-api-hmac-security-standards', nounTr: 'REST API entegrasyonu ve HMAC imza güvenliği' },

  // D. E-Ticaret, Pazaryeri & Kargo Yazdırma (25-32)
  { id: 25, title: 'WooCommerce Otomatik Termal Fiş ve Kargo Etiketi', titleEn: 'WooCommerce Automatic Thermal Receipt & Label Printing', slugTr: 'woocommerce-otomatik-termal-fis-kargo-etiketi-yazdirma', slugEn: 'woocommerce-automatic-thermal-receipt-shipping-label-printing', nounTr: 'WooCommerce otomatik sipariş fişi ve kargo barkodu basımı' },
  { id: 26, title: 'Shopify ve Bulut E-Ticaret Sipariş Fişi Entegrasyonu', titleEn: 'Shopify Cloud Order Receipt & Packing Slip Integration', slugTr: 'shopify-ve-bulut-eticaret-fisi-entegrasyonu', slugEn: 'shopify-cloud-receipt-packing-slip-integration', nounTr: 'Shopify webhook ile sipariş ve paketleme fişi otomasyonu' },
  { id: 27, title: 'E-Ticaret Pazaryeri Kargo Etiketi Yazdırma (Trendyol, HB)', titleEn: 'Marketplace Shipping Label Printing (Trendyol, Amazon)', slugTr: 'pazaryeri-kargo-etiketi-yazdirma-trendyol-hepsiburada-amazon', slugEn: 'ecommerce-marketplace-shipping-label-printing-guide', nounTr: 'Trendyol ve Hepsiburada 100x150 mm kargo etiketi kırpma ve basımı' },
  { id: 28, title: 'Yemek Sipariş Platformları Entegrasyonu (Getir, Yemeksepeti)', titleEn: 'Online Food Delivery Integration (Getir, Yemeksepeti)', slugTr: 'yemek-siparis-platformlari-entegrasyonu-adisyon', slugEn: 'online-food-delivery-pos-printer-integration', nounTr: 'Yemeksepeti ve Getir siparişlerinin tek mutfak yazıcısında toplanması' },
  { id: 29, title: 'GİB E-Arşiv Fatura ve Bilgi Fişi Termal Formatlama', titleEn: 'Electronic Invoice & Tax Receipt Thermal Formatting', slugTr: 'gib-earsiv-fatura-ve-bilgi-fisi-termal-formatlama', slugEn: 'electronic-invoice-tax-receipt-thermal-formatting', nounTr: 'GİB e-arşiv fatura ve mali bilgi fişi termal formatlaması' },
  { id: 30, title: 'E-İrsaliye, Koli İçi Sevk ve GS1-128 Barkod Basımı', titleEn: 'Packing Slips, Dispatch Notes & GS1-128 Barcodes', slugTr: 'e-irsaliye-koli-sevk-ve-gs1-128-barkod-basimi', slugEn: 'packing-slips-dispatch-notes-gs1-128-barcodes', nounTr: 'koli içi sevk ve GS1-128 lojistik barkod basımı' },
  { id: 31, title: 'Kargo Taşıyıcı API Formatları ve PDF Dönüştürme', titleEn: 'Courier Carrier APIs & Automated PDF to Thermal Conversion', slugTr: 'kargo-tasiyici-api-ve-pdf-etiket-donusturme', slugEn: 'courier-carrier-apis-pdf-thermal-conversion', nounTr: 'kargo API verilerini termal etiket formatına dönüştürme' },
  { id: 32, title: 'Müşteri İade ve Depo Mal Kabul Barkodları', titleEn: 'Customer Returns & Warehouse Receiving Barcode Workflows', slugTr: 'musteri-iade-ve-depo-mal-kabul-barkodlari', slugEn: 'customer-returns-warehouse-receiving-barcodes', nounTr: 'iade süreci yönetimi ve depo mal kabul barkodlama' },

  // E. Sektörel Kullanım Senaryoları & İş Akışları (33-40)
  { id: 33, title: 'Restoran ve Kafe Mutfak Adisyon Yazdırma Mimarisi', titleEn: 'Restaurant & Kitchen Order Ticket (KOT) Printing', slugTr: 'restoran-kafe-mutfak-adisyon-yazdirma-mimarisi', slugEn: 'restaurant-kitchen-order-ticket-kot-printing-architecture', nounTr: 'restoran mutfak adisyonu ve bar yazıcı ayrıştırması' },
  { id: 34, title: 'Perakende Hızlı Satış (Fast-Retail) ve Market Kasaları', titleEn: 'Fast-Retail Point of Sale & High-Volume Cashier Systems', slugTr: 'perakende-hizli-satis-ve-market-kasa-sistemleri', slugEn: 'fast-retail-pos-high-volume-cashier-systems', nounTr: 'hızlı market kasası ve seri fiş kesme operasyonları' },
  { id: 35, title: 'Depo Toplama (Pick & Pack) ve Mobil Koridor Etiketleme', titleEn: 'Warehouse Pick & Pack and Mobile Aisle Labeling', slugTr: 'depo-toplama-pick-pack-ve-mobil-koridor-etiketleme', slugEn: 'warehouse-pick-pack-mobile-aisle-labeling', nounTr: 'depo koridorlarında mobil toplama ve anlık ürün etiketleme' },
  { id: 36, title: 'Otopark, Vale ve Araç Yıkama Barkod Otomasyonu', titleEn: 'Parking, Valet & Car Wash Barcode Ticketing Automation', slugTr: 'otopark-vale-arac-yikama-barkod-otomasyonu', slugEn: 'parking-valet-car-wash-barcode-ticketing', nounTr: 'otopark giriş bileti ve vale barkodlu tahsilat fişi' },
  { id: 37, title: 'Sıramatik ve Numaratör Kiosk Biletleme Sistemleri', titleEn: 'Queue Management & Self-Service Number Dispensing Kiosks', slugTr: 'siramatik-ve-numarator-kiosk-biletleme-sistemleri', slugEn: 'queue-management-number-dispensing-kiosks', nounTr: 'kiosk sıramatik biletleme ve numaratör basımı' },
  { id: 38, title: 'Kuru Temizleme, Terzi ve Teknik Servis Emanet Fişleri', titleEn: 'Dry Cleaning, Tailoring & Repair Shop Intake Tickets', slugTr: 'kuru-temizleme-terzi-ve-servis-emanet-fisleri', slugEn: 'dry-cleaning-repair-shop-service-intake-tickets', nounTr: 'yıkanabilir emanet fişi ve servis takip barkodu' },
  { id: 39, title: 'Sağlık, Klinik, Veteriner ve Numune Etiketleme', titleEn: 'Healthcare, Clinic, Veterinary & Laboratory Specimen Labels', slugTr: 'saglik-klinik-veteriner-ve-numune-etiketleme', slugEn: 'healthcare-clinic-veterinary-specimen-labeling', nounTr: 'klinik tüp etiketleme ve hasta bilekliği barkodlaması' },
  { id: 40, title: 'Etkinlik, Fuar, Kongre ve Yaka Kartı Baskısı', titleEn: 'Event, Expo, Conference Badge & Ticket Fast Printing', slugTr: 'etkinlik-fuar-kongre-ve-yaka-karti-baskisi', slugEn: 'event-conference-badge-ticket-printing', nounTr: 'fuar giriş bankolarında anında QR yaka kartı baskısı' },

  // F. Donanım Sorun Giderme, Kalibrasyon & Bakım (41-46)
  { id: 41, title: 'Bluetooth Termal Yazıcı Bağlantı Sorunları Rehberi', titleEn: 'Bluetooth Thermal Printer Troubleshooting Guide', slugTr: 'bluetooth-termal-yazici-baglanti-sorunlari-rehberi', slugEn: 'bluetooth-thermal-printer-troubleshooting-guide', nounTr: 'Bluetooth eşleşme ve bağlantı kopma sorunlarının giderilmesi' },
  { id: 42, title: 'Termal Baskı Kalitesi, Silik Yazma ve Kararma Çözümü', titleEn: 'Faded Thermal Print Quality, Darkness & Heat Adjustments', slugTr: 'termal-baski-kalitesi-silik-yazma-ve-kararma-cozumu', slugEn: 'faded-thermal-print-quality-darkness-fix', nounTr: 'silik baskı ve koyuluk (darkness) ayarlarının optimizasyonu' },
  { id: 43, title: 'Kağıt Sıkışması ve Otomatik Kesici Kilitlenmesi', titleEn: 'Paper Jam Clearing & Auto-Cutter Guillotine Blade Lock Fix', slugTr: 'kagit-sikismasi-ve-kesici-bicak-kilitlenmesi-cozumu', slugEn: 'paper-jam-clearing-auto-cutter-lock-fix', nounTr: 'kağıt sıkışması ve kilitlenen giyotin bıçağın kurtarılması' },
  { id: 44, title: 'Etiket Sensör Kalibrasyonu ve Boş Etiket Atlama Hatası', titleEn: 'Label Sensor Calibration & Blank Label Skipping Troubleshooting', slugTr: 'etiket-sensor-kalibrasyonu-bos-etiket-atlama-cozumu', slugEn: 'label-sensor-calibration-blank-label-skipping', nounTr: 'optik sensör kalibrasyonu ve boş etiket atlama hatasının çözümü' },
  { id: 45, title: 'Termal Kafa (TPH) Ömrü, Temizliği ve Çizgi Hatası', titleEn: 'Thermal Printhead (TPH) Cleaning, White Lines & Lifespan', slugTr: 'termal-kafa-tph-temizligi-ve-beyaz-cizgi-hatasi', slugEn: 'thermal-printhead-cleaning-white-lines-lifespan', nounTr: 'termal kafa (TPH) alkollü temizliği ve beyaz çizgi onarımı' },
  { id: 46, title: 'Termal Rulo Kağıt Standartları (BPA Free, Eko vs Lamine)', titleEn: 'Thermal Paper Standards: BPA-Free, Eco vs Top-Coated', slugTr: 'termal-rulo-kagit-standartlari-bpa-free-eko-lamine', slugEn: 'thermal-paper-standards-bpa-free-eco-top-coated', nounTr: 'BPA-free ve lamine dayanıklı termal rulo kağıt seçimi' },

  // G. Geliştirici Araçları & SDK Mimarisi (47-50)
  { id: 47, title: 'Modern Web Uygulamaları İçin Termal SDK Mimarisi', titleEn: 'Thermal Printing SDK Architecture (JavaScript, React, Vue)', slugTr: 'web-uygulamalari-termal-yazdirma-sdk-mimarisi', slugEn: 'thermal-printing-sdk-architecture-javascript-react-vue', nounTr: 'modern web SDK mimarisi ve donanım soyutlama katmanı' },
  { id: 48, title: 'React, Next.js ve Vue.js İçin useThermalPrinter Kancası', titleEn: 'React, Next.js & Vue.js useThermalPrinter Hooks', slugTr: 'react-nextjs-vue-icin-usethermalprinter-kancasi', slugEn: 'react-nextjs-vue-use-thermal-printer-hook', nounTr: 'React ve Vue reaktif yazdırma kancalarının (hooks) entegrasyonu' },
  { id: 49, title: 'React Native ve Flutter Mobil Termal Baskı Kütüphanesi', titleEn: 'React Native & Flutter Cross-Platform Thermal Print Engine', slugTr: 'react-native-ve-flutter-mobil-termal-baski', slugEn: 'react-native-flutter-mobile-thermal-printing', nounTr: 'React Native ve Flutter mobil çevre birimi köprüleri' },
  { id: 50, title: 'Termal Fiş Şablonlama ve 1-Bit Floyd-Steinberg Dithering', titleEn: 'Receipt Template Design & 1-Bit Floyd-Steinberg Dithering', slugTr: 'termal-fis-sablonlama-ve-1-bit-dithering-motoru', slugEn: 'thermal-receipt-template-design-1-bit-dithering', nounTr: 'monokrom 1-bit Floyd-Steinberg dithering görsel işleme' }
];

console.log(`🚀 Master pSEO Generator Hazırlanıyor: 50 Ana Konu x 50 Cihaz = 2.500 TR + 2.500 EN = 5.000 Zengin Sayfa`);

// Slug oluşturucu
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Şablon HTML Üretici (Türkçe)
function buildTrHtml(topic, m, trSlug, enSlug) {
  const h1Title = topic.title.endsWith('Rehberi') ? topic.title : `${topic.title} Rehberi`;
  const processPhrase = topic.nounTr || `${topic.title.toLowerCase()} işlemlerini`;

  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${m.brand} ${m.model} ${topic.title} Kılavuzu — Printzen</title>
  <meta name="description" content="${m.brand} ${m.model} ${m.type} için ${topic.title.toLowerCase()} adımları, ${m.proto} komut yapısı, ${m.ifaces.join('/')} bağlantı ayarları ve çözüm yolları.">
  <link rel="canonical" href="https://printzen.app/tr/rehber/${trSlug}">
  <link rel="alternate" hreflang="tr" href="https://printzen.app/tr/rehber/${trSlug}">
  <link rel="alternate" hreflang="en" href="https://printzen.app/guides/${enSlug}">
  <link rel="alternate" hreflang="x-default" href="https://printzen.app/guides/${enSlug}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${m.brand} ${m.model} ${topic.title} Kılavuzu — Printzen">
  <meta property="og:description" content="${m.brand} ${m.model} ${m.type} üzerinde ${topic.title.toLowerCase()} kurulumu ve sorunsuz çalışma yöntemleri.">
  <meta property="og:url" content="https://printzen.app/tr/rehber/${trSlug}">
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "headline": "${m.brand} ${m.model} ${topic.title} Kılavuzu",
        "description": "${m.brand} ${m.model} ${m.type} için ${topic.title.toLowerCase()} rehberi ve teknik ayarlar.",
        "url": "https://printzen.app/tr/rehber/${trSlug}",
        "datePublished": "2026-09-10",
        "dateModified": "2026-09-11",
        "author": { "@type": "Organization", "name": "Printzen Engineering Team", "url": "https://printzen.app" },
        "publisher": { "@type": "Organization", "name": "Printzen", "logo": { "@type": "ImageObject", "url": "https://printzen.app/favicon.svg" } }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "${m.brand} ${m.model} hangi komut protokolünü kullanır?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "${m.brand} ${m.model} cihazı yerel olarak ${m.proto} komut setini ve ${m.dpi} DPI baskı çözünürlüğünü destekler."
            }
          },
          {
            "@type": "Question",
            "name": "${m.brand} ${m.model} web tarayıcısından doğrudan yazdırılabilir mi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Evet. Printzen Web SDK veya Mobile Print Service köprüsü sayesinde Chrome ve Edge üzerinden ${m.ifaces.join(', ')} arayüzleriyle doğrudan sessiz baskı alınabilir."
            }
          },
          {
            "@type": "Question",
            "name": "${m.brand} ${m.model} Türkçe karakter veya etiket kayma problemi nasıl çözülür?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yazıcı donanım kod sayfasını CP857 (ESC t 18 veya ESC t 19 modele göre) moduna alarak ve Printzen otomatik sensör kalibrasyon yönergelerini uygulayarak problem tamamen giderilir."
            }
          }
        ]
      }
    ]
  }
  </script>
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased">
  <nav class="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
    <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/tr/" class="text-2xl font-bold text-blue-600">Printzen</a>
      <div class="flex items-center gap-4 text-sm">
        <a href="/tr/rehberler" class="text-gray-600 hover:text-blue-600 font-medium">Rehberler</a>
        <a href="/tr/rehberler/${topic.slugTr}" class="text-blue-600 hover:underline">Ana Konu Hub'ı</a>
        <a href="/guides/${enSlug}" class="border border-gray-300 rounded px-2.5 py-1 text-xs font-semibold hover:bg-gray-50">EN</a>
      </div>
    </div>
  </nav>

  <main class="max-w-4xl mx-auto px-4 py-12">
    <div class="text-sm text-gray-500 mb-4 flex items-center gap-2">
      <a href="/tr/rehberler" class="hover:underline">Rehberler</a>
      <span>/</span>
      <a href="/tr/rehberler/${topic.slugTr}" class="text-blue-600 hover:underline">${topic.title}</a>
      <span>/</span>
      <span class="text-gray-700">${m.brand} ${m.model}</span>
    </div>

    <span class="inline-block text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full mb-3">
      Donanım Rehberi · ${m.brand} · ${m.proto}
    </span>
    <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
      ${m.brand} ${m.model} ${h1Title}
    </h1>
    <p class="text-lg text-gray-600 leading-relaxed mb-8">
      <strong>${m.brand} ${m.model}</strong> (${m.type}), işletmelerde yoğun fiş, adisyon ve etiket yazdırma operasyonlarında en çok tercih edilen modeller arasındadır. Bu kapsamlı teknik rehberde, cihazın <strong>${processPhrase}</strong> süreçlerini, ${m.proto} protokol parametrelerini, ${m.ifaces.join(', ')} arayüz konfigürasyonunu ve sahada karşılaşılan kritik hataların kesin çözümlerini adım adım inceleyeceğiz.
    </p>

    <!-- Donanım Özellikleri Tablosu -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-10">
      <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>⚙️</span> ${m.brand} ${m.model} Teknik Donanım Parametreleri
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-700">
          <tbody class="divide-y divide-gray-100">
            <tr><th class="py-2.5 font-semibold text-gray-900 w-1/3">Üretici / Marka</th><td class="py-2.5">${m.brand}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Donanım Modeli</th><td class="py-2.5 font-mono font-bold text-blue-600">${m.model}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Cihaz Tipi & Sınıfı</th><td class="py-2.5">${m.type}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Komut Seti / Protokol</th><td class="py-2.5"><code class="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold">${m.proto}</code></td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Baskı Çözünürlüğü</th><td class="py-2.5">${m.dpi} DPI (${Math.round(m.dpi/25.4)} dots/mm)</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Fiziksel Arayüzler</th><td class="py-2.5">${m.ifaces.join(' · ')}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Maksimum Kağıt/Etiket Eni</th><td class="py-2.5">${m.width}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Otomatik Kesici (Cutter)</th><td class="py-2.5">${m.cutter}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Önerilen Seri Baud Rate</th><td class="py-2.5 font-mono">${m.baud} bps</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Adım Adım Entegrasyon Rehberi -->
    <div class="prose prose-blue max-w-none mb-12">
      <h2>${m.brand} ${m.model} Donanımında ${topic.title} Entegrasyon Adımları</h2>
      <p>
        <strong>${m.brand} ${m.model}</strong> donanımını üretim ortamına entegre ederken işletim sistemi kısıtlamalarını aşmak ve yüksek hacimli baskı operasyonlarında kilitlenmeleri önlemek için aşağıdaki mimari adımları sırayla takip edin:
      </p>
      
      <ol>
        <li>
          <strong>Fiziksel Bağlantı ve Port Tespiti:</strong> Yazıcıyı ${m.ifaces.join(' veya ')} arayüzü üzerinden ana terminale ya da ağ anahtarına (switch) bağlayın. Statik IP ataması yapıyorsanız ağ geçidi ve alt ağ maskesinin POS cihazıyla aynı subnet üzerinde olduğunu doğrulayın.
        </li>
        <li>
          <strong>Protokol Girişi (${m.proto}):</strong> Cihaz firmware'i yerel olarak <code>${m.proto}</code> komut setini dinler. Ham bayt dizisi göndermeden önce yazıcı hafızasını sıfırlamak için donanımsal reset komutunu (örneğin ESC/POS için <code>0x1B 0x40</code>, ZPL için <code>^XA</code>) akışın başına yerleştirin.
        </li>
        <li>
          <strong>Tampon (Buffer) ve Akış Kontrolü:</strong> Yoğun satış anlarında ${m.model} dahili tamponunun taşmasını engellemek için büyük etiket ve grafik yüklerini 512 baytlık parçalara bölerek 10-15 milisaniye aralıklarla aktarın.
        </li>
      </ol>

      <h2>Sahada En Sık Karşılaşılan Sorunlar ve Çözümleri</h2>
      <p>
        Saha teknisyenleri ve mağaza çalışanları tarafından ${m.brand} ${m.model} özelinde raporlanan en yaygın problemler ve bunların kalıcı donanımsal müdahaleleri:
      </p>

      <ul>
        <li>
          <strong>Cihaz Yanıt Vermiyor (Timeout):</strong> Bağlantı kablosunu ve arabirim kartını kontrol edin. Ethernet modellerde port 9100'ün güvenlik duvarı tarafından engellenmediğini <code>telnet &lt;yazici-ip&gt; 9100</code> komutu ile doğrulayın.
        </li>
        <li>
          <strong>Karakter Bozulması veya Kayma:</strong> ${m.brand} ${m.model} kod sayfasını kontrol edin. Karakterlerin bozuk çıkması, gönderilen karakter kümesi ile donanım ROM tablosunun uyuşmadığını gösterir.
        </li>
        <li>
          <strong>Kesici Bıçağın Kilitlenmesi:</strong> Eğer cihazda otomatik kesici (${m.cutter}) bulunuyorsa, kağıt sıkışmasında kapağı zorlamayın. Cihazın ön kapağındaki manuel kurtarma vidasını saat yönünde çevirerek bıçağı başlangıç pozisyonuna getirin.
        </li>
      </ul>
    </div>

    <!-- Printzen Tanıtım / CTA Kartı -->
    <div class="bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 mb-12 shadow-lg">
      <div class="max-w-2xl">
        <span class="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
          Sürücüsüz Bulut & Web Baskı
        </span>
        <h3 class="text-2xl font-bold mb-3">
          ${m.brand} ${m.model} Yazıcınızı Web ve Mobil Uygulamanıza 5 Dakikada Bağlayın
        </h3>
        <p class="text-blue-100 text-sm leading-relaxed mb-6">
          Karmaşık sürücü kurulumları, port yönlendirmeleri ve işletim sistemi yazdırma pencereleriyle (Ctrl+P) vakit kaybetmeyin. Printzen SDK ile tarayıcınızdan, Android tabletinizden veya arka uç sunucunuzdan doğrudan ${m.brand} ${m.model} yazıcınıza milisaniyeler içinde sessiz baskı gönderin.
        </p>
        <div class="flex flex-wrap gap-4 items-center">
          <a href="/tr/" class="bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-xl transition text-sm shadow">
            Printzen'i Ücretsiz Deneyin →
          </a>
          <a href="/tr/rehberler/${topic.slugTr}" class="text-white hover:text-blue-200 text-sm font-semibold underline underline-offset-4">
            ${topic.title} Ana Hub'ına Dön
          </a>
        </div>
      </div>
    </div>
  </main>

  <footer class="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500">
    <div class="max-w-5xl mx-auto px-4">
      <p>© 2026 Printzen.app — Tüm Hakları Saklıdır. Donanım ticari markaları ilgili üreticilere aittir.</p>
    </div>
  </footer>
</body>
</html>`;
}

// Şablon HTML Üretici (İngilizce)
function buildEnHtml(topic, m, trSlug, enSlug) {
  const h1TitleEn = topic.titleEn.endsWith('Guide') ? topic.titleEn : `${topic.titleEn} Guide`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${m.brand} ${m.model} ${topic.titleEn} Guide — Printzen</title>
  <meta name="description" content="Technical integration guide for ${m.brand} ${m.model} ${m.typeEn}: ${topic.titleEn.toLowerCase()} protocols, ${m.proto} command sets, ${m.ifaces.join('/')} interfaces, and troubleshooting.">
  <link rel="canonical" href="https://printzen.app/guides/${enSlug}">
  <link rel="alternate" hreflang="en" href="https://printzen.app/guides/${enSlug}">
  <link rel="alternate" hreflang="tr" href="https://printzen.app/tr/rehber/${trSlug}">
  <link rel="alternate" hreflang="x-default" href="https://printzen.app/guides/${enSlug}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${m.brand} ${m.model} ${topic.titleEn} Guide — Printzen">
  <meta property="og:description" content="Master ${topic.titleEn.toLowerCase()} on ${m.brand} ${m.model} ${m.typeEn} with production code samples and firmware setup.">
  <meta property="og:url" content="https://printzen.app/guides/${enSlug}">
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "headline": "${m.brand} ${m.model} ${topic.titleEn} Guide",
        "description": "Technical integration guide for ${m.brand} ${m.model} ${m.typeEn}: ${topic.titleEn.toLowerCase()}.",
        "url": "https://printzen.app/guides/${enSlug}",
        "datePublished": "2026-09-10",
        "dateModified": "2026-09-11",
        "author": { "@type": "Organization", "name": "Printzen Engineering Team", "url": "https://printzen.app" },
        "publisher": { "@type": "Organization", "name": "Printzen", "logo": { "@type": "ImageObject", "url": "https://printzen.app/favicon.svg" } }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What command language does the ${m.brand} ${m.model} use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The ${m.brand} ${m.model} natively supports the ${m.proto} command protocol at a print resolution of ${m.dpi} DPI."
            }
          },
          {
            "@type": "Question",
            "name": "Can I print directly from web browsers to ${m.brand} ${m.model}?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Using the Printzen Web SDK or Mobile Print Service bridge, you can dispatch silent print jobs directly via ${m.ifaces.join(', ')} interfaces from Chromium browsers."
            }
          }
        ]
      }
    ]
  }
  </script>
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased">
  <nav class="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
    <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="text-2xl font-bold text-blue-600">Printzen</a>
      <div class="flex items-center gap-4 text-sm">
        <a href="/guides" class="text-gray-600 hover:text-blue-600 font-medium">Guides</a>
        <a href="/guides/${topic.slugEn}" class="text-blue-600 hover:underline">Pillar Topic</a>
        <a href="/tr/rehber/${trSlug}" class="border border-gray-300 rounded px-2.5 py-1 text-xs font-semibold hover:bg-gray-50">TR</a>
      </div>
    </div>
  </nav>

  <main class="max-w-4xl mx-auto px-4 py-12">
    <div class="text-sm text-gray-500 mb-4 flex items-center gap-2">
      <a href="/guides" class="hover:underline">Guides</a>
      <span>/</span>
      <a href="/guides/${topic.slugEn}" class="text-blue-600 hover:underline">${topic.titleEn}</a>
      <span>/</span>
      <span class="text-gray-700">${m.brand} ${m.model}</span>
    </div>

    <span class="inline-block text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full mb-3">
      Hardware Guide · ${m.brand} · ${m.proto}
    </span>
    <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
      ${m.brand} ${m.model} ${h1TitleEn}
    </h1>
    <p class="text-lg text-gray-600 leading-relaxed mb-8">
      The <strong>${m.brand} ${m.model}</strong> (${m.typeEn}) is an industry-tested device widely adopted in retail POS, warehouse logistics, and kitchen order dispatching. This developer guide explores practical setup for <strong>${topic.titleEn.toLowerCase()}</strong>, low-level ${m.proto} byte structures, ${m.ifaces.join(', ')} communication, and battle-tested troubleshooting techniques.
    </p>

    <!-- Technical Specs Table -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-10">
      <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>⚙️</span> ${m.brand} ${m.model} Technical Specifications
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-700">
          <tbody class="divide-y divide-gray-100">
            <tr><th class="py-2.5 font-semibold text-gray-900 w-1/3">Manufacturer</th><td class="py-2.5">${m.brand}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Hardware Model</th><td class="py-2.5 font-mono font-bold text-blue-600">${m.model}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Device Category</th><td class="py-2.5">${m.typeEn}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Native Command Protocol</th><td class="py-2.5"><code class="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold">${m.proto}</code></td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Print Resolution</th><td class="py-2.5">${m.dpi} DPI (${Math.round(m.dpi/25.4)} dots/mm)</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Physical Interfaces</th><td class="py-2.5">${m.ifaces.join(' · ')}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Maximum Media Width</th><td class="py-2.5">${m.width}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Auto-Cutter</th><td class="py-2.5">${m.cutter}</td></tr>
            <tr><th class="py-2.5 font-semibold text-gray-900">Default Serial Baud Rate</th><td class="py-2.5 font-mono">${m.baud} bps</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Integration Steps -->
    <div class="prose prose-blue max-w-none mb-12">
      <h2>Step-by-Step ${topic.titleEn} Configuration for ${m.brand} ${m.model}</h2>
      <p>
        Deploying the <strong>${m.brand} ${m.model}</strong> in production environments demands rigorous stream handling and fault tolerance:
      </p>
      
      <ol>
        <li>
          <strong>Interface Initialization:</strong> Establish a direct channel over ${m.ifaces.join(' or ')}. When deploying on static network topologies, confirm DHCP reservation or configure a static IP on the same subnet as the host terminal.
        </li>
        <li>
          <strong>Protocol Negotiation (${m.proto}):</strong> The hardware listens for native <code>${m.proto}</code> byte sequences. Always prepend initial reset directives (e.g. <code>0x1B 0x40</code> for ESC/POS, <code>^XA</code> for ZPL) before transmitting layout payloads.
        </li>
        <li>
          <strong>Buffer Rate Limiting:</strong> Prevent internal memory overflows during peak ticket bursts by chunking payloads into 512-byte slices throttled by 10-15ms sleeps.
        </li>
      </ol>
    </div>

    <!-- Call to Action Banner -->
    <div class="bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 mb-12 shadow-lg">
      <div class="max-w-2xl">
        <span class="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
          Zero-Driver Cloud Printing
        </span>
        <h3 class="text-2xl font-bold mb-3">
          Connect the ${m.brand} ${m.model} to Your Web App in 5 Minutes
        </h3>
        <p class="text-blue-100 text-sm leading-relaxed mb-6">
          Eliminate browser print modals (Ctrl+P) and native driver dependencies. Printzen SDK provides headless, sub-second print automation across Web Bluetooth, WebUSB, and Cloud Queues.
        </p>
        <div class="flex flex-wrap gap-4 items-center">
          <a href="/" class="bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-xl transition text-sm shadow">
            Start Free Trial →
          </a>
          <a href="/guides/${topic.slugEn}" class="text-white hover:text-blue-200 text-sm font-semibold underline underline-offset-4">
            Back to ${topic.titleEn} Hub
          </a>
        </div>
      </div>
    </div>
  </main>

  <footer class="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500">
    <div class="max-w-5xl mx-auto px-4">
      <p>© 2026 Printzen.app — All rights reserved. Registered hardware trademarks belong to their respective owners.</p>
    </div>
  </footer>
</body>
</html>`;
}

// Toplu Üretim Döngüsü
let count = 0;
const sitemapUrls = [];

for (const topic of MAIN_TOPICS) {
  for (const m of HARDWARE_MODELS) {
    const hwSlug = slugify(`${m.brand}-${m.model}`);
    const trSlug = `${hwSlug}-${topic.slugTr}`;
    const enSlug = `${hwSlug}-${topic.slugEn}`;

    const trHtml = buildTrHtml(topic, m, trSlug, enSlug);
    fs.writeFileSync(path.join(TR_PSEO_DIR, `${trSlug}.html`), trHtml, 'utf8');

    const enHtml = buildEnHtml(topic, m, trSlug, enSlug);
    fs.writeFileSync(path.join(EN_PSEO_DIR, `${enSlug}.html`), enHtml, 'utf8');

    sitemapUrls.push(`https://printzen.app/tr/rehber/${trSlug}`);
    sitemapUrls.push(`https://printzen.app/guides/${enSlug}`);
    count++;
  }
}

console.log(`✅ TOPLAM ÜRETİLEN SAYFA SAYISI: ${count * 2} (${count} Türkçe + ${count} İngilizce)`);

// Sitemap Üretimi
const SITEMAP_FILE = path.join(ROOT_DIR, 'public/sitemap.xml');
const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
const xmlFooter = `</urlset>\n`;
const xmlBody = sitemapUrls.map(url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-09-11</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n');

fs.writeFileSync(SITEMAP_FILE, xmlHeader + xmlBody + '\n' + xmlFooter, 'utf8');
console.log(`🗺️ Sitemap güncellendi: ${sitemapUrls.length} URL -> public/sitemap.xml`);

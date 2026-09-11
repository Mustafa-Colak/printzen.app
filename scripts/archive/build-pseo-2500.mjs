import fs from 'fs';
import path from 'path';

const ROOT_DIR = '/Users/mustafa.colak/developer/printzen-website';
const TR_PSEO_DIR = path.join(ROOT_DIR, 'public/tr/rehber');
const EN_PSEO_DIR = path.join(ROOT_DIR, 'public/guides');

fs.mkdirSync(TR_PSEO_DIR, { recursive: true });
fs.mkdirSync(EN_PSEO_DIR, { recursive: true });

// 50 Popüler Termal & Barkod Donanım Modeli Matrisi
const PRINTER_HARDWARE_MODELS = [
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
  { brand: 'Seiko', model: 'MP-B30L', type: 'Ultra Hafif Mobil Fiş & Etiket Yazıcısı', typeEn: 'Ultra-Light Mobile Receipt & Label Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['Bluetooth', 'USB'], width: '80mm', cutter: 'Yok', baud: '115200' },
  { brand: 'Seiko', model: 'RP-D10', type: 'Kompakt İki Yönlü Çıkışlı POS Yazıcı', typeEn: 'Compact Dual-Exit POS Printer', proto: 'ESC/POS', dpi: 203, ifaces: ['USB', 'Ethernet', 'Bluetooth'], width: '80mm', cutter: 'Var', baud: '115200' },
  { brand: 'Honeywell', model: 'PC42t', type: 'Masaüstü Ribonlu Barkod Yazıcı', typeEn: 'Desktop Ribbon Barcode Printer', proto: 'Direct Protocol / ZSim / ESim', dpi: 203, ifaces: ['USB', 'Ethernet', 'Seri'], width: '104mm', cutter: 'Opsiyonel', baud: '9600' },
  { brand: 'Honeywell', model: 'PC42d', type: 'Kompakt Direkt Termal Kargo Yazıcı', typeEn: 'Compact Direct Thermal Shipping Printer', proto: 'ZSim / ESim', dpi: 203, ifaces: ['USB'], width: '104mm', cutter: 'Yok', baud: '9600' },
  { brand: 'Sunmi', model: 'V2 Pro', type: 'Dahili Termal Yazıcılı Android POS Terminali', typeEn: 'Android POS Terminal with Built-in Printer', proto: 'ESC/POS (Sunmi InnerPrinter)', dpi: 203, ifaces: ['Dahili Donanım', 'Bluetooth'], width: '58mm', cutter: 'Yok', baud: '115200' }
];

console.log(`Donanım Modeli Matrisi Yüklendi: ${PRINTER_HARDWARE_MODELS.length} Cihaz.`);

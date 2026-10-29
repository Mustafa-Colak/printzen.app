---
updatedDate: 2026-10-29
title: "SAP ECC (WWI, GLM, Adobe Forms) Yapısından SAP S/4HANA Bulut ZPL/TSPL Termal Baskı Mimarisine Geçiş Rehberi"
description: "SAP ECC içindeki SAPscript, SmartForms, Adobe Forms (ADS), EHS WWI ve GLM yazdırma kuyruklarını modernize ederek SAP S/4HANA Cloud ve onaylı bulut etiketleme katmanı üzerinden sıfır gecikmeli yerel ZPL II ve TSPL termal baskı mimarisine geçiş kılavuzu."
printerClass: industrial
brand: Zebra
publishDate: 2026-10-29
translationKey: sap-ecc-wwi-glm-adobe-forms-s4hana-cloud-zpl-migration
---

Kurumsal üretim, kimya, otomotiv ve perakende işletmeleri **SAP ECC**'den **SAP S/4HANA Cloud** (*Public veya Private Edition*) mimarisine geçerken en sık göz ardı edilen teknik darboğaz, fabrika ve tedarikçi sahasındaki **endüstriyel termal barkod yazıcıların çıktı yönetimidir** [1, 2]. Yıllarca şirket içi (*on-premise*) sunucularda çalışan **SAPscript**, **SmartForms**, **SAP Interactive Forms by Adobe (ADS)**, **SAP EHS WWI (*Windows Wordprocessor Integration*)** ve **SAP GLM (*Global Label Management*)** yapıları; bulut dönüşümü sırasında doğrudan taşındığında yüksek hacimli etiketleme hatlarında ağır kuyruk tıkanmalarına, ilk etiket çıkış gecikmesine, bozuk 2B karekodlara ve üretim duruşlarına yol açar [1, 3].

Ekim 2026 itibarıyla **Loftware Cloud** gibi çözümlerin güvenlik, sızma testleri ve yüksek hacimli **başarım ölçümü** (*perfomance test*) kriterlerini geçerek **SAP Endorsed App** statüsü kazanması; kurumsal ürün tanımlama süreçlerinin şirket içi hantal yazdırma sunucularından (`SAPSPrint` ve Windows WWI üretim sunucuları) merkezi, bulut-doğal ve doğrudan yazıcı komut dili (**ZPL II**, **TSPL**, **DPL**, **SBPL**) üreten hibrit mimarilere evrildiğini kanıtlamaktadır [1]. Bu mühendislik rehberinde; eski SAP çıktı katmanlarının neden termal baskı kafalarında darboğaz yarattığını, **SAP BTP / S/4HANA Cloud** üzerinden güvenlik duvarı delmeden yerel ağdaki (`TCP Port 9100`, `WebUSB`) yazıcılara nasıl ham ZPL II akışı sağlandığını ve şablon modernizasyon adımlarını kod örnekleriyle inceliyoruz.

<figure>
  <img src="/images/guides/sap-s4hana-zpl-gecis-tr-01.webp" width="1376" height="768" alt="SAP ECC WWI GLM ve Adobe Forms yapısından SAP S/4HANA Bulut ve uç baskı ağ geçidi üzerinden doğrudan ZPL II endüstriyel termal yazıcı mimarisine geçiş" loading="eager" decoding="async" />
  <figcaption>Şekil 1: SAP S/4HANA Cloud ve onaylı bulut etiketleme katmanından yerel uç baskı ağ geçidi aracılığıyla endüstriyel termal yazıcılara sıfır rasterizasyon gecikmesiyle doğrudan ZPL II veri akışı [1, 2].</figcaption>
</figure>

---

## 1. Geleneksel SAP Çıktı Teknolojilerinin (SAPscript, Adobe Forms, WWI, GLM) Termal Baskı Darboğazları

Şirket içi **SAP ECC** ortamlarında etiket basımı tarihsel olarak dört farklı çıktı motoru üzerinden yürütülmüştür. Ancak bu motorların büyük bölümü A4 lazer yazıcılar için tasarlandığından, `203 / 300 / 600 DPI` çözünürlüklü endüstriyel termal transfer yazıcılarda ciddi mimari sınırlar barındırır [1, 2, 3]:

| SAP Çıktı Teknolojisi | Çalışma Prensibi ve Şablon Yapısı | Termal Barkod Yazıcılardaki Teknik Darboğaz | S/4HANA Bulut Geçişinde Önerilen Modernizasyon |
| :--- | :--- | :--- | :--- |
| **SAPscript & SmartForms** | ABAP tabanlı ITF/OTF çıktısı üretir; `LB_ZEB` veya `LZEB2` aygıt tipleriyle yazıcıya gönderilir | Her etiket revizyonu için **ABAP geliştirici müdahalesi** ve sistem taşıma (*transport request*) gerekir; dış tedarikçilere açılamaz | ABAP kodundan bağımsız parametrik **ZPL II / TSPL bulut şablon kasasına** geçiş [1] |
| **Adobe Forms (ADS)** | Java / BTP üzerinde çalışan servis ile **PDF / XFA** belgesi oluşturur (`150 KB – 1,5 MB`) | PDF'in `SAPSPrint` üzerinde resme (*raster*) dönüştürülmesi **800 – 2.500 ms gecikme süresine** ve 2B barkodlarda kenar bulanıklığına yol açar | PDF kuyruğunu devre dışı bırakıp **JSON veri yükü + ham ASCII ZPL II (`2–4 KB`)** akışına geçiş [3] |
| **SAP EHS WWI** | Tehlikeli madde (GHS) etiketleri için Windows sunucularda **Microsoft Word (RTF)** şablonu işler | Çoklu Windows WWI üretim sunucularının (*Generation Server*) bakımı, Word kilitlenmeleri ve yüksek bellek tüketimi yaratır | Çok dilli GHS piktogram ve tehlike ifadelerinin **doğrudan vektörel/yerel ZPL şablonlarıyla** basılması [1, 2] |
| **SAP GLM / GLM+** | EHS altında etiket belirleme ve `SAPSPrint` kuyruk yönetimini yürütür | Şirket dışı fason üreticilere (*co-packer*) ve tedarikçi portallarına doğrudan güvenli yazıcı erişimi sağlamakta zorlanır | **SAP Endorsed App (Loftware Cloud)** ve **Printzen Uç Köprüsü** ile tedarikçi kaynağında etiketleme [1] |

<figure>
  <img src="/images/guides/sap-s4hana-zpl-gecis-tr-02.webp" width="1376" height="768" alt="Ağır Adobe Forms ve WWI PDF rasterizasyon darboğazı ile hafif yerel ZPL II komut akışının termal baskı kafası tepki gecikmesi karşılaştırması" loading="lazy" decoding="async" />
  <figcaption>Şekil 2: Sol panelde ağır PDF/RTF belgelerinin Windows yazdırma sunucusunda oluşturduğu kuyruk tıkanıklığı; sağ panelde yerel ZPL II komutlarının milisaniyelik doğrudan termal kafa tetiklemesi [1, 3].</figcaption>
</figure>

Termal yazıcılarda PDF/görsel rasterizasyonunun barkod kenar kontrastını (**ISO/IEC 15415 / 15416**) neden düşürdüğünü görmek için [Satır Modu vs Raster Sayfa Modu](/tr/rehberler/satir-modu-vs-raster-sayfa-modu/) ve [Tedarikçi Portalı Merkezi ZPL Etiket Şablon Yönetimi](/tr/rehberler/tedarikci-portali-merkezi-zpl-etiket-sablonu-yonetisimi-ve-erp-bulut-baski/) rehberlerimizi inceleyebilirsiniz.

---

## 2. SAP S/4HANA Cloud'dan Yerel Fabrika Ağına Güvenli Uç Baskı Topolojisi

Kurumsal ERP sistemi **SAP S/4HANA Cloud** ortamına taşındığında, buluttaki sunucunun fabrika veya depo yerel ağındaki (`192.168.x.x` / `10.x.x.x`) bir endüstriyel yazıcının **TCP Port 9100** soketine doğrudan dışarıdan bağlanması siber güvenlik kuralları gereği imkânsızdır (kurumsal güvenlik duvarında içeriye doğru port açılması — *inbound port forwarding* — kesinlikle yasaktır) [2].

Bu mimari engeli aşmak ve hem iç üretim hatlarını hem de dış tedarikçileri tek bir standartta birleştirmek için **Dışarıya Doğru Çekme (*Outbound Pull / WSS*) ve Yerel Şablon Önbellekleme** topolojisi uygulanır:

1. **SAP S/4HANA OData / REST Tetiklemesi:** Üretim siparişi onaylandığında veya mal hareketi (`MIGO` / `VL01N` / `EWM`) gerçekleştiğinde, SAP S/4HANA Cloud yalnızca doğrulanmış iş emri değişkenlerini (`GTIN`, `SSCC`, `BATCH`, `GHS_SIGNAL`) JSON **veri yükü** olarak bulut etiketleme katmanına iletir [1, 2].
2. **Güvenlik Duvarı Dostu Uç Baskı Ağ Geçidi (*Outbound TLS 1.3*):** Fabrika içindeki yerel uç servis (veya tedarikçi istasyonundaki tarayıcı tabanlı `Printzen WebUSB / Yerel WebSocket Servisi`), bulut kuyruğuna **dışarıya doğru (`Port 443`)** kalıcı TLS 1.3 bağlantısı açar [2].
3. **Yazıcı Belleğinde Şablon Çağrısı (`^DF` / `^XF`):** Yüksek hızlı hatlarda ağ trafiğini sıfıra indirmek için sabit etiket grafikleri ve GHS çerçeveleri yazıcının kalıcı belleğine (`E:SAP_GHS.ZPL`) bir kez yüklenir; çalışma zamanında yalnızca `500 baytlık` değişken veri gönderilir [3].

<figure>
  <img src="/images/guides/sap-s4hana-zpl-gecis-tr-03.webp" width="1376" height="768" alt="SAP S/4HANA Cloud ortamından kurumsal güvenlik duvarında port açmadan dışarıya doğru TLS 1.3 bağlantısıyla yerel Port 9100 ve WebUSB termal yazıcılara güvenli erişim" loading="lazy" decoding="async" />
  <figcaption>Şekil 3: Güvenlik duvarında içeriye port açmadan, dışarıya doğru (outbound) TLS 1.3 tüneli ve yerel uç ağ geçidi üzerinden endüstriyel termal yazıcılara güvenli erişim mimarisi [2].</figcaption>
</figure>

---

## 3. Uygulama: SAP EHS WWI / GLM ve Lojistik Verisini Doğrudan ZPL II (`^DF` / `^XF`) İle Basma

Aşağıdaki mimaride, eski **SAP EHS WWI** Word şablonları veya **Adobe Forms** PDF çıktıları yerine; yazıcının dahili flash belleğine (`E:` sürücüsü) kaydedilen kilitli bir ana şablon (`E:SAP_GLM_300.ZPL`) ve çalışma zamanında SAP S/4HANA'dan gelen değişkenleri milisaniyeler içinde çağıran (`^XF`) **Node.js / TypeScript** uç entegrasyon kodu yer almaktadır [2, 3]:

### 3.1. Yazıcı Belleğine Yüklenen Kilitli Ana Şablon (`^DF`)

```zpl
^XA
^DFE:SAP_GLM_300.ZPL^FS
^CI28
^PW1181
^LL1417
^LH0,0

^FX --- Üst Çerçeve ve SAP S/4HANA Onaylı Kayıt Başlığı ---
^FO40,40^GB1101,1337,4^FS
^FO70,65^A0N,36,36^FDSAP S/4HANA CLOUD - URUN TANIMLAMA VE IZLENEBILIRLIK^FS
^FO40,120^GB1101,4,4^FS

^FX --- Değişken Alan Tanımları (^FN1 .. ^FN7) ---
^FO70,150^A0N,30,30^FDSAP MALZEME KODU (MATNR):^FS
^FO480,150^A0N,34,34^FN1^FS

^FO70,205^A0N,30,30^FDURUN TANIMI (MAKTX):^FS
^FO70,245^A0N,42,42^FN2^FS

^FO70,310^A0N,30,30^FDPARTI / CHARG (10):^FS
^FO380,310^A0N,32,32^FN3^FS
^FO680,310^A0N,30,30^FDURETIM TARIHI:^FS
^FO900,310^A0N,32,32^FN4^FS

^FO70,365^A0N,28,28^FDEHS / GLM UYARI IFADESI:^FS
^FO70,405^A0N,28,28^FN5^FS
^FO40,460^GB1101,3,3^FS

^FX --- GS1 DataMatrix (^BX ECC 200) ---
^FO70,495^BXN,10,200,0,0,1,_
^FN6^FS
^FO350,515^A0N,28,28^FDGS1 DataMatrix (ISO/IEC 15415 Derece A)^FS
^FO350,560^A0N,26,26^FDKaynaginda Dogrulanmis Tedarikci/Uretim Etiketi^FS
^FO40,760^GB1101,4,4^FS

^FX --- GS1-128 Lojistik Birim Barkodu (SSCC - AI 00) ---
^FO70,795^A0N,32,32^FDSSCC (00) LOJISTIK PALET / KOLI KIMLIGI:^FS
^FO70,850^BY4,3,220^BCN,220,Y,N,N
^FN7^FS

^XZ
```

### 3.2. SAP S/4HANA OData / Webhook Veri Yükünü `^XF` İle Anında Tetikleyen Köprü Kodu

```javascript
import net from 'node:net';

/**
 * SAP S/4HANA Cloud / GLM çıktısını PDF oluşturmadan doğrudan yazıcı belleğindeki
 * E:SAP_GLM_300.ZPL şablonuyla (^XF) birleştirip TCP Port 9100 üzerinden basar.
 */
export async function triggerSapDirectLabelPrint(printerIp, sapPayload) {
  const clean = (val) => String(val ?? '').replace(/[\^~\\]/g, '').trim();

  // GS1 DataMatrix (_1 = FNC1) ve GS1-128 (>8 = FNC1) dizilerinin oluşturulması
  const gs1DataMatrix = `_101${clean(sapPayload.gtin14)}17${clean(sapPayload.expYYMMDD)}10${clean(sapPayload.charg)}`;
  const gs1SsccBarcode = `>;>800${clean(sapPayload.sscc18)}`;

  // Yalnızca değişken alanları (^FN1..^FN7) gönderen ~450 baytlık ultra hafif ZPL paketi
  const recallZpl = [
    '^XA',
    '^CI28',
    '^XFE:SAP_GLM_300.ZPL^FS',
    `^FN1^FD${clean(sapPayload.matnr)}^FS`,
    `^FN2^FD${clean(sapPayload.maktx)}^FS`,
    `^FN3^FD${clean(sapPayload.charg)}^FS`,
    `^FN4^FD${clean(sapPayload.prodDate)}^FS`,
    `^FN5^FD${clean(sapPayload.ehsHazardStatement)}^FS`,
    `^FN6^FD${gs1DataMatrix}^FS`,
    `^FN7^FD${gs1SsccBarcode}^FS`,
    '^PQ1,0,1,Y',
    '^XZ'
  ].join('\n');

  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);

    socket.connect(9100, printerIp, () => {
      socket.write(recallZpl, 'utf8', () => {
        socket.end();
        resolve({ status: 'PRINTED_NATIVE_ZPL', bytesSent: Buffer.byteLength(recallZpl, 'utf8') });
      });
    });

    socket.on('error', (err) => reject(new Error(`SAP Uç Yazıcı Bağlantı Hatası (${printerIp}): ${err.message}`)));
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`SAP Uç Yazıcı Zaman Aşımı (${printerIp}:9100)`));
    });
  });
}
```

<figure>
  <img src="/images/guides/sap-s4hana-zpl-gecis-tr-04.webp" width="1376" height="768" alt="300 DPI endüstriyel termal transfer baskı kafasında reçine ribon ve sentetik etiket üzerine yüksek kontrastlı GS1 barkod basımı" loading="lazy" decoding="async" />
  <figcaption>Şekil 4: Yazıcı belleğindeki (`^DF`/`^XF`) yerel şablon mimarisiyle 300 DPI termal transfer baskı kafasında sıfır kenar bulanıklığıyla üretilen GS1 barkod yapısı [3].</figcaption>
</figure>

---

## 4. Saha Donanımı, Konveyör Otomasyonu ve Tedarikçi Maliyet Etkisi

SAP etiketleme altyapısının bulut-doğal ZPL/TSPL mimarisine taşınması yalnızca bilgi işlem departmanını değil; depo donanımlarını, üretim bantlarını ve mali muhasebe süreçlerini doğrudan dönüştürür:

* **Endüstriyel Yazıcı Filosu ve Depoda Yeniden Etiketleme (*Relabeling*) Maliyetinin Sıfırlanması:** Tedarikçi kaynağında doğru etiketleme yapılmadığında mal kabul rampasında harcanan iş gücü, mobil yazıcı arabaları ve ışık geçirmez kapatıcı (*blockout*) etiket sarfiyatı için **[Rebo Teknoloji — SAP ECC/S4HANA Dönüşümünde Endüstriyel Barkod Yazıcı Mimarisi ve Depoda Yeniden Etiketleme Maliyetini Sıfırlama Rehberi](https://rebo.com.tr/sap-ecc-glm-wwi-s4hana-bulut-endustriyel-barkod-yazici-ve-yeniden-etiketleme-rehberi/)** analizini inceleyebilirsiniz.
* **Yüksek Hızlı Konveyör Hatlarında Üretim Duruşlarının Önlenmesi:** SAP GLM/WWI kuyruk gecikmelerinin dakikada 60–120 koli akan konveyör bantlarında yarattığı veri açlığını ve kesintisiz ikiz (*tandem*) yazdır-yapıştır çözümlerini **[ReboLabel — Konveyör Hatlarında Üretim Duruşlarını Önleyen SAP GLM / S/4HANA Kesintisiz Otomatik Etiketleme (Print & Apply) Mimarisi](https://rebolabel.com/blog/konveyor-hatlarinda-uretim-duruslarini-onleyen-sap-glm-s4hana-kesintisiz-print-apply-mimarisi/)** kılavuzunda bulabilirsiniz.
* **Reddedilen Sevkiyat ve Yeniden Etiketleme Ceza Faturalarının Muhasebesi:** Hatalı etiket yüzünden müşteriden dönen sevkiyatların **VUK 509** e-İrsaliye yanıtları, **TTK Madde 23** ihbar süreleri ve **TDHP 610 / 760 / 689** muhasebe kayıtları için **[UstaHesap — Tedarik Zincirinde Reddedilen Sevkiyat ve Yeniden Etiketleme Ceza Faturası Rehberi](https://ustahesap.com/rehber/tedarik-zincirinde-reddedilen-sevkiyat-yeniden-etiketleme-ceza-faturasi-ve-muhasebe-rehberi)** içeriğine başvurabilirsiniz.

---

## 5. Sıkça Sorulan Sorular (SSS)

### SAP Endorsed App sertifikasyonu standart SAP Certified entegrasyonundan neden farklıdır?
Standart SAP sertifikasyonu yalnızca teknik arayüz uyumluluğunu doğrularken; **SAP Endorsed App** statüsü yalnızca SAP'nin davetiyle (*invitation-only*) girilebilen, bağımsız siber güvenlik/sızma testlerinden ve yüksek hacimli kurumsal iş yüklerine karşı **başarım ölçümü** testlerinden geçmiş çözümlere verilir. **Loftware Cloud** bu kapsamda SAP S/4HANA Cloud ve SAP ECC ile uçtan uca doğrulanmış bulut etiketleme mimarisi sunar [1].

### SAP EHS WWI ve GLM kullanan kimya/üretim firmaları S/4HANA Cloud'a geçerken neden zorlanır?
Klasik **SAP EHS WWI** mimarisi, etiket oluşturmak için şirket içinde kurulu Windows sunucular üzerinde çalışan Microsoft Word (RTF) işlemlerine ve `SAPSPrint` servislerine bağımlıdır. **SAP S/4HANA Cloud** ortamında yerel Windows WWI sunucularını ölçeklendirmek ve dış tedarikçilere açmak operasyonel darboğaz yarattığından, GHS/CLP etiket şablonlarının doğrudan yerel ZPL II / TSPL üreten bulut etiketleme motorlarına taşınması gerekir [1, 2].

### Adobe Forms (ADS) ile üretilen PDF etiketler endüstriyel termal yazıcıları neden yavaşlatır?
**Adobe Document Services (ADS)** her etiketi `150 KB – 1,5 MB` boyutunda bir PDF belgesi olarak oluşturur. Bu PDF'in yazıcı sürücüsü tarafından siyah-beyaz nokta matrisine (*raster*) dönüştürülmesi `800 – 2.500 ms` sürer ve ağ trafiğini şişirir. Oysa `^DF` / `^XF` yerel ZPL II mimarisinde ağ üzerinden yalnızca `400 – 800 bayt` düz metin gönderilir ve termal baskı kafası `< 40 ms` içinde harekete geçer [3].

### Fabrika güvenlik duvarında içeriye port açmadan SAP S/4HANA Cloud yerel yazıcıya nasıl baskı gönderir?
Fabrika yerel ağındaki uç baskı ağ geçidi (veya `Printzen Yerel WebSocket / Cloud Print Agent` servisi), bulut sunucusuna içeriden dışarıya doğru (`Port 443` üzerinden TLS 1.3) şifreli bir bağlantı başlatır. Güvenlik duvarında dışarıdan içeriye hiçbir port açılmaz; buluttaki etiket işi bu güvenli tünel üzerinden çekilerek yerel ağdaki `TCP Port 9100` veya `WebUSB` yazıcıya iletilir [2].

---

## 6. Kaynaklar

1. **Loftware & SAP Store.** *Loftware Cloud Recognized as an SAP Endorsed App: Integrating SAP ECC, WWI, GLM, Adobe Forms, and SAP S/4HANA Cloud to Eliminate Relabeling and Production Halts.* Resmi Basın Bülteni ve Teknik Mimari Raporu, Ekim 2026.
2. **SAP SE.** *SAP S/4HANA Cloud Output Management, SAP Cloud Print Manager for Pull Integration, and EHS Global Label Management (GLM+) Architecture Guide.* SAP Help Portal Teknik Dokümantasyonu, Ekim 2026.
3. **Zebra Technologies & GS1 AISBL.** *ZPL II Programming Guide (Stored Formats `^DF`/`^XF`) & GS1 General Specifications (ISO/IEC 15415 / 15416 Barcode Print Quality Standards).* Ekim 2026.

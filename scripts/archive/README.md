# Arşivlenmiş Script'ler (2026-09-11)

Bu klasördeki script'ler, `/tr/rehber/*` ve `/guides/*` altındaki ~5.000 cihaz-özel
doorway sayfasını üretiyordu. `rehberler-sorun-tespiti.md`'deki denetim sonrası bu
sayfalar doorway-page/scaled-content-abuse riski taşıdığı için kaldırıldı; cihaz
verisi (`HARDWARE_MODELS`) artık her pillar/satellite rehberin içine gömülü bir
karşılaştırma tablosu olarak sunuluyor (bkz. commit `a7ad269`).

**Bu script'leri çalıştırma** — çalıştırırsan `public/tr/rehber/` ve `public/guides/`
altına aynı doorway sayfaları yeniden üretilir ve sorunu geri getirir.

`generate-all-2500-pseo.mjs` yine de referans değeri taşıyor: `HARDWARE_MODELS`
veri seti (50 gerçek yazıcı modeli, marka/protokol/arayüz/kağıt genişliği) buradan
geliyor ve pillar rehberlerdeki "Desteklenen Cihazlar" tablolarını üretirken bu
dosyadan okunuyor. Silme, sadece taşıma.

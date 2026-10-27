# v0.89 yeni doğrulama

- Yalnız `tests/pico-hardware089.test.mjs` ve `tests/pico-cyw43-backplane089.test.mjs`: 15 yeni kontrol başarılı. Eski test dosyaları çalıştırılmadı.
- Sekiz profilde derlenmiş C: tek seferlik yazılım IRQ, PRIMASK, öncelik, ayrı core 1 handler/vektör tablosu, GPIO iki kenar, ADC FIFO/round-robin/IRQ ve dahili ölçümler, DMA ring/byte-swap/IRQ/abort.
- Dört W/WH profilde derlenmiş C: backplane reset ve SRAM banka kontrol kayıtları, VBUS ve ortak GPIO29 üzerindeki meşgul ADC hatası. Çip firmware'i/ROM/radyo çalıştırıldığı iddia edilmez.
- Yerel tarayıcı/gerçek worker: `done=1`, `soft=1`, `core1_events=1`, `dma_events=1`; kayıtlı 40 °C / 4.2 V ortamında `temp=848`, `vsys=1737`. Varsayılan 27 °C / 5 V sonuçlarından farklı olduğu doğrulandı. Ortam proje JSON doğrulamasında, workspace → worker aktarımında ve reset boyunca korunur.
- İlgili Pico derlemesi ve uygulama önbelleği üretildi; shell sınırının altında. CI `[pico-089-only]` işareti yalnız bu iki yeni dosyayı seçer.

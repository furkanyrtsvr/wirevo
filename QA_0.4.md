# CircuitForge Studio 0.4 — 10 Ekim 2026

74 otomatik test geçer. Bunlar montaj gövdesi/delik/kontak topolojisi, eski dosya göçü, iki kanal aynı cycle kökeninde trigger/prehistory, single/auto/falling, taşma/baseline, A/B hesapları, gerçek AVR buton girişi/çıkışı ve worker kanal revision'ını kapsar. Önceki DC/ADC/PWM/UART ve kablo testleri korunur.

Yerel tarayıcı 1280×720:

- Gerilim bölücüde R1 C5/C11 konumundan R2 ile çakışan yere bırakıldı. 'Gövde çakışıyor: r2' ile C5/C11 ve x=636.94 geri geldi; undo boş kaldı.
- Geçerli C7/C13 bırakması x=662.86, canvas ve inspector delik etiketleri; Undo ile C5/C11 ve 2.50 V döndü.
- R1 altındaki C7–C10 ve R2 altındaki D13–D16 kapalı olarak işaretlendi. Açık terminaller kapalı sayılmadı.
- D13/D3/D2/D7 dört kanal. Gerçek 500 ms Blink AUTO 1 s pencerede yükselen trigger x=86'da sabit; 1.00 Hz. Pin tablosu için panel 149 px alan bıraktı.
- SINGLE alındı. CPU t=74.930 s'e ilerlerken kayıt sonu 50.759 s sabit; 'KAYIT'.
- A yükselen, B düşen kenara yerleşti: x=86 ve 198.021476; Δ500.0959 ms, 8001534 cycle. CSV dört baseline ve iki gerçek D13 kenarını içerdi; time_s=cycle/16MHz.
- Blink INTERVAL=250 kodu tarayıcıda gerçek GCC ile 1.22 s'de 5702 byte derlendi. Güncel panelde AUTO yeniden çalıştırıldı.

Gövde kutuları bilinen SVG gövde çizimlerinden çıkarılan 2D izdüşümlerdir. Dört kanallı grafik analog voltaj dalgası değildir. Mobil viewport override önceki oturumda uygulanmadığından yeni mobil screenshot doğrulaması iddia edilmez. Yayın sonucu ve kalan kabul kontrolleri bu dosyaya eklenir.
- 250 ms Blink AUTO: 2.00 Hz / DUTY 50.0%; yükselen trigger x=86; aynı eksende dört kanal.

Yayın v4: b3626992b2e3080da2ae99b1081262724fef5ff2 · başarılı · mevcut public URL. Public 1 Hz Blink ve dört kanal doğrulandı; CircuitForge-Studio-0.4.jpg.

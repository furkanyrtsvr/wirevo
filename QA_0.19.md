# QA 0.19

291 otomatik test, sıfır hata; npm run build tamamlandı. 15 yeni hazır devre gerçek pinli projelerle sabit AVR-GCC-WASM tarafından derlendi; HEX kaynakla birebir eşleşir, Flash/SRAM sınırları içinde. 27 yeni test: ADC/GPIO okumaları, yük etkisi, DC V/A, pasif Ω, LIVE/ACTIVE/OL, waveform cycle kenarları/OFF, PIR H/L/warmup/inhibit, montaj/import, HC trigger/echo/reflection/power/60ms ve servo actual pulse/frame/kalibrasyon.

Tarayıcıda jeneratör örneği WAVE=975/0, V≈4.762 ve seri I≈4.762mA; sinüs seçimi ve scope; pasif paralel ağ 500.00Ω. NTC35°C AO1.971V/DO0.025V. HC-SR04 native pulseIn100cm için99.4–99.5cm (Timer0/USART interrupt sırasında pulseIn döngüsü zaman kaybı gerçek firmware davranışıdır). Servo C++ pulse output, kol ve inspector cycle ölçüleri kontrol edildi. Geçici test sekmesi kullanıldı; kullanıcının public projesi değiştirilmedi.

Model sınırlamaları notices/LAB-BASIC-MODELS.md. Açık katalog sayısı48; hazır örnek49. Kullanım kotası başlangıç70%, resetsAt1791654746; son aşama93% ve yayına/checkpoint'e yeterli pay bırakılarak yeni büyük protokole başlanmadı.

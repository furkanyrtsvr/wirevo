# v0.83 yeni doğrulamalar

Yeni dosya: `tests/pico-advanced083.test.mjs`.
Sonuç: 22/22 yeni kontrol başarılı. Hazır USB/çift çekirdek/PIO-DMA örnekleri de yeni kontrollerin kapsamındadır.

- Sekiz kartta derlenmiş C: DMA SRAM kopyası 11+22+33+44=110; core 1 ID=1; SIO FIFO üzerinden 41→42; PIO yüksek/düşük GP15 kenarları.
- Sekiz kartta gerçek sanal USB reset/SETUP/descriptor/SET_CONFIGURATION/DTR: firmware terminal çıktısı, hosttan Z (90) okuma ve tekrar hosta gönderme.
- Dört W/WH modelinde yanlış parola reddi, doğru parola bağlantısı, UDP gerçek üç bayt payload=10+20+30=60, CYW43 sanal GPIO LED durumu.
- Dört W/WH modelinde native C BLE reklamı; bağlantı öncesi host gönderimi reddedilir; PC'den PING, firmware read/write, hosta PING; reset BLE bağlantısını temizler.
- RP2040 PIO1 ve RP2350 PIO2 TX DREQ ile 12 kelimelik DMA (FIFO'dan uzun); altı yüksek pin kenarı ve DMA sayaç=0.
- Kablosuz olmayan Pico, CYW43 başlığını kabul etmez.
- Tam Pico SDK / gerçek radyo / USB sınıflarının tamamı / fiziksel yarış zamanları doğrulanmadı. Eski testler çalıştırılmadı.
- Yerel tarayıcıda hazır USB örneği descriptor akışından sonra “Pico USB CDC hazir” yazdı; terminalden gönderilen USB83 native C tarafından geri gönderildi. W sanal ağ örneği AP sonucu=0, UDP alınan bayt=4 yazdı; bağlantılar panelinde PicoLab'a bağlanıp PING83 gönderildi ve C read/write yolu mesajı geri verdi.

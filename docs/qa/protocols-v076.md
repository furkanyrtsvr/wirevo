# v0.76 yeni protokol kabulü

- `npm run build`: başarılı; çevrimdışı shell 21 MiB sınırı altında.
- `npm run test:protocols-076`: 58/58 yeni kontrol başarılı; eski test dosyaları çalıştırılmadı.
- Gerçek firmware: Arduino Uno/AVR, ESP32-C3, STM32F103C8 ve TM4C123. Dokuz yeni davranış senaryosu her ailede yürütüldü.
- Yeni CAN/ALERT uçları ve ses parametreleri 30 kart profilinin tamamında doğrulandı. Bu, 30 kartın hepsinde ayrı firmware yürütüldüğü iddiası değildir.
- Tarayıcı: özgün WAV dosyası yüklendi, codec metadata/duration çözüldü ve proje kaydı korundu. C17 PB0 UART komutlarıyla demo oynatıldı: HTMLAudio `readyState=4`, `paused=false`, `currentTime=0.405173`, ses hatası yok. Simülasyon pause sonrası `paused=true`, `running=false` doğrulandı.
- CI `[protocols-076-only]` işaretiyle yalnız `protocols-v076-*.test.mjs` dosyalarını çalıştırır.

[Kesin işlevsel kapsam ve sınırlar](../RELEASE_0.76.md).

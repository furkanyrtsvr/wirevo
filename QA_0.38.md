# CircuitForge 0.38 — kabul kaydı

12 Ekim 2026. `npm run build` başarılı; `npm test` tam regresyon **548/548 geçti**, 172,77 saniye. Yeni profil testleri `tests/esp-board-profiles.test.mjs`; fractional koordinat ve routing/net/ZIP kabulü `tests/wire-alignment.test.mjs`.

`npm run test:boards` gerçek Clang ile 14 kart × Arduino C++/C17 (ayrı helper.c), UART PROFILE_READY / VALUE=37 ve fiziksel LED 5,909 mA: 28 firmware. H2/C5/P4/XIAO C6 için SHT31/MCP3008: sekiz firmware. Nano GPIO46 çıkış: bir firmware. Toplam **37 yeni native kabul** ve yeniden üretilebilir SHA doğrulamalı compiler/engine fixture.

Resmî MicroPython interpreter: 14 kartta fiziksel Pin, montaj/net ve örnek doğrulaması; XIAO/Nano D0 alias gerçek GPIO çıkışı. Dört kartta SoftI2C SHT31 25 °C; SoftSPI MCP3008 512 → pot değişikliği →768. P4 GPIO54 ikinci banka, H2/C5/P4 ayrılmış pinlerin kapalı olması ve güç alias'ları doğrulandı. Altı CPU için gerçek clock-wrap, linker RAM/IRAM taşması, unsupported analogRead/WiFi reddi ayrıca `scripts/check-esp-core.mjs` ile geçti.

Tarayıcı: yerel P4 C17 başlangıcı Clang firmware 9568 byte, gerçek UART LED ON/OFF, 3,30 V ve 5,91 mA, analizör 25 Hz. C5 ortak breadboard çiziminde kablo seçimi → Düz bağlantı: eski dört nokta yerine aynı iki pin arasında tek çizgi; özellik paneli uçları değişmedi. XIAO C6 MicroPython SHT31: hazır örnek GPIO22/23'e eşlendi; gerçek yorumlayıcı TEMP25/HUM50, ortamı 37 °C yapınca TEMP37/HUM50 ve bus kenarları. Durdur ile worker sonlandı.

Bir ilk regresyon turunda C3 IRAM/DRAM adres alias'ını yanlış düz adres olarak karşılaştıran yeni provenance kontrolü başarısızdı; fiziksel alias hesabı düzeltildi, ayrı kabul geçti ve tam tur yeniden çalıştırıldı. Ürün CPU testi başarısızlığı değildir. Önceki 54 ESP native örneği ve AVR suite aynı tam test turunda yer alır.

Ekran çıktıları kök CircuitForge-0.38-Kablo.png ve CircuitForge-0.38-MicroPython.png. Model/revizyon sınırları dist/notices/ESP32-BOARD-PROFILES.md, devam adımları DEVAM_PLANI.md içinde. Arduino SDK/RF/PSRAM/kart üzerindeki tüm cihazlar doğrulandı diye sunulmaz.

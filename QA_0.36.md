# CircuitForge 0.36 doğrulama kaydı

11 Ekim 2026. ESP32 serbest devre/sensör çalışması; önceki AVR alanı korunur.

## Gerçek derleme ve yürütme

- 12 yeni sensör devresi ×C3/C6/S3 =36 gerçek Clang firmware. Önceki18 örnek yeniden üretildi; toplam54. tests/fixtures/esp-circuits.json kaynak, hedef, firmware, beklenen UART ve gerçek yürütme ölçümlerini taşır.
- `node scripts/check-esp-core.mjs`: üç hedefte clock wrap, linker sınırları ve desteklenmeyen API kontrolleri geçti.
- S3 BMP280 derin çağrı zincirinde Xtensa window overflow/underflow giderildi; gerçek firmware geçer.
- Resmî Arduino C3 SDK native GCC / Clang sketch /56 full-core kaynak /WASM LLD kapıları gerçek ROM UART ve GPIO kabulünü geçti. Reçete docs/ESP32_SDK_PROGRESS_0.36.md. SDK dağıtımı ve genel API kabulü ayrı kapsam.

## Otomatik kabul

`npm test`: 460/460 geçti;0 hata/atlanan;160.005 saniye. Kapsam: eski AVR regresyonları, gerçek C3/C6/S3 GPIO/pull-up/buton/DC LED; üç kartın gerçek MCP3008 SPI firmware'inde pot512→768; SHT31 sıcaklık/nem değişimi ve besleme/SDA kopması; DS18B20 negatif9bit dönüşüm/CRC/slot; röle kontak ve DC voltmetre;37 bileşen sınır/değer/pin doğrulaması;54 görüntü ve JSONv3/legacy eşleşmesi; panel boyut normalizasyonu. Son tam test logu `.sites-runtime/tests-036-pass.log` (yerel, paket dışında).

## Tarayıcı kabulü

Gerçek Clang ile C3 SHT31 çalıştı:25°C→40°C UART2500→3999; nem75%→7499 (sensör quantizasyonu). Pot50%→75% aynı çalışan firmware'de512→768 ve1650→2475mV; yeniden derleme gerekmedi. Değer değişikliği JSONv3 dışa aktarımında korunur.

Zener ekleme/Vz3.3 ayarı; klavyeyle iki pad bağlama ve geri alma kontrol edildi. Bozuk pin içeren JSON mevcut projeyi değiştirmeden reddedildi. Geçerli pot75% projesi geri açılıp yeniden yüklemede75% korundu. Pencere panel seçimi/devre80%/terminal90px yerelde kaldı. OLED gerçek framebuffer pikseli fiziksel ekran alanında görünür. DC multimetre karta V/COM ile bağlanıp3.300V gösterir.

## Build ve sınırlar

Build333 kabuk dosyası 17.063.372 bayt;20MiB kabuk sınırında. SHA doğrulanmış22.6MB gzip Clang ayrı önbellekte. Tam Arduino SDK binary'leri dağıtımda yoktur. Core0.2 yazılım Wire/SPI ve1-Wire sunar; dahili ADC/LEDC/PWM, hardwarebus, Wi-Fi/BLE, parasite/search ROM ve I²C stretching yoktur. Haricî ADC dahili analogRead diye sunulmaz. CPU çevriminden16MHz sensör zamanı,40ms GPIO UI raporu, idealize DC modeller: gerçek zaman SPICE değildir.

# 0.39 C17 sensör güncellemesi

14 ESP kartında C dili için SHT31 ve MCP3008/pot devreleri eklendi. main.c + düzenlenebilir cf_bus.c/h; ayrı Clang C17 çeviri birimleri, gerçek GPIO I²C/SPI, ACK/CRC ve kaynak ZIP. Güncel kapsam C17-SENSORS.md içinde. Aşağıdaki 0.37 ayrıntıları korunan tarihsel bağlamdır.

# CircuitForge 0.37 — ortak çalışma alanı

Dosya → Yeni proje: mimari, kart, dil ve başlangıç devresini seçin. Altı AVR kartı ve ESP32-C3/C6/S3 aynı devre editörünü, fiziksel breadboard deliklerini, mıknatısı, kablo rotalarını, özellik panelini ve Pencere düzenini kullanır. Eski /esp32 bağlantısı bu ekrana yönlenir. JSON ve ZIP kartı, dili, kaynakları, montajları ve geçerli programı saklar. Eski ESP JSON v1/v2/v3 projeleri ortak biçime aktarılır. Projeler menüsü seçili ESP kartı ve dili için uygun örnekleri gösterir; önceki 18 Arduino C++ devresi üç hedefte korunur.

## Diller

| Hedef | Dil | Ana dosya | Yürütme |
|---|---|---|---|
| AVR | Arduino C++ | sketch.ino | GCC / AVR8js |
| ESP32 | Arduino C++ | sketch.ino | Clang C++17 / gerçek ESP-EMU CPU |
| ESP32 | C | main.c | Clang C17 / gerçek ESP-EMU CPU |
| ESP32 | MicroPython | main.py | Resmî MicroPython WASM yorumlayıcısı / fiziksel devre adaptörü |

C programı `int main(void)` kullanır; ek .c/.h dosyaları ayrı çevrim birimleridir. cf_hal.h: cf_gpio_mode/write/read, cf_delay_ms/us, cf_millis, cf_uart_begin/write. GPIO ve UART, C++ firmware ile aynı donanım registerlarına gider. stdint/stdbool/stddef ve sınırlı stdio (puts/putchar/printf: %s/%c/%d/%u/%x/%X/%%) sağlanır. Tam libc/newlib, ESP-IDF ve RF SDK desteği değildir. C sensör protokolü bu GPIO HAL üzerinde yazılabilir; hazır Wire/SPI sınıfları Arduino C++ dilindedir.

MicroPython, ESP32 ROM firmware'i üzerinde çalışmaz; gerçek WASM Python yorumlayıcısı Pin/SoftI2C/SoftSPI adaptörleriyle aynı elektriksel ağı sürer. Pin IN/OUT/OPEN_DRAIN ve PULL_UP desteklenir; S3 GPIO46 giriş ve çıkış destekler (0.38 resmî pinout düzeltmesi). SoftI2C 1–10 kHz; SoftSPI MODE0 / MSB / 8 bit / 10–20 kHz. Adaptörler 30 kΩ iç pull-up kullanır; modül beslemesi, haricî pull-up, kablolar, kaynak direnci ve gerçek slave yanıtları yine belirleyicidir. SHT31 örneği CRC denetler. MCP3008 fiziksel potansiyometreyi örnekler. machine.ADC/PWM, donanım I2C/SPI ve Pin IRQ bu sürümde yoktur; UART RX Python tarafında kapalıdır.

Canlı giriş değişikliklerinin işlenmesi için sonsuz döngüde `import js` ve `await js.cf.sleep(ms)` kullanın. `time.sleep_us/ms` model zamanını ilerletir; sürekli senkron döngü worker mesajlarını engeller. Durdur worker'ı her durumda sonlandırır. MicroPython duraklatma da worker'ı sonlandırır; Yeniden çalıştır programı baştan başlatır. CPU adımlama Python için kapalıdır. Python sözdizimi kontrolü kullanıcı programını çalıştırmadan yapılır; içe aktarılan modül hataları yürütmede de bildirilebilir.

ESP GPIO analizörü UI örneklemesinden kenar üretmez: native CPU komutlarının ve Python GPIO/bus işlemlerinin çözülmüş pin değişimleri kaydedilir. Zaman 16 MHz ortak model eksenine çevrilir; Python zamanı ESP CPU performans ölçümü değildir. DC ölçüm kaydı da çözüm değişimlerinden alınır. Native ESP tek adım 10000 komuttur; simülasyon hızı tarayıcı performansına bağlıdır. AVR zamanlama altyapısı korunur.

ESP Arduino seçeneği mevcut bağımsız CircuitForge core0.2 kapsamındadır. Wi-Fi/BLE, dahili ADC/LEDC ve tam Arduino-ESP32 SDK hâlâ ayrı geliştirme aşamasıdır. Önceki 54 gerçek ESP firmware örneği ve altı AVR kartının çevrebirim desteği korunur. Ayrıntılar ESP32-MODEL.md ve docs/ESP32_SDK_PROGRESS_0.36.md.

## MicroPython kaynağı ve lisans

Resmî `@micropython/micropython-webassembly-pyscript@1.29.0-6`, MIT. Dağıtımın mjs/wasm dosyaları değiştirilmeden saklanır; SHA-256 ve kaynak URL'leri micropython/provenance.json içinde. machine.py adaptörü CircuitForge tarafından yazılmıştır.

- https://github.com/micropython/micropython/blob/v1.29.0/ports/webassembly/README.md
- https://github.com/micropython/micropython/blob/v1.29.0/ports/webassembly/api.js
- https://docs.micropython.org/en/v1.29.0/library/machine.Pin.html
- https://cdn.jsdelivr.net/npm/@micropython/micropython-webassembly-pyscript@1.29.0-6/

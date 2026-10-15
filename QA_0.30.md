# CircuitForge 0.30 doğrulama — 2026-10-11

70 kütüphane girişi /75 örnek; Uno R3, klasik Nano ve Pro Mini 5 V /16 MHz. npm run build başarılı; npm test: 385 test /0 hata (82.6 s).

Native GCC kabulü scripts/check-boards-uart.mjs ve tests/fixtures/boards-uart.json ile yeniden üretilebilir. Nano/Pro Mini: 2982 byte Flash, 198 byte statik SRAM; SoftwareSerial: 4320 byte Flash, 265 byte SRAM. Kart makro kontrolleri gerçek seçilmiş hedefi doğrular. Kart kimliği firmware önbelleği ve kaynak anahtarına dahil edilir.

Sekiz yeni kabul testi: Nano/Pro Mini A6-A7 analog-only ve D3 PWM, canonical pin/alias doğrulaması, hedef firmware eşleşmesi, gerçek SoftwareSerial/PCINT ile CO2 paketleri, güç/TX kopması, UART 7E2 sample/stop timing, terminalin fiziksel D0 RX yolu, dispose sonrası bekleyen hat olaylarının iptali. Önceki 377 test de geçti.

Temiz localhost:4175 origin üzerinde tarayıcı WebAssembly GCC derlemeleri: Nano 3.25 s, Pro Mini 1.90 s, SoftwareSerial 3.03 s. Nano ve Pro Mini UART çıktısı A6=512 A7=1023; SoftwareSerial gerçek D2/D3 üzerinden düzenli SOFT_CO2=800. Ekran kanıtları üst klasörde CircuitForge-0.30-Nano.png, CircuitForge-0.30-Pro-Mini.png ve CircuitForge-0.30-SoftwareSerial.png. Eski localhost:4174 origin'indeki önceki sürüm offline önbelleği temiz test origin'iyle ayrıldı. Canlı kullanıcı projesi değiştirilmedi.

Kapsam ve sınırlar dist/notices/BOARD-UART-MODELS.md içinde: 5-8 bit asenkron elektriksel UART, upstream SoftwareSerial, seçilen üç ATmega328P kart. 9-bit USART, tam FIFO/overrun, USB/bootloader/regülatör, 3.3 V Pro Mini, Mega/Leonardo/ESP32 bu sürümün destek listesinde değildir.

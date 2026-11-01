# nRF52840 — Wirevo 0.111.0

Bu sürüm eğitim ve C programı/devre etkileşimi içindir. %100 silikon, tam Nordic SDK veya gerçek Bluetooth radyo emülasyonu değildir.

## Kart profilleri ve görseller

| Profil | Referans | Farklar |
|---|---|---|
| Pro Micro nRF52840 / kırmızı SuperMini | sasodoma tersine çıkarılmış kırmızı kart | USB-C, P0.15 aktif HIGH LED, Pro Micro başlıkları; tüm satıcı klonlarını kapsamaz |
| nice!nano v2 | nice!keyboards v2 şema/pinout, ZMK v0.3.0 kart tanımı | Siyah PCB; BAT+/RAW konumu batarya hattıdır; P0.15 aktif HIGH LED |
| XIAO nRF52840 | Seeed XIAO v1.1 şeması | 14 kenar pini; D0..D10 farklı native pinlerdir; aktif LOW RGB |
| XIAO nRF52840 Sense | Seeed Sense v1.1 şeması | Aynı dış pin dizilimi; fiziksel mikrofon ayrıntısı; dahili IMU/PDM bu sürümde çalışmaz |

Görseller gerçek kart fotoğrafları ve pinout ile karşılaştırılmış özgün SVG çizimleridir. Fotoğraf değildir; bakır izleri ve küçük pasifler temsilidir. Pin etiketleri dışarıda okunabilir native adlarla gösterilir. [Kart görselleri](nrf52-boards.html).

nice!nano/SuperMini üzerinde fiziksel reset düğmesi uydurulmaz: RST padindeki tıklanabilir alan **sanal reset**tir (gerçekte RST-GND bağlantısı). XIAO üzerindeki gerçek reset tact konumuna tıklanabilir. Reset firmware’i baştan başlatır.

**Güç sınırı:** Simülasyonda kart çalışır ve 3V3 çıkışı 3.3 V kabul edilir. nice!nano RAW pinine 5 V çıkış atanmaz. Batarya, şarj devresi, EXTVCC kesmesi, SuperMini klonlarının farklı batarya bölücüleri modellenmez. XIAO 5V USB güç profiliyle 5 V sağlar; GPIO her zaman 3.3 V modelidir. nRF GPIO 5 V toleranslı kabul edilmez.

## Başlama

1. Dosya → Yeni proje → **Nordic nRF52840** mimarisini seçin.
2. Doğru kart profilini ve **C · main.c** dilini seçin.
3. Kart LED/UART, harici tact, TIMER0 veya ADC örneğini açın. Projeler/örnekler bölümünde **Sensör laboratuvarı** da vardır.
4. **Derle** ile C kaynakları tarayıcıdaki Clang WebAssembly ile gerçek Thumb firmware’e çevrilir. İlk derleyici indirmesi yaklaşık 22.6 MB; önbellek sonrası yeniden kurulum gerekmez.
5. **Çalıştır** ile firmware, ARM komut motorunda yürütülür. Port, anahtar, yardımcı servis, açık masaüstü uygulaması veya sunucuda derleme gerekmez.
6. GPIO’da `nrf_gpio_cfg_output(P0_17)` yerine yardımcı `cf_gpio_mode(P0_17,CF_OUTPUT)` kullanılabilir. `nrf_gpio_cfg_output` da native sayı kabul eder. Nordic register erişimi için `#include <nrf.h>` kullanın.
7. Ek `.c` ve `.h` dosyaları aynı projede ayrı derlenir. Projeyi JSON veya ZIP indirerek devre, kaynaklar, geçerli firmware ve debug bilgisini birlikte taşıyın.

`cf_hal.h` içindeki BOARD_TXD/RXD/SDA/SCL/SCK/MOSI/MISO sabitleri örneklerin seçtiği pinlerdir; Nordic çevrebirimlerinde donanım sabit pin zorunluluğu değildir. PSEL ile başka dış GPIO seçilebilir. `LED_BUILTIN` ve `BOARD_LED_ACTIVE_LOW` kart LED farkını taşır. XIAO D4/P0.04 ve Pro Micro P0.17 aynı fiziksel pin değildir.

## Motor ve doğrulanan kapsam

Ayrı nRF52840 MMIO/task/event modeli, ortak ARMv7E-M komut çekirdeğini kullanır. STM32/Pico çevrebirim haritası kullanılmaz. 1 MiB flash 0x00000000, 256 KiB SRAM 0x20000000, 64 MHz CPU zaman tabanı, gerçek başlangıç vektörü, `.data` kopyalama ve `.bss` temizleme uygulanır. Firmware paketinde kart kimliği, boyut ve CRC kontrol edilir. CPU WebAssembly dosyası SHA-256 ile doğrulanır.

| Alan | Doğrulanan / uygulanan alt küme | Sınır |
|---|---|---|
| GPIO | P0/P1, DIR/OUT/SET/CLR/IN, PIN_CNF, pull-up/down, open-drain sürüş | DRIVE akım sınıfları, SENSE/LATCH ve pin başına güç tüketimi tam değil |
| GPIOTE | 8 kanal, giriş kenarı olayı ve output/set/clear task | PORT/SENSE/PPI zincirlerinin tamamı yok |
| TIMER0..4 | 16 MHz prescaler, 8/16/24/32 bit, compare/capture, clear/stop SHORTS, NVIC kesmesi | Tam task/PPI zincirleri ve mutlak çevrim doğruluğu hedeflenmez |
| SAADC | AIN0..7 tek uçlu, 8/10/12/14 bit, referans/gain ölçeği, SRAM int16 EasyDMA | Diferansiyel, oversampling, analog edinim süresi/noise yok; tek SAMPLE tamponu örneği doğrulandı |
| PWM0..3 | Ortak tek uint16 EasyDMA örneği, yukarı sayım, 4 çıkış/prescaler/top | Individual/grouped/waveform decoder ve dizi döngüleri yok |
| UART0 | Başlat/durdur, TX/RX, 8N1 / even parity, sınırlı RX FIFO; terminal ve fiziksel pinler | CTS koşulu temel seviyede, tam RTS/CTS akış kontrolü ve tüm hata zamanları doğrulanmadı |
| UARTE0/1 | SRAM buffer, MAXCNT/AMOUNT, TX/RX start/end olayları, gerçek TX/RX pin dalgası | 4096 öğe/aktarım sınırı; gelişmiş SHORTS, kesintisiz double-buffer RX yok |
| TWIM0/1 | 7-bit adres, SRAM EasyDMA, ACK/NACK, TX, RX, repeated-start, STOP SHORTS | TWI legacy, TWIS slave, SUSPEND/RESUME ve clock stretching yok |
| SPIM0/1 | SRAM EasyDMA, ORC, CPOL/CPHA ve bit sırası, TX/RX pinleri, firmware kontrollü CS | Legacy SPI/SPIS ve SPIM2/3 yok; mode0 MCP3008 bütünleşik olarak doğrulandı |
| CLOCK | Sabit 64 MHz temel HF çalışma durumu/start olayları | LF kaynakları, gerçek osilatör, güç modları ve radyo zamanlaması değil |
| Debug | Gerçek komut öncesi breakpoint, kaynak satırı adımı, temel skaler/pointer değişken izleme | DWARF4 / -O0 profili; struct/array içerik görüntüleme, koşullu breakpoint ve tam GDB yok |

EasyDMA yalnız SRAM’e erişir; flash pointer ve 4096’dan büyük aktarım açık hatadır. Normal CPU bellek erişimi DMA yerine geçirilmez. Seri donanım, GPIO dalga biçimlerini aynı elektrik çözümüne gönderir; sensör yanıtı hazır değer olarak doğrudan register’a yazılmaz.

### Bütünleşik laboratuvar

Dört profilin her birinde yeni test devresi: SHT31 24 °C / %55 RH, 24LC256 yazma/okuma, PCF8574 üzerinden LCD 16×2’de **NRF52840 / C17 OK**, MCP3008 CH0, SAADC AIN0 potansiyometre, %50 PWM kart LED’i, UART terminal. ADC yaklaşık 1877/4095 (0.6 V referans, 1/6 gain, 3.3 V pot orta noktası), SPI ADC 512/1023. Sonuç **LAB OK**. Ayrı yeni doğrulamalarda fiziksel UARTE even-parity loopback, EasyDMA sınır hatası, timer IRQ, buton/reset, FPU skaler işlem, breakpoint/satır adımı ve worker akışı denetlenir.

Bu doğrulama, kütüphanedeki tüm bileşenlerin tüm modlarının test edildiği anlamına gelmez. Uyumlu elektrik/protokol modelleri ortak bileşen motorunu kullanır; 3.3 V seviyeleri ve sürücü kodu kullanıcı sorumluluğundadır. Her ekran/sensör için hazır Nordic SDK sürücüsü sağlanmaz.

## Kapsam dışı ve USB HID değerlendirmesi

Bluetooth radyo/özgün firmware, SoftDevice, nRF Connect SDK, Zephyr/ZMK, Arduino framework, USB controller/bootloader/HID, NFC, RTC, WDT, PPI, I²S, QSPI, tam güç yönetimi, güvenlik ve Sense dahili IMU/mikrofon henüz uygulanmamıştır. RADIO/USBD gibi desteklenmeyen bloklara erişim çalışma hatası üretir. Tam SDK projesini bu C17 freestanding profile sürüklemek çalışacağı anlamına gelmez.

Klavye HID için ileride USBD endpoint/DMA, USB host tarafı descriptor/control/interrupt transferleri ve firmware entegrasyonu gerekir. Bu tarayıcı içinde sanal USB host ile uygulanabilir bir ayrı iş paketidir; mevcut sürümde klavye çalışıyor veya işletim sistemine gerçek USB klavye bağlandı denmez. BLE için sanal GATT modeli de gerçek RF/SoftDevice yürütümü sayılmaz.

## Kaynaklar / revizyonlar

- [Nordic nRF52840 ürün teknik belgesi v1.9](https://docs-be.nordicsemi.com/bundle/nRF52840_PS_v1.9/raw/resource/enus/nRF52840_PS_v1.9.pdf)
- [Nordic nrfx v3.2.0 MDK register başlıkları](https://github.com/NordicSemiconductor/nrfx/tree/v3.2.0/mdk) — BSD-3-Clause; lisans bildirimi dağıtılan başlıklarda korunur. Bitfield dosyasında kullanılan çevrebirim bölümleri seçilmiştir; eksiksiz nrfx sürücü paketi değildir.
- [nice!nano v2 pinout ve şema](https://nicekeyboards.com/docs/nice-nano/pinout-schematic/)
- [ZMK v0.3.0 nice!nano LED tanımı](https://github.com/zmkfirmware/zmk/blob/v0.3.0/app/boards/arm/nice_nano/nice_nano.dtsi) / [v2 farkları](https://github.com/zmkfirmware/zmk/blob/v0.3.0/app/boards/arm/nice_nano/nice_nano_v2.dts)
- [SuperMini kırmızı kart tersine çıkarılmış şema ve fotoğrafları](https://github.com/sasodoma/nrf52840-promicro) — üretici standardı veya tüm klonlar için garanti değildir.
- [Seeed XIAO nRF52840 / Sense wiki, şema ve fotoğraflar](https://wiki.seeedstudio.com/XIAO_BLE/)

ARM komut çekirdeği ve bağımlılık lisansları için depodaki STM32 vendor / üçüncü taraf bildirimlerine bakın. Yeni nRF köprüsü bu kaynağa Cargo path bağımlılığıyla derlenir. `cargo build --manifest-path src/nrf52/Cargo.toml --target wasm32-unknown-unknown --release` sonrası WASM ve SHA-256 manifesti birlikte güncellenmelidir. Bunlar geliştirici derleme adımlarıdır; kullanıcıya Rust veya yardımcı uygulama kurulumu gerekmez.

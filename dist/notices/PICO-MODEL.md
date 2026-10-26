# Pico C modeli · v0.84

Sekiz resmî model: Pico / Pico H / Pico W / Pico WH / Pico 2 / Pico 2 with headers / Pico 2 W / Pico 2 W with headers.

- RP2040: Cortex-M0+ C17 firmware, 264 KiB RAM / 2 MiB flash.
- RP2350: Cortex-M33 C17 firmware, 520 KiB RAM / 4 MiB flash.
- Kart başına imzalı hedef adı + CRC, gerçek ARM makine kodu, modelin ayrı işlemci çekirdekleri. RP2350 firmware'i RP2040 modelinde yürütülmez.
- C kaynakları ayrı derlenip bağlanır; pico/stdlib.h, pico/time.h, hardware/gpio.h ve stdio.h için küçük uyumluluk SDK'sı otomatik sağlanır.
- GPIO, UART0/terminal, model zamanı/sleep ve C çoklu dosya bağlama.
- Yeni: GP26–28 için devredeki voltajdan 12-bit ADC; zamanlı donanım PWM çıkışları; UART1 terminal çıkışı. UART1 girişini fiziksel harici modüle bağlayan adaptör bu kapsamda değildir.
- Yeni: hardware/i2c.h ve hardware/spi.h için bloklayan master çağrıları. Bu uyumluluk katmanı GPIO üzerinden bit sürer; register/FIFO/DMA kullanan donanım sürücüsü değildir. I²C adres/data ACK, NACK, tekrarlı START, STOP ve en fazla 10 ms clock-stretch beklemesi içerir. SPI 8-bit MSB-first, mod 0–3 ve kullanıcı kontrollü CS kullanır; desteklenmeyen veri biçimi transferde -1 döndürür. GPIO tabanlı aktarım hızı en fazla 500 kHz, gerçek hız fonksiyon maliyetinden dolayı daha düşüktür. Pin mux seçimi ilk eşleşen GPIO çiftini kullanır; tek bus için birden fazla alternatif çift seçmeyin.
- Yeni: Clang -O0 / DWARF4 ile derlenen Pico C kodunda gerçek adres breakpointi (F9), kaynak satırı adımı (F10, step-into), duraklat/devam ve gerçek RAM/yazmaç üzerinden scalar global/yerel/parametre izleme. Kaynak dışındaki kodda ilerleyip yeni kullanıcı satırına ulaşır; bir satır adımı 500.000 komutla sınırlıdır. Satır çalıştırılmadan önce durur; yeni tanımlanan ama henüz atanmayan yerel değişkende RAM'in o andaki değeri görülebilir.
- Değişken izlemesi ad kabul eder; genel C ifade değerlendirme, struct/array genişletme, çağrı yığını, step-over/out ve diğer mimarilerde kaynak debugger henüz sunulmaz. Desteklenmeyen DWARF konumu/türü “kullanılamıyor” gösterir. Eski firmware debugger için yeniden derlenir.
- GPIO 3.3 V'tur. H/header varyantlarında pin dizilimi aynıdır; görünümde hazır başlık ayrımı vardır.
- Dahili LED görseli kablosuz olmayan modellerde gerçek GP25 çıkışını, W modellerinde sınırlı cyw43_arch_gpio_put(0, ...) model durumunu izler.


## v0.83 ileri çalışma profilleri

- USB CDC: pico/stdio_usb.h + tusb.h içindeki polled alt küme, gerçek SETUP/DPRAM/IN/OUT modeline bağlıdır. stdio_usb_init sonrası while (!stdio_usb_connected()) tud_task(); kullanın; ana döngüde tud_task() çağırın. Tam TinyUSB değildir.
- PIO: hardware/pio.h, instruction dizisi yükleme, SM konfigürasyonları, wrap/saat/pin/FIFO/DREQ; RP2040 iki, RP2350 üç PIO bloğu. Otomatik .pio assembler yoktur.
- DMA: hardware/dma.h, gerçek aileye özel kanal register'leri, SRAM kopyası ve PIO DREQ. IRQ/sniffer/ring SDK yüzeyinin tümü yoktur.
- Multicore: pico/multicore.h; iki native ARM çekirdeği, ortak SRAM, SIO FIFO, özel 2 KiB varsayılan core 1 stack. Üretici ROM yerine Wirevo launch servisi, deterministik zamanlayıcı; fiziksel cycle/race eşdeğerliği iddia edilmez. Kaynak debugger core 0 içindir; duraklatma iki çekirdeği durdurur.
- W/WH: sanal AP varsayılan WirevoLab / wirevo1234. UDP echo 192.168.4.1:7; yalnız sanal endpoint, Internet yok. wirevo/net.h ile UDP / BLE UART, sınırlı pico/cyw43_arch.h yardımcıları. BLE için firmware advertise yapar, Pico bağlantıları penceresinden PC bağlanır. Bu gerçek CYW43 firmware/RF, lwIP veya BTstack değildir.
- Hazır örnekler: Projeler menüsündeki USB CDC, Çift çekirdek + PIO/DMA, W Sanal AP / UDP / BLE.

## v0.84 USB cihaz sınıfları ve CYW43 kaynak arayüzü

- tusb.h + wirevo_usb_set_mode ile HID keyboard/mouse, MSC veya uygulama DFU profili seçilir. Tüm veri native C kodunun USB DPRAM ve endpoint akışından geçer. Tam TinyUSB değildir.
- HID: ID=0, sabit klavye/fare descriptor profilleri. MSC: tek LUN, 512 bayt sektör, 32 sektör/komut; kullanıcı C read/write callback'leri. DFU: 256 bayt kontrol aktarımı, download/upload/status/manifest callback'leri; RAM staging örneği BOOTSEL veya gerçek flash update değildir.
- Pico bağlantıları menüsünde sanal host komutları ve sonuçları; Projeler menüsünde dört yeni örnek vardır. Gerçek OS klavyesi veya diski bağlanmaz.
- CYW43 helper'ları sanal AP bağlantı/error/link/MAC/RSSI/leave akışına bağlanır. Özgün sürücü firmware'i, SPI/backplane/RF, lwIP ve BTstack yürütülmez. Opaque cyw43_t binary driver ABI uyumluluğu iddia etmez.

## v0.85 işlevsel Flash / BOOTSEL

C: hardware/flash.h ve pico/bootrom.h. 4096 bayt erase, 256 bayt program, 1→0 kuralı ve oturum içi reset kalıcılığı. Pico bağlantıları panelinde firmware UF2 indir / BOOTSEL / UF2 dosyası seç akışı bulunur. UF2 doğru aile, 256 bayt sayfa ve 0x10000000 doğrudan vektör tablosu gerektirir. Özgün ROM/boot2/picobin/partition/güvenli açılış yürütülmez. Bu dosyalar simülasyon içindir; fiziksel kart uyumluluğu vaat edilmez. Sadece güncellenen sektörler silinir. Kullanıcı flash verisi yeniden derleme, proje/sayfa yükleme boyunca saklanmaz; JSON içe alınan firmware’i içerir. Fiziksel flash zamanlaması, XIP stall ve flash-safe multicore kilidi modellenmez.

## Henüz desteklenmeyenler

Bu **tam Pico SDK veya tam silikon emülatörü değildir**. C17 ve iki ARM çekirdeği kullanılır. Özgün BOOTSEL-ROM açılışı, gerçek CYW43 firmware/RF/Internet/lwIP/BTstack, genel USB host/composite sınıfları, TrustZone/güvenli açılış, RP2350 Hazard3 seçimi, MicroPython, genel IRQ SDK'sı ve dahili sıcaklık/VSYS ADC devre adaptörü sunulmaz. Desteklenmeyen başlıklar derleme hatası verir. Flash firmware'i doğrudan reset vektöründen başlatılır; gerçek karta aktarılabilir UF2 çıktısı değildir.

Motor rp2350js 2.0.1 (MIT); RP2040 ve RP2350 için ayrı yerel ARM yürütüm yolları kullanılır. Üretici ROM görüntüsü dağıtılmaz; model kendi sınırlı firmware'ini reset vektöründen başlatır. Döngü/zaman doğruluğu fiziksel silikonla eşdeğer kabul edilmemelidir.

Kaynaklar:
- https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html
- https://www.raspberrypi.com/documentation/pico-sdk/hardware.html
- https://github.com/c1570/rp2350js
- https://dwarfstd.org/doc/DWARF4.pdf

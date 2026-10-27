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

## v0.86 özgün ROM inceleme

Pico, H, W ve WH için yerel RP2040 B1 ROM .bin dosyası seçilerek özgün kod salt okunur, izole oturumda yürütülür. USB aygıt bilgisi, disk kapasitesi ve RPI-RP2 sektörleri doğrudan ROM kodundan okunur. ROM baytları siteyle dağıtılmaz. Boyut/CRC yalnız desteklenen B1 revizyonunu tanımlar. Proje devresi ve flash belleği bu oturuma bağlı değildir; özgün ROM ile flash yazma ve RP2350 güvenlik geçişi desteklenmez. CYW43 firmware/radyo modeli eklenmemiştir. Bu tam Pico desteği değildir.

## v0.87 özgün ROM USB açılışı ve flash

Sekiz kartta doğru yerel ROM (RP2040 B1 / RP2350 A2) seçilerek özgün kod çalıştırılır. RP2350 NSBOOT için BXNS/SG ve APSR_nzcvqg eklendi; tam TrustZone güvenlik yalıtımı değildir. Her iki ailenin XIP SRAM, USB abort/tampon sıfırlama ve SSI/QMI NOR aktarımı modellendi. UF2 seçildikten sonra flash baytları doğrulanır ve flash binary indirilebilir. ROM görüntüsü dağıtılmaz. İzole oturum proje devresinden bağımsızdır; pencere kapanmadan flash’ı indirin. Oturum başına tek UF2; sonraki oturum için ROM dosyasını yeniden seçin. Genel uygulama boot/picobin/partition/OTP/imzalı güvenli açılış ve tüm SDK uyumluluğu iddia edilmez. CYW43 firmware/radyo modeli hâlâ yoktur. Önceki sürümlerdeki salt okunur ROM/RP2350 kapalı açıklamaları tarihsel sürüm kapsamıdır.

## v0.88 CYW43439 donanım hattı (ROM olmadan)

W/WH modellerinde GP23 güç, GP25 CS, GP29 saat, GP24 ortak veri/IRQ hattına bağlı gSPI/backplane alt kümesi vardır. C kodu test kaydını, 16-bit başlangıç/32-bit aktarım düzenini, yanıt gecikmesini, kesme maskesi/W1C ve durum sözcüğünü kullanabilir. Backplane penceresinden 512 KiB RAM yazılıp okunabilir. Güç kapatıldığında çip RAM/kayıtları, LED ve sanal ağ bağlantısı sıfırlanır. LED/SMPS GPIO durumu SDK ile ortaktır; VBUS USB beslemesi olarak yüksek okunur. Pico bağlantıları panelinde canlı çip durumu ve indirilebilir C örneği vardır.

Bu çip işlemcisinin veya firmware/radyonun yürütülmesi değildir. ROM ve bilinmeyen backplane adresleri hata üretir. F2 FIFO en fazla sekiz gönderiyi bekletir; firmware tüketicisi/SDPCM yanıtı yoktur ve F2/F3 hazır gösterilmez. Desteklenen hat profili saat boşta düşük, yükselen kenarda örnekleme, baytta MSB-first, sürücünün başlangıç word-swap ve 32-bit düzenidir; tüm SPI biçimleri/zamanlama ve özgün Pico SDK sürücüsü uyumluluğu doğrulanmamıştır. GPIO1 yalnız besleme-modu durumunu tutar; analog güç regülatörü modellenmez. Önceki “SPI/backplane yok” açıklamaları tarihsel sürüm kapsamıdır. Özgün ROM, çip işlemcisi, MAC/PHY/radyo, OTP ve diğer backplane çevrebirimleri tamamlanmış sayılmaz.

## v0.89 ROM gerektirmeyen donanım ve SDK tamamlamaları

Sekiz ARM profilde hardware/irq.h exclusive handler, NVIC enable/pending/clear/priority, hardware/sync.h PRIMASK ve iki çekirdekte ayrı RAM vektörleri eklendi. GPIO callback/maske/force kayıtları çekirdek başına ayrıdır. RP2350 GPIO adres çözümlemesi/IRQ öncelik adresleri ve RP2040 tek seferlik yazılım kesmesi düzeltildi. DMA ring, byte swap, IRQ quiet/routing/status/ack ve abort yardımcıları vardır. RP2350 BSWAP kaybı motor seviyesinde giderildi.

ADC FIFO/run/round-robin/divider/IRQ yardımcıları eklendi; FIFO boşalınca IRQ temizlenir, START_ONCE kendini temizler ve kanal seçimi ilerler. Pico bağlantıları panelinde sıcaklık, VSYS ve USB VBUS girdileri proje ayarlarına kaydedilir. Sıcaklık sensörü etkinleştirilmelidir. W/WH'de CS seçiliyken VSYS ölçümü ADC hatası verir. Girdiler deterministiktir; analog/termal güç simülasyonu değildir.

CYW43 backplane üzerinden SDIO/ARM/SRAM IOCTRL/RESETCTRL ve banka göre ayrı SRAM PDA kontrol kayıtları okunup yazılabilir. ARM çekirdeği veya firmware başlatılmaz; F2 hazır/başarılı WLAN cevabı uydurulmaz. Tam SRAM banka geometrisi ve OTP bilinmeyen kayıtlar olarak kalır. Önceki IRQ/ADC/VBUS ve bütün backplane kayıtlarının yokluğuna ilişkin notlar tarihsel sürüm kapsamıdır. Güncel destek sınırları ve sürüm açıklaması: [v0.89](https://github.com/furkanyrtsvr/wirevo/blob/main/docs/RELEASE_0.89.md) (GitHub kaynak dağıtımı).

## Henüz desteklenmeyenler

Bu **tam Pico SDK veya tam silikon emülatörü değildir**. C17 ve iki ARM çekirdeği kullanılır. ROM profilinin dışındaki genel uygulama açılışı, gerçek CYW43 firmware/RF/Internet/lwIP/BTstack, genel USB host/composite sınıfları, TrustZone/güvenli açılış, RP2350 Hazard3 seçimi, MicroPython ve IRQ paylaşımlı handler zincirleri sunulmaz. Desteklenmeyen başlıklar derleme hatası verir. Proje uygulama motoru doğrudan reset vektöründen başlar; özgün ROM oturumu ayrı çalışır. Proje UF2 çıktısı için fiziksel kart uyumluluğu vaat edilmez.

Motor rp2350js 2.0.1 (MIT); RP2040 ve RP2350 için ayrı yerel ARM yürütüm yolları kullanılır. Üretici ROM görüntüsü dağıtılmaz; model kendi sınırlı firmware'ini reset vektöründen başlatır. Döngü/zaman doğruluğu fiziksel silikonla eşdeğer kabul edilmemelidir.

Kaynaklar:
- https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html
- https://www.raspberrypi.com/documentation/pico-sdk/hardware.html
- https://github.com/c1570/rp2350js
- https://dwarfstd.org/doc/DWARF4.pdf

## v0.90 — ROM-free language profiles

All eight boards: genuine MicroPython WASM with a circuit-backed machine adapter (Pin, ADC, PWM, guarded mem, GPIO I2C/SPI, terminal UART, cooperative GPIO IRQ). Four W boards: onboard LED and explicitly virtual WLAN. No native RP2 firmware, hard Python IRQ, threads, sockets or real radio. Interactive Python programs should yield with `await js.cf.sleep(ms)`.

Four RP2350 boards: real RV32IMAC ELF compilation/execution, Hazard3 CSR machine IRQ, two cores and scalar core-0 debug. Direct Wirevo vector startup; no original RISC-V ROM/UF2 boot. C adds absolute time, core-0 alarms (16 slots; 32 us rearm margin; maximum delay 2^31-1 us), SIO spinlocks (claimed pool 16–30, resource guard 31), critical sections and mutexes. This is not full upstream SDK/CMake or cycle-exact silicon. Historical limitations below/above apply unless explicitly superseded here; current ledger: docs/PICO_SUPPORT.md.

## v0.91 — SDK containers and MicroPython PIO/Timer

C: queues (1024 payload bytes each), semaphores (shared spinlock 15), timed mutex entry, repeating timers on the existing core-0 alarm service. Python: cooperative Timer, ticks, IRQ masking, duty_ns and terminal UART readline; rp2.asm_pio and native StateMachine/FIFO/cooperative per-SM IRQ. PIO programs share 32 instruction slots per unit; no unload/compaction. FIFO waits stop with an error after 10000 simulated us. Eight SMs on RP2040; twelve on RP2350. Basic instruction groups, labels, delay and sideset; special PIO-v1/bank/advanced management and rp2.DMA APIs are not implemented. Python Timer accepts 1 us..10 s; overdue periodic events coalesce at the next cooperative poll. unique_id is a stable simulated board profile identity.

Full SDK/CMake, native RP2 MicroPython firmware, Python hard IRQ/_thread, real network and ROM work remain outside this profile. See docs/PICO_SUPPORT.md; historical limitations are superseded only by features explicitly added here.

## v0.92 — declaration import and Python DMA

Pico C accepts CMakeLists.txt/.cmake files and interprets a strict single-executable C target declaration subset (local C sources/libraries, include paths, definitions, simple variables and subdirectories). It does not run full CMake or upstream SDK builds; unsupported commands fail explicitly.

Python rp2.DMA executes through native chip DMA registers and DREQ, with buffer staging into SRAM 0x20004000 through RAM end minus 4096 bytes. Max 65536 bytes per buffer, retained until close; 256-byte alignment, staged rings up to 256 bytes. Completion/abort polls copy staged output back. Native addresses and PIO FIFO/register windows are supported; WASM pointers are not native chip pointers. Sniffer/DMATimer, hard Python IRQ and special RP2350 transfer modes are not implemented.

Real _thread is still unavailable in the shipped MicroPython WASM interpreter. Full SDK/CMake, native RP2 firmware and ROM-dependent work remain outside the current profile. Current ledger: docs/PICO_SUPPORT.md.

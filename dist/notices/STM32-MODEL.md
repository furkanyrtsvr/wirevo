> Güncel 0.59: [USB OTG FS](./STM32-OTG-FS.md) F401/F411 FIFO ve IRQ67; F411 varsayılan 96 MHz / USB 48 MHz. F103 PMA/bxCAN korunur.

> Güncel 0.46: [Donanım I²C1](./STM32-I2C1.md) altı kartta etkin. Aşağıdaki önceki sürümlerin I²C1 bekliyor bilgisi tarihsel kapsamdır.

> Güncel 0.45: [Donanım SPI1](./STM32-SPI1.md) altı kartta etkin. Aşağıdaki 0.44/öncesi donanım SPI bekliyor bilgisi tarihsel kapsamdır. I²C1 hâlâ plan.

# STM32 · CircuitForge 0.44

0.44: proje kapsamı bilgisi, ayrı kablo koridorları ve gerçek USART1/ADC1/TIM2. Pin/C kodu [STM32-PIN-CONFIG](./STM32-PIN-CONFIG.md), çevrebirim kapsamı [STM32-PERIPHERALS](./STM32-PERIPHERALS.md). USART1 RXNE IRQ37, ADC EOC IRQ18, TIM2 update IRQ28 gerçek ARM/NVIC akışındadır. Diğer donanım rolleri datasheet planı olarak korunur.

Dosya → Yeni proje → STM32 → kart → C17. AVR ve ESP32 ile aynı devre, breadboard, bileşen kütüphanesi, pencere düzeni, kablo hizalama, kaynak editörü, ölçüm ve JSON/ZIP alanı kullanılır. Projeler menüsünde LED, buton, UART echo, SHT31, MCP3008, breadboard içermeyen net label LED ve GPIO UART üzerinden sanal Bluetooth örnekleri bulunur. Yeni hazır devre kabloları kart gövdesinin çevresinden yönlendirilir. Ayrıntı [net label](./NET-LABELS.md) ve [Bluetooth](./BLUETOOTH-MODEL.md) belgelerinde.

| Geliştirme kartı | Gerçek CPU motoru | Saat | Flash | SRAM |
|---|---|---:|---:|---:|
| Blue Pill F103C6T6(A) | Cortex-M3 | 72 MHz | 32 KiB | 10 KiB |
| Blue Pill F103C8T6 | Cortex-M3 | 72 MHz | 64 KiB | 20 KiB |
| Blue Pill F103CBT6 | Cortex-M3 | 72 MHz | 128 KiB | 20 KiB |
| NUCLEO-F103RB, MB1136 C04 | Cortex-M3 | 72 MHz | 128 KiB | 20 KiB |
| NUCLEO-F401RE, MB1136 C04 | Cortex-M4F | 84 MHz | 512 KiB | 96 KiB |
| NUCLEO-F411RE, MB1136 C04 | Cortex-M4F | 96 MHz (USB uyumlu; çip azami 100 MHz) | 512 KiB | 128 KiB |

Clang 22, ARM ELF ve gerçek Zmu instruction decoder/executor kullanılır. Kaynak regex'iyle sonuç üretme veya ESP/AVR CPU'suna kart adı eşleme yoktur. Ayrı M3 ve M4F WASM görüntüleri SHA-256 ile doğrulanır. Motor commit'i, binary hash'leri ve kaynak konumu `../stm32/provenance.json`; Apache-2.0 ve bağımlılık bildirimleri [STM32-LICENSES.txt](./STM32-LICENSES.txt).

## Derleme ve çalışma

İlk sürüm C17 freestanding `main.c` ve ayrı `.c/.h` dosyalarını destekler. `cf_hal.h` ile PA0/PB7/PC13 gibi pin adları, GPIO input/output/pull-up/open-drain, gecikme, millis ve UART terminali. `stdio.h` küçük integer printf/puts sağlar; tam libc/ST HAL/CMSIS/Arduino core değildir. `cf_bus.c/h` kullanıcı tarafından düzenlenebilir, ayrı translation unit olarak derlenir.

Startup gerçek vektör tablosu, data kopyalama ve bss temizleme içerir. F103 için HSE/PLL 72 MHz ve JTAG kapatılıp SWD korunur. F401/F411 için PLL ve Flash latency ayrı ayarlanır. F103 CRL/CRH/IDR/ODR/BSRR/BRR; F4 MODER/OTYPER/PUPDR/IDR/ODR/BSRR ve RCC saat kapıları modele bağlanır. DWT counter ve gerçek SysTick exception/return; M4F single-precision VFP kabulü vardır. Bellek dışı erişim durdurulur. Linker gerçek Flash/SRAM sınırını ve en az 1 KiB stack rezervini denetler; dinamik stack tüketiminin statik garantisi değildir.

USART1 fiziksel 8N1/baud/TDR/RDR ve hata/kesme modeli eklendi. Nucleo USART2 VCP byte terminali korunur; fiziksel USART1 Blue Pill terminaliyle aynı birimi paylaşır. ADC1 tek regular 12-bit yazılım dönüşümü ve TIM2 PWM1 çalışır. Diğer ADC/timer modları, donanım I²C/SPI, DMA/USB/CAN/RTC/Flash programlama ve tam vendor SDK tamamlanmış değildir. İşlemci çevrimleri motorun zaman modelidir; tam Flash wait-state/cache/analog PLL zamanlaması iddiası yoktur. Ayrıntılı API, frekans, pin ve register sınırları STM32-PERIPHERALS.md içinde.

SHT31 ve MCP3008 yazılım I²C/SPI üzerinden fiziksel GPIO kenarları, besleme ve devre gerilimleriyle çalışır. SHT31 PB7/PB6; MCP3008 PA5/PA6/PA7 ve PA4 CS. MCP3008 haricî ADC'dir. Önceki modelin sensör/DC kuralları kullanılır. MicroPython ve Arduino C++ STM32 için henüz seçime sunulmaz; kendi runtime/toolchain kabulü sonrası eklenir.

## Kart ve elektriksel profil

Blue Pill, ST'nin ürettiği tek revizyonlu PCB değildir. Yaygın iki sıra 20 pin başlığın sırası kullanılır; çizim temsili, mekanik CAD değildir. PC14/PC15 kristal; PA15/PB3/PB4 bu ilk profilde debug için ayrılmıştır. PC13 LED aktif LOW. C6'nın SRAM'i 10 KiB'dir; A internal code eki bunu değiştirmez.

Nucleo MB1136 C04: Morpho CN7/CN10 ve Arduino başlıkları aynı MCU netlerine bağlanır. A4/A5 varsayılan PC1/PC0'dır. SB13/14 ON, SB62/63 OFF: PA2/PA3 ve D0/D1 header bağlantıları kapalı; VCP UART terminalde temsil edilir. SWD/SWO ve kristal pad'leri ayrılmıştır. F103 PD0/PD1, F401/F411 PH0/PH1 farkı korunur; F4 CN10-18 NC'dir. B1 PC13 aktif LOW ve kart özelliklerinde Bas/Bırak kontrolü bulunur.

Kart üstü LED aktif LOW/HIGH polaritesiyle devreye dâhildir. LED 2 V, seri direnç 1 kΩ; B1 10 kΩ pull-up ile sınırlı DC modelidir, üretici BOM değerlerinin birebir SPICE modeli değildir. PC13–PC15 için 3 mA çıkış koruması vardır. GPIO için muhafazakâr 3.3 V devre sınırı uygulanır; bazı silikon pinlerinin 5 V toleransı bu aşamada açılmamıştır. Kart güç rayları diğer mevcut kartlarla aynı sabit besleme modelini kullanır; USB güç yönetimi/regülatör dinamiği yoktur. MCU sıfırlama haricî EEPROM verisini ve kabul edilmiş sürmekte olan yazmayı korur; yeni oturum/Stop/JSON kalıcı EEPROM dökümü değildir.

## Doğrulama kaynakları

- [ST F103C6, DocID15060 Rev7](https://www.st.com/resource/en/datasheet/stm32f103c6.pdf), bellek Table2 ve internal code Table58.
- [ST F103C8/CB/RB, DS5319 Rev20](https://www.st.com/resource/en/datasheet/stm32f103c8.pdf).
- [ST F401RE, DS10086 Rev5](https://www.st.com/resource/en/datasheet/stm32f401re.pdf) ve [F411RE, DS10314 Rev8](https://www.st.com/resource/en/datasheet/stm32f411re.pdf).
- [ST Nucleo UM1724 Rev17](https://www.st.com/resource/en/user_manual/um1724-stm32-nucleo64-boards-mb1136-stmicroelectronics.pdf), Table10/27/29; [MB1136 C04 şema](https://www.st.com/resource/en/schematic_pack/mb1136-default-c04_schematic.pdf).
- [ST Blue Pill variant](https://raw.githubusercontent.com/stm32duino/Arduino_Core_STM32/main/variants/STM32F1xx/F103C8T_F103CB%28T-U%29/variant_PILL_F103Cx.h) ve [STM32-base kart başlık kaydı](https://raw.githubusercontent.com/STM32-base/STM32-base.github.io/master/_data/boards/STM32F103C8T6-Blue-Pill.json).

Tüm STM32 geliştirme kartları bu sürümde tamamlanmış değildir. Bu altı kart ilk kabul edilmiş gruptur; diğer Nucleo/Discovery/WeAct aileleri bağımsız CPU, bellek, pinout ve çevre register kabulüyle devam planında genişletilir.

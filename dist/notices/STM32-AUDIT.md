# STM32 fiziksel-silikon denetimi · aktif

18 Ekim 2026. Gerçek C17/C++17 firmware, elektriksel hat ve register/IRQ kabulü. 0.63 ile yazılan “tamamlandı/donduruldu” iddiası geri çekildi. Aşağıdaki kalan maddeler yeniden gerçek geliştirme borcudur. Kartta bulunmayan bloklar ile yalnız laboratuvar ölçümüyle doğrulanabilen analog etkiler ayrıca belirtilir; bunlar yazılım davranışıyla karıştırılmaz.

## 0.67 — güncel uygulama ve kanıt

F401/F411 işlevsel AN3156 USB DFU; dokuz kartta binary AN3155 USART boot, silme/koruma varyantları; panelden .bin yazma ve USB geri okuma; F103 PMA double-buffer/ISO, USB PID/ACK/CRC/global NAK, I²C10-bit master ve SMBus adres/ALERT/DNF davranışı eklendi. CAN CRC/stuffing süresi, native Flash/DMA/DWT/SysTick ve temel exception gecikmeleri düzeltildi. Yeni kabul yalnız `tests/stm32-v067-*.test.mjs`; native/reg/worker kanıtı ve kalanlar `docs/RELEASE_0.67.md` içinde ayrıdır.

Önceki listedeki **F1/F4 smartcard otomatik retry donanımı beklentisi yanlıştı** (AN4800): tekrar gönderim firmware işidir. Benzer biçimde ARP komut/adres-atama yığını firmware’dir; donanım adres tanıma/PEC/ALERT yolları modelde ayrı uygulanır. F103 low/medium density fabrika ROM’unda DFU yoktur.

Kapanmayan yazılım davranışları: orijinal ROM yürütümü; tüm core fault/priority/pipeline, tail-chaining/late-arrival/FPU stacking ve bus-matrix çevrimleri; I²S full-duplex extension/tüm stereo, advanced-timer COM/preload/lock, bütün USB/CAN hata-zamanlama kombinasyonları. Analog güç/PHY/transceiver ölçümü yoktur. Bu kayıt “STM32 tamamen bitti” değildir; başka kartlara geçiş açılmaz. Alt 0.66/0.65/0.64 kayıtları tarihsel başlangıç durumudur, güncel eksik listesi yerine okunmaz.

## 0.66 — yeni uygulama ve kanıt (tarihsel)

64-bit Flash programlama/BSY, PCROP execute-only ve native RDP SRAM-okuma kapısı; ITR zinciri, TIM1 break/AOE/idle/repetition; SPI RXONLY/tek hat/TI; USART half-duplex/IrDA/CK/smartcard clock-guard-NACK; I²S2/3 MCLK/right-justified; PEC, nominal HSE/PLL/backup hazır gecikmeleri ve RTC tamper filtre eklendi.

OTG_FS sekiz host kanalı, port/bağlantı, multi-packet/ISO ve sanal USB vendor aygıtı; F103 sanal çok-düğümlü CAN arbitration/ACK/filtre/bus-off; SDIO SDSC/MMC byte adresleme ve MMC stream eklendi. F401/F411 OTG_FS dahili DMA içermez; bu kalem model eksiği değil silikon yokluğudur.

Güncel kanıt yalnız `tests/stm32-v066-*.test.mjs` dosyalarıdır; önceki 0.65 testleri çalıştırılmadı. Native ARM kanıtı ve doğrudan model kanıtı RELEASE_0.66.md içinde ayrıdır. Alt kayıtlar tarihsel olup yeni eklenen maddeleri halen açık gösteren ifadeler 0.66 için geçerli değildir.

Kapanmamış doğrulama: ST ROM binary/USB DFU; tüm core fault/priority/pipeline ve bus arbitration çevrim doğruluğu; tam SMBus ARP/host-notify, smartcard retry, tüm stereo/advanced-timer/USB hata-PID varyantları; F103 PMA ISO/double-buffer ve fiziksel PHY/transceiver/analog karşılaştırma. Tam fiziksel silikon bitti iddiası yoktur. Yeni aileye geçilmez.

## 0.65 uygulama durumu (tarihsel)

Option-byte WRP/RDP/reload, fiziksel BOOT/NRST, SRAM boot ve işlevsel AN3155 USART komutları; dinamik HSI/HSE/PLL/AHB/APB, CSS/NMI, PVD/BOR ve STOP/STANDBY eklendi. Bunlar orijinal ST ROM kodunun çalıştırılması veya analog güç modeli değildir.

F4 MPU/bit-band/fault handler, GPIO LCKR, mevcut ek timer/SPI/I²C/USART instance’ları, slave/NSS/MODF/CRC, temel I²S, F4 FIFO/DBM ve ek DMA istekleri, RTC timestamp/tamper/calibration/shift/DST/PC13 eklendi. Ayrıntılı sürüm kaydı: docs/RELEASE_0.65.md. Aşağıdaki 0.64 satırları tarihsel başlangıçtır; güncel kapsam arayüzündeki satırlar ve bu üst kayıt önceliklidir.

Açık ve doğrulanmamış ayrıntılar: tüm silicon fault/priority/pipeline; Flash 64-bit PSIZE/busy/PCROP ve RDP’nin tüm firmware erişim yolları; tam ROM/DFU; osilatör geçiş gecikmeleri/analog akım; timer ITR/break/advanced-control; SPI RXONLY/bidirectional/TI ve I²S MCLK/tüm standart ayrıntıları; tam SMBus/PEC; USART smartcard/IrDA/half-duplex/synchronous; bus contention/burst arbitration; OTG host/iso/DMA, haricî CAN, SDIO stream ve fiziksel cihaz karşılaştırması. Bunlar gizlenmez ve STM32 tamamen bitti denmez.

## 0.64 başlangıç kaydı (tarihsel)

## 0.63 kapanış kabulü

F103 ADC2 haricî kanal/sıra/injected/discontinuous/watchdog/tetik ve ortak IRQ18 yoluyla; Nucleo F401/F411 SDIO ise SDHC tanıma, tek/çok blok FIFO ve IRQ49 yoluyla eklendi. ADC2 DMA’nın fiziksel olarak bulunmaması ve WeAct paketinde tam SDIO pin grubunun bulunmaması açık negatif kapıdır. Native bridge0.11, firmware fingerprint `cf-stm32-0.19`.

## CPU / exception / FPU · Kısmi

Çalışan model: Gerçek Cortex-M3/M4F komut motoru, NVIC, SysTick, WFI/WFE/SEV ve M4F aritmetiği.

Kalan ayrıntılar: MPU, cache, cycle-accurate pipeline/bus, tüm fault/priority ayrıntıları.

## Flash / SRAM / reset · İlerliyor

Çalışan model: Kartın kendi bellek sınırı, reset vektörü, data/bss ve firmware hedef kontrolü. F1 anahtar/kilit, 1 KiB sayfa erase ve halfword programlama; F4 anahtar/kilit, sektör/mass erase, PSIZE program genişliği; yalnız 1→0 bit geçişi, EOP/program-alignment hataları, silinmiş 0xFF alan, resetten kalıcı Flash içeriği, 96-bit UID ve doğru Flash yoğunluk imzası. Dokuz kartta gerçek ARM firmware kabulü vardır.

Kalan ayrıntılar: Option-byte write protection/read protection/reload ayrıntıları, ROM bootloader ve fiziksel NRST/BOOT devresi.

## RCC / saat / güç · Kısmi

Çalışan model: Kart HSE/PLL/APB başlangıcı, çevrebirim enable/reset; RTC clock kaynakları ve PWR DBP/VOS/ready, F4 PLL öncesi doğru VOS seçimi.

Kalan ayrıntılar: Dinamik tüm saat ağacı, clock failure/CSS, PVD/BOR, STOP/STANDBY ve güç tüketimi.

## GPIO / EXTI / debug · Kısmi

Çalışan model: GPIO/pull/open-drain, gerçek DC hatları; EXTI0..15 port mux, edge, mask, PR W1C, SWIER, IRQ ve WFE event.

Kalan ayrıntılar: Dahili EXTI hatları, tüm AF/remap tablosu, I/O slew/damage; SWD/JTAG/ITM/trace donanımı.

## USART1 / USART2 · Kısmi

Çalışan model: USART1/2 DMA istekleri; USART1 ve uygun Blue Pill/WeAct USART2 fiziksel 7E/O,8N/E/O,9N,0.5/1/1.5/2stop / PE-RXNE-TXE-TC-ORE-FE / IRQ; kart terminali; F401/F411 OVER8/OVER16 ve baud korunan geçiş.

Kalan ayrıntılar: CTS/RTS/LIN/smartcard/synchronous; Nucleo fiziksel VCP ve USART2 alternatif başlık/remap.

## ADC1 / diğer ADC / DAC · Kısmi

Çalışan model: ADC1 regular/continuous, 12/10/8/6bit, EOC/OVR/IRQ; injected/offset/JAUTO, regular/injected discontinuous, analog watchdog, EXTI11/TIM2 regular ve EXTI15/TIM2_CC1 injected trigger ve gerçek DMA SRAM; nominal sıcaklık/VREFINT ve F4 VBAT/4.

Kalan ayrıntılar: Diğer injected dış tetikler, sample-hold/noise/kalibrasyon, diğer ADC/DAC.

## TIM2 / diğer timer · Kısmi

Çalışan model: PWM1/2 ve output compare, match/update IRQ, UDIS/URS/one-pulse; direct/indirect input capture; encoder TI1/TI2/PSC/DIR ve fiziksel netler; CEN/RCC/CNT/UG prescaler fazı; DIR aşağı sayım, CMS1/2/3 merkez hizalı PWM ve compare/update IRQ.

Kalan ayrıntılar: Digital filter/TRC/remap/external clock/dead-time, encoder trigger/index ve dynamic APB saat alt fazı, diğer TIM/LPTIM/HRTIM.

## SPI1 / SPI2+ / I²S / SAI · Kısmi

Çalışan model: SPI1 mode0..3,8/16-bit,MSB/LSB master, software NSS/GPIO CS veya PA4 hardware NSS/SSOE, gerçek hat/IRQ/OVR ve DMA RX/TX.

Kalan ayrıntılar: NSS input/multimaster/slave/CRC/remap/receive-only, SPI2+, I²S/SAI.

## I²C1 / I²C2+ · Kısmi

Çalışan model: Standard/fast 400 kHz 7-bit master ve native DMA TX/RX, ACK/POS/BTF/STOP, birleşik repeated-start okuma, EEPROM/ACK polling, fiziksel OD/clock wait/IRQ/recovery.

Kalan ayrıntılar: Slave/multi-master/arbitration, PEC/SMBus, analog rise-time, I²C2+.

## DMA / bus arbitration · Kısmi

Çalışan model: F1 DMA1 kanal/F4 DMA1+2 stream, native ARM bus read/write, normal/circular, width/increment/priority, HT/TC/TE IRQ; ADC1/SPI1/USART1+2 requests.

Kalan ayrıntılar: FIFO/burst/double-buffer/PFLOW, bus contention ve diğer çevrebirim istekleri.

## RTC / backup / watchdog · Kısmi

Çalışan model: F103 counter/F4 BCD calendar RTC, alarm/wakeup/IRQ, F4 alt-saniye alarmı, shadow/INIT/WPR, LSE/LSI/HSE, DBP/VOS, resetten korunan backup; IWDG/WWDG gerçek reset/RCC nedeni.

Kalan ayrıntılar: RTC tamper/timestamp/calibration/shift/AF output, backup regulator; tolerans/debug/STOP/STANDBY ayrıntıları.

## CRC / RNG / crypto · Kısmi

Çalışan model: 32-bit CRC word register, 0x04c11db7 polinom, IDR/reset ve RCC kapısı; bağımsız CRC referansı ile dokuz kartta kabul.

Kalan ayrıntılar: RNG/crypto için MCU varlığı ve aileye özgü modeller; byte/halfword CRC feed desteklenmez.

## USB / CAN / Ethernet / SDIO · Kapanmış profil / ürün sınırı

Çalışan model 0.58: F103 USB FS PMA/EP0/tek tampon bulk, gerçek native ISR ve sanal host; bxCAN dahili loopback,3TX,14 filtre,2FIFO ve IRQ19–22. USB/CAN ortak SRAM nedeniyle birlikte kullanılamaz.

0.59: F401/F411 OTG FS device register/FIFO/IRQ67 ve gerçek 48 MHz saat ile EP0/bulk echo kabulü eklendi. F411 varsayılan 96 MHz. [Ayrıntı](./STM32-OTG-FS.md).

0.63: Tam PC8–PC12 + PD2 grubunu dışarı çıkaran Nucleo F401RE/F411RE'de SDIO/SDHC blok veri ve IRQ49 eklendi. OTG host/iso/DMA, fiziksel PC USB/class sürücüsü, haricî CAN ağı/transceiver ve Ethernet kapanmış Wirevo uygulama profilinin ürün sınırıdır; açık geliştirme listesi değildir. [Kabul ve sınırlar](./STM32-USB-CAN.md).

## FMC / QSPI / DCMI / LCD / touch · Bu çiplerde yok

Çalışan model: Opsiyonel Black Pill SPI flash footprint boş gösterilir.

Kalan ayrıntılar: Dokuz mevcut MCU içinde FMC/QSPI/DCMI/LTDC yoktur; eksik uygulama işi sayılmaz. Haricî SPI bileşenleri bağımsızdır.

## Dahili analog / sensörler · Kısmi

Çalışan model: Haricî sensörler/DC; ADC1 nominal dahili sıcaklık/VREFINT ve F4 VBAT/4; projeye özel giriş değerleri.

Kalan ayrıntılar: Bu çiplerde dahili comparator/opamp yoktur. Analog güç/kalibrasyon ayrıntıları ayrıca modellenmez.

## C17 / C++ / MicroPython · Kısmi

Çalışan model: Gerçek Clang C17/C++17, çok dosya/linker/board bounds; constructor/init-array, SRAM heap/new/delete ve C IRQ bağlantısı; MicroPython WASM Pin/ADC/SoftI2C/SoftSPI devre modu.

Kalan ayrıntılar: Tam STL, exceptions/RTTI, thread/IRQ heap reentrancy, yerel ARM MicroPython portu ve tam Cube/vendor HAL.

## Kart / şema / doğrulama · Kısmi

Çalışan model: Blue Pill, Nucleo ve WeAct kendi header/bellek/LED/KEY profilleri; örnek devre ve net label.

Kalan ayrıntılar: Tüm STM32 aileleri/kart revizyonları, M0/M7/M33, fiziksel cihaz karşılaştırması.

0.55 genel kabul: 1246/1246; C++ ayrıntıları STM32-CPP17.md. Sonraki sıra docs/STM32_PLAN_0.55.md.

0.56: TIM2 down/CMS1-3 28 yeni test, 12 gerçek ARM IRQ kabulü; örnek güç etiketleri ve dik açılı auto route. Detay docs/STM32_TIMER_ALIGNMENT_0.56.md ve AUTO-ROUTE.md.

Son genel kabul 0.56: 1279/1279; hata/iptal/atlanan 0. Devam: STM32_PLAN_0.56.md.

Son 0.57 kabulü:1303/1303. MicroPython WASM elektriksel devre modu eklendi; yerel ARM firmware portu halen açık. ADC regular/injected discontinuous ve EXTI15 injected native IRQ kabulü. Devam STM32_PLAN_0.57.md.

0.58: F103USB/bxCAN/worker19/19; genel1322ilk1317geçti,5kart-katalog varsayımı düzeltildi ve ilgili14/14 tekrar geçti. USB/CAN fiziksel dış ağ veya F4OTG kapsamı değildir. Devam STM32_PLAN_0.58.md.

0.59: F401/F411 OTG FS device/FIFO/IRQ67, beş F4 native USB ve F41196 MHz/USB48 MHz. Genel1331/1331 geçti; ek FIFO2/2 ve son HCLK/USB10/10. İleri silikon sınırları korunur. Devam docs/STM32_PLAN_0.59.md.

## 0.61 destek profili

Yeni özellikler ve sınırlar: [STM32 destek profili](STM32-SUPPORT-PROFILE.md). Dahili ADC fabrika kalibrasyonu/termal model değildir. OVER8 yalnız F401/F411; PA4 NSS yalnız master çıkışı. Kalan ileri silikon özellikleri tamamlandı sayılmaz.

## 0.62 doğrulanan eklemeler

I²C1 400 kHz / 2:1 ve16:9 duty, F1 DMA1 kanal6TX/7RX; F4 DMA1 CHSEL1 stream6/7TX ve0/5RX; native SRAM bus, LAST/NACK, HT/TC IRQ. Bloklayan SDK cf_i2c1_write_dma/read_dma kullanılabilir. Yardımcılar F1 kanal6/7 veya F4 stream6/0'ı özel kullanır; etkin bir kanalı devralmaz. Öne çıkan çevre istasyonunda SHT31 ve OLED 400 kHz DMA kullanır; EEPROM birleşik okuma/ACK polling korunur.

F4 SPI1 SCK PA5/PB3, MISO PA6/PB4, MOSI PA7/PB5 seçimi. cf_spi1_pins() ve pin penceresi gerçek AF üretir; ayrılmış Nucleo SWO PB3 kapalı kalır. USART1/2 0.5/1.5 stop ve gerçek bit süreleri; cf_usart1_stopbits()/cf_usart2_stopbits() argümanı yarım bit adedidir (1/2/3/4). F4 RTC ALRMASSR/ALRMBSSR MASKSS/SS karşılaştırması ve gerçek IRQ41/EXTI17.

Tarihsel 0.62 durumu: seçili MCU'da bulunmayan CAN/DAC/RNG/QSPI gibi donanımlar ile o sürümde modellenmemiş ADC2/SDIO ayrı gösterildi. ADC2 ve kartta erişilebilir SDIO 0.63 ile kapatıldı. Bütün silikon, tüm kart ailesi ve bütün HAL/işletim sistemi desteği kapanmış Wirevo uygulama profilinin dışındadır.

Kaynak: [RM0368](https://www.st.com/resource/en/reference_manual/dm00096844.pdf), [RM0008](https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [F401](https://www.st.com/resource/en/datasheet/stm32f401cc.pdf), [F411](https://www.st.com/resource/en/datasheet/stm32f411ce.pdf), [AN5852 — RNG yokluğu](https://www.st.com/resource/en/application_note/an5852-migrating-from-stm32f401-stm32f410-and-stm32f411-to-stm32h503-mcus-stmicroelectronics.pdf).

Canlı düzenleme düzeltmesi: STM32 SHT31 sıcaklık/nem veya pot değeri değiştiğinde, bağlantılar ve diğer parametreler aynıysa aktif I²C/SPI/BT durumu korunur. Buton/anahtar iletimi, kablo veya devre yapısı değişince net kimlikleri değişebileceği için tam yeniden kurulum yapılır. USART OVER8 baud telemetrisi BRR mantissa/fraction ve gerçek APB bölücüsünü kullanır.

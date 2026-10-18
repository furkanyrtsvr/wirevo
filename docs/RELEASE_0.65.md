# Wirevo 0.65 — STM32 reset, saat/güç ve çevrebirim genişlemesi

Dokuz mevcut kart profili: F103C6/C8/CB/RB, F401RE/CC/CE, F411RE/CE. Her kart yalnız kendi çipinde bulunan birimleri oluşturur; paketinde erişilemeyen pinler açılmaz. Yeni kart ailesine geçilmedi.

## Eklenen davranışlar

- F1 complementary option bytes ve F4 option keys/OPTSTRT; reset-latched WRP/RDP, unprotect erase, F4 kalıcı RDP2 ve donanım IWDG seçimi. WRP gerçek native Flash programlama/silmeyi engeller.
- BOOT0/BOOT1 proje jumper’ları, bağlı fiziksel BOOT/NRST, Flash/SRAM boot, SYSRESETREQ ve reset nedenleri. AN3155 işlevsel USART modeli GET/GETVER/GETID/READ/WRITE/EXT_ERASE/GO komutlarını işler; ST’nin orijinal ROM binary’si değildir.
- Dinamik HSI/HSE/PLL/AHB/APB, clock değişiminde çevrebirim zamanlaması, CSS/NMI/ready IRQ, PVD/EXTI16 ve nominal BOR. STOP’ta senkron birimler durur, RTC/LSI/IWDG devam eder; EXTI uyanması ve HSI dönüşü. STANDBY SRAM kaybı, high-Z GPIO, reset/SBF ve wake kaynakları.
- Native SRAM/peripheral bit-band; F4 sekiz bölgeli MPU/AP/XN/subregion/privilege denetimi ve kurtarılabilir MemManage handler. F103’te MPU yoktur.
- Çipte bulunan TIM1/3/4/5/9/10/11 bağımsız register/clock/reset/IRQ; TIM2 dahil filtre/TRC/remap/external-trigger modları, timer DMA ve DCR/DMAR burst register akışı, nominal TIM1 tamamlayıcı/dead-time. GPIO LCKR kilit dizisi.
- Mevcut SPI2/3/4/5, USART3/6 ve I²C2/3; pin penceresinden gerçek başlangıç C kodu. SPI slave/NSS/MODF/CRC; F4 I²S CK/WS/SD; USART CTS/RTS ve LIN break; I²C 7/10-bit slave adresleme/ACK/RX/TX/STOP, arbitration kaybı ve SMBus düşük-saat timeout.
- F4 FIFO width packing/unpacking native ARM bus üzerinden, DBM/CT/inactive buffer ve ek timer/bus/SDIO DMA istekleri. SDIO PFLOW blok boyundan istek üretir.
- RTC timestamp/overflow/tamper/backup erase, F1/F4 kalibrasyon, F4 shift/DST ve PC13 çıktı; backup reset ve WPR yeniden kilitleme.

## Yalnız yeni doğrulama

`npm run test:stm32-new` sadece bu sürümün `tests/*-new.test.mjs` dosyalarını çalıştırır. Eski STM32/genel testler kullanıcı talebiyle bu değişiklikte tekrar çalıştırılmaz. Bu nedenle eski regresyonların bu değişiklikle yeniden geçtiği iddia edilmez. Native M3/M4F WASM kaynaklarından derlendi; browser bundle ve offline cache güncellendi.

Yeni dosyalar gerçek ARM firmware ile option reload/WRP/reset, STOP/STANDBY, boot protokolü, MPU fault, timer IRQ/DMA, bit-band/LCKR, SPI master/slave/CRC, I²S stereo, USART3/6 ve I²C2/3 fiziksel hatlarını kapsar. RTC kalibrasyon/olay ayrıntıları ayrıca doğrudan register kabulüdür.

## Kesin sınırlar

Bu sürüm “STM32 silikonunun tamamı bitti” iddiası değildir. Flash busy/64-bit PSIZE/PCROP ve tüm RDP yürütme yolları; orijinal ROM/DFU; analog akım/osilatör gecikmeleri; timer ITR zinciri/break/tüm advanced-control; SPI RXONLY/bidirectional/TI; I²S MCLK/tüm standart ayrıntıları; tam SMBus/PEC; USART smartcard/IrDA/half-duplex/synchronous; cycle-accurate bus/burst arbitration; OTG host/iso/DMA, haricî CAN ve SDIO stream hâlâ modellenmemiş ayrıntılardır. Yeni modeller fiziksel cihazla karşılaştırılmadı. Bu sınırlar arayüzde ve aktif denetimde saklanmaz.

Kaynaklar: [PM0075](https://www.st.com/resource/en/programming_manual/pm0075-stm32f10xxx-flash-memory-microcontrollers-stmicroelectronics.pdf), [RM0383](https://www.st.com/resource/en/reference_manual/dm00119316.pdf), [AN3155](https://www.st.com/resource/en/application_note/cd00264342-usart-protocol-used-in-the-stm32-bootloader-stmicroelectronics.pdf).

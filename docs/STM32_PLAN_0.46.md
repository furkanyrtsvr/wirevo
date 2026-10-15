# STM32 devam planı · 0.46

Bu belge çalışma bağlamıdır; kullanıcı talebi önceliklidir. Önce QA_0.46.md ve dist/notices/STM32-I2C1.md okunur. I²C1 standard-mode7-bit master ve SPI1 mode0 bounded kapıları geçmiştir; tüm STM32 tamamlandı denmez.

1. WeAct Black Pill F401CC/F411CE kendi board pin/header/revizyon/Flash/SRAM/LED/BOOT/SWD/crystal profiliyle. Orijinal vector çizimi; ST datasheet ve üretici schematic pinout doğrulaması. Gerçek reset/compiler memory bound, USART1/ADC1/TIM2/SPI1/I²C1 ve lab/routing kabulü. Nucleo aliası ekleme; aynı CPU uygun olsa da board GPIO/header/bellek/clock/LED farklarını ayrı tut.
2. Mevcut çevrebirim doğruluk kapıları: I²C combined repeated-start API/EEPROM, Fast-mode/clock-stretch slave fixture/multi-master ve analog rise-time; APB exact freeze/resume. SPI CPOL/CPHA diğer modlar/16-bit/LSB/hardwareNSS/remap/DMA; USART parity/9-bit/stop/CTS/USART2 physical; ADC scan/continuous/overrun/sample-hold/internal; TIM2 pause/resume/capture/encoder/center-aligned. Datasheet planları yalnız genuineCPU/physicalnets kabulünden sonra aktifleşir.
3. STM32 C++17 toolchain/init-array/heap, sonra MicroPython ayrı runtime/port. ESP C/C++/MicroPython ve AVR GCC akışları korunur. Tam Cube/vendorHAL ayrı kapıdır.
4. Az sayıda kapsamlı laboratuvarı geliştirme: OLED metin, motor/fan PWM, daha fazla I²C sensor/fault/reconnect ve net label alternatifleri. Şuanda çevre station hardwareI²C1/SPI1/ADC1/TIM2, controller USART1IRQ/SPI1. Wiring middleoverlap0 ve PCB stub/net eşdeğerliği korunur.
5. F3/G4/L4 register ailesi; M0/M0+/M7/M33 yeniCPU gate. USB/CAN/RS485/Ethernet/DMA ve gerçek BLE hardware ayrı onay, fakealias yok.

Her tur test/build, aynı public Sites project exact pushed SHA/arşiv yayını, devir/checkpoint ve fullZIP/hash. Credentials/research/node_modules/target dağıtım paketine alınmaz. Windows Sites source helper packaging sonrası hata verebilir: pushedSHA'yı yeni no-archive opening ile doğrula, prepare-site-build.cjs + tar aynı source'u paketle, native save/deploy.

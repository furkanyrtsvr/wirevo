# STM32 devam planı · 0.48

Bu belge çalışma bağlamıdır; kullanıcı talebi önceliklidir. Önce QA_0.48.md ve dist/notices/STM32-AUDIT.md / STM32-I2C-EEPROM.md. Dokuz STM32, toplam29 kart. Combined write/read ve EEPROM kapısı geçti; tüm STM32 bitmiş değildir.

1. USART1 parity/diğer stop/9-bit ve USART2 fiziksel hat; SPI mode1/2/3/16-bit/LSB/NSS; ADC scan/continuous/internal/overrun; TIM2 capture/encoder/center/prescaler alt fazı. ST reference/errata ve gerçek Clang register/ISR + physical net kabulü.
2. I²C Fast-mode, slave clock-stretch fixture/multi-master arbitration, read→read/write chaining, DMA/SMBus/PEC, analog rise-time, RCC exact freeze. Yeni API yalnız write-prefix→read birleştirir. EEPROM state yalnız running runtime/MCU reset, JSON kalıcılık sonraki ürün kararı.
3. STM32 C++17 startup/init-array/runtime/heap, ardından gerçek MicroPython portu. Dil seçenekleri çalışmadan menüye eklenmez.
4. RTC/watchdog/EXTI/DMA/CRC/RNG/USB/CAN/ETH/SDIO/Flash/MPU/debug/clock/güç ve diğer17 audit başlığı açık. Her MCU tüm periferikleri içermez; datasheet paket doğrula.
5. Kullanıcı farklı kartlar da istedi. Sonraki aile RP2040/Pico için resmî pinout ve gerçek Cortex-M0+ motor; Nucleo F3/G4/L4 ayrı register ailesi. Çalışan kart kabulü için gerçek CPU/compiler/bellek/net kapıları gerekir.

Çevre istasyonu alarm transition EEPROM ve reset load, Bluetooth controller;2 kapsamlı laboratuvar/kart. Yeni kablolar dış PCB/interior overlap0 kabulü, net label/breadboard korunur. Eski kullanıcı dosyaları/projeler otomatik göç yok. Same Sites exact pushed SHA + archive/native publish/full ZIP/hash/devir; credentials/node_modules/target/research/.sites-runtime paket dışı.

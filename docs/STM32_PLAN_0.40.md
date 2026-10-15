# STM32F103C8: sonraki ana geliştirme

Güncel kullanıcı önceliği: mevcut ESP32 kabulünü kapatıp STM32'ye geçmek. Önceki Classic ESP32 ve tam SDK araştırmaları bekler.

## Geçilen derleyici kapısı

scripts/stm32/check-toolchain.mjs pinli Clang 22 WASI üzerinden gerçek ARM EM40 Cortex-M3 ve M4 nesneleri üretir. LLD, F103C8 için FLASH 0x08000000 / 64 KiB ve RAM 0x20000000 / 20 KiB ile ELF üretir. İlk SP 0x20005000, Thumb reset vektörü 0x08000009; RAM 21000 ve FLASH 70000 byte aşımı reddedilir. Rapor docs/stm32-toolchain-gate.json. Bu iki girişli başlangıç yalnız derleme/linkleme sondasıdır; tamamlanmış startup, NVIC veya CPU yürütme kanıtı değildir.

## Sıradaki kabul sırası

1. Gerçek Cortex-M3 WASM motoru seç ve CPU yürütmesini kanıtla. ARMv7-M/Thumb2, flash alias, reset vektörü, 20 KiB SRAM, data/bss startup, fault/IRQ/SysTick ve deterministik stepping. Zmu'nun varsayılan 128 KiB RAM'i F103C8'e daraltılmalıdır; WASM portu ve çevre birimleri ayrıca sınanır. QEMU'nun stm32vldiscovery makinesi F100RBT6'dır, F103C8 diye sunulmaz.
2. F103 RCC saat kapıları; GPIO CRL/CRH, ODR, BSRR/BRR, haricî IDR/pull-up/DC adaptörü. PC13 LED ve haricî LED+buton gerçek ARM firmware ile breadboard üzerinde; PC13 elektriksel sınırları datasheet'e göre uygulanır.
3. USART1 PA9/PA10 TX/RX, NVIC ve SysTick IRQ; reset/pause/step/terminate worker kabulü. Architecture dispatcher'daki ESP/AVR varsayımları STM32'yi açık seçen bir yapıya dönüştürülür.
4. Dosya → Yeni proje üzerinden STM32 kart/dil seçimi; aynı bileşen kütüphanesi, JSON/ZIP ve kablo/montaj netleri. İlk C17 freestanding kapsamı açıkça tanımlanır. C++ ve MicroPython yalnız kendi gerçek toolchain/runtime kabulünden sonra sunulur.
5. GPIO ile SHT31 ve MCP3008 fiziksel protokol örnekleri; sonra donanım I2C/SPI/ADC/timer/PWM. F401RE/F411RE Nucleo ayrı Cortex-M4 ve kart/pin/solder-bridge kabulüyle eklenir.

## Birincil kaynaklar

- [ST STM32F103C8 datasheet, DS5319](https://www.st.com/resource/en/datasheet/stm32f103c8.pdf): flash/SRAM, fiziksel pinler ve elektriksel sınırlar.
- [ST Arduino core Blue Pill varyantı](https://raw.githubusercontent.com/stm32duino/Arduino_Core_STM32/main/variants/STM32F1xx/F103C8T_F103CB%28T-U%29/variant_PILL_F103Cx.h): PC13 LED, PB6/PB7 I2C, PA5/6/7 SPI, PA9/10 USART1. Blue Pill üçüncü taraf PCB'dir; revizyon ve başlık ayrı doğrulanmalı.
- [Zmu motor kaynağı](https://github.com/jjkt/zmu): Apache-2.0, Cortex-M3 ve STM32F1 device bus; eksik çevre birimleri ve WASM kapısı bağımsızdır.
- [Unicorn.js](https://github.com/AlexAltea/unicorn.js): GPLv2 ARM WASM alternatifi; CPU tek başına STM32 SoC kabulü değildir.
- [QEMU STM32 makineleri](https://www.qemu.org/docs/master/system/arm/stm32.html): F100RBT6/F405 makine kapsamı.
- [ST Nucleo UM1724](https://www.st.com/resource/en/user_manual/dm00105823-nucleo-f401re-user-manual-stmicroelectronics.pdf): sonraki kartın başlık/solder-bridge/SWD ilişkisi.

Motor seçimi lisans, kaynak dağıtımı, gerçek instruction yürütmesi ve tarayıcı paket bütçesiyle birlikte yapılmalı. Çalışmayan kart görselini mevcut motorun başka CPU'suna eşleyerek destek iddiası üretme.

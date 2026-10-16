# CircuitForge 0.41 · STM32 çalışma alanı

Yeni proje mimari seçimine STM32 eklendi. Blue Pill F103C6/C8/CB ve Nucleo F103RB/F401RE/F411RE gerçek C17 ARM firmware ile mevcut breadboard, devre ve editör alanında çalışır. Altı kart kendi bellek/clock/header profiliyle ayrı seçilir; M3 ve M4F motorları ayrıdır.

LED, buton, UART echo, SHT31 ve MCP3008 örnekleri; fiziksel GPIO/DC, B1 ve kart LED polaritesi, SysTick ve M4F VFP kabulü; SRAM/flash aşımı, checksum/yanlış hedef, GPIO gerilim, reset ve JSON/ZIP. Haricî EEPROM MCU resetinde korunur. Core fingerprint eski STM32 runtime kaynaklarıyla önbellek eşleşmesini engeller.

STM32 ilk sürüm C17 freestanding'dir. Tam ST HAL/Arduino/MicroPython, fiziksel UART framing/IRQ, donanım ADC/PWM/I2C/SPI/USB desteklenmiş sayılmaz. Ayrıntı dist/notices/STM32-MODEL.md; sonraki aileler docs/STM32_PLAN_0.41.md.

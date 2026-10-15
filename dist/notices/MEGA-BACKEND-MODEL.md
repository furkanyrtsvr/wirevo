# Mega2560 backend acceptance — 0.31

This is preparation for a separate processor target. It is not an IDE/catalog board yet. The production UI still supports Uno, classic Nano and Pro Mini 5V/16MHz.

The portable Arduino AVR GCC 7.3.0-atmel3.6.1-arduino7 archive was obtained from the official Arduino package index and its SHA256 checked before extraction. Arduino core sources are the pinned 1.8.7 archive retained alongside existing LGPL notices. No global compiler install is required.

scripts/check-mega-toolchain.py compiles 25 core translation units for atmega2560 and links a real sketch. Separate assembly places one byte at address 0x20000; the C++ sketch uses pgm_get_far_address/pgm_read_byte_far. The native firmware reports FAR=77, A15=512 (2.5V at AVCC=5V), increasing millis, and A/B/C on Serial1/2/3. It reserves a 3000-byte volatile buffer, forcing an SRAM allocation larger than Uno's. Static data+bss: 3681 bytes. Timer5 OC5C /PL5 (Arduino D44) runs phase-correct PWM at 16MHz/64; intervals are 16384 and16256 cycles, with instruction quantization.

src/mega2560-runtime.js configures six timers, eleven ports, four USARTs, TWI and SPI using pinned avr-libc iomxx0_1.h register/vector addresses. Acceptance covers Timer0/5, serial TX0..3, single-ended ADC15/MUX5 at AVCC, PB0/D53 output, three-byte call/return and extended flash read. It does not validate every timer mode or bus/serial RX behavior. GPIO external and pin-change interrupts are deliberately absent in this preparation runner. Alternate ADC references/differential input, EEPROM/watchdog, bootloader and USB are not accepted models here.

The HEX parser's capacity is explicit: default32768 remains Uno, while the backend requests262144. The Mega native fixture is rejected by the default Uno parser. Mega CPU SRAM starts0x200 and ends0x21ff; the AVR8js register-window allocation is accounted for. Source tests run with npm test; native fixture can be regenerated with the script. Generated toolchain/build directories are ignored local preparation, not deployment assets.

Next: canonical Mega geometry/70 GPIO map/ground aliases, IRQ/PCINT, frontend source-key/worker memory limits, real avr6 WebAssembly libraries/core objects, DC GPIO/ADC and I2C20/21/SPI50..53/UART1..3 electrical adapters. Only after end-to-end browser acceptance should Mega be advertised as a supported board.

0.33 update: Mega2560 is now a supported IDE/compiler/electrical target, including interrupts and physical bus adapters. The preparation-only limitations above describe historical 0.31. Read [current acceptance and scope](./MEGA-BOARD-MODEL.md).

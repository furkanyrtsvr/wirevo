# Pico 0.90 validation

Only new acceptance checks were run: 22 checks for C SDK helpers/Hazard3 and genuine MicroPython. ARM and Hazard3 compile from the shared multi-file SDK example; tests check both cores, locks, alarms, native IRQ, atomics, LED current and architecture persistence. Python checks execute the actual WASM interpreter with GPIO IRQ, ADC/PWM, EEPROM I2C, SPI loopback, terminal UART, SRAM and virtual W WLAN.

Browser: localhost preview, version 0.90.0. Created a Pico 2 W / C / Hazard3 project through the project dialog. Compiled successfully (10122-byte native image), ran and paused; terminal alternated Pico C LED ON/OFF. Created a Pico W / MicroPython project, checked syntax and ran. Terminal alternated LED 1/0; circuit displayed 3.30 V and 3.94 mA and GP15 waveform. No console errors. Screenshot proof retained in workspace outputs/pico-hazard3-090.png and pico-micropython-090.png.

Browser verification found duplicate anonymous time typedefs across stdio.h/cf_hal.h and pico/stdlib.h. Added a shared type guard; the new SDK fixture now includes both headers to cover this. ARM atomic counter was optimized out when never referenced; fixture now explicitly initializes the volatile counter so debug assertions inspect a retained symbol.

No old test suites were run. Full SDK, native RP2 firmware, ROM startup, real CYW43 radio and cycle-exact silicon remain outside this profile; docs/PICO_SUPPORT.md records scope.

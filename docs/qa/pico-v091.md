# Pico 0.91 validation

Only new tests: tests/pico-sdk091.test.mjs (12 native C board/architecture profiles) and tests/pico-python091.test.mjs (8 genuine MicroPython profiles). C checks exchange 40 ordered/checksummed records between two native cores via bounded queues and semaphores, timeout on a held mutex, and dispatch/stop/cancel repeating native alarm callbacks. Python checks periodic/one-shot Timer callbacks, masked delivery, wrapping ticks, PIO assembler/FIFO/IRQ/physical LED output, UART lines and PWM nanosecond duty. No earlier test files were executed.

Browser localhost 0.91.0: opened the new MicroPython PIO/Timer project from the project menu, checked syntax, ran it in the actual unified worker. PIO drove the GP15 LED through the resistor; the terminal repeatedly printed Timer / PIO etkin after awaited sleeps. The circuit screenshot shows 3.30 V / 3.94 mA, live GP15 waveform and Python source. No browser console errors. Proof: workspace outputs/pico-sdk-python091.png.

Issues corrected during new checks: Cortex-M0+ 64-bit multiply helper dependency was removed from the new ms conversions by using exact shifts / validated 32-bit arithmetic. Immediate PIO output changes now invalidate the circuit GPIO-state cache; input and LED current are checked. The worker preserves Pico-specific time hooks and polls Python callbacks at awaited sleep boundaries.

Full SDK/CMake, native RP2 MicroPython firmware, Python threads/hard IRQ and rp2.DMA remain unsupported. ROM work is deferred. See docs/PICO_SUPPORT.md for the complete current ledger.

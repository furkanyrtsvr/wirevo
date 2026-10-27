# Wirevo 0.90.0 — Pico languages and ROM-free SDK helpers

All eight Pico board profiles can now run genuine MicroPython WASM with a circuit-backed machine adapter. The four RP2350 profiles can also compile and execute C as real Hazard3 RV32IMAC code. The architecture and language survive JSON/ZIP projects and select separate firmware caches.

## Added

- Hazard3 ELF generation, native instruction execution, CSR-based machine interrupts, exclusive IRQ handlers, two cores and scalar source-debug register mapping. ARM remains selectable.
- C absolute-time helpers, core-0 alarm callbacks/cancellation, hardware spinlocks, critical sections and mutexes. The downloadable multi-file SDK example uses the same code verified by the new acceptance checks.
- Pico MicroPython Pin/pulls/open-drain, cooperative GPIO IRQ, ADC, PWM, guarded memory access, GPIO I2C/SPI, terminal UART and wireless-board LED. Extra Python files are loaded as project modules.
- MicroPython W-board network.WLAN adapter for the explicitly virtual WirevoLab AP. No real Internet or CYW43 firmware execution is implied.
- Language/CPU selectors, starter projects, worker routing, project validation and accurate support information in the editor.

## Verification

22 new acceptance checks only: eight ARM C profiles, four Hazard3 C profiles, eight genuine MicroPython board profiles, and two project/cache/import checks. They exercise new locks, alarms, both cores, RISC-V atomics, native IRQs, source linking, GPIO/LED, ADC, PWM, EEPROM I2C, SPI loopback, terminal UART, cooperative GPIO IRQ and virtual WLAN. Old suites were not rerun. Browser checks cover editor compilation/execution for Hazard3 and MicroPython.

## Scope

This is a supported subset, not the complete upstream Pico SDK or native MicroPython RP2 firmware. See [the maintained support record](PICO_SUPPORT.md). ROM-dependent work remains deferred. Hazard3 starts directly from Wirevo's firmware image; original RISC-V ROM boot and UF2 import are not added. No cycle-exact silicon/radio compatibility is claimed.

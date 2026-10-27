# Pico support record — v0.89.0

This is the current record, replacing assumptions based on accumulated release requests. Earlier release notes describe historical scopes. A future release should update this record rather than repeatedly present known limitations as newly discovered defects.

| Area | Implemented profile | Limits / remaining work |
|---|---|---|
| Boards | Pico, H, W, WH, Pico 2, Pico 2 headers, Pico 2 W, Pico 2 W headers; native C17 ARM | No Hazard3/RISC-V or MicroPython/CircuitPython execution |
| Projects/debug | Multiple C/header files, source linking, address breakpoints, source step-into and scalar RAM/register watches on core 0 | Full Pico SDK build system, arbitrary libraries, call stack, expression evaluation, step-over/out, core 1 source debugger |
| GPIO/IRQ | Electrical circuit GPIO; per-core GPIO interrupts; exclusive NVIC handlers; pending/priority/PRIMASK; both ARM cores | Shared handler chains, raw-handler SDK surface, nested IRQ and timing coverage beyond the newly checked profile; GPIO interrupt register adapter handles word accesses |
| ADC | External GP26–28 circuit voltages; configured temperature and VSYS/3; FIFO, continuous conversion, round-robin, IRQ helpers | Analog noise, full electrical power/thermal model and complete silicon timing; shared CYW43 pin must be released for VSYS |
| DMA | Native SRAM/PIO DREQ, ring addresses, byte swap, channel IRQ and abort SDK helpers | Complete SDK, sniffer/timer/reverse-increment acceptance coverage; new C acceptance tests cover IRQ0 and the ring/byte-swap/abort profile |
| PIO/multicore | Native state machines, instruction arrays, FIFO/DREQ, two cores, SIO FIFO, per-core vectors | Automatic .pio assembler, full SDK API, general scheduling/race/cycle equivalence |
| Peripheral buses | Existing UART, ADC, PWM; source-compatible I2C/SPI GPIO masters and external device models | Full hardware/DMA SDK adapters, every framing/clock mode, UART1 external-device adapter |
| USB | Bounded polled CDC/HID/MSC/DFU device profiles | Full TinyUSB, composite devices and general USB host |
| Flash/BOOTSEL | Existing project flash service; separate original RP2040 B1/RP2350 A2 ROM sessions with user-supplied ROM and UF2 writes | General application boot2/picobin/partitions, OTP, secure boot; ROM session is separate from project circuit |
| CYW43439 host chip | GPIO gSPI, test/status/interrupt registers, RAM/windows, LED/supply GPIO state, VBUS input, reset wrappers and SRAM PDA registers | Full transport modes/timing, all peripheral registers, OTP, ARMCM3 execution; F2 frames remain pending without firmware |
| CYW43439 firmware/radio | Separate virtual AP, bounded UDP echo and BLE UART teaching services | Original WLAN ROM, native chip firmware, 802.11 MAC/PHY, Bluetooth baseband, lwIP/BTstack and Internet connectivity |
| Other silicon | Existing pinned native engine behavior | Full clocks/power/reset/watchdog/RTC/security/TrustZone, CPU instruction and cycle fidelity have not been exhaustively implemented/validated |

ROM-dependent work is deferred by the user. Other items in the right column are also unfinished; obtaining a ROM does not complete them. They are not hidden or claimed complete. New acceptance work in v0.89 covers 15 checks; prior checks were deliberately not rerun at the user's request. The downloadable C hardware example is validated on all eight boards, and new CYW43 control-register behavior is validated on the four wireless boards.

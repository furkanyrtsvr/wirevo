# v0.88.0 — CYW43439 ROM-independent host bus

Pico W, WH, Pico 2 W and Pico 2 W with headers now attach a CYW43439 host-bus model to the onboard GPIOs: GP23 power, GP25 chip select, GP29 clock, GP24 shared data/interrupt. Compiled C can probe the gSPI test register, switch the boot-time swapped 16-bit format to the driver's 32-bit byte format, configure backplane windows, upload/read 512 KiB RAM, and inspect clock request/availability, interrupt status/masks and write-one-to-clear errors. Bus response padding and optional status trailers are implemented. Partial transactions discard pending writes. Power removal resets RAM, bus state and the virtual network session.

Chip GPIO output/direction and LED share state with the source-compatible SDK helpers. WL_GPIO1 supply-mode state and WL_GPIO2 USB VBUS sense are exposed; this remains a USB-powered board model, with no analog switching-regulator simulation. The Pico connections panel reports power, bus traffic, window and IRQ, and offers the same downloadable C example exercised by the new acceptance checks.

Non-wireless Pico variants have no CYW43439 instance. Only newly added checks run for this release: `node --test tests/pico-cyw43-chip088.test.mjs` (12 checks, including compiled C on four wireless variants and absence on four non-wireless variants).

## Boundaries

This is a host-bus subset, not complete CYW43439 silicon emulation. No original chip CPU, WLAN ROM, firmware, 802.11 PHY/MAC or Bluetooth baseband executes. Missing ROM and unknown backplane addresses return unavailable/error instead of fabricated firmware execution. F2 transmit frames have a bounded eight-frame pending queue; firmware does not consume them and F2/F3 readiness is not asserted. No synthetic SDPCM responses, Internet, lwIP or BTstack are added. Native PIO GPIO transitions can reach this bus, but unmodified Pico SDK/PIO driver binaries, every bus mode, timing, hardware DMA interaction and silicon equivalence have not been validated. The supported wire profile is MSB-first bytes, clock-low/rising-edge sampling, with the driver's initialization word swap and normal 32-bit transfers. Generic processor/reset-wrapper/OTP/SRAM-bank and further peripheral registers remain unsupported.

The existing virtual AP/UDP/BLE laboratory remains distinct from these low-level bus transactions. The original Pico ROM/flash support and prior SDK limitations are unchanged. This release does not claim all Pico features are complete.

References: [driver transfer format](https://github.com/georgerobotics/cyw43-driver/blob/main/src/cyw43_spi.c), [gSPI register definitions](https://github.com/georgerobotics/cyw43-driver/blob/main/src/cyw43_spi.h), [backplane and clock handling](https://github.com/georgerobotics/cyw43-driver/blob/main/src/cyw43_ll.c), [Pico W onboard wiring](https://github.com/raspberrypi/pico-sdk/blob/master/src/boards/include/boards/pico_w.h).

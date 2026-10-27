# v0.89.0 — Pico native IRQ, DMA, ADC and CYW43 control registers

All eight ARM Pico profiles now provide `hardware/irq.h` exclusive handlers, enable/disable, pending/clear, priority, per-core RAM vectors and `hardware/sync.h` PRIMASK save/restore. GPIO edge/level callbacks use native exception entry/return; both cores have independent GPIO masks and force registers. Core 1 initializes its own vector table. This fixes RP2350 bank address decoding, RP2040 per-core NVIC selection and repeated software-pending interrupts, and RP2350 priority register addressing.

DMA adds read/write rings, byte swap, quiet IRQ, IRQ routing/status/acknowledgement and abort helpers. RP2350 CTRL writes preserve the BSWAP bit that rp2350js 2.0.1 dropped. ADC adds FIFO, continuous conversion, round-robin, divider and IRQ helpers; FIFO reads deassert the IRQ, START_ONCE self-clears and round-robin changes channel correctly. Internal temperature and VSYS/3 samples use configurable board inputs. Temperature sensing must be enabled; GPIO29/VSYS measurements during an active powered CYW43 transaction set the ADC error instead of returning a valid voltage.

The Pico connections panel edits temperature, VSYS and USB VBUS state and saves them in project settings. Readings take effect on subsequent conversions. CYW43 VBUS sense follows this input. A downloadable C example is the exact source used by the new hardware acceptance checks.

CYW43439 adds the documented SDIO/ARM/SRAM reset-wrapper IOCTRL/RESETCTRL registers and indexed SRAM bank PDA controls used by the driver. Per-bank state remains distinct, controller reset retains modeled SRAM, and full power loss clears it. These control registers do not run an ARMCM3, proprietary firmware or radio, do not infer SRAM geometry or OTP, and do not fabricate a successful WLAN firmware boot. They are accessible through the GPIO-driven gSPI/backplane bus.

Validation: only `tests/pico-hardware089.test.mjs` and `tests/pico-cyw43-backplane089.test.mjs`. Fifteen new checks cover compiled C IRQ/ADC/DMA on all eight profiles, two-core software interrupts, both GPIO edges, and compiled C CYW43 reset/SRAM/shared-pin behavior on all four wireless profiles. No previous tests were run. Only these two files run in CI for `[pico-089-only]` pushes.

Current support and remaining work are tracked in [PICO_SUPPORT.md](PICO_SUPPORT.md). This release is not a claim of complete Pico SDK or cycle-accurate silicon coverage.

References: [Pico SDK hardware APIs](https://www.raspberrypi.com/documentation/pico-sdk/hardware.html), [IRQ API](https://github.com/raspberrypi/pico-sdk/blob/master/src/rp2_common/hardware_irq/include/hardware/irq.h), [DMA API](https://github.com/raspberrypi/pico-sdk/blob/master/src/rp2_common/hardware_dma/include/hardware/dma.h), [CYW43 reset and SRAM controls](https://github.com/georgerobotics/cyw43-driver/blob/main/src/cyw43_ll.c).

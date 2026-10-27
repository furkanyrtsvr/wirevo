# Wirevo 0.91.0 — Pico SDK containers and MicroPython PIO/Timer

Added original ROM-free Pico C SDK helpers for fixed-element, lock-protected queues, semaphores, timed mutex entry, repeating timers and absolute-time helpers. Both native cores exchange ordered records in the new acceptance fixture. Queues have a bounded 1024-byte payload per instance, avoiding a fake/general libc allocator.

Added genuine MicroPython machine.Timer, simulated ticks, cooperative IRQ masking, PWM duty_ns and terminal UART readline/flush/txdone. Timer callbacks run at Pin/time and browser sleep polling boundaries, not as hard Python interrupts. Periodic callbacks coalesce if Python has not yielded.

Added rp2.asm_pio with all eight basic instruction groups, labels, wrap, delay and sideset encoding, plus native-engine StateMachine init/active/restart/exec, FIFO get/put/levels and cooperative per-SM IRQ callbacks. Eight SMs on RP2040 and twelve on RP2350 use actual PIO registers and the solved circuit. Program memory is shared and deduplicated by instruction sequence. No arbitrary native RP2 firmware or rp2.DMA wrapper is implied.

The project menu includes runnable C queue/semaphore/timer and Python PIO/Timer examples. Updated cache keys prevent using pre-0.91 firmware for the new SDK surface. The Python worker now preserves Pico's machine time hooks and dispatches callbacks after awaited browser sleeps. Native PIO output changes explicitly invalidate the circuit GPIO cache.

20 new acceptance cases only: 12 native C board/architecture combinations and eight genuine MicroPython board profiles. No old test files were executed. See [support record](PICO_SUPPORT.md) for exact limits, including full SDK/CMake, native RP2 firmware, hard Python IRQ/threads, real networking and ROM-dependent work that remains deferred.

API reference used for compatibility: [SDK queue](https://github.com/raspberrypi/pico-sdk/blob/master/src/common/pico_util/include/pico/util/queue.h), [SDK semaphore](https://github.com/raspberrypi/pico-sdk/blob/master/src/common/pico_sync/include/pico/sem.h), [MicroPython RP2](https://docs.micropython.org/en/latest/library/rp2.html), [StateMachine](https://docs.micropython.org/en/latest/library/rp2.StateMachine.html). Implementations here are original bounded adapters.

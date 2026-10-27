# Wirevo 0.92.0 — CMake project declarations and native Python DMA

Pico C projects now retain CMakeLists.txt/.cmake files in the editor and JSON/ZIP. The strict declarative importer resolves local target graphs, linked source selection, directories/includes, variables and per-source compile definitions with target visibility. Unsupported scripting commands fail with file/line diagnostics. A new runnable CMake example produces a native ARM/Hazard3 ELF and drives the circuit. This is a CMake declaration importer for the existing Wirevo SDK, not the full CMake engine or upstream Pico SDK.

MicroPython rp2.DMA now uses the native emulated DMA controller for memory/bus transfers, PIO DREQ pacing, channel register access, Python buffer staging and cooperative completion IRQ. APIs include channel claim/release, pack/unpack control, config, active/abort, read/write/count/ctrl and register slices. Native TRANS_COUNT values are made observable before trigger in the Python register adapter. Python buffers are retained and copied through bounded native SRAM regions, not copied by a fake DMA engine.

21 new checks only: 12 ARM/Hazard3 C profiles, CMake file/ZIP/error handling, and eight genuine Python DMA board profiles with byte swapping, typed buffers, completion IRQ, PIO TX/RX DMA and channel reuse. Old test files were not run. Browser QA covers both new runnable project examples.

Unfinished: full SDK/CMake execution and genuine MicroPython _thread. The shipped interpreter does not include _thread; a sequential wrapper is not offered as genuine shared-interpreter threading. DMA sniffer/DMATimer, hard Python IRQ and RP2350 special transfer modes remain outside the new adapter. ROM work is deferred. See [the support record](PICO_SUPPORT.md).

Primary API references: [MicroPython DMA](https://docs.micropython.org/en/latest/library/rp2.DMA.html), [upstream WASM configuration](https://github.com/micropython/micropython/blob/master/ports/webassembly/mpconfigport.h), [Pico SDK build system](https://www.raspberrypi.com/documentation/pico-sdk/index_doxygen.html).

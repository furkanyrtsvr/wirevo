# Wirevo v0.93.0

Original Pico boot ROM can now be fetched automatically as pinned, verified data, with local-file fallback. The flash/SSI/QMI chip-select and status model was corrected so unmodified upstream RP2 firmware can boot normally on RP2040 and RP2350. ROM images are not bundled; source and licensing distinctions are documented.

Pico MicroPython has a new **native RP2** engine alongside the existing WASM adapter. Official MicroPython 1.29.0 ARM firmware runs through original ROM on both CPUs. `_thread.start_new_thread`, shared Python objects, native locks, native module files and ordinary time.sleep execute in the upstream interpreter. PSM core resets and RP2350 fast-GPIO CP0 instructions are modeled. The new `_thread` starter prints two core identities and shared count 20, and lights GPIO15. All eight board profiles use generic RPI_PICO/RPI_PICO2 CPU firmware; W radio is not initialized.

Real upstream SDK/CMake builds are available through the downloadable local builder and **Pico SDK / CMake** import panel. Full CMake executes on the computer with the official SDK/toolchain, including functions, conditionals and generated headers. Imported ARM UF2 executes original ROM/boot2/picobin with two native cores, electrical GPIO and USB CDC. The browser's quick compiler remains a bounded SDK/CMake subset. Native imports retain flash in JSON/ZIP; their source debug map is not yet available.

Only new checks were run: 22 new runtime/ROM/SDK cases, plus new builder checks and browser acceptance. Eight cases execute genuine RP2 `_thread` twice, shared count 40, locks, helper.py flash filesystem and core-1 LED; eight execute new official-SDK firmware from real CMake builds; remaining cases cover ROM hash/cache, ZIP and invalid UF2 input. No prior test suites were rerun.

CYW43 internal ROM and original wireless firmware/radio execution are still unavailable. Full chip/cycle equivalence, secure boot/OTP and every SDK peripheral are not claimed complete. See the current support ledger rather than interpreting historical release requests as completed features.

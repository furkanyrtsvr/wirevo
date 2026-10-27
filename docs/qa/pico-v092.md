# Pico 0.92 validation

Only new files: tests/pico-cmake092.test.mjs and tests/pico-dma092.test.mjs. 21 cases: 12 native C board/architecture profiles, one JSON/ZIP and explicit CMake error case, eight genuine MicroPython DMA profiles. CMake links the selected source graph, preserves include/definition visibility, excludes an intentionally invalid unlinked source, and produces LED current through native machine code. Python DMA tests cover typed-buffer copying with native byte swap, native completion IRQ, PIO DREQ TX/RX, channel reuse, buffer bounds and closed-object errors.

Browser localhost 0.92.0: opened the new Python DMA/PIO project, checked syntax and executed it. Terminal reported DMA / PIO: [1, 0, 3], matching the native PIO shift path; the GP15 LED remained on, with 3.30 V / 3.94 mA. No console errors. Proof retained in outputs/pico-dma092.png. CMake project opened with all files in the source tree and compiled as Hazard3.

Current interpreter capability probe: genuine bundled MicroPython raises ImportError for import _thread. No sequential substitute is shipped or counted as thread support. CMake support is declaration import, not a CMake executable/upstream SDK build. These gaps remain explicitly in docs/PICO_SUPPORT.md. ROM work is deferred. No old suites were run.

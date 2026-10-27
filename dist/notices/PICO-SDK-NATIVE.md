# Official Pico SDK / CMake workflow — v0.93.0

The quick browser compiler retains Wirevo's bounded SDK and declarative CMake importer. For actual upstream SDK builds, use the new local build/import workflow. This runs **real CMake**, rather than interpreting selected commands in JavaScript.

1. Save the Pico C project as JSON in Wirevo.
2. Install Python 3.9+, CMake, Ninja and the official Arm GNU embedded toolchain. Clone the [official Pico SDK](https://github.com/raspberrypi/pico-sdk) with its required submodules (`git submodule update --init`). Version 2.3.1 and Arm GNU 14.3.Rel1 were used for the new acceptance images.
3. Download [build-pico-sdk.py](../build-pico-sdk.py). It uses existing tools, starts no local server and downloads nothing silently. CMake projects can run host commands: build only projects you trust.
4. Run, substituting your paths:

```
python build-pico-sdk.py --project project.json --sdk pico-sdk --toolchain arm-gnu --output result
```

If CMake or Ninja are not in PATH, add `--cmake path/to/cmake` and `--ninja path/to/ninja`. `--toolchain` is the folder containing `bin/arm-none-eabi-gcc`. Repeated `--cmake-arg=-DNAME=value` passes real CMake configuration options. Choose a new output directory for each source snapshot; existing source trees are not overwritten.

Your CMakeLists.txt is used unchanged. Without one, the tool creates a small executable linking pico_stdlib and pico_multicore, with USB CDC enabled. Source/header paths are preserved. Installed SDK import is copied into the source snapshot. CMake functions, conditionals, generated headers, linked libraries and subdirectories execute normally. Additional libraries and build generators require their own normal host dependencies; .pio assembly requires pioasm. This is not a hosted browser build service.

The tool emits an unsigned ARM UF2 from each final ELF's binary. Pico/H map to `pico`, W/WH to `pico_w`, Pico 2/header to `pico2`, and Pico 2 W/header to `pico2_w`. The current import path is ARM only; Hazard3 source compilation remains in the quick browser profile. Secure signing, OTP and vendor radio firmware are outside this workflow.

5. In a Pico C project select **Pico SDK / CMake → Resmi SDK UF2 yükle**, then **Çalıştır**. The engine starts from original RP2040 B1 or RP2350 A2 ROM, executes SDK boot2/picobin and runs the two CPUs with electrical GPIO and USB CDC connected to the circuit. Reset rebuilds that native session. Save as JSON/ZIP to retain the imported flash. First ROM use downloads verified pinned data; see [ROM sources](PICO-ROM-SOURCES.md).

The first acceptance program uses a real CMake function/if/generated header, upstream multicore_launch_core1, core-1 GPIO15 and USB CDC output `SDK_NATIVE_PASS 73`. Both RP2040/RP2350 images execute on all eight board profiles. This verifies CPU/common peripherals, not native W radio. Native SDK imports currently have instruction stepping/registers but no source DWARF debug map. Peripheral API compatibility depends on the underlying chip model; this release does not claim all SDK libraries or all silicon behavior are complete.

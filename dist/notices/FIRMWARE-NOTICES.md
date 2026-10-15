# CircuitForge example firmware notices and source

CircuitForge 0.13 compiles OLED sketches with Adafruit SSD1306 2.5.16 and GFX 1.12.6. Their exact-header verified source ZIPs and BSD licenses are included here; see [OLED model and sources](./OLED-MODEL.md). New OLED firmware is compiled from user sources; none is embedded in the Site. Source-repository test HEX fixtures include their application sources and these notices.

The five example Intel HEX firmware files embedded in `template-firmware.json` statically link the Arduino AVR core and compiler runtime libraries. Each example's complete application source is the `source` field in the same JSON file and is also available as an editable `.ino` file in this `examples/` folder. Users can modify and recompile these examples. No restriction on reverse engineering for debugging modifications to the linked LGPL library is imposed.

## Arduino AVR core 1.8.7

Copyright Arduino Team and the individual contributors identified in source files. The linked core files generally use GNU Lesser General Public License version 2.1 or later. Individual files retain their own copyright and licensing notices. The license text is provided as `LGPL-2.1.txt`.

The compiler package `@horang-corp/avr-gcc-wasm` 0.2.0 prepares its Arduino objects using the pinned `ARDUINO_PLATFORM_VERSION = "1.8.7"` in upstream's [prepare-assets script](https://github.com/horang-corp/avr-gcc-wasm/blob/main/scripts/prepare-assets.mjs). The platform archive is Arduino's official [AVR 1.8.7 package source](https://downloads.arduino.cc/cores/staging/avr-1.8.7.tar.bz2), mirrored here as `arduino-avr-1.8.7-source.tar.bz2` (7,161,883 bytes). Its SHA-256 is:

`6ae7000b1b6c004c4a208d6d924a8046b417580e4a10cfd3f88930b6660a51db`

This hash was verified against [Arduino's package index](https://downloads.arduino.cc/packages/package_index.json). The included Arduino.h header was also verified byte-identical to the compiler package's Arduino.h. The [ArduinoCore-avr 1.8.7 tag](https://github.com/arduino/ArduinoCore-avr/tree/1.8.7) supplies browsable source. No Arduino core modifications were made for these examples.

## avr-libc 2.0.0 and GCC runtime 7.3.0

The package's `avr/version.h` identifies avr-libc 2.0.0. avr-libc uses a Modified BSD license, with individual source notices: `AVR-LIBC-LICENSE.txt` is included. Source: [avr-libc 2.0.0 release](https://github.com/avrdudes/avr-libc/tree/avr-libc-2_0_0-release).

The upstream generator pins the native Arduino AVR GCC object toolchain to `7.3.0-atmel3.6.1-arduino7`; `libgcc.a` comes from that toolchain. GCC runtime libraries are covered by GPLv3 with the GCC Runtime Library Exception 3.1; both texts are provided (`GPL-3.0.txt`, `GCC-RUNTIME-LIBRARY-EXCEPTION-3.1.txt`). Source: [GCC 7.3.0 runtime exception](https://github.com/gcc-mirror/gcc/blob/releases/gcc-7.3.0/COPYING.RUNTIME).

The GCC/binutils compiler binaries themselves are fetched directly in the browser from the pinned upstream npm distribution via jsDelivr. They are separate from the example firmware and are not mirrored in this site. See the upstream compiler's [third-party notices](https://github.com/horang-corp/avr-gcc-wasm/blob/main/THIRD_PARTY_NOTICES.md) for compiler distribution information. These notices do not claim that upstream's compiler-to-WASM corresponding-source provenance has been fully established.

## Rebuilding or modifying

The provided `rebuild-examples.mjs` runs the same pinned GCC WASM package and compiles all application sources from the JSON file. On Node 18 or later:

```text
npm install @horang-corp/avr-gcc-wasm@0.2.0
node rebuild-examples.mjs ../template-firmware.json ./rebuilt-firmware.json
```

For a conventional Arduino toolchain, install Arduino AVR core 1.8.7 and compile the supplied `.ino` directories, for example:

```text
arduino-cli core install arduino:avr@1.8.7
arduino-cli compile --fqbn arduino:avr:uno --export-binaries examples/blink
```

The ordinary Arduino CLI build uses a different optimization/link setup and may produce different HEX bytes and flash sizes; it provides a rebuildable firmware implementation from the same application and core source. To modify the core itself, unpack the provided Arduino source archive, modify the relevant core files, and rebuild with a toolchain configured to use those modified sources. The upstream generator script documents its exact core object compile flags and linker inputs; the browser compiler's `firmware-builder.js` provides the source-to-assembly/link/HEX recipe.

## 0.20 Arduino external interrupts

The pinned compiler omitted WInterrupts. CircuitForge ships `arduino-WInterrupts.cpp` (original Arduino AVR1.8.7 WInterrupts.c with a C++ linkage wrapper) and reproducibly assembled `arduino-WInterrupts.o`. Original LGPL notices retained. `scripts/build-interrupt-core.mjs` rebuilds using the pinned cc1plus/avr-as, matching Arduino headers and Uno target. The object is indexed in the linker library, included when attachInterrupt/detachInterrupt is referenced. Full corresponding Arduino source and LGPL2.1 license remain available above.

## 0.33 Mega2560 target assets

Mega's variant header, 25 Arduino core objects, Wire/SPI/Adafruit objects and avr6 CRT/runtime/linker inputs are retained in mega-toolchain/. Read [the target README](./mega-toolchain/README.md) for original source/license references, reproducible preparation and the per-file hash manifest. Same LGPL modification/relinking allowance and GCC Runtime Library Exception apply. The original source archives and licenses above remain available; drawings are original CC0 illustrations. New cached firmware stores each complete sketch source and target alongside HEX, and is editable/recompilable in the IDE.

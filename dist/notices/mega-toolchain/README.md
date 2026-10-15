# ATmega2560 target assets

These files are target inputs for CircuitForge's independent GCC WASM project adapter. Compiler executables themselves remain fetched from the pinned upstream npm distribution. manifest.json records every target binary/header/script SHA256 and exact toolchain version.

Sources: Arduino AVR core 1.8.7 retained in ../arduino-avr-1.8.7-source.tar.bz2; original Mega pins_arduino.h is included in headers/. Wire and SPI are from that core. Adafruit GFX 1.12.6, BusIO 1.17.4 and SSD1306 2.5.16 source ZIPs and original BSD licenses are retained in the parent notices directory. LGPL-2.1.txt and individual core notices apply to Arduino objects. AVR-LIBC-LICENSE.txt applies to AVR libc/CRT; GCC GPL-3.0.txt plus GCC-RUNTIME-LIBRARY-EXCEPTION-3.1.txt apply to libgcc. See ../FIRMWARE-NOTICES.md for copyright/source links and modification/relinking terms.

Native target objects/libraries come from Arduino's official AVR GCC 7.3.0-atmel3.6.1-arduino7 toolchain. Original package index: https://downloads.arduino.cc/packages/package_index.json. Source release and runtime notices: https://github.com/gcc-mirror/gcc/tree/releases/gcc-7.3.0 and https://github.com/avrdudes/avr-libc/tree/avr-libc-2_0_0-release. Debug information is removed with avr-strip -g. Objects are individually indexed by the application's AVR archive writer and can be replaced by rebuilt or modified versions.

Reproduce from the project checkout on Windows, with the portable official toolchain and retained Arduino core extracted into the paths below:

```text
python scripts/check-mega-toolchain.py --toolchain .sites-runtime/mega-tools/avr --core .sites-runtime/mega-tools/core/ArduinoCore-avr-1.8.7
python scripts/prepare-mega-browser.py
node scripts/check-mega-browser.mjs
node scripts/check-mega-projects.mjs
node scripts/check-mega-irq.mjs
node scripts/check-mega-pwm.mjs
node scripts/check-mega-pulse.mjs
```

Preparation compiles all 25 Arduino core translation units, preserving separate wiring_pulse.c and wiring_pulse.S object names. Eight additional library objects are rebuilt with the same AVR6 target. The browser's source-to-assembly and link steps remain genuine WASM tool execution; there is no source-pattern simulation. Exact compiler flags and file mappings are in the preparation scripts and dist/gcc-project.js.

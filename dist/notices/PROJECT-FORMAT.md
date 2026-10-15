# Project ZIP and library locks — 0.14

Projects stay on the visitor's device. ZIP import performs no filesystem extraction and executes no ZIP entry. The same Open control accepts JSON and ZIP.

ZIP32 stored and raw Deflate are supported, including signed or unsigned streaming data descriptors and one enclosing project directory. Limits: 2,000,000 bytes compressed and expanded, 64 central records including folders; user sources retain the existing 16 files / 100,000 UTF-8 byte limit. ZIP64, split disks, encryption, symlinks, overlapping records, duplicate case-folded/NFC paths, traversal, invalid UTF-8, CRC errors and unsupported project entries are rejected. Browser Deflate support uses [DecompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream/DecompressionStream); stored ZIP works independently of it.

Required entries: circuit.json and sketch.ino. Optional additional .cpp/.h/.hpp sources, firmware.hex and libraries.json. ZIP source files override the duplicate sources in circuit.json, allowing external editing. Changed sources discard cached HEX; a separate HEX without matching project firmware metadata is not run automatically. Conflicting HEX or library manifests reject the archive. Import parses everything before switching projects. A current-project snapshot must succeed first; errors keep the current workspace intact. Concurrent source edits or a newer import invalidate an older pending read.

Schema 5 adds `libraries` with schemaVersion 1, an exact `toolchain`, explicit `requested` versions and the dependency closure in `locked`. The compiler package is @horang-corp/avr-gcc-wasm 0.2.0, Arduino AVR core 1.8.7. An absent manifest retains 0.13 compatibility and old firmware fingerprints. Explicit library requests are included in new source fingerprints; version/lock mismatches fail validation. Selecting a new manifest invalidates firmware and recompiles with only the chosen include trees and library archive objects. GNU ar symbol extraction remains in effect.

Supported choices:

| Library | Version | Compiler dependencies | Sources / license |
| --- | --- | --- | --- |
| Wire | 1.0 | AVR core 1.8.7 | [Full core source](./arduino-avr-1.8.7-source.tar.bz2), LGPL 2.1 or later |
| SPI | 1.0 | AVR core 1.8.7 | Same source archive, GPL 2.0 or LGPL 2.1 |
| Adafruit BusIO | 1.17.4 | Wire, SPI | [Source](./Adafruit-BusIO-1.17.4-source.zip), [MIT](./ADAFRUIT-BUSIO-LICENSE.txt) |
| Adafruit GFX | 1.12.6 | BusIO | [Source](./Adafruit-GFX-1.12.6-source.zip), [BSD](./ADAFRUIT-GFX-LICENSE.txt) |
| Adafruit SSD1306 | 2.5.16 | GFX, Wire, SPI | [Source](./Adafruit-SSD1306-2.5.16-source.zip), [BSD](./ADAFRUIT-SSD1306-LICENSE.txt) |

Dependencies include headers required by the pinned AVR build, not only the dependencies listed in upstream library.properties. Wire/SPI versions were verified in Arduino's source archive. Adafruit source headers were verified byte-identical to the compiler package; BusIO ZIP CRC and MIT text were checked. Upstream pinned versions are documented by the [asset preparation script](https://github.com/horang-corp/avr-gcc-wasm/blob/main/scripts/prepare-assets.mjs).

This is a fixed-version selector for the bundled libraries, not a general npm/Arduino Library Manager or third-party library upload facility. Literal source includes seed the initial selector; this is a reviewable suggestion, not C++ preprocessing/dependency analysis. Compatibility mode retains the prior upstream bundle. Compiler library availability does not add corresponding hardware models; SPI device emulation remains a separate future stage.

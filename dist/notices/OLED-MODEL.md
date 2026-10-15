# SSD1306 / Uno I²C model

CircuitForge 0.13 includes an original CC0-1.0 illustration of a common four-pin 0.96-inch module. Its published 27.7×22.6 mm envelope and terminal/display coordinates follow this [pinned board definition](https://github.com/wokwi/wokwi-boards/blob/4294fca6dce4c5e3d7393ceda312225ed861c997/boards/ssd1306/board.json). The SVG is independently drawn; no paths from wokwi-boards board.svg are redistributed. [Module pin/address documentation](https://docs.wokwi.com/parts/board-ssd1306). This is not a calibrated photograph or mechanical tolerance model.

Uno A4/SDA and A5/SCL alias the same electrical nets. Module GND must resolve to the Uno reference; VCC needs an independent DC source path at 3–5.5 V relative to GND. Two nominal 4.7k module pull-ups are modeled. Their backfeed alone is not valid module power. Panel current, regulator drop and protection diodes are outside scope.

AVRTWI from AVR8js 0.21.0 provides real AVR IRQ/status and Wire callbacks. Start/stop and nine-bit address/data operations are delayed according to TWBR/prescaler and 16MHz cycles. Since 0.28, hardware TWI drives open-drain SDA/SCL through the DC solution; GPIO analyzer captures actual edges. SHT31 can stretch SCL on this shared bus. RC rise-time, GPIO bit-bang I2C, slave MCU and multi-master arbitration remain unsupported. See I2C-LINES-MODEL.md. SSD1306 I²C is write-only, so read addresses receive NACK. Repeated START works; modules sharing an address receive the same writes and share ACK.

Commands follow the [Solomon SSD1306 rev1.1 datasheet](https://www.orientdisplay.com/wp-content/uploads/2020/07/SSD1306.pdf) and [manufacturer overview](https://www.solomon-systech.com/product/ssd1306/). Controller GDDRAM is 1024 bytes, separate from MCU SRAM. Horizontal/vertical/page addressing, column/page ranges, Co/D-C and parameters split across transactions work. Reserved page bits are masked, including Adafruit’s 0xFF end argument. AE/AF controls display power; 2E/2F controls scrolling. Remap/COM scan, normal/inverse, entire display, start line/offset, multiplex and contrast are rendered. Charge-pump/precharge/COM-pin/VCOMH arguments are consumed without electrical panel modeling. Scroll uses nominal 60Hz, without oscillator calibration. Reserved control bits receive model DATA NACK.

Power loss blanks and deterministically resets GDDRAM/controller state. Actual memory retention after power loss is undefined; zeroing is the simulator’s repeatable policy. Restored power needs firmware initialization. Bus-only disconnection retains the image. Older circuit revisions are rejected. Logs retain 128 worker / 240 UI transactions, first 32 data bytes plus full count. CSV exports retained hardware cycles and per-transaction SCL frequency.

Firmware libraries are unmodified assets of pinned @horang-corp/avr-gcc-wasm 0.2.0. Adafruit source ZIP headers were checked byte-identical to that package. GNU ar construction and device adapter are original CircuitForge code; compiler implementation/binaries are not mirrored.

- [SSD1306 BSD license](./ADAFRUIT-SSD1306-LICENSE.txt), [source 2.5.16](./Adafruit-SSD1306-2.5.16-source.zip)
- [GFX BSD license](./ADAFRUIT-GFX-LICENSE.txt), [source 1.12.6](./Adafruit-GFX-1.12.6-source.zip)
- [Toolchain preparation](https://github.com/horang-corp/avr-gcc-wasm/blob/main/scripts/prepare-assets.mjs)

Example strings use Arduino F() to conserve SRAM. Adafruit allocates a 1024-byte heap buffer; the static .data/.bss display excludes it and stack. Actual example fixtures measure buffer/stack separation over changing counter frames and full ADC scale. This is not a guarantee for arbitrary user code.

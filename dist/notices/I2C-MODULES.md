# CircuitForge I²C components 0.15

24LC256 pinout/protocol: Microchip DS21203R, https://ww1.microchip.com/downloads/en/devicedoc/21203r.pdf . DS1307 registers/timing: Analog Devices Rev.5, https://www.analog.com/media/en/technical-documentation/data-sheets/DS1307.pdf . Five-pin breakout wiring background: https://learn.adafruit.com/ds1307-real-time-clock-breakout-board-kit/wiring-it-up .

Original independently authored CircuitForge SVG illustrations (24lc256.svg, ds1307.svg), dedicated to the public domain under CC0-1.0. No vendor photograph, logo or third-party board artwork is copied. The RTC illustration defines a generic five-pin header; it is not a mechanical replica of an Adafruit PCB.

Behavioral models are not full electrical/timing/analog emulation. EEPROM assumes initially erased FF, a deterministic 5 ms write cycle, aborts uncommitted writes on loss of power and retains memory only in that controller instance. RTC uses simulation cycles, no battery backup/SQW output or crystal drift, and resets on lost VCC. This is disclosed in the inspector and roadmap. Actual bus read data is logged; MCU remains the real AVR8js hardware TWI master.

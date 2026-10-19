# Expansion artwork reference audit — v0.77

All SVGs are original, code-generated illustrations. No product photographs,
logos, downloaded bitmap artwork, or third-party PCB drawings are embedded.
Pin IDs and connector coordinates remain the simulator manifest's coordinates;
these illustrations are not manufacturer-accurate PCB footprints. Sources were
consulted for recognizable package/module features, not copied as artwork.

## Primary reference sources consulted

| Reference | Source | Applied visual feature |
| --- | --- | --- |
| MFRC522 module | [Joy-IT module](https://joy-it.net/de/products/SBC-RFID-RC522), [manufacturer manual](https://joy-it.net/files/files/Produkte/SBC-RFID-RC522/SBC-RFID-RC522_Manual_2024-04-23.pdf) | Blue PCB, conspicuous antenna area, separate reader IC and crystal; antenna-left layout follows the user's requested reference orientation. |
| PN532 NFC module | [ELECHOUSE V3 manual](https://www.elechouse.com/elechouse/images/product/PN532_module_V3/PN532_%20Manual_V3.pdf), [current manufacturer module](https://www.elechouse.com/product/pn532-nfc-rfid-module-v4/) | Red/orange antenna PCB, reader IC, crystal and two interface-selector details; not an exact V3/V4 replica. |
| DFPlayer Mini | [DFRobot DFR0299](https://www.dfrobot.com/product-1121.html), [manufacturer guide](https://wiki.dfrobot.com/dfr0299/docs/20906) | Metal microSD socket over green PCB, separate small IC. |
| GPS breakout | [Adafruit Ultimate GPS overview](https://learn.adafruit.com/adafruit-ultimate-gps/overview) | Ceramic patch-antenna cue, metal module shield and RF connector. Simulator UART pins are retained. |
| CAN controller module | [Seeed CAN-BUS Shield](https://wiki.seeedstudio.com/CAN-BUS_Shield_V2.0/) | Separate controller/transceiver ICs, crystal and screw terminal cues. The SVG is a generic compact module, not the shield's form factor. |
| A4988 carrier | [Pololu 1182](https://www.pololu.com/product/1182) | Green carrier, driver IC, adjustment trimmer and plated headers. |
| DRV8825 carrier | [Pololu 2133](https://www.pololu.com/product/2133) | Purple carrier, driver IC, adjustment trimmer and plated headers. |
| Environmental breakout | [Adafruit BME280 downloads and fab prints](https://learn.adafruit.com/adafruit-bme280-humidity-barometric-pressure-temperature-sensor-breakout/downloads) | Small metal sensor package with vent detail and surrounding passives. |
| BME680 breakout | [Adafruit BME680 guide](https://learn.adafruit.com/adafruit-bme680-humidity-temperature-barometic-pressure-voc-gas/arduino-wiring-test) | Related environmental sensor package cue; not an exact sensor die/package reconstruction. |
| RGBC breakout | [Adafruit color sensor guide](https://learn.adafruit.com/adafruit-color-sensors?view=all) | Optical window and separate illumination LED. |
| I²S amplifier | [Adafruit MAX98357 downloads](https://learn.adafruit.com/adafruit-max98357-i2s-class-d-mono-amp/downloads) | Small amplifier IC and two-position speaker terminal cue. |
| I²S microphone | [Adafruit audio breakout catalogue](https://www.adafruit.com/category/526) | Metal MEMS package with acoustic port; generic microphone, not a specified exact SKU footprint. |

Waveshare RC522/CAN pages were attempted but inaccessible through the browser
tool; they are not treated as inspected visual evidence.

## Honest scope of the visual research

At the initial pass, the 50 manifest entries were **not individually photo-researched**. In addition
to the source-informed families above, the following use original generic
package/module illustrations and known physical cues, with no claim of an
individually inspected manufacturer photograph:

`tact6`, `segment1`, `segment4`, `ledbar`, `rgbled`, `lcd20p`, `lcd20`,
`buzzerActive`, `buzzerPassive`, `dcmotor`, `tb6612`, `optocoupler`, `pnp`,
`pmos`, `aht20`, `ds3231`, `adxl345`, `water`, `rain`, `soilProbe`, `ads1115`,
`mcp4725`, `pcf8574`, `pca9685`, `cd4067`, `levelShift`, `fram`, `spiFlash`,
`sdCard`, `vl53l0x`, `ina226`, `max30102`, `ili9341`, `xpt2046`, `epaper`,
`irEmitter`, `irReceiver`, `rs485`.

These receive purpose-specific silhouettes: plated DIP/TO-92/TO-220 packages,
relay-compatible terminals, water traces versus rain grid versus soil fork,
optical windows, RTC coin cell, ADC/DAC ICs, PWM header arrays, and display
windows. Generic decoration is not presented as a literal manufacturer PCB.

## Layout and reproducibility

- Generator: `scripts/generate-expansion-art.mjs`; dynamic manifest iteration.
- Existing 12 mm button artwork is explicitly protected from generator writes.
- Compact modules reserve y22–33 for live values; recommended overlay anchor:
  `valueDisplay = {x: width / 2, y: 29}`.
- Compact pin labels use 7-unit high-contrast white text rotated −90 degrees
  over a dark strip. Each pin's data coordinates and electrical ID are preserved.
- LCD/TFT/e-paper/touch panel windows use their manifest `display` rectangles.
- Validation is limited to the regenerated assets: SVG XML, viewBox, connector
  anchors and display rectangles. No previous simulator test suite is run by
  this artwork workflow.

## Bounded second reference pass

The following primary product/manufacturer documents were additionally opened
or located in the follow-up pass. A package datasheet is not a module photograph.
Product-page image captions and module descriptions were inspected; where an
image/PDF fetch failed, that limitation is stated rather than claiming a full
pixel-level visual comparison. Not every commercial clone has one canonical PCB.

| Expansion IDs | Additional primary reference | Inspection/physical cue |
| --- | --- | --- |
| tact6 | [Adafruit 367](https://www.adafruit.com/product/367) | Four-legged square tact housing; metal cover and central actuator. |
| segment1 | [Kingbright SA56 package drawing](https://www.kingbrightusa.com/images/catalog/spec/sa56-11ewa.pdf) | Seven-segment package silhouette only; SA56 is common-anode, not the simulator's common-cathode electrical profile. |
| segment4 | [Adafruit 865](https://www.adafruit.com/product/865) | Dark four-digit molded display body. |
| ledbar | [Adafruit 1816](https://www.adafruit.com/product/1816) | Ten-window rectangular light bar; color variants differ. |
| rgbled | [Kingbright RGB package](https://www.kingbrightusa.com/images/catalog/spec/WP154A4SUREQBFZGC.pdf) | Indexed manufacturer drawing; direct PDF fetch failed. Package reference only, not a pin/polarity substitution. |
| lcd20p, lcd20 | [Adafruit parallel 20x4](https://www.adafruit.com/product/198), [DFRobot I2C 20x4](https://www.dfrobot.com/product-590.html) | Long metal-framed blue display over PCB; I2C backpack differs from bare parallel module. |
| buzzerActive | [Joy-IT KY-012](https://www.joy-it.net/de/products/COM-KY012APB) | Central round sounder and three terminal pads. |
| buzzerPassive | [Joy-IT KY-006](https://sensorkit.joy-it.net/en/sensors/ky-006) | Round passive sounder; simulator intentionally models a bare two-terminal piezo. |
| dcmotor | [Adafruit 130 motor](https://www.adafruit.com/product/711) | Metal can, end cap, projecting shaft and two terminals. |
| tb6612 | [SparkFun manufacturer carrier](https://www.sparkfun.com/sparkfun-motor-driver-dual-tb6612fng-1a.html) | Driver IC on compact breakout; simulator uses a generic terminalized carrier, not an exact SparkFun PCB. |
| optocoupler | [Sharp PC817](https://jp.sharp/products/device/doc/opto/PC817XxNSZ1B_j.pdf) | Four-lead optocoupler package; corrected previous decorative multi-lead IC drawing to four physical leads. |
| pnp | [onsemi P2N2907A](https://www.onsemi.com/pdf/datasheet/p2n2907a-d.pdf) | Three-lead TO-92 package drawing; profile remains generic PNP. |
| pmos | [Vishay IRF9540](https://www.vishay.com/docs/91078/91078.pdf) | TO-220 tab, screw hole and three leads; profile remains generic P-MOS. |
| aht20 | [Adafruit 4566](https://www.adafruit.com/product/4566) | Ventilated environmental sensor package. |
| ds3231 | [Adafruit 3013](https://www.adafruit.com/product/3013) | RTC breakout with backup-cell hardware cue. |
| adxl345 | [Adafruit 1231](https://www.adafruit.com/product/1231) | Central square accelerometer and axis markings. |
| water, rain | [DFRobot SEN0121](https://www.dfrobot.com/product-798.html) | Exposed conductivity trace surface. Water/rain SVG patterns are distinct generic variants, not the exact same board. |
| soilProbe | [Seeed moisture probe](https://wiki.seeedstudio.com/Grove-Moisture_Sensor/) | Two exposed long sensing prongs. |
| ads1115 | [Adafruit 1085](https://www.adafruit.com/product/1085) | ADC IC, passives and labeled breakout header. |
| mcp4725 | [Adafruit 935](https://www.adafruit.com/product/935) | Small DAC IC and address selector. |
| pcf8574 | [Adafruit 5545](https://www.adafruit.com/product/5545) | GPIO IC on a labeled breakout. |
| pca9685 | [Adafruit 815](https://www.adafruit.com/product/815) | Sixteen three-pin output headers, controller and power terminals. |
| cd4067 | [TI CD74HC4067](https://www.ti.com/product/CD74HC4067) | Long multilead IC package; simulator is generic breakout, not TI EVM. |
| levelShift | [SparkFun MOSFET carrier](https://www.sparkfun.com/sparkfun-logic-level-converter-bi-directional.html) | Repeated small transistor channels and LV/HV sides. |
| fram | [Adafruit 1895](https://www.adafruit.com/product/1895) | Central memory IC, header and address pads. |
| spiFlash | [Winbond serial NOR family](https://www.winbond.com/hq/product/code-storage-flash/qspi-nor/) | Serial memory IC/package reference, not a specific breakout photo. |
| sdCard | [Adafruit 254](https://www.adafruit.com/product/254) | Metal microSD socket, card opening and support components. |
| vl53l0x | [Adafruit manufacturer guide](https://learn.adafruit.com/adafruit-vl53l0x-micro-lidar-distance-sensor-breakout?view=all) | Separate optical emitter/receiver windows. |
| ina226 | [TI INA226](https://www.ti.com/product/INA226) | Current-monitor IC/package source; large shunt in SVG represents a generic external breakout assembly. |
| max30102 | [Analog Devices MAX30102](https://www.analog.com/en/products/max30102.html) | Integrated optical LED/photodiode window; no medical-model implication. |
| ili9341 | [Adafruit 2478](https://www.adafruit.com/product/2478) | Tall framed color panel, flex interconnect and backing PCB. |
| xpt2046 | [BuyDisplay XPT2046 document](https://www.buydisplay.com/download/ic/XPT2046.pdf) | Manufacturer-hosted controller datasheet indexed; direct fetch failed. The SVG is generic resistive glass, not an independently verified exact module. |
| epaper | [Good Display GDEY029T94](https://www.good-display.com/product/389.html) | White reflective rectangular 296x128 panel and flex tail. |
| irEmitter | [Vishay TSAL6200](https://www.vishay.com/docs/81010/tsal6200.pdf) | Two-lead domed optical emitter package. |
| irReceiver | [Vishay TSOP382](https://www.vishay.com/docs/82491/tsop382.pdf) | Three-lead dark demodulator body and rounded optical face. |
| rs485 | [TI SN65HVD75](https://www.ti.com/product/SN65HVD75) | Transceiver IC/package reference; SVG adds generic line terminal block. |

## Existing catalogue module reference pass

The inventory was obtained by importing `CATALOG` from `dist/core.js`, excluding
`EXPANSION_MODULES`, board/breadboard, discrete/passive parts, virtual wiring
labels and virtual instruments. The resulting existing module/device list is:

`bluetooth`, `coilRelay`, `hc595`, `hc165`, `ina219`, `max6675`, `mcp23s17`,
`tft7735`, `tft7789`, `hc4050`, `ws2812`, `stepper28byj`, `l298n`, `loadcell`,
`dht11`, `dht22`, `hx711`, `tm1637`, `ky040`, `keypad4x4`, `lm35`, `mq2`,
`flame`, `sound`, `pir`, `irObstacle`, `tilt`, `hall`, `joystick`, `thermistor`,
`soilCap`, `hcSr04`, `servo`, `sht31`, `bh1750`, `mpu6050`, `mcp23017`,
`lcd8p`, `lcd16p`, `lcd8`, `lcd16`, `bmp280`, `mcp3008`, `ds18b20`, `matrix8`,
`digits8`, `tmp36`, `ldr`, `mhz19`, `sensor`, `relay`, `oled`, `eeprom`, `rtc`.

This is an inventory, not a claim that every entry's exact clone PCB was matched.
The following priority references were opened in this bounded pass:

| Existing IDs | Primary reference | Physical cue / limitation |
| --- | --- | --- |
| oled | [Adafruit SSD1306 326](https://www.adafruit.com/product/326) | Black glass, rectangular pixel area and backing PCB. |
| rtc | [Adafruit DS1307 guide](https://learn.adafruit.com/ds1307-real-time-clock-breakout-board-kit) | Coin-cell holder, crystal and RTC IC. |
| eeprom | [Microchip 24LC256](https://www.microchip.com/en-us/product/24LC256) | IC/package reference, not a branded breakout. |
| lcd8p, lcd16p, lcd8, lcd16 | [Seeed character LCD catalogue links](https://wiki.seeedstudio.com/Grove-4-Digit_Display/), [Adafruit LCD backpack](https://www.adafruit.com/product/292) | Seeed page links both 8x2 and 16x2 modules; backpack and parallel connector are distinct. Individual linked 8x2/16x2 pages were not separately opened in this pass. |
| mpu6050 | [Adafruit 3886](https://www.adafruit.com/product/3886) | Square IMU IC, axis legend and labeled header. |
| bmp280 | [Adafruit BMP280](https://learn.adafruit.com/adafruit-bmp280-barometric-pressure-plus-temperature-sensor-breakout) | Small metal environmental sensor package. |
| sht31 | [Adafruit SHT31-D](https://learn.adafruit.com/adafruit-sht31-d-temperature-and-humidity-sensor-breakout) | Small ventilated humidity package. |
| bh1750 | [Adafruit 4681](https://www.adafruit.com/product/4681) | Small optical sensor window on breakout. |
| ina219 | [Adafruit INA219](https://learn.adafruit.com/adafruit-ina219-current-sensor-breakout) | Current shunt, monitor IC and power terminal connections. |
| max6675 | [Analog Devices MAX6675](https://www.analog.com/en/products/max6675.html) | IC/package reference; thermocouple terminal block is generic module design. |
| mcp23017, mcp23s17 | [Microchip MCP23017](https://www.microchip.com/en-us/product/MCP23017), [MCP23S17](https://www.microchip.com/en-us/product/MCP23S17) | Long multilead GPIO IC packages. |
| hc595, hc165 | [TI SN74HC595](https://www.ti.com/product/SN74HC595), [TI SN74HC165](https://www.ti.com/product/SN74HC165) | 16-pin logic package reference. |
| servo | [Adafruit TowerPro SG92R](https://www.adafruit.com/product/169) | Compact servo case, output horn, mounting ears and cable. |
| hcSr04 | [Seeed ultrasonic ranger](https://wiki.seeedstudio.com/Grove-Ultrasonic_Ranger/) | Twin metal acoustic transducers; this is a related manufacturer ranger, not an HC-SR04 exact PCB match. HC-SR04 primary product lookup remained unresolved. |
| dht11, dht22 | [Adafruit DHT11](https://www.adafruit.com/product/386), [DHT22](https://www.adafruit.com/product/385) | Slotted blue versus white humidity housings. |
| tm1637 | [Seeed TM1637 module](https://wiki.seeedstudio.com/Grove-4-Digit_Display/) | Four red digits and serial connector; Grove connector differs from generic clone header. |
| hx711 | [SparkFun HX711](https://www.sparkfun.com/sparkfun-load-cell-amplifier-hx711.html) | ADC IC and separate bridge-side terminals. |
| ws2812 | [Adafruit 8-pixel stick](https://www.adafruit.com/product/1426) | Eight square 5050 LED packages on narrow chainable PCB. |
| l298n | [DFRobot dual motor controller](https://www.dfrobot.com/product-66.html) | Motor terminal block assembly; not a one-to-one common red L298N clone match. |
| stepper28byj | [DFRobot 28BYJ-48 assembly](https://www.dfrobot.com/product-2979.html) | Round geared motor and mounting ears; source uses A4988, so it is NOT evidence for ULN2003 wiring or board layout. |
| tft7735, tft7789 | [Adafruit ST7735R 358](https://www.adafruit.com/product/358), [ST7789 3787](https://www.adafruit.com/product/3787) | Tall versus square color glass, flex and PCB backing. |
| joystick | [SparkFun thumb joystick](https://www.sparkfun.com/thumb-joystick.html) | Rubber cap, metal gimbal and perpendicular potentiometer bodies. |
| pir | [Adafruit PIR](https://www.adafruit.com/product/189) | White faceted Fresnel dome over sensor PCB. |
| mq2 | [Winsen MQ-2](https://www.winsen-sensor.com/product/mq-2.html?by=mq-sensor) | Metal mesh cylindrical gas can; external comparator carrier varies. |

No existing non-expansion SVG was modified in this reference pass. Remaining
existing inventory entries have no new per-SKU photo audit here. A bounded
source audit does not establish exact geometry, electrical equivalence or full
manufacturer-library compatibility.

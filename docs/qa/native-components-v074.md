# 0.74 yeni C bileşen matrisi

Profil sütunları: ESP32-C3 / STM32F103C8 / TM4C123GH6PM. Her satırın doğrulaması aynı senaryonun her CPU için ayrı C17 derlemesinden gelir. Bu matris bütün protokol varyantlarını kapsamaz. Sonuç kaynağı: tests/native-components-v074.test.mjs.

| Bileşen | Yeni davranış senaryosu |
| --- | --- |
| netLabel | GPIO contact, breadboard and net label propagation |
| bluetooth | Virtual Bluetooth receives code-generated UART byte |
| signalgen | Signal generator drives actual C input |
| multimeter | LED, resistor and meters reflect compiled GPIO |
| ohmmeter | LED, resistor and meters reflect compiled GPIO |
| switch | GPIO contact, breadboard and net label propagation |
| rheostat | Analog inputs are read through a real SPI ADC |
| coilRelay | Relay contacts and physical coil energize |
| diode | Diode and zener clip GPIO voltage |
| zener | Diode and zener clip GPIO voltage |
| hc595 | 74HC595 real latch and output |
| hc165 | HC165 parallel input shifts into C |
| ina219 | INA219 real analog sense, conversions and bytes |
| max6675 | MAX6675 temperature arrives through C SPI |
| mcp23s17 | MCP23S17 SPI output |
| tft7735 | tft7735 SPI draws real RGB565 pixel |
| tft7789 | tft7789 SPI draws real RGB565 pixel |
| hc4050 | HC4050 level buffer |
| ws2812 | WS2812 timing-coded C frame controls actual RGB |
| stepper28byj | Stepper real winding currents and movement |
| l298n | L298 bridge responds and reverses |
| loadcell | HX711 clocks load-cell measurement into C |
| dht11 | dht11 real C request gets sensor response |
| dht22 | dht22 real C request gets sensor response |
| hx711 | HX711 clocks load-cell measurement into C |
| tm1637 | TM1637 display through bidirectional 5 V level shifters |
| ky040 | KY040 quadrature and switch are actual C inputs |
| keypad4x4 | Keypad contact read by compiled C |
| lm35 | Analog inputs are read through a real SPI ADC |
| mq2 | Analog inputs are read through a real SPI ADC |
| flame | Analog inputs are read through a real SPI ADC |
| sound | Analog inputs are read through a real SPI ADC |
| pir | Digital environmental inputs really reach C |
| irObstacle | Digital environmental inputs really reach C |
| tilt | Digital environmental inputs really reach C |
| hall | Digital environmental inputs really reach C |
| joystick | Analog inputs are read through a real SPI ADC |
| thermistor | Analog inputs are read through a real SPI ADC |
| soilCap | Analog inputs are read through a real SPI ADC |
| hcSr04 | HC-SR04 trigger creates safely divided echo read by C |
| servo | Servo pulse drives visible angle |
| sht31 | SHT31 measures and returns checksummed C response |
| bh1750 | BH1750 conversion returns light level |
| mpu6050 | mpu6050 returns identity through real C GPIO I2C; MPU6050 interrupt is an actual MCU-readable line |
| mcp23017 | MCP23017 output actually reaches MCU input |
| lcd8p | lcd8p |
| lcd16p | lcd16p |
| lcd8 | lcd8 |
| lcd16 | lcd16 |
| bmp280 | bmp280 returns identity through real C GPIO I2C |
| mcp3008 | Analog inputs are read through a real SPI ADC |
| ds18b20 | DS18B20 ROM and scratchpad reach compiled C |
| matrix8 | matrix8 MAX7219 real C SPI with level buffers |
| digits8 | digits8 MAX7219 real C SPI with level buffers |
| tmp36 | Analog inputs are read through a real SPI ADC |
| ldr | Analog inputs are read through a real SPI ADC |
| mhz19 | MH-Z19 valid request from C software UART |
| opamp | Opamp comparator output |
| capacitor | compiled C drives time-integrated RC/RL and reset |
| inductor | compiled C drives time-integrated RC/RL and reset |
| breadboard | GPIO contact, breadboard and net label propagation |
| led | LED, resistor and meters reflect compiled GPIO |
| resistor | LED, resistor and meters reflect compiled GPIO |
| button | GPIO contact, breadboard and net label propagation |
| pot | Analog inputs are read through a real SPI ADC |
| npn | Transistor and MOSFET switch real collector/drain |
| mosfet | Transistor and MOSFET switch real collector/drain |
| sensor | Analog inputs are read through a real SPI ADC |
| relay | Relay contacts and physical coil energize |
| spdt | GPIO contact, breadboard and net label propagation |
| oled | OLED writes pixel RAM |
| eeprom | EEPROM persists written byte |
| rtc | DS1307 RTC across real MOSFET level translators |
| supply | INA219 real analog sense, conversions and bytes |

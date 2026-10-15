# QA 0.17 — modüller / bus / analog

10 Ekim 2026, manuel kullanıcı isteği. Zamanlanmış görev oluşturulmadı. Başlangıç primary used0%, resetsAt1791654746. Yayın kimliği .openai/hosting.json içinde korunur.

## Otomatik kabul

`npm run build` ve `npm test`: 241 test, 0 başarısız (207 önceki +34 yeni). Yeni kapsam tests/expanded.test.mjs ve expanded-protocols.test.mjs. Eski Uno/pin alias/DC/PWM/transistor/montaj/kablo/ZIP/derleyici/cache testleri korunur.

- 12 şablon gerçek C++ kaynak eşleşmesi, validasyon ve Uno flash/SRAM kabulü. NaN/Infinity, C/L/ESR/DCR, sıcaklık/basınç/ppm/lux/adres aralıkları reddedilir.
- Opamp/C/L/MCP3008/DS18B20/TMP36/LDR dört breadboard yönünde tüm bacaklar delik merkezinde ve ayrı bus şeritlerinde; gövde/delik denetimi korunur.
- PCF8574 gerçek Wire LCD8 iki satır, LCD16 TMP36 güncellemesi; güç/SDA kaybı ACK yok. DDRAM/CGRAM/clear/busy/shift, iki nibble readback; I²C adresi ile cursor adresi ayrı.
- MAX7219 register/shutdown/CodeB/test, gerçek SPI matris/hane; CLK/DIN takası/LOAD/güç kopukluğu başarılı display oluşturamaz. GPIO shiftOut bit-bang aynı controllerda.
- MCP3008 CH0 pot60%614→25%256; DOUT kopunca MCU veri alamaz. Gerçek SPI loopback mode0/1/2/3, iki bit sırası; SS INPUT LOW masterbitini düşürür/SPIF. GPIO clock/MOSI ve MISO fiziksel nets üzerinden.
- Bosch reference519888/415148→25.08°C/100653.27Pa; forced delay. Gerçek Wire25.00°C1013.25hPa→−10°C800hPa. RawBMP5V besleme NACK. SPI3.3V resistor divider: ID58,CTRL24,RAWT519625; iki adapter aynı register durumunu paylaşır.
- DS18B20 ROM/scratch CRC, negatif çözünürlük, dış besleme/reset/presence/slotlar; gerçek ROM Search CRC1/FAMILY28. Gerçek firmware25°C→−12.5°C; VDD/DQ/pullup yokluğunda doğru scratch cevap yok.
- USART0 CO₂FF0186/checksum→800/1500ppm. Güç/RX/format kaybında sahte cevap yok; iki sensör ortakRX/TX çakışma olarak bildirilir.
- LDR eğrisi gerçek ADC512→853; LM358 follower/gain2/rail saturation ve beslemesiz/floating input. Kazanç devresi1.5V→AVRADC307.
- RC/RL analitik tek zaman sabiti 500 companion adımda <%0.2 hata; timestep stamp geçmişi değiştirmez. Gerçek RC monoton şarj/deşarj; ADC sample ve GPIO arası çözüm. RC/L enerji düzenlemede korunur, yeni runtime/reset sıfır. RL49.5mA. 10µs alt sınırı bayrağı.
- Yayın workerı SPI/1Wire/UART/reactive paketleri, ölçüm ve reset; birleşik Bus CSV gerçek cycle sırası/kaçış.

## Gerçek GCC derlemeleri

`node scripts/check-expanded-projects.mjs`; pinned AVR-GCC WASM0.2.0, gerçek compiler/linker/objcopy. tests/fixtures/expanded-projects.json bağımsız derlenmiş sonuçları içerir.

| Örnek | Flash B | Statik SRAM B |
| --- | ---: | ---: |
| LCD8 | 6036 | 368 |
| LCD16/TMP36 | 8314 | 434 |
| MAX7219 matris | 2940 | 170 |
| MAX7219 sekiz hane | 2974 | 170 |
| BMP280 | 8260 | 392 |
| MCP3008 | 2802 | 170 |
| DS18B20 | 4918 | 166 |
| MH-Z19B | 2522 | 166 |
| LDR | 2334 | 194 |
| LM358 | 2334 | 194 |
| RC | 2818 | 198 |
| RL | 2818 | 198 |

`node scripts/check-expanded-protocols.mjs`: SPI4mod/2order2610/170; BMP SPI3274/170; bit-bang1074/9; ROM Search3290/166. StatikSRAM heap/stack zirvesi değildir. 1-Wire örneği zaman slotlarında interruptları kapatır; ROM/scratch CRC gerçek pin seviyelerinden okunur.

## Tarayıcı

Kullanıcının public Studio/roadmap sekmelerine dokunulmadı; ayrı localhost4173 QA sekmesi. Önceki çevrimdışı shell açık olduğundan yalnız bu yerel QA origininde online moda geçilip güncel kaynak yüklendi; compiler550dosya doğrulanmış cache korundu.

- 28 parçalık kütüphane ve 29 örnek. Tarayıcı gerçek GCC: LCD16 8314B, canlı CircuitForge/Temp24.7°C. TMP36 panel25→50°C, duraklat/devam sonrası LCD49.6°C; 10-bitADC quantization.
- SPIhane gerçek derleme; canlı segmentler, SPI1MHzTX/RX Bus satırları ve bağlı controller. ADC DIP16 otomatik kanal montajı, CH0=614 terminal/inspector.
- BMPID58,T25.00/P1013.25; DS18B20 CRC doğrulanmış25.00°C; CO₂800ppm (nativeUART binary request terminalde de görünür).
- LM358 montaj/gerçekADC307; panel OUT1=1.500Vlinear, OUT2=.020Vlow. RC gerçek UP/DOWN dizisi, pozitif/negatif dal akımı; panel örneğinde1.03V/−1.09mA. RL panel49.50mA/.05V ve.123mJ.
- User tercihi az yazılı tek ekran düzeni; gerçek Uno/32pin, segmenttel, source/terminal/measurement korunur. Ayrı browser kontrolünde bir geçici timeout oldu; aynı test sekmesinde mevcut durumla kontrol devam edip tamamlandı.

## Kapsam

Tam SPICE/AC/thermal/slew/currentlimit yok; C/L bounded10µs…1ms yaklaşımı. LCDASCII/CGRAM çizimi, tamROM/cursor görünümü yok. I²C transaction, SPI master/edge, 1-Wire externalVDD, USART0 byte transport. CAN/RS485/USB/Ethernet, I²C bitclock/MCUslave/multimaster ve diğer kartlar devam planına yazıldı. Ayrıntılar dist/notices/COMMUNICATION-MODELS.md / ANALOG-REACTIVE-MODELS.md / EXPANDED-MODULES.md.

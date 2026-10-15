# MCP23S17 · 0.24

Microchip SPI GPIO genişletici; gerçek SPDIP28 pinleri, 16 çift yönlü GPIO (A7/B7 dahil), VDD1.8–5.5V/VSS, dış address/reset bias. Eski MCP23017 revizyonundaki A7/B7 yalnız çıkış modeli korunur; ortak controller inputMask parametresiyle ayrılır.

SCK yükselen/SI MSB, CSLOW opcode40/41 + register + data; SO sonraki bit düşen kenarda sonlu50Ω. CSHIGH SOHi-Z, incompletebyte atılır. HardwareSPI mode0 veGPIO bit-bang aynıDCnets; mode3 rising sample/falling output davranışı. Chip datasheet5/10MHz limiti metadata'da; bu ilkmodelde ns timing/speed-limit reddi henüz yok. Opcode sabit0100, HAEN fizikselA2/A1/A0match; HAENoffaddressbitsignored, straplarherdurumbiasgerektirir.

BANK/SEQOP, IODIR/IPOL/GPPU/GPIO/OLAT; GPINTEN/DEFVAL/INTCON, INTF/INTCAP; MIRROR/ODR/INTPOL. İki100kΩpullupport, tümçıkış/IRQ50Ω driver actualnets→LEDload/ADC/Unoinput. GPIO/INTCAP okumaları yalnız tam8bit data gönderilince IRQtemizler; adresprefetch veyaabort clearüretmez. Reading byte value addressfazındalatch, pad değişirse sonrakibytegörür.

Besleme/RESET/overvoltage/floatingpins kontrolü; VDD gerçekpozitifraile fizikseliz sürer ve kendi/cyclic outputfeedenerjiyi koruyamaz. Başka doğrulanmış GPIOkaynağı üzerindenbesleme mümkündür. RESET/güçkaybıregisterreset. GPIOcurrentlimit/thermal/negativeinputdamage ve exactns resetpulse/slewrate modeli henüz yok. Birdenfazla SOaktifçakışması DCsource/finiteoutputağında çözülür; conflict-freeaccess firmwareaddress/CS gerektirir.

Nativeörnek LED330Ωyük/GPA0→ADC, GPB7internalpullup→pasifbuton, INTB→D2; UART B128/IRQ1 ve basış B0/IRQ0/FLAGS128. Breadboardotomontaj28ayrıstrip.

[Microchip MCP23017/MCP23S17 DS20001952C](https://ww1.microchip.com/downloads/en/DeviceDoc/20001952C.pdf); güncelhardwarepin doğrulaması [DS20001952D](https://ww1.microchip.com/downloads/aemDocuments/documents/APID/ProductDocuments/DataSheets/MCP23017-Data-Sheet-DS20001952.pdf).

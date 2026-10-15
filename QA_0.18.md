# CircuitForge 0.18 kabulü · 10 Ekim 2026

## Uygulama

4yeni cihaz,5yeni örnek; toplam32parça/34örnek. OrtakI²Cregistry + önceki OLED/EEPROM/RTC/LCD/BMP uyumluluğu. MCU kaynakları, gerçeknetlist ve pinalias'ları korunur. DIP28 otomatik montaj; büyük DIP pin listesi panelde kompakt, tam eşleme title'da.

## Otomatik / gerçek firmware

`npm run build` ve `npm test`:264pass/0fail,23yeni sensor testi. `node scripts/check-sensor-projects.mjs`:8gerçek pinnedGCC derlemesi; fixtureproject/source/HEX testi ve Uno flash/SRAM sınırları.

| Örnek/fixture | Flash bayt | Statik SRAM bayt | Kabul |
|---|---:|---:|---|
| SHT31 |7226|368|25°C50%→−10°C90%, CRC, cycle conversion |
| BH1750 |6926|368|500lx→41.7lxquantized, raw/MT/one-shot |
| MPU6050 |7900|368|signedaxes/range/temp, WHO68, pinINT |
| MCP23017 |5948|369|GPIO3/2, LED7.8947mA, buttonGPIO1/0 |
| Üç sensör |8112|368|SHT+BH+MPU birlikte gerçekWire |
| Adres tarama |4266|368|strap23/44/68→45/5C/69 |
| Hızlı feedback |5654|408|32edge0:2:1:943 ve0:2:0:0; frame/update yok |
| MPU FIFO |5632|368|18byteacquisition/Z16384/pop/reset0 |

Unit/protocol: SHTCRC/BUSY/fetch/status/softreset, BHnominaldelay/MT/saturation/reset, MPUrange/burst/latch/pulse/OD/FIFOoverflow, MCPBANK/SEQOP/OLAT/load/IPOL/INTCAP/DEFVAL/mirror/pullup. MCPcurrentRevEbit7outputonly ve4boardorientation28distinctstrips. Güç/ground/bus/strap kopukluğu, raw5V veIOovervoltage/frequencyNACK. Driver kaynaközyinelemesi phantom self/cyclicfeed'i reddeder; GPIO başka cihazı besleyebilir. UI/DC/LED/branchmeasurepacket gerçekdriverresultlarıyla eşleşir.

## Tarayıcı

Codex in-app browser, ayrılocalhostQAsekmesi; publicuserStudio'ya dokunulmadı. Gerçek tarayıcıGCC ile üç sensör veMCPfirmwarederleme çalıştı. SHTparametreleriUI−10°C90%RH→terminalaynı, MPUGX90°/s→firmwareG90.0, çıktıkoherent. MCPbutonaBas→GPIO3/2'den1/0'a; mountedDIP28D1…14/F1…14,90°; bus/model bağlı. Son0.18ekranı CircuitForge-0.18.png.

## Sınırlar

I²Ctransactionmodel, stretching yok. SHTALERT/ART/ısılheater yok. BHidealoptik/noiseyok. MPUDMP/aux/filtre/lowpowercycle/oscillator yok; FIFO seçiliblockler. MCPfinite50ΩDC/100kpullup; fizikselcurrentlimit/hasar/noise yok. Ayrıntılar dist/notices/SENSOR-MODELS.md veSENSOR-HARDWARE.md. CAN/RS485/SPI TFT/MAXkaskat sonraki plandadır.

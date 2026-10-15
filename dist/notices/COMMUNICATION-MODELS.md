# Haberleşme / ekran / sensör kapsamı · 0.18

Tüm cihazlar gerçek firmware komutlarından beslenir; kaynak kodu metnini inceleyerek sonuç uyduran bir yol yoktur. Besleme ve sinyaller canonical devre netlerinden okunur. Aşağıdaki model sınırları donanım özellikleriyle karıştırılmamalıdır. Çizim/pin kaynakları [EXPANDED-MODULES.md](./EXPANDED-MODULES.md).

| Altyapı | Çalışan cihazlar | Kapsam |
| --- | --- | --- |
| Uno TWI / I²C master | SSD1306, 24LC256, DS1307, LCD8×2/LCD16×2 PCF8574, BMP280, SHT31, BH1750, MPU6050, MCP23017 | SCL frekansına bağlı START/adres/ACK/veri/STOP çevrimleri; repeated START; besleme/kablo/adres kontrolü. 0.28: elektriksel açık drenaj bit kenarları ve SHT31 stretching. MCU slave, GPIO bit-bang, RC rise-time ve multi-master ayrı aşama; [hat modeli](./I2C-LINES-MODEL.md). |
| Uno SPI master | MAX7219 matris/haneli ekran, MCP3008, BMP280 | SPCR/SPDR/SPIF, mode0–3 ve MSB/LSB; gerçek CLK/MOSI GPIO kenarları, MISO DC çözümünden. SS giriş LOW master kipini düşürür. Kenar olayları AVR instruction sınırında işlenir; nominal hızlı SPI zamanları instruction quantization içerir. MCU slave henüz yok. |
| GPIO / 1-Wire | DS18B20 | Açık drenaj benzeri 100 Ω sink, gerçek pullup/devre girişi, reset/presence/read/write slotları, ROM Read/Match/Skip/Search/Alarm Search, CRC ve 9–12 bit conversion delay. Dış VDD gerekir; parasite power/strong pullup yok. EEPROM copy/recall ideal anlıktır. |
| USART0 / UART | MH-Z19B | Gerçek AVR USART byte framing ve RX interrupt zamanlaması, 9600 8N1, 0x86 request/reply ve checksum. RX/TX bağlantısı/besleme/format denetlenir. Bir hatta iki sensör çakışma olarak bildirilir; sahte sıralı cevap üretilmez. UART pin dalgaları/SoftwareSerial ve fiziksel NDIR ısınması ayrı kapsam. |
| Analog direnç / gerilim | TMP36, genel LDR, MCP3008 girişleri | DC ağından gerçek ADC; TMP36 0.5+0.01T V, beslenen ideal kaynak. LDR `10000*(100/lux)^0.7 Ω` seçilmiş genel eğri; üretici kalibrasyonu/gürültü değil. |

## Cihaz ayrıntıları

- LCD: PCF8574 0x20…0x27, 100 kHz; ortak P0 RS/P1 RW/P2 E/P3 BL/P4…7 D4…7 mapping. E düşüşünde gerçek 4-bit latch; DDRAM/CGRAM, shift, clear/home/busy, giriş yönü; iki nibble busy/data read. Canvas ASCII 32…126 ve sekiz CGRAM 5×8 karakter çizer. Tam Japon ROM fontu, cursor/blink çizimi ve farklı backpack bit mapping'leri henüz yok.
- MAX7219: CLK yükselişi ve LOAD yükselişi; son16 bit latch, digit/decode/intensity/scan/shutdown/test registerları. Canvas parlaklığı registerdan gelir. ISET, güç akımı, multiplex dalgaları ve DOUT kaskadı yok.
- MCP3008: 0.29 sample/hold 1.5 gerçek clock, 20 pF / 1 kΩ bounded RC ve dirençli kaynağın Thevenin empedansı. 10 bit clipping, cycle acquisition ve timing invalid tanısı. Pin kapasitansı/charge injection/MNA yük akımı, nonlinear/reaktif kaynaklar ve tam pseudo-differential model yok. Ayrıntılar [ADC-ACQUISITION-MODEL.md](./ADC-ACQUISITION-MODEL.md).
- BMP280: gerçek ID 0x58, compensation trim, ham P/T registerları, oversampling/mode/status/config/reset, forced/normal conversion zamanları ve latched çoklu read. I²C ve SPI aynı register denetleyicisini paylaşır. Basınç/hava girdileri 300…1100 hPa ve −40…85 °C; sabit örnek triminden Bosch compensation denklemini tersleyerek ham değer üretilir. Gürültü/IIR filtre fiziksel yaklaşımı ve SPI 3-wire yok. Raw VDD/VDDIO ortak VCC, 1.71…3.6 V; 5 V besleme kabul edilmez. 5 V SPI sinyaline IO uyarısı var; örnek SPI doğrulaması resistor level division kullanır.
- DS18B20: ilk scratch 85 °C, conversion sonunda parametre sıcaklığı, çözünürlüğe göre bit maskeleme, scratch/ROM CRC8. ID bileşen kimliğinden deterministic oluşturulur; fabrikadan alınmış fiziksel seri numarası değildir.
- MH-Z19B: seçili ideal ortam ppm değeri 0x86 cevabında; 20 ms cevap gecikmesi model tercihi, tüm gerçek cihazlar için garanti değil. Kalibrasyon/ABC/range/PWM/DAC komutları yok. [Winsen UART protokolü v1.5](https://www.winsen-sensor.com/d/files/MH-Z19B.pdf) request/checksum kaynağıdır; [v1.7](https://www.winsen-sensor.com/d/files/manual/mh-z19b.pdf) besleme/pin kaynağıdır.

Bus paneli son240 I²C işlem ve son240 diğer bus kaydını tutar; worker tarafı SPI/UART için128, 1-Wire için256 kayıt bounded buffer kullanır. CSV gerçek cycle ekseninde bütün bus kayıtlarını birleştirir. Görünüm tüm geçmişin kayıpsız kalıcı protokol kaydı değildir.

CAN, RS485/RS232 fiziksel transceiver, USB, Ethernet ve hedefe özgü diğer çevre birimleri henüz uygulanmadı. Bu ailelere cihaz eklemeden önce ilgili denetleyici/transport modeli ve gerçek firmware kabulü gereklidir; yalnız pinout yeterli değildir.

0.18 sensör/register/besleme/GPIO model sınırları: [SENSOR-MODELS.md](./SENSOR-MODELS.md). MPU/MCP interrupt ve GPIO kaynakları gerçek DC ağına bağlıdır.

0.30: USART TX/RX gerçek pad çerçeveleri ve SoftwareSerial GPIO yolu eklendi. [Kart/UART sınırları](./BOARD-UART-MODELS.md). Uno, Nano, ProMini aynı ATmega328P taşımalarını paylaşır.

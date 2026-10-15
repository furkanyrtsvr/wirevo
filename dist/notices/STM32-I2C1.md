# STM32 donanım I²C1 · CircuitForge 0.48

Dokuz F103/F401/F411 kartında gerçek Clang C17 firmware ve Cortex-M3/M4F motoruyla legacy I²C1 standard-mode7-bit master çalışır. SDA/SCL gerçek elektriksel açık drenaj hatlarıdır: sensörün beslemesi, adresi, ACK/NACK, CRC ve kablosu sonucu etkiler. Veriler doğrudan sensor-controller çağrısıyla verilmez.

## Pin penceresi ve C API

PB7→I2C1_SDA ve PB6→I2C1_SCL birlikte seçilir. PB9/PB8 alternatifi F103 MAPR remap, F4 AF4 ile çalışır; F103 iki sinyal aynı remap grubunda olmalıdır. Bir sinyal iki pine atanamaz. Donanım I²C1 hızı10/50/100kHz seçilir; ayarlar yalnız açık projede saklanır. Uygula öncesi taslaktır. main.c üretilen başlangıç ayarlarını sonradan değiştirebilir.

- `int cf_i2c1_begin(unsigned hz,unsigned sda,unsigned scl)`: AF açık drenaj/RCC/timing kurar;10..100kHz, geçersizde−1, başarı0. Startup PCLK1 F10336MHz/F40142MHz/F41150MHz; CCR yuvarlanır, istenen hız aşılmaz. Haricî pull-up gerekir (SHT31/OLED modüllerinde model pull-up bulunur); GPIO internal pull-up otomatik eklenmez.
- `int cf_i2c1_write(unsigned address,const unsigned char *data,unsigned n)` ve `cf_i2c1_read(unsigned address,unsigned char *data,unsigned n)`:7-bit adres ve1..1024bayt; başarıda bayt sayısı, hata/timeout−1. Her çağrı START→adres→baytlar→STOP işlemini tamamlar. Her bekleme için5ms sınır; CRC kontrolü sensör sürücüsünde yapılır.
- `int cf_i2c1_recover(void)`: çevrebirimi bırakır, seçili pinlerde9 GPIO SCL darbesi ve STOP üretir, clock/data serbestliğini okur ve önceki hızı yeniden kurar. Hattın hâlâ fiziksel olarak düşük tutulması−1 döndürür. Başarısız transferler bu yolu kullanır; yeniden bağlantı denenebilir.

Yeni çevre istasyonu SHT31, OLED ve alarm kayıt EEPROM bileşeni için donanım I²C1, MCP3008 için donanım SPI1 kullanır. Eski küçük cf_bus.c örnekleri ve kaydedilmiş kullanıcı projeleri otomatik dönüştürülmez. Soft→hardware görev değişiminde kullanıcı çağrıları cf_i2c_write(&cf_i2c1,...) yerine cf_i2c1_write(...) ve cf_i2c_read yerine cf_i2c1_read yapmalıdır; pin penceresi kullanıcı main.c kaynağını değiştirmez.

## Register ve kesmeler

I2C1 base0x40005400/APB1/RCCbit21; F1 GPIO AF open-drain/MAPRbit1, F4AF4/MODER2/OTYPEROD. CR1 PE/START/STOP/ACK/POS/SWRST, CR2 FREQ/ITEVTEN/ITBUFEN/ITERREN, DR/SR1/SR2/CCR/TRISE. SB SR1→DR adres yazımıyla, ADDR SR1→SR2 okumasıyla temizlenir. ADDR beklerken ve iki receive register dolu/BTF durumunda SCL fiziksel olarak düşük tutulur; DR okununca aktarım sürer. RXNE/TXE/BTF, AF ve belirsiz SDA için BERR; error W0C. OlayIRQ31 ve hataIRQ32 gerçek NVIC bank0/bank1 ve ARM ISR üzerinden çalışır. RXNE/TXE olaylarında ITBUFEN de gerekir.

Bir baytta ACK0/ADDR clear/STOP; iki baytta POS1/ADDR clear/ACK0/BTF/STOP/DR×2; N>2 sonunda ACK0/BTF ile son üç bayt, son bayta NACK. C HAL kritik ADDR/ACK/STOP/DR sıralamasında önceki PRIMASK değerini koruyarak kesmeleri maskeler. Transmit sonunda BTF beklenir. Zaman CPUcycles/PCLK1/CCR'den gelir; timer doubling uygulanmaz.

## Sınırlar

Standard-mode single-master kapsamıdır; Fast-mode,10-bit/slave/dual-address/multi-master/arbitration, DMA/SMBus/PEC ve I²C2/3 henüz desteklenmez. PE ile bu modları açma girişimleri açık hata verir. TRISE registeri saklanır, analog kapasitans/rise-time/filtre/noise/errata modellemez; mevcut DC hat seviyeleri ve clock-stretch beklemesi vardır. Full vendor HAL/Cube uyumluluğu veya fiziksel donanım testi değildir. APB clock kesildiğinde sürmekte olan transfer iptal edilir; exact clock-freeze/resume sonraki kapıdır. Ham START yalnız byte sınırında mümkündür; Ayrı write/read çağrıları STOP kullanır; cf_i2c1_write_read birleşik write-prefix → repeated START → read → STOP sağlar. Adres-only cf_i2c1_probe ACK polling içindir. Ayrıntı [EEPROM kabulü](STM32-I2C-EEPROM.md).

ST [RM0008](https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [RM0368](https://www.st.com/resource/en/reference_manual/rm0368-stm32f401xbc-and-stm32f401xde-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [RM0383](https://www.st.com/resource/en/reference_manual/dm00119316.pdf), [AN2824](https://www.st.com/resource/en/application_note/an2824-stm32f10xxx-ic-optimized-examples-stmicroelectronics.pdf). Önceki SPI1 kapsamı [STM32-SPI1](./STM32-SPI1.md).

# STM32 SPI ve USART formatları · 0.49

14 Ekim 2026. Bu sürüm gerçek Clang C17 firmware ve Cortex-M3/M4F motoru üzerinde aşağıdaki çevrebirim ayrıntılarını genişletir. Fiziksel kart veya tam Cube HAL kabulü değildir.

## SPI1

Mode 0/1/2/3 (CPOL/CPHA), 8 veya 16 bit, MSB-first/LSB-first, full-duplex master ve yazılım NSS/GPIO CS. SCK/MOSI gerçek elektriksel hattı sürer; MISO aynı devre çözümünden örneklenir. CPHA0 ilk bit saat öncesi hazırlanır ve leading edge'de alınır; CPHA1 leading edge'de hazırlanır ve trailing edge'de alınır. SCK her çerçeve sonunda CPOL seviyesine döner. RXNE/TXE/BSY, iki TX register, OVR ve DR→SR temizleme, IRQ35 korunur.

```c
int cf_spi1_config(unsigned hz, unsigned mode, unsigned bits, unsigned lsb);
int cf_spi1_transfer_word(unsigned value);
```

Hız eski 1 MHz üst sınırı ve kartın PCLK2/256 alt sınırıyla sınırlı; başarıda gerçek seçilen hız, geçersiz seçimde −1. Transfer başarıda 8/16-bit veri, timeout −1, OVR −2. Eski `cf_spi1_begin(hz)` mode0/8/MSB ile aynı davranır; byte transfer API'si korunur. Format değiştirmeden SPE=0 gerekir; BSY sırasında değişim reddedilir. DMA, slave, hardware NSS, CRC, remap, TI/I²S ve receive-only henüz yoktur. Her sensör her formatı desteklemez: MCP3008 hazır örneği eski mode0/8/MSB profiliyle kalır. Yeni formatların kabulü fiziksel loopback devresindedir.

## USART1 ve USART2

7E/7O, 8N/8E/8O, 9N; bir veya iki stop biti. M ve PCE birlikte gerçek payload uzunluğunu belirler: M0+parity 7 veri biti; M1+parity 8 veri biti; M1+parity kapalı 9 veri biti. TX parity üretir, RX parity kontrol eder. PEIE yalnız PE kesmesini; EIE FE/NE hatalarını; RXNEIE RX/ORE yolunu açar. SR→DR okuma hata bayraklarını temizler. 2-stop modunda ikinci stop biti STM32 alıcısı tarafından kontrol edilmez; RX ilk stop örneğinde hazırdır. Majority oversampling/baud toleransı/analog jitter tam modellenmez.

```c
int cf_usart1_config(unsigned baud, unsigned tx, unsigned rx,
                     unsigned bits, unsigned parity, unsigned stops);
int cf_usart2_config(unsigned baud, unsigned tx, unsigned rx,
                     unsigned bits, unsigned parity, unsigned stops);
void cf_usart1_write_word(unsigned value);
void cf_usart2_write_word(unsigned value);
int cf_usart1_read_word(void);
int cf_usart2_read_word(void);
```

parity: 0=yok, 1=even, 2=odd. 7N veya 9E/O eski STM32 word formatında yoktur ve reddedilir. Baud 1200..115200; başarı0/geçersiz−1. read_word boşta−1, veri varsa0..511; byte API alt8 biti korur. Üst bitin kaybolmaması için 9N'de word API gerekir. USART1 PCLK2; USART2 PCLK1 kullanır. USART2 IRQ38, USART1 IRQ37 gerçek ARM NVIC/ISR yoludur.

USART1 mevcut PA9/PA10 veya PB6/PB7; F411 PA15/PB3 alternatifleri korunur. Fiziksel USART2 PA2/PA3 Blue Pill ve WeAct kartlarında açılır. Nucleo MB1136 C04 profili SB62/63 OFF olduğu için bu başlık pinleri kapalı kalır; yalnız byte VCP terminali korunur. Bu profilin fiziksel ST-LINK/VCP baud/parity emülasyonu tamamlanmış değildir. USART2 remap/alternatif pinler henüz yoktur.

Konsol yalnız kartın terminal UART'ını izler. Seçili olmayan fiziksel UART verisi elektriksel bağlı cihaza gider; konsola eklenmez. Fiziksel RX etkin terminal için metin kuyruğu yerine bağlı cihaz kullanılır. OVER8, 0.5/1.5 stop, DMA, flow control, synchronous CK, LIN, smartcard ve half-duplex henüz desteklenmez.

## Proje ayarları ve kaynaklar

Pin penceresi SPI formatını ve USART1/2 veri/parity/stop ayarlarını üretir; JSON/ZIP ile yalnız bu projede taşınır. Eski projelerde varsayılan8N1 ve SPI0/8/MSB davranışı korunur. main.c ayarları sonradan değiştirebilir; pin penceresi main.c'yi değiştirmez.

[ST RM0008](https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [ST RM0368 SPI/USART](https://www.st.com/resource/en/reference_manual/DM00096844.pdf), [ST RM0383](https://www.st.com/resource/en/reference_manual/dm00119316.pdf). [Tüm STM32 kapsam kaydı](STM32-AUDIT.md).

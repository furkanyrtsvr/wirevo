# Wirevo 0.62 — STM32 çevrebirim genişletmesi

I²C1 400 kHz / DUTY2:1 ve16:9; native DMA TX/RX, LAST/NACK ve HT/TC IRQ. cf_i2c1_write_dma/read_dma C/C++ yardımcıları. Çok dosyalı çevre istasyonu SHT31/OLED için DMA kullanır; EEPROM ACK polling ve birleşik okuma, ADC/SPI/PWM/buton alarmı korunur.

F4 SPI1 alternatif/karma SCK/MISO/MOSI pinleri ve cf_spi1_pins API. USART1/2 fiziksel0.5/1.5stop bitleri, sürekli iki byte/IRQ kabulü ve pin penceresi üretimi. F4 RTC MASKSS/SS alt-saniye alarmı ve gerçek ARM WFI/IRQ41/EXTI17.

Kapsam penceresi seçili çipte olmayan donanımı modellenmemiş gerçek çevrebirimlerden ayırır. CAN F401/F411'de yoktur; DAC/RNG/QSPI gibi mevcut dokuz çipte olmayan birimler eksik geliştirme diye gösterilmez. ADC2/F103 ve SDIO/F4 gibi gerçek, henüz modellenmemiş birimler tamamlanmış sayılmaz. Bu sürüm tüm STM32 silikonunun bitirildiği iddiası değildir.

Kullanım/sınırlar: dist/notices/STM32-SUPPORT-PROFILE.md; kabul: docs/qa/README.md. Firmware fingerprint cf-stm32-0.18; eski derlemeler yeni SDK ile yeniden oluşturulur.

Canlı düzenleme düzeltmesi: STM32 SHT31 sıcaklık/nem veya pot değeri değiştiğinde, bağlantılar ve diğer parametreler aynıysa aktif I²C/SPI/BT durumu korunur. Buton/anahtar iletimi, kablo veya devre yapısı değişince net kimlikleri değişebileceği için tam yeniden kurulum yapılır. USART OVER8 baud telemetrisi BRR mantissa/fraction ve gerçek APB bölücüsünü kullanır.

CI ile bulunan SCL recovery regresyonu düzeltildi: buton iletimi ve global pressed, net topolojisinin parçasıdır. Sensör/pot canlı düzenlemesiyle karıştırılmaz. Component/project buton biçimleri ve aktarım ortasında sıcaklık değişimi6/6 kabul edildi.

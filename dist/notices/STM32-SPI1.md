> Güncelleme0.49: mode0..3 /8-16bit/MSB-LSB desteği için [güncel format kabulü](STM32-SERIAL-FORMATS.md). Aşağıdaki0.45 kayıt tarihsel başlangıç kapsamıdır.

> Güncel 0.46: [Donanım I²C1](./STM32-I2C1.md) altı kartta etkin. Aşağıdaki önceki sürümlerin I²C1 bekliyor bilgisi tarihsel kapsamdır.

# STM32 donanım SPI1 · CircuitForge 0.45

Altı mevcut STM32 kartında gerçek Clang C17 firmware ve Cortex-M3/M4F motoru; SPI1 register modeli gerçek elektriksel PA5 SCK / PA6 MISO / PA7 MOSI hatlarını sürer. MCP3008 verisi doğrudan controller çağrısıyla verilmez: CS, besleme, analog giriş, örnekleme ve bütün saat kenarları devre çözümünden geçer.

## Pin penceresi ve API

STM32 Pinler içinde PA5→SPI1_SCK, PA6→SPI1_MISO, PA7→SPI1_MOSI birlikte seçilir. Donanım SPI1 saat isteği500 veya1000 kHz; gerçek PCLK2/BR SCK ayrıca gösterilir. Ayar yalnız açık projede saklanır, Uygula öncesi taslaktır. CS ayrı GPIO çıkışı (örneklerde PA4, başlangıçHIGH); SPI1_NSS hâlâ datasheet planıdır.

`int cf_spi1_begin(unsigned hz)` AF/GPIO/RCC ve SPI1'i başlatır; gerçek SCK Hz döndürür, geçersiz istekte−1. Destekli istek aralığı kartın PCLK2/256 taban hızından1MHz'e kadardır; BR seçimi isteneni aşmaz. Başlangıç saatlerinde F103 500k isteği281250Hz, F401328125Hz, F411390625Hz. MISO dummy/boşta evreleri için30kΩ internal pull-down kullanılır.

`int cf_spi1_transfer(unsigned char byte)` TXE bekler, DR yazar, RXNE/DR okur ve BSY0 bekler. Başarılı sonuç0..255,1ms timeout−1, taşma−2. CS transfer dönüşünden sonra bırakılır. Kullanıcı main.c pin kodunu sonradan değiştirebilir. Eski cf_bus.c yazılım SPI örnekleri ve kaydedilmiş projeler otomatik çevrilmez. Mevcut kodda yazılım SPI rolünü donanıma çevirirseniz cf_spi_transfer(&cf_spi1,byte) çağrısını cf_spi1_transfer(byte) yapın; pin penceresi kullanıcı main.c kaynağını değiştirmez.

## Register, zaman ve IRQ

SPI1 base0x40013000, APB2/RCC bit12. F1 MAPR0 defaultPA, F4 AF5/MODER2. 8-bit MSB-first mode0 master, SSM/SSI software NSS. PCLK2/BR gerçek CPU çevrimlerinden hesaplanır; SCK rising MISO örnekler, falling MOSI değiştirir. Tek transmit buffer ve shift register; TXE/RXNE/BSY, tek receive DR ve OVR. OVR önceki DR'yi korur; DR sonra SR okuması temizler. CR2 RXNEIE/TXEIE/ERRIE gerçek NVIC IRQ35'e gider; RCC reset registerleri ve bekleyen transferi sıfırlar.

APB clock kapatma bekleyen transferi iptal eder, yeniden açmak otomatik yeni byte üretmez. Bu, modelin belgelenmiş sınırıdır; tam donanım clock freeze/resume henüz yok. MISO kopması pull-down nedeniyle0 üretebilir: SPI protokolünde ACK bulunmadığından0 ölçümü cihazın bağlı olduğunu kanıtlamaz. Belirsiz orta seviye/floating, 3.3V dışı devre ve uyumsuz AF açık hata üretir.

## Sınırlar ve doğrulama kaynakları

CPHA/CPOL diğer modları,16-bit/LSB-first, CRC/TI/I²S, DMA, slave, donanım NSS ve remap desteklenmez; etkinleştirme açık hatayla reddedilir. Donanım I²C1 henüz yok; çevre istasyonunun SHT31/OLED yolu yazılım I²C olarak kalır. Tam ST vendor HAL/Cube uyumluluğu değildir. Donanım cihaz testi yapılmadı.

ST [RM0008](https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [RM0368](https://www.st.com/resource/en/reference_manual/rm0368-stm32f401xbc-and-stm32f401xde-advanced-armbased-32bit-mcusstmicroelectronics.pdf), [RM0383](https://www.st.com/resource/en/reference_manual/dm00119316.pdf). Genel USART/ADC/PWM kapsamı [STM32-PERIPHERALS](./STM32-PERIPHERALS.md).

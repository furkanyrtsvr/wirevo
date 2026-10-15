> Güncel 0.46: [Donanım I²C1](./STM32-I2C1.md) altı kartta etkin. Aşağıdaki önceki sürümlerin I²C1 bekliyor bilgisi tarihsel kapsamdır.

> Güncel 0.45: [Donanım SPI1](./STM32-SPI1.md) altı kartta etkin. Aşağıdaki 0.44/öncesi donanım SPI bekliyor bilgisi tarihsel kapsamdır. I²C1 hâlâ plan.

# STM32 pin penceresi · 0.44

Üst menüde **STM32 Pinler** seçilir. Kartın üzerindeki pine veya listedeki PA/PB/PC adına tıklanır. Pin görevi, C etiketi, başlangıç seviyesi, terminal baud ve yazılım bus hızları düzenlenir. **Uygula ve C kodunu üret** projeye `cf_board_config.c/.h` ekler. Bu fonksiyon gerçek ARM başlangıç kodunda saatler/veri/BSS hazırlandıktan sonra, `main` öncesinde çağrılır. Kullanıcı kodu daha sonra GPIO ayarlarını değiştirebilir.

GPIO giriş, pull-up, pull-down, çıkış ve açık drenaj; yazılım I²C1 SDA/SCL ve SPI1 SCK/MISO/MOSI gerçek kod üretir. GPIO bus seçimleri desteklenen herhangi bir kullanılabilir pine atanabilir. Terminal mevcut USART byte taşıma modelini kullanır. USART1 TX/RX, ADC1 tek 12-bit kanal ve TIM2 PWM1 gerçek C kodu üretir. Diğer TIM/USART/I²C/SPI alternatifleri **datasheet planıdır**: AF/remap bilgisi ve yorum üretilir, henüz bu donanım çevrebirimini çalıştırmaz. Tam STM32CubeMX/STM32 HAL uyumluluğu yoktur.

SWD, kristal ve kartta ayrılmış pinler korunur. Yinelenen C etiketi veya bus sinyali, eksik bus ve desteklenmeyen rol reddedilir. Nucleo MB1136 C04 varsayılan solder bridge profili kullanılır: SB62/63 OFF olduğundan PA2/PA3 header ile VCP ayrıdır. F401/F411 LQFP64 kartlarında PB11 yoktur. C6'da TIM4, SPI2, I²C2 ve USART3 seçenekleri gösterilmez.

Üretilmiş dosyalar işaretli oldukları için sonraki Uygula işleminde yeniden yazılır. Aynı adla işaretsiz kullanıcı dosyası varsa işlem reddedilir. Yapılandırma JSON/ZIP içinde `settings.stm32Pins` olarak korunur; değiştirmek eski firmware'i geçersiz kılar. Fiziksel kablolar otomatik olarak yeni göreve taşınmaz; kullanıcı pin ve kablo eşleşmesini düzenler.

## Daha kapsamlı iki örnek

**Çevre istasyonu:** SHT31 (PB7/PB6), MCP3008 (PA5/PA6/PA7, CS PA4), OLED 0x3C, potansiyometre, PA0 LED alarmı ve PA1 buton. Pot %0–100 eşik sıcaklığını 20–40 °C aralığında değiştirir. Varsayılan %50 / 25 °C terminal sonucu `T=2500 H=5000 ADC=512 NATIVE=2048 LIMIT=3000 ALARM=0 OLED=0` olur. Sıcaklık 37 °C yapılınca veya butona basılınca alarm yanar. OLED ADC seviyesini bar olarak gösterir; `OLED=0` işlem başarılı demektir. SHT beslemesi koparılınca hata raporlanır. Değerler sıcaklık/nem ×100 olarak yazdırılır.

**Bluetooth kontrol:** sanal BLE UART, MCP3008/pot, LED ve buton. Bluetooth panelinde sanal PC → tara → STM32-CONTROL → bağlan. `CONTROL READY` cevabını bekle. LF satır sonuyla `L1` LED yakar, `L0` söndürür, `A` ADC değerini döndürür. Her komuttan sonra cevabı bekle. PA9 TX / PA10 RX gerçek USART1 bit süreleri ve RXNE kesmesi, PB5 STATE bağlantı durumudur. Sanal RF ağı kullanılır; gerçek bilgisayar Bluetooth donanımı veya BLE stack kabulü sayılmaz.

Yeni proje ve örnekler ekranında bu iki laboratuvar öne çıkar. Eski yedi küçük örnek **Temel kontrol örnekleri** altında kalır. Yeni Nucleo örnekleri elektriksel olarak eşdeğer dış Morpho padlerini seçer ve kabloları PCB çevresinden yönlendirir. Eski proje için **Kabloları düzenle** uygulanabilir; geri al desteklenir. Manuel eklenen kablolar için kullanıcı düzenlemesi gerekebilir.

## Birincil kaynaklar

- [STM32F103C6, DocID15060 Rev7](https://www.st.com/resource/en/datasheet/stm32f103c6.pdf)
- [STM32F103C8/CB/RB, DS5319 Rev20, Table 5](https://www.st.com/resource/en/datasheet/stm32f103c8.pdf)
- [STM32F401, DS10086 Rev5, Tables 8–9](https://www.st.com/resource/en/datasheet/stm32f401re.pdf)
- [STM32F411, DS10314 Rev8, Tables 8–9](https://www.st.com/resource/en/datasheet/stm32f411re.pdf)
- [Nucleo MB1136, UM1724 Rev17, §7.8/Table 10](https://www.st.com/resource/en/user_manual/um1724-stm32-nucleo64-boards-mb1136-stmicroelectronics.pdf)

AF tablosu doğrulanmış bir alt kümedir; USB/SDIO/CAN/Ethernet ve tüm alternatif sinyallerin eksiksiz kataloğu değildir. F1 alternatifleri AF numarası yerine MAPR remap kullanır. F4 AF numaraları karta/MCU'ya göre farklıdır; F411'e özgü roller F401'e kopyalanmaz.


0.44 register/IRQ, ADC/PWM ayarları ve kapsam: [STM32-PERIPHERALS](./STM32-PERIPHERALS.md). PWM kanalları aynı frekansı paylaşır; Hz/duty yalnız seçili proje pinine kaydedilir. USART1 TX/RX birlikte seçilir.

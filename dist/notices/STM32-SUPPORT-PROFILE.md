# Wirevo 0.62 STM32 destek profili

Bu kayıt dokuz kart için desteklenen uygulama modelini tanımlar. Bütün STM32 ürün ailesinin veya fiziksel silikonun tüm işlevlerinin uygulandığı iddiası değildir.

## Kullanılabilir akış

Tek çalışma alanı, Dosya/Yeni proje/kart seçimi; breadboard/net label/auto-route/aynalama; C17 ve C++17 gerçek ARM firmware; MicroPython WASM elektriksel devre modu. USB/CAN native C/C++ profiline aittir; MicroPython yerel ARM firmware portu değildir.

Kartlar: Blue Pill F103C6/C8/CB, Nucleo F103RB/F401RE/F411RE, WeAct F401CC/F401CE/F411CE. Nucleo C04 header köprü kısıtları ve çipe özgü Flash/SRAM/LED/KEY bilgileri korunur. F411 çalışma profili USB uyumlu96 MHz; F40184 MHz.

## 0.61 ile kapanan eksikler

- ADC1 dahili sıcaklık ve VREFINT: F103 kanal16/17; F401/F411 sıcaklık16/18, VREFINT17. F4 VBATE ile kanal18 girişinde VBAT/4 önceliklidir. Kanal16 alias + VBATE eşzamanlı kullanımı modelde açıkça reddedilir; VBAT için18 seçilir. TSVREFE/VBATE kapıları,10µs başlangıç ve datasheet örnekleme alt sınırları kontrol edilir. Uzun SMPR süresi seçin.
- Nominal kaynaklar: F103 V25=1.43V, eğim−4.3mV/°C, VREFINT1.2V; F4 V25=.76V, eğim+2.5mV/°C, VREFINT1.21V. VDDA sabit3.3V. Sıcaklık ve VBAT proje pin penceresinde saklanır. Bunlar fiziksel ölçüm veya fabrika kalibrasyon değerleri değildir.
- USART1/2: F401/F411 OVER8/OVER16, doğru BRR mantissa/fraction ve bit3 koruması. `cf_usart1_oversampling(8)` / `cf_usart2_oversampling(8)` mevcut baud oranını korur. Mode geçişi TX tamamlandıktan sonra yapılır; F1038× seçimini reddeder. Normal1/2stop korunur;0.5/1.5stop0.62 ile eklendi, smartcard eklenmedi.
- SPI1: `cf_spi1_nss_hardware(1)` PA4 alternate-function master NSS çıkışını etkinleştirir. NSS, SPE açıkken LOW kalır; her baytta otomatik pulse üretilmez. `(0)` software NSS/GPIO CS biçimine döner. SCK/MISO/MOSI ile birlikte pin penceresinden de seçilebilir. Hardware NSS input/multimaster/slave/TI/CRC kapsam dışıdır.

Yeni örnek: Projeler → Temel kontrol örnekleri → Dahili sıcaklık / VREF / VBAT. Harici kablo gerektirmez; gerçek firmware ADC registerlerini okur. Diğer sensör örnekleri aynı devre modelini kullanır.

## 0.62 — uygulanan ek işlevler

- I²C1 standard/fast mode,400 kHz ve iki DUTY oranı. DMA1 gerçek çevrebirim isteği/SRAM aktarımı,1bayt ACK=0 ve çok bayt LAST/EOT NACK; HT/TC/TE ve hata toparlanması. `cf_i2c1_write_dma(address,data,n)` / `cf_i2c1_read_dma(address,data,n)` bloklayan yardımcıları1..1024bayt kabul eder. F1 DMA1 kanal6/7, F4 DMA1 stream6/0 CHSEL1 ayrılır; aktif kanalda -1 döner. Başarılı dönüş bayt sayısıdır. Ortak DMA kanallarını kullanan başka sürücülerle eşzamanlı başlatmayın.
- Çevre istasyonu SHT31/OLED400 kHz DMA, MCP3008/SPI, native ADC/PWM, EEPROM ve buton ile gerçek çok dosyalı C/C++ örneğidir. EEPROM polling/repeated-start yolu korunur.
- F4 SPI1 alternatif SCK/MISO/MOSI: `cf_spi1_pins(PB3,PB4,PB5)`; mevcut master biçimi/hızı korunur, BSY sırasında reddeder. Kartta ayrılmış pinler kullanılamaz; Nucleo PB3 SWO profili kapalıdır, PA5/PB4/PB5 karma eşleme kullanılabilir. Pin penceresi aynı kodu üretir.
- USART1/2 `cf_usart1_stopbits(halves)` / `cf_usart2_stopbits(halves)`:1→0.5,2→1,3→1.5,4→2stop. TX tamamlandığında değiştirin. Pin penceresi0.5/1.5 seçeneklerini de saklar. Bu özellik smartcard/LIN/CTS desteği değildir.
- F4 RTC alt-saniye alarmı: ALRMASSR/ALRMBSSR MASKSS=0 yalnız saniye sınırında,1..15 seçilen düşük SSR bitleriyle; write-protection, A/B alarm enable, EXTI17 ve IRQ41 korunur.

Çipte olmayan çevrebirimleri gerçek simülatör eksiklerinden ayıran kart donanımı tablosu STM32 kapsam penceresindedir. F401/F411 CAN veya RNG içermez. ADC2/F103 ve SDIO/F4 gibi gerçek fakat modellenmemiş donanım açıkça belirtilir.

## İleri emülasyon kapsamı dışında

USB OTG host/iso/DMA/USB class ve PC fiziksel USB; haricî CAN ağı/transceiver/arbitration; tam Cube HAL/STL/RTTI/exception ve yerel ARM MicroPython; diğer TIM/UART/SPI/I²C/ADC instance'ları, DMA FIFO/burst/DBM/PFLOW, tüm clock/power/Flash/debug/MPU ayrıntıları. Bu kalemler çalışıyor gibi gösterilmez; kullanıcı özellikle istemedikçe tekrar eden küçük STM32 sürümleri için zorunlu bekleme listesi yapılmaz. Bundan sonraki ana kart ailesi RP2040/Pico için ayrı gerçek motor/derleyici/devre kabulüdür.

## Kaynaklar

- [RM0383 — F411 dahili ADC kanalları ve VBAT/4](https://www.st.com/resource/en/reference_manual/rm0383-stm32f411xce-advanced-armbased-32bit-mcus-stmicroelectronics.pdf)
- [RM0368 — ADC dahili mux ve kaynak kapıları; USART BRR/OVER8; SPI NSS](https://www.st.com/resource/en/reference_manual/dm00096844.pdf)
- [STM32F401 datasheet — nominal sıcaklık, VREF ve VBAT/4](https://www.st.com/resource/en/datasheet/stm32f401re.pdf)
- [STM32F411 datasheet — nominal sıcaklık, VREF ve VBAT/4](https://www.st.com/resource/en/datasheet/stm32f411ce.pdf)
- [STM32F103C6 datasheet — nominal sıcaklık/eğim](https://www.st.com/resource/en/datasheet/stm32f103t4.pdf)

Özetin ötesindeki açık model ayrıntıları [denetim kaydında](STM32-AUDIT.md) korunur. Tüm silikon ayrıntıları tamamlandı sayılmaz.

Canlı düzenleme düzeltmesi: STM32 SHT31 sıcaklık/nem veya pot değeri değiştiğinde, bağlantılar ve diğer parametreler aynıysa aktif I²C/SPI/BT durumu korunur. Buton/anahtar iletimi, kablo veya devre yapısı değişince net kimlikleri değişebileceği için tam yeniden kurulum yapılır. USART OVER8 baud telemetrisi BRR mantissa/fraction ve gerçek APB bölücüsünü kullanır.

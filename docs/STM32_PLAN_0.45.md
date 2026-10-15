# STM32 devam planı · 0.45

Kullanıcının mevcut talebi STM32 özelliklerini geliştirmek, pin ayarlarını proje içinde tutmak ve düzenli hazır devreler sunmaktır. Bu dosya çalışma bağlamıdır; yeni kullanıcı talebi önceliklidir. Önce QA_0.45.md ve dist/notices/STM32-SPI1.md okunur.

1. **Donanım I²C1**: 0x40005400 / APB1, RCC bit21. SB SR1→DR, ADDR SR1→SR2; ACK/POS bir, iki ve çok bayt alma sonlandırması; TX BTF→STOP; iki receive register, gerçek açık drenaj pinleri ve SCL stretching. I2C1_EV IRQ31 ve ER IRQ32 için gerçek NVIC. F1 PB6/7 veya MAPR bit1 PB8/9; F4 AF4. HAL timeout ve yeniden bağlanma; sensör besleme/adres/ACK/CRC değişimini altı kartta doğrula. Pin penceresindeki hw_I2C1 hâlâ plan; geçmeden aktive etme. Resmî araştırma docs/STM32_I2C_SPI_RESEARCH_0.45.md içinde.
2. **SPI1 kapsamını genişlet**: CPOL/CPHA 1/2/3, 16-bit, LSB-first, donanım NSS, slave, DMA, TI/I²S/CRC ve uygun yeni sensörlerle fiziksel kabul. Mevcut yalnız mode0 8-bit MSB-first master, software NSS ve ayrı GPIO CS. Remap debug pinleri kart rezervasyonuyla ele alınır. APB saatini kesmek bu modelde transferi iptal eder; gerçek clock freeze/resume ve BSY sırasında divider değişimini ayrı kabul et.
3. USART parity/9-bit/stop/CTS, USART2 fiziksel profil; ADC scan/continuous/overrun/dahili kanallar/sample-hold; TIM2 pause/resume/capture/encoder/center-aligned. Önceki bounded modellerin kabulü korunur; desteklenmeyeni çalışıyor gibi sunma.
4. WeAct F401CC/F411CE kendi pin/header/revizyon/Flash/SRAM/LED/BOOT/SWD profiliyle. Sonra F3/G4/L4 register motoru; M0/M0+/M7/M33 ayrı CPU kabulü. Alias kart ekleme.
5. Gerçek STM32 C++17 toolchain/init-array/heap; ardından ayrı MicroPython port/runtime. ESP ve AVR akışları korunur.
6. İki kapsamlı laboratuvar: OLED metin, fan/motor PWM, fault/reconnect ve net label alternatifleri. Wire routing orta segment overlap0, net eşdeğerliği ve PCB erişim stub sınırı korunur. USB/CAN/RS485/Ethernet ve fiziksel BLE ayrı kabul.

Her tur: uygun test/build ve genel regresyon; aynı Sites projesinde exact pushed SHA/arşiv ile yayın; kök devir/checkpoint/ZIP/hash. Public audience korunur. Kimlik bilgileri, research/node_modules/target teslim paketine girmez.

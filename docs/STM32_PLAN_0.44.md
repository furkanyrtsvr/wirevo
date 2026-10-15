# STM32 devam planı · 0.44

Güncel kullanıcı talebi mevcut STM32 özelliklerini tamamlamak ve hazır devre kablolamasını düzeltmektir. Plan bağlamdır; yeni kullanıcı talebi önceliklidir. Önce QA_0.44.md ve dist/notices/STM32-PERIPHERALS.md okunur.

1. Mevcut USART1/ADC1/TIM2 sınırlarını genişlet: USART parity/9-bit/stop/CTS ve IRQ priority/mask ayrıntıları, USART2 fiziksel profil; ADC scan/continuous/overrun/dahili kanallar/dinamik sample-hold; timer pause/resume, capture/encoder/center-aligned ve clock değişiklikleri. Desteklenmeyen modu sessizce çalışan gibi sunma. Motor GPIO/DC/SysTick/VFP ve host lifecycle kabulü kalsın.
2. Donanım I²C1/SPI1 register modelleri: RCC/AF, ACK/NACK/clock-stretch, status flags/FIFO, IRQ, fiziksel hatlar; mevcut cf_bus yazılım sürücülerini koru. Pin penceresindeki planları ancak gerçek kabul sonrası aktive et.
3. WeAct Black Pill F401CC/F411CE: kendi pin/header/revizyon, Flash/SRAM, reset/LED/BOOT, USART/ADC/TIM kapsamı. Sonra F3/G4/L4 register motoru; M0/M0+/M7/M33 ayrı CPU kapıları. Sahte kart aliası ekleme.
4. Gerçek C++17 toolchain/init-array/heap ve ardından STM32 MicroPython port/runtime. ESP32 C++/C/MicroPython seçenekleri ile AVR örnek ve derleyiciler korunur.
5. Laboratuvarları az sayıda kapsamlı devre halinde büyüt: OLED metin, gerçek motor/fan PWM ve sensör hata/yeniden bağlanma, protokol timeout; net label alternatifleri. Wire routing testinde orta segment overlap sıfır ve pad/net eşdeğerliği kalsın; ortak endpoint çıkışı ayrı ölçülür.
6. USB/CAN/RS485/Ethernet/DMA ve gerçek BLE host donanımı ayrı kabul. Sanal BLE RF yığını değildir. Fiziksel cihazı kullanıcı tarayıcıdan seçer; hardware test yapılmadan doğrulandı deme.

Her tamamlanan turda uygun hedef testleri, build ve regresyon; aynı Sites projesine exact pushed commit/arşiv ile yayın; kök devir, checkpoint ve tam ZIP/hash. Site public audience korunur. Kimlik bilgileri, research, node_modules ve target teslim paketine girmez.

# Devam planı · 0.47

Bu belge çalışma bağlamıdır; kullanıcı talebi önceliklidir. Önce QA_0.47.md ve dist/notices/STM32-AUDIT.md okunur. Dokuz STM32 / toplam29 kart var. Hiçbir eksik çevrebirim tamamlanmış diye sunulmaz.

1. Kalan STM32 doğruluk kapıları audit belgesindeki 17 başlıkta korunur. Öncelik I²C combined repeated-start/EEPROM; sonra USART parity/stop/physicalUSART2, SPI mode1/2/3/word/order, ADC scan/internal, TIM2 capture/encoder/prescaler subphase. RCC exact freeze/resume ve düşük güç ayrı testler ister.
2. STM32 C++17 gerçek startup/init-array/runtime/heap; ardından MicroPython ayrı port. Şu anda yalnız C17. Tam Cube/vendorHAL desteklenmez.
3. Katalogda yeni aile olarak Raspberry Pi Pico/RP2040 için resmî pinout/datasheet ve Cortex-M0+ gerçek motor araştırması; motor/bellek/GPIO/IRQ/ADC/PWM/UART/I²C/SPI kabulü olmadan çalışan kart diye ekleme. Nucleo F3/G4/L4 register-family kapıları da kayıtlıdır; mevcut F4 profile alias yapma.
4. 2 kapsamlı laboratuvar / kart: çevre ve Bluetooth kontrol. Daha çok basit kopya yerine fault/reconnect/OLED metin/motor senaryoları. Yeni 9×2 routing, PCB geçişi ve interior overlap0 kabulü korunur. Net label/breadboard alternatifleri mevcut.
5. USB/CAN/ETH/SDIO/DMA/RTC/watchdog/Flash programming/EXTI/MPU/SWD/fullclock/analog ayrıntıları denetim belgesinde açık kalır; her donanım kapısında ST reference manual/errata ve genuine firmware/net testleri gerekir.

Yayın aynı Sites project. Exact pushed SHA / archive / native save-deploy / clean git / fullZIP SHA / devir. Windows helper archive sırasında bash başlatamayabilir; önce pushed SHA doğrula, aynı kaynak prepare-site-build + tar ile paketle. Credentials/.sites-runtime/research/node_modules/target ZIP'e girmez.

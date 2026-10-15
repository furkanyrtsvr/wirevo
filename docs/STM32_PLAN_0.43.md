# STM32 devam planı · 0.43

Önce QA_0.43.md, STM32-PIN-CONFIG.md ve mevcut STM32-MODEL.md okunur. Güncel kullanıcı isteği belgelerdeki önerilerden üstündür.

1. Fiziksel USART kabulü: F103 USART1 PA9/PA10, F401/F411 gerçek AF7; Nucleo C04 VCP/header solder bridge ayrımı. Baud/8N1 TX/RX, framing/overrun, RXNE/TXE ve IRQ/NVIC. Sanal Bluetooth laboratuvarını gerçek register UART'a taşı; eski yazılım UART örneğini koru.
2. ADC1 ve TIM/PWM: RCC, CR/SR/DR, örnekleme/kanal, kaynak empedansı ve voltaj; timer prescaler/ARR/CCR ve interrupt. Önce altı mevcut kartta ayrı sınır ve elektriksel test, sonra pin penceresindeki plan rolünü aktif koda dönüştür. Çalışmayan alternatifi aktif gibi sunma.
3. Pin penceresi: doğrulanmış AF alt kümesini genişlet, çevrebirim çakışmaları ve remap gruplarını denetle. Mevcut JSON/ZIP yapılandırması ve işaretsiz kaynak dosyası koruması kalsın. Kullanıcı kodu pin başlangıcını değiştirebilir.
4. Laboratuvarlar: okunabilir çok dosyalı sürücüler, OLED metin ekranı, sensör hata/yeniden bağlanma ve protokol timeout senaryoları. Daha fazla küçük preset yerine birkaç kapsamlı devre. Kablo dönüşleri ve eşdeğer pad seçimleri fiziksel neti değiştirmesin.
5. Yeni kart: WeAct Black Pill F401CC/F411CE için gerçek Flash/SRAM, fiziksel USB/BOOT/debug/header datasheet ve motor kabulü. Sonra M4F F3/G4/L4 kendi register kapısıyla; F0/G0/L0 M0/M0+, F7/H7 M7 ve M33 aileleri ayrı CPU motoru gerektirir. Mevcut kartın adı değiştirilerek sahte destek oluşturma.
6. STM32 C++/MicroPython ancak gerçek toolchain/runtime kabulüyle. ESP32/AVR örnek ve motor regresyonu korunur. Gerçek BLE GATT donanımı yalnız uyumlu cihaz ve kullanıcı tarayıcı seçimiyle test edilir; sanal ağ fiziksel RF kanıtı değildir.

Her değişiklikte uygun hedef testleri, npm run build ve gerekli regresyonlar; aynı mevcut Sites projesine tam pushed commit ile yayın. Sonunda kök YENI_SOHBET_DEVIR.md, CHECKPOINT ve tam proje ZIP/hash güncellenir. Kimlik bilgileri, research ve node_modules pakete girmez.

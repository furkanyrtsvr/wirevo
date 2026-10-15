# CircuitForge 0.49 · STM32 SPI/USART biçimleri ve ARM kesme dönüşü

14 Ekim 2026. Dokuz STM32 kartında SPI1 mode0..3, 8/16 bit ve MSB/LSB; USART1 7E/O,8N/E/O,9N ve1/2 stop. Altı Blue Pill/WeAct kartında USART2 PA2/PA3 fiziksel hat ve IRQ38. Nucleo C04 SB62/63 OFF başlıkları kapalı, byte VCP korunur. Pin penceresi projeye özel biçim ve başlangıç C kodu üretir; JSON/ZIP ile taşınır.

F411 Bluetooth kontrolünde bulunan ARM ITSTATE exception frame hatası M3/M4F kaynak motorunda giderildi; startup gecikmesiyle maskelenmedi. Gerçek SysTick/SVC/koşullu exception return testleri ve motorun native Rust testleri eklendi. 0.48 EEPROM tarayıcı kabulü tamamlandı; SPI16/UART9 fiziksel loopback tarayıcıda doğru çıktı üretir.

[Biçimler ve sınırlar](../dist/notices/STM32-SERIAL-FORMATS.md), [ARM düzeltmesi](../dist/notices/STM32-ITSTATE.md), [kabul](../QA_0.49.md), [devam planı](STM32_PLAN_0.49.md). Tüm STM32, C++/MicroPython, ADC scan ve ileri timer modları tamamlanmış değildir.

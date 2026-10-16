# 0.54 · STM32 RTC, backup ve prescaler fazı

RTC artık F103 sayaç ve F401/F411 takvim registerleriyle çalışır. Alarm/wakeup/secondIRQ, shadow/INIT/WPR, LSE/LSI/HSE ve backup kayıtları. RTC kaynağı pin penceresinde projeye özel C başlangıç kodu üretir. MCU/watchdog reseti takvim/prescaler/backup verisini korur; DBP koruması yeniden kapanır.

TIM2 CEN/RCC pause ve CNT write prescaler fazını korur; UG sıfırlar. F4 başlangıcı PLL öncesi doğru VOS seçer; canonical ADC ve RTC ISR isimleri kullanılır, eski CF ADC handlerları uyumludur.

Birleşik lab `docs/examples/stm32-rtc-acceptance-054.json`: ADC DMA/iki pot/B1EXTI/LED/CRC/watchdog ve RTC. T takvim/backup, F1024HzRTCtesti, Rwatchdogreseti. Leap-day ve backup1→2 gerçek firmware ile doğrulanır; net label kabloları düzenlidir.

Genel1217/1217, build ve tarayıcı kabulü. Fiziksel silikonun tamamı veya tüm STM32 ürün ailesi bitmiş değildir; C++/MicroPython ve ileri donanım başlıkları STM32_PLAN_0.54.md/STM32-AUDIT.md'de açıkça tutulur.

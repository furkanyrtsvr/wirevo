# STM32 devam planı · 0.53

Bu kayıt çalışma bağlamıdır; kullanıcı talebi önceliklidir. Kullanıcı STM32'nin tamamlanmasını istiyor. Başka kart eklemeye geçilmedi. 0.53 EXTI/DMA, ADC injected/watchdog/triggers, IWDG/WWDG gerçek reset ve CRC getirdi; tüm STM32 silikonunun tamamlandığı iddia edilmez.

1. RTC ve backup domain: F1 counter/F4 BCD calendar ayrı; PWR DBP, LSE/LSI/BDCR, resetten korunan backup, alarm/wakeup/IRQ ve fiziksel zaman testleri. Mevcut native IRQ bit bankası dolu; ABI genişletilmeli.
2. TIM2 filter/TRC/remap, external clock/down/center counting, PSC phase ve RCC pause; ardından diğer timerların aileye özel register ve gerçek GPIO/IRQ kabulü.
3. ADC internal kanallar/aile kalibrasyonu, injected external trigger/discontinuous; DMA FIFO/burst/DBM/PFLOW/I²C request. IRQ ve memory bounds kapıları korunur.
4. I²C Fast/slave/arbitration; SPI hardware NSS/slave/CRC; USART OVER8/0.5/1.5 stop/flow/LIN/sync. Desteklenmeyen ayarlar sessizce taklit edilmez.
5. Flash programlama/option bytes, clock/power, MPU/debug, USB/CAN/SDIO yalnız MCU varlığı doğrulanarak. Her STM32'de ETH/RNG/crypto varmış gibi ekleme.
6. STM32 C++17 gerçek startup/initarrays/heap; sonra gerçek MicroPython portu. Çalışmayan dil seçenekleri gösterme.

17 başlığın görünür kapsam kaydı dist/notices/STM32-AUDIT.md ve dist/stm32-scope.js'dir. Yeni kabul labı docs/examples/stm32-acceptance-053.json; pin config ayarları projeye özeldir. Yeni API/notlar STM32-EXTI-DMA-WATCHDOG.md. Source key cf-stm32-0.12, native bridge0.8; M3/M4F yeniden derlendi. Dokuz STM32/29 toplam kart, C17. Her teslimde genel test, build, browser, aynı Sites yayını, ZIP/hash/devir hazırlanır.

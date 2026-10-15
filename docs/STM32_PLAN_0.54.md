# STM32 devam planı · 0.54

Bu kayıt bağlamdır; kullanıcı talebi önceliklidir. Kullanıcı STM32'yi tamamen kapatmak istiyor. 0.53 EXTI/DMA/ADC/watchdog/CRC ardından0.54 RTC/backup ve TIM2 prescaler fazı ilerledi; başka kartlara geçilmedi. Tam STM32 silikon kapsamı bitmiş değildir.

1. STM32 gerçek C++17 startup/initarrays/heap ve interrupt linkage; ardından genuine MicroPython portu. İşlevsiz dil selector veya sonuç taklidi ekleme. Native ARM/C17 ve RAM/Flash sınırları korunur.
2. TIM2 digital filter/TRC/remap/external clock/down/center; dynamic APB clock phase; diğer TIM ailesine özgü register/GPIO/IRQ kabulü. CEN/RCC pause/CNT/UG fazı artık çalışır.
3. RTC tamper/timestamp/calibration/shift/subsecond alarms/RTC_AF output, backup regulator ve low-power STOP/STANDBY. F1/F4 counter/calendar ayrımı, backup reset/system reset farkı ve DBP/VOS korunur.
4. ADC internal channels/injected external/discontinuous/acquisition/calibration; DMA FIFO/burst/DBM/PFLOW/I²C requests; advanced SPI NSS/slave/CRC, I²C Fast/slave/arbitration, USART OVER8/fractionalstop/LIN/flow/sync.
5. Flash/option bytes/fullclock/power/MPU/debug/USB/CAN/SDIO yalnız chip varlığı doğrulanarak. Tüm STM32'lerde ETH/RNG/crypto varmış gibi ekleme; başka MCU aileleri ayrı çekirdek/register/firmware kanıtıyla ele alınır.

Görünür kapsam dist/stm32-scope.js/STM32-AUDIT.md; RTC notları STM32-RTC-BACKUP.md; QA_0.54.md ve önceki0.53kayıtları. Native bridge0.9 ek RTC IRQ bankası; kaynak/motor yeniden derlendi. Sourcekeycf-stm32-0.13; dokuzSTM32/29toplam kart, C17. Paket ve devam kaydı test/build/browser/mevcutSitesyayını/ZIP/hash ile hazırlanır. Kalan işler tamamlanmış gibi sunulmaz.

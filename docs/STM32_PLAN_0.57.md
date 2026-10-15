# STM32 0.57 devam planı

Yeni: MicroPython WASM devre modu (Pin, ADC, SoftI2C, SoftSPI); dokuz STM32, çok dosyalı main.py/JSON-ZIP/trace/ölçüm; C/C++ ARM yolları korunur. Yerel STM32 MicroPython firmware portu tamamlandı sayılmaz. ADC1 regular/injected discontinuous ve EXTI15/TIM2_CC1 injected eşlemeleri eklendi; EXTI15 native IRQ ile test edildi.

Önce QA_0.57.md, RELEASE_0.57.md, dist/notices/STM32-MICROPYTHON.md, STM32-ADC-DISCONTINUOUS.md ve STM32-AUDIT.md okunur. MicroPython pin başlangıcı Python kaynakta; C pin planı çalışmaz. Yeni model alanlarını C firmware ile karıştırma.

Sonraki donanım önceliği USB/CAN: her MCU varlığı ayrı doğrulanır. F103 USB/CAN paylaşılan bellek ve IRQ; F401/F411 USB OTG FS, CAN varlığı varsayılmaz. Native register/IRQ, descriptor/endpoint veya mailbox/filter/FIFO testleri, gerçek clock/reset ve devre bağlantısı gerekir. Yalnız UI terminali eklemek USB/CAN bitmiş sayılmaz.

Açık: yerel ARM MicroPython/pyb/stm, USB/CAN; diğer TIM/filter/remap/TRGO/DMA/dead-time; ADC internal/acquisition/noise/calibration ve diğer injected tetikler; DMA FIFO/burst/DBM/PFLOW/I2C; ileri USART/SPI/I2C/RTC/Flash/MPU/clock-power. Tüm STM32 silikonu bitmiş gibi sunulmaz. MikroPython WASM MCU Flash/SRAM/GC/CPU zamanlamasını doğrulamaz. Otomatik devam zamanlayıcısı silinmiştir ve yeniden kurulmaz.

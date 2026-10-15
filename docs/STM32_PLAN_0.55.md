# 0.55 sonrası devam planı

Kullanıcı 14 Ekim'de hakkı bittiği için nihai teslim istedi. Yeni çalışma yalnız yeni kullanıcı talebiyle başlatılır. Önce RELEASE_0.55.md, QA_0.55.md, STM32-CPP17.md ve STM32-AUDIT.md okunur.

1. Gerçek STM32 MicroPython portu: firmware/heap/GC/IRQ ve proje biçimi; mevcut ESP portu STM32 desteği sayılmaz.
2. İleri timer filtre/TRC/remap/external clock/down/center ve diğer timer'lar; ADC dahili/injected external/discontinuous, DMA FIFO/burst/DBM/PFLOW/I2C.
3. İleri USART/SPI/I2C ve RTC tamper/timestamp/calibration/shift/subsecond/STOP-STANDBY.
4. MCU varlığına göre USB/CAN/Flash/MPU/clock-power ve yeni kart aileleri. Datasheet/şema doğrulaması, gerçek firmware + elektriksel net + register/IRQ kapıları zorunludur.

Her başlık ayrı kabul edilir; bütün STM32 ailesi tamamlandı iddiası yapılmaz. 9 STM32/29 toplam kart; C17 ve küçük freestanding C++17 SDK doğrulanmıştır.

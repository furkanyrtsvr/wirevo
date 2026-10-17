# STM32 0.64 sonrası aktif plan

Kullanıcı, dokuz mevcut STM32 kartında belgelenmiş ve yazılımdan gözlenebilen fiziksel-silikon özelliklerinin eksiksiz ilerlemesini istedi. 0.63 kapanış/dondurma kararı geçersizdir; yeni kart ailesine geçilmez.

0.64 kapısı: gömülü Flash programlama/silme/kilit/hata/kalıcılık, UID ve yoğunluk imzası gerçek firmware ile tamamlandı. Sıradaki kapılar option-byte/boot/reset, RCC dinamik saat ve güç modları; ardından denetimdeki CPU, GPIO/AF, USART, ADC/DAC, timer, SPI/I²S, I²C/SMBus, DMA, RTC ve USB/CAN ayrıntılarıdır.

“Tamamlandı” yalnız `dist/notices/STM32-AUDIT.md` içindeki modellenebilir açıklar sıfırlandığında kullanılacaktır. Analog gürültü, güç tüketimi, EMC, hasar ve üretim saçılımı gibi yalnız gerçek kartta ölçülebilen etkiler yazılım emülasyonuyla aynı şey sayılmaz; bunlar ayrıca fiziksel doğrulama gerektirir.

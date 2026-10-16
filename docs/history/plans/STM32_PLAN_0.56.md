# 0.56 devam kaydı

Kullanıcı STM32 geliştirmesini yeniden başlattı ve özellikle anlaşılır kablolama/auto route istedi. Auto route, renkler ve örnek güç etiketleri; TIM2 aşağı sayım/merkez hizalı PWM eklendi. Tüm STM32 silikonunu tamamlandı diye sunma.

Kapı: 9 STM32 kartında C17/C++17, sensör/kontrol devreleri; register/IRQ/regresyon. Pin yapılandırması proje bazındadır. TIM2 DIR/CMS ileri modları bu sürümde C register koduyla seçilir; pin penceresi varsayılan PWM yardımcısını üretir.

Kalan işler: gerçek STM32 MicroPython ve tam Cube/vendor HAL; diğer TIM, filtre/remap/external clock/master-slave/TRGO/DMA/dead-time; ADC internal/injected external/discontinuous; DMA FIFO/burst/DBM/PFLOW/I2C; ileri USART/SPI/I2C ve RTC tamper/timestamp/calibration/shift/subsecond; çipe göre USB/CAN/Flash/MPU/clock-power ve diğer aileler. Her madde resmi ST referansı, gerçek firmware/elektriksel net/register-IRQ kabulü gerektirir. CPU instruction modelini fiziksel silikonun tamamı olarak sunma.

Otomatik devam zamanlayıcısı kullanıcının isteğiyle silindi. Tekrar kurulmaz.

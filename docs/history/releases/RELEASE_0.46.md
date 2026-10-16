# CircuitForge 0.46 · STM32 hardware I²C1

13 Ekim2026. Altı STM32 kartında legacy I²C1 standard-mode7-bit master gerçek SDA/SCL üzerinden çalışır: ACK/NACK, SB/ADDR clear, iki receive register/BTF, ACK/POS tail1/2/N, STOP, RCC/AF/reset ve NVIC olayIRQ31/hataIRQ32. C17 HAL timeout/recovery, kritik PRIMASK korunması. Donanım pin penceresinde I²C1 hız ve varsayılan/remap pin çiftleri; proje-local JSON/ZIP. Firmware core cf-stm32-0.5 ve yeniden üretilmiş genuineARM WASM/hash/provenance.

Yeni çevre istasyonu SHT31/OLED yolunda I²C1, ADC yolundaSPI1 kullanır. Eski yazılım bus projeleri korunur. SCL stuck-low ve sensör besleme/adres hataları test edilir; veri uydurulmaz. [Kapsam/API](../../../dist/notices/STM32-I2C1.md), [kabul](https://github.com/furkanyrtsvr/wirevo/blob/c867d52a6474f82a01240d5449e26a0708c9c8bc/QA_0.46.md), [devam planı](../plans/STM32_PLAN_0.46.md).

Henüz tüm STM32 kart/çevrebirimleri değildir. Next: WeAct gerçek profilleri, ileri I²C/SPI/USART/ADC/TIM ve STM32C++/MicroPython. Fiziksel hardware/RF onayı yok.

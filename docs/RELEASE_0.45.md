# CircuitForge 0.45 · STM32 SPI1

13 Ekim2026. SPI1 mode0 8-bit MSB-first master fiziksel GPIO/DC hatlarında çalışır. RXNE/TXE/BSY/OVR, bir transmit buffer/shift, RCC/AF/clock/IRQ35 eklendi. ARM MVN immediate yanlış APSR güncellemesi motor kaynaklarında S bitine bağlandı; iki WASM yeniden üretildi ve integrity/provenance yenilendi. Firmware core key cf-stm32-0.4 eski STM firmware'lerini yeniden derletir.

Projeye özel pin penceresinde SCK/MISO/MOSI birlikte seçilir, gerçek SCK hızı gösterilir. İki kapsamlı laboratuvarın MCP3008 yolu gerçek hardwareSPI kullanır; SHT31/OLED yazılım I²C kalır. Eski projeler/kodlar otomatik çevrilmez. Kabloların uzun orta segment overlap0 kabulü korunur.

[API/sınırlar](../dist/notices/STM32-SPI1.md), [kabul](../QA_0.45.md), [devam planı](STM32_PLAN_0.45.md). Altı STM32/toplam26 kart. Donanım I²C1, ileriSPI/ADC/timer/USART, yeniWeAct ve STM32C++/MicroPython sonraki kabul kapılarıdır.

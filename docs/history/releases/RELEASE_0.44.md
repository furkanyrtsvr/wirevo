# CircuitForge 0.44 · STM32 gerçek USART / ADC / PWM

13 Ekim 2026. Pin ayarları yalnız açık projede kalır; Uygula öncesi taslaktır. Pencereye kapsam bilgisi, aktif USART1/ADC1/TIM2 rollerinin C üretimi ve PWM Hz/duty alanları eklendi. GPIO başlangıç seviyesi yalnız GPIO çıkışında etkinleştirilir. JSON/ZIP ve proje bağımsızlığı korunur.

Gerçek USART1 8N1 / RXNE IRQ37 / ORE-FE / TDR-shift / TXE-TC; ADC1 fiziksel DC voltajından 12-bit conversion / EOC IRQ18; TIM2 PWM1 PSC/ARR/CCR / preload / UG / update IRQ28. F103/F4 adres, saat ve AF farkları ayrı uygulanır. NVIC ve WFI zaman ilerleme eksikleri gerçek motor kaynaklarında düzeltildi, iki WASM motoru yeniden derlenip hash'leri güncellendi. Firmware çekirdek anahtarı cf-stm32-0.3.

Bluetooth kontrol laboratuvarı USART1 ve kesmeli ring buffer'a taşındı. Çevre istasyonu haricî MCP3008 yanında MCU ADC'sini, alarmda TIM2 PWM'yi kullanır. Hazır devreler önceki uzun kablo segmentlerinden kaçınarak ayrı koridorlar seçer; ortak pin çıkışları dışında üst üste uzun hat kalmaz. Eski devre için Kabloları düzenle eylemi geri alınabilir.

Detaylar [STM32-PERIPHERALS](../../../dist/notices/STM32-PERIPHERALS.md), kabul [QA_0.44](https://github.com/furkanyrtsvr/wirevo/blob/c867d52a6474f82a01240d5449e26a0708c9c8bc/QA_0.44.md), sonraki sıra [STM32_PLAN_0.44](../plans/STM32_PLAN_0.44.md). Altı STM32 ve toplam26 kart korunur. Tam vendor HAL, tüm çevrebirimler, tüm STM32 kartları ve STM32 C++/MicroPython henüz bitmiş değildir.

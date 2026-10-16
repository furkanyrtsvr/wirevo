# CircuitForge 0.47 · WeAct ve STM32 kapsam denetimi

14 Ekim 2026. WeAct F401CC/F401CE/F411CE kendi pin/bellek/25MHz PLL/LED/KEY/terminal profilleriyle eklendi. Toplam29 kart,9 STM32. Genuine C17/ARM ile USART1/ADC1/TIM2/SPI1/I²C1 ve laboratuvar kabulü. TIM2 CR1 yazımı artık sayaç fazını sıfırlamaz; CEN duraklatma CNT/PWM durumunu korur. Router küçük kesirli segment çakışmalarını ağır maliyetle engeller; testler gevşetilmedi.

STM32 kapsamı penceresi 17 alt sistemin çalışan modelini ve kalan ayrıntılarını gösterir. STM32'nin tümü bitmiş değildir. [Denetim](../../../dist/notices/STM32-AUDIT.md), [WeAct kaynaklar](../../../dist/notices/STM32-WEACT.md), [kabul](https://github.com/furkanyrtsvr/wirevo/blob/c867d52a6474f82a01240d5449e26a0708c9c8bc/QA_0.47.md), [devam](../plans/STM32_PLAN_0.47.md).

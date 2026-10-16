# 0.53 · STM32 EXTI, DMA, ADC ve gerçek watchdog reseti

STM32 GPIO kesmeleri artık fiziksel devre kenarlarından NVIC/ISR'ye ulaşır. DMA gerçek ARM bus üzerinden Flash/SRAM/çevrebirim transferi yapar; ADC1/SPI1/USART1+2 request mapping, circular, HT/TC/TE ve flag temizliği vardır. Pin penceresi projeye özel EXTI ve ADC DMA başlangıç kodu üretir.

ADC injected/offset/JAUTO, analog watchdog, EXTI11/TIM2 regular trigger. IWDG/WWDG timeout ARM firmware'i reset vektöründen yeniden başlatır; RCC nedeni ve startup data/bss/NVIC temizliği doğrulanır. CRC legacy word engine dokuz kartta bağımsız referansla karşılaştırılır. Cortex-M WFE/SEV event mekanizması eklenir.

Birleşik Nucleo laboratuvarı iki pot + ADC DMA + B1 kesmesi + LED + watchdog/CRC; düzenli net label bağlantıları. A ölçüm, B kesme sayısı, R watchdog reseti. `docs/examples/stm32-acceptance-053.json` Dosya→Proje aç ile açılır.

Kabul ve motor hashları QA_0.53.md/provenance.json. RTC/backup, ileri timer/saat, USB/CAN ve kalan donanım kapsamı açıkça kayıtlıdır. Tüm STM32 silikonunun tamamlandığı iddia edilmez.

# CircuitForge 0.53 kabul · 14 Ekim 2026

Yeni modeller gerçek Clang C17 firmware ve native Cortex-M3/M4F motoru üzerinden doğrulanır. EXTI0..15 IRQ/mask/PR/SWIER/WFE; native bus DMA, ADC/SPI/UART request mapping, circular/HT/TC/TE; ADC injected/JAUTO/watchdog/EXTI11/TIM2 trigger; IWDG/WWDG gerçek reset/RCC nedeni; CRC bağımsız referans.

Birleşik kabul labı `docs/examples/stm32-acceptance-053.json`: NucleoF401 iki pot → ADC DMA SRAM; B1 PC13 → gerçek EXTI15_10 → PA5 LED; R komutu → IWDG reset → data/bss ve IRQ başlangıcı. Otomatik kabul 1/1. Tarayıcı CUA/local4173 gerçek Clang3572B: ADC1024/3071; pot25→50% sonrasında2048/3071; B1IRQ1/LED1; CRC3750398507; R→WATCHDOG REFRESH STOPPED→BOOT IWDG RESET. Net label güç isimleri ortak ve pin başına etiketler ayrılmıştır; PCB gövdesinin içinden kablo geçmez.

Native Rust M3 327/327 ve M4F477/477. Bridge0.8 kaynak ve WASM yeniden derlendi. Hashlar provenance.json içinde. Source key cf-stm32-0.12.

İlk genel1148 koşusunda1139pass/9fail: eski SPI negatif testleri yeni destekli RX/TX DMA bitlerine hata bekliyordu. Beklenti register retention/no-request davranışına güncellendi; gerçek SPI DMA aktarımı ayrı ARM testlerindedir. Hatalı koşu kabul sayılmaz. İlk demo ISR line13 yerine pinPC13 almalıydı; düzeltme otomatik birleşik labda yakalandı/doğrulandı. CRC demo formatı destekli unsigned decimal ile gösterilir. Eski denemeler başarı sayılmaz.

SPI/cache son46/46. Genel son kabul **1149/1149**, fail/cancelled/skipped0;730744.648ms. Log `.sites-runtime/full053-accepted.log`, concurrency8. Build app shell422dosya/19533482B<20MiB; Clang ayrı cache.

STM32 tamamen tamamlanmış değildir. Güncel kalan kapsam `dist/notices/STM32-AUDIT.md` ve `docs/STM32_PLAN_0.53.md`; RTC/backup ve ileri timer/clock sıradadır. DokuzSTM32/29toplam kart, C17. Yeni kart veya işlevsiz dil seçeneği eklenmedi.

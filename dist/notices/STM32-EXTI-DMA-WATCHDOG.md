# STM32 EXTI / DMA / ADC / watchdog / CRC · 0.53

Destekli dokuz F103/F401/F411 kartında C17 firmware gerçek Cortex-M motorunda çalışır. GPIO EXTI0..15 port mux, yükselen/düşen kenar, maskeli pending, PR W1C, SWIER, NVIC ve WFE event davranışı içerir. `cf_exti_begin(pin,edge,pull)`: edge 0 rising / 1 falling / 2 both, pull 0 floating / 1 up / 2 down. `cf_exti_pending(pin)` ve `cf_exti_clear(pin)` **pin kimliği** alır; PC13 için 13 verilmez. ISR pending bayrağını temizlemelidir.

F1 DMA1 kanalları ve F4 DMA1/DMA2 streamleri native ARM bus üzerinden gerçek bellek okur/yazar. Normal/circular, width/increment, priority, HT/TC/TE ve flag temizliği modellenir. ADC1, SPI1 ve USART1/2 isteği vardır. FIFO/burst/DBM/PFLOW ve I²C DMA yoktur; desteklenmeyen ayarlar reddedilir. Transferler bus-cycle-accurate değildir. Hatalı bellek adresi/alignment TE üretir.

`cf_adc_dma_begin(pins,count,buffer,length,continuous,circular)` 12-bit sağ hizalı regular ADC dizisini SRAM'e aktarır. Count 1..16; buffer hizalı SRAM; tek dizi length=count. Continuous+circular arabellek firmware okurken değişebilir. API IRQ'yu otomatik açmaz. Pin penceresinde DMA modu projeye özel global volatile arabellek ve başlangıç kodu üretir.

ADC injected 1..4 sıra, JOFR/JDR signed offset, JEOC, regular preemption/resume ve JAUTO; analog watchdog eşikleri/IRQ; regular EXTI11 ve TIM2 CH2 (F4 CH3/CH4 de) trigger vardır. Dahili sıcaklık/VREF/VBAT, injected external trigger/discontinuous ve gerçek acquisition/calibration henüz yoktur. F1/F4 register farkları korunur.

`cf_iwdg_begin(prescaler,reload)` / `cf_iwdg_refresh()` bağımsız nominal LSI sayacını çalıştırır. F103 40 kHz; F401/F411 32 kHz. `cf_wwdg_begin(prescaler,window,counter,earlyIRQ)` / refresh APB1 pencere watchdog'udur. Timeout gerçek reset vektöründen yeniden başlatır; startup data/bss, GPIO/NVIC/SysTick yeniden kurulur. Dış sensörler/EEPROM MCU resetinde güç kaybetmez. RCC nedenleri `cf_reset_flags()` ve clear ile okunur. LSI toleransı/debug freeze/STOP ayrıntıları modellenmez.

`cf_crc_begin()`, `cf_crc_word(value)`, `cf_crc_value()` legacy 32-bit non-reflected 0x04c11db7 CRC içindir. Byte/halfword feed yoktur. IDR 8-bit; CR reset, RCC gate/reset vardır. Sonuç dokuz kartta bağımsız zlib/reflection referansıyla karşılaştırılmıştır.

Birleşik kabul devresi: `docs/examples/stm32-acceptance-053.json`. İki pot ADC DMA, Nucleo B1 PC13 EXTI, PA5 LED, watchdog reset, CRC. Terminal A ölçümü, B kesme sayısı, R watchdog beslemesini keser. Net label bağlantıları breadboard gerektirmez. Başlangıçtan sonra B1 LED'i değiştirir; R sonrası kesme sayısı/BSS sıfırlanır. Kontrol dosyaları: stm32-exti-dma, stm32-watchdog, stm32-acceptance testleri.

Kaynak: ST [RM0368](https://www.st.com/resource/en/reference_manual/DM00096844.pdf), [RM0008](https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [RM0383](https://www.st.com/resource/zh/reference_manual/dm00119316.pdf). Model kapsamının tamamı STM32-AUDIT.md'de tutulur.

# Wirevo 0.63 — STM32 uygulama kapsamı kapanışı

Wirevo’nun dokuz kartlık STM32 profili bu sürümle tamamlanıp donduruldu. F103 ADC2 ve Nucleo F401/F411 SDIO son açık donanım kapıları olarak gerçek ARM firmware, register, saat/reset ve kesme kabulüyle eklendi.

## ADC2

Blue Pill F103C6/C8/CB ve Nucleo F103RB’de ADC2 regular/injected sıra, continuous/discontinuous, analog watchdog, yazılım/dış tetik ve ortak ADC1_2 IRQ18 yolunu ADC1 ile aynı elektriksel pin çözümünden kullanır. `cf_adc2_config()` ve `cf_adc2_read()` C/C++ API’si vardır. F103 donanımında ADC2 DMA isteği bulunmadığı için DMA seçimi sessizce taklit edilmez; açık hata verir. F401/F411 profilinde ADC2 yoktur.

## SDIO / SDHC

Tam PC8–PC12 + PD2 pin grubunu dışarı çıkaran Nucleo F401RE/F411RE’de SDIO power/clock, command/response, FIFO, status/ICR/mask ve IRQ49 modellenir. SDHC tanıma; CMD0/2/3/7/8/9/12/13/16/17/18/24/25/55 ve ACMD41; 512 bayt tek/çok blok okuma-yazma desteklenir. `cf_sdio_begin()`, `cf_sdio_read_block()` ve `cf_sdio_write_block()` gerçek ARM kodudur. UFQFPN48 WeAct ve F103 kartlarında tam SDIO pin grubu olmadığı için özellik doğru biçimde yok gösterilir.

## Kapanış sözleşmesi

Dokuz kartın Wirevo uygulama profili artık yeni STM32 geliştirme bekleme listesi üretmez. C17/C++17 gerçek ARM firmware, MicroPython elektriksel devre modu, belgelenen çevrebirimler ve fiziksel net modelleri desteklenen üründür. Tam STM32 ürün ailesi, Cube/HAL uyumluluğu, cycle-accurate silikon, fiziksel PC USB, haricî CAN/SD kart ve laboratuvar düzeyinde analog/EMC davranışı ayrı ürün sınırıdır; çalışan özellik iddiası değildir ve “kalan Wirevo STM32 eksiği” olarak izlenmez.

Firmware parmak izi `cf-stm32-0.19`; native bridge 0.11 ile IRQ49 eklendi. Eski C/C++ firmware yeni SDK ile yeniden derlenir. Ayrıntı: `dist/notices/STM32-SUPPORT-PROFILE.md`; doğrulama: `docs/qa/README.md`.

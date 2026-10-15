> Güncelleme0.49: USART formatları ve uygun kartlarda fizikselUSART2 için [güncel kabul](STM32-SERIAL-FORMATS.md). Aşağıdaki önceki sürüm kapsamıdır.

> Güncel 0.46: [Donanım I²C1](./STM32-I2C1.md) altı kartta etkin. Aşağıdaki önceki sürümlerin I²C1 bekliyor bilgisi tarihsel kapsamdır.

> Güncel 0.45: [Donanım SPI1](./STM32-SPI1.md) altı kartta etkin. Aşağıdaki 0.44/öncesi donanım SPI bekliyor bilgisi tarihsel kapsamdır. I²C1 hâlâ plan.

# STM32 çevrebirimleri · CircuitForge 0.44

Altı mevcut STM32 kartında gerçek ARM C17 kodu USART1, ADC1 ve TIM2 register modelleriyle çalışır. Pin penceresinin **Bu projeye özel** bilgisi önemlidir: görev, etiket, hız, PWM frekans/duty ve üretilen kaynaklar yalnız açık projeye kaydedilir. Uygula öncesi taslaktır. Panel düzeni ise tarayıcı tercihidir; proje pin yapılandırmasıyla aynı kapsamda değildir.

## USART1

`cf_usart1_begin(baud,tx,rx)`, `cf_usart1_write(byte)`, `cf_usart1_read()` kullanılır. F103 PA9/PA10 veya birlikte remap PB6/PB7; F4 AF7 PA9/PB6 TX ve PA10/PB7 RX, F411 PA15 TX kullanılabilir. GPIO/AF ve RCC doğru kurulmalıdır. Pin penceresi TX ve RX'in birlikte seçilmesini, tek sinyal atamasını ve F103 remap grubunu doğrular. Her iki MCU ailesinde USART1 IRQ37 gerçek NVIC/ARM exception akışını kullanır.

F103 USART1 0x40013800, F4 USART1 0x40011000. SR/DR/BRR/CR1 registerleri; 8N1 / OVER16; gerçek TX start/data/stop kenarları. Ayrı TDR ve shift register, TXE/TC farkı, RXNE, ORE ve FE. Yeni veri RDR doluyken gelirse önceki bayt korunur, yeni bayt kaybolur. SR ardından DR okuma hata bayraklarını temizler; DR tek başına RXNE'yi temizler. Baud APB saatinden hesaplanır. Parite, 9-bit, diğer stop bitleri, CTS/RTS, DMA, LIN ve USART3/6 bu kabulün kapsamında değildir.

Nucleo C04 seri terminali USART2/ST-LINK VCP byte adaptörü olarak korunur; PA2/PA3 fiziksel header ayrımı değişmez. Blue Pill fiziksel USART1 ve terminal aynı birim olduğundan fiziksel baud geçerlidir. Fiziksel USART1 açıkken terminal kutusundan RX kuyruğuna sessizce veri eklenmez; bağlı UART/Bluetooth cihazı kullanılmalıdır. TX baytları terminalde izlenebilir. Bu bir USB veya gerçek RF emülasyonu değildir.

Bluetooth kontrol laboratuvarı artık **PA9 TX / PA10 RX / PB5 STATE**, USART1 RXNE kesmesi ve 128-byte sınırlı yazılım ring buffer kullanır. Modül 9600 baud; LF ile L1/L0/A komutları. Sanal PC tarama/bağlanma ve LED/ADC cevabı mevcut. Eski PB8/PB9 yazılım UART örneği temel kontroller altında korunur.

## ADC1

`cf_adc_config(pin)` analog modu/saatleri kurar; `cf_adc_read(pin)` 0–4095 döndürür. Gerçek devre çözümündeki pin voltajı sabit 3.3 V referansa göre örneklenir. GPIO kanal0–15 (kartta mevcut PA0–7, PB0–1, Nucleo PC0–5), tek regular kanal, right aligned 12-bit, yazılım trigger. F103 SWSTART22 / EXTSEL=111 / EXTTRIG20; F4 SWSTART30. EOC, DR okuma ile temizleme, sampling kodları ve dönüşüm süresi; ADC1 IRQ18 gerçek ARM kesmesi. F103 ADC saati 72/6=12 MHz; F4 84/4=21 veya 100/4=25 MHz. Saat ve boşta/voltaj sınırları denetlenir.

F103 taban 0x40012400 ve RCC ADCPRE; F4 taban 0x40012000, ortak CCR 0x40012304. F1 kalibrasyon bitleri modelde tamamlanmış kabul edilir; gerçek analog kalibrasyon/stabilizasyon, noise/INL/DNL ve ADC sample-hold kaynak empedansı henüz modellenmez. Scan, continuous, injected, DMA, dış trigger, dahili sıcaklık/VREF ve F4 10/8/6-bit modları destek kapsamında değildir.

Çevre istasyonunda pot OUT hem MCP3008 CH0 hem MCU PB0/ADC1_IN8'e bağlıdır. Terminal `ADC=512 NATIVE=2048` ile haricî 10-bit ve MCU 12-bit değerleri birlikte gösterir. Sıcaklık eşiği MCU ADC'den 20–40 °C olarak hesaplanır. SHT31 CRC ve OLED SPI/I²C sürücüleri korunur.

## TIM2 PWM1

`cf_pwm_begin(pin,hz,duty)` ve `cf_pwm_duty(pin,duty)`; PA0–3 (kart profiline göre kullanılabilir), 1–20000 Hz ve %0–100. F103 alternate push-pull/default MAPR; F4 AF1. TIM2 0x40000000, gerçek PSC/ARR/CCR, PWM1 edge-aligned up-count, preload/UG, polarity ve IRQ28 update/UIF. F103 16-bit, F4 32-bit counter/ARR/CCR; PSC16-bit. APB bölücüsü ve timer ×2 kuralı kullanılır. Kanallar aynı timer frekansını paylaşır; pin penceresi farklı frekansları reddeder. LED/DC ve mantık analizörü gerçek pin kenarlarını alır.

Çevre istasyonunda PA0 alarmı TIM2_CH1'dir; kod alarm koşuluna göre duty %0/%100 yapar. Pin penceresinden başlangıç duty seçilebilir; `main` daha sonra değiştirir. PWM duty %25 /1 kHz ayrıca gerçek ARM ve LED devresinde kabul edildi. Center-aligned, down-count, encoder/capture, one-pulse, advanced/dead-time, DMA ve diğer timerler kapsam dışıdır. CEN yeniden açılması bu modelde fazı yeniden başlatır; ayrıntılı pause/resume sonraki kapıdır.

## Motor ve kablo düzeltmeleri

Gerçek Cortex-M3/M4F motoru dış IRQ hatlarını alır; NVIC bank adresleri, 32-bit bank eşlemesi, ICER/ICPR okumaları ve IRQ37/38'i de kapsayan exception alanı düzeltildi. WFI sırasında zaman ve çevrebirim olayları ilerler. Motor hash ve yerel yamalar `../stm32/provenance.json` içinde; vendor kaynakları teslim ZIP'inde bulunur.

Kablo rotası önceki rotaların uzun orta bölümlerine bindirme maliyeti ekler ve ayrı koridorlar seçer. İki ana laboratuvar × altı kartta uzun ortak orta segment **0** kabulü vardır. Ortak fiziksel pin çıkışı paylaşılabilir; kesişme aynı şey değildir. Yeni örnekler güncel rotaları kullanır. Eski proje **Kabloları düzenle** ile yenilenir ve geri alınabilir; kullanıcı projeleri kendiliğinden yeniden yazılmaz.

## Birincil kaynaklar

- [F103 RM0008 Rev21, ADC §11 / TIM §15 / USART §27](https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf)
- [F401 RM0368 Rev6, ADC §11 / USART §19](https://www.st.com/resource/en/reference_manual/rm0368-stm32f401xbc-and-stm32f401xde-advanced-armbased-32bit-mcusstmicroelectronics.pdf)
- [F411 RM0383 Rev4, TIM §13 / USART §19](https://www.st.com/resource/en/reference_manual/dm00119316.pdf)
- [F103 DS5319, ADC Table47](https://www.st.com/resource/en/datasheet/stm32f103c8.pdf), [F401 Table66](https://www.st.com/resource/en/datasheet/stm32f401re.pdf), [F411 Table65](https://www.st.com/resource/en/datasheet/stm32f411re.pdf)

Tüm STM32 ailesi, tam STM32Cube HAL, donanım I²C/SPI, C++/MicroPython ve USB/CAN/Ethernet bu sürümde tamamlandı denmez. Pin penceresinde çalışan roller ile kalan datasheet planları ayrılır. Yeni kartlar aynı CPU'nun adı değiştirilerek eklenmez.

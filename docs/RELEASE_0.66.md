# Wirevo 0.66 — STM32 ileri modlar ve sanal ağlar

Mevcut dokuz F103/F401/F411 kartı üzerinde çalışıldı; başka aile eklenmedi. Çipte bulunmayan donanım oluşturulmaz, ayrılmış kart pinleri açılmaz.

## Gerçek native ARM ile doğrulanan eklemeler

- F1 halfword/F4 atomic iki word ile 64-bit Flash programlama; BSY/EOP ve Flash fetch beklemesi. Nominal program süresi40µs; erase gecikmesi F1 20ms/F4 400ms modelidir, sıcaklık/gerilim karakterizasyonu değildir.
- F4 PCROP: reset-latched SPRMOD sektörleri execute-only, native D-bus okumaları0/RDERR; protected sektördeki Thumb fonksiyonu yine yürür. PCROP kaldırma RDP1→0 mass erase geçişine bağlıdır.
- Dokuz kartta RDP: user Flash içindeki firmware okumaya devam ederken gerçek SRAM Thumb rutininin Flash veri yüklemesi engellenir. Debug/host okuması da reddedilir.
- TIM1 TRGO→TIM2 ITR0 external-clock/prescaler zinciri gerçek C17 ARM firmware ile çalışır.
- SPI tek-hat receive-only: fiziksel MOSI padini sürmeden pull-up seviyesini okur. USART half-duplex RX, başka USART’ın gerçek hattını kendi TX padinden alır.
- F4 USB host kanal0 gerçek IRQ67/FIFO; F103 normal CAN TX gerçek peer ACK ve IRQ19. Peer’ler sanal register/protokol aygıtlarıdır, fiziksel PC USB/CAN transceiver değildir.

## Register/hat-zamanlayıcı kabulüyle eklenenler

- Timer ITR reset/gate/start/external-clock; TIM1 break/MOE/AOE/idle ve repetition. ITR bağlantıları ST tablosuna göredir; bulunmayan timer kaynağı bağlanmaz.
- SPI RXONLY, bidirectional TX/RX, TI frame-sync; USART IrDA pulse, synchronous CK ve smartcard prescaler/guard/NACK. Half-duplex ve smartcard hattında haricî pull-up gerekir.
- I²S right-justified slot offset, MCLK ve gerçek erişilebilir I²S2/3 MCK padleri. F411 PA3/PA6/PB10 alternatifleri korunur; bulunmayan MCK pinleri uydurulmaz.
- I²C ENPEC CRC8, PEC gönderimi/son-bayt hata kontrolü; nominal clock startup/ready ve backup-regulator geçişi, F4 RTC tamper dijital filtre.
- OTG_FS sekiz host kanalı, port reset/connect/disconnect, XFRC/CHH/NAK/STALL/ACK/error/IRQ, multi-packet ve ISO. USB paneli MCU-host firmware’i için ayrı sanal vendor echo aygıtı bağlar/çıkarır; descriptor/adres/configuration/EP1 durumu olan gerçek bir protokol modelidir. Native C host driver’ını firmware yazmalıdır.
- F103 sanal CANBus düğümleri; standard/extended/RTR arbitration, bitrate uyumlu gerçek ACK, filtre/FIFO teslimi, NART/retry, TEC/bus-off/ABOM. CANBus uygulama model API’sidir; devre kütüphanesinde fiziksel CAN transceiver yoktur.
- Nucleo SDIO: SDHC/SDSC/MMC seçimi, SDSC/MMC byte adresleme, CMD16 blok uzunluğu, MMC CMD1/11/20 stream ve partial FIFO word/sparse-block geçişi. `runtime.sdio.setCardType('mmc')` model API’si; varsayılan SDHC korunur.

## Doğrulama kapsamı ve kapanmayan sınırlar

Yalnız `npm run test:stm32-066` (`tests/stm32-v066-*.test.mjs`) çalıştırılır. Önceki 166 kabul dahil eski STM32/genel testler kullanıcı talebiyle çalıştırılmadı. Browser build ve native M3/M4F kaynak derlemeleri kontrol edilir. Eski regresyonların tekrar geçtiği iddia edilmez.

Bu sürüm tüm fiziksel silikonun eşdeğeri değildir. Orijinal ST ROM binary/USB DFU, core fault/priority/pipeline ve cycle-accurate bus arbitration; tam SMBus ARP/host-notify, smartcard otomatik retry, tüm stereo/advanced-timer/USB PID-hata varyantları; F103 USB PMA ISO/double-buffer ve fiziksel PHY/transceiver/analog ölçüm karşılaştırması tamamlanmadı. Bu kalemler destekli gibi gösterilmez.

F401/F411 OTG_FS’in dahili DMA engine’i yoktur; GAHBCFG DMAEN için sahte DMA eklenmez. Fiziksel güç tüketimi, osilatör toleransı ve bozulma sınırları nominal dijital davranıştan farklıdır.

Kaynaklar: [RM0383](https://www.st.com/resource/en/reference_manual/rm0383-stm32f411xce-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [PCROP AN4701](https://www.st.com/resource/en/application_note/dm00186528-proprietary-code-readout-protection-on-microcontrollers-of-the-stm32f4-series-stmicroelectronics.pdf), [ST pin verileri](https://github.com/STMicroelectronics/STM32_open_pin_data), [ST timer interconnect AN4646](https://www.st.com/resource/en/application_note/an4646-peripheral-interconnections-on-stm32f401-and-stm32f411-lines-stmicroelectronics.pdf).

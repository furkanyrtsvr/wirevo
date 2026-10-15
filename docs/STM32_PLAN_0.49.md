# STM32 devam planı · 0.49

Bu belge çalışma bağlamıdır; kullanıcı talebi önceliklidir. Önce QA_0.49.md, STM32-SERIAL-FORMATS.md, STM32-ITSTATE.md ve STM32-AUDIT.md okunur. Dokuz STM32 / toplam29 kart. 0.48 eksik tarayıcı EEPROM kabulü tamamlandı; SPI/USART biçim kapısı ve ARM ITSTATE düzeltmesi ilerledi. Tüm STM32 bitmiş değildir.

1. ADC: regular scan/continuous, EOC ve F4 EOCS/OVR farklılıkları, internal temperature/VREF/VBAT, analog acquisition, external trigger/injected/DMA. Önce F401 RM0368 §11.3.5/11.3.8/11.8.2 ve RM0383, F103 RM0008 aile farkları doğrulanır. Scan gerçek rank sırası ve farklı fiziksel DC kaynaklarıyla; continuous canlı değişim/durdurma/IRQ; OVR gecikmiş DR tüketimiyle test edilir. F4 EOCS=1 overrun detection ve recovery; F1'de aynı register davranışı varsayılmaz.
2. TIM2 input capture/encoder/center-aligned, compare IRQ, PSC alt fazının CEN/RCC pause/resume korunması. F103 16bit/F4 32bit farkı, gerçek net kenarları ve ISR kabulü. Diğer timerlar ayrı peripheral kimliğiyle gelir.
3. SPI hardware NSS/slave/remap/CRC/DMA/TI/I²S, USART2 alternatif/remap, USART3/4/5/6 bulunan MCU'larda, OVER8/flow/synchronous/LIN/smartcard/half-duplex ve gerçek VCP biçimleri. Yalnız catalogue alias eklenmez.
4. I²C Fast/slave stretching/chained read→read/write/arbitration/DMA/SMBus/PEC/analog rise-time ve RCC exact freeze. EEPROM running-runtime/MCU reset kalıcılığı vardır; JSON/reload kalıcılığı ayrı ürün kararıdır.
5. STM32 C++17 startup/init-array/runtime/heap, ardından gerçek MicroPython portu. Çalışmayan dil menüye eklenmez. RTC/watchdog/EXTI/DMA/CRC/RNG/USB/CAN/ETH/SDIO/Flash/MPU/debug/full clock/power dahil17 audit başlığı korunur; her MCU her periferik içermez.
6. Sonraki kart ailesi RP2040/Pico: resmî pinout, gerçek Cortex-M0+ ve compiler/memory/DC/IRQ kabulü. Nucleo F3/G4/L4 ayrı register ailesi. Kullanıcı farklı kartlar istediği için plan korunur; STM32 açık kalanları gizleyerek atlanmaz.

İki kapsamlı lab/kart: EEPROM alarm çevre istasyonu ve Bluetooth kontrol. Eski kullanıcı projelerine otomatik kaynak/kablo göçü yok. Pin ayarları yalnız açık projeye kaydedilir; Uygula öncesi taslak. Kablolar dış header/ayrı koridor/net label ile korunur.

Yayın same Site exact pushed SHA + native saved version/deploy, tam ZIP/hash/devir. Credentials/node_modules/target/research/.sites-runtime ZIP dışı. ARM motor rebuild için scripts/stm32/generate-provenance.mjs ile yeni hash ve provenance birlikte üretilir.

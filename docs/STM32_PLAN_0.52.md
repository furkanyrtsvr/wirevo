# STM32 devam planı · 0.52

Bu belge bağlamdır; kullanıcının talebi önceliklidir. HC-05 görünümü ve X/Y aynalama tamamlandı; Opamp mevcut Temel kütüphanesinde doğrulandı. TIM2 encoder, output compare/PWM2, match IRQ, UDIS/URS ve one-pulse ilerledi. Tüm STM32 bitmedi; dokuz STM32/29toplam kart korunur.

1. TIM2 digital filter, TRC, remap, encoder index/trigger, center/down count ve PSC fractional phase/CEN/RCC freeze. Diğer TIM periferikleri ayrı register/aile kabulü; alias ile destek iddiası yok. Encoder A/B pin planı, C API ve gerçek GPIO/IRQ kapıları korunur.
2. ADC injected/watchdog/internal channels/external trigger/DMA ve acquisition/calibration/noise. F1/F4 EOC farklarını koru.
3. DMA/EXTI register ve gerçek firmware/IRQ kapıları. Ardından I²C Fast/slave/arbitration/DMA, SPI NSS/slave/CRC/DMA ve USART ileri modları.
4. RTC/watchdog/USB/CAN/ETH/SDIO/Flash/MPU/debug/full clock/power: STM32-AUDIT.md içindeki17başlık korunur; MCU’da olmayan periferik eklenmez.
5. Gerçek STM32 C++17 startup/runtime/initarrays/heap; sonra genuine MicroPython. İşlevsel olmayan dil seçeneği ekleme.
6. Kullanıcı farklı kartlara geçmek istiyor: RP2040/Pico ayrı Cortex-M0+ veya Nucleo F3/G4/L4 ayrı register aileleri. Resmî pinout, derleyici, bellek, DC ve register/IRQ kapıları gereklidir.

Kullanım: X sağ/sol, Y yukarı/aşağı çalışma alanı eksenleridir; döndürülmüş bileşende de bu anlam korunur. Breadboard aynalandığında takılı bileşenlerin pin/hole kimlikleri korunur; tek takılı bileşen aynalandığında breadboard’dan çıkar. Undo/redo, kopyalama ve JSON/ZIP bayrakları korur. HC-05 esinli çizim mevcut5pin geometriyi korur; sanal BLE/UART modeli HC-05 Classic SPP veya AT firmware emülasyonu değildir. Gerçek BLE paneli ayrı kalır.

Kabul kayıtları QA_0.52.md ve STM32-TIM2-EVENTS.md. Her release: uygun testler, build, tarayıcı, aynı Sites yayını, tamZIP/hash/devir. Credential/node_modules/research/target/.sites-runtime dışarıda. ARM çekirdek WASM değişmedi; yeni Rust rebuild gerekmiyor. Source key cf-stm32-0.11.

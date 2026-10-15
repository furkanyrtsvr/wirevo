# STM32 devam planı · 0.50

Bu belge çalışma bağlamıdır; kullanıcı talebi önceliklidir. QA_0.50.md, STM32-ADC-SEQUENCE.md, STM32-SERIAL-FORMATS.md, STM32-ITSTATE.md ve STM32-AUDIT.md okunur. Mevcut dokuz STM32 / toplam29kart. 0.48 EEPROM tarayıcı kabulü, SPI/USART biçimleri, ADC regular tarama/continuous ve ARM ITSTATE/R7 düzeltmeleri ilerledi. Tüm STM32 bitmiş değildir.

1. TIM2 input capture/encoder/center-aligned, compare IRQ ve PSC alt fazının CEN/RCC pause/resume korunması. Önce reference manual/errata, sonra gerçek fiziksel net kenarı + C register/ISR kabulü. F10316bit/F4 32bit farkı; diğer timerlar ayrı kimlik/register ile eklenir.
2. ADC internal temperature/VREF/VBAT, analog acquisition/source impedance/noise/calibration, external trigger/injected/watchdog/DMA. F1/F4 EOC/internal channel farkları varsayılmaz. 0.50 modelinin scan/continuous/EOCS/OVR doğru çalışan kısmı korunur; exact RCC freeze/saat değişimi alt fazı tamamlanmadı.
3. SPI hardware NSS/slave/remap/CRC/DMA/TI/I²S; USART2 alternatif/remap ve MCU'da bulunan USART3/4/5/6, OVER8/flow/synchronous/LIN/smartcard/half-duplex. Nucleo C04 SB62/63OFF başlıklar kapalı; VCP byte terminalinin tüm parity/baud ayrıntıları tamamlanmadı.
4. I²C Fast/slave stretching/chained read→read/write/arbitration/DMA/SMBus/PEC/analog rise-time ve RCC exact freeze. EEPROM runtime/MCU reset state vardır; JSON/reload kalıcılığı ayrı ürün kararıdır.
5. STM32 C++17 startup/init-array/runtime/heap, ardından gerçek MicroPython portu. Çalışmadan menüye ekleme. RTC/watchdog/EXTI/DMA/CRC/RNG/USB/CAN/ETH/SDIO/Flash/MPU/debug/full clock/power dahil17audit başlığı korunur; herMCU herperiferik içermez.
6. Farklı kart isteği: RP2040/Pico resmî pinout, gerçek Cortex-M0+ compiler/memory/DC/IRQ kapıları; NucleoF3/G4/L4 ayrı register ailesi. Catalogue alias ekleyerek çalışıyor iddiası yapılmaz.

İki kapsamlı hazır lab/kart: EEPROM alarm çevre istasyonu ve Bluetooth kontrol. ADC üç kanallı kabul JSON'u ayrıca teslim edilir; hazır örnek sayısı kontrolsüz çoğaltılmaz. Eski kullanıcı projelerine otomatik kaynak/kablo göçü yok. Pin ayarları yalnız açık projede; Uygula öncesi taslak. Kullanıcı kodu main içinde yeniden ayar yapabilir.

Her motor değişiminde M3/M4F rebuild + scripts/stm32/generate-provenance.mjs + native Rust ve genuine firmware kapıları. Browser acceptance motor hash reload ile yapılır. Source exact clean pushed SHA, same Sites native saved version/deploy, tam ZIP/hash/devir. Credentials/node_modules/target/research/.sites-runtime paket dışı.

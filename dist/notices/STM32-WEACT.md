# WeAct Black Pill · 0.47

Üç ayrı profil: STM32F401CCU6 84 MHz / 256 KiB Flash / 64 KiB SRAM; STM32F401CEU6 84 MHz / 512 KiB / 96 KiB; STM32F411CEU6 96 MHz (USB uyumlu; azami 100 MHz) / 512 KiB / 128 KiB. CC eski SKU için V3 header uyumlu topoloji kullanılır; V3 üretici şeması CE modellerini gösterir. Klonların her revizyonunu temsil etmez.

Orijinal vector çizim: USB-C, UFQFPN48, kristaller, pasifler, RESET/BOOT0/KEY, ayrı SWD ve boş opsiyonel SPI flash footprint. Kullanılmayan footprint üzerinde çalışan flash varmış gibi davranılmaz. Board Shape 52,38 × 20,78 mm oranı ve 20+20 header pad sırası korunur.

USB üstte, bileşen tarafı: sol P2 yukarıdan PB12 PB13 PB14 PB15 PA8 PA9 PA10 PA11 PA12 PA15 PB3 PB4 PB5 PB6 PB7 PB8 PB9 5V GND 3V3. Sağ P1 yukarıdan 5V GND 3V3 PB10 PB2 PB1 PB0 PA7 PA6 PA5 PA4 PA3 PA2 PA1 PA0 NRST PC15 PC14 PC13 VBAT. Tekrarlanan güç pinleri aynı elektriksel nettir.

25 MHz HSE, 32,768 kHz LSE. PC13 LED 3V3→1 kΩ→mavi LED→PC13, aktif LOW. KEY PA0→330Ω→GND, haricî pull-up yok; INPUT_PULLUP veya kullanıcının direnci gerekir. PB2/BOOT1 10 kΩ pull-down. BOOT0/NRST görsel ve belgelenmiş; boot-ROM, fiziksel reset/option bytes emülasyonu henüz yok.

PA11/PA12 USB ve PC14/PC15 LSE için ayrılmıştır. PA13/PA14 ayrı SWD konektöründe; ana GPIO headerı değildir. SWD-only profilinde PA15/PB3/PB4 kullanılabilir. UFQFPN48 üzerinde PC0..5/PB11 yoktur. ADC yalnız PA0..7/PB0..1. USART1 PA9/PB6 TX ve PA10/PB7 RX; F411 ayrıca PA15 TX / PB3 RX, F401 bu alternatifleri sunmaz. Terminal USART1 kullanır; Nucleo USART2 VCP varsayımı bu kartlara taşınmaz. 3,3 V devreler kullanılır; pin bazında gerçek hasar/akım sınırı modeli yoktur.

0.59: F411 varsayılan 96 MHz, PLLQ8 ile USB 48 MHz; F401 84 MHz / PLLQ7. [OTG FS vendor device / FIFO / IRQ67](STM32-OTG-FS.md) sanal host ile doğrulandı. Opsiyonel SPI flash yazılım/cihaz modeli yoktur. Tüm AF, RTC, SWD/JTAG, USB, BOOT ve güç modları için [denetim kaydı](STM32-AUDIT.md) geçerlidir.

## Birincil kaynaklar

- [WeAct üretici deposu ve sürümler](https://github.com/WeActStudio/WeActStudio.MiniSTM32F4x1)
- [V3.0 üretici şeması](https://github.com/WeActStudio/WeActStudio.MiniSTM32F4x1/blob/master/Hardware/legacy%20version/MiniF4x1Cx_V30%20SchDoc.pdf)
- [V3.0 Board Shape](https://github.com/WeActStudio/WeActStudio.MiniSTM32F4x1/blob/master/Hardware/legacy%20version/MiniF4x1Cx_V30%20Board%20Shape%20%E5%A4%96%E5%BD%A2.pdf)
- [ST F401CC · DS9716](https://www.st.com/resource/en/datasheet/stm32f401cc.pdf)
- [ST F401CE · DS10086](https://www.st.com/resource/en/datasheet/stm32f401ce.pdf)
- [ST F411CE · DS10314](https://www.st.com/resource/en/datasheet/stm32f411ce.pdf)

14 Ekim 2026: paket/pin/USART AF ve bellek üretici/ST kaynaklarıyla karşılaştırıldı. Fiziksel kart ölçümü yapılmadı.

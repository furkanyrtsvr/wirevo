# Wirevo 0.111.0 — nRF52840 C17 eğitim modeli

Dört ayrı kart: kırmızı SuperMini / Pro Micro nRF52840, nice!nano v2, XIAO nRF52840, XIAO nRF52840 Sense. Gerçek referanslara göre özgün SVG; dışarıda okunabilir pin adları; kart LED’i ve reset etkileşimi.

Tarayıcı Clang → hedef/CRC kontrollü Thumb firmware → ayrı nRF52840 çevrebirim modeli / ortak ARMv7E-M komut çekirdeği. 64 MHz, 1 MiB flash, 256 KiB SRAM. GPIO/GPIOTE, timer/NVIC, sınırlı SAADC/PWM/UART/UARTE/TWIM/SPIM EasyDMA. Yeni nRF debug okuyucusu, linker-GC ile atılmış fonksiyonların DWARF satırlarını ayıklar; breakpoint gerçek komut adresinde durur.

Dokuz yeni doğrulama: dört profilde aynı SHT31 + EEPROM + LCD + MCP3008 + ADC/PWM/UART devresi; dört kartta tact/LED/reset; fiziksel UARTE even-parity loopback ve SRAM sınırı; timer IRQ/GPIOTE; FPU/breakpoint/satır/değişken; worker ready/run/pause/reset/step. Eski testler çalıştırılmaz.

BLE, SoftDevice, Zephyr/ZMK, nRF Connect SDK, USB HID/bootloader, tam güç yönetimi, Sense dahili IMU/PDM ve %100 çevrim doğruluğu dahil değildir. USB HID ayrı USBD/host modellemesi gerektirir; ilk sürümde çalışıyor olarak sunulmaz.

[Model kapsamı ve referanslar](../dist/notices/NRF52-MODEL.md). Mevcut projeler korunur; uygulama önbelleği yeni dosyalar için 32 MiB üst sınırla sınırlıdır (Clang ayrı önbellek).

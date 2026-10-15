# Classic ESP32 / ESP32-S2 CPU kabul kapısı

12 Ekim 2026. Salt okunur araştırma sonucu; mevcut kart kataloğuna çalışır destek eklenmedi.

Yerel resmî ESP-EMU0.48 WASM: `esp32`, `esp32s2`, `esp32c2`, `esp32c61` constructor tarafından kabul edilir, fakat `load_default_rom()` **no embedded ROM available** hatası verir; 160MHz/tek hart fallback görünür. S3 ROM240MHz ve S31 ROM320MHz yüklenir. Constructor başarısı doğru CPU desteğini kanıtlamaz. [Resmî motorun](https://github.com/espressif/esp-emulator) güncel sürümü v0.48.0; destekli hedef listesinde Classic/S2 yoktur.

Yerel Clang22 WASM `-target xtensa-esp-elf -mcpu=esp32` ve `esp32s2` ile minimal C17 nesnesini derledi:752 byte. Bu makine kodu üretimi kapısıdır; ROM yürütme veya simülasyon değildir.

[Espressif QEMU](https://github.com/espressif/qemu) esp-develop9.2.2, incelenen SHA febae182e132e4055529be423a818225ebddaa3a: Classic makine/ROM mevcut, S2 makinesi yok. [Resmî özellik matrisi](https://github.com/espressif/esp-toolchain-docs/blob/main/qemu/README.md) GPIO matrix/IOMUX, I2C ve GP-SPI'yi eksik gösterir. [qemu-wasm](https://github.com/ktock/qemu-wasm) yayımlanan x86_64/aarch64/riscv64 deneyidir; Espressif Xtensa için hazır browser motoru kanıtı yok. [Velxio](https://github.com/davidmonterocrespo24/velxio) ESP için sunucu QEMU shared-library kullanır; AGPLv3/ticari lisans ve ayrı mimari. Bunlar mevcut local-only browser yürütmeye doğrudan eklenemez.

Resmî [ROM ELF dağıtımı](https://github.com/espressif/esp-rom-elfs) Apache2.0 ve üçüncü taraf bildirimleri; QEMU bütünü GPLv2. Olası WASM portu kaynak/patch/build talimatlarını ve lisansları kapsamalıdır. Makinede Docker/emcc/qemu-system-xtensa PATH'te yoktur; WSL bulunması derleme ortamı kabulü değildir.

Sonraki sıra: pinlenmiş native Espressif QEMU → ROM/ELF/UART → GPIO iki banka ve GPIO34–39 input-only/DC → deterministik WASM step/register/RAM/GPIO/UART/reset/stop → SHT31/MCP3008 ve güç kesme. S2 ayrı SoC/ROM/MMIO kabulüdür; S3 adını değiştirmek yeterli değildir. C2/C61/S31 de kendi CPU/toolchain/başlık kapılarıyla ilerler.

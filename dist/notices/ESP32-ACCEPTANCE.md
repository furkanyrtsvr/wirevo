# CircuitForge 0.40 — ESP32 kabul raporu

12 Ekim 2026. Yayımlanan 14 ESP kartı için kapsam onaylandı. **321/321 katalog kombinasyonu**, **42/42 worker yaşam döngüsü**, **14/14 bütünlük ve GPIO sınır kontrolü** geçti.

| Fiziksel kart | Arduino C++ | C17 | MicroPython | Sonuç |
|---|---:|---:|---:|---|
| ESP32-C3 DevKitM-1 | 18 | 3 | 2 | Geçti |
| ESP32-C6 DevKitC-1 · v1.2 | 18 | 3 | 2 | Geçti |
| ESP32-S3 DevKitC-1 · v1.0 | 18 | 3 | 2 | Geçti |
| ESP32-H2 DevKitM-1 · v1.3 N4 | 18 | 3 | 2 | Geçti |
| ESP32-C5 DevKitC-1 · v1.2 N8R8 | 18 | 3 | 2 | Geçti |
| ESP32-P4 Function-EV · v1.5.2 J1 | 18 | 3 | 2 | Geçti |
| Seeed XIAO ESP32-C3 | 18 | 3 | 2 | Geçti |
| Seeed XIAO ESP32-C6 | 18 | 3 | 2 | Geçti |
| Seeed XIAO ESP32-S3 | 18 | 3 | 2 | Geçti |
| Arduino Nano ESP32 · NORA-W106 | 17 | 3 | 2 | Geçti |
| ESP32-C3 DevKitC-02 | 18 | 3 | 2 | Geçti |
| ESP32-C6 DevKitM-1 | 18 | 3 | 2 | Geçti |
| ESP32-S3 DevKitM-1 | 18 | 3 | 2 | Geçti |
| ESP32-C3 DevKit-RUST-1 | 18 | 3 | 2 | Geçti |

293 native örnek gerçek Clang ile yeniden derlendi, ESP-EMU CPU'da GPIO/devre bağlanarak çalıştırıldı; UART ve sensör/ekran/kontak çıktıları doğrulandı. 28 Python katalog programının asıl kaynakları resmî yorumlayıcıda çalıştırıldı; yalnız testin await sınırında sonlandırıldı. Kaynak yorumlama ile sonuç üretilmedi. Tüm örneklerde kaynak/firmware ZIP eşleşmesi kontrol edildi. 14 kartta ek Python SoftSPI canlı pot512→768 ve montaj netleri doğrulandı.

Worker: 14 kart×3 dil; load/run/pause/terminate. Native step/reset; sonsuz senkron Python döngüsü worker termination. Python pause/resume kullanıcı arayüzünde VM'yi yeniden başlatır; CPU adımı yoktur. UART0 native register/terminal byte akışıdır; tüm UART TX/RX pin çerçeveleri iddia edilmez.

GPIO 5V aşımı, geçersiz/ayrılmış pin, bozuk checksum, farklı chip BIN ve düz kablo ZIP/net koruması her kartta denetlendi. **MCU reset EEPROM verisini silmez**; STOP ile kabul edilen sürmekte olan yazmanın kalan süresi yeni MCU sayacına taşınır. Güçsüz EEPROM'un önceki verisi de korunur. Yeni simülasyon oturumu/Stop ayrı yaşam döngüsüdür; JSON içine EEPROM belleği otomatik kaydedilmiş sayılmaz.

## Destek dışı kalan kapsam

Tam Arduino-ESP32/ESP-IDF SDK, RF/Wi-Fi/BLE, dahili ADC/LEDC, donanım I²C/SPI, USB/PSRAM/kamera/Ethernet; Classic/S2/C2/C61/S31; bütün P4 silikon revizyonlarının eşdeğerliği. Bunlar tamamlandı/onaylandı olarak sunulmaz. Yerleşik core0.2 ve C17 HAL, GPIO yazılım bus ve 3.3V DC kapsamı onaylandı. Pinout/revizyon kaynakları ESP32-BOARD-PROFILES.md ve C17-SENSORS.md içindedir.

## Sonraki aşama: STM32

STM32F103C8 Blue Pill, gerçek Cortex-M3 CPU/SoC doğrulaması ile başlayacak. ARM derleme/link,64KiB Flash/20KiB RAM/Thumb vektör ve taşma reddi kapısı geçti. Simülasyon motoru, GPIO/UART/NVIC/RCC ve ortak alan entegrasyonu henüz doğrulanmadı. STM32 bu sürümün çalışan kart kataloğunda yer almaz.

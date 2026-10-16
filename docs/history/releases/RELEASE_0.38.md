# CircuitForge 0.38

12 Ekim 2026. Kullanıcının kablo düzleme, ESP32 çeşitleri ve datasheet doğrulama isteği uygulanmıştır.

- Kablo bölümleri tam pin/rota koordinatlarına hizalanır; Alt serbest sürükler. Özelliklerden Düz bağlantı / Köşeli otomatik rota. Routing JSON/ZIP'de korunur; elektriksel uçlar/netler değişmez.
- 11 yeni özgün kart görünümü: H2, C5, P4 Function-EV, üç XIAO, Nano ESP32, C3 DevKitC-02, C6/S3 DevKitM-1, C3 Rust. Toplam 14 ESP + 6 AVR. Üç dil bütün ESP profillerinde aynı alandadır.
- H2/C5/P4 gerçek Clang/ESP-EMU CPU hedefleri; yeni linker/MMIO/UART/image-offset kabulü. C17 ayrı C çeviri birimiyle çalışır. S3 GPIO46 gerçek çıkış olarak düzeltildi.
- Kart başlığına bağlı örnek pinleri, D/A etiketleri ve güç alias'ları. 20 kartta geçerli direnç/LED breadboard montajı. H2/C5 kristal/PSRAM ve P4 J1 ayrılmış pinleri kapalıdır. Nano VUSB açık köprü ve Rust VBUS doğru ele alınır.

Üretici kaynakları, revizyonlar, lisans ve kapsam `dist/notices/ESP32-BOARD-PROFILES.md` içindedir. `npm run test:boards` yeni 37 native firmware kabulünü yeniden üretir; fixture testleri 14 kartın C/C++/MicroPython GPIO/ZIP/montajını, dört kartta native ve Python SHT31/MCP3008 protokolünü doğrular. Eski iki ESP kabul scripti varsayılan üç orijinal CPU'da korunmuştur; yeni kartları bu scriptlere ham sabit pinlerle eklemeyin.

Tam Arduino SDK, Wi-Fi/BLE, PSRAM, ADC/PWM ve kart üzerindeki tüm çevrebirimler desteklenmiş sayılmaz. Classic/S2/C2/C61/S31 uygun motor/toolchain kapısı olmadan eklenmedi. P4 Function-EV J1 profili Wokwi Preview değildir; CPU motoru hw_ver3 ve seçilen fiziksel başlığın bütün silikon revizyonları aynı kabul kapsamı değildir.

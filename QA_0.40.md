# 0.40 kabul kaydı

12 Ekim 2026. Yayınlanan 14 ESP kartının mevcut C++17, C17 ve MicroPython örnek kataloğu kapatıldı. Bu kabul tüm ESP donanım özelliklerinin desteklendiği anlamına gelmez.

- 321/321 kart/dil/örnek: 251 C++, 42 C17, 28 MicroPython. Native programlar yeniden gerçek Clang ile derlendi; CPU, fiziksel devre, UART/protokol çıktısı, kaynak parmak izi ve ZIP denetlendi. Python programları değiştirilmeden resmî WASM yorumlayıcıda çalıştı; canlı SHT31 ve güç kesilmesi, ek SoftSPI ADC giriş değişimi denetlendi.
- 42/42 worker yaşam döngüsü: 14 kart × üç dil. Yükleme, çalıştırma, duraklatma, sonlandırma; native adım/sıfırlama ve kesintisiz Python döngüsünü sonlandırma.
- 14/14 bütünlük: GPIO aşırı gerilim, geçersiz/ayrılmış pin, firmware checksum ve farklı CPU görüntüsü reddi; düz bağlantı/net/ZIP korunması.
- 14/14 EEPROM sıfırlama regresyonu: yazılmış veri, STOP sonrası sürmekte olan yazmanın kalan süresi ve VCC ayrılmış belleğin korunması. Kart sıfırlaması haricî EEPROM'u artık silmez. Yeni simülasyon oturumu ve JSON dosyası kalıcı bellek dökümü değildir.
- Genel test: 584/584, sıfır hata/atlama; 198467 ms. npm run build başarılı.
- Tarayıcıda C3 EEPROM örneği derlendi; UART EEPROM=37/77, duraklatma ve sıfırlama kontrol edildi. Bellek koruma kanıtı yukarıdaki bağımsız native regresyon testidir.

Ham kanıtlar docs/esp32-acceptance/{a,b,c}.json, docs/esp32-worker-acceptance.json ve docs/esp32-integrity-acceptance.json. Dağıtılan özet dist/notices/ESP32-ACCEPTANCE.md ve dist/esp32-acceptance.json. scripts/summarize-esp-acceptance.mjs kaynak SHA'larının katalogla hâlâ aynı olduğunu zorunlu olarak denetler.

RF, tam ESP-IDF/Arduino SDK, dahili ADC/LEDC/donanım bus, USB/PSRAM/kamera/Ethernet bu kabulün dışında. UART0 terminal çıktısı tüm fiziksel UART framing/IRQ desteği değildir. Python duraklatıp devam etmek yorumlayıcıyı baştan başlatır. Classic/S2/C2/C61/S31 desteklenmiş CPU olarak sunulmaz.

STM32 kapısı: gerçek Clang ARM Cortex-M3/M4 nesnesi ve F103C8 ELF linkleme geçti; 64 KiB flash / 20 KiB SRAM aşımı reddedildi. Henüz STM32 CPU simülasyonu onaylanmadı. docs/stm32-toolchain-gate.json ve docs/STM32_PLAN_0.40.md.

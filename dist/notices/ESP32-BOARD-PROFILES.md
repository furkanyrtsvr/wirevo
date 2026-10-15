# CircuitForge 0.38 — doğrulanmış kart profilleri

Ortak AVR/ESP çalışma alanında altı AVR ve **14 ESP32 kartı** vardır. Her ESP profilinde Arduino C++, C17 ve resmî WASM MicroPython seçilebilir. Kart seçimi yalnız resmi değiştirmez: gerçek başlık pinleri, GPIO eşlemeleri, firmware chip ID, bellek yerleşimi, IO_MUX, GPIO bankaları, UART ve gerçek CPU hedefi birlikte seçilir. C3/C6/S3 yanında H2/C5/P4 native Clang firmware ile yürütülür.

## Fiziksel pinout kaynakları

| Profil | Doğrulanan kart | Üretici kaynağı |
|---|---|---|
| esp32c3 | DevKitM-1 | [Espressif](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c3/esp32-c3-devkitm-1/user_guide.html) |
| esp32c6 | DevKitC-1 v1.2 | [Espressif](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c6/esp32-c6-devkitc-1/user_guide.html) |
| esp32s3 | DevKitC-1 v1.0 | [Espressif](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.0.html) |
| esp32h2 | DevKitM-1 v1.3 N4 | [Şema v1.3](https://dl.espressif.com/dl/schematics/esp32-h2-devkitm-1_v1.3_schematics.pdf) |
| esp32c5 | DevKitC-1 v1.2 N8R8 | [Şema v1.2](https://dl.espressif.com/dl/schematics/SCH_ESP32-C5-DevkitC-1_V1.2_20250211.pdf) |
| esp32p4 | Function-EV v1.5.2 J1 | [Espressif kart belgeleri ve şeması](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32p4/esp32-p4-function-ev-board/user_guide.html) |
| xiao-esp32c3 | Seeed XIAO C3 | [Seeed pinout](https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/) |
| xiao-esp32c6 | Seeed XIAO C6 | [Seeed pinout](https://wiki.seeedstudio.com/xiao_esp32c6_getting_started/) |
| xiao-esp32s3 | Seeed XIAO S3 | [Seeed pinout](https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/) |
| nano-esp32 | Arduino Nano ESP32 ABX00083 | [Resmî tam pinout](https://docs.arduino.cc/resources/pinouts/ABX00083-full-pinout.pdf) |
| esp32c3-devkitc02 | DevKitC-02 | [Espressif](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c3/esp32-c3-devkitc-02/user_guide.html) |
| esp32c6-devkitm1 | DevKitM-1 | [Espressif](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c6/esp32-c6-devkitm-1/user_guide.html) |
| esp32s3-devkitm1 | DevKitM-1 | [Espressif](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitm-1/user_guide.html) |
| esp32c3-rust | DevKit-RUST-1 | [Üretici şeması](https://github.com/esp-rs/esp-rust-board/blob/master/hardware/esp-rust-board/schematic/esp-rust-board.pdf) |

H2 GPIO13/14 kartın 32 kHz kristaline ayrılmıştır; başlıkta NC gösterilir. C5 N8R8 GPIO15 PSRAM'e ayrılmıştır; v1.2 RGB bağlantısı GPIO27'dir. P4 J1 GPIO0/1 kristal ve GPIO45 SD_PWRn bağlantıları kullanıcı GPIO'su olarak açılmaz; bazı eski sanal çizimlerdeki GPIO24/25 güncel J1 tablosuyla uyuşmaz. Nano açık VUSB köprüsünü 5 V besleme diye taklit etmez; bu kartta 5 V röle örneği sunulmaz. Rust VBUS pini gerçek 5 V besleme alias'ıdır; GPIO8'in iki fiziksel pedi aynı elektriksel nettir.

Sayısal API argümanları **native GPIO** numarasıdır. C/C++ D0…D13, A0…A7 gibi mevcut kart etiketleri makrolarla; Python `from machine import D0` ile kullanılabilir. Nano `2` GPIO2'dir; `D2` GPIO5'tir. Özgün örneklerin pinleri seçilen başlığa birlikte eşlenir; kullanıcının yazdığı kod otomatik değiştirilmez. S3 GPIO46 çıkış verebilir: önceki yalnız giriş kısıtı [resmî ESP-IDF yetenek maskesine](https://github.com/espressif/esp-idf/blob/v5.5.4/components/soc/esp32s3/include/soc/soc_caps.h) göre düzeltildi ve native Nano firmware ile doğrulandı.

## CPU, datasheet ve model sınırları

GPIO/UART/IO_MUX adresleri [ESP-IDF v5.5.4 SoC register başlıklarından](https://github.com/espressif/esp-idf/tree/v5.5.4/components/soc) doğrulandı; P4 hw_ver3 başlıkları kullanılır. Chip ID ve firmware başlangıçları esptool v5.1.0 hedef tanımlarıyla eşlenir; C5/P4 BIN önünde 0x2000 boşluk gerekir. CPU motoru resmî ESP-EMU 0.48.0; derleyici Clang 22 WASM'dır.

P4 görünümü Function-EV v1.5.2 J1 bağlantısını gösterir; CPU motorunun P4 hw_ver3 davranışı tüm eski/yeni silikon revizyonlarının eksiksiz modeli değildir. RAM göstergesi ESP'de **yerleşik derleyici veri bütçesidir**; fiziksel toplam SRAM veya PSRAM kapasitesi değildir. GPIO/UART, C/C++ çok dosyalı link, LED akımı ve SHT31/MCP3008 protokolleri kabul edildi. Kamera, LCD, Ethernet, RF, Wi-Fi/BLE, PSRAM, kart üzerindeki RGB/IMU/batarya şarj devreleri bu doğrulamadan çıkarılamaz. Python ESP ROM firmware'i üzerinde çalışmaz; resmî WASM yorumlayıcısı ortak fiziksel devre adaptörünü kullanır.

[Wokwi ESP32 kataloğu](https://docs.wokwi.com/guides/esp32) çeşit araştırması için kullanıldı. Kart çizimleri özgün **CC0 SVG**'dir; Wokwi kart SVG'leri kopyalanmadı. Şematik görseller üretime uygun mekanik CAD değildir. Classic ESP32, S2, C2/C61 ve S31 için mevcut CPU/toolchain kabulü yeterli olmadığından çalışıyormuş gibi profil eklenmedi; ayrı devam kapıları vardır. Wokwi P4 Preview resmî Function-EV kartıyla aynı fiziksel kart değildir.

## Kablo hizalama

Sürüklenen bölüm yakındaki rotanın tam koordinatına hizalanır; küsuratlı pin konumları 9,6 ızgarasına zorlanmaz. Alt serbest hareketi korur. Kabloyu seçip **Düz bağlantı** ile iki gerçek pin arasında tek çizgi oluşturabilirsiniz; pinler farklı yükseklikteyse çizgi hafif eğimli olabilir. **Köşeli / otomatik rota** otomatik rotayı geri getirir. Uçlar/netler değişmez; routing JSON/ZIP içinde saklanır. Başlangıç LED ve direnç montajları bütün 20 kartta aynı geçerli breadboard deliklerine takılır.

# CircuitForge 0.44 — STM32 USART, ADC ve PWM

Pin ayarları yalnız açık projeye kaydedilir; Uygula öncesi taslaktır. USART1 gerçek 8N1/RX kesmesi, MCU ADC1 12-bit ölçüm ve TIM2 PWM1/update kesmesi altı STM32 kartında çalışır. İki kapsamlı laboratuvar bu yolları kullanır. Hazır kablolar ayrı koridorlara dağıtıldı; eski proje Kabloları düzenle ile geri alınabilir biçimde yenilenir.

Kullanım/sınırlar dist/notices/STM32-PERIPHERALS.md, kabul QA_0.44.md, devam sırası docs/STM32_PLAN_0.44.md. 26 kart /6 STM32. Donanım I²C/SPI, ileri ADC/timer modları, tüm kart aileleri, tam vendor HAL ve STM32 C++/MicroPython sonraki kapılardır.

---

# CircuitForge 0.43 — STM32 pin penceresi ve kapsamlı devreler

Nucleo kartları açık mavimsi beyaz PCB ve ek işlemci/ST-LINK/pasif detaylarıyla çizildi. STM32 Pinler penceresi fiziksel pin seçimi, görev, C etiketi ve başlangıç kodu üretir. Gerçek GPIO / yazılım I²C-SPI ile datasheet üzerinde planlanan donanım alternatifleri açıkça ayrılır. Ana örnekler çevre istasyonu ve Bluetooth kontrol laboratuvarıdır; basit örnekler ayrı bölümde korunur. Kablolar dış Morpho padleri ve kart çevresinden gider; eski projeler Kabloları düzenle ile geri alınabilir biçimde düzeltilir.

Kapsam: dist/notices/STM32-PIN-CONFIG.md. Kabul: QA_0.43.md. Sonraki sıra: docs/STM32_PLAN_0.43.md. Altı STM32 kartı korunur; bu sürüm yeni CPU ailesi eklemez. Tam STM32 HAL/Cube, donanım ADC/PWM/IRQ ve STM32 C++/MicroPython sonraki kabul kapılarıdır.

---

# CircuitForge 0.42 — STM32 denetimi, net label ve Bluetooth

Altı STM32 kartının C17/gerçek ARM çalışma alanı korundu. Hazır devreler için engelleri izleyen kablo rotaları; breadboard olmadan aynı adlı net label bağlantısı; 3,3 V fiziksel UART hatlarıyla çalışan sanal Bluetooth modülü, sanal bilgisayar/cihaz ağı ve gerçek BLE GATT erişim paneli eklendi. STM32 Bluetooth ve net label örnekleri Dosya → Yeni proje içinde bulunur. Gerçek BLE için tarayıcı desteği, kullanıcı cihaz seçimi ve uyumlu GATT servisi gerekir. Ayrıntı docs/RELEASE_0.42.md, QA_0.42.md, docs/STM32_PLAN_0.42.md ve dist/notices/BLUETOOTH-MODEL.md.

---

# CircuitForge 0.41 — STM32 başladı

Blue Pill F103C6T6/C8T6/CBT6 ve NUCLEO-F103RB/F401RE/F411RE aynı breadboard alanında gerçek ARM C17 ile çalışır. Ayrı Cortex-M3/M4F motorları, gerçek bellek sınırları, GPIO/DC ve beş hazır devre; SysTick ve M4F VFP kabulü. Kart/dil Dosya → Yeni proje ekranından seçilir.

Kapsam dist/notices/STM32-MODEL.md. Sonraki ana plan docs/STM32_PLAN_0.41.md: UART framing/IRQ, ADC/PWM, C++/MicroPython, WeAct ve ek Nucleo aileleri. Tüm STM32 geliştirme kartları bu sürümde tamamlanmış değildir. npm run test:stm32; npm test; npm run build.

---

# CircuitForge 0.40 — ESP32 kabulü tamamlandı, STM32 sırada

12 Ekim 2026. 14 ESP kartında 321/321 örnek, 42/42 worker ve 14/14 bütünlük kabulü; 584/584 genel test. MCU reset haricî EEPROM verisini ve sürmekte olan yazmayı korur. Kapsam dist/notices/ESP32-ACCEPTANCE.md; ayrıntı QA_0.40.md.

Güncel öncelik STM32F103C8 Blue Pill: gerçek ARM Clang/LLD ve 64 KiB flash / 20 KiB SRAM kapısı geçti. Sonraki adım gerçek Cortex-M3 WASM yürütme + RCC/GPIO/DC + worker. Henüz STM32 simülasyonu çalışır kabul edilmedi. Somut sıra ve birincil kaynaklar docs/STM32_PLAN_0.40.md. Classic ESP32/SDK genişletmeleri bu aşamada bekler.

---

# CircuitForge 0.39 — devam kaydı

12 Ekim 2026. C17 SHT31 ve MCP3008 örnekleri tamamlandı: cf_bus.c/h görünür ve ayrı C translation unit olarak derlenir. Hazır kod + fiziksel pinler 14 ESP başlığına birlikte eşlenir. Açık drenaj ACK/NACK, CRC-8 ve MODE0 haricî ADC; cf_gpio_valid gerçek başlık pinlerini denetler. Güç kesme, canlı ortam/pot, invalid API ve bozuk CRC native kabulü.

Classic/S2 kapısı incelendi: resmî ESP-EMU0.48 ROM yok; Clang kod üretebilir fakat CPU çalıştırma kanıtı yok. QEMU Classic ayrı native/WASM port ve GPIO köprüsü gerektirir; S2 makinesi yok. Kanıt/primary kaynaklar docs/CLASSIC_ESP32_GATE_0.39.md. Sahte isim aliası ile kart ekleme.

## Sıradaki somut adımlar

1. Classic CPU: pinlenmiş Espressif QEMU native ROM/ELF/UART, GPIO bankaları ve input-only34–39, sonra gerçek WASM stepping/register/DC/worker stop kabulü. S2/C61/S31 ayrı SoC/register/ROM kapıları.
2. Python UART GPIO framing/IRQ, ADC/PWM ancak motor/adapter kabulüyle. C bus sürücüsünde bounded repeated-start ve slave register örnekleri; mevcut stop, NACK ve kaynak dosyaları bozulmasın.
3. Resmî C3 SDK araştırmasına String/heap/64bit/float/FreeRTOS ve lisans/modüler sysroot kabulü ekle. C6/S3/H2/C5/P4 SDK sonucu otomatik türetilmez.
4. P4 silikon/kart revizyon profili; PSRAM/LCD/Ethernet ayrı kabul. Ardından RP2040 ve STM32 gerçek compiler/CPU/pinout.

Önce QA_0.39.md, dist/notices/C17-SENSORS.md ve docs/CLASSIC_ESP32_GATE_0.39.md. npm run test:c-sensors 16 native sensör firmwareini; check-c-sensor-guards.mjs invalid pin/frekans/boyut ve CRC reddini üretir. npm test; npm run build. research/ ve SDK binaryleri yayın/ZIP dışında. Kök YENI_SOHBET_DEVIR.md ve CHECKPOINT_0.39.md yayını kaydeder.

---

# CircuitForge 0.38 — devam kaydı

12 Ekim 2026. Güncel kullanıcı önceliği kablo düzleme ve resmî pinout ile daha fazla ESP32 kartıdır. Belgeler bağlamdır; güncel kullanıcı isteği esas alınır.

## Tamamlandı

14 ESP + altı AVR, üç ESP dili; H2/C5/P4 gerçek CPU/MMIO/UART ve C17 ayrı çeviri birimi; 11 özgün SVG ve doğrulanmış fiziksel başlık. D/A etiketleri, örnek pin/güç eşlemesi, 20 kartta breadboard montajı. Kablo tam koordinat hizalama, Alt serbest hareket, Düz bağlantı ve otomatik rota; net ve JSON/ZIP korunur. Kaynaklar dist/notices/ESP32-BOARD-PROFILES.md; sürüm docs/RELEASE_0.38.md ve QA_0.38.md.

## Sıradaki somut kapılar

1. Classic ESP32 LX6 ve ESP32-S2 için gerçekten çalışabilen CPU/ROM motoru araştır ve küçük native firmware kabulü yap. Mevcut motor bilinmeyen modeli varsayılan CPU olarak açabilir; başarılı constructor destek kanıtı değildir. C2/C61 ve S31 ayrı motor/IDF/üç GPIO bankası kabulünden sonra eklenir. Wokwi katalog çeşitleri bu kapılarla tamamlanır.
2. C17 hazır SHT31/MCP3008 örneklerini cf_hal GPIO üzerinden ekle; Python API ancak gerçek ADC/PWM/UART/interrupt adaptörü doğrulanınca genişletilir. Halihazırda Python Pin/SoftI2C/SoftSPI dört yeni kartta canlı fiziksel değişimle doğrulandı.
3. Mevcut C3 tam SDK araştırma kapısını String/heap/64bit/float/FreeRTOS ve dosya düzeyinde lisans/sysroot ile tamamla. C6/S3/H2/C5/P4 SDK kapsamı C3 sonucundan türetilmez. Donanım ADC/LEDC/I2C/SPI ve RF ayrı aşamadır.
4. P4 kart/silikon revizyon seçimini açık profil haline getir; Function-EV J1 revizyonu, hw_ver3 motoru ve PSRAM/LCD/Ethernet birbirinden bağımsız kabul ister. Kart görselleri mekanik CAD değildir.
5. Ardından RP2040/Pico ve STM32 gerçek derleyici/CPU/pinout kapıları. Kablo araçlarında kullanıcı serbest rota beklentisini koru; otomatik rotalama iyileştirmesini mevcut pin uçlarını ve montaj netlerini bozmadan genişlet.

Yayın/ZIP özeti kök YENI_SOHBET_DEVIR.md ve CHECKPOINT_0.38.md içinde. Native araştırma SDK binaryleri research/, node_modules ve .sites-runtime yayın/ZIP dışında kalır.

---

# CircuitForge 0.37 — devam kaydı

12 Ekim 2026. Güncel kullanıcı isteği: ESP32 ayrı alan olmadan AVR ile aynı breadboard çalışma alanı; yeni proje/kart/mimari seçimi, Dosya menüsü ve ESP32 Arduino C++ / C / MicroPython seçenekleri. Bu sürüm bu önceliği uyguladı.

## Tamamlanan ortak alan

- Dokuz kart: altı AVR, ESP32-C3/C6/S3. Dosya → Yeni proje / Proje aç / JSON kaydet / ZIP indir / kart-dil bilgisi.
- Üç ESP dili: C++17 sketch.ino, gerçek C17 main.c (cf_hal.h), resmî MicroPython WASM main.py. Ek kaynaklar seçilen dile göre doğrulanır; ana dosya ve runtime başlıkları korunur.
- Tek bileşen kartı kütüphanesi, breadboard montajı, delik ağları, kablo rotaları, döndürme, geri alma, panel düzeni. /esp32 ortak ekrana yönlenir.
- LED/direnç montajlı başlangıç ve C++/Python SHT31 CRC örneği. Python SoftI2C gerçek slave/besleme; SoftSPI gerçek MCP3008 pot değişimi.
- GPIO ve DC kayıtları çözülmüş değişimlerden; MicroPython zamanı model zamanıdır. Stop worker'ı sonlandırır; Python pause sonrası yeniden başlar.
- JSON/ZIP ve eski ESP JSON geçişi; firmware dil/kart/checksum ve tüm kaynak eşleşmesi. AVR mevcut derleyici/çevrebirimleri korunur.

## Sıradaki öncelik

1. Önceki 54 ESP firmware örneği ortak kart/dil katalog akışına taşındı. Sonraki iş C HAL ile hazır I²C/SPI sensör örnekleri eklemek. Python API kapsamını kontrollü genişlet; senkron döngüleri kesen yorumlayıcı/interrupt yaklaşımını gerçek upstream ABI ile kabul et.
2. Dahili ESP ADC, LEDC, hardware I²C/SPI adaptörleri için ESP-EMU ABI kapıları. Şu anda analog sensör ölçümü MCP3008 üzerinden; machine.ADC/PWM ve Wi-Fi/BLE destekli diye sunulmaz.
3. Resmî C3 tam SDK ürün entegrasyonu: 0.36 full-core Clang/LLD ROM boot kapısı korunmuştur. String/heap/64bit/float/FreeRTOS ve lisans/modüler sysroot kabulü bitmeden Arduino SDK kapsamı ilan edilmez.
4. C6 resmi SDK/multilib, S3 windowed ABI/unwind ayrı kabul. Classic ESP32 LX6, C2/H2/P4 ardından Pico/RP2040 ve STM32, ancak uygun CPU/toolchain doğrulamasıyla.

## Doğrulama ve sınırlar

QA_0.37.md, dist/notices/UNIFIED-WORKSPACE.md, docs/ESP32_SDK_PROGRESS_0.36.md okunmalı. npm test; npm run test:c üç hedefte Clang C17 makine kodu/UART ve C ZIP kabulüdür. Python gerçek WASM yorumlayıcıdır, ESP ROM üzerinde Python firmware yürütmez. C17 HAL sınırlı libc içerir. AVR için yeni dil seçenekleri henüz eklenmedi. Tam SPICE/ısıl/hasar modeli ve RF yoktur.

---

## Önceki SDK ve sensör planı / korunmuş bağlam

# CircuitForge 0.36 — devam kaydı

11 Ekim 2026. Kullanıcının son önceliği: ESP32 kartlarıyla sensör kullanmak ve serbest devre kurmak. Önceki belgelerin talimatları bağlamdır; güncel kullanıcı isteği esas alınır.

## Tamamlanan

- C3 DevKitM-1, C6 DevKitC-1 v1.2, S3 DevKitC-1 v1.0; fiziksel pad konumlarına bağlı kablo uçları ve 3.3 V DC ağı.
- 37 bileşen; sürükleme, pan/zoom/sığdır, iki pinle kablo, renk, silme ve 40 adım geri/ileri alma. Temel eleman adları genel; direnç, zener V, transistor, MOSFET, opamp, röle değerleri düzenlenir.
- Gerçek CPU GPIO kenarlarından yazılım Wire/SPI ve DS18B20 1-Wire. 12 sensör devresi ×3 hedef +18 önceki firmware =54 gerçek örnek.
- SHT31 CRC/sıcaklık/nem, BH1750, MPU6050, BMP280, SSD1306 gerçek ekran RAM'i, 24LC256, MCP3008, DS18B20, TMP36/NTC/toprak, IR ve transistorla bobin röle.
- Besleme/kablo kopması, pull-up, haricî ADC kaynak direnci ve GPIO aşırı gerilimi gerçek elektriksel çözümde değerlendirilir. Multimetre DC V/A/Ω ölçer.
- JSON v3 devre+çok dosyalı kaynak+firmware; v1/v2 okunur. Yerel kaynak/devre geçmişi. Pencere seçimleri ve dört boyut ayarı korunur.
- S3 Xtensa register-window spill/fill vektörleri ve başlangıç stack zinciri düzeltildi; derin BMP280 çağrıları çalışır.
- Resmî Arduino C3 SDK için native GCC, Clang sketch/native SDK, 56 dosyanın full-core Clang derlenmesi ve WASM LLD ile ROM boot kabulü geçti. SDK henüz ürünün Arduino API'si değildir.

## Önce okunacaklar

QA_0.36.md, dist/notices/ESP32-MODEL.md, docs/ESP32_SDK_PROGRESS_0.36.md. SDK_PLAN eski başlangıç araştırmasıdır. Kök dizindeki en son CHECKPOINT ve YENI_SOHBET_DEVIR.md sürüm/dağıtım kaydını verir.

## Sıradaki somut işler

1. C3 tam SDK ABI kabulünü genişlet: String, heap/new/delete, 64 bit aritmetik, float, FreeRTOS timer/task; native GCC ve full-Clang sonuçlarını aynı ROM üzerinde karşılaştır. Tam Arduino kütüphanesi kapsamını yalnız doğrulanmış örneklerle işaretle.
2. SDK/core/sysroot lisanslarını dosya düzeyinde manifestle: Arduino LGPL source/relink, newlib/GCC runtime, Espressif RF binary koşulları. 131 MB sanal arşiv yükünü modüler ve her asset <25 MiB olacak dağıtım düzenine indir. Şimdilik research/ ve SDK binary'leri git/ZIP/dist dışında tutulur.
3. ESP-EMU gerçek ADC enjeksiyonu, LEDC pad kenarı ve hardware I²C/SPI adaptörlerine ayrı erişim kapısı aç. Mevcut v0.48 JS ABI bunları sunmuyor. Yazılım Wire/SPI'yi hardware periferal diye sunma; analogRead'u MCP3008 sonucu diye taklit etme.
4. C6 RV32IMAC SDK/multilib kabulü; S3 resmî SDK windowed ABI/unwind ayrı kabul. C3 sonucu diğerlerine otomatik genellenmez.
5. ESP devrelerine daha fazla doğrulanmış sensör protokolü, breadboard montaj ve ölçüm dalga araçları ekle. 1-Wire parasite power/search ROM, I²C stretching/multi-master ve SPI diğer modları bağımsız kapsam.
6. Classic ESP32 LX6, C2/H2/P4 ancak uygun CPU/toolchain doğrulanınca eklenir. Ardından Pico/RP2040 ve STM32. Wi-Fi/BLE ve USB ayrı aşamalar.

## Çalıştırma / tekrar üretme

`npm ci`, `npm test`, `npm run build`. `node scripts/check-esp-circuits.mjs` 36 sensör firmware'ini gerçek Clang/CPU ile üretir; `node scripts/check-esp-projects.mjs` önceki18'i üretir. `node scripts/check-esp-core.mjs` çekirdek sınırlarını doğrular. SDK reçetesi SDK_PROGRESS belgesindedir. Kullanıcı istemedikçe otomasyon veya yeni sohbet oluşturma.

## Sınırlar

CircuitForge ESP core0.2 küçük bağımsız çekirdektir: C++17, GPIO, UART, zaman, software Wire1–10kHz, SPI MODE0 MSBFIRST10–20kHz. Dahili ADC/analogRead, LEDC/PWM, Wi-Fi/BLE, tam SDK UI desteği yoktur. CPU zamanı 16 MHz mantıksal sensör eksenine çevrilir; gerçek duvar saati performansı değildir. GPIO grafiği40ms UI örneklemesidir. DC röle bobininde geçici indüktans modeli yoktur. BMP280 örneği sıcaklık kompanzasyonunu gösterir; basınç çıktısı hamdır. 6 AVR kartı/76 katalog/81 örnek korunur.

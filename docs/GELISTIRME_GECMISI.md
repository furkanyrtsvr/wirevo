# Wirevo

Tarayıcıda elektronik devre ve firmware çalışma alanı. TR / EN dil seçimi sağ üsttedir; seçim bu tarayıcıda saklanır. Eski CircuitForge proje dosyaları ve aynı adresteki yerel kayıt anahtarları uyumluluk için korunur. Yayın adresi değiştiğinde tarayıcı depolaması adrese bağlı olduğundan eski adresteki projeler JSON/ZIP ile yeni adrese aktarılmalıdır.

## Wirevo 0.70 · Tiva C LaunchPad / yalnız C17

EK-TM4C123GXL / TM4C123GH6PM için ayrı ARM motoru ve bellek haritası; otomatik C/driverlib başlıkları, çok dosyalı C kaynakları, RGB LED/SW1/SW2, UART0, Timer A ve ADC. Robiz fotoğrafı ve TI şemasına göre özgün kırmızı kart SVG’si. [Kullanım ve kesin kapsam](../dist/notices/TIVA-MODEL.md), [sürüm ve çalışan görünüm](../docs/RELEASE_0.70.md). Tam TivaWare veya tüm fiziksel silikon desteği iddia edilmez.

## Wirevo 0.69 · STM32 işlevsel profil

Mevcut geliştirme etabı, kullanıcının kabul ettiği model sınırlarıyla kapatıldı. Orijinal ST ROM uyumluluğu ve fiziksel silikonla birebir çevrim/analog eşdeğerliği vaat edilmez. ROM yükleme/değiştirme işlem güvenliği düzeltildi; yalnız yeni 21 kontrol. Desteklenen davranışların gerçek hataları normal bakım konusudur. [Kesin kapsam](../docs/RELEASE_0.69.md).

## Wirevo 0.68 · STM32 native ROM yolu, I²S ve ileri timer (tarihsel)

Salt-okunur native ROM yükleme/boot alias; tail-chain/late-arrival, nominal Flash/APB beklemeleri; I²S format/slave/full-duplex extension ve TIM1 COM/preload/LOCK. Yalnız yeni `stm32-v068-*` kabulü. [Uygulananlar ve kesin kanıt sınırları](../docs/RELEASE_0.68.md). Orijinal ST ROM sağlanmadı; tam fiziksel çevrim/silikon eşdeğerliği ilan edilmez. Başka kart ailesine geçilmez.

## Wirevo 0.67 · STM32 boot protokolleri ve zamanlama tutarlılığı

F401/F411 işlevsel USB DFU ve panelden binary yükleme/geri okuma; tüm kartlarda binary USART boot; F103 PMA double-buffer/ISO; USB PID/ACK/NAK, I²C10-bit/SMBus ve CAN CRC/stuffing süreleri. Native DWT/SysTick/Flash/DMA/exception zamanlama düzeltmeleri. Yalnız yeni `stm32-v067-*` kabulü. [Uygulananlar ve henüz kapanmayanlar](../docs/RELEASE_0.67.md); tam fiziksel silikon eşdeğerliği ilan edilmez.

## Wirevo 0.66 · STM32 ileri modlar ve sanal ağlar

64-bit Flash/BSY/PCROP/RDP; timer ITR/break/repetition, SPI/USART ileri modları, sanal USB host ve CAN ağı, MMC stream. Yalnız yeni `stm32-v066-*` kabulü; eski testler çalıştırılmaz. [Sürüm ve kesin kanıt sınırları](../docs/RELEASE_0.66.md).

## Wirevo 0.65 · STM32 reset, güç ve ek çevrebirimler

Dokuz mevcut kart için option-byte WRP/RDP/reload, BOOT/NRST, işlevsel USART boot protokolü, dinamik saatler/CSS/PVD/BOR ve STOP/STANDBY eklendi. Çipte bulunan ek timer/SPI/I²C/USART birimleri, F4 I²S/FIFO/DBM/MPU ve RTC olayları da gerçek register/IRQ akışına bağlandı. [Sürüm ve kesin sınırlar](../docs/RELEASE_0.65.md). Kullanıcının isteğiyle bu değişiklikte yalnız yeni kabul dosyaları çalıştırıldı; eski regresyonlar tekrar edilmedi.

## Wirevo 0.64 · STM32 fiziksel-silikon denetimi

0.63 kapanış iddiası geri çekildi. F1/F4 gömülü Flash kilit/anahtar, sayfa-sektör silme, fiziksel program genişliği ve 1→0 kuralı; EOP/hata, 96-bit UID, yoğunluk imzası, reset kalıcılığı ve programlanan kodun yürütülmesi gerçek ARM firmware ile dokuz kartta doğrulanır. Kalan silikon açıkları [canlı denetimde](../dist/notices/STM32-AUDIT.md) tutulur; başka kart ailesine geçilmez.

## Wirevo 0.62 · STM32 çevrebirimleri

I²C400 kHz/DMA ve çok dosyalı sensör istasyonu; F4 alternatif SPI1 pinleri; USART0.5/1.5stop; RTC alt-saniye alarmı. [Sürüm](../docs/RELEASE_0.62.md), [test kaydı](../docs/qa/README.md), [güncel plan](../docs/STM32_PLAN_0.62.md). Gerçek açık silikon işlevleri kapsam kaydında belirtilir.

## Wirevo 0.61 · STM32 destek profili

Dahili ADC sıcaklık/VREFINT/VBAT örneği, F4 USART OVER8 ve SPI1 PA4 master NSS. [Kullanım ve model sınırları](../dist/notices/STM32-SUPPORT-PROFILE.md), [sürüm](../docs/RELEASE_0.61.md), [doğrulama](../docs/qa/README.md), [devam planı](../docs/STM32_PLAN_0.61.md).

# CircuitForge 0.59 · F401/F411 USB OTG FS

F103 PMA ve F401/F411 OTG FS device: gerçek C17/C++17 ARM firmware, ayrı register/FIFO ve IRQ20/67, sanal USB host ile descriptor/adres/configuration/bulk echo. Dokuz STM32 kartında USB örneği. F411 varsayılan 96 MHz / USB48 MHz; F401 84 MHz / USB48 MHz. F103 bxCAN korunur; F401/F411 CAN içermez. [Kullanım/kapsam](../dist/notices/STM32-OTG-FS.md), [kabul](../docs/qa/QA_0.59.md), [devam ve kart geçişi](../docs/STM32_PLAN_0.59.md).

Ortak çalışma alanı, breadboard/net label/auto route, HC-05 görünümü/X-Y aynalama/opamp ve STM32 MicroPython WASM devre modu korunur. Tam STM32 silikonu/yerel ARM MicroPython/gerçek PC USB veya harici CAN ağı tamamlandı iddiası yoktur.

---

# CircuitForge 0.52 — HC-05 görünümü, X/Y aynalama ve STM32 encoder

HC-05 esinli özgün Bluetooth çizimi; mevcut sanal UART ağ modeli korunur. Bileşenler çalışma alanında X (sağ/sol) ve Y (yukarı/aşağı) yönünde aynalanır; pin konumları, kabloların uçları, JSON/ZIP ve breadboard montajı birlikte çalışır. Opamp Temel kütüphanesinde tüm mimariler için kullanılabilir.

TIM2 TI1/TI2 encoder modları, PSC/DIR/ARR, output compare/PWM2, compare IRQ, UDIS/URS ve one-pulse. Encoder pin planı PA0 A + PA1 B ve gerçek C başlangıç kodu üretir. Kabul QA_0.52.md; kapsam dist/notices/STM32-TIM2-EVENTS.md; devam docs/STM32_PLAN_0.52.md. Tüm STM32 tamamlanmış değildir.

---

# CircuitForge 0.51 — STM32 giriş yakalama ve PWM ölçümü

Dokuz STM32 kartında TIM2 giriş yakalama: doğrudan ve eşlenik TI girişleri, kenar seçimi, /1–/8 giriş bölücüsü, CCR ve overcapture bayrakları, gerçek IRQ28. Pin penceresi projeye özel başlangıç C kodu üretir.

ADC ile ayarlanan PWM fiziksel kablodan ölçülür: %50 için500µs, %75 için750µs; periyot1000µs. Kapsam: dist/notices/STM32-TIM2-CAPTURE.md. Kabul: QA_0.51.md. Devam: docs/STM32_PLAN_0.51.md.

Encoder, dijital filtre, prescaler alt fazı, DMA ve diğer STM32 audit başlıkları hâlâ açık. Mevcut dokuz STM32 / toplam29kart; STM32 C17 desteklenir.

---

# CircuitForge 0.50 — STM32 ADC tarama ve sürekli dönüşüm

RegularADC1 1..16rank/CONT/hizalama, F4 12/10/8/6bit ve aileye göreEOC/EOCS/OVR/IRQ18. Pin penceresinde ADC mod/çözünürlük/hiza/sıra, projeye özel C başlangıç kodu veJSON/ZIP. SPI/USART ve ARM ITSTATE0.49 doğruluğu korunur. STMIA T1 R7 register-list hatası motor kaynağında düzeltildi.

Kapsam dist/notices/STM32-ADC-SEQUENCE.md; kabul QA_0.50.md; devam docs/STM32_PLAN_0.50.md. Tüm STM32 tamamlanmış değildir; internalADC/DMA/ileriTIM ve17audit başlığı açık.

---

# CircuitForge 0.49 — STM32 SPI/USART ve kesme doğruluğu

SPI1 mode0..3,8/16bit,MSB/LSB; USART1 7E/O,8N/E/O,9N ve1/2stop; Blue Pill/WeAct üzerinde USART2 fiziksel PA2/PA3 veIRQ38. Pin penceresi projeye özel biçimleri gerçek başlangıç C koduna veJSON/ZIP kaydına taşır. Nucleo C04 ayrılmış başlık pinleri kapalı kalır. ARM motorunda ITSTATE kesme dönüşü hatası düzeltildi; gerçek SysTick/SVC ve Bluetooth kontrol kabulü vardır.

Kapsam dist/notices/STM32-SERIAL-FORMATS.md ve STM32-ITSTATE.md; kabul QA_0.49.md; devam docs/STM32_PLAN_0.49.md. ADC/timer ileri modları ve17 audit başlığında kalanlar açık; tüm STM32 tamamlanmış değildir.

---

# CircuitForge 0.48 — STM32 EEPROM ve repeated-start

Dokuz STM32 kartında donanım I²C1 birleşik write/read, address-only probe ve24LC256 random/sequential read/page write/ACK polling. Çevre istasyonu alarm değişimini EEPROM içine kaydeder, doğrular ve MCU reset sonrası son kaydı okur. Haricî EEPROM state MCU resetten etkilenmez; besleme kaybı bekleyen yazmayı iptal eder. Router alternatif pad çıkış koridorlarını dener.

Kapsam dist/notices/STM32-I2C-EEPROM.md, kabul QA_0.48.md, devam docs/STM32_PLAN_0.48.md. Tüm STM32 tamamlanmadı;17 başlığın kalanları STM32 kapsamı penceresi ve STM32-AUDIT.md içinde korunur.

---

# CircuitForge 0.47 — WeAct Black Pill ve STM32 denetimi

WeAct F401CC/F401CE/F411CE: ayrı 40-pad header, Flash/SRAM,25MHz HSE, aktif LOW maviLED ve KEY/BOOT1 DC profili. Dokuz STM32, toplam29 geliştirme kartı. TIM2 CEN pause/resume ve küçük kablo çakışmaları düzeltildi. STM32 kapsamı penceresi CPU/saat/Flash/GPIO/USART/ADC/TIM/SPI/I²C/DMA/RTC/USB ve diğer eksik ayrıntıları görünür kılar.

Güncel kapsam: dist/notices/STM32-AUDIT.md; WeAct kaynakları: dist/notices/STM32-WEACT.md; kabul: QA_0.47.md; devam: docs/STM32_PLAN_0.47.md. STM32 yalnız C17, tüm çevrebirimler henüz tamamlanmadı. Sonraki geliştirme kartı kapısı RP2040/Pico için gerçek Cortex-M0+ ve pinout araştırmasıdır.

---

# CircuitForge 0.46 — STM32 donanım I²C1

Altı mevcut STM32 kartında standard-mode7-bit master, fiziksel SDA/SCL, ACK/POS/STOP/BTF, olay/hata kesmeleri ve timeout/recovery. Yeni çevre istasyonu SHT31/OLED içinI²C1 ve MCP3008 içinSPI1 kullanır. Pin ayarları yalnız açık projede saklanır; eski kullanıcı kodları/yazılım bus örnekleri korunur.

Kapsam: dist/notices/STM32-I2C1.md. Kabul: QA_0.46.md. Devam: docs/STM32_PLAN_0.46.md. WeAct kart profilleri ve ileri çevrebirimler sonraki kapıdır; tüm STM32 veya vendorHAL henüz tamamlanmadı.

---

# CircuitForge 0.45 — STM32 donanım SPI1

Altı STM32 kartında SPI1 register modeli, fiziksel PA5/PA6/PA7 hatları, RXNE/TXE/BSY/OVR ve IRQ35 çalışır. Pin penceresi gerçek SCK hızını gösterir ve projeye özel C başlangıç kodu üretir. Çevre istasyonu ve Bluetooth kontrol laboratuvarı MCP3008 için donanım SPI kullanır; yazılım SPI örnekleri korunur. ARM MVN immediate S-bit hatası motor kaynağında düzeltildi.

Kapsam: dist/notices/STM32-SPI1.md. Kabul: QA_0.45.md. Devam: docs/STM32_PLAN_0.45.md. Donanım I²C1, SPI diğer modları/DMA/remap, ileri ADC/timer, yeni STM32 kartları ve STM32 C++/MicroPython henüz tamamlanmadı.

---

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

# 0.39 — C17 sensör devreleri

14 ESP kartında C17 için hazır SHT31 ve MCP3008/pot devreleri. main.c + düzenlenebilir cf_bus.h/c, gerçek açık drenaj I²C/ACK/CRC ve SPI MODE0 GPIO kenarları. JSON/ZIP çok dosyalı kaynakları korur. Ayrıntı dist/notices/C17-SENSORS.md.

npm run test:c-sensors; node scripts/check-c-sensor-guards.mjs; npm run build; npm test. Classic/S2 CPU/ROM araştırma kapısı docs/CLASSIC_ESP32_GATE_0.39.md içinde; henüz kataloğa eklenmedi.

---

# 0.38 — ESP32 kart profilleri ve kablo hizalama

14 ESP32 ve altı AVR aynı breadboard çalışma alanında. H2/C5/P4, XIAO C3/C6/S3, Nano ESP32, DevKit ve Rust profilleri; bütün ESP kartlarında C++ / C17 / MicroPython. Resmî pinout ve kart revizyonları `dist/notices/ESP32-BOARD-PROFILES.md` içinde.

Kabloyu seçip Düz bağlantı kullanın; bölüm sürükleme yakındaki çizgilere hizalanır, Alt serbesttir. `npm run build`, `npm test`; yeni native firmware kabulü `npm run test:boards`. Release ve sınırlar docs/RELEASE_0.38.md içinde.

---

# 0.37 — ortak çalışma alanı ve üç ESP32 dili

Dosya → Yeni proje ekranında AVR / ESP32 mimarisi, dokuz geliştirme kartından biri ve programlama dili seçilir. ESP32-C3/C6/S3 için Arduino C++, gerçek C17 main.c ve resmî WASM MicroPython main.py aynı breadboard/devre alanında çalışır. Seçili kart/dile göre 54 eski ESP örneğinin ortak kataloğu; dosya açma/kaydetme, çok dosyalı JSON/ZIP, eski ESP JSON geçişi; ortak bileşen kütüphanesi, montaj, kablo, pencere düzeni ve GPIO/DC kaydı.

MicroPython Pin/SoftI2C/SoftSPI elektriksel adaptörleri; hazır SHT31 CRC örneği ve MCP3008 fiziksel ADC kabulü. Canlı etkileşim için await js.cf.sleep kullanılır. Python ESP32 ROM firmware'i değildir; duraklatma/yeniden çalıştır yorumlayıcıyı yeniden başlatır. C cf_hal.h sınırlı freestanding HAL'dır; tam ESP-IDF/libc ve tam Arduino SDK devam aşamasıdır.

`npm ci`, `npm run build`, `npm test`, `npm run test:c`. Ayrıntılı kapsam dist/notices/UNIFIED-WORKSPACE.md, QA_0.37.md ve DEVAM_PLANI.md içinde.

---

# 0.36 — ESP32 serbest devre ve sensör simülasyonu

ESP32-C3 / C6 / S3 kartlarına 37 bileşenli serbest devre editörü eklendi. Bileşen sürükleme, iki pinle kablo bağlama, kablo rengi, silme, geri/ileri alma, yakınlaşma ve düzenlenebilir devre özellikleri. Pencere menüsü panel seçimini ve boyutlarını saklar. JSON v3 devre + kaynak + firmware taşır; v1/v2 uyumludur.

12 yeni sensör devresi üç kartta gerçek Clang firmware ve gerçek CPU ile doğrulandı: toplam 54 ESP örneği. SHT31 / BH1750 / MPU6050 / BMP280 / OLED / EEPROM, MCP3008 pot ve analog sensörler, DS18B20, IR ve NPN/röle. GPIO taşıyıcıları fiziksel netler ve beslemeye bağlıdır; ADC ölçümü MCP3008 üzerinden gerçekleşir. CircuitForge core0.2 bağımsızdır: donanım Wire/SPI, dahili ADC, LEDC, Wi-Fi/BLE henüz ürün API'si değildir.

Tam Arduino C3 SDK devam planının native GCC, karışık Clang sketch ve 56 kaynaklı full-core Clang ve WASM LLD ROM boot kapıları uygulandı. Ayrıntılar docs/ESP32_SDK_PROGRESS_0.36.md içinde; SDK binary'leri ürün paketine konmadı. QA_0.36.md, DEVAM_PLANI.md ve dist/notices/ESP32-MODEL.md güncel kapsamı içerir.

`npm run build`, `npm test`; gerçek firmware kabulü için `node scripts/check-esp-projects.mjs` ve `node scripts/check-esp-circuits.mjs`. İkincisi uzun CPU yürütmeleri içerir. İsteğe bağlı CF_ESP_CASE virgülle ayrılmış sensör kimliklerini ve CLI chip argümanları hedefleri seçer.

---

# 0.35 — ESP32 çok dosyalı C++ projeleri

C3/C6/S3 için sketch.ino + ayrı CPP/H/HPP, nested include ve gerçek Clang link.16 dosya/100KB UTF8; dosya seçici/ekle/rename/delete, doğru dosyada Clang tanısı, tüm kaynaklara firmware eşleşmesi. JSONv2 (v1 uyumlu), kaynak geçmişi/yedek bütün dosyaları korur. Toplam18 gerçek ESP örneği; altı AVR kartı/76 giriş/81 devre örneği korunur.

Canlı ESP alanı /esp32.html. Küçük CircuitForge core0.1 kullanılır; tam Arduino-ESP32 SDK/ADC/LEDC/bus/serbest3.3V devre ağı sıradadır. QA_0.35.md, DEVAM_PLANI.md, docs/ESP32_SDK_PLAN.md ve dist/notices/ESP32-MODEL.md ayrıntıları içerir.

---

# 0.34 — ESP32 ailesi: C3, C6 ve S3

ESP32 çalışma alanı /esp32.html: gerçek Clang C++17 → ELF/BIN, Espressif ESP-EMU 0.48 WASM üzerinde RV32IMC / Xtensa LX7 yürütme. Üç ayrıntılı kart, 15 firmware örneği; GPIO/buton/LED, UART0, C++ bellek/sayaç/biçimleme, register ve HEX bellek. Proje JSON/BIN/ELF/INO indirme; kaynak geçmişi/yedek; Pencere menüsü ve yerel panel düzenleri. İlk derleyici indirmesi 22.6 MB gzip; SHA doğrulanır, ayrı cache'te saklanır.

CircuitForge ESP core 0.1 küçük bağımsız çekirdektir. Tam Arduino-ESP32, ADC/LEDC/PWM, bus, RF ve serbest 3.3 V devre ağı sonraki aşamalardır. Üç dış ESP-IDF Hello world imajı ROM/bootloader/FreeRTOS yoluyla da doğrulandı. Model ve lisanslar: dist/notices/ESP32-MODEL.md; binary provenance: dist/esp32/provenance.json; QA_0.34.md; DEVAM_PLANI.md.

Önceki AVR alanı korunur: altı kart, 76 giriş, 81 devre örneği. npm run build yeni ESP bundle/notices/offline listesini üretir. npm test tüm AVR ve ESP kabullerini çalıştırır. node scripts/check-esp-projects.mjs ve node scripts/check-esp-core.mjs gerçek Clang kabulünü yeniden üretir.

Aşağıdaki sürüm notları tarihsel kayıttır.

---

# 0.33 güncellemesi — Mega2560 ve ek Arduino kartları

Mega2560 R3, Duemilanove ATmega328P ve Arduino Pro 5 V / 16 MHz eklendi. Toplam altı destekli kart, 76 katalog girişi ve 81 hazır devre. Mega'nın 70 GPIO/16 ADC, 8 KB SRAM, altı timer/15 PWM, harici IRQ/PCINT, dört seri port ve gerçek I²C/SPI hatları; tarayıcı AVR6 GCC derleyicisiyle beraber çalışır. Seri terminalde Serial/Serial1/Serial2/Serial3 ayrı seçilir.

Altı yeni gerçek GCC örneği; Mega'da 3 KB statik SRAM/A15/Timer5, Serial1 CO₂, SHT31 ve MCP3008. Mevcut Uno/Nano/Pro Mini, devre montajı ve Pencere düzeni korunur. Kart modelleri ve kabul kapsamı dist/notices/MEGA-BOARD-MODEL.md; doğrulama QA_0.33.md. Yeni mimari sırası son kullanıcı isteğine göre ESP32 ailesi, ardından RP2040/Pico ve STM32; ayrı toolchain/CPU kabulü gerekir.

Aşağıdaki sürüm notları tarihsel kayıttır.

---

# 0.32 güncellemesi

Pencere menüsü: dokuz panel bağımsız açılır/kapanır; Devre + kütüphane, Kod + terminal ve Tüm paneller hazır düzenleri. Sol/sağ genişliği, devre/kod yüksekliği ve kod/terminal oranı sürüklenir, yerel olarak saklanır. Görünüm düğmesi varsayılan düzeni yükler.

Temel elemanlar genel adlarla gösterilir. Diyot ileri gerilimi, zener gerilimi, NPN beta/VBE/VCEsat, MOSFET eşik/RDS/gövde diyodu, opamp kazanç/çıkış direnci ve LED/pot değerleri düzenlenebilir. Sensör ve bus entegrelerinin parça adları korunur. Yeni Anahtar, Ayarlı direnç ve bobinli Röle: gerçek DC kontak, ayarlanabilir direnç ve bobin akımı; ölçüm ve JSON doğrulamasıyla birlikte. Kütüphane 73 giriş /75 örnek.

Mega2560 bağımsız backend hazırlığı korunur; henüz IDE kartı olarak sunulmaz. Sonraki kart işi gerçek pin/DC/bus, kesme ve avr6 tarayıcı derleyicisi entegrasyonudur.

# 0.31 güncellemesi

Nano ve Pro Mini SVG kart çizimleri yenilendi. Pin/net koordinatları korunur. Üç desteklenen IDE kartı: Uno R3, classic Nano, Pro Mini 5V/16MHz.

Mega2560 için bağımsız native avr6 backend kabulü eklendi; henüz IDE kart kataloğunda yoktur. 256KB flash, 8KB SRAM, far flash ELPM, üç byte PC, A15, Timer0/millis, Timer5/PWM ve dört USART gerçek firmware ile kontrol edilir. GPIO kesmeleri, DC/bus ve WebAssembly/frontend entegrasyonu sıradadır. Ayrıntılar DEVAM_PLANI.md.

Uno, klasik Nano ve 5 V /16 MHz Pro Mini: kart seçimiyle gerçek AVR GCC ve instruction simülasyonu. 0.30: UART pin çerçeveleri /SoftwareSerial, Nano-Pro Mini A6/A7 analog-only girişleri. [Kart/UART model sınırları](../dist/notices/BOARD-UART-MODELS.md).

## 0.30 · 70 parça /75 örnek

Nano /Pro Mini ADC8 ve target firmware; Uno gerçek UART pin çerçeveleri ve SoftwareSerial. 385 test geçti. `QA_0.30.md` ve kart/UART model belgesi.

## 0.29 · 68 parça / 72 örnek

MCP3008 1.5 SCK sample/hold, 20 pF / 1 kΩ bounded acquisition, gerçek kaynak empedansı ve cycle frekans sınırları. Düşük/yüksek empedanslı iki GCC örneği: 1 MHz → 125 kHz değişiminde yüksek empedans sonucu 263 → 510. 4 MHz INVALID; mevcut pot/bit-bang devreleri korunur. Tam ADC fizik modeli değildir; sınırlar `dist/notices/ADC-ACQUISITION-MODEL.md`, kabul `QA_0.29.md`.

## 0.28 · 68 parça / 70 örnek

I²C donanım master için açık drenaj SDA/SCL bit kenarları, gerçek elektriksel ACK/veri ve SHT31 clock stretching. Analizörde A5=SCL, A4=SDA seçilebilir. Yeni örnek gecikmesiz read ile WAIT_US, altı bayt ve CRC doğrular. Wire timeout, kısa devre, eksik pull-up, düzenleme ve dispose kabulü. ALERT henüz sürülmez; GPIO bit-bang I²C, multi-master ve analog rise-time yok. Ayrıntılar `dist/notices/I2C-LINES-MODEL.md`, `QA_0.28.md`.

Yeniden kurulumda package/lock uyumsuzluğu düzeltildi: çalışan ve doğrulanmış AVR8js sürümü 0.21.0, uygulama 0.28.0. `node scripts/check-i2c-lines.mjs`: dört gerçek GCC derlemesi, 7204 Flash / 368 statik SRAM.

## 0.27 · 68 parça / 69 örnek

Bağımsız diyot/zener, gerçek seri/yük direnci ve signed akım; sinyal jeneratörüyle sinüs sınırlayıcı. Native Arduino ADC kabulü. DC modeli kapsamı: notices/DIODE-MODELS.md.

## 0.26 · 66 parça / 67 örnek

74HC595 ve 74HC165: gerçek DIP16 montaj, latch/OE/load, çift cihaz zincirleri; üç native Arduino kabulü. QA_0.26.md ve notices/SHIFT-MODELS.md.

## 0.25 · INA219 ve MAX6675

64 parça/64 örnek; gerçekdışşöntakımölçümü ve termokuplSPI/220msconversion/OPEN.

## 0.24 · SPI GPIO

MCP23S17,62 parça/62 örnek;337test, nativeGCC/LED/ADC/IRQ ve gerçekDIP28montaj.

## 0.23 · MAX7219 DOUT zinciri

61 parça/61örnek; üçgerçek ekranaynıSPIclock veDOUTchain, nativeGCC/NO-OP/kopukchain kabulü.

## 0.22 · SPI TFT

61 parça /60 örnek; ST7735/ST7789 gerçek pixelRAM/RGB565/SPI ve74HC4050DIP16 seviyeçevirici. İki nativeGCC/tarayıcı kabulü; genericpanelofset/ileri özellik sınırları TFT-MODELS.md.

# CircuitForge Studio — Web 0.18

## 0.19 — ölçü aletleri ve Arduino modül genişlemesi

48 bileşen / 49 hazır devre. Sinyal jeneratörü (sinüs/kare/üçgen, frekans/genlik/ofset/duty, 50 Ω); multimetre (10 MΩ DC V, 0.1 Ω seri A, pasif Ω); bağımsız ohmmetre (1 V test çözümü, OL/LIVE/ACTIVE). Ölçü aletlerinin ekranları gerçek devre sonuçlarından güncellenir. Jeneratör zamanlaması AVR cycle olaylarıdır; analog dalgalar 64 örnek/periyot ve en az 10 µs adım kullanır.

LM35, MQ-2, alev, mikrofon/ses, PIR, IR engel, SW-420, A3144 modülü, joystick, NTC ve kapasitif toprak; ayrıca HC-SR04 ve kalibre mikro servo eklendi. Analog/dijital çıkışlar besleme ve yükten etkilenir; NTC/MQ-2/joystick direnç ağları, açık kolektör sonlu sink/pull-up ve PIR H/L süreleri gerçek GPIO/ADC'ye ulaşır. HC-SR04 TRIG≥10µs, cycle ECHO=cm×58µs, ≥60ms yeniden ölçüm; gerçek pulseIn interrupt nedeniyle küçük ölçüm sapması gösterebilir. Servo gerçek darbe/çerçeveyi okuyup kalibrasyona göre kolunu döndürür; komut değişkeninden açı üretmez.

15 yeni native AVR-GCC örneği; 291 test / sıfır hata. Tarayıcı: sinüs ve V/A ekranları, 500Ω paralel ölçüm, NTC alanları, HC-SR04≈99.5cm/100cm ve servo kontrolü. QA_0.19.md ve notices/LAB-BASIC-MODELS.md sınırları açıklar. Zamanlanmış görev oluşturulmadı.


Arduino Uno R3 için tek ekranda devre, C++, seri terminal, özellikler, GPIO tablosu ve ölçümler. İnternette kurulum gerektirmeyen statik uygulama.

## 0.17 — ekranlar, sensörler, opamp ve reaktif devre

Kütüphane 15→28 parça; 12 yeni C++ örneği. I²C LCD8×2/LCD16×2, BMP280 sıcaklık/basınç; SPI MAX7219 matris/sekiz hane ve MCP3008 sekiz kanal ADC; GPIO 1-Wire DS18B20; UART MH-Z19B CO₂; analog TMP36 ve LDR. LCD/metin/CGRAM, LED matris ve segmentler gerçek firmware registerlarından çizilir. Sensör ortamı, C/L ve parazit dirençleri özellik panelinden değişir. PCF adresi 0x20…0x27. SPI mode0–3/MSB-LSB/SS, GPIO bit-bang ve 1-Wire ROM Search gerçek GCC ile doğrulanmıştır. Bus paneli I²C/SPI/1-Wire/UART ve birleşik cycle CSV sağlar.

LM358 çift kanal finite-gain/çıkış direnci/rail active-set aynı MNA'da; yüksek empedans giriş, 3–30 V besleme. C/L sıfır başlangıç enerjili, AVR çevrimlerine bağlı backward-Euler; 10 µs…1 ms bounded adım, hızlı devre uyarısı. MCU reset enerjiyi temizler; aynı parçanın Vc/IL durumu devre düzenlemesinde korunur. Opamp/C/L/MCP/DS18/TMP/LDR bacakları dört breadboard yönünde ayrı şeritlere tam oturur.

Model sınırları: `dist/notices/COMMUNICATION-MODELS.md`, `ANALOG-REACTIVE-MODELS.md`; pin/özgün CC0 çizim kaynakları `EXPANDED-MODULES.md`. 241 otomatik test, 12 örnek + 4 ek protokol için gerçek GCC kabulü, tarayıcı derleme/ekran/sensör/opamp/RC/RL kontrolü: QA_0.17.md. CAN/RS485/USB, I²C bit dalgaları ve diğer kartların toolchain/emülatörleri sonraki aşamalar.

## Yerel çalışma

npm ci → npm run build → npm start. http://127.0.0.1:4173. npm test: 385 test. Build CodeMirror ve AVR8js runtime'ını sabit sürümlü bağımlılıklardan paketler; src/uno-runtime.js takip edilen kaynaktır.

## Editör

Gerçek Wokwi Uno R3 çizimi, Arduino belgesiyle doğrulanmış 32 pad; NC bağlantısız, SDA/A4 ve SCL/A5 alias, ortak GND. 400 delikli breadboard: a–e/f–j beşli şeritler ve dört bağımsız sürekli güç rayı. Kablo pin→ara rota→pin ile çizilir, düz bölümünden sürüklenir: yatay ↕, dikey ↔. Uç/netler korunur. Renk, otomatik rota, pan/zoom, geri alma/yineleme.

Shift/Ctrl çoklu seçim; boş alanda dikdörtgen; toplu taşıma/silme, sol/üst hizalama, Ctrl+C/V/D. Tek Uno hedefi. LED/direnç/buton/pot/NPN/MOSFET deliklere mıknatısla takılır; bacak aralığı/dolu delik, 2D çizim gövdesi çakışması ve kapalı delik kontrolü. Buton kontakları aynı breadboard şeridindeyse montaj reddedilir; R ile orta kanala uygun döndürülür. Geçersiz bırakma önceki konumu/montajı ve geri alma geçmişini korur. Delik numaraları seçili parçanın yanında ve özelliklerde görünür. Takılı parçalar breadboard'u takip eder. M kapatır, Alt geçici kapatır. Eski dosyalardaki görsel çakışmalar yüklemeyi engellemez; yeni montajlar denetlenir. Gövde kutuları SVG'nin izdüşümüdür; 3D kalibrasyon/tolerans değildir.

## Derleyici ve MCU

Tarayıcı worker'ında gerçek avr-g++/assembler/linker/objcopy → Intel HEX. Kaynak cihazda kalır; sabit GCC WebAssembly toolchain CDN'den indirilir. 100 KB kaynak, 120 s derleme, 32256 byte program sınırı. ATmega328P, 16 MHz, 32 KB flash, 2 KB SRAM; gerçek AVR komutları, GPIO, Timer0/1/2, ADC, PWM, USART0 RX/TX. Çalıştır/Durdur, duraklat/devam, reset, 16000 cycle (~1 ms) adım. Gerçek zaman hızı cihaza bağlıdır.

Beş gerçek GCC firmware'i yalnız bire bir kaynak eşleşmesinde kullanılabilir; 29 devre projesi. Gerilim bölücü ADC/PWM kaynağını aynı firmware ile kullanır. Derle düğmesi daima gerçek GCC çalıştırır. Seri terminal gerçek USART RX/TX ve firmware baud hızıdır. Arduino LGPL/GPL/runtime exception, avr-libc ve tam kaynak paketi dist/notices içinde korunur. Çizim/motor MIT lisansları dist içindedir.

GCC hata/uyarıları satır/kolon aralığında ve gutter içinde işaretlenir. Sorunlar satırına tıklama doğru .ino/.cpp/.h dosyası ve satırına gider; library/linker konumları dış kaynak olarak okunur. Başarılı GCC stderr uyarıları korunur; kod değişince eski işaretler temizlenir. Derleme × ile iptal edilir; kaynak değişimi otomatik iptal/worker temizliği yapar, geç gelen firmware uygulanmaz. Gerçek GCC hata ve uyarı fixture'ları tests/fixtures/gcc-diagnostics.json.

## Elektrik ve ölçüm

Genel DC direnç ağı, yüklü 10k pot, 30k iç pull-up, beslenen ideal sensör ve sabit 2 V LED active-set MNA. Seri/paralel ağlar; 10k/10k 2.5 V → gerçek ADC 512. GPIO çıkışları ideal kaynak. Çalışan firmware için LED akımı gerçek GPIO/PWM geçişleri arasında çözülen DC akımın cycle integraliyle ortalanır; aynı/ters faz çoklu PWM doğrulandı. Statik snapshot-only API tek PWM duty ağırlığına geri döner. Özdeş paralel ideal LEDler eşit paylaşımı bildirir. Floating net Hi-Z. P2N2222A C/B/E ve IRLZ44N G/D/S + drain tab orijinal CC0 çizimleridir; pinler resmi üretici belgesiyle doğrulandı. NPN baz akımı, β100 aktif bölge ve VCEsat0.2V; MOS VGS≥4V ohmik35mΩ ve S→D0.7V body diyodu. Sabit katsayı yaklaşımı; 1–4V MOS geçiş bölgesi OFF olarak kapsam uyarısı verir. Gate charge/ısıl/ters NPN modeli yok. dist/notices/SEMICONDUCTOR-MODELS.md ayrıntıları ve kaynakları açıklar. Gerçek Wokwi SPDT ve röle çizimi, doğru3/6 uç; ortak2→1/3 ve COM→NC/NO. RöleHIGH(default)/LOW seçimi, çözülen5V besleme ve IN-GND eşikleri; floating/unpowered OFF. Kontak yükü kontrol beslemesinden ayrıdır, kapalı50mΩ DC yaklaşımı.16pass bounded geri besleme ve ideal kaynak kısa devre tanısı. Bobin akımı/bounce/delay/transient yok. Kontak dal akımı ve V+/V− kaydı; kolu canvas üzerinden fare/Enter ile değiştirin. Notices CONTACT-MODELS.md katsayıları ve iki MIT kaynağını belirtir. Harici AREF, SPICE ve fiziksel kalibrasyon yoktur; C/L için aşağıdaki bounded transient modeli vardır.

Dört kanallı dijital GPIO analizörü gerçek pad register geçişlerini AVR cycle ile toplar, dış giriş/PWM dahil. C1 prob seçimi, C2–C4 bağımsız GPIO, 5 s–1 ms pencere; LIVE/AUTO/SINGLE, rising/falling C1 trigger ve %25 kayıt öncesi tampon. 1× tekrar kurar. Tek kayıt CPU çalışmaya devam ederken sabit kalır. A/B seçip grafikte kenara tıklayın; Shift serbest çevrim seçer. Δt/cycle ve başlıkta 1/Δt; frekans/duty ve baseline/edge türleriyle dört kanal CSV. 8192 kenar/paket, 30000 kenar/UI; taşma belirtilir, saklanmayan aralık çizilmez ve eksik tampon tetiklemeyi tamamlamaz. Kısa kayıtların frekansı kayıt anındaki son 5 s geçmişinden ölçülür. Analizör pad mantık seviyesini gösterir, analog osiloskop modeli değildir. Sensörün bağlı beslemesi ve röle kontrolü aynı16pass bounded döngüde çözülür. Kayıp güç OUT ideal kaynağını geri çeker; self-power/dropout/oscillating feedback firmware girişlerini sürmez, açık hata verir. Çözülen yeni sensör kaynağı doğru net desteğine dahil edilir.

DC ağı worker içinde GPIO/DDR/pull-up değişiminde ve ADC örnekleme anında aynı AVR cycle içinde çözülür. Girişler UI yenilemesinden bağımsızdır; sadece elektriksel pin durumu için 128 girişlik LRU cache vardır. Devre değişikliği cache/akım integralini temizler; circuitId eski devrenin ölçümünün uygulanmasını engeller.

Bağımsız V+/V− probları gerçek pinlerden seçilir; kablo/net değiştirmez. Direnç, pot ve yarı iletken dalı seçilebilir. İşaretli gerilim/akım aynı AVR cycle ekseninde iki DC iz olarak tutulur; A/B cursor ve cycle/time/V/I CSV. Akım gerçek cycle integraliyle ORT. gösterilir. Hi-Z bilinmeyen değer boş kalır, tampon kaybında çizgi kesilir. DC modu anlık çözümlerin kaydıdır; transient değildir. Prob değişimi elektriksel cache'i yeniden kurmaz. OFF NPN'nin yalnız LED üzerinden kalan kolektörü Hi-Z gösterilir.

## Projeler ve kalanlar

Yerel otomatik kayıt/son projeler; son geçerli çalışma yedeği, bozuk ana kayıtta otomatik kurtarma. Proje geçmişi12snapshot/650000JSONkarakter toplam sınırı, otomatik20s aralığı ve manuel anlık kayıt. Geçmiş açılırken mevcut çalışma önce kaydedilir; sığmazsa mevcut çalışma korunur. Snapshot JSON indirilebilir. pagehide/gizli sekmede bekleyen250ms kayıt hemen tamamlanır; son kod değişikliği yenilemede korunur. Yedek/geçmiş alanı dolduğunda mevcut kayıt mümkünse tamamlanır ve durum açıkça gösterilir; v1/v2/v3/v4/v5 JSON, .ino/.hex açma/indirme; ayarlanabilir paneller, dar ekranda alt alta görünüm. Mevcut v2 kayıt anahtarı korunur. Bir Uno; sketch.ino + ayrı .cpp/.h/.hpp dosyaları (en fazla16dosya/toplam100KB), ayrı GCC translation-unit/assembler/linker. Dosya/sekme, ekle/yeniden adlandır/sil, tüm dosyalara bağlı firmware fingerprint ve dosyaya doğru diagnostic. .ino otomatik prototip henüz yok; fonksiyonları önce tanımlayın veya prototip yazın. ZIP tüm kaynakları/circuit.json/geçerli HEX içerir; Stored/Deflate ZIP açma kaynak/devre/HEX ve sabit kütüphane manifestini birlikte taşır; hata mevcut projeyi değiştirmez. ELF statik .data/.bss SRAM sayımı; stack/heap zirvesi değildir,2048byte üzeri derleme çalıştırılmaz. Arduino prototip ve genel kullanıcı kütüphane yükleme, daha fazla SPI cihazı, diğer MCUlar, USB yükleme ve bulut kayıt sonraki aşama. Güncel kabul hedefleri DEVAM_PLANI.md ve sitedeki Devam planında.

## 0.12 kabulü

NPN/MOSFET küçültüldü; üç fiziksel bacak 9.6×1.35=12.96 editör birimi delik aralığına oturur. D.TAB takılan bacak değildir, D ile elektriksel alias korunur. Aynı şeride kısa devre montajı reddedilir. Yeni eklemede boş montaj otomatik bulunur; örnek sürücüler q1 ve baz/gate direnci takılı gelir. Dört breadboard yönü, eski projeler ve gerçek firmware kabulü test edildi.

Gerçek toolchain ek kabulü: research/compiler içine @horang-corp/avr-gcc-wasm@0.2.0 kuruluyken node scripts/check-gcc-project.mjs. Ayrı static/global linkage, iç içe header, dosya diagnostic, eksik header, undefined/multiple symbol ve RAM aşımı. Toolchain upstream unmodified CDN araçlarıdır. Kaynak adaptörü özgün CircuitForge kodudur; compiler kodu/binaryleri Site içinde aynalanmaz.

## 0.13 OLED / I²C

OLED SSD1306 128×64, GND/VCC/SCL/SDA; adres0x3C/0x3D seçilir. Sayaç, OLED/ADC ve I²C tarayıcı örneklerini proje menüsünden açın. Adafruit SSD1306 2.5.16 ve GFX1.12.6 gerçek GCC/Wire ile çalışır; tüm pikseller firmware baytlarından üretilir. A4/SDA-A5/SCL netleri, module güç/GND ve clock frekansı gerçek devre/runtime üzerinden belirlenir. Kopan bus NACK, besleme kaybı blank/reset; geri gelen güçte firmware ekranı yeniden başlatmalıdır. Bus kopması mevcut resmi korur.

I²C terminal sekmesinde cycle/time, adres, işlem hızı, ACK/NACK ve HEX; CSV son240 işlemi verir. Worker128/UI240 bounded işlem, transaction ilk32 byte+tam bytecount. RepeatedSTART, write-only readNACK, controlCo/D-C ve üç bellek adres modu desteklenir. AE/AF ekran,2E/2F scroll komutlarıdır. Kaydırma nominal60Hz dijital modeldir; 0.28 bit dalgaları ve SHT31 stretching için I2C-LINES-MODEL.md; slave/multi-master/panel akımı yok. Özgün CC0 çizim ve kaynak koordinatları dist/notices/OLED-MODEL.md; Adafruit lisansları ve exact-header doğrulanmış kaynak ZIPleri dist/notices içinde.

Kütüphane objectleri özgün GNU ar indeksleyiciyle bir arşive konur; linker yalnız kullanılan sembolleri çeker. Eski gereksiz constructor/SRAM yükü elendi: sayaç395byte statikSRAM ve14312byte flash, ADC397/15102, scanner368/4796. 1024byte dinamik Adafruit tamponu statik sayıya dahil değildir. Gerçek fixture testinde minimum heap/yığın payı426–446byte; bu tüm kullanıcı kodları için genel garanti değildir. node scripts/check-oled-project.mjs ve node scripts/check-oled-memory.mjs sabittoolchain ile yeniden üretir; tests/fixtures/oled*.json. Çoklu kaynak/GCC hata/SRAM kontrolleri de yeniden geçti:2710flash/166SRAM ve2109SRAM taşması.

## 0.14 ZIP / kütüphane kilidi

JSON / ZIP açma; tek üst klasör, Stored/Deflate ve streaming descriptor. CRC, güvenli yollar, UTF-8 ve 2MB açılmış/arşiv sınırı. Kaynaklar ZIP içinden alınır; değişmiş kaynak eski HEX’i düşürür. Başarılı geçiş ve library değişimi öncesi mevcut snapshot gerekir. Bozuk dosya, kaynak/manifest/HEX çelişkisi, kota veya okuma sırasında değişen çalışma mevcut projeyi korur.

Derleme kütüphaneleri: Wire1.0, SPI1.0, BusIO1.17.4, GFX1.12.6, SSD1306 2.5.16. Bağımlılıklar ve toolchain0.2.0 schema5 libraries.json ile kilitlidir. Seçim firmware key’ine dahildir; yalnız seçili headers/objects yüklenir, sembole göre ar extraction korunur. Eski manifestsiz projeler uyumluluk modundadır. Source/BSD/MIT/core archive indirme panelden erişilir. Genel library upload ve SPI hardware modeli değildir. dist/notices/PROJECT-FORMAT.md ayrıntılı kapsamdır.

183 test ve 7 gerçek GCC kabulü: core2710/166, Wire4796/368, OLED14312/395; BusIO gerçek ACK, SPI.begin register/UART. QA_0.14.md tarayıcı ZIP roundtrip, bozuk ZIP, gerçek eksikheader ve yeniden derleme sonuçlarını içerir. Sıradaki: kontrollü toolchain cache/offline ve ayrı kapsamlı .ino prototip üretimi.

## 0.15 Breadboard hizası ve yeni I²C modülleri

Breadboard delik aralığı ekran ölçeğinde 12.96; eklenen board seçili/mevcut board'un yanına aynı Y ve aynı grid fazında gelir. Tek board sürüklemesi diğer aynı yöndeki board'a göre hizalanır, Alt hizayı kapatır. Grup/çoğaltma board pitch kullanır; önceden kaydedilmiş koordinatlar otomatik değiştirilmez. Kablo çekerken sağ tık taslağı siler, kablo aracında kalır ve devre/undo kaydı değişmez.

24LC256 DIP-8: gerçek A0/A1/A2/GND/SDA/SCL/WP/VCC pin numaraları; 2.54mm lead pitch ve 7.62mm sıra mesafesi, sekiz ayrı şeride otomatik montaj. 32KB, iki bayt adres, 64 bayt page wrap, sequential/random read, STOP sonrası 5ms yazma/ACK polling, WP net seviyesi. Harici pull-up gerekir; örnekte 4.7kΩ. Bellek güç kesilmesinde aynı runtime'da korunur; firmware reset/new run/JSON reload'da kalıcı NVRAM değildir.

DS1307 RTC 5-pin modül temsili: VCC/GND/SDA/SCL/SQW; 0x68, 4.5–5.5V ve 100kHz. CH, BCD 12/24 saat, tarih/artık yıl ve 56 bayt RAM; burst read START'ta latch edilir. Zaman MCU cycle ile ilerler. SQW çıkışı, pil/VBAT, drift ve analog akım henüz modellenmez; besleme kesilmesi register'ları sıfırlar. Orijinal CC0 SVG, üretici fotoğrafı veya belirli kartın birebir mekanik modeli değildir.

Üç yeni gerçek Wire/GCC örneği: EEPROM R/W, RTC saat, üç modüllü I²C tarama. I²C log R baytlarını da gösterir; aynı adresli okuyucular wired-AND; OLED'in write-only davranışı korunur. QA_0.15.md ve scripts/check-i2c-modules.mjs kabul sonuçlarını içerir.

## 0.16 — ayarlanabilir güç / çevrimdışı derleyici

DC kaynağı özelliklerden 0–30 V olarak ayarlanır; çizim ve gerçek DC net çözümü aynı değeri kullanır. Eski projelerde varsayılan 5 V korunur. Bu ideal gerilim kaynağıdır; akım sınırı/regülasyon modeli yoktur.

Derleyici önbelleği → Hazırla: sabit @horang-corp/avr-gcc-wasm 0.2.0 içinden 550 dosya, 55,214,370 byte (52.7 MiB), SHA-256 ve tam boyut kontrolü. Dört GCC/assembler/linker/objcopy WASM aracı, headers/core ve mevcut beş kütüphane. İndirme altı paralel istek, iptal ve doğrulanmış kısmi dosyalardan devam; 64 MiB araç / 16 MiB uygulama sınırı. Önbelleği temizle proje/geçmiş/firmware kaydını silmez. Tarayıcı depolaması kullanıcı/tarayıcı tarafından temizlenebilir.

Hazır olduğunda Çevrimdışı · yalnız önbellek seçilebilir. Sabit toolchain ve uygulama dosyaları ağ çağrısı yapmadan önbellekten gelir; eksik/bozuk araçta açık hata, sessiz ağ fallback yok. Service worker HTTPS veya localhost ve destekleyen tarayıcı gerektirir. İlk hazırlama bağlantı ister. CacheStorage aynı origin ve cihaz içindir; localhost cache'i public site cache'i değildir.

QA_0.16.md: 207 test; yerel sunucu kapalı + yalnız önbellek ile yeni Wire kodu GCC derlemesi 4406 byte / SRAM368, gerçek AVR UART OFFLINE_GCC_016 ve RTC ACK0. Bu aşamada yeni modül eklenmedi; sonraki öncelik gerçek SPI / MAX7219 matrix ve sekiz hane.

## 0.18 sensör kayıt katmanı / gerçek GPIO genişletici

SHT31 sıcaklık/nem (CRC, single/periyodik acquisition), BH1750 lux (MTreg/conversion), MPU6050 accel/gyro/temperature (signed register burst, INT/FIFO), MCP23017 (BANK/SEQOP/GPIO/OLAT/IPOL/pull-up/IRQ). Beş hazır gerçek C++ örneği; toplam32parça/34örnek. `node scripts/check-sensor-projects.mjs` pinned toolchain ile sekiz firmware kabulünü yeniler; fixture'lar tests/fixtures/sensor-projects.json.

I²C cihaz factory/pin/besleme/fiziksel adres/hız/driver sözleşmesi `device-registry.js` üzerinden ortak. GPIO genişletici çıkışı gerçek DC yükünü sürer; LED7.895mA, işaretli çıkış akımı, gerçek MCU GPIO/ADC/analizör. Güç bir rail veya beslenen başka GPIO kaynağından gelmeli; self/cyclic feed phantom power oluşturmaz. DIP28 tam breadboard pitch ile otomatik kanal montajı. GPA7/GPB7 güncel RevE uyarısı: yalnız çıkış,14input/16output; resetIODIRFF değiştirilmez.

264 test/23yeni; sekiz gerçekGCC kabulü ve tarayıcı canlıT/RH/gyro/LED/buton kontrolü. Model sınırları ve üretici kaynakları dist/notices/SENSOR-MODELS.md ve SENSOR-HARDWARE.md. I²C stretching, SHTALERT, MPUaux/DMP ve filtre fiziği, GPIO hasar/currentlimit bu paket kapsamında değil. SPI TFT/MAX kaskadı sonraki aşama.

0.22 son doğrulama: 327 test /0 hata.

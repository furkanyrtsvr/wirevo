# 0.37 ortak alan güncellemesi

0.73 bileşen güncellemesi: Arduino ile aynı 74 parçalı katalog ve ortak native GPIO aygıt köprüsü kullanılır. [Ortak bileşenler ve sınırları](COMMON-COMPONENTS.md). Bu, MCU donanım kayıt kapsamını veya desteklenen dilleri genişletmez; aşağıdaki tarihsel kart/çekirdek sınırları ayrıca geçerlidir.

ESP32 artık AVR ile aynı breadboard çalışma alanındadır. Yeni proje ekranı kart/mimari/dil seçer. C17 ve MicroPython kapsamı UNIFIED-WORKSPACE.md içinde. Ortak alandaki GPIO grafiği gerçek çözülmüş kenarları ve DC değişimlerini kaydeder; aşağıdaki 0.36 ayrı editör açıklaması tarihsel bağlamdır.

# CircuitForge 0.36 — ESP32 serbest devre ve sensörler

## Güncel kapsam

Üç ESP kartına 37 bileşenli serbest devre editörü eklendi. Gerçek CPU GPIO OUT/ENABLE ve giriş seviyeleri, aynı 3.3 V DC çözümündeki kablolar, pull-up dirençleri, sensör beslemeleri ve sürücülerle bağlanır. Beslemesi/veri hattı ayrılan sensör cevap vermez. GPIO >3.6 V veya <-0.3 V devre hatasıdır; kart pad alias'ları aynı nete bağlanır. RST/NC bağlanabilir sinyal pini değildir.

12 sensör devresi her üç mimaride gerçek Clang firmware ve ESP-EMU ile çalıştırıldı; önceki18 ile toplam54 firmware vardır. SHT31/BH1750/MPU6050/BMP280/24LC256/SSD1306; MCP3008 ile pot, TMP36, NTC ve toprak; DS18B20; IR/LED ve NPN bobin röle. OLED çizimi gerçek128×64 framebuffer'ı gösterir; hazır örnek ortada32×32 desen yazar.

CircuitForge ESP core **0.2** özgün küçük çekirdektir. Yazılım `Wire.h` GPIO açık drenaj SDA/SCL, adres/veri ACK, repeated-start ve read işlemlerini1–10kHz sağlar. Clock stretching/multi-master yoktur. Yazılım `SPI.h` MODE0/MSBFIRST10–20kHz; MCP3008 gerçek hat kenarlarında örnekler. 1-Wire reset/presence/slot/CRC ve9bit DS18B20 dönüşümü desteklenir; parasite/search ROM yoktur. Bunlar ESP hardware I²C/SPI register emülasyonu değildir.

Genel temel eleman değerleri ve sensör ortamı düzenlenebilir. Multimetre DC V/A/Ω; röle kontakları DC bobin akımıyla değişir. Kullanıcı devresi en çok80 bileşen/300 kablodur; dönüş şimdilik0°. Pencere panel seçimleri ve boyutları yerelde saklanır. JSONv3 devre/kaynak/firmware taşır; eskiv1/v2 varsayılan tezgâhla açılır. Kaynak eşleşmesi devre değişikliğinden bağımsızdır.

Tam resmî Arduino SDK kullanıcı derleyicisine dağıtılmadı. C3 için dört araştırma kabulü (nativeGCC → mixedClang → full-coreClang → WASMLLD → ROM) geçti; C6/S3 SDK ve tüm kütüphane API'leri bundan çıkarılamaz. Dahili analogRead/ADC, LEDC/PWM, Wi-Fi/BLE ve USB API'si yoktur. Haricî MCP3008 dahili ADC değildir. Sensör zamanı CPU çevriminden16MHz eksenine çevrilir; GPIO grafikleri40ms UI örneklemesidir.

BMP280 örneği sıcaklığı kompanzasyonla, basıncı ham register değeriyle sunar. Bobin/röle DC modeldir; endüktif geçici dalga iddiası yoktur. Opamp/yarıiletkenler idealize DC modeldir.

## Kartlar, derleyici ve lisans geçmişi

Aşağıdaki0.35 kayıt tarihsel API kapsamıdır; güncel farklar yukarıdadır.

# CircuitForge 0.35 — ESP32 çalışma alanı

## Gerçek yürütme ve destekli kartlar

ESP32-C3 DevKitM-1, ESP32-C6 DevKitC-1 v1.2 ve ESP32-S3 DevKitC-1 v1.0 için ayrı çalışma alanı `esp32.html` adresindedir. C3 ve C6 gerçek RV32IMC; S3 gerçek Xtensa LX7 makine kodu üretir. C6 işlemcisinin daha geniş komut kümesinin bir alt kümesi derlenir. Görseller özgün CC0 SVG çizimleridir; pad etiketleri üretici pinout belgelerine dayanır. Kart görseli mekanik CAD modeli değildir.

CPU ve SoC yürütme motoru Espressif ESP-EMU **0.48.0 WASM** paketidir. Varsayılan ROM, GPIO kayıtları, UART0, komut/registre/bellek yürütmesi kullanılır. Yerleşik firmware doğrudan uygulama girişine başlar. Birleştirilmiş dış ESP-IDF BIN, **ROM boot** seçeneğiyle gerçek ROM → bootloader → uygulama yolunu kullanır. Üç hedefte ESP-IDF 5.5.4 Hello world bu yoldan doğrulandı. Dış firmware'in tüm çevrebirimlerinin desteklendiği iddia edilmez.

| Kart | Görsel pad / kullanılabilir GPIO | Flash sınırı | Yerleşik çekirdek saati |
|---|---:|---:|---:|
| C3 DevKitM-1 | 30 / 15 | 4 MiB | 160 MHz |
| C6 DevKitC-1 v1.2 | 32 / 23 | 8 MiB | 160 MHz |
| S3 DevKitC-1 v1.0 | 44 / 36 | 8 MiB | 240 MHz |

0.38 düzeltmesi: resmî ESP-IDF GPIO yetenek maskesi ve Nano ESP32 pinoutuna göre S3 GPIO46 çıkış da verebilir; gerçek native firmware ile doğrulandı. S3 bağımsız örnekleri tek çekirdekte çalışır; dış ESP-IDF firmware ikinci çekirdeği açabilir. Kart çizimi/pinout seçimi, USB, RF, RGB LED, PSRAM, regülatör ve flash zamanlamalarının tam fiziksel modeli anlamına gelmez. Motorun PSRAM/RF seçenekleri bu sürümde UI'dan yapılandırılmaz. GPIO2 tezgâh LED'i kart üzerindeki RGB LED değildir.

Üretici pinout kaynakları:

- https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c3/esp32-c3-devkitm-1/user_guide.html
- https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c6/esp32-c6-devkitc-1/user_guide.html
- https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.0.html

## Tarayıcı derleyicisi ve çekirdek API'si

Clang 22 WASM ve LLD gerçek C++17 kaynak kodunu ELF ve ESP uygulama BIN'e dönüştürür. Derleme kullanıcının tarayıcısındaki ayrı worker içinde yapılır; kaynak derleme sunucusuna gönderilmez. İlk özel derlemede 22.6 MB gzip compiler paketi indirilir; açılmış 80,735,841 bayt WASM SHA-256 ile doğrulanır. Sonraki derlemeler ayrı doğrulanmış cache'i kullanır. İptal worker'ı sonlandırır; değişen kaynak/kart için geciken sonuç kabul edilmez.

**CircuitForge ESP core 0.1**, bu projenin küçük bağımsız C++ çekirdeğidir. Tam Arduino-ESP32 SDK'sı değildir. Mevcut API:

- `setup()`, `loop()`, `byte`, `uint16_t`, `uint32_t`, `int32_t`, `size_t`.
- `pinMode`, `digitalWrite`, `digitalRead`; `HIGH`, `LOW`, `INPUT`, `OUTPUT`, `INPUT_PULLUP`.
- `micros`, `millis`, `delay`, `delayMicroseconds`; unsigned 32 bit sayaç taşması ve süre biriktirme.
- `min`, `max`, `constrain`, `map`; `lowByte`, `highByte`, `bitRead`, `bitSet`, `bitClear`, `bitWrite`.
- `Serial.begin`, `available`, `read`, tek/çok byte `write`, `print`, `println`; char, C string ve 32 bit signed/unsigned tamsayı. `DEC/HEX/OCT/BIN` tabanları; `F()` bu ortak bellek modelinde string literal'ı korur.
- C++ global nesne constructor'ları, `.data`, `.bss`, sabit boyutlu bellek, `memset`, `memcpy`.

Ana `sketch.ino` ve ek `.cpp/.h/.hpp` dosyaları, iç dizinler ve ayrı translation-unit/link desteklenir. Toplam16 dosya/100KB UTF-8 kaynak sınırı vardır. Yardımcı fonksiyonlar kullanılmadan önce bildirilmelidir. Dosya seçici, ekle/rename/delete ve aktif dosya indirme bulunur. Header/CPP değişiminde tüm kaynaklara ait hedef parmak izi değişir; eski firmware çalıştırılmaz. Standard C++ kütüphanesi, `String`, dinamik `new/malloc`, float sayı biçimleme, tam Print/Stream, Serial1/2/USB CDC, FreeRTOS, GPIO interrupt API, ADC, LEDC/PWM, I²C/SPI, Wi-Fi ve BLE yerleşik derleyicide yoktur. Kullanılan fakat desteklenmeyen API gerçek derleme/link hatası verir. Dış BIN bu çekirdeği kullanmak zorunda değildir.

Sayaçlar CPU çevrimlerini düzenli `loop`/gecikme/API çağrılarında biriktirir; aynı fonksiyonda bir tam cycle-counter turundan uzun süre hiç zaman API'si çağırmayan bloklama, tam Arduino timer-interrupt davranışı değildir. UART tezgâhı byte transport'tur; bit seviyesi UART analizörü değildir.

## Bellek sınırları

| Hedef | IRAM başlangıç / ayrılan kod | DRAM başlangıç / statik alan | Başlangıç SP |
|---|---|---|---|
| C3 | 0x40380000 / 64 KiB | 0x3fc90000 / 240 KiB | 0x3fcde710 |
| C6 | 0x40800000 / 64 KiB | 0x40810000 / 432 KiB | 0x4087f000 |
| S3 | 0x40380000 / 32 KiB | 0x3fc98000 / 400 KiB | 0x3fcff000 |

Bunlar bağımsız çekirdeğin linker bölümleridir; çipin toplam RAM kapasitesi değildir. S3 IRAM ve DRAM aynı fiziksel RAM'i eşler; kod alanının 32 KiB sınırı veri bölgesiyle çakışmayı önler. Statik RAM `.data + .bss` değeridir, stack zirvesi değildir. Linker bölge taşması reddedilir. ELF girişinin yürütülebilir kod içinde olması, tüm LOAD adres/boyutları, örtüşme ve dosya sınırları denetlenir.

## GPIO tezgâhı, dosyalar ve kayıt

Sabit bağlantı: GPIO2 → 220 Ω → 2 V eşikli test LED → GND; GPIO3 → buton → GND. GPIO kayıtları ideal 0/3.3 V kaynak olarak gösterilir. Girişler başlangıçta HIGH kabul edilir; her giriş pad'i LOW/HIGH seçilebilir. Çıkış pad'i firmware tarafından sürülür. LED HIGH akımı `(3.3−2)/220 = 5.91 mA` ideal tezgâh hesabıdır; yükün CPU girişine geri etkisi/DC çözümü değildir.

AVR serbest devre editörü ve fiziksel 3.3 V ağ henüz bu çalışma alanında yoktur. GPIO2 grafiği 40 ms UI raporlarını örnekler; cycle-exact kenar, PWM frekansı veya kaçırılmamış logic trace iddiası içermez. Register ve 128 byte HEX bellek görüntüsü gerçek emülatör verisidir.

Proje JSON formatı `circuitforge-esp`, version 2 (version1 geriye uyumlu); kaynak/dosyalar/kart/örnek ve geçerli firmware BIN'i taşır. Geçersiz hedef, checksum, boyut/base64 ve kaynak eşleşmesi mevcut çalışmayı değiştirmeden reddedilir. BIN doğrudan uygulama veya ROM boot seçeneğiyle birleşik flash olabilir. Yerleşik `*-simulation.bin` bağımsız simülasyon uygulamasıdır; tek başına fiziksel karta yüklenebilir ESP-IDF dağıtımı olarak sunulmaz. ELF export gerçek linker çıktısıdır.

Yerel otomatik kayıt **tüm kaynak dosyaları/kart/örnek** içindir; sekiz kaynak geçmişi ve son geçerli yedek ayrı bounded kayıt tutar. Firmware/ELF için dosya indirin. Pencere menüsü kart/örnek, tezgâh, editör, terminal ve inspector'ı bağımsız gösterir. Kart + tezgâh, Kod + terminal ve Tüm paneller düzenleri yerel saklanır. AVR projeleri ve kayıtları ayrı kalır.

Uygulama/ESP motoru service-worker cache'inde 20 MiB ile sınırlıdır. Clang bunun dışında ayrı cache'tedir; ilk başarılı compiler hazırlığından sonra ağ olmadan derleme mümkündür. İlk indirme, cache silinmesi veya tarayıcı depolamasının boşaltılması halinde bağlantı gerekir.

## Kaynak ve lisans bildirimi

Kesin boyut/SHA-256 bilgileri `../esp32/provenance.json` içindedir.

- Espressif ESP-EMU 0.48.0: https://github.com/espressif/esp-emulator — `../esp32/pkg/LICENSE`, Apache-2.0. Resmî release paketinin SHA256SUMS kaydı doğrulandı.
- LLVM/Clang: compiler binary https://mokxi.com/toolchain/clang-v3/clang.wasm ; build bilgisi https://mokxi.com/docs/compile ; upstream https://github.com/espressif/llvm-project — `../esp32/compiler/LICENSE.llvm`, Apache-2.0 with LLVM Exceptions. Yalnız LLVM derleyici binary'si alınmıştır; Mokxi simulator/runtime/core/bundle kodu projede yoktur.
- `@bjorn3/browser_wasi_shim` 0.4.2: https://github.com/bjorn3/browser_wasi_shim — `../esp32/compiler/LICENSE-WASI-MIT.txt` (MIT seçeneği).
- Kart SVG'leri özgün CircuitForge CC0 çizimleridir. `../esp32/core/<chip>/Arduino.h` yayımlanan çekirdek API kaynağıdır.

Sonraki kabul sırası: tam Arduino-ESP32 toolchain; ADC enjeksiyonu/LEDC gerçek çıkış adaptörü; 3.3 V devre ağı; I²C/SPI/sensörler; classic ESP32 LX6 ve ek aile hedefleri. Her yetenek gerçek firmware ve kopuk/uyumsuz durum testleriyle kabul edilir.

0.35: Her üç hedefte ayrı CPP/nested header örneği çalışır. Hatalı CPP için dosya ve satıra otomatik geçilir. Dosya silme/rename öncesi kaynak geçmişi kaydı alınır. JSONv2 tüm kaynakları ve hedefi parmak izine katar; eski v1 dosyasına gizli yardımcı kaynak eklenmesi reddedilir.

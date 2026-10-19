# Wirevo 0.75.0 — 50 yeni işlevsel bileşen

Ortak kütüphane 74'ten 124 kart-dışı parçaya çıktı. Yeni 50 profil AVR, ESP32, STM32 ve TM4C123'ün aynı elektriksel devre ağına bağlıdır; yalnız görsel katalog öğeleri değildir. Kart pinleri, uygun besleme, pull-up ve gerektiğinde seviye dönüştürücü kullanılmalıdır. Tact kategorisinde yalnız 6×6 mm anlık buton eklendi; TTP223/MPR121 eklenmedi. Eski 12 mm butonun açık breadboard üstündeki kontrastı koyu gövde/metal çerçeve ile iyileştirildi.

## Eklenenler

- Gösterge: tek/4 hane ortak-katot 7-segment, 10 LED bargraph, bağımsız RGB LED, paralel ve I²C 20×4 LCD, ILI9341 240×320, SSD1680 siyah/beyaz e-paper, XPT2046 dirençli dokunmatik ekran paneli.
- Giriş/analog: 6×6 tact, su, yağmur ve dirençli toprak probu, AHT20, DS3231, ADXL345, ADS1115, MCP4725, PCF8574, PCA9685, CD74HC4067, BME280, BME680, VL53L0X, INA226, TCS34725, MAX30102.
- Güç/hareket/ses: aktif/pasif buzzer, DC motor, A4988, DRV8825, TB6612FNG, PC817 işlevsel optokuplör, PNP, P-MOS, çift yönlü seviye dönüştürücü, I²S mikrofon ve amplifikatör.
- Depolama/haberleşme: MB85RC256V FRAM, W25Q32 SPI NOR, 8 MiB SDSC/FAT16 microSD, DFPlayer, IR LED/alıcı, 3.3 V RS-485, GPS/NMEA, MCP2515, MFRC522 ve PN532.

Ekran RAM'i, GPIO, ADC/DAC voltajı, PWM, motor yönü/step, seri komutlar ve sanal kart verisi koddan değişir. XPT2046 panel koordinatları fare/dokunmadan SPI okumalarına aktarılır. E-paper ve TFT gerçek piksel verisini gösterir. Buzzer sesi kullanıcı etkinleştirmesi gerektirir.

## Doğrulama

Yalnız yeni `expansion-v075` ve `expansion-profile075` dosyaları çalıştırılır; eski test dosyaları çalıştırılmaz. 39 davranış senaryosu 50 parçayı kapsar: gerçek derlenmiş AVR/Arduino C++, ESP32-C3 C17, STM32F103C8 C17 ve TM4C123 C17 firmware. 30 kart profilinin tamamında yeni parçaların ekleme/pin/parametre doğrulaması ayrıca yapılır. Bu, her firmware senaryosunun ayrı ayrı 30 kartta çalıştırıldığı anlamına gelmez. AVR kontrolleri 3.3 V SPI/ekran hatlarında gerçek HC4050 koruması kullanır. Yeni çevrimdışı varlıklar eklendi; 20 MiB sınırı 50 profilin yaklaşık 360 KB ek yükü nedeniyle 21 MiB'e çıkarıldı; Clang ayrı önbellekte kalır.

## Kesin model sınırları

Bu sürüm eksiksiz üretici silikon emülasyonu veya tüm üçüncü taraf sürücü/kütüphaneler için uyumluluk iddiası taşımaz. Desteklenen temel komut/register yolları doğrulanır; burada sayılmayan protokol kipleri garanti edilmez.

- MCP2515 standart çerçeve loopback: harici CAN ağı/transceiver/bit arbitration yok. ACK olmayan normal gönderim başarılı gösterilmez.
- MFRC522/PN532 sanal MIFARE etiketi, UID/temel blok işlemleri; RF alanı, gerçek kart, güvenli kart kriptografisi ve tam NFC yığını yok.
- GPS simüle konumdan 9600 8N1 RMC/GGA üretir; gerçek konum/uydu alımı yok. DFPlayer komut/track/volume/BUSY modelidir; MP3 çözme veya ses dosyası yükleme yok.
- I²S 24-bit PCM/32-bit slot hatları ve diferansiyel çıkış modeli; ses codec DSP/akustik model yok. IR 30–60 kHz taşıyıcı zarfı/kanal eşleşmesi; optik mesafe/gürültü yok.
- SDSC tek blok CMD17/CMD24 ve temel init/CSD; SDHC, multi-block, CRC doğrulaması yok. FAT16 imajı boş başlar; dosya işlemini firmware sürücüsü yapar. NOR/FRAM verileri aynı açık simülasyon oturumunda resetten korunur; diske kalıcı kullanıcı depolaması değildir.
- DS3231 saat/sıcaklık registerları: alarm çıkışları yok. ADS1115 temel dönüşüm/PGA/mux; comparator ALERT ve tüm ADDR seçenekleri yok. ADXL345 temel örnek/data-ready; tam FIFO/interrupt yönlendirmesi yok.
- BME680 sentetik trim ile T/P/H/gaz ADC; BSEC/IAQ hesabı ve gerçek gaz kimyası yok. MAX30102 ham RED/IR FIFO; tıbbi nabız/SpO₂ hesabı yok. VL53L0X temel tek/sürekli ölçüm registerları; üretici kalibrasyon yığınının tamamı yok.
- A4988/DRV8825 step/dir/microstep/enable ve çıkış fazı; kıyıcı akım regülasyonu, tork/atalet/termal koruma yok. DC motor doğrusal voltaj/RPM yaklaşımıdır. Optokuplör temel izolasyon/anahtarlama; CTR/sıcaklık modeli yok. E-paper temel monochrome RAM/refresh; dalga biçimi/LUT ve ghosting yok.

Çizimler özgün, genel simülasyon modülleridir; belirli satıcı PCB'sinin üretim ayak izi iddiası yoktur.

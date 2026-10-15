# QA 0.15 — 10 Ekim 2026

## Otomatik kabul

`npm test`: 200/200 geçti. Mevcut 183 test (OLED/Wire, DC/GPIO, source/ZIP/libraries, segment, montaj, tarihçe) korunur. Yeni 17 kabul: EEPROM page wrap/5ms BUSY/WP/32KB wrap/power abort; RTC CH/BCD/12h midnight/leap day/NVRAM/latch; board legacy faz + dört yön; DIP-8 doğru numara/8 tam delik/8 ayrı bus/dört yön; gerçek MCU Wire EEPROM read bytes ve ACK polling, RTC dakika geçişi, üç adres scanner, elektriksel A strap/WP, VCC/GND/bus/address kopukluğu, WP altında gerçek firmware, ters SDA/SCL/3.3V ve 400kHz RTC reddi, power-reset/EEPROM retention.

`node scripts/check-i2c-modules.mjs`: gerçek avr-g++/Wire ve cycle emülasyonu. EEPROM 5246 Flash / 368 statik SRAM, WRITE=0, BUSY sırasında 34 NACK, okunan CF1. RTC 5368/368, RTC SET=0, 12:34:58 → 12:35:1. Ortak bus scanner 4420/368, ACK0x3C/0x50/0x68 ve Devices:3. Tekrarlanabilir gerçek HEX fixtures/i2c-modules.json içinde.

## Tarayıcı — yalnız sahip olunan localhost test sekmesi

- Başlangıç eski OLED projesi açıldı. Kablo aracında uno:5V ile taslak M315.63,464.24 oluştu; sağ tık sonrasında path boş, durum Pin→köşeler→pin ve araç active. Var olan 12 kablo korunur.
- Breadboard ekleme: eski bb translate(550,160), yeni translate(1016.56,160); corresponding delik/raylar aynı Y. Sığdır ile iki board görünür. Fiziksel sürükleme dört yön/faz otomatik testte doğrulandı; tarayıcı sürükleme API'si kullanılmadı.
- EEPROM örneği UI'den seçildi ve tarayıcıda GCC derlendi. WRITE=0/EEPROM:CF1; inspector Bağlı0x50/READY, d11–d8/f8–f11 sekiz gerçek mount. I²C tabloda W 00 00 ardından R 43 46 31 / 3 bayt ACK görüldü.
- RTC örneği UI'den derlendi/çalıştı: 12:34:58 → 12:35:19; inspector Bağlı0x68 ve ilerleyen saat. SQW/pil kapsamı açık.
- Ortak modül örneği UI'den derlendi: ACK0x3C/0x50/0x68 Devices:3. Run→Durdur devam eder. Stop/reload/run ile kaydedilen devre/HEX yeniden açılır, 0.15 UI ve mount korunur.
- Public kullanıcının Studio sekmesine proje, kaynak veya simülasyon değişikliği uygulanmadı. Yayın sonrası roadmap sayfası yenilenir.

## Sınırlar

Yeni SVG'ler bağımsız CC0 çizimdir; RTC genel 5-pin temsildir, üretici fotoğrafı/mekanik kopya değildir. EEPROM belleği controller instance içinde tutulur; reset/yeni MCU yükleme/JSON reload kalıcılığı yok. RTC pil/SQW/drift yok; VCC kaybında reset. Sayısal I²C transaction modeli; bit dalga/clock stretch yok. Yeni kartlar salt pinout ile emüle edilemez.

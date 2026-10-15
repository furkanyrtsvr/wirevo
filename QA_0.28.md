# QA 0.28 — I²C hat kenarları / SHT31 stretching

68 bileşen / 70 örnek. Dokuz yeni kabul, toplam 370 test / 0 hata (temiz npm ci sonrası tam regresyon). `scripts/check-i2c-lines.mjs` dört gerçek AVR-GCC firmware'i üretir: stretching 100 kHz, 400 kHz, no-stretch early read ve 2 ms Wire timeout; her biri 7204 Flash / 368 statik SRAM. Örnek HEX yalnız bire bir kaynak eşleşmesinde kullanılır.

Gerçek PIN register kenarları ayrıca decode edildi: 0x88 W address ACK, 2C ACK, 06 ACK, 0x89 R address ACK, altı veri baytı, son master NACK ve iki START/STOP. En uzun gerçek SCL LOW >220000 cycle; dönüşüm sırasında byte transport erken tamamlanmaz. 100/400 kHz firmware WAIT_US 14000–17000 aralığı ve CRC OK. Repeated START için dört START / üç STOP, mevcut Wire hata kodları 0:0:2:3; nominal 100 kHz HIGH yarım periyodu 80–84 cycle. Aynı adresli iki sensörün her biti ayrı sinklerden wired-AND birleşir.

Grounded SDA/SCL ACK üretmez; Wire timeout sinkleri bırakır ve geç callback bayt üretmez. Eksik rail/pull-up, restore, dönüşüm sırasında devre düzenleme ve dispose kabulü. Eski OLED scanner testinde yalnız pull-up beslemesi çıkarılan VCC senaryosu artık SCL bekler; diğer kopuk pinler hâlâ Devices:0. Firmware timeout vermemişse floating/LOW clock beklemesi modelin gerçek elektrik davranışıdır.

Tarayıcı QA ayrı origin `127.0.0.1:4174` üzerinde yapıldı; kullanıcının 4173 projesine ve canlı kayıtlarına dokunulmadı. Yeni örnek menüden açıldı; Derle ile gerçek GCC 7204/368, 1.91 s. Çalıştır → Durdur; UART `WAIT_US=15564 BYTES=6 CRC=OK T=25.00`. GPIO C1 A5 / C2 A4, 100 ms, falling SINGLE kayıt ve duraklat ile SCL LOW beklemesi görüldü; iki hat da boşta 3.3 V. Görsel: workspace kökündeki CircuitForge-0.28.jpg.

Kurulum metadata'sındaki AVR8js 0.27/0.25 sapması mevcut çalışan 0.21.0 ile eşitlendi; npm ls temiz. Uygulama sürümü 0.28.0. Build başarılı. ALERT threshold/aktif HIGH driver, GPIO bit-bang I²C, MCU slave, multi-master ve analog rise-time kapsam dışı: `dist/notices/I2C-LINES-MODEL.md`.

Tarayıcı CSV: 244 satır, en uzun SCL LOW 14.8346875 ms; PIN kenarları ile aynı çevrim ekseni.

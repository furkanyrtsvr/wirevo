# Wirevo 0.76 — CAN, RFID/NFC, ses ve sensör protokolleri

124 parçalık katalog korunur. Bu sürüm yeni katalog resmi eklemek yerine mevcut parçaların eksik kod yollarını genişletir. AVR/Arduino, ESP32, STM32 ve TM4C123 aynı modelleri kullanır.

## Eklenen davranışlar

- **MCP2515:** yeni CANH/CANL uçlarını karşılıklı bağlayan modüller arasında normal gönderme/alma; standart/29-bit extended/RTR, CNF saat ayarları, ID önceliğiyle çerçeve arbitrajı ve kaybeden göndericinin yeniden denemesi; ACK yokluğunda TEC/bus-off, maskeler/filtreler, RX overflow/rollover, TX/RX kesmeleri, bulk LOAD TX/READ RX/STATUS, one-shot ve abort. Çizimde ideal transceiver modüle dahildir. CANH ile CANL kısa devre veya farklı bit hızları başarılı haberleşme üretmez.
- **MFRC522 ve PN532:** ortak MIFARE Classic 1K bellek motoru; sektör bazlı Key A/B doğrulama, yanlış UID/anahtar reddi, access-byte bütünlük/izin denetimi, salt-okunur üretici bloğu, anahtar maskeleme/değiştirme, read/write, increment/decrement/restore/transfer; MFRC CRC/ACK/NAK, HALT/WUPA; PN532 hedef bağlamı/hata statüleri, register/diagnostic/RF control ve extended host framing. Kart verisi aynı simülasyon oturumunda okuyucu/MCU resetinden korunur. UID değiştirilirse farklı sanal kart belleği seçilir.
- **DFPlayer:** özgün 0.5 saniyelik demo WAV ve projeye MP3/WAV yükleme. UART play/pause/resume/stop, next/previous, volume, loop, klasör seçimi, reklam/geri dönme, sorgular ve parça bitti cevabı; süreye göre BUSY çıkışı. Ses kullanıcı tarafından etkinleştirilir, tarayıcıda çözülür, kodun oynatma durumu/konumuna bağlıdır. En fazla 8 dosya, dosya başına 1 MiB, toplam 2 MiB; klasör 1 altında yükleme sırasıyla indekslenir. Dosyalar proje JSON'una dahildir; tarayıcı kayıt kotası dolarsa arayüzün JSON indirme uyarısı izlenmelidir.
- **ADS1115:** dört ADDR bağlantısı (GND/VCC/SDA/SCL), traditional/window comparator, polarity/latch/queue, conversion-ready darbesi, open-drain ALERT, ortak-mod giriş denetimi.
- **DS3231:** iki alarmın maske/gün/tarih eşleşmesi, A1F/A2F ve enable/clear, open-drain SQW/INT, 1/1024/4096/8192 Hz SQW ve sıcaklık dönüşüm busy durumu.
- **ADXL345:** 32 örnek FIFO/bypass/stream/trigger, watermark/overrun, INT1/INT2 yönlendirmesi/polaritesi, örneklenmiş activity/inactivity/free-fall/tap eşikleri ve veri okumasıyla FIFO pop. Uzun pasif zaman ilerletmesinde kaçırılan örnekler sınırlı biçimde tamamlanır.
- **INA226:** 16 adres strap seçeneği, şönt/bus/güç eşik maskeleri, conversion-ready/latch/polarity ve ALERT.
- **TCS34725:** clear-channel low/high eşikleri, persistence, INT ve özel clear komutu.
- **MAX30102:** multi-LED slotları, örnek ortalaması, 32 örneklik kapasite/rollover/overflow, ADC çözünürlük maskesi, sıcaklık dönüşümü ve iki IRQ status/enable bankası.
- **VL53L0X:** koddan I²C adresi değiştirme ve XSHUT ile varsayılan adrese dönme.

## Yeni doğrulama kapsamı

Yalnız `protocols-v076-*.test.mjs` çalıştırılır; 0.75 veya daha eski test dosyaları yeniden çalıştırılmaz. Yeni C firmware senaryoları Arduino Uno/AVR, ESP32-C3, STM32F103C8 ve TM4C123'te gerçek komutlar yürütür: iki CAN modülü, MIFARE korumalı blok, NFC auth, comparator/alarm/FIFO/IRQ, MP3 komutları ve ToF adres değişimi. Ortak model katmanı diğer kart profillerine de uygulanır; her senaryonun tüm 30 kartta ayrı yürütüldüğü iddia edilmez.

## Değişmeyen sınırlar

Tam üretici silikonu veya tüm üçüncü taraf kütüphaneler için sınırsız uyumluluk vaadi yoktur. CAN modeli çerçeve/zamanlama düzeyindedir; bit-bit stuffing/CRC bozulma, analog transceiver/termination/EMC ve MCU'nun yerel CAN portuyla bağlantı modellenmez. Bus-off toparlanması reset/yeniden başlatma gerektirir.

RFID/NFC sanal 4-byte UID'li Classic 1K karttır; gerçek RF/Crypto1 dalga biçimi, NTAG/FeliCa/DESFire ve güvenli kart kriptografisi değildir. DFPlayer'ın EQ modu protokolde saklanır; çipin birebir EQ/DAC DSP'si, USB disk ve fiziksel hoparlör akustiği yoktur. MP3/WAV çözme tarayıcının desteklediği codec'e bağlıdır.

BME680 sentetik trim/gaz ADC modeli olarak kalır; lisanslı Bosch BSEC/IAQ motoru yoktur. MAX30102 ham optik veri sağlar; tıbbi SpO₂/nabız algoritması değildir. ToF üretici kalibrasyon yığınının tamamı ve gerçek optik/kimyasal sensör fiziği taklit edilmez. Bu sınırlar yeni register/IRQ işlevlerinden ayrı tutulur.

## Birincil başvurular

[Microchip MCP2515](https://ww1.microchip.com/downloads/aemDocuments/documents/APID/ProductDocuments/DataSheets/MCP2515-Family-Data-Sheet-DS20001801K.pdf), [NXP MFRC522](https://www.nxp.com/docs/en/data-sheet/MFRC522.pdf), [MIFARE Classic](https://cache.nxp.com/docs/en/data-sheet/MF1S50YYX_V1.pdf), [PN532](https://www.nxp.com/docs/en/user-guide/141520.pdf), [TI ADS1115](https://www.ti.com/lit/ds/symlink/ads1115.pdf), [Analog Devices DS3231](https://www.analog.com/media/en/technical-documentation/data-sheets/DS3231.pdf), [ADXL345](https://www.analog.com/media/en/technical-documentation/data-sheets/ADXL345.pdf), [DFRobot DFPlayer](https://wiki.dfrobot.com/dfr0299/docs/20905).

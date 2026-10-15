# 0.13 kabulü

10 Ekim 2026. 169 otomatik test geçti; önceki 150 test korunuyor. OLED/TWI için 17, indeksli AVR arşivi için 2 yeni test var.

Gerçek GCC WASM: OLED sayaç 14312 byte Flash / 395 byte statik SRAM; ADC ekranı 15102 / 397; I²C tarayıcı 4796 / 368. Wire protokol örneğinin gerçek UART çıktısı 0:0:2:3; repeated START sayımı 4 START / 3 STOP. İndeksli GNU/SysV arşivi kullanılmayan kütüphane nesnelerini çıkartır. Çok dosyalı gerçek derleme, GPIO/UART, kaynak tanıları ve SRAM taşma kabulü tekrar geçti.

OLED framebuffer heap tahsisi gerçek AVR talimatlarında izlendi. Sayaç buffer 653–1677, minimum SP 2123: 446 byte boşluk. ADC buffer 655–1679, minimum SP 2105: 426 byte boşluk. ADC 0/25/60/100 yüzdelerinde 1.4 saniye boyunca kontrol edildi. Bunlar örneklerin ölçümüdür; genel heap/stack garanti modeli değildir.

Tarayıcı: üç yeni örnek gerçek CDN toolchain ile derlendi. Sayaç OLED'i canlı çiziyor. Potansiyometreyi %60'tan %100'e taşımak OLED çubuğunu tam genişliğe ve D3 PWM çıkışını HIGH'a getiriyor. 0x3C → 0x3D adres değişiminde gerçek Wire tarayıcısı 0x3D ACK ve Devices: 1 basıyor. Sayaç projesi yeniden açıldığında Bağlı / ON ve 5.00 V görüldü.

I²C izleyici ve CSV tarayıcıda doğrulandı: indirilen 240 işlemde 0x3C, 400000 Hz, ACK ve artan gerçek cycle aralıkları var. Besleme kablosu olmayan JSON dosyası normal proje açma arayüzünden yüklendi: ekran OFF, besleme Hi-Z, piksel alanı boş ve 100 kHz ACK 0 / NACK 160. Bağlantı/power/reset, multiple-address, SDA/SCL, GND/VCC ayrılması ayrıca gerçek AVR + worker testlerinde geçiyor.

Özgün dört pinli SVG ve doğru GND/VCC/SCL/SDA sırası eklendi. Mevcut Uno, MOSFET/NPN montajı ve kablo segment düzenleme testleri korunuyor. Adafruit SSD1306 2.5.16 / GFX 1.12.6 kaynak ZIP'leri, dosya içerikleri, CRC ve BSD bildirimleri kontrol edildi.

Sınırlar: I²C kayıtları TWI işlem düzeyinde; SCL/SDA bit dalga biçimi, clock stretching, bus arbitration ve slave MCU yok. Panel tüketimi/charge-pump elektrik modeli yok. SSD1306 nominal scroll 60 Hz. Bu sürüm ZIP açma, kullanıcı kütüphane yöneticisi veya SPI cihazı eklemiyor. I²C tablosu yalnız yeni işlemler geldiğinde en fazla 5 Hz yenilenir; kayıt toplama ve CSV eksiksizdir. Dolu 240 satırlı tabloda duraklatma, 1.800 s sayaç ekranı, 5 V ve 13.64 mA tarayıcıda doğrulandı; ekran görüntüsü kaydedildi. Yayın sonucu ayrı checkpoint'e kaydedilir.

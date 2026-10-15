# CircuitForge Studio 0.33 doğrulama kaydı

11 Ekim 2026. Yeni hedefler: Mega2560 R3, Duemilanove ATmega328P ve Arduino Pro 5 V / 16 MHz. Toplam 6 kart, 76 bileşen ve 81 örnek.

- `npm test`: 408 test, 408 başarılı, 0 hata.
- Gerçek GCC WASM ile yeni altı örnek derlendi. Mega A15/Timer5/3 KB SRAM örneği 4166 bayt Flash ve 3208 bayt SRAM kullanıyor.
- Mega: 16 ADC, 15 PWM çıkışı ve altı zamanlayıcı; yüksek GPIO pinleri, altı harici kesme ve üç pin-change kesme grubu; dört UART ve bağımsız terminal kayıtları doğrulandı.
- I²C SHT31, SPI MCP3008 ve Serial1 MH-Z19 örneklerinde fiziksel bağlantı ve kablo kesilmesi test edildi. Üç ek UART üzerinden çok baytlı fiziksel echo akışı doğrulandı.
- 152382 baytlık Flash programı ve `pgm_read_byte_far` çalıştırıldı. Yerel Mega çekirdeğinin assembly pulseIn yolu D2–D22 fiziksel jumper ile doğrulandı.
- Tarayıcıda gerçek Derle düğmesiyle Mega ADC ve dört-UART programları derlendi; Mega ADC/PWM, I²C/SPI/Serial1 sensörleri, Duemilanove ve Pro örnekleri çalıştırıldı. Serial1/2/3 mesajları doğru döndü ve portlar arasında kayıtlar korundu.
- UART alıcısının stop biti örnekleme zamanı düzeltildi; ardışık mesajlarda görülen karakter bozulması giderildi.
- Özgün SVG kart görselleri ve Mega örneğindeki breadboard yerleşimi görsel olarak kontrol edildi. Ekran kanıtı çalışma alanındaki `CircuitForge-0.33-Mega-Kartlar.png` dosyasında.
- Offline önbellek listesindeki 299 dosya mevcut; toplam 11824291 bayt. Mega derleyici dosyaları yerel pakete dahildir.

USB/FTDI devreleri ve bootloader çalıştırılması bu kart modellerinin kapsamında değildir. Arduino Pro desteği 5 V / 16 MHz ATmega328P varyantıdır. ESP32 henüz eklenmedi; devam planındaki sonraki hedeftir.

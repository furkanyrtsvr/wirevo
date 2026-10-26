# Yeni özellik doğrulaması · v0.82

- Yalnız yeni `pico-debug-peripherals082.test.mjs` çalıştırıldı: 20/20 başarılı.
- Tüm sekiz hedef için gerçek RP2040/M0+ veya RP2350/M33 instruction yürütümü; iki ailede derlenen firmware hedefe özel paketlendi.
- Breakpoint öncesinde counter=3, local=7; CPU ilerlemez. F10 sonrası counter=10. helper.c içinde parametre=10/result=20; caller yereli görünmez. Devam sonrasında counter=20.
- GP26 devreye 3.3V bağlandığında ADC=4095; PWM'de yüksek/düşük zamanlı kenarlar; UART1 çıktısı; cihaz yokken I²C=-1; SPI fiziksel MOSI/MISO loopback 0xA5.
- EEPROM'a 0x5A yazma, yazma süresi bekleme, tekrarlı START ve aynı adresten 0x5A okuma RP2040 ve RP2350'de geçti.
- JSON doğrulaması breakpoint/izleme listelerini korur ve C ifadesini değişken adı olarak kabul etmez.
- Tarayıcı: Pico 2 W with headers kodu yeniden derlendi, F9 main.c:5'te durdu; sayac=3/artis=7. Satır adımı main.c:6'ya geçti; sayac=10/artis=7, PC=0x1000005c. Test kullanıcının üretim projesini değiştirmeyen localhost sekmesinde yapıldı.
- Eski testler çalıştırılmadı. Fiziksel silikon eşdeğerliği ve bütün Pico SDK'sı doğrulanmadı.

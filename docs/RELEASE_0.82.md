# v0.82.0 · Pico kaynak debugger ve C çevrebirimleri

Sekiz Pico kartında derlenmiş ARM programı için gerçek breakpoint, satır adımı ve duraklatılmış CPU'dan scalar değişken izleme eklendi. F9 veya kırmızı gutter breakpoint koyar; F10 bir sonraki kullanıcı kaynak satırına ilerler. Eski ◆ işaretler yalnız gezinme içindir. Breakpoint ve izleme listeleri proje JSON'unda saklanır. Kaynaklar -O0 / DWARF4 ile ayrı ayrı derlenir.

Yeni C yolları: elektriksel GP26–28 ADC, PWM, UART1 terminal çıkışı, I²C master uyumluluğu ve 8-bit SPI master uyumluluğu. I²C/SPI, devrenin GPIO hatlarından geçer; bağımsız donanım FIFO/DMA adaptörü değildir.

Bu yayın Pico'nun bütün silikon/SDK özelliklerini tamamlamaz. USB, CYW43, PIO/DMA, çok çekirdek, genel IRQ SDK'sı, MicroPython ve diğer mimarilerde kaynak debugger kapsam dışıdır. Kesin sınırlar: dist/notices/PICO-MODEL.md.

Eski test paketleri yerelde çalıştırılmadı. Yeni `tests/pico-debug-peripherals082.test.mjs` 20 kontrol içerir: sekiz modelde breakpoint/step/yerel değişken, ADC/PWM/UART1/NACK/SPI loopback; iki işlemci ailesinde EEPROM yazma/tekrarlı START okuma ve JSON ayarları. Tarayıcıda gerçek `sayac: 3 → 10` tek satır adımı doğrulandı.

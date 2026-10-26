# Pico C modeli · v0.82

Sekiz resmî model: Pico / Pico H / Pico W / Pico WH / Pico 2 / Pico 2 with headers / Pico 2 W / Pico 2 W with headers.

- RP2040: Cortex-M0+ C17 firmware, 264 KiB RAM / 2 MiB flash.
- RP2350: Cortex-M33 C17 firmware, 520 KiB RAM / 4 MiB flash.
- Kart başına imzalı hedef adı + CRC, gerçek ARM makine kodu, modelin ayrı işlemci çekirdekleri. RP2350 firmware'i RP2040 modelinde yürütülmez.
- C kaynakları ayrı derlenip bağlanır; pico/stdlib.h, pico/time.h, hardware/gpio.h ve stdio.h için küçük uyumluluk SDK'sı otomatik sağlanır.
- GPIO, UART0/terminal, model zamanı/sleep ve C çoklu dosya bağlama.
- Yeni: GP26–28 için devredeki voltajdan 12-bit ADC; zamanlı donanım PWM çıkışları; UART1 terminal çıkışı. UART1 girişini fiziksel harici modüle bağlayan adaptör bu kapsamda değildir.
- Yeni: hardware/i2c.h ve hardware/spi.h için bloklayan master çağrıları. Bu uyumluluk katmanı GPIO üzerinden bit sürer; register/FIFO/DMA kullanan donanım sürücüsü değildir. I²C adres/data ACK, NACK, tekrarlı START, STOP ve en fazla 10 ms clock-stretch beklemesi içerir. SPI 8-bit MSB-first, mod 0–3 ve kullanıcı kontrollü CS kullanır; desteklenmeyen veri biçimi transferde -1 döndürür. GPIO tabanlı aktarım hızı en fazla 500 kHz, gerçek hız fonksiyon maliyetinden dolayı daha düşüktür. Pin mux seçimi ilk eşleşen GPIO çiftini kullanır; tek bus için birden fazla alternatif çift seçmeyin.
- Yeni: Clang -O0 / DWARF4 ile derlenen Pico C kodunda gerçek adres breakpointi (F9), kaynak satırı adımı (F10, step-into), duraklat/devam ve gerçek RAM/yazmaç üzerinden scalar global/yerel/parametre izleme. Kaynak dışındaki kodda ilerleyip yeni kullanıcı satırına ulaşır; bir satır adımı 500.000 komutla sınırlıdır. Satır çalıştırılmadan önce durur; yeni tanımlanan ama henüz atanmayan yerel değişkende RAM'in o andaki değeri görülebilir.
- Değişken izlemesi ad kabul eder; genel C ifade değerlendirme, struct/array genişletme, çağrı yığını, step-over/out ve diğer mimarilerde kaynak debugger henüz sunulmaz. Desteklenmeyen DWARF konumu/türü “kullanılamıyor” gösterir. Eski firmware debugger için yeniden derlenir.
- GPIO 3.3 V'tur. H/header varyantlarında pin dizilimi aynıdır; görünümde hazır başlık ayrımı vardır.
- Örnek bütün modellerde harici LED kullanır. W kartlarının dahili LED'i GP25'e bağlı değildir; CYW43 üzerinden sürülür ve bu başlangıçta desteklenmez. Kablosuz olmayan kartların dahili LED'i de bu yayında görsel olarak modellenmez.

## Henüz desteklenmeyenler

Bu **tam Pico SDK veya tam silikon emülatörü değildir**. C17 ve çekirdek 0 kullanılır. USB/UF2/BOOTSEL-ROM açılışı, CYW43 radyo/Wi-Fi/Bluetooth, TrustZone/güvenli açılış, RP2350 Hazard3 seçimi, çok çekirdekli eşzamanlılık, MicroPython, genel IRQ SDK'sı, PIO/DMA ve dahili sıcaklık/VSYS ADC devre adaptörü sunulmaz. Desteklenmeyen başlıklar derleme hatası verir. Flash firmware'i doğrudan reset vektöründen başlatılır; gerçek karta aktarılabilir UF2 çıktısı değildir.

Motor rp2350js 2.0.1 (MIT); RP2040 ve RP2350 için ayrı yerel ARM yürütüm yolları kullanılır. Üretici ROM görüntüsü dağıtılmaz; model kendi sınırlı firmware'ini reset vektöründen başlatır. Döngü/zaman doğruluğu fiziksel silikonla eşdeğer kabul edilmemelidir.

Kaynaklar:
- https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html
- https://www.raspberrypi.com/documentation/pico-sdk/hardware.html
- https://github.com/c1570/rp2350js
- https://dwarfstd.org/doc/DWARF4.pdf

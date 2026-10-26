# Pico C başlangıç modeli

Sekiz resmî model: Pico / Pico H / Pico W / Pico WH / Pico 2 / Pico 2 with headers / Pico 2 W / Pico 2 W with headers.

- RP2040: Cortex-M0+ C17 firmware, 264 KiB RAM / 2 MiB flash.
- RP2350: Cortex-M33 C17 firmware, 520 KiB RAM / 4 MiB flash.
- Kart başına imzalı hedef adı + CRC, gerçek ARM makine kodu, modelin ayrı işlemci çekirdekleri. RP2350 firmware'i RP2040 modelinde yürütülmez.
- C kaynakları ayrı derlenip bağlanır; pico/stdlib.h, pico/time.h, hardware/gpio.h ve stdio.h için küçük uyumluluk SDK'sı otomatik sağlanır.
- Doğrulanmış başlangıç: harici GP15 LED + seri direnç, GP14 pull-up buton, GPIO, UART0/terminal, model zamanı/sleep ve C çoklu dosya bağlama.
- GPIO 3.3 V'tur. H/header varyantlarında pin dizilimi aynıdır; görünümde hazır başlık ayrımı vardır.
- Örnek bütün modellerde harici LED kullanır. W kartlarının dahili LED'i GP25'e bağlı değildir; CYW43 üzerinden sürülür ve bu başlangıçta desteklenmez. Kablosuz olmayan kartların dahili LED'i de bu yayında görsel olarak modellenmez.

## Henüz desteklenmeyenler

Bu **tam Pico SDK veya tam silikon emülatörü değildir**. İlk sürümde C17 ve çekirdek 0 kullanılır. USB/UF2/BOOTSEL-ROM açılışı, CYW43 radyo/Wi-Fi/Bluetooth, TrustZone/güvenli açılış, RP2350 Hazard3 seçimi, çok çekirdekli eşzamanlılık, MicroPython, PIO/DMA ve ADC için tamamlanmış Wirevo devre adaptörü sunulmaz. Desteklenmeyen başlıklar derleme hatası verir; görünmez sahte servis üretilmez. Flash firmware'i doğrudan reset vektöründen başlatılır; gerçek karta aktarılabilir UF2 çıktısı değildir.

Motor rp2350js 2.0.1 (MIT); RP2040 ve RP2350 için ayrı yerel ARM yürütüm yolları kullanılır. Üretici ROM görüntüsü dağıtılmaz; model kendi sınırlı firmware'ini reset vektöründen başlatır. Döngü/zaman doğruluğu fiziksel silikonla eşdeğer kabul edilmemelidir.

Kaynaklar:
- https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html
- https://www.raspberrypi.com/documentation/pico-sdk/hardware.html
- https://github.com/c1570/rp2350js

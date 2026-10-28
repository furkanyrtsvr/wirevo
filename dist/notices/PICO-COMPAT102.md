# Pico C uyumluluk genişlemesi — 0.102

Bütün işlemler tarayıcıda gerçekleşir. Ek uygulama, yerel servis, Python veya sunucuda derleme eklenmedi. Bu genişleme için ayrıca SDK paketi seçmeniz gerekmez.

## Hazır çalışan örnekler

Projeler ve örnekler menüsünde **Pico C · SPI 16 bit** ve **Pico C · UART FIFO / loopback** bulunur. Kart seçildikten sonra Derle → Çalıştır kullanılır.

SPI örneği GP19 (TX) ile GP16 (RX) arasına devre kablosunu hazır ekler; GP18 saattir. 0xa53c ve 0x192e sözcüklerini gönderir, aynı değerleri alırsa terminale SPI16 OK yazar ve GP15 LED'ini yakar. Kabloyu kaldırmak veri dönüşünü bozar; sonuç hazır verilmez.

UART örneği PL011 dahili loopback bitini kullanır; dış UART kablosu gerekmez. UART1 üzerinden PICO gönderilir ve alım tamponundan geri okunur. UART loopback OK ve GP15 LED'i başarıyı gösterir.

## SDK ve donanım davranışı

- SPI0/SPI1: 4–16 bit MSB-first aktarım; dört CPOL/CPHA birleşimi. `spi_write16_read16_blocking`, `spi_write16_blocking`, `spi_read16_blocking`, `spi_set_baudrate`, `spi_get_baudrate`, `spi_get_index`, `spi_deinit` eklendi. 8 bit çağrıları korunur. Resmi SDK'deki SPI_MSB_FIRST=1 / SPI_LSB_FIRST=0 değerleri düzeltildi. LSB-first biçimi desteklenmez; aktarım -1 verir.
- `gpio_set_function`: pin girişini etkinleştirir, çıkış engelini ve RP2350 pad izolasyonunu kaldırır. Gerçek SDK kodlarında fazladan `gpio_init` zorunluluğu kalkar. SPI testleri pinleri yalnız fonksiyon seçerek hazırlar.
- UART0/UART1: `uart_set_format` ile 5–8 veri biti, stop/parite ayarı; `uart_set_baudrate`, `uart_get_index`, `uart_get_hw`, `uart_is_enabled`, `uart_deinit`, FIFO açma/kapama, RX/TX kesme maskeleri, zaman sınırlı okunabilirlik, CR/LF çevirisi ve TX bekleme çağrıları eklendi. `hardware/structs/uart.h`, uart0_hw/uart1_hw ve aileye uygun UART0_IRQ/UART1_IRQ değerleri bulunur.
- UART alımı: dahili loopback, devre dışı TX/RX kapıları, veri genişliği maskesi, 32 bayt FIFO / FIFO kapalıyken tek bayt kapasitesi, IFLS alım eşikleri, 32 bit sürelik boşta kalma zaman aşımı, taşma durumu ve temizleme modellenir. FIFO boşalınca alım kesmesi kalkar. Bu davranışlar kayıtçılar ve gerçek C kesme işleyicisiyle doğrulandı.
- Seri terminal girdisi UART'a ayarlanmış baud ve çerçeve uzunluğuyla sırayla iletilir. FIFO kapalıyken aynı anda bütün metni basıp bayt kaybetmez; art arda gönderimler sıralarını korur. USB CDC yolu korunur.

## Doğrulanan kapsam

Yeni C programı sekiz kartın tümünde ARM firmware olarak derlenip çalıştırıldı. İki SPI veri yolu, altı bit genişliği (4/7/8/9/12/16), dört saat modu, 16 bit okuma/yazma/dolgu, 8 bit aktarım, UART FIFO/taşma/IRQ/timeout/CRLF ve LED doğrulandı. İki ailede kayıtçı ve terminal giriş denemeleri, hazır örnekler ve Pico 2 Hazard3 UART örneği ayrıca doğrulandı. Eski testler çalıştırılmadı.

## Sınırlar

Bu sürüm tam upstream SDK/CMake veya bütün silikon davranışları değildir. SPI SDK yolu mevcut GPIO tabanlı senkron master katmanını kullanır; hız yazılımsal beklemelerle sınırlıdır, donanım SPI FIFO/DMA/slave eşdeğerliği iddia edilmez. UART dış bağlantıları bayt düzeyinde modellenir; parite/stop ayarları kayıtçılarda korunur fakat parite/çerçeve hatası üretimi, bit düzeyinde TX zamanlaması, tam TX FIFO ve CTS/RTS akışı eklenmemiştir. `uart_tx_wait_blocking` mevcut bayt modeli üzerinde çalışır. Dahili loopback ve alım zaman aşımı simülasyon saatiyle yürür. ROM/radyo ve diğer çevrebirimlerin önceki sınırları değişmez.

Anlamsal kaynaklar: [Pico SDK SPI](https://github.com/raspberrypi/pico-sdk/blob/2.2.0/src/rp2_common/hardware_spi/include/hardware/spi.h), [UART](https://github.com/raspberrypi/pico-sdk/blob/2.2.0/src/rp2_common/hardware_uart/include/hardware/uart.h), [GPIO](https://github.com/raspberrypi/pico-sdk/blob/2.2.0/src/rp2_common/hardware_gpio/gpio.c). Wirevo uygulaması mevcut çalışma zamanı üzerinde bağımsız uyumluluk kodudur.

# CircuitForge 0.39 — C17 sensör devreleri

Dosya → Yeni proje → ESP32 → **C · main.c**: SHT31 sıcaklık/nem veya MCP3008/potansiyometre başlangıcını seçin. Projeler menüsünde de iki C17 örneği bulunur. 14 ESP kartının fiziksel başlıklarına göre SDA/SCL ve SCK/MOSI/MISO/CS birlikte eşlenir. Devre, breadboard, pinout, ölçüm ve pencere düzeni ortak alandadır.

`main.c`, `cf_bus.h` ve **ayrı derlenen `cf_bus.c`** kaynakları görünür ve düzenlenebilir; JSON/ZIP hepsini saklar. Sürücü dosyası değişince eski firmware geçersiz olur. C sensör API'si kütüphane kaynak kodudur; kullanıcının özel programına gizli kaynak dönüşümü uygulanmaz.

- `cf_gpio_valid(pin)` seçili kartın kullanılabilir GPIO başlığını denetler.
- `cf_i2c_init/write/read`: GPIO LOW veya iç pull-up ile açık drenajı bırakma; 7 bit adres, ACK/NACK, en çok128 byte, 1–10 kHz. Okuma sonunda ACK/NACK ve STOP gerçek hat seviyelerinden oluşur. Clock stretching, repeated-start ve multi-master bu C sürücüsünde yoktur. Geçersiz pin/frekans/uzunluk ve ACK başarısızlığı negatif dönüş verir.
- SHT31 `0x2400` ölçüm komutu, 20 ms bekleme, altı byte ve iki CRC-8 (polinom0x31, başlangıç0xff). Sıcaklık/nem tam sayı x100 olarak basılır; native değer değişimi ve güç kesilince NO ACK doğrulandı.
- `cf_spi_init/transfer`: MODE0, MSB-first,8 bit,10–20kHz; gerçek GPIO clock/MOSI ve fiziksel MISO. MCP3008 CH0 üç byte komutuyla haricî potansiyometreyi örnekler. mV hesabı nominal3300mV VREF /1024 kuantalama adımıdır; pot%50→ADC512/mV1650, %75→ADC768/mV2475.

Çıkışlar gerçek Clang C17 makine kodu ve ESP-EMU CPU ile üretilir; regex ile sensör sonucu tahmin edilmez. Frekans bus sürücüsünün bekleme hedefidir; GPIO/C çağrı komutları gerçek efektif hıza eklenir. Gerçek GPIO giriş/çıkış ve DC besleme koşulları sensör yanıtını belirler. Dahili ESP ADC veya donanım I²C/SPI desteği iddiası yoktur. Tam newlib/ESP-IDF/Arduino SDK kapsamı değildir.

Protokol kaynakları: [Sensirion SHT3x datasheet](https://sensirion.com/media/documents/213E6A3B/63A5A569/Datasheet_SHT3x_DIS.pdf), [Microchip MCP3008](https://ww1.microchip.com/downloads/aemDocuments/documents/MSLD/ProductDocuments/DataSheets/MCP3004-MCP3008-Data-Sheet-DS20001295.pdf). Kart başlık kaynakları ESP32-BOARD-PROFILES.md içinde. Bu özgün C sürücü dosyaları CircuitForge kaynak paketinin parçasıdır.

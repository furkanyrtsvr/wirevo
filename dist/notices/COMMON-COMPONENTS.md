# Ortak bileşenler · 0.74

74 devre bileşeni Arduino/AVR, ESP32, STM32 ve TM4C123'te aynı katalog, çizim, parametre ve pin tanımlarından gelir. MCU kart listesi aileye özeldir.

Native GPIO köprüsü mevcut TFT, MAX7219, shift-register, dijital sensör, servo/motor, PIR, sinyal üreteci ve MH-Z19 modellerini kullanır. Çözülen elektriksel netler ve 16 MHz model zamanı esastır; görünürlük için sahte firmware sonucu üretilmez. SPI/UART aygıtları yazılımsal GPIO ile sürülebilir. MCU'nun hardware kayıt profili ayrıca geçerlidir.

Aynı bileşen listesi, Arduino C++ kodunun veya tüm kütüphanelerinin diğer MCU'larda doğrudan derlenmesi değildir. Tiva yalnız C17; pin/besleme/ADC/PWM ve dil desteği karta göre kalır. 5 V lojik, harici besleme, seviye dönüştürücü, pull-up ve akım sınırlama gereksinimleri kaldırılmadı.

Native kapasitör/indüktörler artık MCU model zamanı üzerinden Backward Euler RC/RL geçici rejim hesabını kullanır. Durum GPIO kenarından önceki çıkışla ilerletilir; enerji/gerilim/akım snapshot'a taşınır. Sayısal adım 10 µs–1 ms ile sınırlıdır; çok hızlı devrelerde stepLimited işaretlenir. Bu SPICE, tam analog veya fiziksel silikonla birebir çevrim doğruluğu değildir.

MCP23017 GPIO/pull-up/kesme ve MPU6050 INT çıkışları gerçek elektriksel netlere bağlanır; I²C aygıt dönüşüm/kesme zamanları native olay kuyruğunda çalışır. TM1637, doğrudan pin eşitliği zorunluluğu olmadan elektriksel hatlardan seviye dönüştürücü üzerinden de çalışır. Ohmmetre okumaları native snapshot'a dahildir.

Yeni 0.74 doğrulaması 74 parçanın temsili davranışını ESP32-C3, STM32F103C8 ve TM4C123GH6PM'de ayrı ayrı derlenmiş C17 firmware ile sınar. Komutlar gerçek UART üzerinden firmware'e gelir; GPIO, SPI/I²C/1-Wire/UART bitleri CPU tarafından üretilir. Analog sensörlerde ortak MCP3008 harici ADC kullanılır; bütün kartların dahili ADC eşdeğerliği iddia edilmez. Pasif parçalar kodla sürülen/okunan elektriksel ağda doğrulanır. Bu her kart profili × her protokol varyantının tüketici donanımı üzerinde denenmesi değildir.

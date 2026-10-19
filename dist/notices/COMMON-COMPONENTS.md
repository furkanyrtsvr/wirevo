# Ortak bileşenler · 0.73

74 devre bileşeni Arduino/AVR, ESP32, STM32 ve TM4C123'te aynı katalog, çizim, parametre ve pin tanımlarından gelir. MCU kart listesi aileye özeldir.

Native GPIO köprüsü mevcut TFT, MAX7219, shift-register, dijital sensör, servo/motor, PIR, sinyal üreteci ve MH-Z19 modellerini kullanır. Çözülen elektriksel netler ve 16 MHz model zamanı esastır; görünürlük için sahte firmware sonucu üretilmez. SPI/UART aygıtları yazılımsal GPIO ile sürülebilir. MCU'nun hardware kayıt profili ayrıca geçerlidir.

Aynı bileşen listesi, Arduino C++ kodunun veya tüm kütüphanelerinin diğer MCU'larda doğrudan derlenmesi değildir. Tiva yalnız C17; pin/besleme/ADC/PWM ve dil desteği karta göre kalır. 5 V lojik, harici besleme, seviye dönüştürücü, pull-up ve akım sınırlama gereksinimleri kaldırılmadı.

Native kapasitör/indüktör modelleri DC davranışını korur; AVR cycle-transient RC/RL bu sürümde native katmana taşınmadı. Tam fiziksel silikon, tüm protokoller veya üreticiye özgü tüm varyantlar iddiası yoktur.

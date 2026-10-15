# CircuitForge 0.31 doğrulama — 2026-10-11

npm run build başarılı. npm test: 388 test /0 hata, 82.78 s. Önceki 385 test korunur; üç yeni native Mega backend kabul testi eklendi. Üretim destek listesi üç kart, 70 giriş /75 örnek.

Nano ve Pro Mini SVG'leri scripts/draw-avr-boards.mjs ile üretildi. Pin koordinatlarına dokunulmadı; LED görsel konumları parçalarla çakışmayacak biçimde düzeltildi. Temiz localhost:4176 IDE'de katalog/örnek görüntüleri, bağımsız localhost:4180 karşılaştırma sayfasında büyük çizimler kontrol edildi. Ekran kanıtı üst klasörde CircuitForge-0.31-Kart-Gorselleri.png. Canlı kullanıcı devresi değiştirilmedi.

Native Mega AVR GCC7.3.0 /Arduino AVR1.8.7:25 core nesnesi. Firmware .text5106/.data44/.bss3637/.fartext1(byte0x20000). Tekrar üretim scripts/check-mega-toolchain.py; fixture tests/fixtures/mega-backend.hex. Gerçek CPU kabulü: üç byte PC, FAR=77, ADC15=512, millis>=100ms ilerleme, dört USART0-3 TX, D53/PB0, Timer5 OC5C/PL5 periyotları16384/16256cycle. Mega yüksek adresli HEX default Uno parser'ında reddedilir. Sınırlar MEGA-BACKEND-MODEL.md'de; Mega henüz IDE kartı değildir.

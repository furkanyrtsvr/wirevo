# CircuitForge genişletilmiş modül çizimleri

`lcd-8x2-i2c.svg`, `lcd-16x2-i2c.svg`, `bmp280-breakout.svg`, `mcp3008-dip16.svg`, `ds18b20-to92.svg`, `max7219-matrix8.svg`, `max7219-digits8.svg`, `tmp36-to92.svg`, `ldr-photoresistor.svg` ve `mh-z19b-uart.svg` bağımsız CircuitForge vektör çizimleridir. Çizimler ve `expanded-hardware.js` metadata kodu CC0-1.0 olarak sunulmaktadır. Üreticilerin fotoğrafları, logo veya veri sayfalarındaki çizim yolları kopyalanmamıştır. Teknik kaynak belgelerinin telif ve marka hakları kendi sahiplerine aittir.

Çizimler bağlantı düzenleyicisindeki pin işlevlerini gösterir. Genel breakout kartları belirli bir üreticinin mekanik çizimi veya ölçülmüş PCB kopyası değildir. Her piyasadaki LCD/BMP280/MAX7219 kartının pin sırası aynı değildir; simülatördeki etiketleri kullanın. 9.6 çizim birimi 2.54 mm delik adımına karşılık gelir; 1.35 dünya ölçeği mevcut breadboard ile ortak adım sağlar. TO-92 bacak uçları breadboarda takılacak şekilde açılmıştır. DIP-16 pin adımı 2.54 mm, sıra aralığı 7.62 mm olarak çizilir. Üç boyutlu çakışma veya üretim toleransı iddiası yoktur.

## LCD 8×2 ve 16×2

8×2 ve 16×2 ayrı ekranlardır; 8×2 çizimi sekiz sütun ve iki satır içerir. LCD komut modeli HD44780/ST7066 uyumlu karakter ekranı, I²C bağlantısı ise genel PCF8574 backpack düzenidir. Bu bağlantı, çıplak LCD denetleyicisinin I²C arayüzü olduğu anlamına gelmez.

Backpack pinleri GND, VCC, SDA, SCL; iç bağlantı P0→RS, P1→RW, P2→E, P3→arka ışık, P4–P7→D4–D7 olarak tanımlıdır. Bu yaygın fakat evrensel olmayan eşleme modelin seçimidir. PCF8574 adres aralığı 0x20–0x27; varsayılan 0x27. PCF8574A farklı adres aralığına sahiptir.

Kaynaklar: [NXP PCF8574/PCF8574A Rev.5](https://www.nxp.com/docs/en/data-sheet/PCF8574_PCF8574A.pdf), [Newhaven ST7066 komut ve ekran bağlantı belgesi](https://newhavendisplay.com/content/app_notes/ST7066.pdf), [gerçek 8×2 karakter ekranı örneği](https://newhavendisplay.com/2x8-character-lcd-stn-gray-display-bz-with-yellow-green-backlight/). Newhaven ürünü çizimin mekanik birebir karşılığı değildir.

## BMP280

BMP280 sıcaklık ve basınç sensörüdür; nem ölçmez. Genel breakout üzerinde VDD ve VDDIO aynı VCC terminaline bağlıdır. Terminal sırası VCC, GND, SCK, SDI, CSB, SDO. SCK I²C'de SCL, SDI ise SDA olur. CSB yüksek I²C seçer; SDO adres bitini seçer (0x76 / 0x77). Çıplak yonganın VDD sınırı 1.71–3.6 V, VDDIO sınırı 1.2–3.6 V'dur. Bu çizim regülatör veya 5 V seviye dönüştürücü içerdiğini iddia etmez.

Kaynak: [Bosch BST-BMP280-DS001-26, Rev.1.26](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bmp280-ds001.pdf), özellikle pin açıklamaları ve I²C/SPI bağlantıları. Yonga pinleri 1:GND, 2:CSB, 3:SDI, 4:SCK, 5:SDO, 6:VDDIO, 7:GND, 8:VDD.

## MCP3008

DIP-16 üstten görünüş, çentik yukarıdadır. Solda yukarıdan aşağı 1–8 CH0–CH7; sağda aşağıdan yukarı 9 DGND, 10 CS/SHDN, 11 DIN, 12 DOUT, 13 CLK, 14 AGND, 15 VREF, 16 VDD. Analog ve dijital toprak pinleri ayrı terminallerdir; dış devrede bağlanmalıdır. Sekiz kanal, 10 bit, SPI; VREF analog tam ölçeği belirler.

Kaynak: [Microchip MCP3004/MCP3008 DS21295D](https://ww1.microchip.com/downloads/aemDocuments/documents/APID/ProductDocuments/DataSheets/21295d.pdf), s.1 pin diyagramı, s.19–22 seri iletişim. 2.7–5.5 V çalışma aralığı.

## DS18B20

TO-92 düz ön yüze bakarken soldan sağa 1:GND, 2:DQ, 3:VDD. DQ 1-Wire veri hattıdır; normal dış beslemeli kullanımda harici pull-up gerekir. Parazit besleme, sensörün fiziksel yeteneğidir; çizim bu çalışma modunun simülasyonunun bulunduğunu tek başına iddia etmez.

Kaynak: [Analog Devices DS18B20 Rev.6](https://www.analog.com/media/en/technical-documentation/data-sheets/ds18b20.pdf), s.1 pin düzeni ve 1-Wire iletişim bölümleri. Sıcaklık aralığı −55…125 °C; dış besleme 3.0–5.5 V.

## MAX7219 ekran kartları

8×8 LED matris ve sekiz haneli ortak katot ekran, aynı MAX7219 denetleyici ailesinin farklı genel kart montajlarıdır. Giriş başlığı VCC, GND, DIN, CS, CLK. CS kart terminali, MAX7219 yonga pin12 LOAD işlevine bağlıdır; DIN pin1, CLK pin13, V+ pin19, GND pin4 ve pin9. DOUT/kaskat başlığı çizilmemiştir. MAX7219 ile MAX7221 aynı yonga diye birleştirilmez; SPI uyumluluğu ve CS davranışı farkları kaynakta açıklanır.

Kaynak: [Analog Devices MAX7219/MAX7221 Rev.6](https://www.analog.com/media/en/technical-documentation/data-sheets/MAX7219-MAX7221.pdf). Register, digit/segment ve seri arayüz tanımları referanstır. Segment akım ayar direnci, parlaklık, güç tüketimi ve LED termal davranışı çizimden çıkarılamaz.

## TMP36 ve LDR

TMP36 TO-92 düz ön yüz soldan sağa 1:+VS (VCC), 2:VOUT (OUT), 3:GND. TMP36 çıkışı 25 °C'de 750 mV; dönüşüm 500 mV ofset ve 10 mV/°C eğimle yapılır. Besleme 2.7–5.5 V.

Kaynak: [Analog Devices TMP35/TMP36/TMP37 Rev.H](https://www.analog.com/media/en/technical-documentation/data-sheets/TMP35_36_37.pdf), s.1 pin ve transfer bilgileri. LDR iki uçlu, polaritesiz genel foto dirençtir; belirli GL5528 veya başka üretici kalibrasyonu iddiası yoktur.

## MH-Z19B UART adaptör görünümü

MH-Z19B altın renkli NDIR gövdesi, dört sinyali dışarı çıkaran genel UART adaptör çizimiyle gösterilir. Başlık sırası VCC (Vin), GND, RX (Rx), TX (Tx). Bu başlık sensörün özgün yedi pinli soketinin mekanik kopyası değildir. Soket işlevleri 3:GND, 4:Vin, 5:Rx, 6:Tx; diğer rezerv pinler boş bırakılır. PWM ve HD bu modelin başlığına çıkarılmamıştır. Besleme 4.5–5.5 V; arayüz seviyesi 3.3 V, üretici 5 V uyumlu olarak tanımlar.

Kaynak: [Winsen MH-Z19B User Manual v1.7](https://www.winsen-sensor.com/d/files/manual/mh-z19b.pdf), bağlantı ve parametre bölümleri. Isınma süresi, gerçek gaz difüzyonu, kalibrasyon hatası, sensör gürültüsü ve tepe besleme akımı çizimin veya ideal komut cevabının kapsamına otomatik olarak dahil değildir.

Çalışan protokol, zamanlama ve analog model kapsamı sürüm QA notlarında ayrıca doğrulanır. Bir asset veya katalog tanımı, tek başına bu işlevlerin tamamının uygulanmış olduğu anlamına gelmez.

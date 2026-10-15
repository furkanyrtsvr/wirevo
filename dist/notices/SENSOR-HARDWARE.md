# CircuitForge sensör ve GPIO donanım çizimleri

`sht31-breakout.svg`, `bh1750-breakout.svg`, `mpu6050-gy521.svg`, `mcp23017-dip28.svg` ve `sensor-hardware.js` özgün CircuitForge vektör çizimleri ve metadata kodudur; CC0-1.0 olarak sunulur. Üretici fotoğrafı, logosu veya veri sayfası çizim yolları kopyalanmamıştır. Teknik belgelerin hakları kendi sahiplerine aittir.

Genel breakout çizimleri belirli bir satıcının PCB kopyası veya sertifikalı mekanik ayak izi değildir. Etiketler simülatördeki terminal sırasını tanımlar; başka bir fiziksel kartın sırasını varsaymayın. 9.6 kaynak birimi × 1.35 dünya ölçeği = 12.96 birim, mevcut breadboardun 2.54 mm adımıdır. MCP23017 pin numaraları ise gerçek SPDIP-28 pakete aittir. Katalog veya çizim tek başına bütün protokol özelliklerinin uygulanmış olduğu iddiasını taşımaz; çalışan model kapsamı ayrıca QA notlarında belirtilir.

## SHT31

Genel altı uçlu kart soldan sağa VIN, GND, SCL, SDA, ADDR, ALERT. VIN doğrudan VDD, GND VSS/R bağlantısıdır. Regülatör veya 5 V seviye dönüştürücü varsayılmaz. DFN yonga uçları: 1 SDA, 2 ADDR, 3 ALERT, 4 SCL, 5 VDD, 6 nRESET, 7 R, 8 VSS. nRESET başlığa çıkarılmamıştır. ADDR dışarıda LOW/HIGH seviyesine bağlanmalıdır; adres 0x44/0x45. Besleme 2.15–5.5 V; sıcaklık −40…125 °C, nem 0…100 %RH. Açık drenaj I²C hatları dış pull-up ister. Kullanılmayan ALERT boş bırakılır.

Kaynak: [Sensirion SHT3x-DIS Version 7, Aralık 2022](https://sensirion.com/media/documents/213E6A3B/63A5A569/Datasheet_SHT3x_DIS.pdf), özellikle tablo 3, 7, 8 ve bağlantı bölümü.

## BH1750

Genel beş uçlu kart: VCC, GND, SCL, SDA, ADDR. VCC ve DVI bu kartta aynı beslemeye bağlı kabul edilir. 2.4–3.6 V besleme, 3.3 V kullanım; regülatör/seviye dönüştürücü çizilmemiştir. ADDR LOW/HIGH ile 0x23/0x5C seçilir. Veri sayfasının ADDR için önerdiği yaklaşık 100 kΩ dirençli bağlantı fiziksel devrede dikkate alınmalıdır. Çizim piyasadaki her GY-302 kartının aynı pin sırasına veya besleme özelliğine sahip olduğunu söylemez. Lux değeri ışık spektrumu, sensör kalibrasyonu ve ölçüm modu etkilerinden ayrıdır.

Kaynaklar: [ROHM BH1750FVI teknik notu](https://rohmfs.rohm.com/en/products/databook/datasheet/ic/sensor/light/bh1750fvi-e.pdf), [ROHM ambient light sensör seçim kılavuzu](https://www.rohm.de/documents/4392907/4398305/CNA09016_sg.pdf). Kaynak teknik notu üretici sunucusunda bağlantı değişikliğine uğrayabilir.

## MPU6050 / GY-521 tarzı kart

Sekiz uçlu yaygın bağlantı düzeni VCC, GND, SCL, SDA, XDA, XCL, AD0, INT; özgün genel PCB çizimidir. XDA/XCL yardımcı I²C hatlarıdır, normal ana bus SDA/SCL değildir. AD0 LOW/HIGH 0x68/0x69 adresini seçer. MPU6050 yalnız I²C arayüzlüdür; MPU6000 SPI desteği bu parçaya atfedilmez. Bu model doğrudan 3.3 V besleme kullanır; tipik piyasadaki GY-521 regülatörünün 5 V VIN davranışı varsayılmaz. Yonga VDD aralığı 2.375–3.46 V. Kataloğun terminal isimleri 24-pin QFN'nin fiziksel pin numaraları değildir. İvme aralıkları ±2/4/8/16 g, jiroskop ±250/500/1000/2000 °/s.

Kaynak: [TDK/InvenSense MPU6000/MPU6050 Product Specification, Rev.3.4](https://product.tdk.com/system/files/dam/doc/product/sensor/mortion-inertial/imu/data_sheet/mpu-6000-datasheet1.pdf). GY-521 başlık düzeni genel kart seçimi olarak açıkça belirtilmiştir; üretici yonga veri sayfası breakout kartının mekanik belgesi değildir.

## MCP23017 SPDIP-28

Üstten görünüş, çentik yukarı. Solda yukarıdan aşağı 1–8 GPB0–GPB7, 9 VDD, 10 VSS, 11 NC, 12 SCL (eski diyagramlarda SCK), 13 SDA, 14 NC. Sağda aşağıdan yukarı 15 A0, 16 A1, 17 A2, 18 RESET, 19 INTB, 20 INTA, 21–28 GPA0–GPA7. RESET aktif LOW. Metadata `NC11` ve `NC14` ile iki bağlantısız ucu ayrı tanımlar. Pin adımı 2.54 mm, iki sıra merkez aralığı 7.62 mm; 90° dönüş breadboardun orta kanalını aşar. Adres seçimi A2:A0 ile 0x20–0x27, besleme 1.8–5.5 V. Güncel MCP23017 veri sayfasında GPA7 ve GPB7 yalnız çıkış olarak belirtilir; eski belgelerdeki tüm port bitlerinin iki yönlü kullanımını bu revizyona taşımayın. MCP23S17 ayrı SPI parçadır.

Kaynaklar: [Microchip MCP23017/MCP23S17 DS20001952](https://ww1.microchip.com/downloads/aemDocuments/documents/APID/ProductDocuments/DataSheets/MCP23017-MCP23S17-16-Bit-IO-Expander-with-Serial-Interface-DS20001952.pdf), [Microchip ürün sayfası](https://www.microchip.com/en-us/product/mcp23017), [Microchip GPA7/GPB7 destek açıklaması](https://support.microchip.com/s/article/GPA7---GPB7-Cannot-Be-Used-as-Inputs-In-MCP23017).

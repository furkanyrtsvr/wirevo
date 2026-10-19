# Wirevo 0.79.0 — gerçek ürün fotoğraflarıyla karşılaştırılan çizimler

Gerçek ürün fotoğrafları yerel `.sites-runtime/reference-photos/` klasörüne indirildi.
Kaynak sayfaları ve dosyalar üç yerel manifestte saklanır. Fotoğraflar lisans
belirsizliği nedeniyle uygulama paketine konmaz; karşılaştırılarak özgün SVG çizilir.
Bu sürüm bütün kataloğun birebir üretici fotoğrafı olduğu iddiasında değildir.

Fotoğraf temelli somut düzeltmeler:

- MCP2515: uzun mavi PCB, büyük kontrolcü, oval kristal ve çift vidalı klemens.
- RC522: anten yayları, işlemci/kristal yerleşimi ve montaj delikleri.
- DFPlayer: siyah PCB, yan lehim delikleri ve yüzeyi kaplayan metal microSD yuvası.
- Pasif piezo: daha yatık üst yüzey ve belirgin siyah silindirik yan duvar.
- DHT22: üst pah, gerçek montaj deliği ve beyaz havalandırmalı gövde.
- SHT31: yanlış koyu ızgara yerine düz beyaz sensör kapağı.
- KY-040: dişli boyun ve D-flat metal mil.
- 28BYJ: yuvarlak metal kutu, kaydırılmış mil ve montaj kulakları.
- HC-SR04: koyu örgü yüzey ve gümüş metal ağız.
- WS2812: ince siyah PCB, kenar kapasitörleri ve metal adaptör bacakları.
- ST7735: gümüş çerçeve ve bakır izli amber flex.

0.78'de kaldırılan koyu etiket plakaları ve gövdeyi basıklaştıran ölçek geri gelmez.
Şeffaf RGB lensi ve ayrı, konturlu okunaklı pin isimleri korunur. Mevcut devrelerin
bağlantısını bozmamak için tuval boyutları, elektriksel uç koordinatları, LED
merkezleri, motor pivotu ve canlı ekran alanları değişmez. Bu nedenle modülün
simülasyon bağlantı sırası bazı gerçek ürün revizyonlarının başlık düzeninden
farklı olabilir; çizimler üretim footprint'i değildir.

## Doğrulama

Yalnız `node --test tests/visuals-v079.test.mjs` ve derleme; eski test dosyaları
çalıştırılmaz. Yeni çizimlerde pin/geometri eşitliği, tekrar üretim, etiket bandı
yokluğu, sonlu SVG geometrisi ve ekran kırpması denetlenir. Yerel tarayıcıda
fotoğraf/çizim karşılaştırması ayrıca gözle incelenir.

## Fotoğraf sayfaları

[MCP2515](https://www.pixelelectric.com/pic-boards-programmers/mcp2515-receiver-spi-module-board/),
[RC522](https://joy-it.net/en/products/SBC-RFID-RC522),
[DFPlayer](https://www.dfrobot.com/product-1121.html),
[piezo](https://www.electrokit.com/en/piezoelement-12x5.5mm),
[ortak katot RGB](https://www.sparkfun.com/led-rgb-clear-common-cathode.html),
[DHT22](https://www.adafruit.com/product/385),
[SHT31](https://learn.adafruit.com/adafruit-sht31-d-temperature-and-humidity-sensor-breakout),
[KY-040](https://www.joy-it.net/en/products/COM-KY040RE),
[28BYJ](https://www.dfrobot.com/product-2979.html),
[HC-SR04](https://www.joy-it.net/en/products/SEN-US01),
[WS2812](https://www.adafruit.com/product/1426),
[ST7735](https://www.adafruit.com/product/358).

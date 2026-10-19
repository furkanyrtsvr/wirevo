# Wirevo 0.78.0 — fiziksel gövdeler, görünür LED lensi ve pin adları

0.77'de kullanılan tek tip PCB/etiket kutusu yaklaşımı kaldırıldı. RGB LED,
pasif piezo, motor, transistör, optokuplör ve çıplak göstergeler kendi fiziksel
gövde ve metal bacak biçimleriyle çizilir. Diğer genişletme modüllerindeki
çizimleri basıklaştıran dikey ölçek ve gövdeyi kapatan siyah bantlar kaldırıldı.

RGB LED'in sönük hâlinde opak siyah daire artık lensi kapatmaz. Şeffaf epoksi,
iç elektrotlar ve bacaklar görünür; çalışan renk katmanı gerçek DC LED
akımlarına bağlı, yarı saydamdır. Önceki elektriksel model değiştirilmedi.

Önceki 50 modülün dışındaki eski katalog için 79 SVG varlığı rafine edildi
(renk/açık-kapalı varyantları dahil): DHT ızgarası, PIR Fresnel kubbesi,
ultrasonik metal başlıklar, MQ-2 ve mikrofon örgüleri, mekanik mil/gövde,
sensör pencereleri, gerçek trimpot ve bobin/kontaklı röle, DIP paketler,
LCD/TFT/OLED çerçeveleri, LED ve pasif eleman detayları. Mevcut iyi gövdeler
korundu; bütün parçalar aynı PCB şablonuna dönüştürülmedi. Kartlar, breadboard,
soyut net etiketleri ve zaten yenilenmiş anahtar/RFID kartı gövdeleri korunur.

Ortak pin adı katmanı bağlantı uçlarının yanına yerleştirilir. Yan pinlerde
yatay, yoğun alt/üst sıralarda eğik yazı kullanılır; 8.5 birim metin ve ince
kontrast konturu vardır. Opak etiket plakası yoktur. Pin kimlikleri,
konumları, bileşen boyutları ve dinamik ekran koordinatları değişmemiştir.

On iki eski ekranın yeni dekoratif detayları, gerçek `display` alanını dışlayan
kırpma ile canlı piksel alanlarından uzak tutulur. OLED'in mm/px farkı hesaba
katılır. Gerçek PCB üretim ölçüsü, kesin üretici SKU'su veya mekanik footprint
iddiası yoktur; özgün, bağlantı geometrisini koruyan çizimlerdir.

## Yalnız yeni doğrulama

`npm run test:visuals-078` yalnız yedi yeni görsel kontrolünü çalıştırır:
pin geometrisi özeti, çıplak paket/PCB ayrımı, bütün fiziksel bileşenlerde
pin adları, gerçek DC akımından RGB görünümü, 79 eski SVG'nin tekrarlanabilir
üretimi, 12 canlı ekran alanı ve yeni çevrimdışı dosya. Eski test dosyaları
çalıştırılmaz. Tarayıcıda kullanıcının gösterdiği CAN/piezo/RGB üçlüsü ve
eski sensör/ekran/paket örnekleri ayrıca gözle incelenir.

## Görsel başvurular

Önceki [birincil kaynak denetimi](qa/visual-references-v077.md) korunur.
Ek aile kaynakları: [Kingbright LED paketleri](https://www.kingbrightusa.com/webimages/catalog/Through-HoleLED-P17-27.pdf),
[TI HC595 DIP](https://www.ti.com/lit/ds/symlink/sn74hc595.pdf),
[Adafruit LCD](https://learn.adafruit.com/character-lcds/lcd-varieties),
[Adafruit OLED](https://learn.adafruit.com/monochrome-oled-breakouts/overview),
[Bourns trimpot](https://www.bourns.com/docs/product-datasheets/3296.pdf),
[Omron röle](https://omronfs.omron.com/en_US/ecb/products/pdf/en-g2r.pdf).

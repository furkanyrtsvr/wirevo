# Sensör / GPIO genişletici modelleri · 0.18

Gerçek AVR TWI/Wire komutları çalışır. Kaynak kodu metninden sonuç çıkarılmaz. `device-registry.js` tüm mevcut I²C cihazlarının controller factory, canonical pin/bus, besleme, fiziksel adres, clock sınırı, parametre ve driver sözleşmesini ortaklaştırır. SPI/1-Wire/UART mevcut transport modellerini korur; bütün diğer transportların registry'ye taşındığı iddiası yoktur.

Çizimler özgün CC0, sensör breakout'ları açıkça genel karttır. Üretici DIP pinleri/başlık sırası [SENSOR-HARDWARE.md](./SENSOR-HARDWARE.md) içinde. Regülatör ya da 5V toleransı çizimdeki PCB görünümünden varsayılmaz. BH1750 ve MPU6050 3.3V doğrudan besleme; örnekler Uno'nun dahili 5V SDA/SCL pull-up'larını kapatır. Ek bus kaynağıyla VCC+0.5V aşılırsa IO uyarısı/NACK. Harici strap boş/ara seviyedeyse ACK yok. Besleme yalnız bus pull-up veya cihazın kendi çıkışından sağlanmış sayılmaz. Başka gerçek, beslenen GPIO kaynağı bir cihazı besleyebilir; karşılıklı/self-fed kaynak halkaları gerçek rail desteği olmadan kapanmaz.

## SHT31-DIS

[Sensirion SHT3x-DIS v7](https://sensirion.com/media/documents/213E6A3B/63A5A569/Datasheet_SHT3x_DIS.pdf).

- ADDR LOW/HIGH 0x44/0x45; VIN=doğrudan VDD, 2.15–5.5V. En fazla1MHz nominal işlem modeli.
- No-stretch 0x2400/240B/2416 single-shot; 15/6/4ms seçilmiş maksimum conversion, <2.4V için +0.5ms. Süre AVR cycle ile, erken read-address NACK. T/RH uint16 ve her iki bayt için CRC8 polinom0x31/init0xFF; T=−45+175*raw/65535, RH=100*raw/65535.
- Periyodik0.5/1/2/4/10Hz high/medium/low komutları, E000 fetch/consume; önceki tamamlanmış veri sonraki conversion sürerken hazır. Status F32D+CRC, reset/clear, heater flag ve break; softreset1.5ms NACK. Ortam yeni acquisition başlangıcında alınır.
- 0x2C06/2C0D/2C10 stretching komutları desteklenir; read ACK sonrası conversion bitene kadar gerçek SCL sink. Ayrıntılar [I2C-LINES-MODEL.md](./I2C-LINES-MODEL.md). ART, ALERT threshold/ALERT elektrik driver, heater ısıl etkisi/yoğuşma/gürültü ve command minimum inter-delay fiziksel tanısı yok. ALERT pad bağlantı yapılabilir, aktif kaynak değildir; nRESET header'a çıkarılmamıştır. Tam veri sayfası emülasyonu değildir.

## BH1750FVI

[ROHM Technical Note RevD](https://www.mouser.com/datasheet/2/348/bh1750fvi-e-186247.pdf), üretici belgesinin yetkili dağıtıcı aynası; eski ROHM PDF adresi artık404.

- VCC ve DVI ortak2.4–3.6V, ADDR 0x23/0x5C. Powerdown/on, reset07 (powerdown'da etkisiz), continuous/one-shot H/H2/L ve MTreg31–254.
- Nominal120ms H/H2,16ms L, MT/69 ile zaman ölçeği. Conversion öncesi eski veri okunur; one-shot sonrası powerdown ve sonuç korunur. 16bit BE raw, lux=raw/1.2*69/MT, H2 ek/2; saturation65535.
- Low-resolution ışık kuantalaması/optik pencere/açı/noise/oscillator toleransı yok; ideal ortam lux değeri kullanılır. Geçici MTreg high/low yazımı hardware gibi aralık dışında olabilir; geçersiz MT ile ölçüm komutu NACK/model kapsam dışı. SDA/SCL hat kenarları 0.28 açık drenaj modelinden gelir.

## MPU6050

[TDK/InvenSense register map Rev4.2](https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Register-Map1.pdf), [ürün veri sayfası](https://product.tdk.com/system/files/dam/doc/product/sensor/mortion-inertial/imu/data_sheet/mpu-6000-datasheet1.pdf).

- AD0 0x68/0x69; WHO_AM_I her ikisinde68. Direct2.375–3.46V. Reset/sleep, accel/gyro standby, sıcaklık disable, CONFIG/SMPLRT_DIV; 8kHz veya1kHz base/rate divider. Accel sabit ortam olduğundan8kHz akışta aynı accel örneğinin tekrarı fiziksel1kHz sınırını taklit eder; filtre gecikmesi yok.
- Koherent14byte signed BE accelXYZ/T/gyroXYZ; ±2/4/8/16g ve ±250/500/1000/2000°/s, int16 clipping; T=raw/340+36.53. Girdiler g ve°/s olarak inspector'dan değişir; varsayılan AZ=1g seçilmiş düz kart ortamıdır.
- INT_STATUS/read-clear, INT_ENABLE, polarity/open-drain/latch/50µs pulse driver. Gerçek INT canonical neti/50Ω kaynağı GPIO/analizöre gider; cycle deadline ile güncellenir, frame beklemez. FIFO accel/T/gyro paketleri,1024byte sınır/overflow, count/pop/reset. Overflow'da yeni tam paket durur; bu bounded tercih belgelenmiştir.
- DMP/aux master/XDA-XCL, FSYNC, self-test, filter dynamics/motion detector, düşük güç cycle/sample oscillator ve CLKSEL osilatör davranışı yok. İlgili ileri kiplerde kapsam uyarısı. AUX header uçları aktif I²C kaynak değildir. Gyro drift ve fiziksel hareket/gravite yön dönüşümü yok; verilen eksenler ideal sensör ortamıdır. FIFO destekli seçilen bloklarla sınırlıdır.

## MCP23017 · güncel RevE

[Microchip DS20001952E (2026)](https://ww1.microchip.com/downloads/aemDocuments/documents/APID/ProductDocuments/DataSheets/MCP23017-MCP23S17-16-Bit-IO-Expander-with-Serial-Interface-DS20001952.pdf), [GPA7/GPB7 advisory](https://support.microchip.com/s/article/GPA7---GPB7-Cannot-Be-Used-as-Inputs-In-MCP23017).

- Gerçek SPDIP28 numaraları, NC11/NC14 ayrı padler. A0–A2 0x20…0x27; active-low RESET; VDD1.8…5.5V,100kHz/400kHz/1.7MHz supply sınırları. Gerçek Uno giriş HIGH2.5V eşiği nedeniyle ek level shifting olmadan düşük bus raili bağlanmış sayılmaz.
- BANK/SEQOP, IODIR/IPOL/GPPU/OLAT/GPIO; BANK0+SEQOP1 A/B pair toggle, BANK1 byte-mode repeat ve sequential reserved-gap/wrap. GPA7/GPB7 yalnız çıkış; IODIR resetFF korunur, firmware ikisinin direction bitini0 yapmalıdır. Input/interrupt bit7 modellenmez; panel A7/B7 OUT sınırını gösterir.
- Output50Ω seçilmiş DC driver, input pull-up100kΩ; gerçek yükle pin gerilimi, işaretli akım ve GPIO/ADC geri besleme. GPIO okuması gerçek pin seviyesi; OLAT latch ayrı. FLOAT/ara eşik seviyeleri `unknown` maskesiyle belirtilir; deterministik bit okuması fiziksel metastability değildir.
- GPINTEN/INTCON/DEFVAL, değişim/varsayılan karşılaştırması, first INTCAP freeze, GPIO/INTCAP read-clear, INTF read-only, MIRROR/ODR/INTPOL; INTA/B gerçek50Ω driver. DEFVAL farkı sürerse IRQ yeniden belirir. Ham input karşılaştırması/INTCAP, IPOL yalnız GPIO: DS§3.5.2/3.5.4/3.5.5/3.5.9 ve [AN1043](https://ww1.microchip.com/downloads/aemDocuments/documents/OTH/ApplicationNotes/ApplicationNotes/01043a.pdf) birlikte yorumlandı; INTCAP IPOL ayrımı bir model yorumudur.
- Driver akım sınırlaması, tüm pad absolute-max hasarı, bounce/glitch/minimum edge delay/çıkış slew ve package toplam güç sınırı yok.50Ω üretici karakterizasyon eğrisi iddiası değildir. RESET LOW/boş ve güç kesilmesi tüm kaynakları geri çeker; yeni run/reload register kalıcılığı yok.

## Kabul

Beş proje ve üç ek protocol fixture gerçek pinned avr-gcc0.2.0 ile derlendi. Üç sensör aynı hat, fiziksel adres değişimi, CRC/conversion, FIFO, yanlış güç/kablo ve 32 hızlı GPIO→IRQ→ADC geçişi doğrulandı. SPI TFT, MAX kaskadı, CAN/RS485 ve daha ileri analog modeller sonraki plandadır.

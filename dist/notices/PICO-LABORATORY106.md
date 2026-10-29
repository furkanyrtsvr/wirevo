# Pico sera ve sensör laboratuvarı — 0.106.0

## Açma

1. Aşağıdaki JSON dosyasını indirin; Wirevo'da **JSON / ZIP aç** ile seçin.
2. **Derle**, ardından **Çalıştır** düğmesine basın. Ek uygulama veya SDK kurulumu gerekmez.
3. Seri terminali açın. Büyük laboratuvar `LAB COMPLETE failures=2` ile biter: iki hata belgelenmiş GPS / MH-Z19 donanımsal UART bağlantı açığıdır.
4. Projeler kaynak kod içerir. Yeni çalışma zamanını kullanmak için yeniden derleyin; eski firmware otomatik olarak değiştirilmez.

[Sera](../examples/pico-greenhouse106.json) · [Büyük sensör laboratuvarı](../examples/pico-greenhouse-laboratory106.json) · [Optik ek devre](../examples/pico-optical-laboratory106.json)

## Birlikte bağlanan modüller

Ana devre: 56 parça, 214 kablo, main.c ve üç yardımcı C dosyası; 42 sensör/ölçüm modülü türü. Ekran yerine bu denetim projesinde seri terminal ayrıntılı ham sonuç verir.

- I²C0: GP4 SDA / GP5 SCL. SHT31 0x44, AHT20 0x38, ADXL345 0x53, ADS1115 0x48, BME280 0x76, BME680 0x77, VL53L0X 0x29, INA226 0x40, INA219 0x41, MAX30102 0x57, BH1750 0x23, MPU6050 0x69, DS3231 0x68.
- I²C1: GP6 SDA / GP7 SCL. TCS34725 0x29, BMP280 0x76, DS1307 0x68. 5 V DS1307, 3,3 V hatta seviye dönüştürücüyle bağlıdır. Toplam 26 I²C okuma/kimlik/dönüşüm kontrolü geçti.
- DHT11 GP10 / DHT22 GP11: iki çerçevenin kontrol toplamı doğrulandı; 26 °C/%61 ve 27 °C/%62.
- DS18B20 GP12: presence ve dönüşüm sonrası 28 °C okundu. Harici pull-up vardır.
- HX711 GP13 DT / GP14 SCK: yük köprüsünden 858993 kodu okundu; load=200, capacity=1000, gain=128. Bu bir kütle kalibrasyonu değildir.
- HC-SR04 GP15 TRIG / GP21 ECHO: direnç bölücüsüyle 75 cm için 4350 µs yankı okundu.
- SPI0 GP16 RX / GP18 SCK / GP19 TX: GP17 BMP280 CS, GP20 MAX6675 CS. BMP kimliği 0x58, termokupl 125 °C ve açık devre biti 0 okundu. I²C BMP ve SPI BMP iki ayrı modüldür.
- GP2/3/22/26, CD74HC4067 kanalı seçer; SIG GP28 ADC'ye bağlıdır. LM35, TMP36, MQ-2, alev, ses, NTC, kapasitif toprak nemi, su, yağmur, dirençli toprak probu, joystick ve LDR okunur. Son kanallar IR engel, titreşim, Hall ve I²S mikrofonudur. PIR GP27 ADC üzerinden okunur.
- I²S mikrofonu SPI denemesi bittikten sonra GP18 BCLK / GP19 WS ile sürülür; çoklayıcı kanal 15 / GP28 üzerinden 24 bit 1048576 örneği okundu. Bütün protokoller aynı anda çalıştırılmaz; tek programdaki aşamalar sırayla yürür. Besleme ve ortak sensör durumları devrede birlikte kalır.
- Ek optik devre: IR LED taşıyıcısı alıcıyı LOW yaptı; taşıyıcı durunca HIGH'a döndü. Bu, bütün kumanda protokollerinin doğrulaması değildir.

## Açık bulunan iki UART yolu

MH-Z19 GP8 TX / GP9 RX ile 9600 8N1 yapılandırılır; GPIO ağında donanımsal TX bitleri üretilmediği için modül istek alamıyor. GPS TX GP1'e bağlıdır; NMEA bitleri Pico UART RX FIFO'suna ulaşmıyor. Terminal/loopback byte yolu farklıdır. Bu iki sonuç başarısızdır; projenin bütün protokolleri çalışıyor olarak sunulmaz.

`printf("%02x", ...)` bu çalışma zamanında desteklenmiyor; çıktının devamı eksilebiliyor. Kaynaklarda desteklenen sayı biçimleri kullanıldı.

## Hız ve kapsam

Küçük sera için ölçülen örnek motor koşularında yaklaşık 3 saniye simülasyon 3,6–4,1 saniye duvar zamanında ilerledi. Tarayıcıda, bilgisayar yüküne ve devrenin büyüklüğüne göre değişir; 1× garantisi verilmez. 56 parçalı laboratuvar daha ağırdır. 1× bir üst hedeftir; model doğruluğunu korumak için yetişemeyen simülasyon yavaş kalır.

Bekleme hızlanması yeniden derlenen tarayıcı C firmware'i içindir. Kullanıcı C kaynaklarının debug derlemesi korunur; özel çalışma zamanı optimize edilir. Etkin PIO/ikinci çekirdek veya debug durumunda bekleme kısayolu kapanır. Sekiz ARM Pico kartında yeni timer/bekleme senaryosu doğrulandı; bu laboratuvarın tüm sensörleri her kart ve her dilde ayrı ayrı sınanmadı.

Eski testler çalıştırılmadı. Yeni SDK eklenmedi. Bu denetim tam SDK, radyo/ROM, NFC/CAN, USB sınıfları veya tüm donanım modları için eksiksizlik iddiası taşımaz.

## 0.106.1: devam eden LCD aktarımı

Buton/pot/sıcaklık düzenlemesi aynı kablolardaki I2C aktarımını yeniden başlatmaz. LCD yarım baytı gönderilirken kaydetme denemesi eklendi; sonraki LCD satırları ve 35 derece ayarı doğrulandı.

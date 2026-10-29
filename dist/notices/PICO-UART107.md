# Pico GPS / MH-Z19 — 0.107

Önceki büyük laboratuvarda bulunan iki UART açığı bu sürümde giderildi. Gerçek firmware'in PL011 yazmaları TX pinini sürer; sensörün RX hattı ve GPIO'dan gelen yanıt örneklenir. Kablo yoksa, yanlış UART pini seçilmişse veya alıcı kapalıysa sensör verisi firmware'e ulaştırılmaz.

## Açma ve bağlantı

1. [56 parçalı UART sensör projesini indirin](../examples/pico-uart-laboratory107.json).
2. Wirevo'da **JSON / ZIP aç** ile seçin; **Derle → Çalıştır** uygulayın. Ek kurulum gerekmez.
3. Seri terminalde `NMEA $GPRMC…`, `NMEA $GPGGA…`, `GPS valid=2 bad=0 RMC=1 GGA=1`, `MH-Z19 n=9 crc=1 ppm=850` ve `UART LAB COMPLETE failures=0` görülür. Kontrol bitince program yeni GPS/CO₂ verisini okumaya devam eder.
4. CO₂ değerini modül özelliklerinden değiştirin; sonraki okumada gerçek yanıt baytları değişir. Kontrol programı ilk açılışta örneğin varsayılan 850 ppm değerini bekler.

| Parça | Pin | Pico |
|---|---|---|
| GPS | VCC / GND | 3V3 / GND |
| GPS | TX / RX | GP1 (UART0 RX) / GP0 (UART0 TX) |
| MH-Z19 | VCC / GND | VBUS (5 V) / GND |
| MH-Z19 | RX / TX | GP8 (UART1 TX) / GP9 (UART1 RX) |

İki port 9600 baud, 8 veri biti, paritesiz, bir stop biti kullanır. MH-Z19 modülünün bu modelde TX seviyesi 3,3 V'tur; 5 V besleme GPIO'ya bağlanmaz. Büyük devredeki diğer sensörler ve kablolar korunur. Yeni program UART'a odaklanır; eski sensör testlerini yeniden döndürmez. Arka planda AHT20/BME280 dönüşümleri de başlatılır.

## Doğrulananlar

- GPS: iki geçerli NMEA çerçevesi; kontrol toplamı hatası sıfır. GPS TX teli ayrılınca geçerli NMEA sayısı sıfır kalır.
- MH-Z19: dokuz baytlık yanıt, doğru checksum, 850 ve 1200 ppm. RX/TX teli yanlış pine alınınca veya baud/parite/mux/enable yanlış olunca veri alınmaz. Geri bağlandığında okuma düzelir.
- Alternatif UART1 GP20/GP21 eşlemesi: HC-SR04 ECHO bağlantısı bu deneme için ayrılarak sınandı. Bu pinler aynı anda iki çıkışa bağlanmamalıdır.
- UART RX sırasında MCU reseti: eski kuyruğun baytları yeni açılışa sızmaz; yeni GPS/CO₂ çerçeveleri doğru okunur.
- Sekiz ARM Pico kartı: aynı 56 parçalı devrede yeni GPS ve MH-Z19 kontrolü. Hazard3 Pico 2: MH-Z19 aktarımı; bu son testte GPS doğrulaması iddia edilmez.
- GPS'in baud/parite ayarı yanlışsa geçerli mesaj uydurulmaz. Parite/çerçeve hata durumu okunup temizlenebilir. Yanlış baud her zaman framing hatası üretmek zorunda değildir; NMEA checksum/çerçeve doğrulaması gereklidir.

Sınırlamalar: bu denetim normal UART sensör çerçeveleri içindir. Tam TX FIFO/backpressure, RTS/CTS, break/stick parity, çoklu RX mux veya tüm Pico/SDK davranışları doğrulanmış sayılmaz. TX çerçeve kuyruğu sınırlı bir yazılım modelidir. Eski testler çalıştırılmadı; SDK API'si eklenmedi.

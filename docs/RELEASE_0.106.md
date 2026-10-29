# Wirevo 0.106.0

Pico sera projesinde bekleme döngülerinin ve değişmeyen elektriksel girişlerin maliyeti azaltıldı. Kullanıcı C dosyaları satır debug bilgisiyle -O0 kalır; yalnız Wirevo'nun özel C çalışma zamanı -O2 derlenir. Yeni SDK API'si eklenmedi.

- Uyumluluk katmanındaki sleep_us/sleep_ms, simülasyon motoruna sınırlı bekleme bildirir. Motor en yakın donanım/devre olayına kadar ilerler; olaydan sonra CPU devam eder. Tek adım, breakpoint, satır adımı, ikinci çekirdek, etkin PIO veya güncellenmiş kesme durumu bu kısayolu devre dışı bırakır. RISC-V bu kısayolu kullanmaz.
- Kapalı PIO state machine'leri için boş komut döngüsü atlanır. Herhangi biri açıldığında normal çevrim yürütümü geri gelir.
- GPIO'nun fiziksel giriş seviyesi değişmediyse aynı giriş/kesme hesabı tekrarlanmaz. Sabit DC sonuçlarının önbelleği, yeni laboratuvarda kullanılan belleksiz elektriksel modelleri de kapsar. Proje/topoloji/parametre değişiminde temizlenir; reaktif modeller normal çözümü kullanır. Protokol denetleyicileri önbelleğe alınmaz.
- Worker'da zamanlayıcı zincirinin gereksiz gecikmesi kaldırıldı; seçilen 0,25× / 1× / 2× hız üst hedefi uygulanır. Bilgisayar yetişemiyorsa simülasyon daha yavaş kalır.

## Yeni doğrulama

Yalnız tests/pico-laboratory106.test.mjs içindeki yeni senaryolar çalıştırıldı. Eski testler çalıştırılmadı. Yeni kapsam: sera sıcaklığı/nemi ve PWM; sekiz Pico ARM kartında timer IRQ; GPIO kenar IRQ; debug/ikinci çekirdek/PIO geri dönüşleri; açık PIO ile birebir kenar karşılaştırması; worker hız/pause akışı; büyük sensör laboratuvarı ve optik ek devre.

56 parçalı, 214 kablolu, dört C kaynaklı laboratuvar 42 farklı sensör/ölçüm modülü türünü içerir. Ek optik devre IR alıcısını ve I²S mikrofonunu sınar. Bu sayı bütün bileşen kütüphanesinin veya bütün silikon özelliklerinin doğrulandığı anlamına gelmez.

## Bulunan açıklar

Donanımsal Pico UART byte modeli elektriksel TX/RX pinlerine bağlanmıyor: GPS NMEA ve MH-Z19 yanıtı bu laboratuvarda alınamadı. Aynı UART üzerinden terminal/loopback çalışması bu fiziksel bağlantıyı doğrulamaz. Bu istek kapsamında sensör/protokol açıkları yalnız raporlandı; UART köprüsü eklenmedi. Testte açık TODO olarak tutulur.

Printf'te `%02x` gibi genişlikli onaltılık biçimler çıktıyı kesiyor. Laboratuvar desteklenen `%u` / `%d` biçimlerini kullanır. Bu sınır da düzeltilmiş olarak sunulmaz.

Tam SDK/CMake, özgün radyo/ROM, CAN, NFC/RFID, USB sınıfları, DMA, çok çekirdekli uygulamalar, bütün sensör modları ve fiziksel çevrim doğruluğunun tamamı bu devreyle doğrulanmadı.

## Projeler

- dist/examples/pico-greenhouse106.json: özgün sera; Derle ile yeni bekleme çalışma zamanı eklenir.
- dist/examples/pico-greenhouse-laboratory106.json: büyük laboratuvar; beklenen iki UART sorunu terminalde görünür.
- dist/examples/pico-optical-laboratory106.json: IR/I²S ek devre.
- dist/notices/PICO-LABORATORY106.md: bağlantılar, sonuçlar ve kullanım.

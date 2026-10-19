# Wirevo 0.74 — native kartlarda gerçek bileşen bağlantıları

Bu sürüm yalnız katalog görünürlüğü değildir. Eksik native bağlantılar tamamlandı; ortak 74 bileşenin temsili davranışları ESP32-C3, STM32F103C8 ve TM4C123GH6PM için ayrı derlenen C17 programlarıyla doğrulanır.

## Tamamlanan bağlantılar

- MCP23017 GPIO çıkışı, giriş seviyesi, pull-up ve kesme sürücüleri artık gerçek netlere bağlanır. RESET hattı kontrolcüyü sıfırlar.
- MPU6050 INT ve I²C aygıtlarının dönüşüm/kesme olayları native zaman kuyruğundadır. GPIO değişmese de zamanlanmış olay çalışır.
- TM1637 doğrudan MCU piniyle aynı net olma zorunluluğundan çıkarıldı: MOSFET seviye dönüştürücü arkasından elektriksel CLK/DIO ile çalışır.
- Native ohmmetre sonuçları arayüze giden snapshot'a eklenir.
- Kapasitör ve bobin artık native MCU model zamanında Backward Euler RC/RL geçici rejim çözümüne katılır. GPIO kenarından önce eski çıkışla ilerleme, saklanan enerji, zamanlanmış adımlar ve reset doğrulanır. Worker'lar transient modunu DC etiketiyle ezmez.
- ESP32 C17 HAL'ine gerçek UART okuma girişi eklenir. Yeni modül çevrimdışı önbelleğe dahildir.

## Yeni doğrulama yöntemi

Yalnız `npm run test:components-074` çalıştırılır. Önceki test dosyaları çağrılmaz veya içe aktarılmaz.

Clang/WASM ile derlenen C17 komut firmware'i her ailenin gerçek CPU motorunda çalışır. Test komutları terminal UART'ından gelir; GPIO modu/yazma/okuma, yazılımsal SPI/I²C/1-Wire/UART, darbe, LCD ve GRB bitlerini firmware üretir. Host test kodu GPIO kaydı yazmaz, C kaynağını yorumlayıp sonuç uydurmaz, kontrolcü RAM'ine beklenen ekran sonucunu koymaz.

46 davranış senaryosu her ailede ayrı çalışır. Bazı senaryolar birden çok pasif/analog bileşeni ayrı devrelerle sınar. RC/RL ve reset ayrıca sınanır. Kapsam kontrolü 74 parçadan birinin senaryosu kaybolursa başarısız olur. Test kayıt sayısı 145'tir; bu 145 ayrı fiziksel donanım deneyi anlamına gelmez.

LCD/TFT hücre/pikseli, WS2812 RGB frame'i, segment/matris RAM'i, gerçek MCU giriş okumaları, sensör cevap baytları, ADC örnekleri, motor akımı ve servo açısı kontrol edilir. 5 V-only mantıkta gerçek devre modelinden seviye dönüştürücü/buffer; HC-SR04 ECHO'da gerilim bölücü vardır. Gerilim eşikleri test geçsin diye gevşetilmez.

Başlangıçta GPIO/protokol kenarı bulunmayan sensör ısınma/bekleme aralıkları hızlandırılır: STM32'nin mevcut native `elapsed` API'si model saatini ilerletir; diğer motorlar C gecikmesini toplu yürütür. Bu aralıklar çevrim doğruluğu veya kesme gecikmesi kanıtı değildir. Protokol sinyalleri ve RC/RL kontrolleri bu hızlandırmayı kullanmaz.

## Kesin sınırlar

- Üç ailede birer temsili CPU profili doğrulanır. Her kart profili × her fiziksel pin × her protokol varyantı denenmiş değildir; kartlar ortak adaptörü kullanır.
- Analog sensör okumalarında ortak harici MCP3008 kullanılır; her MCU'nun dahili ADC donanım kapsamının aynı olduğu iddia edilmez.
- Aynı parça, aynı Arduino C++ kütüphanesinin her hedefte derlenmesi değildir. Tiva yalnız C17 kalır; pinler/API ve gerekiyorsa sürücü kodu karta özgüdür.
- Bluetooth sanal UART ağıdır; gerçek RF/HC-05 firmware emülasyonu değildir.
- RC/RL adımı 10 µs–1 ms ile sınırlıdır; daha hızlı ağlarda `stepLimited` bildirilir. Tam SPICE/analog, termal/mekanik veya fiziksel silikonla birebir çevrim eşdeğerliği yoktur. Aygıtların önceki kapsam sınırları korunur.

Bileşen–senaryo eşlemesi: [yeni C doğrulama matrisi](qa/native-components-v074.md).

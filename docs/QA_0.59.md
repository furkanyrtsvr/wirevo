# CircuitForge 0.59 kabul kaydı

Son USB/CAN/üretim-worker testi: 28/28 geçti, 0 hata/iptal/atlanan; 58284.3964 ms. Beş F4 native C USB kabulü, F411 native C++/STALL/reset, maskeler/FIFO/PLL/gates; F103 USB/CAN ve üç üretim worker kartı/UTF8; dokuz profilde USB JSON/ZIP. F103 BTABLE sınır düzeltmesi bu son koşuda dahildir.

Ek controller kabulü 2/2 geçti (120.0111 ms): EP2/EP3 TX/RX FIFO, status peek/pop, IRQ maskeleri/W1C, flush ve sınırlar. Bu iki test ARM firmware testi değil; bağımsız register/controller testidir.

İlk ilgili regresyon: 31/31 geçti (15607.6721 ms): F103 USB/CAN, F103/F401/F411 WFI prescaler fazı, WeAct Flash/SRAM/LED/KEY, F411 PA15/PB3 gerçek USART/Bluetooth ve üretim worker. OTG ilk 7/7 native/controller kabulü 10663.1805 ms.

Son PLL/HCLK profil korumasından sonra USB OTG + native WFI/TIM2 saat regresyonu 10/10 geçti (33407.9464 ms). Eski 100 MHz F411 PLL planı açık hata ile reddedildi. Genel regresyon: 1331/1331 geçti, hata/iptal/atlanan 0; 1041150.1189 ms. Genel koşu başladıktan sonra eklenen iki FIFO testi ayrı 2/2 kabulüdür; tek koşuda 1333 geçti diye sunulmaz. Son HCLK korumasından sonra ilgili 10 test ayrıca tekrar geçti. Komut: node --test --test-concurrency=4 tests/*.test.mjs. Yerel log: .sites-runtime/qa059-full.log.

CUA: localhost4173 → STM32/WeAct F411/C++17/boş → Projeler/Temel/USB → Çalıştır → gerçek Clang/2684 B → Sanal USB host/reset/tanıt → device18/config32/adres7 → Türkçe metin52 B aynı echo. Screenshot parent/CircuitForge-0.59-F411-USB-Kabul.png. UI yoğunluğu sırasında bir locator beklemesi zaman aşımına uğradı; tanınmış cihaz aynı hata tanısında görünüyordu. Firmware duraklatılıp host tekrar tanıtılarak echo ve görüntü kabulü tamamlandı. Browser aracının Statsig403 telemetrisi uygulama hatası değildir.

Model sınırları STM32-OTG-FS.md içinde açık. Fiziksel donanım veya tüm Cube/USB sınıf sürücüsü kabulü yapılmış sayılmaz. Native Rust/WASM köprüsü değişmedi; IRQ67 v0.10 köprüsünden kullanılıyor.

Son build geçti. App shell 440 dosya /19648482 bayt; 20 MiB sınırı içinde, Clang ayrı önbellekte. Build sonrası cache/supply 7/7 geçti (290.2602 ms). Genel koşunun tam çıktısı QA_0.59_RUN.txt.

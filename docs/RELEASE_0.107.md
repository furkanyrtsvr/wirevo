# Wirevo 0.107.0 — Pico fiziksel UART

GPS ve MH-Z19'un Pico donanımsal UART bağlantıları tamamlandı. PL011 yazmaları artık GPIO TX dalgasını üretir; elektriksel RX girişleri baud/bit/parite/stop zamanlarında örneklenip mevcut alım FIFO'suna ulaşır. Sensör yanıtı veya koordinat doğrudan firmware'e yazılmaz. Yeni SDK API'si, yardımcı uygulama veya sunucu derlemesi eklenmedi.

- UART0 ve UART1'in Pico pin çoklamaları, pad/input ayarları ve UART enable yönleri dikkate alınır. Normal laboratuvar bağlantısı GPS→GP1/UART0 ve MH-Z19 GP8/GP9/UART1'dir.
- Fiziksel olaylar doğrudan simülasyon saatini kullanır. Bekleme hızlandırması sırasında UART alarmı ve devre olayları aynı zaman tabanında kalır.
- Alım parity/framing hata durumu ve temizleme yolu bağlandı. Reset, eski TX kuyruğu ve RX çerçevesini yeni MCU'ya taşımıyor.
- MH-Z19 modeli açılış paraziti/tekrarlanan 0xFF sonrasında FF 01 86 komut başlığına yeniden eşzamanlanır. Hazard3'te görülen ilk komutun kaybolması bu yolla giderildi.

## Yalnız yeni doğrulama

`tests/pico-uart107.test.mjs` dışında eski test dosyaları çalıştırılmadı. Önceki 0.106 testindeki beklenen iki UART hatası başarı beklentisine çevrildi; o dosya bu işte çalıştırılmadı.

56 parçalı, 214 kablolu büyük devrede yeni UART senaryosu: GPS RMC/GGA checksum, MH-Z19 checksum ve ppm değişimi, iki hat bağlantısının kesilmesi, yanlış baud/parite, TX/RX enable, SIO/UART mux, GP20/21 alternatif pinleri ve geri dönüş, reset sırasında bekleyen çerçeve. GP20/21 denemesinde mevcut HC-SR04 ECHO teli ayrılır; aksi halde iki çıkış çatışır. Sekiz ARM Pico profili aynı büyük devrede sınanır. Hazard3 için aynı devrede MH-Z19 aktarımı ayrıca sınanır.

Bu, bütün Pico silikonunu, dilleri, SDK'yı veya tüm çevrebirim modlarını eksiksiz doğruladığımız anlamına gelmez. Donanım TX FIFO/backpressure doğruluğu, RTS/CTS, break/stick parity, aynı UART'a birden fazla RX pad seçimi ve dinamik saat değişimleri bu denetimin garantisi değildir; TX hattında sınırlı yazılım çerçeve kuyruğu kullanılır. Bu sürümde yeni SDK çalışması yapılmadı.

[Bağlantılar ve indirilebilir proje](../dist/notices/PICO-UART107.md)

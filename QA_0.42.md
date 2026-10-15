# 0.42 · STM32, bağlantı ve Bluetooth kabulü

13 Ekim 2026, Europe/Istanbul. Altı STM32 kartının mevcut pinout/bellek/CPU profilleri korunmuştur. Bu sürüm tüm STM32 çevre register'larının veya geliştirme kartlarının desteğini tamamlamaz; kabul mevcut C17 ARM/GPIO/DC/SysTick/VFP/sensör/terminal kapsamındadır.

## Elektriksel ve görsel bağlantı

Hazır devrelerin serbest bileşenleri kart boyutuna göre yerleştirilir. Köşeli rotalar kart/bileşen gövdesini engel sayar; sadece kendi fiziksel pad'ine erişen kısa uç bölümü gövde sınırına girer. Breadboard bir bağlantı yüzeyi olarak engel sayılmaz. Bütün 26 kartın yeni proje örneğinde uç/net kimliği; altı STM32 kartının yedi hazır devresinde diğer bileşen gövdesini kesmeme; doğrusal/köşeli kullanıcı seçimi denetlendi. Çakışan gövdeler için garanti verilmez; elle yerleşim/rota düzeltilebilir.

Net label adları proje içinde birebir eşleşir; aynı adlı etiketler union-find net listesinde birleşir. Yeniden adlandırma bağlantıyı ayırır, başka projeyi etkilemez. Boş/HTML/uzun ad reddi, güç kaynağı çakışması, JSON/ZIP, mevcut kabloyu etiketle değiştirirken tüm elektriksel bağlantıların korunması ve alan dışı dönüşümde orijinal projenin bozulmaması test edildi. Gerçek derlenmiş STM32 C8 kodu breadboard içermeyen etiketli LED devresinde çalıştı. Tarayıcıda LED 5,62 mA ve PA0 3,30 V gözlendi; okunur yatay etiketler ekran görüntüsüne kaydedildi.

## Bluetooth

Altı STM32 kartında örnek yeniden Clang ARM koduna derlenerek gerçek M3/M4F üzerinde çalıştırıldı. Sanal modül tarama, bağlantı, fiziksel GPIO UART üzerinden READY ve mesaj dönüşü, kesme, bağlı olmadan gönderme reddi ve besleme kaybı kabulü geçti. Örnek 9600 8N1 yazılım UART kullanır; satır sonuna kadar alıp sonra yanıtlar. Nucleo F411 tarayıcı örneğinde `MERHABA` karşılıklı alındı ve USART2 terminalinde göründü.

Gerçek AVR SoftwareSerial binary UART baytları 1k/2k gerilim bölücü üzerinden sanal Bluetooth'a ulaştı. MicroPython devre adaptöründe bit olayları bekleme süresinde ilerler; iki modülün bağlantı/kopması simetriktir. BLE host adaptöründe GATT hata/iptal temizliği, notification DataView byte aralığı, 20 baytlık yazma parçaları ve bağlantı kesince dinleyici kaldırılması test edildi. Bunlar donanım testi değildir; gerçek RF cihazı seçilip veri alışverişi yapılmadı. Gerçek panel API desteğini ve cihaz seçme gerekliliğini tarayıcıda doğru gösterir; Classic SPP kapsam dışıdır. Birincil API/UUID kaynakları dist/notices/BLUETOOTH-MODEL.md içindedir.

## Yeniden üretim

`npm run build`; `npm test`; `npm run test:stm32`; `npm run test:connections`.

Önce 647/647 genel test geçti (167517,6879 ms). Son genel yeniden çalıştırma 651/651, sıfır hata/atlama (422312,3589 ms) geçti. Son alan sınırı testi ve uzun Bluetooth mesajı kabulüyle güncel bağlantı paketi 22/22, sıfır hata/atlama (14899,6209 ms) geçti. Güncel test kataloğu 652 benzersiz test içerir; son eklenen alan sınırı testi bağlantı paketinde doğrulandı. Tarayıcıda net adı Uygula ile değiştirildiğinde LED akımı 0,00 mA oldu; ad geri getirildiğinde bağlantı kuruldu. 0.41 motor binary/hash ve gerçek STM32 toolchain değişmemiştir. App shell 20 MiB sınırının altındadır; Clang ayrı önbellektedir.

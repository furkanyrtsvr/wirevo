# Web 0.2 — doğrulama kaydı

- 23 otomatik test geçti. Yayımlanacak bundle üzerinde gerçek firmware, GPIO, 500 ms Blink, 2.5 V ADC→512/PWM, nem eşiği/röle, UART RX/TX, 800 mesaj zamanlama regresyonu ve worker yükleme/adım kontrolü.
- Browser GCC: Blink 5702 byte / 1.65 s; farklı millis tabanlı 250 ms kaynak 5834 byte / 1.35 s. Yeni programın seri çıktısı 250, 500, 750… oldu ve GPIO izi değişti.
- Hatalı C++: sketch.ino:2:3 bilinmeyen sembol GCC hatası; başarılı firmware olarak kullanılmadı. Derleyici linker ikincil hatalarını da korur.
- Buton INPUT_PULLUP: basınca gerçek D13 5.00 V, LED 13.64 mA, UART BUTTON ON. Boşta BUTTON OFF.
- ADC/PWM: %60 giriş ADC=614 PWM=153; LED ortalama akımı yaklaşık 8.25 mA. %0 giriş ADC=0 PWM=0 ve LED 0 mA. Aralık klavye kontrolü çalıştı.
- UART Echo: tarayıcıda t karakteri kaybı bulundu. UCSR0A read-only flag ve UCSR0B RXC davranışı düzeltildi; 800 mesajlık regresyon eklendi. Tekrar browser testinde tam CircuitForge RX test 123 mesajı kayıpsız geri geldi.
- Uno D8→manuel köşe→breadboard j22 kablosu oluşturuldu; 8→9 kablo. Köşe sürükleme yolu değiştirdi; pin kimlikleri korundu ve circuit.json'da rota noktaları görüldü.
- JSON indirme ve aynı dosyayı geri açma başarılı; kaynak ve gerçek HEX korundu. Eski v1 yerel proje menüde erişilebilir kaldı.
- Panel ayırıcı sürüklenince devre yüksekliği 398→365 px, editör yüksekliği arttı. Görünüm düğmesi düzeni geri yükledi.
- 390×844 viewport: belge clientWidth=384, scrollWidth=384; yatay taşma yok. Desktop viewport geri yüklendi.
- Normal masaüstü görünümünde devre, kod, terminal, özellikler, ölçüm ve pin paneli birlikte görünür. Tarayıcı error/warn kaydı yok.

Testler cihaz emülasyonu ve ideal DC modele aittir; gerçek fiziksel donanımla karşılaştırma yapılmadı. Genel analog ağ/çoklu kütüphane ve diğer MCUlar devam planındadır.

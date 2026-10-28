# 0.105.0 — Sera projesinde EEPROM reseti ve performans

Harici 24LC256 içeriği yalnız MCU resetlendiğinde korunur. Tamamlanmış kayıt ve devam eden yazma döngüsü saklanır; yazma süresi sıfırlanan MCU saatine göre yeniden hesaplanır. Yeni bir simülasyon oturumu başlatmak veya JSON'a EEPROM verisini kalıcı gömmek bu değişikliğin kapsamı değildir.

Sabit elektriksel parçalardan oluşan Pico devrelerinde aynı DC çözümü sınırlı önbellekten kullanılır. Desteklenmeyen/dinamik parça veya reaktif ağ varsa normal çözücü kullanılır. Devre/parametre güncellemesi önbelleği temizler. Bus kenarları, protokol durumları ve MCU zamanı atlanmaz. Çalışırken tam arayüz paketleri en çok yaklaşık 20 Hz gönderilir; seri çıktı ve analizör kenarları paketler arasında toplanır. Durdurma/debug/adım gibi açık işlemler anında paket üretir.

Yalnız yeni sera projesi doğrulandı: çok dosyalı C, aynı hatta SHT31/LCD/EEPROM, ADC ayarı, butonla kayıt, reset, sensör bağlantısı/hata/toparlanma, %40 PWM ve yazma koruması. Aynı firmware ve komut sayısıyla önbellek açık/kapalı karşılaştırmasında I2C saat kenarları, simülasyon zamanı ve terminal çıktısı eşit tutulur. Donanımın tamamı veya gerçek zaman hızı garanti edilmez. Eski testler çalıştırılmadı, SDK API'si eklenmedi.

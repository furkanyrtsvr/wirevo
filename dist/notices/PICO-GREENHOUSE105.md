# Sera projesindeki iki düzeltme — 0.105

Bu sürüm yeni Pico SDK API'si eklemez. Tarayıcıda çalışır; ek uygulama gerekmez.

## EEPROM ve reset

Sera projesinde potansiyometreyle 35 °C seçip butonla kaydedilen değer, MCU sıfırla işleminden sonra 35 °C olarak geri gelir. Önceki sürüm harici EEPROM denetleyicisini yeniden oluştururken baytları kaybediyordu. Tamamlanmış veri ve başlamış EEPROM iç yazma döngüsü şimdi korunur. I2C aktarımının henüz STOP ile başlatmadığı yazma kayda dönüşmez.

Bu düzeltme MCU reseti içindir. Durdurup yeni runtime başlatmak, başka proje açmak ve sayfayı yenilemek için yeni bir EEPROM dosya/kalıcı kayıt sistemi eklenmedi.

## Performans

Sera gibi sabit elektriksel parçalarda aynı GPIO/driver durumu tekrarlandığında aynı DC çözümü tekrar hesaplanmaz. Önbellek 128 durumu geçmez ve devre/parametre değişince temizlenir. SHT31, LCD ve EEPROM denetleyicileri her I2C kenarını ve zaman olayını almaya devam eder; yalnız elektriksel çözüm saklanır. Dinamik veya desteklenmeyen parçada önbellek kullanılmaz. PWM frekansı ve duty düşürülmez, CPU komutları veya zaman atlanmaz.

Worker'ın çalışan simülasyona ait tam görüntü paketleri 50 ms aralıkla gönderilir. Bu, görüntü güncelleme sıklığıdır; simülasyonun örnekleme frekansı değildir. Seri veriler ve analizör kenarları bu arada birikir; analizörün mevcut 30.000 kenar sınırı geçerlidir. Açık durdurma/adım/reset işlemleri beklemez.

Sera projesinde aynı firmware ve aynı komut sayısıyla önbellekli/önbelleksiz saat kenarları ve çıktılar karşılaştırılmıştır. Ölçülen hız bilgisayara ve tarayıcı koşullarına bağlıdır; 1× gerçek zaman garantisi verilmez. Kullanıcı kodu, derleyici optimizasyon düzeyi ve SDK kapsamı değiştirilmedi.

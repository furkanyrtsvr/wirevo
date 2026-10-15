# CircuitForge 0.35 doğrulama kaydı

11 Ekim 2026. 0.34 ESP32 ailesi temelinin üzerine çok dosyalı C++ projeleri eklendi.

## Sonuçlar

- `npm test`: 446 test geçti, 0 hata, 0 atlanan test; 42.27 saniye.
- `npm run build`: başarılı. Uygulama kabuğu 325 dosya / 16.812.086 bayt; 20 MiB sınırında. 22.6 MB sıkıştırılmış Clang ayrı doğrulanmış önbellekte tutulur.
- Dağıtılan Clang WASM ile 6 örnek × 3 kart = 18 gerçek firmware derlendi; ESP-EMU üzerinde beklenen GPIO/UART davranışı doğrulandı.
- Çok dosyalı örnek C3/C6/S3 için sırasıyla 736/736/864 bayt kod, 24 bayt veri kullanır. `sketch.ino`, nested header ve ayrı CPP gerçek çeviri birimleri olarak derlenir ve bağlanır.

## Tarayıcı kontrolleri

C3 çok dosyalı proje derlenip çalıştırıldı; GPIO2 LED ve UART `MULTI HIGH/LOW` çıktısı gözlendi. Header değişikliği eski firmware'i çalıştırmayı engelledi. Başka dosya açıkken CPP hatası derleyicide gerçek dosya/satır konumuyla gösterildi ve hatalı dosya otomatik açıldı. Dosya ekleme, yeniden adlandırma, seçme, silme ve yeniden yüklemeden sonra kaynakların korunması doğrulandı. Dosya seçildikten sonra düzenleme düğmesinin etkinleşmemesi giderildi ve tekrar kontrol edildi.

v2 JSON proje dışa aktarıldı; farklı kart seçiliyken yeniden içe aktarılması kartı, üç kaynak dosyasını ve firmware'i birlikte geri getirdi. Çalıştırma gerçek GPIO/UART çıktısı verdi. S3 aynı çok dosyalı kaynaklardan Xtensa firmware derleyip `MULTI HIGH/LOW` üretti.

0.34 tarayıcı raporundaki üç kart, GPIO buton, UART giriş, bellek okuma, panel yerleşimleri, mobil görünüm, bozuk proje reddi ve sunucu kapalıyken gerçek S3 derleme/simülasyon kontrolleri için `QA_0.34.md` dosyasına bakın.

## Güvenilir proje davranışı

En çok 16 kaynak dosyası ve toplam 100 KB UTF-8 kaynak kabul edilir. Tek ana dosya `sketch.ino` sabittir; yardımcı dosyalar `.cpp`, `.h`, `.hpp` olabilir. Traversal, çakışan adlar ve çekirdeğin `Arduino.h` adını gölgeleyen dosyalar reddedilir. Firmware kaynak anahtarı tüm dosyaların sıralanmış kanonik içeriğini ve çipi kapsar; güvenlik imzası değildir. v1 tek dosyalı projeler okunmaya devam eder. İçe aktarma doğrulamaları mevcut proje değiştirilmeden tamamlanır.

## Açık kapsam ve sonraki aşama

Bu sürüm CircuitForge ESP core 0.1'in GPIO, zaman ve tamsayı Serial API'sini sunar. Tam Arduino ESP32 SDK, ADC, LEDC/PWM, I2C/SPI, Wi-Fi ve BLE henüz sunulmaz. GPIO grafik 40 ms arayüz örneklemesidir; çevrim hassasiyetinde PWM ölçümü değildir. ESP çalışma alanında sabit GPIO2 LED / GPIO3 buton test devresi vardır.

Sonraki aşama: `docs/ESP32_SDK_PLAN.md` içindeki resmi Arduino 3.3.8 / ESP-IDF 5.5.4 kaynak, lisans, GCC sysroot ve gerçek ROM/FreeRTOS başlangıç kapılarını C3 üzerinde uygulamak. Sonra ADC/LEDC simülatör erişimlerini doğrulayıp C6/S3'e genişletmek.

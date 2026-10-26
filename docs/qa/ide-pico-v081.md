# 0.81 hedefli doğrulama

Önceki test paketleri yerelde yeniden çalıştırılmadı.

- tests/ide-workbench-v081.test.mjs: atomik kaynak birleştirme, üzerine yazma izni, namespace/yol güvenliği, dil/SDK sınırları, include çözümleme, gerçek debug verisinin sunumu.
- tests/pico-c081.test.mjs: 8 kart hedefinde yerel ARM kodu, çoklu .c/.h bağlama, gerçek DC LED akımı ve UART; checksum/yanlış hedef reddi. RP2040/RP2350 için buton bas/bırak, reset, model timer beklemesi.
- Yerel tarayıcı: sekiz Pico seçeneği ve yalnız C17; Pico 2 W with headers derle/çalıştır; UART ON/OFF ve 3.3 V / 3.94 mA LED; Debug'da gerçek PC/R0-R15.
- İki farklı kaynak yan yana düzenlendi; dosyalar arası satır işareti ve undo geçmişi korundu. Satır/sütun diyaloğu açıldı.
- .c/.h dosyaları tek seçimde lib klasörüne alındı; ana dosyadan include ve fonksiyon çağrısıyla 644 bayt firmware derlendi.
- Kontrollü main.c sözdizimi hatası Sorunlar'da main.c:19:1 ve :19:18 olarak göründü, imleç doğru satıra gitti. Doğru kaynak geri yüklendi.

Bu kontroller kaynak breakpoint, tam SDK, radyo veya tüm Pico çevrebirimleri için destek iddiası oluşturmaz.

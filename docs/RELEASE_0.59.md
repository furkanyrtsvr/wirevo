# CircuitForge 0.59 · F401/F411 USB OTG FS

USB device laboratuvarı artık dokuz STM32 kartında açılır. F401/F411 için ayrı OTG FS register/FIFO modeli, RCC AHB2 saat/reset, native IRQ67 ve C17/C++17 firmware örneği eklendi. Beş F4 kartında device/configuration descriptor, adres ve configuration, EP1 bulk echo, sıfır/tek/tek sayılı/64 bayt ve çok paket aktarım kabulü var. F103 PMA/IRQ20 ve bxCAN modeli korunur; F401/F411'de CAN varmış gibi gösterilmez.

F411 varsayılan çalışma profili 100 MHz'ten USB uyumlu 96 MHz'e alındı: PLLN384/PLLP4/PLLQ8 → USB48 MHz. F401 84 MHz/PLLQ7 → USB48 MHz. Nucleo8 MHz ve WeAct25 MHz HSE değerleri korunur. Derleyici, UART/delay, runtime zaman tabanı ve kart bilgisi aynı frekansı kullanır. Eski C/C++ projelerinin firmware anahtarı yenilendi; yeniden derleme gerekir. Çipin azami 100 MHz özelliği değiştirilmedi. Profil dışı PLL/HCLK seçimi açık hata verir; eski 100 MHz BIN dosyası 96 MHz için yeniden derlenmelidir.

FIFO RAM 320 sözcük, çakışma/sınır/doluluk kontrolleri; interrupt maskeleri, W1C, TXFE, reset/flush, NAK/backpressure ve STALL/SETUP recovery. Geçersiz PLL48, paket boyutu, DMA/host/isochronous ve modellenmeyen transfer biçimleri açık hata verir. F103 BTABLE taşmasının PMA başına sarılması düzeltildi.

Kullanım: Projeler → Temel kontrol örnekleri → USB aygıtı / bulk echo → Çalıştır → Sanal USB host. Hazır JSON: docs/examples/stm32-otg-f401-059.json (C17) ve stm32-otg-f411-059.json (C++17). Yeni ayrı çalışma alanı yok; mevcut proje/dosya/kart seçimi korunur.

Tarayıcı kabulü: WeAct F411 C++17 gerçek Clang ile derlendi (2684 B Flash); 96 MHz kart profili, USB descriptor/adres7/configuration1; Türkçe metin52 bayt OUT→IN aynı döndü. CircuitForge-0.59-F411-USB-Kabul.png. Çalışan ve duraklatılmış firmware üzerinde host enumeration doğrulandı; echo ekranı duraklatılmış kabul görüntüsüdür.

Sınırlar: Bu sürüm OTG FS device alt kümesini tamamlar; USB fiziksel PHY/PC erişimi, OTG host/iso/DMA/sınıf yığınları; harici CAN ağı, yerel ARM MicroPython/tam Cube HAL ve ileri STM32 silikon ayrıntıları halen kapsam dışı veya açıktır. Tüm STM32 silikonu tamamlandı iddiası yoktur. Kullanıcının diğer kartlara geçme isteği doğrultusunda sonraki mimari değerlendirmesi devam planına alındı. Otomatik devam zamanlayıcısı kurulmadı.

Kontrol ayrıntıları: qa/QA_0.59.md; kullanım/48 MHz kaynakları: dist/notices/STM32-OTG-FS.md; devam: STM32_PLAN_0.59.md.

Doğrulama: genel regresyon1331/1331; ayrıca FIFO2/2, son HCLK/USB10/10 ve build sonrası cache7/7. Hata/iptal/atlanan yok. App shell440 dosya /19648482 bayt.

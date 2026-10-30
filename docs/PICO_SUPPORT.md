# Pico — güncel kullanım kapsamı

**Wirevo 0.110.0 · 30 Ekim 2026.** Bu sayfa güncel özettir. [Ayrıntılı kullanım kılavuzu](../dist/guide.html), [PDF](../dist/manual/Wirevo-Kullanim-Kilavuzu-v0.110.0.pdf).

## Normal kullanım

Kartı seç → kaynaklarını ekle → **Derle → Çalıştır**. Derleme tarayıcıda yapılır. Python yardımcısı, yerel servis, port/anahtar, ek pencere veya masaüstü uygulaması gerekmez. İlk kullanımda derleyici dosyaları indirilir.

## Kart ve dil

- RP2040: Pico, Pico H, Pico W, Pico WH.
- RP2350: Pico 2, Pico 2 H, Pico 2 W, Pico 2 WH.
- Sekiz profilde C17 / ARM; Pico 2 ailesinde ayrıca Hazard3 C. Profil seçimi bütün fiziksel silikon özelliklerinin modellenmiş olduğunu göstermez.
- MicroPython WASM ve ayrı native RP2 ARM profili vardır. Aynı motor değildirler; modülleri ve bekleme/etkileşim biçimleri farklıdır. Native RP2 profili ROM/firmware dosyalarını ayrıca indirir; W radyosunu yürütmez.

## Desteklenen çalışma çerçevesi

| Alan | Uygulamadaki kapsam | Sınır |
|---|---|---|
| C derleme | Çok dosya, C/H kaynakları, başlıklar, desteklenen SDK uyumluluk katmanı, sınırlı CMake kaynak/hedef değerlendirmesi | Tam resmi SDK/CMake, native EXE araçları veya bütün üçüncü taraf kütüphaneler değildir |
| Devre | GPIO, ADC/PWM, UART, I2C/SPI ve ilgili sanal bileşenler | Pin/mux, besleme, adres ve protokol doğru bağlanmalı; her bileşen/kütüphane birleşimi doğrulanmış değildir |
| PIO/DMA / iki çekirdek | Mevcut motor ve API alt kümeleri | Tüm SDK çağrıları ve bütün yarış/zamanlama durumları için silikon eşdeğerliği yoktur |
| MicroPython | WASM devre adaptörü; ayrı native RP2 profili | WASM'da `_thread` yoktur; native profilin ayrı ROM ve modül sınırları vardır |
| USB / flash / ROM | Mevcut sınırlı aygıt/flash ve ROM profilleri | Her USB sınıfı/host/birleşimi, OTP/security ve bütün açılış kipleri kapsamda değildir |
| Kablosuz | W/WH kartlarında sanal eğitim ağı ve taşıma modeli | Özgün CYW43 firmware/radyo yürütümü, gerçek Wi-Fi/Bluetooth/Internet değildir |
| Zamanlama | Olay zamanları, UART baud/FIFO/akış kontrolü ve desteklenen bekleme hızlandırmaları | Tam CPU çevrim doğruluğu, tüm saat kaynakları ve her projede gerçek zaman garantisi yoktur |

## İsteğe bağlı kaynak paketi

“SDK paketi ekle”, uyumlu C/H kaynaklarını ekler ve probe derlemesiyle denetler. JSON tek başına derleyici veya SDK değildir. Tam resmi SDK ZIP'ini seçmek tüm SDK'yı çalışır hale getirmez. Normal Derle → Çalıştır için paket zorunlu değildir. [Paket adımları ve somut sınırlar](../dist/notices/PICO-SOURCE-PACKAGES.md).

## Bu sürümde ne doğrulandı?

Yeni Pico özelliği eklenmedi. UART SDK beklemelerindeki boş CPU dönüşü azaltıldı. Yeni kontroller; 56 parçalı devrede 192 baytın kayıpsız ve aynı baud süresinde çıkışını, RP2040/RP2350'de DHT/GPS/MH-Z19 akışını ve UART beklerken timer IRQ / alım zaman aşımını kapsar. Önceden derlenen firmware hızlandırma için yeniden derlenmelidir. [Ölçüm ve sınırlar](../dist/notices/PICO-PERFORMANCE110.md).

Bu kontroller, diğer bütün özelliklerin yeniden doğrulandığı anlamına gelmez. Hedef eğitim ve uygulama geliştirmedir; %100 silikon modeli hedeflenmez. Yukarıdaki kapsam dışı alanlar yeni geliştirme sözü değildir.

## Teknik ayrıntı ve tarihçe

[Model/API kaydı](../dist/notices/PICO-MODEL.md) · [Tarayıcı CMake alt kümesi](../dist/notices/PICO-BROWSER-CMAKE.md) · [ROM kaynakları/lisans](../dist/notices/PICO-ROM-SOURCES.md). Bunlar teknik ayrıntıdır; güncel başlangıç noktası bu sayfadır.

[0.109 ve önceki destek kayıtları](history/PICO_SUPPORT_TO_0.109.md) tarihçe olarak korunur. Eski yerel yardımcı talimatları geçerli değildir.

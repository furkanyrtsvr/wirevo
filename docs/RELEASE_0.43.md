# CircuitForge 0.43 · STM32 pin yapılandırması ve laboratuvarlar

13 Ekim 2026. Nucleo F103RB/F401RE/F411RE açık mavimsi beyaz PCB, işlemci bacakları, ST-LINK, kristal, pasifler ve küçük baskı detaylarıyla yeniden çizildi. Fiziksel pad merkezleri ve elektriksel pinout korunur. Özgün SVG çizimidir; gerçek kart fotoğrafı veya Wokwi varlığı kopyalanmadı.

STM32 Pinler penceresi kart üstü seçim, arama, göreve göre seçenek, AF/remap planı, C etiketi, başlangıç seviyesi ve kod önizlemesi sunar. Üretilen C başlangıç fonksiyonu altı hedefte gerçek ARM reset akışına bağlıdır. Pull-down API F1/F4 için eklendi. Firmware çekirdek kimliği `cf-stm32-0.2`; eski ikili yeni kaynakla yeniden derlenir. Yapılandırma JSON/ZIP ile korunur.

Ana örnek sayısı ikiye indirildi: SHT31/ADC/OLED çevre istasyonu ve Bluetooth/ADC/buton/LED kontrol laboratuvarı. Her biri yedi görünür C/header dosyasıdır. Basit örnekler ayrı açılır bölümde korunur. Eşdeğer dış Morpho padleri, ortogonal engel rotaları ve eski proje için geri alınabilir Kabloları düzenle eylemi PCB üzerinden geçen uzun kabloları giderir.

Kapsam ve kullanım: [STM32-PIN-CONFIG](../dist/notices/STM32-PIN-CONFIG.md). Kabul: [QA_0.43](../QA_0.43.md). Sonraki sıra: [STM32_PLAN_0.43](STM32_PLAN_0.43.md). Toplam kart sayısı 26 / STM32 sayısı 6; bu sürüm yeni CPU ailesi eklemez. Donanım ADC/TIM/UART/I²C/SPI, tam Cube/HAL, STM32 C++/MicroPython ve gerçek RF donanımı henüz tamamlanmış değildir.

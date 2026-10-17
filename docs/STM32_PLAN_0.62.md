# Wirevo 0.62 devam kaydı

Yeni doğrulananlar: I²C1 fast/DMA, F4 SPI1 alternatif pinler, USART kesirli stop, RTC subsecond alarm ve DMA kullanan birleşik C/C++ sensör istasyonu. Test/yayın kanıtı docs/qa/README.md ve üst klasördeki sonuç/devir kaydında.

Kullanıcı STM32'nin bütün eksiklerini bitirmeyi tekrar istedi. Bu talep0.61 planındaki "otomatik yeni STM32 turu yapılmaz" tercihinin önüne geçer. Yapılmamış işlevleri tamamlandı olarak sunmayın; kartta olmayan çevrebirimleri de iş listesine eklemeyin.

Gerçek açık iş grupları: diğer mevcut USART/SPI/I²C/TIM/ADC instance'ları; UART flow/LIN/smartcard, SPI slave/CRC, I²C slave/arbitration/PEC; DMA FIFO/burst/DBM, RTC timestamp/tamper/calibration, Flash programlama/option bytes, dinamik clock/power/fault/MPU ayrıntıları, F4 SDIO, USB host/iso/DMA ve haricî CAN ağı; tam Cube/HAL/STL ve yerel ARM MicroPython. Sonuç dört gerçek alt grubun ilerlemesidir, "bütün STM32 tamam" diye devir yapmayın. Ayrıntı: dist/notices/STM32-AUDIT.md.

RP2040/Pico henüz desteklenmez; yeni aile için resmi pinout, uygun gerçek motor/firmware ve elektriksel kabul ayrı kapıdır. GitHub AGENTS.md sync/test/commit/push/main/Release doğrulama, ardından Sites yayını. README ürün açıklaması korunur. Zamanlayıcı kurulmaz. Kökte yeni QA dosyaları yığılmaz.

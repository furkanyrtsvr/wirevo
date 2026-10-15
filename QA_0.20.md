# QA 0.20 — dijital modüller

307 otomatik test / sıfır hata; altı native GCC örneği. DHT11 4584/166, DHT22 4666/166, HX7113064/166, TM1637 2626/166, encoder3174/220, keypad2552/166 (Flash / static SRAM byte).

Gerçek AVR testleri: DHT integer/tenths, negative/checksum, startup/read cooldown ve eksik pull-up/wrong pin; dört ayrı breadboard şeridi. HX bridge signed differential, clipping, A128/B32/A64, >60µs powerdown/wake. TM ACK/RAM/auto/fixed/on/off/duty ve güç kaybı. Keypad scan/çoklu kontak ve encoder nativeINT0/INT1, VCCsiz pasif kontak/SW.

Tarayıcı localhost: TM1637 canlı12:34/ACK; KY üzerindeki+ düğmesi ENC=1; keypad1 ve5 kontakları15; HX loadcell500g A128=2147484. DHT22 gerçek klavye değişimi−12.3°C, seriRH=50.0 T=−12.3, reload alanı−12.3 kalıcı. Sayısal alan kontrolünde fill yerine gerçek tuş girişi kullanıldı; DOM fill değişim olayını göndermedi. Ekran görüntüsü parent/CircuitForge-0.20.png.

Tüm pin/model sınırları notices/DIGITAL-MODELS.md. Eksik Arduino WInterrupts LGPL kaynak/nesne, reproduciblebuild scripti ve bildirim eklendi. WS2812/stepper/L298 çizimleri sonraki aşama için kaynakta hazır; kütüphanede henüz aktif değildir.

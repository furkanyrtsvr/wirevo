# CircuitForge 0.39 — doğrulama kaydı

12 Ekim 2026. `npm run build`, `git diff --check` başarılı. Yeni sensör ve ortak proje suite'i45/45; toplam yeni C17 testleri19. **Tam regresyon567/567 geçti**, 191,15 saniye.

`npm run test:c-sensors`: sekiz fiziksel kart (C3/C6/S3/H2/C5/P4/XIAO C6/Nano) × iki C17 sensör =16 gerçek Clang firmware. SHT31 sıcaklık2500/nem5000, MCP3008 ADC512/mV1650. Sürücü `cf_bus.c` ayrı C17 translation unit olarak linklenir. `node scripts/check-c-sensor-guards.mjs`: gerçek firmware ile10 invalid-pin/frekans/adres/uzunluk kabulü ve bozuk CRC reddi; iki ek binary.

Fixture yürütmeleri16 devreyi tekrar çalıştırır; C3 ve XIAO C6'da sıcaklık37/pot75 değişiklikleri ve SHT31 VIN kesilince NO ACK. Native kodu yeniden başlatıp fiziksel değişimi ölçmek, aynı binary'nin farklı devre sonucunu ürettiğini gösterir. 14 kartta iki C katalog örneği ve geçerli fiziksel pin/ZIP kaynak eşleşmesi; cf_bus.c değişince firmware invalid. Önceki AVR/ESP ve Python/wire suite korunur.

Tarayıcı: XIAO C6 C17 SHT31 main.c +cf_bus.h/c; kaynak SDA22/SCL23 doğru başlık eşlemesi. Gerçek Clang3424 byte firmware; sıcaklığı25→37°C değiştirince aynı çalışmada UART TEMP2500→3700. H2 C17 MCP3008 kaynakta MISO11/CS10; pot50→75 ile aynı çalışmada ADC512/mV1650→ADC768/mV2475. Ortak devre/ölçüm/bus/GPIO kayıtları; Stop sonlandırdı. Kök ekranlar CircuitForge-0.39-C17-SHT31.png ve CircuitForge-0.39-C17-MCP3008.png.

Classic/S2 için Clang kod üretimi geçti fakat motor ROM/CPU kapısı geçmedi; araştırma docs/CLASSIC_ESP32_GATE_0.39.md. Bu sürüm kart sayısını artırmaz; 14 ESP +6 AVR korunur. Dahili ADC/hardware I2C/SPI, clock stretching, repeated-start, tam IDF ve RF kapsamı eklenmedi.

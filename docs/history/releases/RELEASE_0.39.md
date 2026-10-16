# CircuitForge 0.39

Devam planındaki C17 sensör örnekleri uygulanmıştır. Dosya → Yeni proje / ESP32 / C ile SHT31 veya MCP3008/potansiyometre devresi açılır; aynı örnekler Projeler kataloğundadır. 14 kartta kaynak pinleri ve devre başlığı birlikte eşlenir.

GPIO tabanlı sürücü cf_bus.h/c düzenlenebilir ve ayrı C17 kaynak olarak Clang ile derlenir. Gerçek ACK/NACK/CRC ve SPI kenarları; besleme ve ortam/pot fiziksel devreden gelir. Çok dosyalı JSON/ZIP kaynak eşleşmesi eski programın yanlış kullanılmasını önler. Yeni cf_gpio_valid kartın gerçek kullanılabilir GPIO'larını denetler.

Classic/S2 araştırması gerçek kod üretimi ile CPU/ROM desteğini ayırdı. Tarayıcı motoru mevcut olmadığı için yeni sahte kart profili eklenmedi. QEMU native/WASM ve her SoC için kabul adımları docs/CLASSIC_ESP32_GATE_0.39.md ve DEVAM_PLANI.md içine işlendi.

Model ve protokol kaynakları dist/notices/C17-SENSORS.md; doğrulama QA_0.39.md. `npm run test:c-sensors`, `node scripts/check-c-sensor-guards.mjs`, `npm run build`, `npm test`.

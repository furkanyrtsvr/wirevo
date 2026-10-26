# 0.81 - Çok dosyalı kod çalışma alanı

- .c/.cpp/.h/.hpp/.py kaynaklarını çoklu seçimle veya kaynak ZIP'iyle içe aktarma; hedef kütüphane klasörü ve açıkça seçilen üzerine yazma. Doğrulama atomiktir.
- İki ayrı dosyayı yan yana düzenleme; sekmeler arasında dosyaya özel imleç, satır işareti ve geri alma geçmişi.
- Satır/sütuna git, F9/gutter satır işaretleri ve #include dosyasına gitme.
- Tiva/STM32/ESP derleme hata ve uyarılarını Sorunlar paneline, dosyaya ve satır/sütuna bağlama.
- Gerçek worker zaman/GPIO durumunu gösteren Debug paneli; seri giriş yalnız seri terminal sekmesinde.
- 8 resmî Pico varyantında C17 başlangıcı: Pico/H/W/WH ve Pico 2 / 2 with headers / 2 W / 2 W with headers. RP2040 Cortex-M0+ ile RP2350 Cortex-M33 ayrı işlemci yollarından gerçek ARM kodu yürütür.
- GPIO/pull-up/down, harici GP15 LED, GP14 buton, UART0 terminal, model zamanı/sleep, çoklu C dosyası bağlama; Pico debug panelinde gerçek PC ve işlemci yazmaçları.
- Mevcut güvenlik sınırı: 16 kaynak, 100 KB toplam metin. SDK/ABI ile uyumlu kaynak kütüphaneleri desteklenir; her masaüstü paketi taşınabilir değildir.

## Açık kapsam

Satır işaretleri gerçek firmware breakpoint değildir. DWARF kaynak eşleme, kaynak satırı adımı, C yerel değişkenleri ve çağrı yığını eklenmedi. Pico başlangıcı tam Pico SDK veya tam silikon uyumluluğu değildir: MicroPython, USB/UF2/BOOTSEL ROM, PIO/DMA, ADC, çift çekirdekli kullanım, RP2350 Hazard3/TrustZone ve CYW43/radyo entegrasyonu bu sürümün dışındadır. W varyantlarında dahili LED yerine harici GP15 LED örneği kullanılır. Ayrıntı: dist/notices/PICO-MODEL.md.

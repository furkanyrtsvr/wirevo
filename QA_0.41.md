# 0.41 · STM32 kabul kaydı

12 Ekim 2026. Altı STM32 kartı ortak çalışma alanına eklendi: Blue Pill F103C6/C8/CB ve Nucleo F103RB/F401RE/F411RE. C6T6(A) 32 KiB Flash/10 KiB SRAM, C8 64/20, CB ve F103RB 128/20, F401RE 512/96, F411RE 512/128. Resmî datasheet ve MB1136 C04 header/solder bridge kaynakları dist/notices/STM32-MODEL.md içinde.

## Gerçek derleme ve yürütme

630/630 genel test geçti; sıfır hata/atlama, 200459 ms. STM32 için 46 test: altı kartta fabrika LED/buton/UART echo/SHT31/MCP3008 örnekleri gerçek Clang ARM makine koduna yeniden derlenip gerçek M3/M4F WASM'de çalıştı. Toplam 30 kart × hazır devre kombinasyonu; kaynaklar yorumlanarak sonuç üretilmez.

- Altı kartta buton kontağı PA1 girişini değiştirir, PA0 LED akımı açılır/kapanır; UART terminali gönderme/alma, reset ve kaynak/firmware ZIP korunur.
- Altı kartta SHT31 25→37 °C canlı değişim ve VIN ayrılınca NACK; MCP3008 pot %50→75 ile ADC512→768. Yazılım I2C/SPI ve gerçek GPIO/DC bağlantısıdır; dahili ADC değildir.
- Altı kartta varsayılan blink gerçek GPIO kenarları arasında 20 ms model zamanı verir. Kart LED'i LOW/HIGH polaritesiyle ayrı devre yüküdür.
- Altı kartta haricî EEPROM byte77 ve STOP kabul edilmiş byte99 yazması MCU resetinde korunur; aşırı GPIO gerilimi reddedilir. Üç Nucleo'da B1 aktif LOW giriş değişimi doğrulanır.
- C6, F401RE ve F411RE gerçek SysTick exception/return; SRAM dışı store CPU fault'u. İki M4F'de VFP 1.25 × 2.0 = 2.5 (float bit40200000).
- C6 Flash/SRAM aşımı ve stack rezervi; ayrı ve alt klasörlerdeki .c/.h dosyaları (include/value.h, lib/value.c) gerçek Clang translation unit olarak derlenir ve UART NEST=42 üretir.
- Altı değişmemiş stm32-worker.js yaşam döngüsü: uygulamanın gerçek ince circuitPayload yapısıyla load/run/pause/reset/step/terminate. GPIO kenar/trace ve frame kimliği denetlenir.
- AVR/ESP/STM kütüphaneleri mimari değiştirmez; STM import C17 ister. Firmware header hedefi, reset vektörü, Flash boyutu ve checksum; motor SHA-256, core fingerprint ve JSON/ZIP kaynak eşleşmesi.

Tarayıcı: NUCLEO-F411RE yeni proje/C17/SHT31 seçimi, gerçek tarayıcı derlemesi, sıcaklık/nem UART ölçümü, duraklatma. Blue Pill ve Nucleo görselleri, altı kart seçimi ve STM32 pin/Flash/SRAM etiketleri. Kök ekran görüntüleri pakete eklenir.

## Yeniden üretim ve sınırlar

npm run test:stm32; npm test; npm run build. scripts/stm32/probe-cpu.mjs ilk 0.40 linker gate ELF'ini gerçek M3 motorunda RCC/GPIO yazmasıyla çalıştırır; ana kabul testleri güncel compiler/startup kullanır. 0.40 gate raporu tarihsel compiler-only kaydı olarak korunur.

Motor kaynak commit'i 72feb753fea97babc00cc88f2c75e814efc1bfd2, Rust1.99.0 ve artifact hash'leri dist/stm32/provenance.json. Zmu Apache-2.0 kaynakları ve Cargo.lock pakettedir. Varsayılan build hazır WASM'i kullanır.

İlk destek C17 freestanding, GPIO/DC, DWT/SysTick, sınırlı UART byte terminali ve yazılım sensör protokolleridir. Tam ST HAL/CMSIS/Arduino/MicroPython, fiziksel UART framing/IRQ, donanım ADC/PWM/I2C/SPI, USB/CAN/DMA desteklenmiş sayılmaz. Tüm STM32 geliştirme kartları tamamlanmadı; diğer Nucleo/WeAct/Discovery aileleri docs/STM32_PLAN_0.41.md'de sıraya kondu. Görseller mekanik CAD ve devre modeli SPICE değildir.

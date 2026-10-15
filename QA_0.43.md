# CircuitForge 0.43 kabul kaydı

13 Ekim 2026, Windows / Node / Clang 22 / gerçek Cortex-M3 ve Cortex-M4F WASM.

- `npm test`: **673/673**, 0 hata/atlanan, 78419.7613 ms. Log `.sites-runtime/full-first043.log`.
- Okunabilir laboratuvar ana C dosyaları düzenlendikten sonra `npm run test:stm32`: **74/74**, 0 hata/atlanan, 25695.6361 ms. Log `.sites-runtime/stm43-final.log`. Genel testten sonra yapılan kaynak değişikliği yalnız iki laboratuvar C kodunun satır düzeni ve yerel değişken adlarıdır; altı hedefte tekrar gerçek derleme/çalıştırma kabulünden geçti.
- Yeni `tests/stm32-pins-labs.test.mjs`: **21/21**. Altı kartta başlangıç fonksiyonu `main` öncesinde çalışır, GPIO HIGH ve pull-down kabulü; JSON/ZIP pin yapılandırması; reserved/duplicate/eksik bus ve kullanıcı kaynak dosyası koruması.
- Altı kart × çevre laboratuvarı: gerçek SHT31 I²C/CRC, SPI ADC, OLED RAM yazımı, 37 °C canlı alarm, buton ve sensör besleme kesme.
- Altı kart × Bluetooth kontrol laboratuvarı: gerçek ARM GPIO UART, sanal PC scan/connect/READY, L1 LED ve A ADC cevabı.
- Nucleo iç padleri dış Morpho eşdeğer netlere taşınır; sıkı gövde kesişimi ve yalnız kısa endpoint stub kabulü. Mevcut tüm starter routing testleri genel testte geçti.
- F103C6 peripheral yokluğu, F401/F411 AF farkları, Nucleo reserved header profili doğrulandı. Datasheet planları aktif GPIO/donanım sürücüsü gibi derlenmez.

Tarayıcı kabulü: http://127.0.0.1:4174 üzerinden yeni Nucleo F401RE çevre istasyonu gerçek Clang ile derlendi, USART terminalinde `T=2500 H=5000 ADC=512 LIMIT=3000 ALARM=0 OLED=0` görüldü. Beyaz/mavimsi PCB ve çevreden giden kablolar görsel olarak incelendi. STM32 Pinler kart üstü PA0 seçimi, HIGH uygulama ve yeniden açmada kalıcılık; `cf_board_config.c` içindeki gerçek `cf_gpio_write(PA0,1)` doğrulandı. İki ana örnek ve katlanır temel örnekler listesi, Kabloları düzenle geri alabilir eylemi görüldü. Bluetooth kontrol devresi derlenip sanal PC'ye bağlandı ve READY yanıtı alındı.

`npm run build`: uygulama kabuğu 394 dosya / 19286805 bayt; 20 MiB altında. Clang ayrı önbellektir. Sonraki kaynak/notice değişiklikleri yalnız belgeler ve release cache listesidir.

Gerçek BLE donanımı, gerçek RF, fiziksel kart, donanım ADC/TIM/PWM/IRQ ve tam vendor HAL bu kabulün kapsamında değildir. Pin penceresi doğrulanmış AF alt kümesidir; tüm CubeMX alternatiflerini kapsadığı iddia edilmez. Önceki 0.42 kabul kayıtları tarihsel olarak korunur.

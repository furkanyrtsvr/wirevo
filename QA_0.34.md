# CircuitForge 0.34 — ESP32 ailesi kabul kaydı

11 Ekim 2026, Windows / yerel tarayıcı. Altı AVR kartı ve mevcut devre altyapısı korunur. ESP alanı üç ayrı hedef için ilk bağımsız C++/CPU aşamasıdır; tam Arduino-ESP32 ve ESP serbest devre editörü kabulü değildir.

## Gerçek toolchain / CPU

`node scripts/check-esp-projects.mjs`: dağıtılan gzip Clang WASM SHA-256 doğrulanarak açıldı, C3/C6/S3 için beşer örnek gerçekten derlendi ve gerçek ESP-EMU WASM üzerinde yürütüldü. Her firmware 11 milyon instruction adımıyla GPIO/UART/bellek kabulünden geçti.

| Hedef | Blink BIN/RAM | Buton | Echo | C++ sayaç | UART biçim |
|---|---|---|---|---|---|
| C3 | 896/20 B | 832/24 B | 416/20 B | 1120/2072 B | 736/20 B |
| C6 | 896/20 B | 832/24 B | 416/20 B | 1104/2072 B | 736/20 B |
| S3 | 880/20 B | 928/24 B | 496/20 B | 1024/2072 B | 752/20 B |

Blink gerçek GPIO2 HIGH/LOW; buton GPIO3 LOW → LED HIGH, bırakma → LOW. UART RX→TX echo; C++ global constructor value37, BSS/data RAM37/77 ve millis. UART format HEX=DEADBEEF, BIN=101010, signed32 minimum−2147483648, char A ve ham OK CRLF doğrulandı. Fixturedaki firmware/source çifti ve aynı target gerçek worker yolunda tekrar test edilir.

`node scripts/check-esp-core.mjs`: üç hedefte yapay near-wrap clock state başlangıcıyla gerçek CPU üzerinden us/ms carry/wrap (WRAP_US≈9986–9987, WRAP_MS=4); DRAM+1 byte reddi; S3 40 KB IRAM reddi; gerçek GPIO42 output HIGH, GPIO46 output yapılamaması; analogRead ve WiFi.h gerçek derleme hatası. S3 IRAM/DRAM fiziksel alias çakışması kod bölgesini32KiB ile sınırlayarak engellendi. Sonuç tests/fixtures/esp-core-acceptance.json; bu fixture uzun süreli donanım timer-interrupt kabulü olarak sunulmaz.

## Dış firmware / ROM boot

Yerel research/esp32/probe-idf.mjs ve resmî olmayan MIT esp32sim deposunun açık demo dosyalarıyla üç gerçek ESP-IDF5.5.4 merged imaj denendi. Her biri ROM → second-stage bootloader → partition/app → FreeRTOS → Hello world aşamasına ulaştı. S3 firmware iki çekirdeği açtı. Bu demo binary'ler ürün dağıtımına eklenmedi. Kaynak https://github.com/mikroverk/esp32sim/tree/main/web/wasm/fw/public ; kayıtlar research/esp32/esp32{c3,c6,s3}-idf.log. Resmî yürütme motoru Espressif ESP-EMU0.48.0'dır.

## Tarayıcı kabulü

- C3 Blink: gerçek Derle, GPIO2/LED ON/OFF, terminal ve PC/time/MIPS. C6 buton: gerçek Derle, BUTTON0→1 ve LED. S3: gerçek Xtensa Derle, UART mesajının aynen geri gelişi ve IRAM HEX dökümü.
- S3 proje JSON indirildi; C3 seçiliyken yeniden açıldığında doğru S3/source/firmware yüklendi ve UART READY çalıştı. Chip alanı C6 yapılmış bozuk dosya hedef eşleşmesiyle reddedildi, mevcut S3 firmware korundu.
- Clang gerçek `sketch.ino:2:12` expected ')' hatası; stale kaynak için Çalıştır kapalı. Yenilemede kaynak korundu. Derleme × iptali worker sonlandırarak arayüzü kullanılabilir bıraktı.
- Pencere: Kart + tezgâh düzeninde editor kapalı; yenilemeden sonra seçim korundu. Kod + terminal düzeninde library kapalı/terminal açık; Tüm paneller geri açtı. Kaynak geçmişi önceki kodu listeler.
- Offline: uygulama cache hazır olduktan sonra **yerel HTTP sunucusu tamamen kapatıldı**. Sayfa yenilendi, yeni `OFFLINE CLANG S3 OK` programı yazıldı, Clang cache'inden gerçek derleme yapıldı ve gerçek S3 UART aynı mesajı verdi. Ardından QA sunucusu yeniden başlatıldı.
- 900×700 responsive kontrolü, panel görünürlük/scroll ve yerleşim sınırları gözlendi. Geçici viewport override teslim öncesi kaldırılır.

## Sınırlar / dağıtım

Tek sketch.ino; küçük bağımsız CircuitForge ESP core0.1. GPIO/UART/C++/time vardır; Arduino-ESP32 SDK, ADC/LEDC/PWM/bus/Wi-Fi/BLE ve serbest 3.3V kablolama sonraki aşamalardır. 40 ms grafik kenar analizörü değildir. Girişler başlangıçtaHIGH ideal kaynaktır; LED akımı ideal sabit tezgâh hesabıdır. ELF statik RAM stack zirvesi değildir.

Clang gzip22,573,195B (<25MiB statik dosya sınırı), açılmış80,735,841B SHA7546c54c07c392e231ea450f8e3aaa6680346ffeb08e13d97d970b26d88666e5. Resmî ESP-EMU release SHA256SUMS doğrulandı; exact asset manifest dist/esp32/provenance.json. LLVM exception, WASI MIT ve Espressif Apache lisansları dağıtımda. Mokxi runtime/simulator/core kodu alınmadı.

`npm test`: **438 geçti / 0 hata**. `npm run build`: başarılı. Offline shell324 dosya /16,788,783B (<20MiB); Clang ayrı. Kaynak/firmware doğrulaması, corrupt project/base64/chip, source history/backup/quota, bounded app shell ve eşzamanlı kart yükleme/worker session koruması otomatik kabulde. SDK devam araştırması docs/ESP32_SDK_PLAN.md: gerçek Arduino3.3.8/IDF5.5.4, chip SDK hashleri, GCC sysroot/ABI/linker ve lisans kapıları.

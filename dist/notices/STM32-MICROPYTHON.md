# STM32 MicroPython devre modu · 0.57

Dosya → Yeni proje → STM32 → MicroPython. Dokuz mevcut STM32 kartında main.py ve ek .py dosyaları; ortak devre alanı, breadboard, net label, auto route, canlı girişler ve ölçüm/iz kaydı. Hazır çevre istasyonu SHT31 + MCP3008 + analog pot + buton/alarm LED + OLED + EEPROM içerir.

Gerçek MicroPython WebAssembly yorumlayıcısı kullanılır; kaynak kodu JavaScript ile yorumlanarak sonuç üretilmez. Pin/ADC/SoftI2C/SoftSPI adaptörü aynı STM32 elektriksel devresine bağlıdır. Ancak bu, Cortex-M3/M4 üzerinde yüklenmiş yerel MicroPython firmware portu değildir. MCU Flash/SRAM sınırı, GC zamanlaması, instruction/register/IRQ/USB/CAN/pyb/stm davranışı bu mod için doğrulanmış değildir. C17/C++17 gerçek ARM motorunu kullanmaya devam eder.

Destek: Pin('PA0') veya Pin('A0'), kart üzerindeki D13/A0 gibi bağlanabilir başlık takma adları; IN/OUT/OPEN_DRAIN, PULL_UP/PULL_DOWN, value/on/off; ADC(Pin(...)).read_u16 ve 12-bit read. ADC1 PA0–PA7/PB0–PB1/PC0–PC5 arasından kartta açık pinlerle sınırlıdır. Sayısal pinler port*16+bit simülasyon numarasıdır. Reserved/kopuk başlıklar reddedilir. Yüzen ADC/GPIO ve geçersiz elektriksel devre hataları gizlenmez.

SoftI2C 1–10kHz: scan/readfrom/writeto/readfrom_mem/writeto_mem; gerçek açık drenaj ve cihaz ACK/CRC/enerji kesilmesi. SoftSPI mode0/MSB/8bit, 10–20kHz; gerçek saat/veri hatları ve MCP3008. Donanım I2C/SPI/UART/Timer/PWM/Pin.irq, RTC, pyb ve stm.mem32 bu Python adaptöründe yoktur. Bunları varmış gibi aliaslamıyoruz.

Canlı kontrol için import js ve await js.cf.sleep(ms) kullanın. time.sleep(_ms/_us) devre zamanını ilerletir ama Worker'a kontrol vermez; sonsuz döngülerde await gerekir. Duraklat/yeniden çalıştır yorumlayıcıyı yeniden başlatır; RAM ve sanal çevrebirim oturumu korunmaz; EEPROM kalıcılığı bu yeniden başlatma için sağlanmaz (aynı çalışan oturumda yazma/okuma çalışır). Python pin başlangıcı main.py içindedir; C pin planı/başlangıç kodu çalışmaz. Derle Python sözdizimi kontrolüdür, ARM binary üretmez; JSON/ZIP ve kaynak eşleşmesi Python biçimini korur.

API dayanakları: https://docs.micropython.org/en/latest/library/machine.Pin.html ve https://docs.micropython.org/en/latest/library/machine.ADC.html . API uyumluluğu belirtilen alt küme içindir. ADC 12-bit kuantizasyonu u16'ya ölçeklenir; 1.65V tipik 32776 sonucunu verir. Dahili ADC kanalları desteklenmez.

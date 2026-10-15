# CircuitForge 0.57 · STM32 MicroPython ve ADC1

STM32 yeni projede C17 / C++17 / MicroPython seçilebilir. Gerçek MicroPython WASM yorumlayıcısına STM32 Pin, ADC, SoftI2C, SoftSPI elektriksel devre adaptörü eklendi. 9 mevcut kart, main.py ve çok dosyalı .py; JSON/ZIP, kaynak eşleşmesi, trace/ölçüm ve ortak breadboard/net label/auto route alanı. Hazır çevre istasyonu SHT31 + MCP3008 + PB0 analog pot + buton/alarm LED + OLED + EEPROM. Python başlangıcı main.py içindedir; C başlangıç kaynakları uygulanmaz.

Bu yerel Cortex-M MicroPython firmware portu değildir. MCU SRAM/Flash/GC/CPU zamanlaması ve stm/pyb/UART/IRQ/PWM/USB/CAN API’leri Python modunda yoktur. Derle sözdizimi doğrular; ARM binary üretmez. C17/C++17 native ARM motoru korunur. Pin numaraları port*16+bit simülasyon indeksidir; PA0/A0 ve bağlanabilir başlık takma adları desteklenir. ADC read_u16 gerçek 12-bit DC örneğini ölçekler. Pause/restart yorumlayıcı ve sanal çevrebirim oturumunu baştan başlatır; bu yeniden başlatmada EEPROM kalıcılığı yoktur.

Native ADC1: regular DISCEN/DISCNUM 1–8 dönüşümlük bloklar ve rank devamı; injected JDISCEN bir tetikte bir rank, JEOC yalnız son rank; çelişkili modlar reddedilir. EXTI15/TIM2_CC1 injected tetik eşlemeleri. Gerçek PB8→PB15 kenarı, ADC sonucu ve native ISR seri çıktısı F103C6/F401RE/F411CE üzerinde kabul edildi. TIM2 eşlemesi aynı callback yolundadır; yeni dış hat kabulü EXTI15 içindir.

Genel 1303/1303, hata/iptal/atlanan 0; 372504.6529 ms; concurrency4. Önceki1279 üstüne14STM32Python+10ADC test. Son ayrıPython14/14 (13144.9317ms), Python+ESP18/18, ADC10/10 (6314.7217ms), ADC+RTC regresyon74/74 (78300.8164ms).

CUA tarayıcı Nucleo F411 / MicroPython: sözdizimi kabulü; PY ENV T=25.0 H=50.0 ADC=512 NATIVE=32776 ALARM=0; inspector ile37.1°C→PY ENV T=37.1 ALARM=1; OLED/RAM ve EEPROM yazımı testlerde gerçek I²C netleriyle doğrulandı. İlk yerel önizleme mjs MIME tipi yüzünden modül yükleyemedi; preview.mjs MIME düzeltildi ve tekrar kabul edildi. İlk EEPROM fixture zaman kontrolü ve D13 alias önceliği düzeltildi; başarısız denemeler başarı sayılmaz. Native ADC ilk fixture Nucleo PA2 kopuk VCP padini kullandı; PA4 ile düzeltildi.

TamSTM32 tamamlandı iddiası yoktur. USB/CAN, yerel ARM MicroPython/tam Cube HAL ve ileri timer/ADC/DMA/bus/RTC/Flash/MPU/clock-power başlıkları STM32_PLAN_0.57.md ve STM32-AUDIT.md içinde. Otomatik devam zamanlayıcısı kurulmadı.

Günlükler: .sites-runtime/full057-final.log, python057-final.log, python057-second.log, adc057-disc-final.log, adc057-regression.log. Günlükler yerel/ignored; bu rapor teslim ZIP içinde. Motor/Clang/MicroPython WASM/vendor dosyaları değiştirilmedi. Referanslar dist/notices/STM32-MICROPYTHON.md ve STM32-ADC-DISCONTINUOUS.md.

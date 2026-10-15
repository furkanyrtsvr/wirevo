# CircuitForge 0.46 kabul kaydı

13 Ekim2026, Windows / Clang22 C17 gerçek Cortex-M3/M4F.

## Otomatik doğrulama

- Genel `npm test`:805/805,0fail/skipped,121663.8544ms (`.sites-runtime/full046-final.log`). Tüm37I²C, öncekiSPI27, STM runtime/worker/ADC/USART/PWM/lab/wirelanes, AVR/ESP/DC/bus/ZIP/labels içerir. Sonrasındaki değişiklikler yalnız doküman/build cache listesidir.
- Son I²C hedefi37/37,0fail/skipped,46663.9747ms (`.sites-runtime/i2c46-final2.log`).
- I²C+lab ilk39/39,41887.0785ms (`.sites-runtime/i2c-labs46.log`); yeni hardwareI²C çevre ve Bluetooth lab yollarının altı kart kabulü.
- İlk temelI²C18/18,28753.5716ms; daha geniş31/31,40666.473ms; stuckSCL/reset/ITBUF sonra37'ye eklendi. Bunlar tarihsel adımlar, general805 yerine toplanmaz.
- npm run build:399 app-shell dosyası /19336954 bayt,20MiB altında; Clang ayrıcache.

Altı kart fizikselSHT31 C17: gerçek sensorCRC, canlı25→37°C, yanlış0x45adresAF/NACK, VIN kaldırma−1 ve geri bağlamaCRC toparlanması. Powerloss floatingbus olduğunda NACK üretilmesi zorunlu değildir: START serbesthat bekler/timeout; explicit yanlışadres testi ACK/NACK sayısını ayrıca doğrular. Bir/iki/üç/altı byte ACK/POS tail veSTOP, exactfirstbyte102/second102. SR2tekokumaADDRtemizlemez, SR1→SR2temizler; iki receive register/BTF fizikselSCL0 ve edges durması. PB8/PB9 remap alternatifi altı kart. GenuineARM EVIRQ31/ERIRQ32 ayrıNVICbanklar; AF W0C. F103C6/F411ITBUF gating veiki byte gerçekRXNEISR; stuckSCLstartstall/5mstimeout/release/recovery; RCCresetedgecancel ve unsupportedmode/DMA/AF error. Pin configduplicate/missing/F1remap, immutableproject/ZIP ve eski cf_bus softwarekaynakları korunur.

GPIObus master seviyeleri gerçekDCsolver'dan, sensorresponsecontrollerdirekt çağrısından değil. ODrelease/pull-up/boardGPIOvalidasyon. Timer/ADC/UART/STMsoftwareSPI veESP/AVR motorları fullregressionda kaldı. Gelişmişmodların tamamlandığı sonucunu çıkarma.

## Tarayıcı doğrulama

Ownedpreview4174 HTTP200/no-store. Eski sekme2 artık mevcut olmadığından browser2 reselect edilmedi; supportedCUA yeniQAsekmesi5 oluşturdu. CUA dışında browserautomation yok.

NucleoF401 çevre istasyonu yeni proje, PB7hardwareI2C1_SDA vePB6SCL, üretilen cf_i2c1_begin(100000,PB7,PB6); Uygula ile50kHz yapıldı. GerçekClang4920B firmware derlemesi; T2500/H5000/ADC512/NATIVE2048/LIMIT3000/ALARM0/OLED0. Canlı pinoutPB7I²C SDA3.30V. Numeric36.9fill→ArrowUp→Tab ile37 değeri kaydedildi; T3700/H5000/ADC512/NATIVE2048/LIMIT3000/ALARM1/OLED0 veLED5.91mA tarayıcıda görüldü; CircuitForge-0.46-Istasyon.png kaydedildi. YeniBluePillC6 projesinin I²C hızı100000 olarak kaldı, F40150k taşınmadı;4828B gerçekderleme/çalıştırma: T2500/H5000/ADC512/NATIVE2048/ALARM0/OLED0 sonucu görüldü. PinlerPNG kökte.

## Sınırlar

I²C1 legacy standard-mode7bit singlemaster. Fast/DMA/SMBus/PEC/slave/multi-master/arbitration/10bit/I²C2/3 veanalogrise-time/filter/capacitance/errata henüzmodel değil. HardwareHAL uyumluluğunun tamamı vephysicaldeviceBLE/RF/USB test edilmedi. APBclock pendingtransfer abort; exactfreeze/resume ileride. HAL API herçağrıdaSTOP, combinedrepeatedstartAPI sonraki kapı. YeniWeAct gerçekprofilleri veadvancedperipherals devamplanında.

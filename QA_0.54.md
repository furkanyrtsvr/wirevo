# CircuitForge 0.54 kabul · 14 Ekim 2026

Genel **1217/1217**, fail/cancelled/skipped0;609856.4086ms `.sites-runtime/full054-final.log`, concurrency4. Yeni68test: RTC unit11, firmware47, birleşiklab1, TIM2phase6 ve nativeclockphase3. Gerçek Clang, Cortex-M3/M4F ve elektriksel modeller kullanılır; fiziksel silikonun tamamı doğrulanmış değildir.

RTC F1 counter/PRL/CNT/ALR/DIV/CNF/RTOFF; F4 BCDcalendar/12-24hour/leap/weekday/SSR/shadow/INIT/WPR/ALRA/B/WU. Tüm9kart IRQ41, F1IRQ3, F4WKUPIRQ3. LSE/LSI/HSE üçkaynakla gerçekAPI1Hz kontrolü; F10316-bit/F432-bit backup/DBP/BDRST/RCCsourceimmutability. Watchdog reset data/bss/NVIC temizlerken RTC ve backup korunur. Tüm1200ay sonu bağımsız UTC Gregorian oracle'a eşittir. YanlışBCD/subsecond/WUTR0RTC/2modu reddedilir.

PWR DBP latch clockgate'de korunur; BDRST VOS değiştirmez; VOSPLLoffguard/ready. F4 startup PLL öncesi F401scale2/F411scale1 kurar. CanonicalADC1_2/ADC ve F103RTCAlarm handlerları gerçek vektörden çağrılır; eskiADC1_IRQHandler gerçekadc kesme testlerinde uyumludur.

TIM2 CEN/RCC pause/CNT write prescaler alt fazını tutar, UG sıfırlar. F1/F4ratio1/2 ve preload sınırıunit6; üçkartta gerçekWFICPUcycles ile RCCgate/CEN/CNTwrite3. Önceki capture/encoder/compare/PWMkapıları son hedef67/67ve genelde korunur. Son RTC/API/lab59/59,54327.2195ms; RTC/ADC/EXTI/DMA/phase hedef133/133,45132.2123ms.

Tarayıcı CUA/local4173: pin penceresi RTC LSE seçili ve cf_rtc_begin(1) kaynak önizlemesi. Birleşiklab gerçekClang5040B. T→RTC2024-2-28 23:59:58/BACKUP1; F→firmwarePRER31/1024tick/s; T→2024-2-29 00:01:27; R→IWDGRESET/BACKUPBOOTS2; T→2024-2-29 00:14:22/BACKUP2. ADC/B1/CRC temel devresi aynınetlabeltopolojisinde çalışır. Başlangıç1Hz, F yalnız test için gerçek prescaler değişimidir; hostJS sonuç yazmaz.

İlkunit iki beklenti hatalıydı: yılsonu fixture99e231Aralık değildi (99f231düzeltildi), gölgeokuma tekrarından önce saatbir saniye daha ilerlemişti. Model bugları ayrıca bulundu/düzeltildi: alarm-only F1config eskiCNTsnapshotrestorasyonuna yol açıyordu; MCUresetF4PSCfazını sıfırlıyordu ve INITtaslağını koruyordu; PWREN gatingDBP latch yanlışkapatıyordu. Son unit/genuine testler ve genel geçti. İlkfalseimportproject-archivepath project-import olarak düzeltildi; başarısız denemeler kabul sayılmaz.

Nativebridge0.9 M3 265276B/b0b95f39983df51982ef0e733ca82805fba4db055091e32f3b82702a87402b26; M4F707425B/caddbaaf72414339681741465933af52af4c3c123247fecd9737976c452d672b. Kaynak yeniden derlendi; vendor source0.53ile aynı,327/477Rust kapıları korunur. Sourcekeycf-stm32-0.13;9STM32/29toplam kart;C17. Tümkalan kapsam STM32-AUDIT/STM32_PLAN_0.54.md, RTCnotlarıSTM32-RTC-BACKUP.md. İleri timer/clock, C++/MicroPython, USB/CAN ve diğer açık başlıklar tamamlanmış gibi sunulmaz.

Build424dosya/19557150B<20MiB;Clang ayrı cache. Soncache7/7,199.9492ms. SonADCkomutu watchdogresetinden sonra da1024/3071 döndürdü. PNGparentCircuitForge-0.54-STM32.png.

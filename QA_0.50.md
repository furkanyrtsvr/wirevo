# CircuitForge 0.50 kabul kaydı · 14 Ekim 2026

## ADC ve ARM motor kapıları

Yeni ADC + ARM targeted: **28/28**,0 fail/skipped/cancelled,34254.9697ms; `.sites-runtime/core-adc50-last.log`.24ADC testi ve4ARM testi. Dokuz kart üç fiziksel voltaj/rank sırası; F1dizi-sonuEOC veF4her-kanalIRQ; üç temsilci16rankSQR3/2/1 sınırları/solhiza; continuous canlı25%voltaj/CONTclear/ADONcancel; F4OVR IRQ/clear/freshstart; EOCS0overwrite/32bit-write gate;12/10/8/6bitquantization/time; JSON/ZIP/Cinit; F4yerel16rank dizisiyle iki6argAPI çağrısı ve doğru30715sum.

EskiADC paketi27/27,37933.0803ms `.sites-runtime/adc50-existing.log`, ilk model genişlemesi sonrası; son genelpaket nihai otoritedir. İlk yeni12testin dörtNucleo fixture'ı ayrılmışPA2 padini kullanıyordu; gerçekkartprofili korunup fizikselPA4 kullanıldı. Son12/12. APIinit fixture'ındaki station.c CF_CS bağımlılığı minimal kabul kaynağına indirildi; kullanıcı kaynakları silinmedi.

Motor: STMIA T1 register mask R7'yi atlıyordu. Tarayıcıdaki üçlü lokalpinarray bozulmasıyla bulundu. Kaynakdecoder sekizbitmask ile düzeltildi; gerçekThumbstore/canary/writeback veRustdecode testleri. C kodu staticarray/startupdelay ile değiştirilmedi. M3 **327/327**,M4F **477/477** Rust,0fail/ignored/filtered. `.sites-runtime/core50-m3-tests.log`, `core50-m4-tests.log`. Bridge0.6/provenance/hash eşleşir:
- M3 256865B sha256:1f607b9d80e65080801c1c4842a5facdb44a127f6e9dd9e7852ed2d2d107067e
- M4F699080B sha256:b29a149ccb5b95bddf4d54fa75bc84b40718e0f43a24be83f5c341228facafc5

## Tarayıcı kabulü

CUA/local4174/no-store, freshmotorreload. WeActF411CE üçADCnetli proje gerçekClang2116B. Başlangıç12bitdiziBOOTLAST4095; devamındaGND0/POT2048/VDD4095. Pot75%→POT3071; fizikselDCpin voltajı2.475V. `../CircuitForge-0.50-ADC-Scan.png`.

Pinpenceresi ADC sürekli/8bit/sağ/dizi-sonu/sıraPA1,PB0,PA4 seçimi→Uygula gerçekcf_board_config.c begin_sequence(...,3,1,0,8,0). YenidenClang→BOOTLAST255; main.c açıkça12bite döner, sonrakiPOT3071/VDD4095. Reload sonrası mod/8bit/sıra korunur. Sağ ayarsütunu desktop'ta ayrı kayar; ADC seçenekleri görünürkenkart/pinlistesi kaybolmaz. `../CircuitForge-0.50-ADC-Pin-Panel.png`. Ayarlar projelocal/Uygulaöncesitaslak.

İlk tarayıcı koşusu yalnızBOOT4095üretip ikinci taramada durmuştu: genuine STMIA bug bulundu/düzeltildi ve sonra bu kabul geçti. Önceki genel982/982,406043.7355ms yeniR7regresyonu henüz içermiyordu; finalkoşu yeni motor ve testleriyle yeniden yapıldı.

## Sınırlar

ADC internal/injected/watchdog/external-trigger/DMA/analog acquisition/calibration/exactRCCfreeze yok. F1multi-rank polling yalnız sonDR; F4EOCS1araUARTblocking overrunüretebilir. TIMcapture/encoder/PSCaltfazı ve17auditbaşlığı kalanları STM32_PLAN_0.50.md içinde. YeniCPUalias/kart/dil eklenmedi;9STM/29toplam. 0.49SPI/USART/ITSTATE ve EEPROM yolları korunur.

Son genel paket: **986/986**,0 fail/cancelled/skipped,378559.8837ms; `.sites-runtime/full050-final.log`. Yeni R7 motoru ve4ARM/24ADC testini içerir.
Son build başarılı; `.sites-runtime/build050-release.log`: appshell403dosya/19418060bayt <20MiB. Backend sonrası değişiklikler yalnız docs/CSS; tarayıcı CSS kontrolü tamamlandı.

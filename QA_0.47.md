# CircuitForge 0.47 kabul kaydı

14 Ekim 2026, Windows, gerçek Clang C17 / Cortex-M3 ve M4F.

## Otomatik doğrulama

- Genel npm test: 908/908,0fail/skipped,253121.7834ms (.sites-runtime/full047-first.log). Yeni9kart USART/ADC/PWM/SPI/I²C/runtime/worker/lab/routing, AVR/ESP/DC/bus/ZIP/labels regresyonu dahil. Sonraki değişiklikler yalnız UI/doküman, ek F401 negatif AF test assertionları ve build cache listesidir.
- WeAct son7/7,0fail/skipped,4086.2122ms (.sites-runtime/weact47-final.log): 25MHz PLL, kart belleği, Flash/SRAM overflow, firmware target, PC13 activeLOW, PA0KEY/pullup, PB2pulldown, resetten sonra haricî KEY, F411 PA15/PB3 USART1 fiziksel Bluetooth ve F401 bu AFleri sunmaz.
- TIM2 22/22,32366.8931ms (.sites-runtime/timer47.log): tüm9kart PWM/updateIRQ veF103C6/NucleoF401/WeActF411 CR1 tekrar yazımı,CEN pause/resume CNT/PWM tutma. Prescaler altfazı henüz cycle-accurate değil.
- Routing + netlabel 32/32,1286.695ms (.sites-runtime/routes47.log):9×2 laboratuvar interior overlap0/kartgövdesi/neteşdeğerliği. İlk222testte6routing başarısızlığı yeniBlackPill kesirli pad geometrisindeydi; overlap maliyeti düzeltildi, testler gevşetilmedi. Sonfull908 geçti.
- Native WASM motorları 0.46 ile aynı; yeni gerçek board/PLL/USART/KEY profilleri compiler/runtime tarafında.

## Tarayıcı

Ownedpreview4174 HTTP200/no-store, supportedCUA sekme6. F401CC çevre projesi4748B gerçekC derlemesi:USART1terminal115226baud, T2500/H5000/ADC512/NATIVE2048/LIMIT3000/ALARM0/OLED0. CanlıSHT31 37°C değişiminde T3700/ALARM1/OLED0. 40pads/28GPIO,256KiBFlash/64KiBSRAM,84MHz; pinwindow özgünkartart ve üreticisource, hardwareI²C/SPI/PWM/ADC görevleri. PNGparent CircuitForge-0.47-WeAct-Istasyon.png veWeAct-Pinler.png.

F411CE kontrolprojesi2440B gerçekC firmware,100MHz/512KiBFlash/128KiBSRAM; UART Bluetooth tarayıcı kontrolü aşağıdaki final kayıtta. STM32 kapsam penceresi17altbaşlık ve eksikleri gösterir; genişdialog/wrapping ile sağsütun kesilmesi düzeltildi. Pencere açılınca scroll sıfırlanır.

## Kapsam

Tüm STM32 tamamlandı denmez. dist/notices/STM32-AUDIT.md veSTM32-WEACT.md güncel17altbaşlık/board/research/sınırlar. STM32 C++/MicroPython, tamCubeHAL,DMA/RTC/EXTI/USB/CAN/ETH/ileriADC/TIM/USART/SPI/I²C/clock/debug/güç henüz eksik. FizikselBLE/RF ve gerçekkart karşılaştırması yapılmadı.

Son F411 tarayıcı kabulü: sanal bilgisayar bağlandı, A komutuna ADC=512 ve L1 komutuna LED=1 gerçek firmware yanıtı. Bluetooth PNGparent. Kapsam tablosu17satır/1052px clientWidth=scrollWidth, yataytaşma0; STM32-Kapsam PNGparent. Genel testlerden sonra simülasyon backend değişmedi. Son build app-shell403dosya/19399389bayt (20MiB altında); Clang ayrıcache.

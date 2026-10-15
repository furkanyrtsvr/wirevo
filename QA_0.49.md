# CircuitForge 0.49 kabul kaydı · 14 Ekim 2026

## Son sonuç

Genel Node paketi: **960/960**,0 fail/cancelled/skipped,405701.1054ms; `.sites-runtime/full049-final.log`. Gerçek AVR/ESP/STM firmware, GPIO/DC/bus/net label/routing, worker ve JSON/ZIP testleri dahildir. İlk 0.49 koşusu958/957: Nucleo F411 Bluetooth ADC komutu başarısızdı; ARM ITSTATE düzeltmesi sonrası özgün test değişmeden geçti. Ek native SysTick/SVC testleriyle son toplam960.

Native Rust M3 **326/326**, M4F **476/476**,0 fail/ignored/filtered; `.sites-runtime/core49-m3-final.log` ve `core49-m4-final.log`. İlk koşudaki eski stack/NVIC fixture beklentileri ARM frame ve önceki ICER/ICPR read mirror davranışıyla eşitlendi; ayrıntı STM32-ITSTATE.md. Yeni beş IT frame durumu ve gerçek Thumb IRQ/SVC testi vardır. Testler startup gecikmesi veya yeniden deneme ile maskelenmedi.

Build başarılı, `.sites-runtime/build049-final.log`: appshell403dosya/19411161bayt <20MiB; Clang ayrıcache. Son nativehash:
- cortex-m3.wasm256865B:70bd5822fa72f9fb1abf3e4024cc891e5da7406b66f2c21f46fd849f77d68991
- cortex-m4f.wasm699080B:a1f694d1d895496c044ac258c95b99beb4000fee31b80921125bd7c3ab3f2482

## SPI / USART

Dokuz kart ×16 SPI mode/word/order birleşimi: gerçek Clang, fiziksel MOSI→MISO neti ve bağımsız SCK/MOSI capture edge doğrulaması. F103C6/NucleoF401/WeActF41116bit mode3LSB IRQ35/OVR ve SPE0format değişimi. Üretilmiş başlangıç C kodu + ZIP ayar kalıcılığı.

USART1 dokuz kart, USART2 altı Blue Pill/WeAct:7E/O,8N/E/O,9N ×1/2stop, fiziksel TX→RX ve9bit payload422. Parity mismatch/PEIE ve gerçekIRQ38; invalidCR2 değiştirmeden reddedilir. Nucleo3kart SB62/63OFF fizikselPA2/3 reddi/VCPbyte kabulü. Eski AVR/ESP9bit unsupported profili korunur.

## Tarayıcı

CUA, local4174/no-store, gerçek uygulama kontrolleri:
- 0.48 eksik EEPROM kabulü tamamlandı:BluePillF103C6 environment5516B;T2500/H5000/ADC512/NATIVE2048/ALARM0/MEM0;37°C değişimiALARM1/MEM0;MCUreset/resume EEPROM LAST T3700/H5000/ALARM1. `../CircuitForge-0.49-EEPROM-Reset.png` önceki0.48badge taşıyan bu devralınmış kabulün kanıtıdır.
- 0.49 yeni motor reload:WeActF411 SPI316LSB veUSART296009N2,2032B firmware;`SPI16=37738 UART9=422 DONE`, terminalde fazladan UART2 byte yok. `../CircuitForge-0.49-SPI16-UART9.png`.
- STM32 Pinler seçiliSPI mode3/16/LSB,UART29N2 ve gerçek390.625kHz preview; yalnız bu projeye özel. `../CircuitForge-0.49-Pin-Formats.png`.
- NucleoF411 controller2704B gerçek Clang; sanalPC connect/L1/A →CONTROLREADY/LED1/ADC512, serial boot yalnızbirkez. `../CircuitForge-0.49-Nucleo-Bluetooth.png`. Gerçek bilgisayar BLE seçici çağrılmadı; sanal ağ kabulüdür.

## Sınırlar

STM32-AUDIT.md17başlık açık kalanları saklar. ADC tekexternal12bit, TIM2 PWM1, SPIhardwareNSS/slave/DMA, ileriUSART, I²CFast/slave/arbitration, C++/MicroPython/diğeraileler henüz tamamlanmış değildir. Yeni29kart iddiası yok: mevcut9STM/29toplam korunur. Release0.49 ve STM32_PLAN_0.49.md günceldir.

İkinci iki-file-concurrency koşusu, ilk koşunun gecikmesi sırasında başlatıldı; ilk960/960 tamamlandığı için gereksiz koşu durduruldu. Bir tamamlanmamış koşu başarı olarak sayılmaz. Aynı kod üzerinde tekrar gereksiz test genişletilmedi.

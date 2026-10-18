# Tiva C · TM4C123G LaunchPad · C17 işlevsel profil

Hedef: EK-TM4C123GXL Rev B, TM4C123GH6PM, Cortex-M4F. Flash 256 KiB, adres0; SRAM32 KiB, adres0x20000000. Başlangıç saati16 MHz, nominal40/80 MHz PLL yapılandırmaları desteklenir. Yalnız `main.c` ve ek `.c`/`.h` dosyaları; Arduino, C++ ve MicroPython bu kartta seçilemez. SDK adı ayrılmış dosyalar kullanıcı kaynaklarıyla değiştirilemez.

## Kart ve görünüm

Özgün kırmızı PCB SVG’si [kullanıcının verdiği Robiz fotoğrafı](https://robiz.net/ektm4c123gxl) referans alınarak çizildi; fotoğraf projeye dağıtılmadı. J1/J2/J3/J4 pinleri, SW1=PF4, SW2=PF0, RGB=PF1/PF2/PF3, iki USB bağlantısı ve reset yerleşimi [TI SPMU296](https://www.ti.com/lit/ug/spmu296/spmu296.pdf) ile eşlendi. 40 header padinden35’i GPIO’dur. PF0/PD7 kilit/commit modeli vardır; CF HAL gerektiğinde açar. R9/R10 varsayılan PB6–PD0/PB7–PD1 kısa bağlantıları elektriksel ağda korunur; çelişen çıkışlar yok sayılmaz.

## Çalışan yollar

- Ayrı Tiva WASM bridge ve MMIO: ortak Zmu ARM komut motoru kullanılır ama STM32 çevrebirimlerine alias verilmez. Gerçek C17/Clang ARM Thumb firmware, reset/startup/data/bss, NVIC, WFI, SysTick/DWT ve M4F komut altyapısı.
- GPIO A–F: clock gating, masked DATA adresleri, DIR/DEN, analog/AF ayrımı, açık-drenaj/pull-up/pull-down, LOCK/CR, APB/AHB seçimi; GPIO edge/level bayrakları ve NVIC istekleri. Gerçek elektriksel devre, header kablolama, RGB direnç/LED akımı; özellik panelinden bağımsız SW1/SW2.
- UART0 terminal 8N1, IBRD/FBRD, TX/RX, giriş kuyruğu ve RX IRQ. ICDI VCP bir terminal bağlantısıdır; gerçek USB debug/ICDI emülasyonu değildir. Fiziksel UART dalga şekli/parity/diğer UART instance’ları bu profilde yoktur.
- GPTM0–5 Timer A32-bit one-shot/periodic, load/value, timeout clear/mask ve NVIC. Split/B/capture ve motion-control PWM yoktur. Timer0A IRQ19 gerçek Thumb handler ile doğrulandı.
- ADC0/1 processor-trigger sequencer FIFO, 12-bit haricî analog giriş, tamamlanma/mask/clear, sınırlı FIFO/overflow. SS3/PE3 potansiyometre örneği elektriksel voltajdan okunur. Sıcaklık/diferansiyel giriş açık hata verir. Analog gürültü/kalibrasyon ve tüm trigger zamanlamaları modellenmez.
- GPIO ile yazılan yazılım bus’ları ortak sensör devre altyapısından yararlanabilir; donanım SSI/I²C/DMA/CAN/USB/hibernation çevrebirimleri bu sürümde yoktur. Bunlar varmış gibi sıfır-zamanlı yüksek seviye sonuç üretilmez.

## Otomatik kütüphane / SDK

`cf_hal.h`, temel `stdint.h/stdbool.h/stddef.h/stdio.h`, `tm4c123gh6pm.h`, `inc/hw_memmap.h`, `inc/hw_types.h`, `inc/hw_gpio.h` ve `driverlib/{sysctl,gpio,pin_map,uart,interrupt,timer,adc}.h` otomatik sanal dosyalardır. Include’lar derleme kaydında ve Kütüphaneler panelinde listelenir; gereken kod linker ile eklenir. API listesi `dist/tiva-sdk.js` içindedir. Standart temel puts/printf desteklenir; tam libc veya tüm formatlar değildir. GPIO PA0/PA1 UART pin-map sabitleri sağlanır.

Bu başlıklar Wirevo’nun özgün ve sınırlı kaynak-uyumluluk katmanıdır; **tam TI TivaWare paketi veya ROM driverlib değildir**. Desteklenmeyen başlık/fonksiyon derlemede hata verir. Derleyici WASM tarayıcıda çalışır; ilk Clang indirmesi mevcut22,6 MB cache’i kullanır. Kaynaklar sunucuya gönderilmez.

## Örnekler ve kanıt

RGB/UART, iki buton, Timer0A IRQ ve PE3 ADC hazır örnekleri. Firmware header/checksum/vektör denetimi, C-only JSON/ZIP, kaynak değişince firmware geçersizleştirme, yeni worker trace/ölçüm/reset yolları. Dışa aktarılan firmware.bin ham Flash içeriğidir; JSON/ZIP Tiva hedef başlığını korur.

Yalnız yeni `npm run test:tiva` kabulü; STM32 ve eski regresyonlar çalıştırılmaz. Bu bir işlevsel simülatör profilidir; tüm TM4C silikonu veya fiziksel çevrim doğruluğu iddia edilmez. Kanıt/ekran görüntüsü [0.70 sürüm kaydında](../../docs/RELEASE_0.70.md).

Kaynak: [TM4C123GH6PM datasheet](https://www.ti.com/lit/ds/symlink/tm4c123gh6pm.pdf). Lisans/provenance: [motor lisansları](TIVA-LICENSES.txt), `tiva/provenance.json`, `src/tiva/Cargo.lock`.

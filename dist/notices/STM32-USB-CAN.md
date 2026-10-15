> Güncel 0.59: F401/F411 [OTG FS device modeli](./STM32-OTG-FS.md) eklendi. Aşağıdaki 0.58 notları tarihsel kapsamdır.

# STM32F103 USB FS ve bxCAN · 0.58

F103C6/C8/CB ve NUCLEO-F103RB: gerçek ARM C17/C++17 firmware MMIO erişimleri ve NVIC kesmeleriyle çalışır. Projeler → Temel kontrol örnekleri altında **F103 · CAN loopback / IRQ** ve **F103 · USB aygıtı / bulk echo** bulunur. USB örneğini derle/başlat, ardından üst menü **Sanal USB host → USB reset + aygıtı tanı → Bulk OUT → IN**. Türkçe UTF-8 veri ve 64 bayttan uzun metin paketlere bölünür. Bu pencere açık simülasyon oturumuna aittir; proje veya tarayıcı genel USB ayarı saklamaz. Her yeni oturumda yeniden tanıtılır. Duraklatılmış oturumda host komutu, firmware’in kesmeyi işlemesi için 10000 ARM adımı ilerletir.

## CAN

APB1 bit25 clock/reset; MCR/INAK/SLAK, BTR; üç TX mailbox; standard/extended ID ve RTR; DLC0..8; 14 bank 16/32-bit mask/list filtre; FIFO0/1, üç giriş, release/full/overrun, kilitli/overwrite davranışı. IRQ19 TX, IRQ20 RX0, IRQ21 RX1, IRQ22 SCE gerçek ARM handler’larına gider. RQCP ve hata bayrakları firmware tarafından temizlenir. Örnek 500 kbit/s BTR (APB1 36 MHz), üç paket, ID0x321, filtre ve seri kabul sonucu üretir.

**Dahili loopback** veri yolu kanıtıdır; harici CAN bus/transceiver değildir. Normal mod yalnız NART ile sınırlı ACK hatası üretir; karşı düğüm olmadığı halde başarılı ACK/RX uydurulmaz. Otomatik retransmission açık normal mod hata verir. Fiziksel CANH/CANL, çok düğümlü arbitration/ACK/error frame, bit stuffing, hassas sample point/senkronizasyon, otomatik bus-off recovery ve zaman damgası modellenmedi. Gönderim gecikmesi nominal işlevsel zaman modelidir; aynı anda üç mailbox için fiziksel bus öncelik/zaman doğruluğu iddia edilmez.

## USB

F103 USB FS device controller, EP0 control + tek tampon bulk endpoint. PMA512 mantıksal bayt, sparse16-bit bellek, BTABLE, RX kapasite kodlaması, EPnR toggle/W0C, CTR/RESET IRQ20, CNTR/DADDR, RCC clock/reset ve 48MHz denetimi. Host SETUP/OUT paketini PMA’ya yazar; firmware ISR okur ve cevap baytlarını PMA’ya koyar. IN firmware tamponunu tüketir. Descriptor, adres ve echo host tarafından üretilmez. Hazır vendor-class aygıt: VID0xDEAD/PID0xBEEF yalnız sanal laboratuvar kimliği, EP0 64B ve EP1 IN/OUT 64B; CDC/HID sürücüsü değildir.

Kabul: ilk8/tam18 bayt device descriptor, configuration9/32 bayt, SET_ADDRESS durum paketi sonrası adres değişimi, SET_CONFIGURATION, bulk0/1/7/64 bayt ve çok paket, yanlış adres, NAK/backpressure, STALL ve sonraki SETUP ile toparlanma, bus reset, clock/mask/reset, C++ C-linkage. PMA kapasitesi/adres sınırı hataları açık bildirilir. Fiziksel USB sinyal katmanı/PC aygıt erişimi, host/OTG, USB CDC/HID/MIDI class stack, çift tampon/isochronous, SOF/suspend/resume ve gerçek USB bandwidth/timing yok. Sanal hostun descriptor configuration okuması tek paket9..64B örneğiyle sınırlı; genel USB stack değildir. Endpoint yazılımı ana kaynakta düzenlenebilir.

F103 **USB ve CAN aynı512B SRAM’i paylaşır ve birlikte kullanılamaz**. RCC’te ikisini açma açık hata verir; pin remap bu kısıtı kaldırmaz.

## Kart farkı

F401/F411 üzerinde bxCAN denetleyicisi bulunmaz; CAN MMIO erişimi destek varmış gibi davranmaz. Bu kartların USB OTG FS register/FIFO mimarisi F103 PMA’dan farklıdır ve 0.58’de henüz modellenmedi. F411 mevcut100MHz başlangıcındaki PLLQ7 USB’ye48MHz vermez; gelecekteki OTG kabulünde96MHz/48MHz gibi geçerli clock planı ve runtime zaman tabanı birlikte ele alınmalı. Nucleo ST-LINK VCP hedef MCU’nun USB denetleyicisi değildir. MicroPython modu için USB/CAN API eklenmedi.

## Kaynaklar

- [ST RM0008](https://www.st.com/resource/en/reference_manual/cd00171190.pdf): USB/PMA, bxCAN/register ve shared IRQ.
- [STM32F103C6 datasheet](https://www.st.com/resource/en/datasheet/stm32f103c6.pdf): düşük yoğunluk CAN/USB varlığı.
- [ST AN4879](https://www.st.com/resource/en/application_note/DM00296349-.pdf), Table5 footnote3: F102/F103 USB/CAN SRAM paylaşımı.
- [ST F1 LL USB kaynak](https://github.com/STMicroelectronics/stm32f1xx-hal-driver/blob/master/Src/stm32f1xx_ll_usb.c): PMA sparse kopya ve endpoint düzeni (bağımsız model doğrulama kaynağı; HAL kopyalanmadı).
- [ST F401 CMSIS](https://github.com/STMicroelectronics/cmsis-device-f4/blob/master/Include/stm32f401xe.h), [F411 CMSIS](https://github.com/STMicroelectronics/cmsis-device-f4/blob/master/Include/stm32f411xe.h): CAN yokluğu/OTG FS farkı.

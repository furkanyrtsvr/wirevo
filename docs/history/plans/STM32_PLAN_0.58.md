# STM32 0.58 devam planı

F103 USB FS / bxCAN native register ve IRQ kabulü tamamlandı. Önce RELEASE_0.58.md / QA_0.58.md ve dist/notices/STM32-USB-CAN.md okunur. Dört F103 kartı: CAN loopback3mailbox,14filtre,2FIFO,IRQ19–22; USB PMA512B/EP0/vendor bulk echo/IRQ20/sanal host. C17/C++17 örnekleri Projeler → Temel kontrol örnekleri. Fiziksel CAN bus/USB PC erişimi yok. USB/CAN SRAM paylaşımı nedeniyle eşzamanlı RCC enable reddedilir. MicroPython WASM devre modu korunur; yerel ARM portu değildir.

Sonraki USB işi: F401/F411 OTG FS farklı register/FIFO/IRQ67 modeli; gerçek48MHz saat, F411100MHz→geçerli USB PLL planı ile runtime/USART/timer zaman tabanını birlikte çöz. F103 adres alanını F4’e aliaslama. Native EP0/EP1 firmware ve host acceptance ile doğrula. Sanal host/class stack ile fiziksel PC USB erişimini ayır.

Sonraki CAN: fiziksel transceiver ve çok düğümlü bus/arbitration/ACK/error/retransmit/bus-off; mevcut NART normal mod kasıtlı no-ACK hatası verir. Önce elektriksel model/scope ve test planı; başarılı paket uydurma.

Diğer kapsam açık: yerel ARM MicroPython/tam Cube HAL, diğer TIM/filter/remap/TRGO/dead-time, dahili ADC/acquisition/calibration, DMA FIFO/burst/DBM/PFLOW/I2C, ileri USART/SPI/I2C/RTC/Flash/MPU/clock-power. F401/F411’de CAN yok; her çipte tüm periferikler var sayılmaz. “Tüm STM32 bitti” denmez. Şu anki çalışan uygulama kapsamı ile tüm silikonu ayrı tut.

Otomatik devam zamanlayıcısı kullanıcı isteğiyle silinmişti; yeniden kurulmaz. İş akışı: mevcut Sites kimliği/audience korunur, source helper ile source aç → değişiklik → test/build/CUA → exact pushed SHA arşivi → saved version/deploy → tam proje ZIP ve devir.

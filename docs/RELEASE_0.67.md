# Wirevo 0.67 — STM32 boot protokolleri ve zamanlama tutarlılığı

Yalnız mevcut dokuz F103/F401/F411 kartı değiştirildi. Yeni kart ailesine geçilmedi. Önceki testler çalıştırılmaz; bu sürümün kapısı yalnız `npm run test:stm32-067` ve `tests/stm32-v067-*.test.mjs` dosyalarıdır.

## Uygulanan davranışlar

- F401/F411 system-memory modunda işlevsel AN3156/DfuSe: USB enumeration, 2048 bayta kadar DNLOAD/UPLOAD, GETSTATUS/GETSTATE, CLRSTATUS/ABORT, adres işaretçisi, sektör/mass erase, Flash/RAM yazma-okuma, option-byte okuma/yazma ve reset, RDP/read-unprotect, uygulama vektörüne geçiş. Komut ancak GETSTATUS işleminin status aşamasında yürür; geçersiz adres, koruma ve sıra hatası gerçek DFU hata durumuna geçer. WRP sektörünü yazma/silme AN3156 gereği etkisizdir. Orijinal ST ROM binary’si yürütülmez.
- F103C6/C8/CB/RB fabrika ROM’unda USB DFU **yoktur**; bu modellere sahte DFU eklenmedi. Hepsinde işlevsel AN3155 USART boot servisi; binary `queueBootBytes`, GET/ID, READ/WRITE/GO, normal/extended erase, WRP/unprotect ve RDP/unprotect. F401CC ID=0x423, F401CE/RE=0x433, F411=0x431. F1/F4 sürüm ve komut hizmeti bir uyumluluk modelidir; her ROM revizyonunun aynı komut tablosunu sunduğu iddia edilmez.
- USB paneli BOOT/reset seçimi ve hex USART baytlarını sunar. Ham ARM `.bin` DFU yüklemesi önce adres sınırını kontrol eder, sonra kullanıcı Flash’ını siler/yazar ve **USB UPLOAD üzerinden geri okur**. Kısa son blok için adres işaretçisi her blokta yeniden ayarlanır; 2049/4097 bayt kabulü vardır. USB worker token sınırı ISO için1023 bayta çıkarıldı; control SETUP8, boot USART4096 baytla sınırlıdır.
- F103 PMA bulk double-buffer: DTOG/SW_BUF, iki gerçek PMA alanı, tampon çatışmasında NAK ve yüksek öncelikli IRQ19; ISO çift tampon, DATA0 ve el sıkışmasız aktarım, PMA kapasite sınırı ve SOF/FNR. ISO API sonucu `ISO`’dur; sahte ACK üretilmez.
- F103/F4 USB: DATA0/DATA1, duplicate OUT’un yeniden teslim edilmemesi, kayıp IN ACK’de FIFO/sayaçların korunması, CRC/PID hata girdileri. F4 host DPID/toggle ve DTERR; device global IN/OUT NAK ve etkinlik bayrakları, SOF/DSTS. Hata girdileri sayısal token modelidir; analog USB PHY değildir.
- I²C 10-bit master ADD10/ADDR, iki adres baytı ve repeated-start read, karşı slave’in gerçek bit örneklemesiyle; SMBus ENARP/default0x61/Host Notify0x08, SR2 SMBDEFAULT/SMBHOST/GENCALL/DUALF, ALERT açık-drenaj/IRQ, NOSTRETCH ve F4 DNF dijital filtre. ARP komut paketleri/adres atama ve smartcard tekrar gönderimi firmware’in görevidir. F1/F4’te otomatik smartcard retry motoru bulunmaz; önceki eksik listesindeki bu beklenti düzeltilmiştir.
- CAN çerçeve süresindeki yüzde20 tahmini kaldırıldı. Standard/extended, data/remote, CRC-15, gerçek bit stuffing, delimiter/ACK/EOF/intermission uzunluğu hesaplanır. Remote frame DLC’si payload süresi oluşturmaz. Bu, tüm hata/arbitration dalga şekillerinin bit seviyesinde emülasyonu değildir.

## Native ARM zamanlamasında düzeltmeler

- Flash fetch beklemesi DWT ve SysTick’i de ilerletir; BSY sırasında yeni erase başlatılamaz.
- SysTick CLKSOURCE=0 için STM32 HCLK/8 bölücü fazı korunur; büyük beklemeler O(1) hesaplanır. HCLK kaynağı, COUNTFLAG okuma ve CVR yazma etkileri ayrıdır.
- Native DMA okuma/yazma beat’leri HCLK zamanını tüketir; FIFO tek uç işlemi1, doğrudan read+write2 çevrimlik nominal bus modelidir. Sıfır-zamanlı DMA kaldırıldı; bu, gerçek AHB bus-matrix arbitration modeli değildir.
- Asenkron exception girişi12, temel BX EXC_RETURN12 çevrimlik sıfır-wait-state modelinde sayaçlara işlenir. Bunlar M3/M4 pipeline, tail-chaining/late-arrival/FPU lazy stacking ve Flash accelerator davranışının tam çevrim doğruluğu anlamına gelmez.

## Kanıt ve açık kalanlar

Yeni dört kabul dosyası native M3/M4F sayaçlarını, Flash/RAM/koruma ve gerçek Thumb GO’yu, dokuz kartın binary USART/worker yolunu, F4 DFU panel yüklemesini; register/bit-model düzeyinde USB/I²C/CAN varyantlarını doğrular. Bunlar gerçek donanım ölçümü veya eski regresyonların yeniden geçtiği kanıtı değildir. M3/M4F kaynak derlemesi ve browser build ayrıca kontrol edilir.

**STM32’nin tüm fiziksel silikonuyla eşdeğer olduğu veya tüm işlerin bittiği ilan edilmiyor.** Orijinal ST ROM içeriği sağlanmadı/çalıştırılmadı; boot servisi işlevsel protokol modelidir. Çekirdeğin tüm fault/priority/pipeline ve bus arbitration çevrimleri, I²S full-duplex extension/tüm stereo kombinasyonları, bütün advanced-timer COM/preload/lock ayrıntıları ve USB/CAN’ın tüm hata-zamanlama kombinasyonları henüz kapanmış değildir. Analog güç/PHY/transceiver karakterizasyonu da yoktur. Bu açıklar başka kartlara geçmek için “kapsam dışı” denilerek kapatılmaz.

Kaynaklar: [AN3156 DFU](https://www.st.com/resource/en/application_note/an3156-how-to-use-usb-dfu-protocol-in-bootloader-on-stm32-mcus-stmicroelectronics.pdf), [AN2606 boot yetenekleri](https://www.st.com/resource/en/application_note/an2606-stm32microcontroller-system-memory-boot-mode-stmicroelectronics.pdf), [AN3155 USART](https://www.st.com/resource/en/application_note/cd00264342-usart-protocol-used-in-the-stm32-bootloader-stmicroelectronics.pdf), [RM0008 PMA/ISO](https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [RM0383](https://www.st.com/resource/en/reference_manual/rm0383-stm32f411xce-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [AN4800 smartcard donanım/firmware ayrımı](https://www.st.com/resource/en/application_note/dm00255231-smartcard-interface-based-on-stm32cube-firmware-stmicroelectronics.pdf).

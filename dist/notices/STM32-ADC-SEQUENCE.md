# STM32 ADC1 regular tarama ve sürekli dönüşüm · 0.50

Dokuz mevcut STM32 kartında ADC1 regular grubu: SCAN, SQR1/2/3 ile1..16rank, CONT, sağ/sol hizalama, yazılım SWSTART ve gerçek DC pin voltajı. F10312bit; F401/F411 RES ile12/10/8/6bit ve buna bağlı dönüşüm süresi. F1 SCAN kapalıyken SQR1 uzunluğu dikkate alınmaz ve ilk rank kullanılır. Aynı kanal bir dizide tekrar edebilir. Her kanalda SMPR sampling süresi ve APB/ADC prescaler kullanılır.

F103 EOC/IRQ18 tarama dizisinin sonunda oluşur; DR yalnız son rankı taşır. Ara rank DR yazımları gerçekleşir, fakat DMA yoktur. F4 EOCS0 dizi sonunda, EOCS1 her rankta EOC üretir. EOCS1 okunmamış EOC varken yeni sonuç geldiğinde OVR set olur, OVRIE ile IRQ18 üretilebilir ve regular akış durur. SR rc_w0 ile OVR temizlendikten sonra yeni SWSTART gerekir. EOCS0 veDMAkapalı durumda OVR denetimi yoktur; DR son ölçümle değişebilir. DR okumak EOC'yi temizler, OVR'yi temizlemez. Yeni SWSTART okunmamış EOC'yi gizlice temizlemez.

CONT1 son ranktan sonra ilk rankı yeniden başlatır. CONT0 yapmak devam eden diziyi bitirir; ADON0 mevcut dönüşümü iptal eder. Başlıkta olmayan/internal kanal, injected/watchdog/discontinuous/external-trigger/DMA ve common internal/multi-ADC seçimleri açık hata verir. Register yazıları32bit/hizalı; byte/halfword/word okuma desteklenir. Busy SWSTART mevcut diziyi yeniden başlatmaz.

## C API

```c
int cf_adc_begin_sequence(const unsigned *pins, unsigned count,
    unsigned continuous, unsigned each, unsigned bits, unsigned left);
int cf_adc_ready(void);
int cf_adc_result(void);
void cf_adc_stop(void);
```

begin_sequence tüm parametre/pinleri değişiklikten önce doğrular. count1..16; continuous/each/left0 veya1. F1bits12; F4bits12/10/8/6. F1 çok kanallı dizide each1 reddedilir. Başarı0,geçersiz−1. Önce eskiADC durur, seçiliGPIOanalog yapılır; rank sırası/sample maksimum süre kurulup SR temizlenir ve yeni dizi başlar. Bu API IRQ enable yapmaz; ISR kullanan kod EOCIE/OVRIE/NVIC'yi kendisi ayarlar. result boşta−1,OVR−2; başarı sağ/sol hizalı ham DR0..65535. stopADON0 yapar, eskiDR/status kendiliğinden silinmez. Eski cf_adc_read(pin) tek12bit/sağ dönüşüm olarak korunur ve önceki tarama ayarlarını yeniden yapılandırır.

Örnek F4 polling: üç rank için each1 kullan, her EOC'de sonucu bir diziye koy, tüm ranklar okunduktan sonra UART yaz. ADC hızlıyken her rank arasında blocking UART yazmak overrun üretebilir. F103 taramada polling yalnız son sonucu verir; tüm ranklar için DMA modeli henüz yoktur.

## Pin penceresi / proje

Tek kanal hazırlığı eski davranış: analog GPIO/ADC kurulur, dönüşüm main.c ile başlar. Tarama/tek dizi ve tarama/sürekli seçimi main öncesinde begin_sequence üretir. Kanal sırası alanı virgülle PA1,PB0,PA4 gibi; boşsa seçili ADC pinleri port/pin numarası sırasıyla kullanılır. Max16rank; tekrar mümkündür. Seçilmeyen ADC pini veya F1çok kanallıher-kanalEOC reddedilir. Ayarlar yalnız projedeJSON/ZIP ile saklanır; Uygula öncesi taslak. main.c sonradan yeniden yapılandırabilir. C++/MicroPython bu STM32 kapsamına eklenmedi.

## Model sınırları

İdeal VREF3.3V ve yuvarlanan quantization; fiziksel netten conversion başlangıcında alınan voltaj saklanır. Analog acquisition/kaynak empedansı/noise/ADC calibration/startup delay/tolerance modellenmez. Internal temperature/VREF/VBAT, analog watchdog, injected/external trigger/DMA ve başka ADC/DAC henüz yok. RCC clock kesilmesi pending dönüşümü iptal eder; exact freeze/clock değişimi alt-fazı tamamlanmış değildir. F4OVR akışında son gelen DR değeri saklanır; bu motor bütün silicon errata davranışını kapsamaz.

Kaynaklar: [ST RM0368](https://www.st.com/resource/en/reference_manual/DM00096844.pdf) §11.3.5/11.3.8/11.7/11.8.2–3 ve ADC registerler; [ST F1 HAL ADC kaynağı](https://github.com/STMicroelectronics/stm32f1xx-hal-driver/blob/master/Src/stm32f1xx_hal_adc.c), sequencer/EOC aile notları. RM0008 tamPDF araç boyut sınırına takıldı; yeni F1 EOC doğrulaması resmi ST driver kaynağından yapıldı. [Tüm kalan STM32 ayrıntıları](STM32-AUDIT.md).

Tarayıcıdaki üç kanallı örnekte ortaya çıkan ARM STMIA T1 R7 hatası da motor kaynağında giderildi; [motor ayrıntısı](STM32-ITSTATE.md). C kodunu static diziye taşıyarak hata gizlenmedi.

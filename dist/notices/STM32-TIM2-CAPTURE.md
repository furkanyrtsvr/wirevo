# STM32 TIM2 giriş yakalama · 0.51

TIM2 CH1..4 register modeli, karta açık PA0..PA3 pinleriyle direct TI ve eşlenik indirect TI (1↔2,3↔4) yakalama. F1 normal GPIO input; F4 AF1 input. Fiziksel DC netinin0–0.99V LOW /2.31V veüstü HIGH geçişi kullanılır; belirsiz/boşta giriş yeni kenar üretmez. Yanlış GPIO/AF veya ayrılmış board pininde yakalama yoktur. F1 rising/falling, F4 rising/falling/both-edge. ICPSC /1,/2,/4,/8; ICxF=0. TRC/digital filter/encoder/slave-external clock/masterTRGO/DMA/diğerEGReventler açık hata verir.

Kenar TIMx_CCRx içine CNT'yi latch eder; CCxIF set olur. ÖncekiCCxIF okunmamışsa CCxOF set olur. CCR input modunda read-only; okumaCCxIF temizler, CCxOF yalnızSRrc_w0ile temizlenir. CCxIE veNVICIRQ28 gerçekC ISR kullanır. SoftwareCCxG mevcutCNT'yi capture edebilir. Clock açıksaCEN0durumunda da capture/IRQ mümkündür; CNT sabit kalır. F103counter/CCR16bit; F401/F41132bit. CaptureCCR değerleri PWMcompare çıkışı gibi sürülmez;inputkanalı high-Z kalır.

## C API

```c
int cf_tim2_capture_begin(unsigned pin, unsigned edge,
    unsigned divider, unsigned counterHz);
int cf_tim2_capture_read(unsigned pin, unsigned *value);
```

pinPA0..PA3,kartınGPIOlistesindeyse. edge0=rising,1=falling,2=both (yalnızF4modeli). divider1/2/4/8. counterHz ceil(CF_CPU_HZ/65536)..1000000. Başarı gerçek sayaçHz;geçersiz−1. API parametreleri önce doğrular; mevcut çalışanTIM2 farklıPSCkullanıyorsa−1. GPIO/AF/pull-down ve directTI hazırlanır. CounterduruyorsaPSC/ARRmax/UG/status kurulupCEN1 yapılır; aynıtimebaseile başkaçalışankanalkorunur. IRQ enable edilmez: EOC değilCCxIE/NVIC kullanılır.

read: yeni sonuç0;boş/invalid−1;overcapture−2. Sonuncusunda `*value` en son yakalanan timestampi taşır,eski sonuç kayıptır. CCRokunupCCxIF temizlenir;OVRraporundaCCxOFda temizlenir. Timestamp unsigned32bitpointerile taşınır; F4üstbitkaybolmaz. `CF_CPU_HZ` mevcut kartın sabit clockprofilimakrosudur; sonradan özelRCCclock değişikliğini takip etmez.

## Pin penceresi

TIM2_CHn · Giriş yakalama seçimi edge/divider/counterHz alanlarını ve beginCkodunu üretir. ProjelocalJSON/ZIP;Uygulaöncesitaslak. Tümcapturekanalları aynı sayaçhızını paylaşır. GUIplanındaPWM+capturebirlikte reddedilir; ortakTIM2timebaseiçinmainC/registerkoduyla birlikte yapılandırılabilir. Demo bunu yapar: başlangıçcaptureplanı, main içinde1kHzPWM/ortakPSC/ARR. main açıkçaGUIbaşlangıçayarını sonradan değiştirebilir.

## PWM ölçüm istasyonu

WeActF411CE: potOUT→PB1ADC, PA1PWM→PA0capture fizikselkablo. NativeC IRQ rising/fallingCCR veADC ile ayarlananPWM. %50→WIDTH500µs/PERIOD1000µs/MEAS50/ADC2048; %75→750µs/1000µs/75/3071. İkihazırlab/kartkorunur;buayrıJSONkabulörneği teslimedilir. Kabloyu kesince capture güncellenmez; yazılımın timeout kararı kodun sorumluluğudur.

## Sınırlar ve kaynak

ICdigitalfilter/synchronizer/metastability/analoghysteresis, encoder/externalclock/TRC,slave/reset/PWMinputmode otomasyonu, inputcaptureDMA, diğerTIM, outputcomparematchIRQ, center/down/OPM/UDIS/URS, PSCaltfazıCEN/RCCpausevefullclockpoweraudit henüztamamlanmadı. GPIOkenarı MMIO/devreçözümü cycle noktasında gözlenir; silicon input synchronizer gecikmesi eklenmez. ModelCENcounterpauseeskiintegerCNTdavranışını korur;altprescalerauditayrı. BütünSTM32bitti denmez.

Kaynak:[ST RM0368](https://www.st.com/resource/en/reference_manual/DM00096844.pdf),§13.3.4–5,CCR/CCMR/CCER/SR/DIER/EGR; [ST F1 TIM HAL](https://github.com/STMicroelectronics/stm32f1xx-hal-driver/blob/master/Inc/stm32f1xx_hal_tim.h),direct/indirect/prescaler/IRQtanımları. F1both-edge bu modelin kapısı değildir; F1headergenericmacrovarlığıtümMCUinstance desteği sayılmaz. [Kapsam ve devam](STM32-AUDIT.md).

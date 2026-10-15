# TIM2 encoder, compare ve update olayları · 0.52

Dokuz mevcut STM32 profili. F103 CNT/ARR/CCR16 bit; F401/F41132 bit. Gerçek ARM C17 firmware, GPIO/DC netler ve NVIC IRQ28 kullanılır.

Encoder: SMCR SMS1 TI2, SMS2 TI1, SMS3 iki giriş; PA0 TI1 ve PA1 TI2 direct girişleri. F1 GPIO input, F4 AF1 gerekir. CC1P/CC2P giriş tersler; DIR salt okunur donanım yönüdür. Her geçerli giriş değişiminde yön hesaplanır; seçilmiş kenarlar PSC+1 ile bölünür. ARR overflow/underflow, UIF/UIE ve UDIS desteklenir. Float/belirsiz DC ya da aynı çözümde iki girişin birden değişmesi sayım üretmez. CEN kapalıyken saymaz; iç CPU saati encoder CNT’yi ilerletmez.

`cf_tim2_encoder_begin(mode,arr,invert,psc)` timerin tamamını yeniden kurar, DIER ve önceki kanal ayarlarını sıfırlar. mode1..3, arr1..MCU üst sınırı, invert0..3 (A/B bitleri), psc0..65535; başarı0/geçersiz−1. `cf_tim2_encoder_count()` unsigned CNT döndürür. Alternatif GPIO/remap, digital filter, index/reset/slave trigger yok; encoder+OPM reddedilir. Capture API encoder açıkken −1 döndürür; PWM API yeniden iç saate geçer.

Pin penceresinde PA0 Encoder A ve PA1 Encoder B birlikte seçilir; ortak encoder modu, ARR, tersleme ve PSC projeye ait JSON/ZIP içinde saklanır. PWM/capture ile karışık GUI planı reddedilir; ileri ortak timer kurulumu C/register koduna aittir. Başlangıç main öncesindedir; main yeniden ayar yapabilir.

İç saat yukarı sayımında output compare match CCxIF/CCxIE: CCR eşleşmesi veya CCR>ARR overflow. Output CCR okuması bayrağı temizlemez; SR rc_w0 temizler. Frozen, active-on-match, inactive-on-match, toggle, forced inactive/active, PWM1/PWM2 ve CCxP polaritesi. Yazılım CCxG olayı compare referansını da değiştirir. Fast/clear trigger, complementary/dead-time yok.

UDIS update/preload aktarımı ve UIF’yi bastırır; UG yine CNT ve prescaler sayacını sıfırlar. URS yazılım UG için UIF’yi bastırır, preload aktarımı sürer. OPM bir sonraki update olayında CEN’i kapatır; UDIS bunu da engeller. Normal capture modeli ve CCR read-only/overcapture korunur.

Sınırlar: center/down counter, TRC, diğer timerlar, DMA, tam saat ağacı ve CEN/RCC prescaler alt fazı hâlâ açık. OPM durduğunda GPIO referansı mevcut CNT/mode seviyesinde kalır; çıkış otomatik Hi-Z yapılmaz. Harici fiziksel cihaz karşılaştırması yapılmadı.

Kaynak: [ST RM0368 Rev6 §13.3.12, §13.4.1/5/6](https://www.st.com/resource/en/reference_manual/DM00096844.pdf). F103 pin/giriş profilinin mevcut ST kaynakları korunur; tüm F1 reference manual yeniden doğrulandı iddiası yoktur.

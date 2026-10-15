# ADC1 kesikli dönüşüm ve injected dış tetikleme · 0.57

CR1 DISCEN + DISCNUM: 1–8 regular dönüşümlük gruplar; kalan rank bir sonraki tetikte sürer, son kısa grup rollover yapmaz, sonraki tetik rank1'e döner. EOC/DR/IRQ ve fiziksel girişler kullanılır. JDISCEN: injected grupta bir tetikte bir rank; JEOC/IRQ ancak grubun son rankında. ADON=0 ve reset bekleyen dönüşüm/konumu temizler. Regular+injected DISC, JAUTO+DISC, regular CONT+DISC birliktelikleri açık hata verir.

Injected dış tetikler: F103 JEXTSEL3 TIM2_CC1, JEXTSEL6 EXTI15; F401/F411 JEXTSEL2 TIM2_CC1, JEXTSEL15 EXTI15 ve JEXTEN. EXTI15 fiziksel GPIO kenarı ve ADC polarity/model kuralları; injected olay regular sırasını askıya alıp devam ettirir. TIM2 kaynak eşlemesi var; yeni fiziksel IRQ kabulü EXTI15 içindir. Diğer tetik kaynakları, TRGO, dahili ADC kanalları, analog sample-hold/noise/kalibrasyon bu başlıkta eklenmedi.

10 kabul testi: 6 gerçek Clang firmware regular 2+2+1/no-rollover ve injected JEOC; üç gerçek PB8→PB15 EXTI15/jenerik ADC ISR seri çıktısı ve bir geçersiz mod grubu. F103C6/F401RE/F411CE. İlk test fixture'ı Nucleo PA2 VCP padini kullanıyordu; PA4'e düzeltildi. Başarı iddiası yalnız son geçen koşu içindir.

Resmi ST referansları: RM0008 https://www.st.com/resource/en/reference_manual/cd00171190.pdf ; RM0368 https://www.st.com/resource/en/reference_manual/DM00096844.pdf ; RM0383 https://www.st.com/resource/en/reference_manual/dm00119316.pdf . F4/F1 injected eşlemeleri ayrıca üretici HAL ADCEx başlıklarıyla kontrol edildi: https://github.com/STMicroelectronics/stm32f4xx-hal-driver/blob/master/Inc/stm32f4xx_hal_adc_ex.h ve https://github.com/STMicroelectronics/stm32f1xx-hal-driver/blob/master/Inc/stm32f1xx_hal_adc_ex.h . Fiziksel silikon ölçümü iddiası yoktur.

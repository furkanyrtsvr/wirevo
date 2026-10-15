# STM32 RTC / backup / saat fazı · 0.54

F103 counter RTC ve F401/F411 calendar RTC farklı register modelleridir; biri diğerinin alias'ı değildir. F103 PRL/CNT/ALR/DIV, CNF/RTOFF/RSF, second/overflow/alarm; F4 BCD date/time, 12/24 saat, leap-year/weekday, PRER/SSR, shadow lock, INIT/RSF/WPR, Alarm A/B ve periodic wakeup modellenir. 2000–2099 iki haneli yıl döngüsü vardır; yüzyıl düzeltmesi yazılım sorumluluğundadır.

Alarm EXTI17/IRQ41; F103 second/global IRQ3, F4 wakeup EXTI22/IRQ3. IMR/EMR, PR W1C ve RTC rc_w0 bayraklarını yazılım temizler. F103 canonical handler `RTCAlarm_IRQHandler`, F4 `RTC_Alarm_IRQHandler` ve `RTC_WKUP_IRQHandler`. ADC canonical F103 `ADC1_2_IRQHandler`, F4 `ADC_IRQHandler`; önceki `ADC1_IRQHandler` kullanıcı kodu uyumlu kalır.

RCC BDCR clock source selection, RTCEN, BDRST ve PWR DBP koruması; F103 10×16-bit/F4 20×32-bit backup vardır. RTCSEL seçildikten sonra source değiştirmek BDRST gerektirir. BDRST kayıtları siler; MCU/watchdog reseti backup, RTC sayaç/takvim ve prescaler fazını korur. DBP yeniden kapanır; F4 write-protection key state backup domain içindedir. Normal proje JSON/ZIP EEPROM gibi bir cihazın çalışan RAM/RTC anlık durumunu kalıcı firmware verisi olarak saklamaz.

Saatler nominal sanal kaynaklardır: LSE32768, LSI F10340000/F432000; HSE board profile ve RTC bölücüsü. Fiziksel kristal startup/noise/tolerance/clock-failure modellenmez. F103 CNF çıkışında3RTCclock commit; F4 INIT2clock, çıkış4clock, gölge güncelleme2clock modeli. Bus wait-state ve tüm silikon eşzamanlılık ayrıntıları cycle-accurate değildir. Timestamp/tamper/kalibrasyon/shift/subsecond alarm/RTC_AF output, backup regulator ve STOP/STANDBY henüz yok; desteklenmeyen modlar sessizce taklit edilmez.

PWR DBP/VOS ve VOSRDY vardır. F4 startup PLL açılmadan F401 scale2/F411 scale1 seçer; VOS değişimi PLL OFF ister. PWR interface clock kapansa DBP latch korunur; BDRST VOS'u değiştirmez. Regulator transient/power consumption/PVD/BOR gibi diğer güç modeli ayrıntıları yoktur.

## C17 API

- `cf_rtc_begin(source)`: 1=LSE,2=LSI,3=HSE; yeni RTC'yi1Hz kurar, zaten çalışan RTC ve backup kayıtlarını silmez. Kaynak uyuşmazlığı−1; BDRST otomatik yapılmaz.
- F103: `cf_rtc_counter(unsigned *out)` / `cf_rtc_set_counter(unsigned)`.
- F4: `cf_rtc_calendar(unsigned out[7])` / `cf_rtc_set_calendar(const unsigned value[7])`; sıra yıl(2000–2099), ay, gün, weekday(1Pazartesi–7Pazar), saat(0–23), dakika, saniye. Get12saatmodunu24saatsonuca çevirir; set24saat kullanır. Geçersiz tarih yazılmadan−1 döner. Yanlış aile API'si−1 döner.
- `cf_backup_read(index,unsigned *out)` / `cf_backup_write(index,value)`; index0..9 F103/0..19F4; F10316-bit değer. Kütüphane backup register rezerve etmez.

Pin penceresindeki RTC kaynağı yalnız projede saklanır; `cf_board_init` başlangıç kodu üretir. Main registerlerle ileri alarm/saat ayarlarını yönetebilir. RTC JSON demo `docs/examples/stm32-rtc-acceptance-054.json`: ADC DMA/EXTI/B1/LED/CRC/watchdog korunur. T takvim/backup sayacı; F gerçek PRER ayarını1024tick/s yapar ve leap-day kabulünü hızlandırır; R watchdog resetidir. Bu hızlandırma JS sonucu yazmaz, firmware RTC prescaler'ını değiştirir. Başlangıç2024-02-28 23:59:58;29Şubata geçiş ve backup1→2 gerçek ARM testindedir.

TIM2 CEN/RCC pause, CNT write ve UG için prescaler alt fazı kontrol edildi: pause ve CNT write fazı tutar, UG sıfırlar. Dynamic clock değişimi, filter/TRC/remap/down/center ve diğer timer ayrıntıları ayrı kapsamdır.

Kaynak: ST [RM0008](https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [RM0368 Rev6](https://www.st.com/resource/en/reference_manual/DM00096844.pdf), [RM0383](https://www.st.com/resource/en/reference_manual/dm00119316.pdf), ST CMSIS ve LL RTC headerları. 1200ay sonu bağımsız UTC/Gregorian oracle ile, tüm9kart gerçek firmware/IRQ ve üçsaat kaynağıyla kontrol edilir. Fiziksel silikonun tamamı doğrulanmış değildir.

# CircuitForge 0.44 kabul kaydı

13 Ekim 2026, Windows / Clang22 ARM / gerçek Cortex-M3 ve Cortex-M4F WASM.

## Otomatik kabul

- İlk genel regresyon `npm test`: **729/729**, 0 fail/skipped, 247680.2717 ms (`.sites-runtime/full044-first.log`).
- Son genel regresyon `npm test`: **741/741**, 0 fail/skipped, 465893.0683 ms (`.sites-runtime/full044-final.log`). Son model, worker serial-error ve UI kapsam bilgisi bu çalışmada bulunur. Sonrasındaki değişiklikler yalnız dokümantasyon/build cache listesidir.
- `npm run test:stm32`: **142/142**, 0 fail/skipped, 97694.4573 ms (`.sites-runtime/stm44-final.log`).
- Yeni ana alt küme 77/77 (`.sites-runtime/stm44-native-first.log`, 62743.2793 ms); baud mismatch/framing ve RCC reset kabulü sonra son 142/741 paketlerinde eklendi.
- `npm run build`: 397 kabuk dosyası / 19312801 bayt, 20MiB altında; Clang ayrı cache. Son belge başlıklarının baytları build ile tekrar ölçülür.

USART testi: altı kart × PA9/PA10 ve PB6/PB7 fiziksel 8N1. Bluetooth üzerinden R/1/0, gerçek IRQ37 echo, GPIO/DC sonucu, packed NVIC priority word ve bank1 enable/disable. Altı kartta ORE ilk baytı korur; SR/DR temizleme, TDR/shift ayrımı ve TXE/TC kabulü. Gerçek 9600/19200 baud uyuşmazlığında FE; DR tek okuma FE'yi temizlemez. Blue Pill fiziksel RX terminal enjeksiyonunu açık mesajla reddeder. Nucleo VCP byte profili korunur.

ADC testi: altı kartta gerçek C firmware/live pot %0/%50/%100 → 0/2048/4095. ADC IRQ18 WFI'dan uyandırır, DR EOC'yi temizler. F103/F4 adres/prescaler/analog GPIO ayrı. Boşta/voltaj/saat ve tek regular12-bit sınırları modelde denetlenir. Altı gerçek C reset programı USART1/ADC1/TIM2 registerlerini RCC ile sıfırlar.

PWM testi: altı kartta gerçek C firmware TIM2_CH1 1kHz/%25, gerçek LED/DC HIGH/LOW. Rising-rising period ve high duration CPU cycle ile ölçülür; %0/%100 preload değişimi. Update IRQ28 gerçek ARM ISR içinde UIF temizler ve üç periyotta WFI'dan çıkar. Pin kodu aynı timer için farklı Hz ve %101'i reddeder.

Rota testi: altı kart × iki ana laboratuvar uzun orta segment overlap0. Gerçek endpoint/net eşleşmesi korunur; ortak fiziksel pin çıkışı paylaşılabilir. Eski Nucleo iç pad → eşdeğer dış Morpho, PCB body/stub sınırı önceki testte korunur. Labels/AVR/ESP ve motor yaşam döngüsü genel regresyonda geçti.

## Tarayıcı kabulü

Yerel port4174/no-store üzerinden Blue Pill C8 çevre istasyonu gerçek Clang ile derlendi: `ADC=512 NATIVE=2048 LIMIT=3000 ALARM=0 OLED=0`. Pin penceresinde PA0/TIM2_CH1, 1000Hz/%25 Uygula → `cf_pwm_begin(PA0,1000,25)` gerçek C kaynağı; çalışmakta olan motor güvenle boşaltılıp firmware stale oldu. Yeni Nucleo F401RE projesinde %0 başlangıç değeri korundu: önceki proje ayarı taşınmadı. Bu projeye özel badge ve aktif ADC/PWM/USART1 seçenekleri görüntülendi.

Nucleo F401 çevre örneği gerçek derleme/çalışma, MCU ADC sonucu ve ayrılmış rota görüntüsü. Gerçek ArrowUp/Tab girişiyle37 °C işlendi; T=3700 / ALARM=1 / OLED=0 ve LED5.91mA tarayıcıda görüldü. Bluetooth kontrol örneği sanal PC scan/connect; gerçek USART1/RXNE IRQ ring buffer ile `CONTROL READY`, `L1` → `LED=1` tarayıcı kabulü. `A`/L0, canlı alarm, button/VIN kesme ve OLED RAM tüm altı hedefte otomatik gerçek firmware testlerinde doğrulandı.

Yeni tarayıcı sekmesi attach iki kez başarısız olduğundan mevcut kayıtlı canlı sekme geçici olarak localhost'a yönlendirildi. Originler ayrı olduğundan kullanıcının public projeleri değiştirilmedi; QA sonunda aynı sekme canlı siteye döndürülür. CUA dışı browser otomasyonu kullanılmadı. Numeric fill tek başına change üretmediği için gerçek ArrowUp/Tab giriş olayıyla sensör değişimi işlendi; UI'de37 kaydedildi. Bu durum doğrudan model testinin yerine kullanılmadı.

Ekranlar kök CircuitForge-0.44-Pinler.png / Kablolar.png / Bluetooth.png. Canlı sürüm native Sites sonucu ile doğrulanır; tarayıcı reload ayrıca kontrol edilir.

## Sınırlar

Bu kayıt tam vendor HAL veya tüm STM32 kart/çevrebirimlerini onaylamaz. USART1 8N1, ADC1 tek regular right-aligned12-bit ve TIM2 PWM1 bounded modelleridir. Detaylar dist/notices/STM32-PERIPHERALS.md. Gerçek BLE/USB donanımı, analog kalibrasyon/noise/sample-hold, DMA/USB/CAN/Ethernet ve STM32 C++/MicroPython fiziksel kabulü yapılmadı. Eski devir/QA kayıtları tarihsel olarak korunur.

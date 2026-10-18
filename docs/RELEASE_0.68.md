# Wirevo 0.68 — STM32 native ROM yolu, I²S ve ileri timer

Yalnız mevcut dokuz F103/F401/F411 kartı değiştirildi. Başka aileye geçilmedi. Kabul kapısı yalnız `npm run test:stm32-068`; eski testler bu değişiklikte çalıştırılmaz.

## Uygulananlar

- Native salt-okunur system ROM yükleme: F103 için 2048, F401/F411 için 30720 bayt; SP/Thumb reset vektörü ve adres doğrulama, SHA-256, boot alias, reset sonrası koruma. USB paneli ve worker üzerinden yükleme/çıkarma/bilgi. Yüklü ROM gerçekten native Thumb çekirdeğinde yürütülür; bu modda işlevsel boot servisi araya girmez. ROM yokken önceki işlevsel USART/DFU servisi korunur. ST binary’si pakete eklenmemiştir.
- Native exception tail-chain 6 çevrim, temel dönüş M3=12/M4=10, extended FP dönüş nominal27; late-arrival önceki frame’i korur ve bekleyen IRQ’yu NVIC’e geri koyar. Byte NVIC priority adreslemesi, CCR.DIV_0_TRP ve SDIV MIN/-1 taşması düzeltildi.
- Accelerator kapalıyken Flash ACR beklemesi; APB1/APB2 bölücülerine göre nominal bus beklemesi, DMA/DWT/SysTick muhasebesi. Accelerator açık yol sıcak-cache nominalidir; ART/cache linefill ve AHB matrix contention modellenmiş sayılmaz.
- F4 I²S Philips, MSB/LSB justified, PCM kısa/uzun; 16/16-extended/24/32-bit, CKPOL, master/slave kenar ve WS senkronizasyonu. PCM uzun WS13 saat, kısa1 saat. 24-bit ikinci DR sözcüğünün üst8 biti kullanılır. CHSIDE, FRE/UDR/OVR ve DR/SR temizleme sıraları.
- I²S2ext/I²S3ext bağımsız DR, gerçek AF veri padleri, ortak saat, iki aktarım yönü, IRQ ve DMA istekleri. F103’e veya erişilemeyen kart pinlerine olmayan donanım eklenmedi.
- TIM1 CCPC preload, COMG/TRGI/CCUS commit, COMIF/COM IRQ/DMA; gerçek native DMA ile CCR yazımı. BDTR ilk-yazı LOCK1/2/3, OCxM/CCER preload, ayrı N polarity, CKD ölçekli dead-time, OSSI/OSSR idle, down-PWM ve repetition/UDIS düzeltmeleri.

## Kanıt ve kesin sınır

Dört yeni dosya: native63, timer27, I²S224, worker ROM9; toplam323 kabul. I²S format matrisi model bit/kenar düzeyindedir; native DMA/ROM/exception kontrolleri gerçek Thumb fixture yürütür. ROM fixture’ları **sentetiktir**, orijinal ST ROM değildir. Önceki regresyonların geçtiği veya gerçek donanım ölçümü yapıldığı iddia edilmez.

Bu sürüm istenen yazılım yollarını genişletir; **STM32’nin tüm fiziksel silikonuyla eksiksiz eşdeğer olduğu ilan edilemez**. Orijinal ST ROM dökümleri bulunmadığından bunların gerçek kod uyumluluğu doğrulanmadı. Tüm core fault/priority/pipeline, FPU lazy stacking, ART/cache ve bus arbitration çevrimleri; USB/CAN tüm hata-zamanlama kombinasyonları ve analog güç/PHY/transceiver karakterizasyonu hâlâ tam silikon kapanışı değildir. Başka kart ailesine geçiş açılmaz. Önceki sürüm kayıtları tarihseldir; I²S extension ve TIM1 COM/LOCK artık genel bir “uygulanmadı” maddesi değildir.

Kaynaklar: [ARM Cortex-M4 TRM](https://documentation-service.arm.com/static/5fce431be167456a35b36ade), [STM32F411 RM0383](https://www.st.com/resource/en/reference_manual/rm0383-stm32f411xce-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [ST resmi pin verileri](https://github.com/STMicroelectronics/STM32_open_pin_data).

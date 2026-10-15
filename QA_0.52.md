# CircuitForge 0.52 kabul · 14 Ekim 2026

Genel `node --test --test-concurrency=4 tests/*.test.mjs`: **1075/1075**, fail/cancelled/skipped0;421508.21ms. Log `.sites-runtime/full052-final.log`. Yeni57 test:28geometri/kayıt/montaj ve29timer/encoder/firmware/örnek kapısı. Önceki0.51 tüm1018 kapıları korunur.

İlk139hedef koşusunda1hata: encoder→PWM API CCxS değişimi kanal açıkken yapılıyordu. API kanalı kapatır, CEN/SMCR’yi sıralı sıfırlar; son genelde düzeltme geçti. İlk deneme projesinin kabloları eski sabit orta nokta nedeniyle yanlış tarafta kalmıştı; gerçek kart sınırı/pin konumu kullanıldı, etiketler ayrıldı. Ayrı son3lab/API/route kontrolü3/3,2227.1279ms. Hatalı ara koşular başarı olarak sayılmaz.

Build `.sites-runtime/build052-release.log`: app shell417dosya/19489512B<20MiB; yeni aynalama modülü, HC-05 SVG ve STM32 model notları çevrimdışı paket listesinde. Gerçek Clang ayrı cache. Source key cf-stm32-0.11; ARM WASM kaynakları/motor hashları0.51ile aynı.

Tarayıcı CUA/local4173/fresh0.52:

- NucleoF411 Bluetooth kontrol C172704B; tarama1cihaz, bağlantı$pc; L1→LED1/5.91mA, ayrı A→ADC512. Özgün HC-05 esinli görünüm, mevcut5pin geometri/sanalmodel korunur.
- X aynalama SVG/pin transform değişimi; undo eski transformu geri getirir. Y aynalama yeniden yüklemeden sonra kalır. Çok hızlı reload öncesi250ms bekleyen kaydın kaybı gözlendi; pagehide flush düzeltmesi sonrası aynı kabul geçti.
- WeActF411 encoder net label lab C171812B;F→COUNT4DIRUP,B→COUNT0DIRDOWN. Dört net label ve4kablo; central PCB body’den geçen kablo ve etiket gövdesi çakışması yok. GPIO kenarlarını firmware üretir; CNT’ye sonuç yazılarak simülasyon taklidi yapılmaz.
- STM32 Pinler PA0EncoderA/PA1EncoderB; mode2 seçimi gerçek cf_tim2_encoder_begin(2,...) kodu üretir, mode3uygulanıp derlendi. JSON/ZIP ve gerçek main öncesi başlangıç testi genelkapıda.
- STM32 Temel filtresinde OpampDIP8 göründü. Mevcut ayarlanabilir DC model/iki kanal korunur; duplicate alias eklenmedi.

Parent teslimler: CircuitForge-0.52-HC05.jpg, CircuitForge-0.52-Encoder.jpg, CircuitForge-0.52-Encoder-Lab.json. Yeni lab ana hazır örnek sayısını büyütmez; Dosya→Projeaç ile kullanılabilir.

STM32 tüm kapsamı tamamlanmadı. Digital filter/TRC/remap/center/down/DMA/EXTI, ADC ileri modları ve diğer17audit başlığı güncelplan/audit içinde açıktır. Fiziksel cihaz karşılaştırması yok; genuine C/register/IRQ/DC kabulü kullanıldı.

# CircuitForge 0.56

Auto route · Kabloları düzenle bütün devrede dik açılı yollar ve aralıklı paralel kanallar hesaplar; tek kablo ve yeni köşesiz bağlantıda da yönlendirme vardır. Çıkışlar PCB/gövde çevresinden geçer; aynalama/döndürme hesaba katılır. Dirsek/kesişme/örtüşme maliyeti ve 16 birim aralık hedefi vardır; sıkışık pin alanlarında daha küçük aralık mümkündür. Worker arayüzü kilitlemeden hesaplar, eşzamanlı devre değişikliğinde sonucu uygulamaz. Bileşen konumu, pinler ve kod korunur; geri al/yinele desteklenir.

Besleme/GND/saat/SDA/MOSI/MISO/CS ve kalan sinyaller ayrı renklerle gösterilir. Aynı elektriksel net aynı renktedir. Kesişme boşlukları düğüm oluşturmaz. Hazır STM32 çevre/kontrol istasyonları CF_3V3/CF_GND kısa güç etiketleriyle sadeleştirildi; kullanıcı devrelerine otomatik etiket eklenmez.

TIM2 DIR aşağı sayım, CMS1/2/3 merkez hizalı PWM, CNT/DIR, compare/update IRQ, UG/preload/one-pulse/faz kontrolü eklendi. 28 yeni test, 12 gerçek Clang/native ARM IRQ kabulü. İleri modlar register üzerinden seçilir; pin penceresi varsayılan cf_pwm_begin üretir. Detay STM32_TIMER_ALIGNMENT_0.56.md.

9 STM32 kartında çevre/kontrol devreleri, elektriksel netler ve rota kontrolleri: 62/62. Auto route/topoloji/JSON-ZIP/mirror/renk/kesişme: 5/5. Timer ilgili kapı: 63/63. İlk router denemesinde örtüşme maliyeti yetersizdi; ağırlık ve alternatif gövde koridorları düzeltildi. Başarısız denemeler kabul sayılmaz.

Tarayıcı Nucleo F411 çevre istasyonu: Auto route Worker çalıştı; gerçek C17/Clang 5924 byte; ENV T=2500 H=5000 ADC=512 NATIVE=2048 LIMIT=3000 ALARM=0 OLED=0 MEM=0. PNG ve JSON teslim paketinde.

STM32'nin tüm silikon ayrıntıları tamamlanmış değildir. USB/CAN/Flash/MPU/ileri clock-power, STM32 MicroPython/tam Cube HAL ve kalan timer/ADC/DMA/bus/RTC ayrıntıları kapsam kaydında açıktır. Otomatik devam zamanlayıcısı kurulmadı.

Canlı sensör kabulü: inspector üzerinden 25 → 37.1 °C; gerçek SHT31 kuantizasyonlu çıktı T=3709, ALARM=1, OLED=0 MEM=0. Proje JSON bu girişle kaydedildi. PNG duraklatılmış çalışma ve renkli düzeni gösterir.

Genel kabul: 1279/1279; hata/iptal/atlanan 0; 1036257.5993 ms, concurrency=4 (.sites-runtime/full056-final.log). Önceki 1246 üstüne 28 timer + 5 auto-route testi. Son cache 7/7. Çevrimdışı uygulama cache kimliği 0.56; yeni route Worker ve kullanım notları uygulama manifestinde.

## Kabul dosyaları

Genel full056-final.log; auto-route 5/5 autoroute056.log; route/net-label/native lab 62/62 routes056-compact.log (326676.1641 ms); timer ilgili 63/63 timer056-final.log (19028.6777 ms). 16 birim hedef dışında pin/fan-out ve dar yerel güç dallarında daha küçük aralık olabilir; topoloji testleri bunu elektriksel bağlantı değişikliğiyle gizlemez. Genel süre artışı yeni yönlendirme ve kısa güç etiketli devre kabulünü de içerir.

Yerel CUA 4173: Nucleo F411, C17 5924 byte firmware; Auto route ayrı Worker, buton hesap sırasında disabled/arayüz kullanılabilir. 25°C ölçümü ardından inspector ArrowUp/blur ile 37.1°C uygulanıp T=3709/ALARM=1/OLED=0/MEM=0 görüldü. İlk fill denemesi sadece alanı değiştirdi; proje JSON değiştirmeyen bu deneme kabul sayılmadı. Son native giriş ve JSON 37.1 kaydı doğrulandı. SHT31 quantizasyonu 3709 normaldir. JSON/PNG parent teslim dosyalarıdır.

ST referansları STM32_TIMER_ALIGNMENT_0.56.md; motor veya Clang WASM yeniden derlenmedi. Güç etiketleri aynı isimli projeye özel elektriksel netlerdir; fiziksel kablo geçişleri düğüm oluşturmaz. Kaynak/GUI değişiklikleri node --check ve git diff --check ile denetlendi.

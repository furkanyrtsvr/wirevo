# Pico GPIO uyumluluğu — 0.104

Derle → Çalıştır tarayıcıda çalışır; ek uygulama, servis veya SDK kurulumu gerekmez.

## Yeni örnek

**Projeler → Pico C · GPIO maske / geri okuma**. GP15 direnç üzerinden LED'i sürer. GP14 çıkışı GP16 girişine kabloyla bağlıdır. Kod bu hattı okuyup terminale `GPIO104 feedback OK` yazar; sonra GP14/GP15'i toplu olarak değiştirir. Kabloyu ayırırsanız başarı sonucu garanti edilmez. Proje kaynakları ve bağlantıları JSON/ZIP olarak kaydedilebilir.

## Eklenen çağrılar

- Toplu başlatma ve fonksiyon seçimi: `gpio_init_mask`, `gpio_set_function_masked`, `gpio_get_function`, `gpio_deinit`, `gpio_function_t`.
- Çıkış: `gpio_put_all`, `gpio_put_masked`, `gpio_set_mask`, `gpio_clr_mask`, `gpio_xor_mask`, `gpio_get_all`, `gpio_get_out_level`.
- Yön: `gpio_set_dir_all_bits`, `gpio_set_dir_masked`, `gpio_set_dir_out_masked`, `gpio_set_dir_in_masked`, `gpio_get_dir`, `gpio_is_dir_out`.
- Sinyal: `gpio_set_outover`, `gpio_set_inover`, `gpio_set_oeover`; NORMAL/INVERT/LOW/HIGH.
- Pad: `gpio_set_pulls`, pull durumu okuma, giriş etkinleştirme, hysteresis, slew ve drive-strength ayar/okuma.

Bu işlevler gerçek model kayıtçılarını kullanır. RP2040/RP2350 farklı SIO adresleri dikkate alınır. Yön ve çıkış değeri okumaları SIO kayıtlarını döndürür; fiziksel padin override sonrası durumu ile aynı şey değildir.

Pad OD biti artık elektriksel çıkışı serbest bırakır. RP2350 ISO biti de çıkışı ayırır. Ayarı geri almak SIO değerini silmeden sürmeyi geri getirir. LED üzerinde açık/kapalı sonuç doğrulanmıştır.

## Doğrulanan kapsam

Sekiz kartın ARM profilleri ve dört Pico 2 kartının Hazard3 profilleri için derlenmiş yeni C programı; gerçek GP14→GP16 geri okuması, toplu yazma/yön, input/output/OE override, giriş kapatma, pad ayarlarının geri okunması, deinit ve LED sonucu. İki ailede OD ve Pico 2 ISO çıkış ayırma; iki ailede yeni seçilebilir örneğin derlenmesi ve LED değişimi. Yalnız 16 yeni kontrol çalıştırıldı.

## Sınırlar

Bu genişleme Pico kartlarının 30 GPIO içeren çip paketini kapsar. QSPI/USB pinleri, GPIO32+, 64-bit API ailesi, raw/shared IRQ işleyicileri ve IRQ override bu sürümle eklenmiş sayılmaz. Hysteresis/slew/drive-strength kayıtları okunup yazılır; analog geçiş süreleri, çıkış akımının fiziksel sınırlanması veya gürültü modeli değildir. İki pull aynı anda etkinleştirildiğinde bus-keeper davranışı doğrulanmamıştır. RP2350 izolasyonunun giriş/IRQ tarafında tam eşdeğerliği iddia edilmez. Genel MCU güç/reset/cycle eşdeğerliği kapsamı değişmez.

Semantik referans: [Resmi Pico SDK 2.2.0 GPIO başlığı](https://github.com/raspberrypi/pico-sdk/blob/2.2.0/src/rp2_common/hardware_gpio/include/hardware/gpio.h). Wirevo uygulaması bağımsız uyumluluk kodudur.

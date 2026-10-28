# Pico PWM / I2C uyumluluğu — 0.103

Derleme ve simülasyon tarayıcıda kalır. SDK paketi, yardımcı uygulama, Python veya yerel servis gerekmez. Tam resmi Pico SDK/CMake ve birebir silikon modeli değildir.

## Hazır örnekler

**Projeler → Pico C · PWM kesirli bölücü / kesme**: GP15 LED parlaklığı PWM wrap kesmesinde değişir. `pwm_config_set_clkdiv(125.5f)` ile kesirli bölücü kullanılır; terminalde `PWM103 IRQ OK` görülür.

**Projeler → Pico C · I2C süre sınırı / EEPROM**: 24LC256 ve bağlantıları hazır gelir. GP4=SDA, GP5=SCL; VCC=3V3, A0/A1/A2/WP=GND. 0x0010 adresine 0x5A yazılır, yazma süresi beklendikten sonra tekrar başlatma ile geri okunur. Başarıda `I2C103 EEPROM 0x5A OK` yazılır ve GP15 LED yanar. Kaynaklar gerçek makine koduna derlenir; sonuç paket/sensör tarafından hazır verilmez.

## Eklenen SDK çağrıları

PWM: float bölücü ve int/frac4 yapılandırması, faz düzeltme ve bölücü modu ayarları, çıkış tersleme, iki kanal seviyesini birlikte yazma, maskeyle eşzamanlı başlatma, wrap kesmesini etkinleştirme/temizleme/durum/force ve RP2350 IRQ0/IRQ1 yönlendirme çağrıları. Bölücüler pozitif, 1–255.9375 aralığında 1/16 çözünürlükle aşağı yuvarlanır. Genel kayan nokta aritmetiğinin tümü eklenmiş sayılmaz.

I2C: `i2c_get_index`, `i2c_set_baudrate`, `i2c_deinit`, `i2c_write_timeout_us`, `i2c_read_timeout_us`, `i2c_write_blocking_until`, `i2c_read_blocking_until`. Süre sınırı bütün aktarımı kapsar. Geçmiş/0 süre sınırı `PICO_ERROR_TIMEOUT` (-2), adres NACK'i `PICO_ERROR_GENERIC` (-1) döndürür. Hata sonrasında SDA/SCL çıkışları serbest bırakılır. `pico/error.h` bu iki hatayı ve PICO_OK değerini sağlar. Diğer hata kodlarının veya tüm Pico error.h API'sinin eklendiği iddia edilmez.

## Düzeltilen donanım davranışları

- RP2350 PWM EN/INTR/IRQ ortak kayıtçıları doğru 0xF0 penceresine taşındı; 0xA0 artık eski RP2040 ortak kayıtçı adresi gibi davranmaz.
- EN okuması gerçekten açık dilimleri döndürür. Force edilmiş kesme de enable maskesinden geçer; RP2350 IRQ0 ve IRQ1 bağımsız maskelenir.
- Bölücü yazmak kapalı sayacı çalıştırmaz. Başka PWM çıkışları açıkken B girişinden darbe sayma çalışır; kapalı dilime gelen kenarlar sayılmaz.
- PWM sayaç saatleri kartın sistem saatini takip eder; Pico 2'nin 150 MHz ayarında eski 125 MHz darbe periyodu kullanılmaz. Sistem saati değiştirilince PWM saatleri de güncellenir.

## Doğrulananlar ve sınırlar

Sekiz kartta yeni C firmware'iyle PWM bölücü, girişten altı darbe sayma, gerçek wrap işleyicisi, çıkış kenarları/periyodu ve EEPROM yazma/tekrar başlatma/okuma doğrulandı. İki ailede saat hattı GND'ye bağlandığında süre aşımı, cihaz yokken NACK ve veri hattının bırakılması denetlendi. RP2350 iki IRQ hattı, maskeli force, kapalı sayaç ve saat değişimi ayrıca denetlendi. Eski testler çalıştırılmadı.

PWM modeli desteklenen Pico kartlarının dışarıya çıkardığı GPIO'ların kullandığı 0–7 dilimlerini kapsar. RP2350'nin bu kartlarda pinlere çıkmayan 8–11 dilimleri eklenmedi. Girişten sayma ve temel faz modu yapılandırması vardır; bütün faz kaydırma köşe durumları ve fiziksel sürücü gecikmeleri doğrulanmış değildir.

I2C mevcut GPIO tabanlı master taşımasını kullanır; gerçek kablo ve cihaz modelinden geçer. Hız nicemlenir, donanım FIFO/DMA/slave ve birebir kenar zamanlaması bu sürümün kapsamı değildir. Süre sınırlarının denetimi C komutları arasında yapıldığından küçük bir komut yürütme payı olabilir. Süresiz blocking çağrıların önceki 10 ms clock-stretch koruması korunur. Yarım kalmış aktarımda yazılan cihaz verileri otomatik geri alınmaz.

Kaynak anlamsal referansları: [Resmi PWM SDK](https://github.com/raspberrypi/pico-sdk/blob/2.2.0/src/rp2_common/hardware_pwm/include/hardware/pwm.h), [resmi I2C SDK](https://github.com/raspberrypi/pico-sdk/blob/2.2.0/src/rp2_common/hardware_i2c/include/hardware/i2c.h). Wirevo uyumluluk kodu bağımsız olarak uygulanmıştır.

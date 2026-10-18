# Wirevo devam planı

## Güncel karar · 0.69

Kullanıcı, donanım olmadan doğrulanamayan ve eklenmeyen ayrıntıları model sınırı olarak kabul etti. Mevcut STM32 işlevsel simülatör genişletme etabı bu sınırlarla kapatıldı; tüm fiziksel silikon tamamlandı iddiası yoktur. Desteklenen davranışlardaki gerçek hatalar normal bakım konusudur. Başka kart eklenmedi ve kendiliğinden yeni aile çalışması başlatılmaz. [Kesin karar ve sınırlar](docs/RELEASE_0.69.md). Aşağıdaki geçiş engelleri önceki kararın tarihsel kaydıdır, güncel zorunluluk değildir.

Güncel giriş: [belge dizini](docs/README.md). 0.68: native ROM yükleme, I²S full-duplex/format ve TIM1 COM/LOCK uygulandı; tail-chain/late-arrival ve nominal bus beklemeleri düzeltildi. [Kesin kanıt ve kalan fiziksel eşdeğerlik sınırları](docs/RELEASE_0.68.md). Önceki sürüm açıklamaları tarihsel kayıttır; başka aileye geçilmez.

1. [Aktif STM32 fiziksel-silikon denetimi](dist/notices/STM32-AUDIT.md).
2. [STM32 desteklenen işlevler ve model sınırları](dist/notices/STM32-SUPPORT-PROFILE.md).
3. [Doğrulama sonuçları](docs/qa/README.md).

0.63 kapanış iddiası geri çekildi. Dokuz kartta modellenebilir, belgelenmiş STM32 silikon açıkları sıfırlanmadan RP2040/Pico veya başka kart ailesine geçilmez. 0.65 ile option-byte/boot/NRST ve temel dinamik saat-güç; 0.66 ile Flash koruma/zamanlama, ileri timer/seri modlar ve sanal USB host/CAN/MMC davranışları eklendi. 0.67 ile işlevsel DFU/binary USART boot, PMA double-buffer/ISO, 10-bit I²C/SMBus, USB PID/ACK ve native sayaç tutarlılığı eklendi. Kesin uygulananlar ve doğrulanmamış sınırlar RELEASE_0.67 ve denetim belgesinde ayrıdır; tam silikon kapanışı ilan edilmez.

Eski planlar ve sürümler docs/history altında, test kanıtları docs/qa altında korunur.

# Wirevo devam planı

Güncel giriş: [belge dizini](docs/README.md).

1. [Aktif STM32 fiziksel-silikon denetimi](dist/notices/STM32-AUDIT.md).
2. [STM32 desteklenen işlevler ve model sınırları](dist/notices/STM32-SUPPORT-PROFILE.md).
3. [Doğrulama sonuçları](docs/qa/README.md).

0.63 kapanış iddiası geri çekildi. Dokuz kartta modellenebilir, belgelenmiş STM32 silikon açıkları sıfırlanmadan RP2040/Pico veya başka kart ailesine geçilmez. 0.65 ile option-byte/boot/NRST ve temel dinamik saat-güç; 0.66 ile Flash koruma/zamanlama, ileri timer/seri modlar ve sanal USB host/CAN/MMC davranışları eklendi. Kesin uygulananlar ve doğrulanmamış sınırlar RELEASE_0.66 ve denetim belgesinde ayrıdır; tam silikon kapanışı ilan edilmez.

Eski planlar ve sürümler docs/history altında, test kanıtları docs/qa altında korunur.

# Wirevo 0.64 — STM32 gömülü Flash ve silikon denetiminin yeniden açılması

0.63 sürümündeki “STM32 uygulama kapsamı kapandı” kararı geri çekildi. Fiziksel-silikon denetimindeki modellenebilir eksikler yeniden ürün borcudur; arayüz artık bunları “ürün sınırı” diye gizlemez.

## Gömülü Flash

- STM32F103: anahtar dizisi/kilit, 1 KiB sayfa ve mass erase, halfword programlama.
- STM32F401/F411: anahtar dizisi/kilit, sektör ve mass erase, PSIZE yazım genişliği.
- Silinmiş alan `0xFF`, yalnız 1→0 bit programlama, hizalama/program hata bayrakları ve EOP.
- Programlanan içerik MCU/watchdog resetinde korunur; yeni firmware yüklemesi yeni güç/programlama oturumudur.
- Flash değişince ARM instruction cache geçersiz kılınır; firmware’in çalışma anında yazdığı Thumb kodu aynı oturumda yürütülebilir.
- Dokuz kart için doğru Flash yoğunluk imzası ve kararlı 96-bit benzersiz cihaz kimliği.

## Doğrulama

`tests/stm32-flash-silicon.test.mjs` dokuz kartın her birinde gerçek C17 ARM firmware ile kilitli yazma reddi, erase, program, EOP, UID/yoğunluk, yazılan kodun yürütülmesi ve reset kalıcılığını sınar. Önceki STM32 regresyonları ve genel paket testleri yayın kapısında yeniden çalıştırılır.

## Açık kalanlar

Bu sürüm bütün STM32 silikonunun tamamlandığını söylemez. Option-byte koruma/reload, ROM bootloader/BOOT/NRST; dinamik clock/CSS/PVD/BOR/STOP/STANDBY; MPU/fault ayrıntıları ve denetim belgesindeki diğer çevrebirim modları açıktır. Başka kart ailesine geçiş yapılmaz.

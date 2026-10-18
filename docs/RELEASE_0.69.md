# Wirevo 0.69 — STM32 işlevsel profil ve kabul edilen sınırlar

19 Ekim 2026. Kullanıcı, eklenemeyen veya donanım olmadan doğrulanamayan ayrıntıların mevcut geliştirme etabını sürekli engellememesini kabul etti. Bu, yeni silikon desteği veya fiziksel doğruluk kanıtı değildir.

## Kesin karar

- Mevcut dokuz F103/F401/F411 kartının **işlevsel simülatör profili** esas alınır. 0.64–0.68 ile eklenen davranışlar korunur; bu sürümde yalnız ROM yükleme güvenilirliği değişir.
- Orijinal ST ROM binary uyumluluğu, birebir pipeline/ART/cache/FPU lazy/bus-arbitration çevrim eşdeğerliği ve analog/PHY/transceiver karakterizasyonu mevcut etap için **kabul edilen model sınırlarıdır**. Uygulanmış veya doğrulanmış diye işaretlenmez; bunlar için ROM dökümü veya fiziksel ölçüm beklenerek proje durdurulmaz.
- Kapsam paneli desteklenen, kısmi ve çipte bulunmayan birimleri ayırır. GPIO AF/debug, dual-ADC, tamper kombinasyonları ve diğer ayrıntılı protokol varyantlarının önceki sınırlamaları saklanmaz. Kısmi model tüm donanımın tamamlandığı anlamına gelmez.
- Mevcut STM32 genişletme etabı bu sınırlarla kapatılır. Desteklenen davranışlardaki gerçek hatalar normal bakımda düzeltilir; her sınır yeniden zorunlu bir “STM32 bitmedi” projesine dönüşmez. Başka kart bu sürümde eklenmedi; kendiliğinden başka aile çalışması başlatılmaz.

## Bu sürümde somut düzeltme

ROM değiştirme işlemi native harita kurulmadan etkin metadata’yı değiştirmez. Başarısız değiştirme/çıkarma önceki etkin görüntü ve fingerprint’i korur. Yeni yükleme veya çıkarma isteği, eski SHA-256 işlemi tamamlandığında eski ROM’un tekrar kurulmasını engeller. ROM bilgi yanıtı işlevsel boot servisini `functional-model`, kullanıcı görüntüsünü `unverified-vendor-rom` olarak açıkça ayırır; bir dosya yüklemek ST uyumluluğu sertifikası değildir.

## Doğrulama

Yalnız yeni `npm run test:stm32-069`: 21 kontrol. Dokuz kart için kapsam arayüzü ve başarısız ROM değiştirme; çıkarma hatası, eşzamanlı yükleme/çıkarma ve model politikası. ROM testleri JS bridge double kullanır; native çekirdeğin veya orijinal ST kodunun yeniden doğrulandığı iddia edilmez. Eski testler çalıştırılmaz. Native WASM değişmedi; tarayıcı build ve offline-shell listesi güncellenir.

# Wirevo

Tarayıcıda devre kurma, kod derleme, mikrodenetleyici simülasyonu ve hata ayıklama. **0.110.0**.

**[Uygulamayı aç](https://wirevo-furka.equalwood4.chatgpt.site/)** · **[Kullanım kılavuzu](https://wirevo-furka.equalwood4.chatgpt.site/guide.html)** · **[PDF indir](dist/manual/Wirevo-Kullanim-Kilavuzu-v0.110.0.pdf)**

## Başlangıç

1. Güncel, WebAssembly destekleyen bir masaüstü tarayıcıda Wirevo’yu açın.
2. Kartı ve örnek projeyi seçin; bileşenleri yerleştirip bağlayın.
3. Kaynak dosyalarını düzenleyin; **Derle → Çalıştır**.
4. Çalışmanızı **JSON / ZIP** olarak indirin. Başka bilgisayarda aynı dosyayı içe aktarın.

Kullanıcı için ek masaüstü uygulaması, Python yardımcısı, yerel servis, port veya bağlantı anahtarı gerekmez. İlk derlemede derleyici dosyaları indirilir. Çevrimdışı kullanım için derleyici önbelleğini hazırlayın; tarayıcı verileri silinebilir, proje yedeğinizi ayrıca indirin.

## Kartlar ve çalışma kapsamı

38 kart profili: 6 Arduino/AVR, 14 ESP32, 9 STM32, 1 TM4C123 ve 8 Pico. Ortak devre alanı, çok dosyalı kaynaklar, seri terminal, ölçüm ve desteklenen profillerde hata ayıklama bulunur. Dil ve çevrebirim kapsamı karta göre değişir. Katalogdaki 126 bileşen tanımı, bütün kart/kütüphane birleşimlerinin doğrulandığı anlamına gelmez.

- [Uygulama kılavuzu: bağlantılar, kod, debug, kaydetme ve sorun giderme](dist/guide.html)
- [Güncel Pico kapsamı ve somut sınırlar](docs/PICO_SUPPORT.md)
- [STM32 kapsamı](dist/notices/STM32-MODEL.md), [ESP32 kapsamı](dist/notices/ESP32-MODEL.md), [Tiva C kapsamı](dist/notices/TIVA-MODEL.md)
- [Dil/çalışma ortamları](dist/notices/UNIFIED-WORKSPACE.md), [lisanslar ve firmware bilgileri](dist/notices/FIRMWARE-NOTICES.md)

Simülasyon eğitim ve uygulama geliştirme içindir. Tam SPICE, tüm fiziksel silikon davranışları, özgün CYW43 radyo yürütümü, tam CPU çevrim doğruluğu veya her devrede gerçek zaman garantisi sunulmaz.

## Pico: paket eklemeden çalıştırma

C kodu mevcut Clang/WebAssembly derleyicisi ve desteklenen SDK uyumluluk katmanı ile derlenir. Tam upstream SDK/CMake çalıştırılmaz. Normal kullanımda SDK indirmeniz gerekmez.

İsteğe bağlı **SDK paketi ekle** seçeneği, uyumlu C kaynakları ve başlıklarını ZIP/klasörden ekleyip probe derlemesiyle denetler. JSON tek başına SDK veya derleyici değildir. Yerel çalıştırılabilir araçlar tarayıcıda çalıştırılamaz. [Paket adımları ve sınırlar](dist/notices/PICO-SOURCE-PACKAGES.md).

## 0.110 değişikliği

Yeni Pico özelliği eklenmedi. Büyük sensör devresindeki UART beklemeleri, boş CPU döngüsü yerine mevcut olay bekleme mekanizmasını kullanır. Aynı 192 bayt / 9600 baud ölçümünde yürütülen komut 15.003.000’den 55.000’e indi; bir yerel ölçümde süre 2,17 saniyeden 0,36 saniyeye düştü. Bunlar belirli bir UART iş yükünün sonuçlarıdır, bütün devreler için hız garantisi değildir. Eski firmware’i yeniden derleyin.

[Yeni doğrulama, proje ve ölçümler](dist/notices/PICO-PERFORMANCE110.md) · [Sürüm notu](docs/RELEASE_0.110.md). Eski testler yeniden çalıştırılmadı; yalnız yeni performans/bekleme düzeltmeleri denetlendi.

## Geliştiriciler için

Bu bölüm site kullanıcıları için gerekli değildir. Kaynak geliştirme için Node.js 24 ve npm:

```sh
npm ci
npm run build
npm start
```

Yerel geliştirme: http://127.0.0.1:4173 . `src/` kaynakları, `dist/` web çalışma zamanları/WASM/görseller/lisansları, `scripts/` araçları, `tests/` kontrolleri, `docs/` güncel kapsam ve sürüm kayıtlarını içerir. `dist/` dağıtım dosyaları depoda korunur.

## Belge düzeni

Başlangıç noktası bu README, kullanım kılavuzu ve güncel destek sayfasıdır. Eski sürüm notları tarihçedir; yeni kurulum talimatı veya yeniden bulunmuş eksik listesi değildir. [Eski Pico kayıtları](docs/history/PICO_SUPPORT_TO_0.109.md). 0.95–0.98 dönemindeki yerel SDK yardımcıları kaldırılmıştır.

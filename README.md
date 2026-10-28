# Wirevo

Tarayıcıda devre kurma, kod derleme ve mikrodenetleyici simülasyonu. Kaynak sürümü: **0.105.0**.

**[Wirevo’yu aç](https://wirevo-furka.equalwood4.chatgpt.site/)**

## Kullanım

1. Siteyi WebAssembly destekleyen güncel bir masaüstü tarayıcıda açın.
2. Kartınızı ve bir örnek proje seçin; bileşenleri yerleştirip bağlayın.
3. Kodunuzu yazın, **Derle**, ardından **Çalıştır** düğmesine basın.
4. Projenizi JSON veya ZIP olarak kaydedip başka bilgisayarda yeniden açın.

Kullanıcıların Python, yerel SDK yardımcısı veya ek masaüstü uygulaması kurması gerekmez. Port, bağlantı kodu, yerel ağ izni ve yardımcı JSON dosyası istenmez. İlk derlemede derleyici dosyaları internetten alınır; çevrimdışı kullanım için arayüzdeki derleyici önbelleği hazırlanabilir.

## Kartlar ve kapsam

Arduino/AVR, ESP32, STM32, TM4C123 ve Pico aileleri; ortak devre bileşenleri, çok dosyalı kod, desteklenen dil/kart eşleşmelerinde C/C++ ve MicroPython, seri terminal ve sanal çevrebirim modelleri içerir. Kartların desteklenen özellikleri birbirinden farklıdır; bütün fiziksel silikon davranışlarının birebir modeli vaat edilmez.

Pico C kodu tarayıcıdaki Clang/WebAssembly derleyicisini ve Wirevo’nun desteklediği SDK uyumluluk katmanını kullanır. **Tam upstream Pico SDK/CMake tarayıcıda çalıştırılmaz.** Desteklenmeyen API veya CMake komutu açık hata verir. [Pico tarayıcı kapsamı](dist/notices/PICO-BROWSER-CMAKE.md), [kart/model belgeleri](dist/notices/). Önceden derlenmiş ARM UF2 içe aktarımı isteğe bağlıdır; normal kullanımın koşulu değildir.

Pico C için hazır **SPI 16 bit** ve **UART FIFO / loopback** örnekleri eklendi. [0.102 uyumluluk kapsamı ve sınırları](dist/notices/PICO-COMPAT102.md).

Pico C için **PWM kesirli bölücü / kesme** ve **I2C süre sınırı / EEPROM** örnekleri de bulunur. [0.103 kapsamı](dist/notices/PICO-COMPAT103.md).

## İsteğe bağlı Pico kaynak paketi

Panelde derleme yöntemi seçilir; **Kurulum ve kullanım adımları** başlığına tıklanınca adımlar aynı panelin içinde açılır. **SDK paketi ekle** ile C kaynakları ve başlıkları klasör veya ZIP olarak tarayıcıya eklenebilir. Paket probe koduyla gerçekten derlenerek denetlenir; istenirse bu tarayıcıda saklanır. JSON yalnız dosya tanımıdır; kaynakların yerini tutmaz. Tam resmi SDK/CMake veya bilgisayarda çalışan derleyici eklenmez. [Paket hazırlama, örnekler, kartlar ve sınırlar](dist/notices/PICO-SOURCE-PACKAGES.md).

## Yerel yardımcıların kaldırılması

0.95–0.98 döneminde denenmiş yerel SDK/Python/Tk yardımcıları, bağlantı pencereleri, port/kod eşleştirmesi ve indirilebilir yardımcı paketleri 0.99 ile kaldırılmıştır. Eski JSON projelerindeki yerel SDK tercihi tarayıcı moduna geçirilir; kullanıcı kaynakları ve devreleri korunur. Yalnız tam SDK'ye özgü kaynaklar, desteklenen tarayıcı API'lerine uyarlanmayı gerektirebilir.

## Geliştiriciler için

Depoyu geliştirmek veya web uygulamasını kendi bilgisayarınızda sunmak için Node.js 24 ve npm kullanılır. Bu bölüm siteyi kullanan kişiler için zorunlu değildir.

```sh
npm ci
npm run build
npm start
```

Yerel geliştirme adresi: http://127.0.0.1:4173 . `dist/` web çalışma zamanlarını, WASM dosyalarını, görselleri, örnekleri ve lisansları içerdiği için depoda tutulur.

| Klasör | İçerik |
| --- | --- |
| src/ | Editör, derleyici ve çalışma zamanı kaynakları |
| dist/ | Web uygulaması, modeller, WASM ve lisanslar |
| scripts/ | Geliştirme ve sürüm araçları |
| tests/ | Otomatik kontroller ve örnek girdiler |
| docs/ | Kapsam ve sürüm notları |

[0.99 değişiklikleri](docs/RELEASE_0.99.md). Tarihsel değişiklikler Git geçmişinde korunur; eski sürüm açıklamaları güncel kullanım talimatı değildir.

[0.100 değişiklikleri](docs/RELEASE_0.100.md).

Pico 0.104: toplu GPIO, sinyal override ve pad kontrolü; gerçek GP14→GP16 geri okuma örneği. [Kapsam ve sınırlar](dist/notices/PICO-COMPAT104.md), [güncel destek tablosu](docs/PICO_SUPPORT.md).

Pico 0.105: sera projesinde MCU resetiyle EEPROM kaybı düzeltildi; sabit DC çözümleri önbelleğe alındı ve çalışan worker görüntü paketleri 20 Hz ile sınırlandı. SDK API eklenmedi. [Kapsam](dist/notices/PICO-GREENHOUSE105.md).

# Wirevo

Tarayıcıda devre kurma, kod derleme ve mikrodenetleyici simülasyonu. Kaynak sürümü: **0.99.0**.

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

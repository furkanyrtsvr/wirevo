# Doğrulama kayıtları

## 0.63 — 17 Ekim 2026

- `npm test`: **1432/1432 geçti**, hata/atlama yok. AVR, ESP ve dokuz kartlık STM32 uçtan uca regresyonu aynı son kaynak ağacıyla çalıştı.
- `npm run test:stm32`: **794/794 geçti**, hata/atlama yok. Yeni kabul; dört F103 kartında fiziksel PB0 üzerinden ADC2 ve ortak IRQ18, Nucleo F401RE/F411RE'de SDHC başlatma, kalıcı 512 bayt blok yaz/oku, FIFO ve gerçek ARM IRQ49 yolunu kapsar.
- `npm run build`: kaynak kopyada başarılı, uygulama kabuğu **447 dosya / 19.726.091 bayt**; GitHub `main` tabanındaki tarihsel roadmap gövdesi korunarak hazırlanan yayın kopyasında **447 dosya / 19.734.229 bayt**. `cortex-m3.wasm` 265.308 bayt (`f8edae1e7c6b084a86a7857419aac2a64513d0458ff5df0622557daaf78ab537`), `cortex-m4f.wasm` 707.457 bayt (`565ee6eea4a035616efc0f99ac83c9a30f6a984cbfd2022810d73cfe1fe7ef87`).
- Profil kapanışı Wirevo'nun belgelenmiş dokuz kartlık uygulama yüzeyidir. Tam ST ürün ailesi, Cube/HAL eşdeğerliği, cycle-accurate silikon ve fiziksel haricî USB/CAN/SD donanımı ürün sınırıdır; eksik özellik listesi değildir.

## 0.62 — 17 Ekim 2026

- İlk genel yerel koşu: **1419 test,1418 geçti,1 worker duvar saati zaman aşımı**;1360+ eski AVR/ESP/STM32 kapsamı tekrar çalıştı. Sıfır hata diye sunulmaz.20s sınırı eşzamanlı native/WASM yükünde aşıldı (27.4s); ortam beklemesi60s yapıldı, veri/voltaj/CRC/IRQ kontrolleri gevşetilmedi. Düzeltme sonrası worker4/4; süreler25.0s/23.2s. Son yeni worker ve canlı düzenleme testleri, tam koşu başlatıldıktan sonra eklendiği için bu1419sayısına dahil değildir.
- Yeni pin/USART/RTC/C++ kabulü **19/19**: beş F4 alternatif/karma SPI1 ile gerçek MCP3008; dokuz kartta0.5/1.5stop ile aralıksız iki UART byte ve gerçek RX IRQ; F401/F411 RTC alt-saniye IRQ41/EXTI17/WFI; C6/F411 C++ DMA/CRC.
- I²C DMA/fast ilk kabulü **13/13**: dokuz kart TX/RX1/2/3/6bayt, LAST/NACK/STOP; native HT/TC IRQ ve16:9 duty. Son SHT31 aktarım ortasında çevre değişimiyle birlikte I²C/worker/Bluetooth grubu **29/29**. SHT31/pot parametreleri dışındaki bağlantı/parametreler aynıyken taşıma korunur; kablo/devre değişikliği tam yeniden kurulum yapar.
- Son yerel i18n/cache/supply/ortak proje **36/36**. GitHub kopyasında `npm run build` ve yeni/etkilenen I²C, pin/USART, RTC, worker, dil/cache/proje dosyaları: **106/106**.
- Komutlar: `node --test --test-concurrency=4 --test-reporter=spec tests/*.test.mjs`; odaklı `tests/stm32-i2c-dma-fast.test.mjs tests/stm32-pin-completion.test.mjs tests/stm32-environment-worker.test.mjs tests/stm32-rtc.test.mjs tests/stm32-usart-formats.test.mjs tests/i18n.test.mjs tests/app-cache.test.mjs tests/cache-supply.test.mjs tests/unified-project.test.mjs`. Son GitHub Actions bütün son kaynakları sekiz shard ile yeniden doğrular; yayın sonucu ayrı devir kaydına yazılır.
- Tarayıcı: F411 C++17 çok dosyalı çevre istasyonu;25°C normal/37°C alarm/25°C geri geçişi, OLED ve EEPROM MEM=0. İlk aktif sensör değişiminde görülen tek NACK/reset hatası tespit edilip düzeltildi; son geçişte SENSOR ERROR yok. Pin penceresinde400000Hz ve0.5/1/1.5/2stop seçenekleri; TR/EN geçişinde değer ve C++17 başlığı korunur. F411 kapsam ekranında CAN/DAC/RNG yok, SDIO var fakat modellenmedi ayrımı doğru. Kanıt görseli üst klasörde Wirevo-0.62-DMA.png.
- İlk CI (run39035247244):7shard başarılı; shard5 iki SCL clamp/release regresyonu nedeniyle başarısız. Canlı güncelleme anahtarında buton iletiminin netleri birleştirmesi gözden kaçmıştı. Düzeltme: bileşen pressed parametresi ve proje settings.pressed topolojiye dahil; yalnız SHT31 sıcaklık/nem ve pot değeri aktarımı korur. Component/project kontrol biçimlerinde C6/F411 SCL recovery + SHT31 aktarım ortası değişimi **6/6** geçti. Başarısız CI Release oluşturmadı; düzeltme ayrı commit ve tam CI ile doğrulanır.
- [Son yerel koşu ve düzeltme kanıtı](LATEST_RUN.txt). Sonuç gerçek çevrebirim eklemeleri ve canlı düzenleme düzeltmesidir; bütün STM32 silikonunun tamamlandığı iddiası değildir.


## 0.61 — 17 Ekim 2026

- `node --test --test-concurrency=4 --test-reporter=spec tests/*.test.mjs`: 1365 test, 1364 geçti, 1 eski SPI NSS beklentisi başarısız. Bu koşu tamamen yeşil olarak sunulmaz. NSS artık çalışan işlev olduğundan testin eski `planned` beklentisi güncellendi; tek NSS seçimi için eksik SCK/MISO/MOSI reddi korunur.
- Düzeltme sonrası SPI regresyonu + yeni örnek C/C++ kabulü + gerçek workspace worker + i18n/cache: **62/62** geçti. `tests/stm32-spi.test.mjs tests/stm32-environment-worker.test.mjs tests/stm32-profile-acceptance.test.mjs tests/i18n.test.mjs tests/app-cache.test.mjs`.
- Son dahili ADC koşusu: **15/15**. Dokuz kart, proje sıcaklığı/VBAT değişimi, startup/sampling korumaları, nominal kanal kapıları ve F4 VBAT kanal18. Yeni SPI NSS/USART OVER8 elektriksel firmware kabulü ayrıca **15/15**.
- Tam koşudan sonra eklenen kabul dosyaları ayrı çalıştırıldı; bu sayılar toplanarak tek tam koşu sonucu gibi gösterilmez. Son GitHub Actions sekiz shard ile bütün son test kaynaklarını yeniden çalıştırır; yayın başarısı ayrıca doğrulanır.
- `npm run build`: başarılı; uygulama kabuğu 445 dosya, yaklaşık19.7 MB. Derleyici ayrı cache'tedir. Son cache/i18n/supply/ortak proje kontrolü: **36/36** geçti.
- Tarayıcı/IAB: F411 C17 yeni dahili ADC örneği arayüzden oluşturuldu, derlendi ve gerçek worker ile çalıştı. 65°C/2.4V için TEMP_RAW1067 / VREF_RAW1502 / VBAT_RAW745. Yenileme ve TR/EN geçişi sıcaklık/VBAT ve USART8× seçimini korudu. PA4 NSS etkin işlevler arasında; eksik SCK/MISO/MOSI uyarısı doğru. İlk tarayıcı kontrolü worker payload filtresindeki ayar kaybını yakaladı; üretim aktarım fonksiyonu ve native worker testleriyle düzeltildi.
- GitHub çalışma kopyasında `npm run build` ve değişen STM32/runtime/worker/pin/SPI örnekleri ile i18n/cache/ortak proje grubunun tamamı: **125/125** geçti.
- [0.61 koşuları — Git geçmişi](https://github.com/furkanyrtsvr/wirevo/blob/89926da32f6060dc985bbc582477ae1df99cccd7/docs/qa/LATEST_RUN.txt). Tüm STM32 silikonu, fiziksel USB/CAN ağı ve yerel ARM MicroPython doğrulandı iddiası yoktur.


- [0.59 STM32 teknik kabulü](QA_0.59.md): Son kapsamlı regresyon 1331/1331; ayrıca ayrı FIFO ve son saat/USB kontrolleri. Bu sayılar farklı koşulardaki sonuçlardır.
- [0.59 tam koşu çıktısı](QA_0.59_RUN.txt).
- [0.60 arayüz / marka kabulü](../RELEASE_0.60.md): 51 odaklı test, ayrıca kısa tekrar ve tarayıcı kontrolü. Tam eski regresyon tekrarlandı iddiası yoktur.
- [Güncel görseller](../GORSELLER.md): GitHub galerisinin ayrı görsel doğrulama kaydı.

0.2–0.58 sürümlerindeki 57 eski QA Markdown dosyası çalışma ağacından kaldırıldı; Git geçmişinde korunur. Eski sürüm notlarındaki bağlantılar silinmeden önceki GitHub commit'ine gider. Test kaynakları, fixture'lar, firmware ve model/lisans belgeleri silinmedi.

Yeni doğrulama sonuçlarını bu dizinde tutun; proje kökünde her küçük değişiklik için yeni QA dosyası oluşturmayın. Mevcut sürüm kaydına komut, tarih, sonuç ve kapsam sınırı ekleyin.

# Doğrulama kayıtları

## 0.61 — 17 Ekim 2026

- `node --test --test-concurrency=4 --test-reporter=spec tests/*.test.mjs`: 1365 test, 1364 geçti, 1 eski SPI NSS beklentisi başarısız. Bu koşu tamamen yeşil olarak sunulmaz. NSS artık çalışan işlev olduğundan testin eski `planned` beklentisi güncellendi; tek NSS seçimi için eksik SCK/MISO/MOSI reddi korunur.
- Düzeltme sonrası SPI regresyonu + yeni örnek C/C++ kabulü + gerçek workspace worker + i18n/cache: **62/62** geçti. `tests/stm32-spi.test.mjs tests/stm32-environment-worker.test.mjs tests/stm32-profile-acceptance.test.mjs tests/i18n.test.mjs tests/app-cache.test.mjs`.
- Son dahili ADC koşusu: **15/15**. Dokuz kart, proje sıcaklığı/VBAT değişimi, startup/sampling korumaları, nominal kanal kapıları ve F4 VBAT kanal18. Yeni SPI NSS/USART OVER8 elektriksel firmware kabulü ayrıca **15/15**.
- Tam koşudan sonra eklenen kabul dosyaları ayrı çalıştırıldı; bu sayılar toplanarak tek tam koşu sonucu gibi gösterilmez. Son GitHub Actions sekiz shard ile bütün son test kaynaklarını yeniden çalıştırır; yayın başarısı ayrıca doğrulanır.
- `npm run build`: başarılı; uygulama kabuğu 445 dosya, yaklaşık19.7 MB. Derleyici ayrı cache'tedir. Son cache/i18n/supply/ortak proje kontrolü: **36/36** geçti.
- Tarayıcı/IAB: F411 C17 yeni dahili ADC örneği arayüzden oluşturuldu, derlendi ve gerçek worker ile çalıştı. 65°C/2.4V için TEMP_RAW1067 / VREF_RAW1502 / VBAT_RAW745. Yenileme ve TR/EN geçişi sıcaklık/VBAT ve USART8× seçimini korudu. PA4 NSS etkin işlevler arasında; eksik SCK/MISO/MOSI uyarısı doğru. İlk tarayıcı kontrolü worker payload filtresindeki ayar kaybını yakaladı; üretim aktarım fonksiyonu ve native worker testleriyle düzeltildi.
- GitHub çalışma kopyasında `npm run build` ve değişen STM32/runtime/worker/pin/SPI örnekleri ile i18n/cache/ortak proje grubunun tamamı: **125/125** geçti.
- [Son yerel tam koşu ve düzeltme çıktıları](LATEST_RUN.txt). Tüm STM32 silikonu, fiziksel USB/CAN ağı ve yerel ARM MicroPython doğrulandı iddiası yoktur.


- [0.59 STM32 teknik kabulü](QA_0.59.md): Son kapsamlı regresyon 1331/1331; ayrıca ayrı FIFO ve son saat/USB kontrolleri. Bu sayılar farklı koşulardaki sonuçlardır.
- [0.59 tam koşu çıktısı](QA_0.59_RUN.txt).
- [0.60 arayüz / marka kabulü](../RELEASE_0.60.md): 51 odaklı test, ayrıca kısa tekrar ve tarayıcı kontrolü. Tam eski regresyon tekrarlandı iddiası yoktur.
- [Güncel görseller](../GORSELLER.md): GitHub galerisinin ayrı görsel doğrulama kaydı.

0.2–0.58 sürümlerindeki 57 eski QA Markdown dosyası çalışma ağacından kaldırıldı; Git geçmişinde korunur. Eski sürüm notlarındaki bağlantılar silinmeden önceki GitHub commit'ine gider. Test kaynakları, fixture'lar, firmware ve model/lisans belgeleri silinmedi.

Yeni doğrulama sonuçlarını bu dizinde tutun; proje kökünde her küçük değişiklik için yeni QA dosyası oluşturmayın. Mevcut sürüm kaydına komut, tarih, sonuç ve kapsam sınırı ekleyin.

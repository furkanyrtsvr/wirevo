# Wirevo 0.61 — STM32 destek profili

ADC1 dahili sıcaklık/VREFINT ve F4 VBAT/4, açılış ve örnekleme süresi korumalarıyla native ARM firmware üzerinden okunur. Sıcaklık ve VBAT yalnız ilgili projenin STM32 Pinler penceresinde saklanır. Çalışma alanının worker payload filtresi bu yeni ayarları taşır; tarayıcı kabulünde bulunan varsayılan değere düşme hatası düzeltildi.

F401/F411 USART1/2 OVER8/OVER16 BRR hesabı ve mode geçişi; F103 için OVER8 reddi. SPI1 master PA4 AF/SSOE NSS çıkışı ve pin penceresinden başlangıç kodu. Donanımsal NSS SPE açıkken LOW kalır; ayrı byte CS pulse iddiası yoktur. SDK cache fingerprint cf-stm32-0.17.

Dokuz kartın her birinde C17 ve C++17 için dahili ADC örneği, JSON/ZIP ayar aktarımı. F103 nominal sıcaklık eğimi ve F4 sıcaklık/VREF/VBAT değerleri ST belgelerine dayanır; fabrika kalibrasyonu, termal fizik veya değişken VDDA modeli değildir.

Doğrulama komutları ve sonuçları [QA dizininde](qa/README.md). Desteklenen işlevler ve ileri emülasyon sınırları [destek profilinde](../dist/notices/STM32-SUPPORT-PROFILE.md), ayrıntılar [denetimde](../dist/notices/STM32-AUDIT.md). Bu sürüm dokuz mevcut kart için doğrulanmış ürün kapsamıdır; tüm STM32 silikonunun eksiksiz emülasyonu değildir.

Sonraki ana kart ailesi RP2040/Pico için ayrı kabul kapılarıyla ilerleyecek. Otomatik olarak tekrar tekrar küçük STM32 sürümleri planlanmaz.

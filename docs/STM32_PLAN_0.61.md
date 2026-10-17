# Wirevo 0.61 devam kaydı

STM32 mevcut dokuz kart için destek profili sürümü. [Kapsam ve kullanım](../dist/notices/STM32-SUPPORT-PROFILE.md), [ayrıntılı denetim](../dist/notices/STM32-AUDIT.md), [test kanıtı](qa/README.md).

- Yeni native ADC dahili kaynaklar, F4 USART OVER8 ve SPI1 PA4 master NSS kabul edildi. Ayarlar proje içinde saklanır ve çalışma alanından worker'a aktarılır.
- Tüm STM32 ailesinin/tüm silikon ayrıntılarının bittiğini söylemeyin. Destek dışı USB host/iso/DMA, harici CAN ağı, tam Cube HAL ve yerel ARM MicroPython gibi kalemler ürün profilinin sınırlarıdır; otomatik bir sonraki STM32 sürümü işi değildir.
- Sonraki ana geliştirme RP2040/Pico: önce resmi kart/çip pinout ve lisanslar, Cortex-M0+ motoru, gerçek C/C++ firmware ve GPIO/ADC/UART/PWM/I²C/SPI elektriksel kabulü. Henüz destek var demeyin. Yeni kart seçimi mevcut tek çalışma alanına eklenir.
- TR/EN sözlüğü yeni metinlerde korunur. Kullanıcı kaynak kodu/terminal/isimleri çevrilmez. circuitforge.studio.v2, dosya formatı ve CF_ ABI uyumluluğu korunur.
- GitHub https://github.com/furkanyrtsvr/wirevo: AGENTS.md sync → fark inceleme → GitHub kopyasında test/derleme → commit/push main → Actions Release doğrulama. Sites yayını ayrı ve aynı public projeye yapılır. README ürün anlatımı/galeri başlıkları korunur.
- Zamanlayıcı kurulmaz. Test sonuçları mevcut QA dizinindeki kayda eklenir; kökte QA dosyası biriktirilmez.

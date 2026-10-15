# CircuitForge 0.37 kabul kaydı

12 Ekim 2026, Europe/Istanbul. Ortak AVR/ESP32 çalışma alanı ve proje akışı.

## Otomatik kabul

- npm test: 490 / 490 başarılı (259.7 s). Önceki 460 regresyon + 30 ortak proje/MicroPython/katalog testi.
- npm run test:c: üç ESP hedefinde gerçek Clang C17 derleme, native CPU yürütme, UART C LED ON/OFF ve kaynak/firmware ZIP geri yükleme kabulü.
- Resmî MicroPython WASM: Pin → fiziksel montajlı LED akımı, kablo kopması; üst düzey await kontrolü programı çalıştırmadan; fonksiyon dışında return reddi.
- SoftI2C: gerçek SHT31 sıcaklık 25 →37 °C, besleme kopunca yanıt kesilmesi. SoftSPI: MCP3008 pot 50 →75 %, gerçek 512 →768 ADC örnekleri.
- ESP kart/dil dokuz kombinasyonu: fiziksel breadboard montajı, JSON/ZIP, firmware kaynak eşleşmesi; korunan runtime dosya adları, yanlış dil ve bozuk firmware reddi.
- Altı AVR kartında LED ve boş kart+breadboard başlangıçları geçerli. Eski ESP v1/v2/v3 JSON gerçek firmware ile ortak projeye taşınır.
- GPIO48 dahil ortak analizör gerçek kenarları kabul eder; statik sahte örnek eğrisi yoktur.

- Katalog ek kabulü: 54 önceki ESP örneği seçili hedef ve ortak breadboard ile açılır; Python/C dil filtreleri doğrulanır.

## Tarayıcı kabulü

Yerel önizleme: Dosya menüsü, mimari/kart/dil seçimi; C3 C17 gerçek derleme ve UART LED ON/OFF; Python SHT31 CRC örneği gerçek 25/50 değerleri ve canlı 37.1/37.2 °C değişimi; aynı breadboard, bileşen kartları ve GPIO grafikleri. C6 ortak katalog MCP3008 örneği gerçek Clang ile çalıştı: pot %50 →100, ADC512 →1023. Konsolda hata görülmedi. Son yayımlanmış sürümde çalışma alanı ve menüler ayrıca doğrulanır; çıktı ekranı kök dizindeki CircuitForge-0.37-Ortak-Calisma-Alani.png içinde.

## Tekrar üretme ve sınırlar

npm ci; npm run build; npm test; npm run test:c. MicroPython, resmî WASM yorumlayıcısıdır ve ESP ROM Python firmware simülasyonu değildir. Canlı etkileşim await js.cf.sleep ile sağlanır; pause yeniden başlatır. C17 sınırlı freestanding HAL/stdout, tam ESP-IDF/libc değildir. Dahili ADC/LEDC/RF ve tam Arduino SDK kapsamı hâlâ DEVAM_PLANI içindeki geliştirme aşamasıdır. API ayrıntıları dist/notices/UNIFIED-WORKSPACE.md.

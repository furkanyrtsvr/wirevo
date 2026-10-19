# Wirevo

Tarayıcıda elektronik devre tasarımı, firmware derleme ve simülasyon çalışma alanı. Kaynak sürümü: **0.77.0**.

**[Wirevo’yu tarayıcıda aç →](https://wirevo-furka.equalwood4.chatgpt.site/)**

AVR, ESP32 ve STM32 kartları; breadboard, kablolama ve net label; C17/C++17 ve desteklenen kartlarda MicroPython; sanal sensörler, seri haberleşme ve ölçüm araçları içerir. Kart ve çevrebirim kapsamı birebir tam silikon modeli değildir; ayrıntılar `dist/notices/` altındadır.

Amaç, fiziksel prototipe geçmeden desteklenen devreleri kurmak, kaynak kodunu çalıştırmak ve sinyal/çevrebirim davranışını incelemektir.

## Wirevo 0.74 · Native bileşen bağlantıları

MCP23017/MPU6050 gerçek çıkışları, I²C aygıt zamanlaması, seviye dönüştürücü arkasında TM1637, ohmmetre ve native RC/RL geçici rejim. Ortak 74 bileşen ESP32-C3, STM32F103C8 ve TM4C123'te ayrı derlenen C17 firmware ile doğrulanır. Eski testler çalıştırılmaz. [Yeni C matrisi ve kesin sınırlar](docs/RELEASE_0.74.md).

## Wirevo 0.73 · Tüm kartlarda ortak bileşen kütüphanesi

Arduino/AVR, ESP32, STM32 ve TM4C123 aynı 74 devre bileşenini, aynı çizim/pin/parametrelerle sunar. Native GPIO aygıt köprüsü TFT, LED matris/segment, shift-register, dijital sensör, servo/motor ve GPIO-UART modellerini kullanır. Firmware API'leri, besleme/lojik seviyeleri ve MCU donanım kapsamı karta özgüdür. Yalnız 21 yeni kontrol; eski testler çalıştırılmaz. [Kapsam ve kanıt](docs/RELEASE_0.73.md).

## Wirevo 0.72 · Paralel ve I²C LCD ailesi

8×2 paralel/I²C ve 16×2 paralel LCD, aynı görsel ailede. TM4C123 için üç hazır C17 devresi ve otomatik `cf_lcd.h` başlığı; gerçek GPIO kenarlarıyla LCD yazıları ve dahili RGB. 0.71 Tiva görünüm/kontrol düzeltmeleri dahildir. Yalnız yeni LCD kontrolleri çalıştırılır. [Kullanım ve sınırlar](docs/RELEASE_0.72.md).

## Wirevo 0.71 · Kart üstü kontroller ve dahili RGB

Tiva kart çizimi sadeleştirildi; SW1/SW2 ve RESET kart üzerinden kullanılabilir. Dahili RGB, C kodunun sürdüğü PF1/PF2/PF3 LED akımlarıyla tek lens üzerinde renk birleştirir. SW1/SW2 bir tıkla basılı tutulur, ikinci tıkla bırakılır. Yalnız bu sürümün 12 yeni kontrolü ve tarayıcı etkileşimi doğrulandı; eski testler çalıştırılmadı. [Sürüm ve çalışan görünüm](docs/RELEASE_0.71.md).

## Wirevo 0.70 · Tiva C LaunchPad / yalnız C17

EK-TM4C123GXL / TM4C123GH6PM için ayrı ARM motoru ve Flash0/SRAM32KiB, otomatik C/driverlib başlıkları, çok dosyalı C kaynakları; GPIO/RGB LED/SW1/SW2, UART0, Timer A ve ADC. Robiz fotoğrafı ve TI şemasına göre özgün kırmızı kart SVG’si. Tam TivaWare veya tüm fiziksel silikon desteği iddia edilmez. [Kullanım/kapsam](dist/notices/TIVA-MODEL.md), [sürüm ve çalışan görünüm](docs/RELEASE_0.70.md).

## Wirevo 0.69 · STM32 işlevsel profil (tarihsel)

Mevcut geliştirme etabı, kullanıcının kabul ettiği model sınırlarıyla kapatıldı. Orijinal ST ROM uyumluluğu ve fiziksel silikonla birebir çevrim/analog eşdeğerliği vaat edilmez; etabın kapanış şartı değildir. ROM yükleme/değiştirme işlem güvenliği düzeltildi; yalnız yeni 21 kontrol. Desteklenen davranışların gerçek hataları normal bakım konusudur. [Kesin kapsam](docs/RELEASE_0.69.md).

## Wirevo 0.68 · STM32 native ROM yolu, I²S ve ileri timer (tarihsel)

Native salt-okunur ROM yükleme/boot alias; tail-chain/late-arrival ve nominal Flash/APB beklemeleri; I²S format/slave/full-duplex extension, TIM1 COM/preload/LOCK. Yalnız yeni `stm32-v068-*` testleri doğrulanır. ST ROM dökümü sağlanmadı; fiziksel çevrim/silikon eşdeğerliği ilan edilmez. Başka kart ailesine geçilmez. [Kesin kapsam](docs/RELEASE_0.68.md), [test kaydı](docs/qa/README.md), [aktif denetim](dist/notices/STM32-AUDIT.md).

## Wirevo 0.67 · STM32 boot protokolleri ve zamanlama tutarlılığı (tarihsel)

F401/F411 işlevsel USB DFU ve panel yükleme/geri okuma; binary USART boot, F103 PMA double-buffer/ISO, USB PID/ACK/NAK, I²C10-bit/SMBus ve native zamanlama düzeltmeleri. Yalnız bu sürümün yeni testleri çalıştırılır. Önceki “STM32 tamamen donduruldu” iddiası geri çekilmiştir; orijinal ROM/pipeline/bus-matrix ve bazı protokol ayrıntıları hâlâ açıktır. [Sürüm ve kesin kalanlar](docs/RELEASE_0.67.md), [test kaydı](docs/qa/README.md), [aktif denetim](dist/notices/STM32-AUDIT.md).

## Görseller

Uygulama yerelde çalıştırılarak alınan dört ekran görüntüsü.

### Çalışma alanı ve devre tasarımı

![Çalışma alanı ve devre tasarımı](docs/images/wirevo-workspace.jpg)

### Çalışan MicroPython devresi ve seri çıktı

![Çalışan MicroPython devresi ve seri çıktı](docs/images/wirevo-simulation.jpg)

### Projeye bağlı pin ayarları

![Projeye bağlı pin ayarları](docs/images/wirevo-pin-settings.jpg)

### STM32 kapsam ve sınırları

![STM32 kapsam ve sınırları](docs/images/wirevo-stm32-scope.jpg)


## Başlangıç

Node.js 24 ve npm ile (GitHub kontrolleri de Node 24 kullanır):

```sh
npm ci
npm run build
npm start
```

Uygulamayı http://127.0.0.1:4173 adresinde açın. `dist/` yalnız yeniden üretilebilir çıktı değildir: çalışma zamanı, derleyici WASM dosyaları, görseller, örnekler ve lisans bildirimleri de içerdiği için depoda tutulur. İlk derleyici kurulumu ağ erişimi isteyebilir.

## Klasörler

| Klasör | İçerik |
| --- | --- |
| src/ | Editör, derleyici ve çalışma zamanı kaynakları |
| dist/ | Web uygulaması, modeller, WASM, lisanslar ve örnekler |
| scripts/ | Derleme, kabul ve sürüm araçları |
| tests/ | Otomatik regresyon testleri ve örnek girdiler |
| docs/ | Kapsam, kabul raporları ve geliştirme geçmişi |

## Kontroller

```sh
npm test
npm run build
npm run test:stm32
```

Bazı özel firmware kabul komutları ek araç zinciri veya ağ indirmesi gerektirir. Önce ilgili script ve kapsam belgesini okuyun.

## Sürümler

[Otomatik GitHub Release akışı](docs/SURUMLEME.md). Eski ayrıntılı sürüm notları [geliştirme geçmişinde](docs/GELISTIRME_GECMISI.md) korundu. Bu notlardaki `dist/`, `docs/`, `QA_*.md` yolları depo köküne göredir.

## Lisans ve kaynak

Üçüncü taraf lisanslar ve kaynak bildirimleri `dist/notices/` altındadır. Projenin tamamına yeni bir açık kaynak lisansı atanmadı.

İlk GitHub aktarımı, yerel CircuitForge kaynağının d50213fa684c26f72ab4a10e22643105e98e8bd1 commit'inden alınmış kaynak görüntüsüdür. Yerel araç ayarları, node_modules ve çalışma arşivleri dahil değildir.

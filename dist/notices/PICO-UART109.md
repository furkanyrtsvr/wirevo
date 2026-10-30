# Pico UART break, sabit parity ve çevre saati — 0.109.0

[56 bileşenli, DHT'leri bağlı yeni projeyi indirin](../examples/pico-uart-laboratory109.json). Wirevo'da **JSON / ZIP aç → Derle → Çalıştır** uygulayın. SDK paketi veya yardımcı uygulama gerekmez. Beklenen son satır: `UART109 COMPLETE failures=0`.

## Bağlantılar korunuyor

DHT11 DATA→GP10 ve DHT22 DATA→GP11 telleri bu projede çıkarılmamıştır. İki sensör de UART break tutulurken okunur; veri baytları ve kontrol toplamları doğrulanır. Sensörlerin açılış bekleme süresine uyulur. GPS GP0/GP1 ve MH-Z19 GP8/GP9 bağlantıları korunur.

GP8→GP17 ek deneme teli, UART1 TX'i UART0 RX'e elektriksel olarak bağlar. Deneme sırasında GP17 UART RX olarak kullanılır; bu pinin bağlı olduğu BMP280 CS hattında aynı anda SPI işlemi yapılmaz. Daha sonra GP17 giriş/pull-up durumuna ve GPS alıcısı GP1'e döndürülür. Diğer devre telleri yerinde kalır; bu örnek bütün protokolleri aynı anda çalıştırdığını iddia etmez.

## Eklenen davranışlar

- **Break:** UARTLCR_H.BRK, aktif karakterin stop bitleri tamamlandıktan sonra TX'i düşük tutar. Kuyruktaki sonraki bayt kaybolmaz; BRK temizlenince devam eder. Alıcı tam karakter süresinden uzun düşük seviyede FIFO'ya bir adet sıfır ve BE/FE bayraklarını yükler. Hat tekrar yükselip yeni başlangıç gelmeden ikinci break karakteri üretilmez. UARTDR/UARTRSR ve break kesmesi uygulanır; UARTECR/ICR ile hata temizlenebilir.
- **Stick parity:** PEN açık ve SPS=1 iken EPS=0 sabit 1 (mark), EPS=1 sabit 0 (space) üretir ve kontrol eder. PEN kapalıysa SPS etkisizdir. Yanlış sabit parity, DR.PE ve alıcı hata durumunda görülür.
- **Saat değişimi:** TX, RX ve alım zaman aşımı olayları UART bit fazını korur. CLK_PERI durdurulduğunda bekleyen aktarım ve timeout ilerlemez; saat açıldığında kaldığı fazdan sürer. RP2350'nin CLK_PERI_DIV bölücüsü de uygulanır.
- **CLK_PERI kontrolü:** iki MCU ailesinde CLOCKS CLK_PERI_CTRL/SELECTED; RP2350'de DIV ve ENABLED durumları desteklenir. Mevcut modelin CLK_SYS, açılış PLL_SYS, 48 MHz PLL_USB ve 12 MHz XOSC kaynakları kullanılabilir. Kaynak değiştirirken saat kapatılıp yeniden açılır. Yeni frekansta aynı baud isteniyorsa firmware UART bölücülerini uygun şekilde yeniden ayarlamalıdır; JSON seçmek bunu otomatik yapmaz.

## Yeni doğrulamalar

Yalnız `tests/pico-uart109.test.mjs` çalıştırılır; önceki testler tekrarlanmaz. Sekiz ARM Pico profilinde:

1. Mark ve space parity ile dört farklı veri baytı; gerçek TX hattında parity bitinin 1/0 örneklenmesi; parity uyumsuzluğu ve hata temizleme.
2. İki DHT'nin okumaları sırasında uzun break, FIFO'da tek break sıfırı, normal veriyle toparlanma.
3. Aktarım sırasında çevre saati kaynağını değiştirme, clock gate, RP2350 bölücü değişimi ve RX timeout'un saat kapalıyken beklemesi.
4. Normal UART'a dönüşte geçerli GPS RMC/GGA ve MH-Z19 850 ppm yanıtı.

Ek iki kontrol, RP2040 ve RP2350'de aktif karakterin ardından break, kuyruk korunması, kısa framing hatasının break sayılmaması, gerçek break kesme işleyicisi ve 48/12 MHz saatlerde MH-Z19 yanıtını doğrular.

Sınır: bu çalışma UART ve sayısal CLK_PERI davranışını kapsar. PLL kilitlenme süresi, analog saat geçişi/metastabilite, ROSC/haricî GPIN saat kaynağı, tüm sistem saat ağacı veya işlemcinin tam çevrim doğruluğu modellenmiş sayılmaz. ROSC/GPIN seçimi desteklenmiyorsa açık hata verir. SDK/CMake ve radyo kapsamı değişmemiştir. Hazard3 bu yeni denetimde sınanmamıştır.

Donanım tanımı: [Raspberry Pi RP2350 veri sayfası, CLOCKS ve UART bölümleri](https://pip-assets.raspberrypi.com/categories/1214-rp2350/documents/RP-008373-DS-2-rp2350-datasheet.pdf).

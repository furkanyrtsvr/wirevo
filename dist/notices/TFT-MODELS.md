# TFT / 74HC4050 · 0.22

Özgün CC0 çizimler, generic8pin write-only breakout: VCC/GND/SCK/MOSI/CS/DC/RST/BL. Ham3.3V besleme/I/O; regülatör yok. Uno5V sinyalleri gerçek74HC4050 üzerinden3.3V seviyeye çevrilir. HC4050 PDIP16 tam pinout, NC13/16; altı bağımsız giriş/sonlu50Ω çıkış,2–6V besleme,0–15V toleranslı giriş,0.3/0.7VCC logic eşikleri. Ara seviyede Hi-Z; propagation/current-limit modeli yok. TFT logic yükü1kΩ, BL330Ω generic yük; evrensel panel akımı iddiası değildir.

ST7735 RAM132×162 ve görünür128×160 offset0,0; ST7789V RAM240×320 ve görünür240×240 offset0,0. Inspector crop ofseti düzenlenebilir. Belirli Adafruit black/green-tab veya240×240 profilinin tüm başlangıç özellikleri iddia edilmez; RAM boyutunda MADCTL MX/MY/MV dönüşü bir kez uygulanır, BGR R/B değiştirir. Rotate eden firmware uygun adres/ofseti seçmelidir.

Gerçek SCK yükselen kenarı, MSB, CSLOW, byte sonundaki D/C; CS arası tamamlanmış bayt ve RGB565 çiftinin ilk baytı korunur, yarımSPIbyte atılır. Native hardwareSPI ve GPIO bit-bang aynı DC pinlerinden geçer. CASET/RASET inclusive pencere, RAMWR başlangıç ve pencerewrap; RGB565 big-endian; yalnız tamamlanmış pixel commit. UnsupportedCOLMOD444/666 pixel üretmez/hata sayar. MADCTL ML/MH display-scan etkisi yok. INVON/INVOFF durumu kayıtlı, optik panel inversion görsel etkisi henüz yok.

Reset/sleep/display controls; reset belleği korur. Başlangıç donanımRGB666, yazılım reset COLMODkorur. Güvenli120ms reset→sleepout ve sleepout→pixel bekleme; ST7789'nin daha kısa bazı5ms command zamanları bu ilkmodelde muhafazakâr120ms olarak alınır. RSTLOW anında reset, min10µs pulse filtresi henüz yok. DISPOFF/SLPIN/BLLOW ekranı kapatır ve RAMkorur. Floating/yanlışbesleme veya IO>VCC+0.3V aktarımı engeller; fiziksel hasar yok. GNDortak gerekir.

Gamma/LUT, scroll/partial, TE, RAMreadback/MISO, RGB444/666, WRMEMC ve display scanning sonraki kapsam. Frame yalnızrevision/crop değişince worker'dan taşınır; anaekran cache DOMyenilenmesinde frame korur.

Kaynaklar: [ST7735S Sitronix](https://www.crystalfontz.com/controllers/uploaded/ST7735S_V1.3_20120620.pdf), [ST7735R](https://cdn-shop.adafruit.com/datasheets/ST7735R_V0.2.pdf), [ST7789V](https://newhavendisplay.com/content/datasheets/ST7789V.pdf), [TI HC4050](https://www.ti.com/lit/ds/symlink/cd74hc4050.pdf), [Nexperia HC4050](https://assets.nexperia.com/documents/data-sheet/74HC4050.pdf).

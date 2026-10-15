# QA 0.26

66 parça / 67 örnek. 74HC595 çift çıkış: native shiftOut A5/3C, latch, OE Hi-Z; yük altındaki ADC 1018→0. 74HC165 giriş: E5→A5 buton kontağı; iki cihaz kaskadı E53C→A53C. Gerçek AVR/GCC üç kaynak: 2974/214, 2748/166, 2756/166 Flash/static SRAM.

On kabul testi: DIP16 tam montaj/pin geometrisi, latch ayrı tutulur, clear yalnız shift, OR-gated CLK/CE kenarı, PL async override, eksik/3.3V besleme, 5V HC giriş reddi, çıkıştan sahte besleme yok. Tarayıcı: 595 live UART/ADC/inspector ve 165 gerçek buton E5→A5.

Model: 2…6V, HC eşikleri 30/70%, push-pull 50Ω; OE tristate parallel, cascade bağımsız. Güç açılışı deterministik sıfır (gerçek donanım belirsiz). ns setup/hold/metastability, termal/akım koruması yok. Kapsam notices/SHIFT-MODELS.md.

Son regresyon: 355 test / 0 hata. Üçüncü native örnek: 74HC165 kaskat E53C→A53C; 2756 Flash /166 SRAM.


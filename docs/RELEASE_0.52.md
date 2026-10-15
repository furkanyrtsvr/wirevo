# 0.52 · HC-05 görünümü ve STM32 encoder

Bluetooth modülü özgün HC-05 esinli SVG ile çizildi. Mevcut sanal UART/BLE ağ modeli ve5pin eski proje geometrisi korunur. HC-05 AT veya Classic SPP firmware emülasyonu iddiası yoktur.

X/Y aynalama: araç çubuğu, Özellikler ve X/Y kısayolları. Çalışma alanı eksenlerinde pin/gövde birlikte aynalanır; kablo kimlikleri değişmez. Bir breadboard aynalandığında takılı bileşenlerin pin/hole kimlikleri korunur. Tek takılı bileşen aynalanırsa çıkar. Undo/redo/kopyalama/JSON/ZIP çalışır; hızlı sayfa yenilemede bekleyen kayıt tamamlanır. Opamp Temel kütüphanesinde mevcut ayarlanabilir iki kanal modeliyle doğrulandı.

TIM2 SMS1/2/3 fiziksel encoder, PSC/DIR/16-32bit ARR/CNT, compare match IRQ, output compare/PWM2, UDIS/URS ve yukarı sayım one-pulse. Encoder pin paneli PA0 A + PA1 B ve projeye özel başlangıç C kodu üretir. Net label encoder kabul projesi F/B terminal komutlarıyla kullanılabilir.

Genel1075/1075, build ve tarayıcı kabulü. Kalan STM32 kapsamı STM32_PLAN_0.52.md ve STM32-AUDIT.md’de korunur. DokuzSTM32/29toplam kart, C17; diğer kart aileleri ve STM32 C++/MicroPython sonraki kapılardır.

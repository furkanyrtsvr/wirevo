# Wirevo 0.108.0

Pico UART TX, 32 baytlık FIFO ve ayrı shift register ile gönderim yapar; FIFO kapalıyken tek bekleme yeri vardır. TXFF/TXFE/BUSY, TX eşik kesmesi, fiziksel CTS/RTS ve UARTDMACR ile DMA bekleme davranışı eklendi. CTS aktif karakteri kesmeden sıradaki baytı bekletir. TXE kapatılması bekleyen baytı korur.

Kesirli baud zamanlaması nanosaniye fazını ardışık karakterlere taşır. Devre çözümünün geçici ara durumları UART'a sahte kenar olarak verilmez. Büyük GPS/MH-Z19 örneği alım sırasında uzun bloklayan yazdırma yapmayacak şekilde güncellendi.

Yalnız yeni `tests/pico-uart108.test.mjs` doğrulamaları: sekiz ARM Pico profilinde büyük sensör devresiyle FIFO/CTS/RTS/GPS/MH-Z19 ve 64 bayt zamanlama; RP2040/RP2350 gerçek TX/CTS IRQ işleyicileri ve FIFO/CTS kontrollü DMA. SDK eklenmedi, eski testler çalıştırılmadı.

Örnek ve sınırlar: `dist/notices/PICO-UART108.md`. DHT veri pinleri bu örnekte CTS/RTS'ye ayrılmıştır; tüm sensörler aynı anda sınanmış sayılmaz. Tam Pico/SDK/çevrim doğruluğu iddia edilmez.

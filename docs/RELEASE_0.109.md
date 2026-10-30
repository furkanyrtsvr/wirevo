# Wirevo 0.109.0

Pico UART'a BRK ile fiziksel düşük çıkış, tek break karakteri/BE hatası ve kesmesi, SPS mark/space parity eklendi. Break aktif karakterin tamamlanmasını bekler; bekleyen gönderim baytlarını korur. Kısa framing hatası ile uzun break ayrılır.

TX, RX ve alıcı timeout olayları bit fazını koruyan bir saat kullanır. Çevre saati kapatıldığında durur, yeniden açıldığında devam eder. CLK_PERI kaynak kontrolü, RP2350 bölücüsü ve desteklenen açılış saat kaynaklarıyla yeni baud bölücülerinin kullanımı eklendi. Tam sistem saat ağacı veya analog clock glitch emülasyonu iddia edilmez.

Yeni 56 bileşenli örnekte DHT11/22'nin GP10/GP11 telleri korunur; iki sensör UART break sırasında okunur. Ek GP8→GP17 UART teli kullanılır, SPI aynı anda çalıştırılmaz. Sonra GPS ve MH-Z19 normal UART bağlantılarıyla doğrulanır.

Yalnız 10 yeni kontrol: sekiz ARM profilinde fiziksel parity/break/clock/DHT ve sensör toparlanması; iki MCU ailesinde break kesmesi ve retune edilmiş 48/12 MHz MH-Z19. Eski testler çalıştırılmadı, SDK eklenmedi. Ayrıntılar: `dist/notices/PICO-UART109.md`.

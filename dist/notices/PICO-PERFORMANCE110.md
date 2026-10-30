# 0.110 — Büyük devrede UART bekleme performansı

Yeni Pico özelliği eklenmedi. SDK uyumluluk katmanındaki `uart_putc_raw`, `uart_getc`, `uart_tx_wait_blocking` ve süre sınırlı alım beklemesi, koşul sağlanmadığında mevcut dahili bekleme işaretini kullanır. MCU zamanı; UART, timer ve devre olaylarının sıradaki sınırına kadar ilerleyebilir. FIFO/baud süresi değiştirilmez. Breakpoint/satır adımı ve uygun olmayan yürütme durumlarında mevcut korumalar korunur; RISC-V veya aktif ikinci çekirdek için aynı hızlanma iddia edilmez.

## Yeni doğrulama

`tests/pico-performance110.test.mjs` dört yeni kontrol içerir. Eski test dosyaları çalıştırılmadı; mevcut 56 parçalı sensör devresi yeni ölçümün girdisi olarak kullanıldı.

| Kontrol | Sonuç |
|---|---|
| 56 parça, 192 bayt, 9600 baud | Aynı baytlar, kayıp 0, 192 kesintisiz UART çerçevesi |
| Önce / sonra komut sayısı | 15.003.000 / 55.000; yaklaşık %99,63 daha az yürütülen komut |
| Tek yerel örnekte duvar süresi | 2169 ms / 359 ms; bu iş yükünde yaklaşık 6 kat |
| Baud zamanlaması | Hesaplanan 192 × 10 bit süresiyle fark < 1 ns |
| Büyük sensör devresi | RP2040 Pico ve RP2350 Pico 2: DHT11/DHT22, GPS ve MH-Z19 akışı; 0 hata, UART kaybı 0 |
| IRQ / zaman aşımı | UART beklerken timer callback’i 1 kez; 3000 µs alım sınırı 3000–3020 µs aralığında |

Duvar süreleri makine yüküne ve tarayıcıya bağlıdır; genel hız garantisi değildir. Yeni firmware derlenmelidir; daha önce dışarıda derlenmiş binary içindeki boş döngüler bu değişiklikle yeniden yazılmaz. Desteklenmeyen beklemeler, bit-bang darbe ölçümü, yoğun analog çözüm ve UI yükü hâlâ zaman alabilir. Tam gerçek zaman ve CPU çevrim doğruluğu hedeflenmez.

## Uygulamada deneme

1. [DHT bağlı büyük sensör projesini indir](../examples/pico-uart-laboratory109.json) ve Wirevo’da içe aktar.
2. **Derle** ile yeni firmware oluştur; **Çalıştır**.
3. Terminalde DHT sonuçları, GPS/MH-Z19 ve `UART109 COMPLETE failures=0` satırını kontrol et.
4. [Kısa yoğun UART ölçüm projesi](../examples/pico-performance110.json) aynı 56 parçalı devrede 192 harf gönderir. Bu, kapsamlı sensör denetiminin yerini tutmaz.

[Güncel destek](../pico-support.html) · [Kullanım kılavuzu](../guide.html)

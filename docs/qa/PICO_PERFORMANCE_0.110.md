# 0.110 — Yeni değişikliklerin doğrulanması

- `node --test tests/pico-performance110.test.mjs`: **4 geçti, 0 hata**; geliştirme kaynağında ve senkronize GitHub kopyasında.
- `npm run build`: GitHub kopyasında başarılı. Eski test dosyaları çalıştırılmadı.
- 56 parçalı UART ölçümünde 192 bayt aynen korundu; kayıp 0, baud süresi hesaplanan çerçeve süresiyle <1 ns farkta.
- RP2040 / RP2350 büyük DHT/GPS/MH-Z19 akışı: `UART109 COMPLETE failures=0`.
- Timer IRQ callback 1; 3000 µs alım zaman aşımı 3002 µs.
- Yerel tarayıcıda Yardım → yeni kılavuz/PDF bağlantıları ve kılavuz içindekilerden UART bölümüne geçiş doğrulandı.
- Kılavuz: 45 A4 sayfa, 38 yer imi, 84 iç/dış bağlantı; bütün sayfalarda metin var. PDF sayfaları render edilerek gözden geçirildi; Türkçe glif kaybı görülmedi.
- HTML kılavuz / güncel destek sayfası: yerel dosya bağlantıları geçerli.

Performans kanıtı `tests/fixtures/pico110/baseline.json` içindeki önceki derleme ölçümüdür. Duvar saati karşılaştırması yalnız belirli makine/iş yükü örneğidir. Farklı makine, tarayıcı ve yükte değişir. Yeni SDK/donanım API’si eklenmedi. Diğer özellikler yeniden doğrulanmış sayılmaz.

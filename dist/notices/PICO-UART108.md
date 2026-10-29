# Pico UART FIFO, akış kontrolü ve zamanlama — 0.108.0

UART artık sınırsız bir gönderim listesi kullanmaz. FIFO açıkken 32 bekleyen bayt ve ayrı bir gönderim kaydırma yazmacı vardır. FIFO kapalıyken tek bekleme yeri kalır. Firmware `TXFF`, `TXFE` ve `BUSY` bayraklarıyla sırayı bekleyebilir. Dolu FIFO'ya bayrakları kontrol etmeden yazılan fazla bayt saklanmaz; denetim sayacında görülebilir.

## Yeni davranışlar

- CTSEN: nCTS yüksekken yeni karakter başlamaz. Devam eden karakter tamamlanır, kuyruk korunur. Hat düşük olunca aktarım sürer. CTS durumu UARTFR'den, değişim kesmesi RIS/MIS/ICR'den izlenir.
- RTSEN: alım FIFO'su seçilen RX eşiğine ulaşınca nRTS yüksek olur; eşik altına indiğinde düşük olur. Otomatik kontrol kapalıyken UARTCR.RTS çıkışı elle yönetir.
- TX kesmesi: FIFO, seçilen TX eşiğinden aşağı geçince oluşur; başlangıçta boş olması tek başına kesme üretmez. ICR ile temizlenebilir.
- TXE kapatılınca aktif karakter tamamlanır, sıradaki bayt korunur. FIFO modunu değiştirmek bekleyen FIFO'yu temizler.
- UARTDMACR etkinliği ve FIFO doluluğu DMA isteklerini sınırlar. CTS durdurduğunda DMA FIFO dolana kadar ilerler, sonra bekler.
- Kesirli baud süresi nanosaniye cinsinden taşınır; ardışık karakterlerde her baytta yeniden yuvarlanıp birikmez. RX örnekleri de bu zaman tabanını kullanır.
- Pico devresinin ara çözümündeki geçici seviyeler UART başlangıç biti sayılmaz. GPIO gözlemi son, kararlı devre çözümünden sonra yapılır.

## Büyük sensör devresinde kullanma

1. [Yeni UART projesini indirin](../examples/pico-uart-laboratory108.json).
2. Wirevo'da **JSON / ZIP aç**, **Derle → Çalıştır** uygulayın. Ek SDK veya uygulama gerekmez.
3. `GPS valid=2 bad=0 RMC=1 GGA=1`, FIFO/CTS/RTS sonuçları, `MHZ19 crc=1` ve `UART108 COMPLETE failures=0` görülür. 64 bayt / 115200 baud aktarımı yaklaşık 5,56 ms sürer.
4. Deneme bitince program uyur. Seri terminalde UART1'in ham tanılama baytları da görünebilir.

56 bileşenli sensör devresi temel alınmıştır. CTS/RTS denemesi için DHT11'in GP10 ve DHT22'nin GP11 veri telleri bu örnekte ayrılmıştır: GP10, UART1 CTS; GP11, UART1 RTS olur. GP22'den GP10'a kontrol teli eklenmiştir. Aynı pin aynı anda DHT ve UART olarak kullanılamaz. GPS GP0/GP1, MH-Z19 GP8/GP9 bağlantıları korunur. GPS alımı sırasında uzun terminal yazdırması yapılmaz; mesajlar alım penceresi sonunda yazdırılır.

## Doğrulama ve sınırlar

Yalnız 10 yeni kontrol çalıştırıldı: sekiz ARM Pico profilinde FIFO/CTS/RTS/baud/GPS/MH-Z19; iki MCU ailesinde gerçek TX ve CTS kesme işleyicileri; iki ailede DMACR/FIFO/CTS ile 64 bayt DMA aktarımı. Eski testler çalıştırılmadı. SDK API'si veya ek uygulama eklenmedi.

Normal UART çerçeveleri ve mevcut FUNCSEL=2 pin eşlemeleri kapsanır. Kesirli baud denemesinde 64 karakterin dijital bitiş zamanı hesaplanan süreden 1 ns'den az sapmıştır. Bu, analog sinyal/radyo modeli, tüm CPU talimatlarının çevrim doğruluğu, çalışma sırasında saat değiştirme, break/stick parity ya da tüm Pico silikon davranışları için doğruluk garantisi değildir. Yeni kontrol Hazard3 üzerinde çalıştırılmadı.

Donanım davranışının kaynağı: [Raspberry Pi RP2350 veri sayfası, UART bölümü](https://pip-assets.raspberrypi.com/categories/1214-rp2350/documents/RP-008373-DS-2-rp2350-datasheet.pdf). Tam SDK/CMake veya CYW43 kapsamı bu sürümde değişmedi.

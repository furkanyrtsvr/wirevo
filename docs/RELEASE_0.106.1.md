# Wirevo 0.106.1

Canlı sera denemesinde görülen LCD aktarım kesilmesi giderildi: yalnız buton, pot veya SHT31 değeri düzenlenince aynı I2C hattının ACK/bit/nibble durumu korunur. Kablo/topoloji ve diğer yapılandırmalar normal yeniden yapılandırma yolundadır. Yeni kontrol, LCD yarım baytının ortasında giriş değiştirir; kaydetme ve sonraki ekran satırları doğrulanır. Eski testler çalıştırılmadı.

0.106 canlı sera hız ölçümü: 54,461 saniye duvar zamanında 5,629 → 60,212 saniye simülasyon; yaklaşık 1×. Arayüz okuma gecikmesi nedeniyle küçük ölçüm farkları bulunabilir. Bu sonuç büyük laboratuvar için 1× garantisi değildir.

0.106'daki donanımsal UART ve printf sınırları açıktır; yeni SDK API eklenmedi.

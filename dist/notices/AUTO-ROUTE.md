# Auto route · 0.56

Devre başlığındaki Auto route · Kabloları düzenle düğmesi bütün kabloları yeniden hesaplar. Bileşenlerin konumu, pin bağlantıları ve kaynak kod korunur. Tek kablo için özelliklerde Köşeli / otomatik rota seçilir. Köşe eklemeden pin → pin bağlantısı da otomatik yönlendirilir; kullanıcı köşeleri korunur.

Dik açılı A* araması: bileşen dışına pin çıkışı; PCB/gövde çevresinden rota; dirsek ve kesişme maliyeti; paralel ana bölümlerde hedef 16 çalışma alanı birimi. Yol bulunamayan veya sıkışık yerleşimlerde önceki rota korunabilir; pin fan-out bölgelerinde aralık daha küçüktür. 16 birim her pin arasında garanti değildir. 45 saniye sınırında proje değiştirilmez. Hesap Worker içinde çalışır; hesap sırasında devre değişirse sonuç uygulanmaz. Geri al/yinele ve JSON/ZIP desteklenir. Kesişmedeki küçük boşluk elektriksel bağlantı anlamına gelmez.

Besleme kırmızı, GND gri, SCL/SCK/CLK sarı, SDA mavi, MOSI/DIN yeşil, MISO/DOUT turkuaz, CS mor; kalan sinyaller paletten atanır. Aynı elektriksel net aynı rengi kullanır. Tek kablo düzenlemesi manuel rengi değiştirmez; bütün devre düğmesi renklendirir. Sonradan değiştirilebilir.

Hazır STM32 çevre/kontrol istasyonları uzun güç kablolarını CF_3V3/CF_GND etiketleriyle yerel olarak gösterir. Aynı adlı etiketler bu projede gerçek elektriksel net oluşturur. Bu sadeleştirme Auto route ile kullanıcı devresine kendiliğinden eklenmez.

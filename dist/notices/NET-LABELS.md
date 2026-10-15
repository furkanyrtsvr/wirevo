# Net label · elektriksel bağlantı

Temel kütüphaneden Net label ekleyin, `NET` pinine kısa kablo bağlayın ve Özellikler → Net adı değerini düzenleyin. Aynı projede **birebir aynı** ad, aynı elektriksel düğüm demektir; büyük/küçük harf ayrılır. Ad 1–32 harf, rakam, `_ + . / -` içerebilir. Etiket yalnızca aynı adlı diğer etiketlere bağlanır; `GND`, `3V3` gibi adlar kart pinlerini kendiliğinden beslemez. İlgili karta veya kaynağa bir etiket bağlayın. Farklı projelerde aynı adlar birleşmez.

Bir kabloyu seçerek **Net label kullan** düğmesine basmak, kabloyu iki ayrı kısa kablo ve aynı adlı iki etiketle değiştirir. Elektriksel net, ölçüm, firmware GPIO ve JSON/ZIP taşınması korunur. Çok büyük projelerde 150 bileşen / 600 kablo sınırı geçilemez. Geçersiz/boş adlar içe aktarma sırasında reddedilir. Fiziksel güç kaynaklarını aynı etikete bağlamak mevcut DC kısa devre denetimine girer.

# Wirevo 0.80.0 — kalan bileşenlerin fotoğraf karşılaştırması

0.79'da tamamlanan 11 parçanın dışındaki **111 fiziksel katalog girdisi** gerçek
fotoğraf referanslarıyla incelendi. Bunların 109'unun özgün çizimleri düzeltildi;
zaten uygun olan breadboard ve şeffaf RGB LED gövdeleri korundu. Ana kart ailesi
çizimleri, soyut net etiketi ve sanal analog kaynak gibi fiziksel ürün olmayan
araçlar bu fotoğraf eşleştirmesine dahil değildir.

Fotoğraflar `.sites-runtime/reference-photos/v080-*` altında yerel referans olarak
saklanır; paket aileleri birden fazla bileşen için ortak referans olabilir.
Fotoğrafların kendisi canlı siteye veya GitHub'a yeniden dağıtılmaz. Kamuya açık
[kaynak ve değişiklik denetimi](qa/photo-audit-v080.json) her parçanın sayfa ve
fotoğraf URL'sini, somut değişikliğini ve aile/varyant sınırını kaydeder.

## Düzeltmeler

- 30 sürücü/haberleşme/sensör kartı: gerçek taşıyıcı oranları ve renkleri,
  optik pencereler, metal microSD/MEMS gövdeleri, terminal ve pasif parçalar.
- 28 eski sensör: siyah kapasitif toprak bıçağı, kapalı altın NDIR odası,
  Fresnel kubbe, küçük Hall/NTC paketleri, metal örgü ve kauçuk joystick.
- 35 paket/ekran ailesi, 48 renk/durum çizimi: HC-05'te gerçek QFP/anten,
  DIP bacakları, metal ekran kenarları, amber flex ve doğru pasif gövdeler.
- 16 diğer çizim: eksik DC motor kutusu/mili, TO-92/TO-220/DIP-4 paketleri,
  IR optikleri, tact metal plakası, 20×4 LCD, gösterge difüzörleri ve PVC kart.
- Dört haneli göstergenin dışarı taşan hanesi düzeltildi. Canlı segmentlerle
  statik çizim aynı yeni yatay ölçeği kullanır; elektriksel bit eşleşmesi korunur.

Ortak pin yazıları 10 birime ve 600 kalınlığa çıkarıldı. Yoğun sıralarda 70°,
seyrek sıralarda 55° açı; yan sıralarda yatay yazı kullanılır. İnce koyu kontur
korunur, opak yazı plakaları eklenmez; adın altındaki bileşen etiketi uzaklaştırılır.

## Sınırlar ve doğrulama

Mevcut projeleri bozmamak için elektriksel bağlantı noktaları ve canlı ekran
alanları sabittir. Bazı gerçek ürünlerin fiziksel pad sırası ile simülasyon
adaptörünün bağlantı sırası farklıdır. Üretim footprint'i veya belirli bir
üretici revizyonunun birebir kopyası iddia edilmez. Örneğin MAX6675 için
MAX31855 taşıyıcı ailesi, LM35 için TMP36 TO-92, bazı DIP'ler için aynı bacak
sayısındaki başka entegre, W25Q32 için W25Q16 SOIC gövdesi referans alınmıştır;
simüle edilen aygıt kimliği ve elektriksel davranışı değiştirilmemiştir.

Yalnız `node --test tests/visuals-v080.test.mjs`, yeni SVG XML kontrolleri,
derleme ve fotoğraf/çizim tarayıcı karşılaştırması uygulanır. Eski test dosyaları
ve firmware kabul testleri tekrar çalıştırılmaz. Bu sürüm görsel kapsamlıdır;
yeni bir silikon veya protokol uyumluluğu iddiası eklemez.

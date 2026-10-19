# v0.75 yeni kabul raporu

- `npm run build`: başarılı; çevrimdışı shell 21 MiB sınırı altında.
- `npm run test:expansion-075`: 167/167 başarılı; son eklenen AVR worker topoloji/yayın kontrolü ayrıca 1/1 başarılı (toplam 168 yeni kontrol).
- 39 davranış senaryosu × AVR/Arduino, ESP32-C3, STM32F103C8, TM4C123: gerçek derlenmiş firmware; 50 yeni profil eksiksiz kapsanır.
- 30 kart profilinde yeni parçaların ekleme/pin/parametre doğrulaması; tüm 30 kartta ayrı ayrı firmware senaryosu yürütüldüğü iddia edilmez.
- Yerel tarayıcı: 0.75 başlığı, 125 katalog girdisi (124 kart-dışı), tact tıklaması/basılı durumu, koyu 12 mm butonun beyaz breadboard montajı ve kontrastı doğrulandı.
- Eski test dosyaları çalıştırılmadı. CI yayın işareti `[expansion-075-only]` yalnız yeni iki dosyayı çalıştırır.

[İşlevsel kapsam ve sınırlar](../RELEASE_0.75.md).

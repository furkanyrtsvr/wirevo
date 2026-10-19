# Wirevo 0.77.0 — görseller, RFID kartları ve doğrudan kontroller

- 50 genişletme bileşeninin özgün SVG çizimleri yenilendi. MFRC522 mavi PCB/anten/IC/kristal; PN532 anteni; GPS patch anteni; DFPlayer microSD soketi; CAN kontrolcü/transceiver/klemens ayrımı. Çizimler üretici PCB footprint kopyası değildir; elektriksel pin kimlikleri ve konumları korunur.
- Kompakt modüllerde 7 birim beyaz dikey pin adları koyu şeritte. Canlı değerler ayrı üst alanda. Seçili bileşenin özelliklerinde geniş yazılı pin listesi; büyütülmüş pin ipucu.
- Beyaz Classic 1K kart bileşeni: personel/ziyaretçi/servis hazır programları, düzenlenebilir 4-byte UID ve 16 ASCII karakter blok 4 verisi. Okuyucunun “Sunulan kart” alanından açıkça eşleştirilir. SUNULDU/UZAKTA düğmesi fare/klavye ile gerçek protokol görünürlüğünü değiştirir. Eski dahili sanal kart seçeneği korunur.
- MFRC522 SPI ve PN532 I²C aynı kart verisini kullanır. Firmware yazmaları aynı okuyucunun simülasyon oturumunda MCU reseti/kart değişimi boyunca korunur. Kartın veri alanını düzenlemek blok 4'ü yeniden programlar. İki okuyucunun eşzamanlı yazmaları veya ayrı oturumlar arasında kalıcı kart belleği paylaşımı iddia edilmez.
- SPST ve SPDT koyu metal gövdeli çizimler: beyaz breadboard üzerinde görünür. SPST üzerinde ON/OFF ve doğrudan tıklama/Enter/Space; SPDT'de 2→1/2→3 seçimi. Pin merkezleri değişmez.
- Reset, yüklü firmware'i sıfırladıktan sonra çalıştırır; duraklatılmış durumda bırakmaz. Tiva güç seçicisi turuncu hareketli kol ve DEVICE/DEBUG USB göstergesi taşır. TI donanımında olduğu gibi USB besleme seçicisidir; debug çalışma modu değildir. İki sanal USB beslemesi mevcut kabul edilir; fiziksel USB/ICDI emülasyonu eklenmemiştir.
- 19 hazır jumper rengi ve özel RGB renk seçici. Eski renkler ve devreler korunur; beyaz kabloda mevcut koyu dış çizgi kalır.

## Yalnız yeni doğrulamalar

`tests/visuals-v077-*.test.mjs`: yeni beyaz kartın UID/verisi ve uzaklaştırılması derlenmiş firmware ile Uno, ESP32-C3, STM32F103C8 ve TM4C123'te; kart/renk/pairing ithalatı tüm 30 kart profilinde; resetten sonra Tiva C başlangıç mesajı ve çalışmaya devam; SPST gerçek DC kontakt dalı; yeni dosyaların çevrimdışı önbelleği. Önceki test dosyaları çalıştırılmaz.

RFID sanal Classic 1K işlevsel modelidir; fiziksel RF, Crypto1, güvenli kart kriptografisi veya gerçek kart UID yazma desteği değildir. Görsel kaynak ve araştırma sınırları: [referans denetimi](qa/visual-references-v077.md).

Birincil başvurular: [TI LaunchPad kullanıcı kılavuzu](https://www.ti.com/lit/ug/spmu296/spmu296.pdf), [Adafruit beyaz Classic 1K kart](https://www.adafruit.com/product/359), [NXP MFRC522](https://www.nxp.com/docs/en/data-sheet/MFRC522.pdf).

# Genel temel elemanlar · 0.32

Üretici parça numarası yerine temel işlev adı gösterilir; çizim/pin düzeni önceki paketlerle uyumludur. Eski JSON türleri ve parametresiz varsayılanları korunur. Modüller ve haberleşme entegreleri kendi parça adlarını taşır.

Diyot: ileri sabit Vf; zener: ters Vz ve ileri Vf. NPN: beta, VBE, VCEsat. MOSFET: VGS açılma gerilimi, RDS ON, gövde Vf. Opamp: iki kanal, açık çevrim kazanç, çıkış direnci. LED Vf ve pot toplam direnci; direnç, kondansatör/ESR, bobin/DCR önceki düzenlenebilir değerleriyle devam eder. Girilen sayılar UI ve JSON sınır kontrolünden geçer.

Anahtar: açık veya 50mΩ kapalı kontak; açık kontak akımı sıfırdır. Ayarlı direnç: toplam Ω × yüzde, en az 1mΩ. Ohmmetre bu iki pasif elemanı ayrı 1V test devresine dahil eder.

Röle: A1/A2 bobin uçları, COM/NC/NO kontakları. Bobin I=(VA1−VA2)/R; |Vbobin| ≥ 0.9×nominal ise NO, aksi halde NC. Kontak 50mΩ ve bobinden elektriksel olarak yalıtılmıştır. Sürücü röle modülü ayrı bir elemandır; o modülün bobin akımı modellenmez. Genel bobinli röle DC direnci, kontak ve bobin akımı Ölçüm panelindedir.

Kapsam: zener/diyot sabit gerilim yaklaşımı; NPN ters çalışma yok, 600mA tanı sınırı; MOSFET geçiş/gate charge yok, ±16V tanı sınırı. Opamp 3–30V besleme, üst railden 1.5V headroom ve 20mA tanı sınırı kullanır; slew rate/bant genişliği/akım sınırlama yok. Rölede bobin L, operate/release gecikmesi, histerezis, kontak bounce, AC arkı veya ısıl hasar yok. Genel isim gerçek üretici SPICE modelini ifade etmez.

Pencere düzeni projenin elektriksel verisinden ayrıdır ve yerel tarayıcı tercihidir. Panel görünürlüğü, iki yan genişlik ve iki ana oran saklanır. Devre + kütüphane hazır düzeni yalnız bu iki çalışma panelini açar. Görünüm veya Varsayılan düzen tüm panelleri geri getirir.

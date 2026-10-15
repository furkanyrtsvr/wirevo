# Analog ve reaktif modeller · 0.17

LM358 DIP-8, kondansatör ve bobin SVG çizimleri CircuitForge için özgün CC0 eserlerdir. Pin/body koordinatları `opamp-hardware.js` içindedir; delik aralığı mevcut breadboard ile aynıdır.

## LM358

Üstten DIP-8: 1 OUT1, 2 IN1−, 3 IN1+, 4 V−, 5 IN2+, 6 IN2−, 7 OUT2, 8 V+. İki kanal aynı MNA sisteminde çözülür. Girişler yüksek empedanslıdır; ayrı sıra/Picard kazanç döngüsü kullanılmaz. Model: sabit açık çevrim kazancı 100000, seçilmiş çıkış direnci 50 Ω; yükseltecin dahili çıkışı V−+0.02…V+−1.5 V arasında active-set ile sınırlandırılır. Bu sayılar ölçülmüş SPICE fit veya tüm yükler için üretici garantisi değildir.

3–30 V besleme ve V−…V+−1.5 V giriş ortak mod aralığı kullanılır. Besleme yoksa veya kontrol uçları boşta ise çıkış kaynağı kurulmaz. Ortak mod ihlali ve >20 mA basitleştirilmiş çıkış akımı bildirilir. Frekans cevabı, slew rate, offset, bias akımı, akım sınırlama, latch-up, ısıl davranış ve besleme akımı modellenmez. Çıkış kaynağının KCL dönüşü V− referansına bağlanan yaklaşık modeldir.

Referans: [TI LM358 / LM2904, SLOS068AB](https://www.ti.com/lit/ds/symlink/lm358.pdf). LM358B/BA katsayıları eski LM358 modeliyle karıştırılmaz.

## Kondansatör / bobin

Genel kutupsuz iki uçlu elemanlar. C değeri farad, ESR ohm; L henry, DCR ohm saklanır. Panel µF ve mH gösterir. Varsayılan 100 µF/1 Ω ve 100 mH/1 Ω. Seri parazit dirençler sıfır olamaz; alt sınır 1 mΩ. Bu çizimler belirli üretici parçası/tolerans veya mekanik footprint sertifikası değildir.

Çalışırken AVR çevrimlerine bağlı bounded backward-Euler companion MNA:

- C: seri `dt/C + ESR`, geçmiş kapasitör gerilimi kaynak ofseti; `Vc += I*dt/C`.
- L: seri `L/dt + DCR`, geçmiş akımı `−L/dt*Iprev` kaynak ofseti; yeni dal akımı geçmişe geçirilir.
- Her adım çözülmeden geçmiş değiştirilmez. GPIO kenarı öncesindeki aralık önceki GPIO durumu ile tamamlanır; ADC örnekleme anında kalan çevrimler çözülür.
- Hedef adım devredeki R/C/L değerlerinden seçilir; 10 µs…1 ms ile sınırlıdır. 10 µs sınırına takılan hızlı devrede Sorunlar uyarısı vardır. Tam adaptif hata tahmini/SPICE transient değildir. Küçük zaman sabitlerinin keskin kenarları bu sınırla yaklaşık kalır.
- İlk run ve MCU reset sıfır enerji ile başlar. Aynı kimlik/tipteki mevcut elemanın Vc/IL durumu devre/parametre/görsel düzenlemede korunur; silinen parça geçmişi atılır. Yeni run/reload için enerji kalıcılığı yoktur.
- Çalışmadan önce DC görünümünde C açık devre, L yalnız DCR'dir. Kopuk uç Hi-Z; ADC fiziksel negatif veya >5 V değerleri AVR modeline 0…5 V sınırında aktarır. Gerçek koruma diyotları, ESR frekans bağımlılığı, çekirdek doyumu, AC fazör, dielectric absorption ve fiziksel hasar modeli yoktur.

RC/RL analitik bir zaman sabitinde 500 bağımsız adım ile <%0.2 göreli hata; gerçek GCC GPIO/ADC şarj-deşarj ve bobin akımı testleri QA_0.17.md'de.

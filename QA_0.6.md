# CircuitForge Studio 0.6 QA

103 otomatik test geçti; src runtime yeniden paketlendi. Önceki74+10 test korunur; yarı iletken model/project19 testi eklendi.

- Üretici pinleri: P2N2222A TO-92 Case29 Style17 ön C1/B2/E3; IRLZ44N TO-220AB ön G1/D2/S3, metal tab4 drain. SVG terminal noktaları metadata ile eşleşir; D.TAB ve D tek elektriksel net. Özgün CC0 SVG, üretici görseli kopyalanmadı.
- MNA diode-current controlled sources ve fixed voltage constraints: NPN β100, VBE0.7V, VCEsat0.2V. 1k baz12.73mA collector/4.3mA base saturation;100k baz4.3mA collector/43µA base active. Emitter resistor geri beslemesi IB+IC Kirchhoff akımıyla çözülür. Collector/emitter aynı net channel bypass edilir; ters C/E kapsam dışı.
- MOS35mΩ channel VGS≥4V; floating gate OFF;1–4V model geçiş bölgesi OFF ve uyarı. Body diode S→D0.7V, gateOFF iken de çalışır; ters akım işareti doğrulanır. Self-biased source-follower kapsam dışı kararsız devre64pass sınırında teşhis edilir.
- 148component49NPN yükte üçten az outerpass ile çözüldü. GPIO state cache ile tekrarlı darbe fazları çözümsüz yeniden kullanılmaz.
- Gerçek Blink iki sürücü devresini açar/kapatır. Gerçek rapid GPIO→NPN/MOS→D2/A0 firmware'i32 kez NPN40:0,1023:1; MOS0:0,1023:1. UI inputs yok. 0.2V ideal ADC floor quantization40.
- Baz bypass AVR drive instruction içinde kesilir. readPin outputları artık listener içinde PIN refresh olmadan da güncel public pinState gösterir; eski GPIO/UART/PWM testleri geçti.
- Tarayıcı NPN1k/100k: VCE0.200V,IB4.30mA,IC12.73mA SATURATION→VCE2.054V,IB0.04mA,IC4.30mA ACTIVE. Duraklatılmış parametre değişimi anında uygulandı.
- Tarayıcı MOS iki1ms adımla VGS5.000V,ID13.63mA ON; dört terminalG/D/S/D.TAB noktası çizimle eşleşti.
- Tarayıcı eksik baz direncinde Hata ve 'NPN bazında akım sınırlama direnci gerekiyor.' açıkça göründü.
- Özellikler paneli kompakt; seçim değişince üstten açılır. LED ana ölçümü cycle-window ortalaması, IC/ID ise anlık DC değeridir; etiket LED ORT. AKIM olarak ayrılır. GRID9.6 mekanik kalibrasyon iddiası yok.

Sabit katsayı DC yaklaşımıdır; sıcaklık, gate-charge/transient, analog MOS transfer bölgesi, reverse NPN ve breakdown simüle edilmez. Scope/notices dosyasında ve parça özelliklerinde açık; SPICE veya gerçek part worst-case iddiası yok. Public yayın kaydı sonraki checkpoint'e eklenir.

Tarayıcı 3.3V MOS gate: VGS3.300V,ID0.00mA OFF; Sorunlar panelinde '1–4V VGS: geçiş bölgesi model dışında; kanal OFF.' görüldü.

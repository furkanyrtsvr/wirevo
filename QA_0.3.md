# 0.3 doğrulama · 2026-10-09

60 otomatik test geçti: pin/net, segment normal taşıma/sabit uçlar, uçta dirsek, mount delik/occupancy/rotation/JSON, DC direnç/LED, yüklü pot/pull-up, gerçek ADC=512, ADC kendi pad gerilimi, dış pad edge/timer T0 aboneliği, frekans/duty/cursor, 800 UART mesajı ve worker komutları.

1280×720 tarayıcı: Run→Durdur, Durduruldu, Pause→Devam et. Yatay kablo 120→177.6 taşındı, uçlar sabit ve Undo eski rota. Shift r1+led1, çoğalt 4→6, Undo 4. r1 c5/c11→c7/c13 sürükleme + Undo. Gerilim bölücü 2.50 V/ADC=512/PWM=127. PWM 490.19 Hz/%60 gerçek kenar grafiği.

SVG image hit alanı ve breadboard pin katmanı düzeltildi: gövdeden parça sürükleme alttaki deliklere takılmaz; bacak pininden kablo çizme korunur.

GCC, responsive ve yayın sonuçları son doğrulamada eklenir. Fiziksel cihazla kalibrasyon yapılmadı; kısıtlar README ve devam planında.

Gerçek GCC: Blink INTERVAL=250 düzenlendi, Derle 1.57 s / 5702 byte başarılı; gerçek cycle grafiği 2.00 Hz / %50.

Dar ekran kontrolü: tarayıcı viewport override uygulanmadı; gerçek boyut 1280x720 kaldı. 390px görsel yeniden doğrulaması bu araçla tamamlanamadı. Responsive CSS önceki sürümden korunur; canvas araç çubuğu 321px.

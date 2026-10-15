# CircuitForge 0.29 doğrulama — 2026-10-11

68 bileşen /72 örnek. npm run build başarılı; npm test: 377 test /0 hata.

İki gerçek native AVR GCC firmware: 2996 byte Flash /170 byte SRAM. scripts/check-adc-acquisition.mjs ve tests/fixtures/adc-acquisition.json ile yeniden üretilebilir. Yedi yeni kabul testi acquisition başlangıç/bitiş, RC/hold, kanal hafızası, pot+seri Thevenin empedansı, VDD/saat sınırları, kopuk/reaktif kaynak ve geciken kenarda hız ihlali korumasını doğrular.

Ayrı localhost:4174 origin üzerinde tarayıcı GCC derlemesi ve simülasyon kontrolü yapıldı. Yüksek empedans terminali 1MHz CH0=263, 125kHz CH0=510, 4MHz CH0=0. Düşük empedans terminali sırasıyla 511 /512 /0 verdi. Özellikler paneli son dönüşümde INVALID /clock-too-fast gösterdi. Tarayıcıda görülen UART kesmesi uç durumu düzeltildi: aktarımda hız ihlali CS bitene kadar korunur; yeni CS geçerli saatle toparlanır. Mevcut kullanıcı projesine dokunulmadı.

Model sınırları dist/notices/ADC-ACQUISITION-MODEL.md: 20pF/1kΩ ve dirençli Thevenin kaynağıyla tek yönlü bounded acquisition; tam MNA kapasitör yükleme/SAR charge redistribution/koruma/noise modeli değildir. Reaktif ve nonlinear kaynak yolları açıkça unsupported.

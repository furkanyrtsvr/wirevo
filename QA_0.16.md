# QA 0.16 — 10 Ekim 2026

207 otomatik test geçti (0 hata). Yeni7 test exact550dosya/pinnedtoolchain/64MiB sınırı, doğrulanmış offline okuma ve ağ fallback yokluğu, SHA/boyut/truncation reddi, corrupt cache eviction/deduplication/izole temizleme, iptal/kısmi kayıt, gerçek besleme LED akımı/0V/legacy5V/JSON ve kaynak çatışmasını kapsar.

Tarayıcı localhost kendi test projesi: Hazırla → 550/550,52.7MB,Hazır. Worker fetch bağlama hatası düzeltildi; tamamlanan hazırlama tekrar kontrol edildi. Cache-only seçildi, yeni sketch.ino OFFLINE_GCC_016 eklendi. Sahip olunan preview PID22188 kimliği doğrulanarak kapatıldı. Server kapalıyken reload çalıştı; gerçek GCC 0.82s,4406byte/SRAM368. Simülasyon UART OFFLINE_GCC_016 ve RTC0x68 ACK0 verdi. Hazır firmware eşleşmesi kullanılmadı: yeni kod açık Derle ile derlendi. Sistem İnternet bağlantısını kapatma testi değil; worker yalnız cache modu ve kapalı origin ile doğrulama.

DC supply UI:5→3.4V klavye ve blur; canvas3.40V.31V reddedildi, eski3.4 korundu; reload sonrası3.40V. Browser fill tek başına change üretmediği için gerçek klavye olaylarıyla kabul yapıldı. Görüntü ../CircuitForge-0.16.png. Public Studio kullanıcının projesi üzerinde test yapılmadı.

Sınırlar: ideal DC, akım regülasyonu yok. Cache origin/cihaz bazlı, eviction kullanıcı/tarayıcı elinde. HTTPS/localhost service-worker desteği gerekir. Offline eksik dosya503/açık derleme hatası, projeler localStorage'da korunur. Yeni SPI/MAX7219 modülleri sonraki aşama; henüz uygulanmadı.

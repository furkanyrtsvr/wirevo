# 0.104.0 — Pico GPIO SDK ve fiziksel pin davranışı

GPIO toplu yazma/yön/fonksiyon seçimi, giriş/çıkış/OE override, pad ayarları ve durum okuma API'leri eklendi. Pad OD ve RP2350 ISO artık fiziksel çıkışı bırakır; SIO latch korunur. Yeni GPIO geri okuma örneği gerçek GP14→GP16 bağlantısını kullanır.

Yalnız 16 yeni kontrol: sekiz ARM ve dört Hazard3 kart profili, iki ailede çıkış ayırma ve iki ailede seçilebilir örnek. Eski testler çalıştırılmadı. Tam resmi SDK veya birebir silikon tamamlandı iddiası yoktur. [Yeni kapsam](../dist/notices/PICO-COMPAT104.md), [toplu durum](PICO_SUPPORT.md).

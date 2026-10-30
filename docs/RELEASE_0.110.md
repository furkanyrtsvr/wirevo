# Wirevo 0.110.0

Büyük sensör devresinde UART SDK beklemeleri boş CPU dönüşünden mevcut olay beklemesine geçirildi. Aynı 192 bayt / 9600 baud ölçümünde 15.003.000 yerine 55.000 komut yürütüldü; tek yerel ölçümde 2169 ms yerine 359 ms. Baytlar, baud süresi, timer IRQ ve alım zaman aşımı korundu. Bu belirli bir iş yükü ölçümüdür; bütün projelerde gerçek zaman garantisi değildir. Eski firmware yeniden derlenmelidir.

Yeni Pico donanım veya SDK API’si eklenmedi. Güncel kapsam tek destek sayfasında toplandı; eski açıklamalar arşive taşındı. Kaldırılmış yerel SDK yardımcısına yönlendiren hatalı yardım metni düzeltildi.

Profesyonel A4 kullanım kılavuzu: içindekiler, kavramlar, bağlantı şemaları, kod/derleme/debug, ölçüm, örnek devreler, sorun giderme, 38 kart profili, 126 bileşen tanımı ve üretici kaynakları. HTML ve PDF, Yardım menüsünden erişilir. Fiziksel ürün bilgileri simülatör kapsamından ayrılır.

Doğrulama: yalnız dört yeni performans/bekleme kontrolü ve yeni yardım/kılavuz akışı. Eski test dosyaları çalıştırılmadı. [Ayrıntılı ölçüm ve sınırlar](../dist/notices/PICO-PERFORMANCE110.md).

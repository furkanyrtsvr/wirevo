# 0.102.0 — Pico SPI/UART ve GPIO uyumluluğu

Pico C için SPI0/SPI1 4–16 bit/dört mod aktarımı, ek UART SDK çağrıları, PL011 loopback/FIFO/alım kesmesi/timeout/taşma davranışları ve seri terminalde baud ile sıralı alım eklendi. GPIO fonksiyon seçiminin pad giriş/izolasyon işlemleri düzeltildi; gerçek SDK tarzı kodlar fazladan gpio_init olmadan veri okuyabilir.

Projeler menüsünde iki yeni SPI16 ve UART loopback örneği bulunur. Ek uygulama gerektirmez. Yalnız 17 yeni kontrol; sekiz kartın ARM çalışması, iki ailenin UART kayıtçı/terminal davranışları, yeni örnekler ve Hazard3 UART çalışması doğrulandı. [Kapsam ve açık sınırlar](../dist/notices/PICO-COMPAT102.md). Tam SDK/CMake, radyo veya birebir silikon tamamlandı iddiası yoktur.

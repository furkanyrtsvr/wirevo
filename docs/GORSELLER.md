# Wirevo görsel doğrulama kaydı

16 Ekim 2026 tarihinde Wirevo 0.60 yerel kaynağı ayrı QA adresinde çalıştırılarak CUA tarayıcısından alınmıştır. Görseller gerçek arayüzdür; eski logonun üstüne yeni logo yapıştırılmadı.

- `wirevo-workspace.jpg`: NUCLEO-F401RE, C17 çevre istasyonu; Wirevo W logosu ve sağ üst TR / EN.
- `wirevo-simulation.jpg`: NUCLEO-F411RE, çalışan MicroPython çevre istasyonu; sıcaklık25°C/nem50%/ADC512 ve seri çıktı gözlendi. Bu mod WASM MicroPython + devre adaptörüdür, yerel ARM MicroPython portu değildir.
- `wirevo-pin-settings.jpg`: Projeye özel C17 pin/çevrebirim yapılandırması, İngilizce görünüm.
- `wirevo-stm32-scope.jpg`: Güncel STM32 kapsam ve kontrol kaydı; eski README galerisindeki aynı konu korunur.

Eski CircuitForge ekran görüntüleri güncel galeriden ve çalışma ağacından kaldırıldı; Git geçmişinde kalır. Görseller tüm silikon, harici API, fiziksel cihaz veya üretim ortamı için kabul testi sayılmaz.

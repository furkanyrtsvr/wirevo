# CircuitForge 0.40

Mevcut ESP32 kataloğunun 321 örneği, 42 worker yaşam döngüsü ve 14 bütünlük denetimi başarılı. Haricî EEPROM'un MCU reset sırasında silinmesi düzeltildi; tamamlanmış ve sürmekte olan yazmalar korunur. 584 genel test geçti. Kabul raporu uygulama yardımından ve çevrimdışı önbellekten açılabilir.

Bir sonraki ana geliştirme STM32F103C8 Blue Pill'dir. Gerçek ARM Clang/LLD hazırlığı, vektör adresi ve flash/SRAM taşma denetimi tamamlandı. CPU/MMIO motoru, breadboard/DC ve worker kabulü tamamlanmadan karta çalışır simülasyon etiketi verilmeyecek.

Kapsam, sınırlar ve yeniden üretim: QA_0.40.md; dist/notices/ESP32-ACCEPTANCE.md; docs/STM32_PLAN_0.40.md. Mevcut üç dil, kart profilleri ve ortak çalışma alanı korunur.

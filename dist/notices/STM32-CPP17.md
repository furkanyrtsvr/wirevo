# STM32 C++17 · CircuitForge 0.55

STM32 yeni proje ekranında C17 veya C++17 seçilir. main.cpp yanında .cpp/.c/.hpp/.h dosyaları kullanılabilir; C sürücüler C17 ile ayrı derlenir. Clang gerçek ARM firmware üretir; JavaScript C++ sonuçlarını taklit etmez.

Global constructor öncelikleri/init-array, local static başlangıcı, template/lambda/virtual dispatch, placement/aligned/nothrow new ve sized delete desteklenir. Heap gerçek kart SRAM'ında _ebss sonundan başlar, stack için 1024 byte ayrılır; first-fit/split/coalesce, malloc/free/calloc/realloc mevcuttur. Ordinary new bellek tükenince ARM fault, nothrow new nullptr üretir. Ana fonksiyon dönünce kayıtlı global destructor'lar ters sırayla çalışır; kayıt kapasitesi 32'dir. Watchdog reset data/bss, constructor ve heap'i yeniden başlatır.

Bu küçük freestanding SDK'dır: tam STL/libstdc++, exceptions, RTTI ve thread desteği yoktur. -fno-exceptions -fno-rtti -fno-threadsafe-statics kullanılır. Heap IRQ/thread eşzamanlı kullanımına uygun değildir. cf_hal.h ve sağlanan IRQ bildirimleri C ABI kullanır; kullanıcıya ait C sürücü header'larında extern C guard gerekir.

29 yeni test: 20 gerçek ARM runtime/heap/IRQ/constructor testi ve 9 proje/C sürücü/pin yapılandırma/JSON-ZIP testi. Dokuz STM32 kartında çalıştırıldı. Genel kabul 1246/1246, 0 hata/iptal/atlanan; 328486.9232 ms. STM32 MicroPython, tam Cube HAL ve tüm silikon çevrebirimleri henüz desteklenmez.

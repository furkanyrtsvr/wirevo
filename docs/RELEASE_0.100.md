# 0.100.0 — tarayıcıda isteğe bağlı Pico C kaynak paketleri

Varsayılan Derle → Çalıştır kurulumsuz çalışır. Kullanıcı isteğe bağlı olarak manifest + gerçek C/H kaynaklarını ZIP veya klasör seçerek ekler. Paket probe programı ve C kaynakları Clang/WebAssembly ile derlenmeden projeye uygulanmaz. JSON tek başına SDK değildir.

Paketler bu sayfada veya tercihe bağlı IndexedDB'de saklanır; proje yalnız SHA-256 kimliği taşır. Başka bilgisayarda aynı paket yeniden seçilir. Paket değişikliği firmware'i geçersiz kılar; eksik paket açık hatayla bildirilir. İki indirilebilir örnek resmi SDK 2.2.0 RP2040/RP2350 adres başlıklarını ve gerçek ek C kaynağını içerir.

Tam upstream SDK/CMake, native derleyiciler, assembly, .a/.o, harici üreticiler desteklenmez. Yardımcı/Python/port/anahtar/yerel servis ve sunucuda derleme yoktur. Çevrebirim emülasyonunun kapsamı değişmez.

Yalnız yeni kaynak paketi kontrolleri: sekiz kartta gerçek WASM derleme ve LED devresi, ZIP/klasör eşitliği, eksik/uyumsuz dosyalar, çalışma zamanı başlık çakışması, JSON/ZIP proje korunması, paket kimliği ve Worker aktarımı; ayrıca tarayıcıda içe aktarma, kalıcı saklama ve kaldırma akışı.

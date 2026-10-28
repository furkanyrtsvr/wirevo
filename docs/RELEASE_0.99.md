# Wirevo v0.99.0 — tarayıcı kullanımına dönüş

Yerel SDK bağlantısı ve Python/Tk yardımcıları kaldırıldı. Derle düğmesi tarayıcıdaki WebAssembly derleyicisini kullanır; site Python, SDK yardımcısı, port/kod/JSON eşleştirmesi veya masaüstü uygulaması başlatmaz. Yeni proje ekranından yerel SDK seçimi, yardımcı paketi ve bağlantı menüsü kaldırıldı. İsteğe bağlı hazır ARM UF2 içe aktarımı korunur.

Eski projelerdeki sdk-local ayarı browser olarak normalleştirilir; kaynak kodu ve devre silinmez. Kaldırılan yardımcıya ait sekme anahtarları ve açılış fragment'i temizlenir. Yerel SDK'ye özel örnek menüden kaldırıldı; eski sdk095 örnek kimliği tarayıcı CMake örneğine yönlendirilir.

GitHub çalışma ağacından yardımcı programları, paketleme scripti/ZIP'i, yalnız yardımcıya ait testler ve deneysel sürüm/kurulum notları temizlendi. Çalışan kart modelleri, bileşenler ve lisanslar korunur. Silinen dosyalar için Git geçmişi değiştirilmez.

Tam upstream Pico SDK/CMake, tarayıcı alt kümesiyle aynı şey değildir; kapsam belgeleri ve README bu sınırı açıklar. Yalnız yeni tarayıcıya dönüş, eski JSON uyumluluğu ve kaldırılan dosya/bağımlılık kontrolleri çalıştırılır.

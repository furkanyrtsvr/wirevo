# İsteğe bağlı Pico UF2 içe aktarımı

Wirevo normal kullanımda kaynak kodu tarayıcıdaki WebAssembly derleyicisiyle derler. Python, yerel SDK yardımcısı, port veya bağlantı kodu gerekmez. Tam upstream Pico SDK/CMake tarayıcı içinde çalıştırılmaz; desteklenen CMake alt kümesi PICO-BROWSER-CMAKE.md dosyasında açıklanır.

Elinizde daha önce başka bir yerde üretilmiş ARM UF2 varsa Pico C projesinde **UF2 yükle** üzerinden içe aktarabilirsiniz. RP2040/RP2350 ailesi ve dosya boyutu doğrulanır; firmware tarayıcıdaki işlemci/çevrebirim modelinde yürütülür. Bu yol normal kullanımın ön koşulu değildir ve Wirevo herhangi bir ek uygulama başlatmaz. Native SDK UF2 kaynak satırı debug eşlemesi yoktur; firmware'in bütün çevrebirimleri desteklenmiş sayılmaz.

Yerel SDK derleme ve yardımcı program dosyaları 0.99 ile kaldırılmıştır. Önceki sürümlerin kaynakları yalnız Git geçmişinde bulunur.

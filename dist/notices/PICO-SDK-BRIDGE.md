# Resmi Pico SDK → Derle → simülasyon — v0.97.0

Pico C / ARM projelerinde **Pico SDK / CMake → Resmi Pico SDK · bu bilgisayarda** seçilebilir. **Derle**, main.c ve ek kaynakları bilgisayardaki yardımcıya gönderir. Yardımcı gerçek CMake/Ninja ve Arm GNU ile kurulu resmi Pico SDK'yi kullanır. Günlükler Derleme terminaline gelir. Başarılı UF2 doğrulanır, firmware projeye kaydedilir ve simülasyona **duraklatılmış olarak otomatik yüklenir**. **Çalıştır** programı başlatır. Her derlemede dosya kaydetmek veya UF2 seçmek gerekmez.

## Bir kez kurulum

1. [Yardımcı paketini indirin](../wirevo-sdk-helper.zip), bir klasöre açın. Python 3.9+, resmi Pico SDK (gereken submodule'larıyla), Arm GNU, CMake ve Ninja kurulu olmalı.
2. Windows'ta `wirevo-sdk.cmd` dosyasını başlatın. İlk kullanım araçların yollarını sorar. Arm GNU için bin klasörünün üstünü; CMake/Ninja için program dosyalarını seçin.
3. Açılan Wirevo sayfasında **Doğrudan bağlan** düğmesine basın. Alternatif olarak Pico SDK panelindeki **Bağlantı dosyası seç** ile yardımcının gösterdiği connection.json dosyasını açın. Bu dosya tarayıcıda okunur, Site sunucusuna yüklenmez. Dosyayı seçtikten sonra **Doğrudan bağlan** düğmesine basın. Bağlantı kodu alanı boşsa geçerli yardımcı bağlantı dosyası henüz seçilmemiştir.
4. Tarayıcının Wirevo için yerel ağ / localhost erişimine izin verdiğinden emin olun. Brave’de adres çubuğunun solundaki site kontrolleri → Site ayarları → Yerel ağ erişimi / Localhost erişimi → İzin ver. İzin yalnız Wirevo için verilmeli; ardından sayfayı yenileyip bağlanın. İzin adı tarayıcı sürümüne göre değişebilir. Site bu izni kendisi açamaz. Doğrudan bağlantı başarılıysa ayrı tarayıcı penceresi gerekmez; yardımcı işlem açık kalır. Yerel pencereyle bağlan seçeneği alternatif olarak korunur. Yardımcı yeniden başlatılınca yeni bağlantı koduyla bağlanın.

Yardımcı yalnız 127.0.0.1 üzerinde dinler; LAN/public sunucu açmaz. Her oturum ayrı rastgele bağlantı kodu, tam Origin/Host kontrolü ve Authorization başlığı kullanır. Bağlantı bilgisi yalnız bu sekmenin sessionStorage alanındadır; proje JSON/ZIP'ine ve kaynak anahtarına eklenmez. Açılış URL'sindeki bağlantı kodu fragment'tedir; HTTP isteğiyle Site sunucusuna gitmez ve arayüz tarafından adres çubuğundan kaldırılır.

CMake projenizdeki komutlar bilgisayarınızdaki kullanıcı hesabıyla çalışır. Bu yerel araç bir işletim sistemi sandbox'ı değildir; kendi güvendiğiniz projelerinizle kullanın. İptal, sahip olunan derleme işlem ağacını durdurur. Geçici kaynak/derleme klasörleri işlem sonunda silinir. İşlem zaman sınırı varsayılan 300 saniyedir. Kurulum bağımlılık indirmez, bilgisayarın açılış ayarlarını değiştirmez.

## Projeler

**Projeler → Pico C · Resmi SDK / Derle** örneği gerçek CMake math/configure_file, ayrı statik C kütüphanesi, ikinci çekirdek GPIO15 ve USB terminalini kullanır. Beklenen çıktı `SDK_DERLE095 73`, bağlı LED yaklaşık 3.94 mA'dır. Bu örneğin CMake kodu tarayıcıdaki sınırlı değerlendirmeden geçirilmez.

Birden fazla executable varsa SDK panelindeki CMake hedefini yazın. Seçilen hedef gerçek CMake `--target` olarak derlenir. Tek hedef varsa otomatik bulunur. Derleme başarısızsa veya iptal edilirse firmware yüklenmez. Kaynak derleme sırasında değişirse gelen eski sonuç kullanılmaz. Bağlantı yoksa açık hata verilir; tarayıcı derleyicisine sessiz geçiş yapılmaz.

Resmi mod `pico/...` başlıklarını ve kurulu SDK'yi kullanır. Eski Wirevo uyumluluk başlıklarına özgü kodlar için tarayıcı yöntemi kullanılabilir; her C kütüphanesinin MCU/simülasyon uyumluluğu kendiliğinden sağlanmaz. Proje kaynak sınırları 16 dosya / toplam 100 KB; UF2 aktarımı en fazla 1 MB'dır.

Pico/H → pico, W/WH → pico_w, Pico 2/header → pico2, Pico 2 W/header → pico2_w. Bu bağlantının firmware yükleme yolu ARM içindir; Hazard3 ve native SDK kaynak satırı debugger eşlemesi bu sürümde yoktur. Derlemenin gerçek SDK ile yapılması, emüle çevrebirimlerin veya CYW43 radyosunun tam silikon modeline dönüştüğü anlamına gelmez. Radio kapsamı değişmedi.

Windows ayarları LOCALAPPDATA/WirevoSDK/config.json içindedir; diğer sistemlerde yardımcının yazdığı klasördedir. İleri kullanım: `python wirevo-sdk-bridge.py --config config.json --port 18765`. Manuel JSON/UF2 iş akışı da korunur.

## Canlı site ve yerel bağlantı penceresi

Bazı yerleşik tarayıcılarda HTTPS sayfasından yardımcıya arka plan HTTP isteği tamamlanmayabilir. Yerel pencere yöntemi, açıkça açtığınız 127.0.0.1 bağlantı penceresinin kendi sunucusuyla iletişim kurmasını sağlar. Wirevo ile bu pencere arasındaki mesajlar tam origin, yalnız açılan pencerenin kimliği, rastgele eşleştirme nonce'u ve yardımcı token'ıyla denetlenir. Yalnız SDK status/derle/ilerleme/iptal yolları iletilir; genel amaçlı proxy değildir. Yardımcı kodu ve token localhost'ta kalır, kamuya açık sunucu açılmaz. Tarayıcı veya işletim sistemi güvenlik ayarları değiştirilmez.

Pencereyi kapatırsanız tekrar bağlanın. Sekme yenilendiğinde de pencereyi yeniden eşleştirin. Yardımcı 0.96 paketinde sdk-relay.html ve sdk-relay.js dosyaları Python dosyasının yanında olmalıdır; eski ZIP kullananlar güncel paketi açmalıdır.


## Doğrudan bağlantı hata ayrımı (0.97)

Boş bağlantı kodu, yanlış proje/ayar JSON’u ve geçersiz port, ağ isteği gönderilmeden açıklanır. Brave ağ hatalarında siteye özel localhost izni için açık yönerge verilir. Kimlik doğrulama hatası ayrı tutulur; izin sorunu olarak gösterilmez. Doğrudan bağlantı yalnız doğrulanmış status yanıtından sonra eski sahip olunan yardımcı penceresini kapatır ve eski pencere taşıma kaydını bırakır. Başarısız deneme çalışan pencere bağlantısını bozmaz.

Brave’in kendi açıklaması: https://brave.com/privacy-updates/27-localhost-permission/ . Yerleşik tarayıcıdaki arka plan loopback erişimi bu ortamda doğrulanamadı. Bu sürüm tarayıcı izinlerini veya güvenlik ayarlarını değiştirmez; HTTP, WebSocket veya iframe ile izin denetimini aşmaya çalışmaz.

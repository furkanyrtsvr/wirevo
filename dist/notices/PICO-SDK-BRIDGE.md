# Resmi Pico SDK → Derle → simülasyon — v0.98.2

Pico C / ARM projelerinde **Pico SDK / CMake → Resmi Pico SDK · bu bilgisayarda** seçilebilir. **Derle**, main.c ve ek kaynakları bilgisayardaki yardımcıya gönderir. Yardımcı gerçek CMake/Ninja ve Arm GNU ile kurulu resmi Pico SDK'yi kullanır. Günlükler Derleme terminaline gelir. Başarılı UF2 doğrulanır, firmware projeye kaydedilir ve simülasyona **duraklatılmış olarak otomatik yüklenir**. **Çalıştır** programı başlatır. Her derlemede dosya kaydetmek veya UF2 seçmek gerekmez.

## Otomatik bağlantı — v0.98

1. [Güncel yardımcı paketini indirin](../wirevo-sdk-helper.zip) ve bir klasöre açın. Python 3.9+, resmi Pico SDK, Arm GNU, CMake ve Ninja kurulu olmalı. İlk kurulumda yalnız bu araçların yolları sorulur.
2. Windows’ta **wirevo-sdk.cmd** dosyasını başlatın. Görünür **Wirevo SDK** penceresi açılır. İlk kurulumda araç konumlarını dosya/klasör seçicilerle bir kez seçin; geçerli kayıtlı kurulum varsa yardımcı kendiliğinden başlar.
3. Yardımcı varsayılan tarayıcıda Wirevo’yu açar ve sekme otomatik eşleşir. Port yazılmaz, bağlantı kodu kopyalanmaz, JSON dosyası seçilmez. Tarayıcı ilk kez yerel ağ / localhost izni isterse yalnız Wirevo için izin verin.
4. Pico C / ARM projesinde resmi SDK yöntemi otomatik seçilir. SDK panelini kapatıp **Derle**, sonra **Çalıştır** düğmesini kullanın. Diğer kartlarda mevcut proje değiştirilmez; Pico C projesi açmanız söylenir.
5. Görünür yardımcı penceresi derleme sırasında açık kalır. **Yardımcıyı kapat** veya pencerenin X düğmesi bağlantıyı ve o yardımcının derleme işlemlerini durdurur. **Durdur / ayarları düzenle** dinleyiciyi kapatıp araç konumlarını düzenlemeyi sağlar. Gizli servis veya bilgisayarla otomatik başlama kurulmaz. Ayrı küçük tarayıcı bağlantı penceresi gerekmez. Sayfa yenilendiğinde sekmedeki mevcut bağlantı bilgileri otomatik kontrol edilir. İzin nedeniyle ilk deneme başarısız olursa **Yeniden bağlan** yeterlidir.

Varsayılan port kullanımdaysa yardımcı otomatik boş bir port seçer; kullanıcı aramaz. **Gelişmiş / elle eşleştir** altında eski port/kod/dosya ve yerel pencere seçenekleri korunur. Yardımcı yeniden başlatıldığında açtığı yeni Wirevo sekmesi güncel bilgilerle bağlanır. `--no-open` yalnız tarayıcı açılmasını istemeyen ileri kullanıcılar içindir; `--port` ile sabit port seçilebilir.


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

## Otomatik açılış güvenliği

Yardımcı yalnız sabit HTTPS Wirevo adresini açar. Oturum anahtarı URL fragment’inde aktarılır, HTTP query/path veya sunucu isteğine eklenmez. Sayfa fragment’i eşleştirmeden önce adres çubuğundan kaldırır; geçersiz girdiler de temizlenir. Anahtar yardımcı terminaline yazdırılmaz, proje dosyalarına eklenmez. Site tarayıcı izinlerini kendisi açamaz. Mevcut localhost Origin/Host ve bearer denetimleri korunur.

## İlk kurulum ve görünür kullanıcı kontrolü

Tam SDK derlemesi için Pico SDK, Arm GNU, CMake ve Ninja bilgisayarda kurulu olmalıdır; otomatik eşleştirme bu araçları kurmakla aynı işlem değildir. Yeni yardımcı bunları gizli terminal soruları yerine görünür alanlarda gösterir. Bulunan PATH/ortam değişkenleri ve kayıtlı araç konumları kullanılır; eksik olanlar seçilir.

Windows başlatıcısı yalnız görünür SDK uygulamasını açar. Dinleyici ve derleme işlemleri bu pencerenin yaşam süresine bağlıdır. Kapatma veya durdurma düğmesi kullanıcı kontrolündedir; arka plan servisi, zamanlanmış görev veya başlangıç girdisi kurulmaz. İlk tarayıcı izni sırasında yenileme gerekirse bekleyen eşleştirme bilgisi yalnız o sekmede en fazla on dakika saklanır, başarılı doğrulama veya bağlantıyı kesme ile temizlenir. Proje dosyalarına eklenmez.

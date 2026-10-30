> [Uygulama kılavuzu](../guide.html#s26) · [Güncel Pico kapsamı](../pico-support.html). Normal kullanım için paket zorunlu değildir.

# İsteğe bağlı Pico SDK kaynak paketleri

Wirevo varsayılan olarak **Tarayıcı derleyicisi** kullanır. Derle → Çalıştır için kurulum gerekmez. Bu seçenek, ek C kaynakları ve başlıkları mevcut Clang/WebAssembly derleyicisine ekler. Tam resmi Pico SDK veya tam CMake kurulumu değildir. Port, anahtar, Python, yardımcı uygulama ve sunucuda derleme kullanılmaz.

## İlk kullanım

1. Pico kartı ve C dilini seçin. **SDK paketi ekle** düğmesine basın.
2. Kart ailesine göre [RP2040 örneğini](../examples/pico-source-package.zip) veya [RP2350 örneğini](../examples/pico-source-package-rp2350.zip) indirin. ZIP'i doğrudan seçin; klasör kullanacaksanız önce açın.
3. İsterseniz **Bu tarayıcıda sakla** seçin. Seçmezseniz paket yalnız açık sayfanın belleğinde tutulur.
4. **Denetle ve kullan** paket kaynaklarını ve tanımdaki probe programını gerçekten derler. Başarısızsa paket projeye uygulanmaz. Bu kontrol her olası kullanıcı programının uyumlu olduğunu garanti etmez.
5. Örneği denemek için ZIP'teki wirevo-sdk.json içindeki probe metnini main.c'ye aktarın. Derle → Çalıştır seçin. GP15'e bağlı LED yanar. Örnek projedeki LED bağlantısı uygundur.
6. Kendi kodunuzda `#include <manual_sdk.h>` ve `manual_sdk_value()` kullanılabilir. İşlev 100 döndürür; paket kaynağı resmi SDK adres başlığındaki SRAM_BASE değerini kontrol eder.

## Gerçek SDK dosyaları nereden alınır?

Resmi kaynak: https://github.com/raspberrypi/pico-sdk . Örnek paketler SDK **2.2.0** sürümünden değiştirilmeden alınmış `hardware/platform_defs.h` ve `hardware/regs/addressmap.h` dosyalarını içerir. RP2040 ve RP2350 başlıkları ayrı tutulur. BSD-3-Clause lisansı ZIP içindedir; manual_sdk.c/h ve paket tanımı Wirevo örneğidir. Bu örnek tam SDK değildir.

## Kendi paketinizi hazırlama

Paket kökünde `wirevo-sdk.json`, yanında listelenen gerçek dosyalar bulunur:

```json
{
  "format": "wirevo-pico-source-v1",
  "name": "Kendi C kaynak paketim",
  "boards": ["pico", "pico-w"],
  "includeDirs": ["include"],
  "sources": ["src/manual_sdk.c"],
  "files": ["include/manual_sdk.h", "src/manual_sdk.c"],
  "probe": "#include <manual_sdk.h>\nint main(void){return manual_sdk_value();}"
}
```

`include/manual_sdk.h` işlev bildirimini, `src/manual_sdk.c` işlev gövdesini içermelidir. `files` tüm C/H dosyalarının listesidir; `sources` derlenecek C dosyalarını, `includeDirs` başlık arama klasörlerini belirtir. `probe` paket API'lerini kullanan küçük bir C programıdır. JSON tek başına SDK veya derleyici sağlamaz. JSON ve kaynakları aynı klasörde seçin ya da aynı ZIP'e koyun. ZIP içinde tek bir kök klasör olabilir. Seçilmeyen/listelenmeyen dosyalar derlemeye girmez.

## Destek ve sınırlar

- Sekiz Pico profili C17 için paket kabul eder. Paket `boards` listesi seçilen kartı içermelidir. Örnekler doğru ailedeki dört kart için hazırlanmıştır.
- C/H metin dosyaları, C17 kaynak derlemesi, bağlama ve mevcut Wirevo çalışma zamanı desteklenir. C++/assembly dosyaları, önceden derlenmiş .a/.o dosyaları, EXE ve sistem programları bu paket biçiminde desteklenmez.
- Donanım API'leri hâlâ Wirevo'nun mevcut çevrebirim modeline bağlıdır. Paket eklemek çip emülasyonunu genişletmez. Başlıklardaki tüm işlevler otomatik uygulanmış olmaz.
- Tam upstream CMake, pico-sdk'nin bağımlılık indirmesi, pioasm/picotool üretimi, Python betikleri ve keyfi derleme komutları çalıştırılmaz. Mevcut proje CMake alt kümesi [ayrı belgelenmiştir](PICO-BROWSER-CMAKE.md).
- SDK kaynakları başka başlıklara/işlevlere ihtiyaç duyuyorsa bunlar pakette ve mevcut çalışma zamanında bulunmalıdır. Eksik include veya bağlama sembolü açık derleme hatası verir. Wirevo'nun sağladığı çalışma zamanı başlıkları değiştirilemez.
- ZIP en fazla 2 MB, en fazla 64 girdi; seçilen C/H kaynakları toplam 1.5 MB, en fazla 60 dosya, 24 C derleme birimi ve 16 include klasörü. Yollar paket içinde kalmalıdır. Şifreli/ZIP64 arşivler desteklenmez.

## Kaydetme, başka bilgisayar ve kaldırma

Paket, seçerseniz yalnız bu siteye ve tarayıcı profiline ait IndexedDB deposunda saklanır. Tarayıcı verilerini silmek paketi siler. Proje JSON/ZIP dosyasına kaynak paketinin adı ve SHA-256 içerik kimliği yazılır; SDK dosyaları gömülmez. Kaynakları ve devreyi değiştirmez. Başka bilgisayarda aynı paketi yeniden seçin; farklı içerik farklı paket kimliği üretir. Paket bulunamazsa derleme durur ve yeniden seçme mesajı gösterilir; sessizce varsayılana dönülmez.

**Tarayıcı derleyicisi kullan** projeyi paketten ayırır. **Paketi tarayıcıdan kaldır** paketi kalıcı depodan ve bu sayfanın belleğinden de siler. Aynı pakete bağlı diğer projelerin yeniden paket seçmesi gerekir. Kaldırma veya paket değiştirme, eski derlenmiş sonucu geçersiz kılar.

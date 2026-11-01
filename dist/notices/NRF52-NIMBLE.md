# nRF52840 — NimBLE güvenli BLE klavye (0.114.0)

## Ne eklendi?

SuperMini, nice!nano v2, XIAO nRF52840 ve XIAO nRF52840 Sense üzerinde **gerçek Apache NimBLE 1.8.0 C host yığını** çalışır. Karşıdaki sanal alıcı da ikinci ARM işlemcisinde aynı kütüphanenin merkezi rolünü yürütür. HIDS servis/karakteristik/CCCD keşfi, ATT erişim hataları, SMP Secure Connections, sayısal karşılaştırma, anahtar dağıtımı ve GATT bildirimleri C kodundan geçer. Eski `wirevo_keyboard.h` sanal BLE API’si ayrı örnektir; kendiliğinden güvenli NimBLE profiline dönüşmez.

## Çalıştırma

1. Kendi projenizi JSON/ZIP ile yedekleyin. **Dosya → Yeni proje → Nordic nRF52840 → kart → C17 → NimBLE güvenli BLE klavye** seçin. Nordic projede Projeler menüsünde de bulunur.
2. **Derle → Çalıştır**. Kaynak C17 tarayıcıdaki WASM Clang ile derlenir; sabit NimBLE ARM kütüphanesi bağlanır. Kurulum, yardımcı, port/anahtar veya sunucu derlemesi gerekmez.
3. **USB / BLE Klavye → BLE bağlan**. İki firmware servis keşfini ve eşleştirmeyi yürütür. Simülasyonu çalışır bırakın.
4. Klavye ve alıcıda gösterilen altı haneli kodu karşılaştırın. Aynıysa **Kodlar aynı · Kabul et**; değilse **Reddet**. Onay gerçek `ble_sm_inject_io` çağrısına ulaşır. Kod eşitliği otomatik kabul sayılmaz.
5. **Secure Connections · doğrulanmış · AES-CCM şifreli** ve bildirim açık durumunu bekleyin. A/B/Shift tact butonlarını basılı tutun/bırakın. Gelen metin yalnız sanal alıcıda görünür.
6. **Caps Lock**, gerçek şifreli GATT output write ile firmware’e geri döner ve kart LED’ine yansır. CCCD kutusu gerçek GATT yazmasıyla bildirimleri kapatır/açar.
7. Aynı çalışan oturumda ayırıp bağlanmak RAM’deki gerçek NimBLE bond kaydını kullanır. **Reset, yeniden derleme, proje değiştirme veya sayfa yenileme anahtarları siler; yeniden eşleştirin.** JSON/ZIP devre/kaynak/firmware’i korur, oturum anahtarlarını veya alıcı metnini saklamaz.

## Elektriksel bağlantılar

Üç tact için GPIO–GND bağlantısı ve dahili pull-up kullanılır. SuperMini/nice!nano: A=P0.22, B=P0.24, Shift=P0.11. XIAO/Sense: A=P0.03, B=P0.28, Shift=P0.29. `board_pins.h` farkı taşır. Kart LED’i kendi profilinin aktif HIGH/LOW değerini kullanır. Tuşlar kaynak metinden taklit edilmez; devre çözücüsü GPIO gerilimini üretir ve C firmware giriş yazmacını okur.

## Güvenlik ve motor sınırları

- Yalnız LE Secure Connections + Numeric Comparison; 16 bayt anahtar ve MITM zorunlu. Legacy/Just Works/Passkey Entry/OOB bu profilin parçası değildir.
- ECDH gerçek P-256 WebCrypto matematiğiyle hızlandırılır. Noktalar doğrulanır; her yeni eşleştirme rastgele anahtar üretir. NimBLE f4/f5/f6/g2 ve AES-CMAC işlemleri gerçek C/TinyCrypt kodudur; sabit debug anahtarı kullanılmaz.
- Oturum anahtarı türetme ve AES-CCM şifreleme/MIC doğrulama C/TinyCrypt’te çalışır. 39 bit yönlü sayaç ve 4 bayt MIC kullanılır; bozulmuş/tekrar edilmiş paket ve şifresize düşürme reddedilir. Gizli anahtarlar panel/snapshot/proje dosyasına yazılmaz.
- **Denetleyici sanal HCI’dir.** İç ACL çerçevelemesi RF paket biçimi değildir. Nordic RADIO/CCM donanım sürücüsü, fiziksel kanal/anten/parazit/hopping, tüm LL denetleyicisi veya çevrim eşdeğerliği uygulanmaz. Tarayıcının fiziksel Bluetooth’una ya da işletim sistemine klavye olarak bağlanılmaz.
- Bir merkezi alıcı + bir çevresel klavye; sabit 8 bayt/6 tuş raporu ve US metin önizlemesi. Çok bağlantı, NKRO/mouse/media, tam HID boot mode, BLE PHY/extended advertising/ISO/mesh ve RPA adres gizliliği doğrulanmış değildir. Küçük resolving-list depolaması bulunması fiziksel gizlilik yürütümü anlamına gelmez.
- Gerçek NimBLE host C kodu ve desteklenen API’leri kullanılabilir; **her nRF Connect SDK, SoftDevice, Zephyr/ZMK veya hazır klavye firmware’i uyumlu değildir**. Bu port için olay döngüsü `wirevo_nimble_poll()` ile ilerletilir. Tek iş parçacığı NPL ve sınırlı freestanding libc, genel RTOS/libc değildir.
- Kaynak debug kullanıcı C’sinde mevcut altyapıyı kullanır. Hazır NimBLE kütüphanesi `-O2 -g0` olduğundan onun içindeki satır adımı/değişken görünürlüğü sunulmaz.

## Kaynak ve yeniden üretim

[Apache NimBLE 1.8.0](https://github.com/apache/mynewt-nimble/tree/nimble_1_8_0_tag) host, RAM store, GAP/GATT ve TinyCrypt kaynakları lisanslarıyla depodadır. `src/vendor/nimble-1.8.0/WIREVO-PATCHES.md` küçük kaynak uyarlamalarını açıklar. Kaynak/object SHA-256 listesi: [NIMBLE-SOURCES.json](NIMBLE-SOURCES.json). [NimBLE lisansı](NIMBLE-LICENSE.txt), [NOTICE](NIMBLE-NOTICE.txt), [TinyCrypt lisansı](TINYCRYPT-LICENSE.txt).

Geliştirici: `node scripts/nrf52/build-nimble-package.mjs` ile tarayıcı WASM derleyicisinden 71 ARM object dosyası üretin. `node scripts/nrf52/build-nimble-host.mjs` ile aynı kaynaklardan sanal merkezi firmware’i ve örneği üretin. Kullanıcının bilgisayarında bu araçları çalıştırması gerekmez.

## Bu sürümün yeni doğrulaması

`node --test tests/nrf52-nimble114.test.mjs`: dört kartta gerçek C + tact + sayısal karşılaştırma + şifreli rapor, release/modifier, Caps LED, CCCD, oturum bond yeniden bağlantısı; onayı reddetme; kısa anahtar/non-SC reddi; bağımsız OpenSSL karşılaştırması, MIC bozulması ve replay; plaintext downgrade reddi; TinyCrypt’in gerektirdiği wide REV/REV16/REVSH ARM işlemleri. Eski test paketi tekrar çalıştırılmaz.

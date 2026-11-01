> 0.114.0: Yeni **gerçek NimBLE C17 Secure Connections / şifreli HIDS** profili eklendi. [Kullanım ve kesin sınırlar](NRF52-NIMBLE.md). Aşağıdaki eski örneğin kapsamı ayrı değerlendirilir; SoftDevice/ZMK veya fiziksel radyo uyumluluğu iddiası yoktur.

# nRF52840 — TinyUSB C17 klavye profili (0.113.0)

## Gerçekten ne değişti?

Önceki `wirevo_keyboard.h` örneği hazır raporları özel bir sanal servise gönderir. Yeni **TinyUSB C17 klavye** örneği, değiştirilmemiş TinyUSB 0.18.0 `tusb.c`, `usbd.c`, `usbd_control.c`, `hid_device.c` ve FIFO kaynaklarını derler. Bu C kodu, gerçek ARM firmware olarak mevcut CPU motorunda yürür. Descriptor ve HID callback'leri kullanıcının C dosyalarında bulunur. `tud_hid_keyboard_report()` gerçek TinyUSB HID sınıfından geçer; bu isimde bir Wirevo taklidi yoktur.

USB denetleyicisi ise **Wirevo sanal DCD portudur**, Nordic USBD yazmaç modeli değildir. Bilgisayarda fiziksel USB klavye oluşmaz. Ek uygulama, port, servis, Python veya sunucu derlemesi gerekmez.

## Çalıştırma

1. Projeler/örnekler veya Yeni proje → nRF52840 → **TinyUSB C17 klavye** seçin. SuperMini, nice!nano v2, XIAO ve XIAO Sense profilleri vardır.
2. `main.c`, `board_pins.h`, `usb_descriptors.c` birlikte derlenir. `#include <tusb.h>` yerleşik TinyUSB kaynak paketini etkinleştirir.
3. Derle → Çalıştır; **USB / BLE Klavye** panelini açın, **USB bağla** seçin.
4. Panel gerçek GET_DESCRIPTOR / SET_ADDRESS / SET_CONFIGURATION kontrol aktarımlarını firmware'e gönderir. **USB kontrol aktarımı** bölümünde SETUP/ACK sırası ve C callback'lerinden alınan descriptor baytları görünür.
5. A/B/Shift butonları gerçek tact/GPIO girişleridir. Firmware bunları okuyup `tud_hid_keyboard_report()` çağırır. `wirevo_usb_poll(); tud_task();` döngüsü USB olaylarını işler.
6. Caps Lock → USB `SET_REPORT` → `tud_hid_set_report_cb()` → `usb_leds` → kart LED'i akışı işler. Boot protokolü, suspend ve resume düğmeleri gerçek TinyUSB callback/durum değişimlerine gider.
7. JSON/ZIP kaydı kaynakları ve devreyi taşır. Yerleşik yığın sitede bulunduğundan başka bilgisayarda ek kurulum gerekmez. Bağlantı oturumu ve alıcı metni kayda gömülmez.

## Doğrulanan kapsam

- Tek USB full-speed boot keyboard HID arayüzü; interface 0, interrupt IN `0x81`, 8 bayt rapor, report ID 0, altı tuş + modifier.
- Uygulama tarafından sağlanan device/configuration/HID report descriptor callback'leri; sınıf ve endpoint açma TinyUSB C kodundadır.
- EP0 çok paketli IN (65 bayt report descriptor), OUT LED raporu, status ACK; SRAM tamponları, kontrol aktarımı ve transfer-complete olayları.
- GET_REPORT / SET_REPORT, GET_PROTOCOL / SET_PROTOCOL, GET_IDLE / SET_IDLE; `tud_mount_cb`, `tud_umount_cb`, `tud_suspend_cb`, `tud_resume_cb`, `tud_hid_set_protocol_cb`.
- Tuş basma/bırakma, Shift, LED geri bildirimi, bağlantı kesme/yeniden tanınma, reset; dört kartta yeni C/devre bütünleşik kontrolleri.

## Sınırlar

Bu, herhangi bir TinyUSB projesini değiştirmeden açan tam SDK değildir. Kaynakları C17 proje dosyalarına aktarın; kart başlatmasını Nordic sürücüleri yerine mevcut GPIO API'sine ve `wirevo_usb_poll()` platform kancasına uyarlayın. Tarayıcı portu `tusb_config.h` ayarlarını sabit sağlar; özel config/DCD dosyası aynı isimle yüklenirse açık hata verir.

Nordic `dcd_nrf5x.c`, nrfx USBD, USB elektriksel hat/PHY, gerçek işletim sistemi bağlantısı, DMA çevrim doğruluğu, endpoint polling zamanlaması, host/OTG, birden fazla HID arayüzü, OUT interrupt endpoint, report-ID/NKRO, medya/fare ve diğer USB sınıfları doğrulanmış destek değildir. SET_IDLE durumu TinyUSB içinde işler; örnek uygulama periyodik idle raporu üretmez. Sanal metin önizlemesi US düzenindedir; destek dışı tuşlar metin olarak görünmeyebilir.

**Bluetooth eksikleri tamamlanmadı.** Önceki BLE örneği Wirevo sanal HIDS servisidir. Özgün SoftDevice, Zephyr/ZMK/NimBLE firmware'i, radyo/link katmanı, gerçek eşleştirme, bonding ve kriptografik güvenlik bu sürümle eklenmez. Bunlar yeni bir Bluetooth yürütüm/denetleyici altyapısı gerektirir. TinyUSB örneğinde BLE servisi başlamadığı için BLE bağlan düğmesi etkinleşmez; USB desteği Bluetooth desteği olarak sunulmaz.

## Kaynak ve lisans

[TinyUSB 0.18.0](https://github.com/hathach/tinyusb/tree/0.18.0), MIT: [lisans](TINYUSB-LICENSE.txt), [dosya/hash listesi](TINYUSB-SOURCES.json). Vendored kaynaklar `src/vendor/tinyusb-0.18.0` içindedir. `scripts/nrf52/generate-tinyusb-package.mjs` tarayıcı paketini üretir. Yeni doğrulama: `node --test tests/nrf52-tinyusb113.test.mjs`; eski testler bu iş için çalıştırılmaz.

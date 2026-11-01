> 0.114.0: Yeni **gerçek NimBLE C17 Secure Connections / şifreli HIDS** profili eklendi. [Kullanım ve kesin sınırlar](NRF52-NIMBLE.md). Aşağıdaki eski örneğin kapsamı ayrı değerlendirilir; SoftDevice/ZMK veya fiziksel radyo uyumluluğu iddiası yoktur.

> 0.113.0: Özgün TinyUSB C17 klavye profili ayrıca eklendi. [Yeni USB yığını, kullanım ve sınırlar](NRF52-TINYUSB.md). Aşağıdaki Wirevo API örneği ayrı sanal servistir; BLE/SoftDevice desteği genişletilmiş değildir.

# nRF52840 C17 — sanal USB HID / Bluetooth LE klavye

Wirevo 0.112.0. Dört kart profili: SuperMini, nice!nano v2, XIAO nRF52840 ve XIAO nRF52840 Sense.

## Ne çalışır?

C17 firmware gerçek ARM çekirdeğinde GPIO girişlerini okur. `wirevo_keyboard.h` ile gönderdiği 8 bayt klavye raporu gerçek SRAM’den alınır; Wirevo’daki sanal USB veya BLE alıcısında tuş basma/bırakma ve metin olarak görünür. Modifier, altı eşzamanlı tuş, release, Caps Lock LED geri bildirimi, bağlanma/ayrılma, BLE reklam adı ve bildirim aboneliği uygulanır.

Bu **Wirevo’ya özgü sanal taşıma API’sidir**. Tam nRF52840 USBD/RADIO, SoftDevice, nRF Connect SDK, Zephyr/ZMK veya TinyUSB sürücü uyumluluğu değildir. İşletim sistemine tuş basılmaz; gerçek USB klavye veya RF bağlantısı açılmaz. Gerçek Bluetooth eşleştirme, bonding, şifreleme, bağlantı aralıkları, GATT paket/ATT yürütümü ve kontrol noktası suspend/resume bu sürümde yoktur. Tam USB kontrol/endpoint sürücüsü yerine sabit klavye hizmeti ve sanal host kullanılır.

## Örneği çalıştırma

1. Dosya → Yeni proje → Nordic nRF52840 → kart → C17 → **USB / BLE klavye**. Var olan nRF projesinde Projeler menüsünden aynı örneği de seçebilirsiniz. Önce kendi projenizi JSON/ZIP kaydedin.
2. **Çalıştır**: tarayıcıda derlenir ve firmware başlar; ek program/servis gerekmez.
3. Üstte **USB / BLE Klavye** panelini açın.
4. **USB bağla** ve/veya **BLE bağlan** seçin. BLE bağlantısı, firmware reklamı başlamadan kurulamaz. Sanal alıcı bağlanınca bildirim aboneliği açılır.
5. Paneldeki **A / B / Shift** tuşlarını basılı tutun. Bunlar örnekteki tact bileşenlerinin `pressed` durumunu değiştirir; firmware GPIO’dan okur. Paneli kapatıp devredeki tact butonlarını da kullanabilirsiniz. Simülasyon çalışıyor olmalıdır.
6. Tuşu bırakmak boş/azaltılmış rapor gönderir. Aynı rapor veya basılı tutulan tuş metni tekrar tekrar üretmez; işletim sistemi typematic tekrarı modellenmez.
7. **Caps Lock** alıcıdan LED output raporunu değiştirir. Örnek bunu C’den okuyarak kart LED’ine yansıtır. USB ve BLE alıcılarının LED durumu ayrıdır.
8. BLE bildirim aboneliği kapatılınca BLE rapor kabulü durur; USB çalışmaya devam eder. Yeniden açınca hazır örnek mevcut tuşları tekrar gönderir.
9. Reset firmware’i ve sanal bağlantıları sıfırlar; tekrar bağlayın. JSON/ZIP kaynak/devre/firmware’i taşır; alıcının oturumu ve yazılan metin kaydedilmez.

Örneğin üç pini: SuperMini/nice!nano A=P0.22, B=P0.24, Shift=P0.11; XIAO/Sense A=P0.03, B=P0.28, Shift=P0.29. Her tact bir tarafta GPIO, diğer tarafta GND; firmware dahili pull-up kullanır. Kartların referansa göre vektör çizimleri kullanılır.

## C API

```c
#include <wirevo_keyboard.h>
cf_usb_keyboard_begin();
cf_ble_keyboard_begin("My Keyboard");
uint8_t keys[6] = {CF_HID_KEY_A, 0, 0, 0, 0, 0};
if (cf_usb_keyboard_ready())
    cf_usb_keyboard_report(CF_HID_LEFT_SHIFT, keys);
if (cf_ble_keyboard_ready())
    cf_ble_keyboard_report(CF_HID_LEFT_SHIFT, keys);
/* Sonraki program adımında, tuş bırakıldığında: */
cf_usb_keyboard_release();
cf_ble_keyboard_release();
```

`cf_usb_keyboard_leds()` / `cf_ble_keyboard_leds()`: bit0 Num Lock, bit1 Caps Lock, bit2 Scroll Lock. `*_end()` hizmeti kapatır. `begin`/`report`/`release` sonucu 0=başarılı, -1=hizmet başlamadı, -2=alıcı bağlı değil veya BLE aboneliği kapalı, -3=tampon/rapor/ad geçersiz, -4=taşıma meşgul, -5=tanımsız komut. BLE adı UTF-8 en çok 32 bayt; helper adı SRAM’e kopyalar. Rapor helper’ı 8 baytı SRAM stack’inde hazırlar; pointer’ı kaynak metin olarak yorumlanmaz. Flash tampon gönderimi reddedilir.

Sabit rapor düzeni: byte0 modifier (Ctrl/Shift/Alt/GUI bitleri), byte1=0, byte2..7 altı farklı usage kodu veya sıfır. Klavye sayfası 0x07, modifier E0..E7, tuş aralığı 0x04..0x65; reserved/error rollover kodları 1..3 ve yinelenen tuşlar reddedilir. NKRO/mouse/media raporları yoktur. Metin önizlemesi US düzenini kullanır; Türkçe Q/F dönüşümü yapılmaz. Ctrl/Alt/GUI kombinasyonları ham olay kaydında gösterilir; bilgisayarınızda kısayol çalıştırmaz.

Sanal USB snapshot’ında sabit HID sınıfı 3, boot keyboard subclass/protocol 1, IN endpoint 0x81 / 8 bayt ve Report Map vardır. Sanal bağlanma descriptor/address/configuration sırasını kaydeder; bu, nRF USBD firmware’inin endpoint task’larını yürütmek değildir. Sanal BLE HIDS hizmet kimliği 0x1812; report map 0x2A4B ve giriş/çıkış raporu 0x2A4D olarak tanımlanır. `protocol` (0 boot/1 report), `idle` ve LED host durumları izlenir; her iki protokolde aynı sabit 8 bayt düzeni kullanılır, idle periyodik yeniden gönderimi uygulanmaz.

## Yeni doğrulamalar

Dört profilde gerçek derlenen C + tact/GPIO + her iki alıcı; Shift+A/B birleşimi, basılı tutma/release, Caps LED, abonelik kapatma/açma ve yeniden bağlantı. Ayrı C doğrulaması altı tuş, bağlı olmayan host ve flash tampon hatası. Worker üzerinden host komutu, rapor snapshot’ı ve pause akışı. Yalnız `tests/nrf52-keyboard112.test.mjs` çalıştırılır; eski testler çalıştırılmaz.

## Teknik referanslar

- [TinyUSB HID sınıf belgesi](https://docs.tinyusb.org/en/latest/reference/class/hid.html) ve [standart keyboard report tanımı](https://github.com/hathach/tinyusb/blob/master/src/class/hid/hid.h): rapor biçimi referansı; TinyUSB kütüphanesi entegre edilmedi.
- [Zephyr HID Peripheral](https://docs.zephyrproject.org/latest/samples/bluetooth/peripheral_hids/README.html) ve [HIDS API](https://docs.zephyrproject.org/latest/doxygen/html/group__bt__hids.html): reklam/hizmet/rapor kavramları için referans; Zephyr yürütülmez.
- [nRF52840 genel model sınırları](NRF52-MODEL.md).

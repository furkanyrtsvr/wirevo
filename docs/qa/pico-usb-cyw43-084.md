# v0.84 yeni doğrulamalar

Yalnız yeni dosyalar: `pico-usb084.test.mjs`, `pico-cyw43-084.test.mjs`, `pico-visual084.test.mjs`.
Yeni dosyalarda toplam 49 kontrol başarılı; eski test paketleri çalıştırılmadı.

- Sekiz kart: gerçek ARM firmware + sanal host enumeration; HID keyboard descriptor, press/release ve SET_REPORT LED callback; MSC kapasite, iki sektör WRITE10/READ10 eşleşmesi, aralık hatasında CSW residue/sense; DFU çok paketli DNLOAD/UPLOAD, GETSTATUS, manifestation ve hata temizleme.
- RP2040/RP2350: yeni mouse profili signed X/Y/wheel/pan raporu; yeni host üzerinden CDC SETUP ve çift yönlü DPRAM veri aktarımı; dört yeni hazır USB örneğinin derlenmesi.
- Dört W/WH modeli: NONET=-2, BADAUTH=-3, NOIP=2, UP=3, Wi-Fi link=1, model RSSI=-42, yerel model MAC, leave ve STA disable. Sanal AP kapandığında link ve UDP kuyruğu temizlenir.
- Sekiz SVG: 40 pin koordinatı, boyutlar, çip ailesi, header/SWD/anten ayrımları ve okunaklı pin etiketleri. İndirilen resmî fotoğraflarla görsel karşılaştırma ayrıca yapıldı.
- Eski test paketleri çalıştırılmadı. Fiziksel USB sertifikasyonu ve özgün CYW43 firmware yürütümü doğrulanmadı ve iddia edilmez.
- Yerel tarayıcıda hazır MSC örneği derlendi; host WRITE10 ile deneme deseni yazdı, READ10 ile 512 bayt döndü, CSW=0/residue=0 ve 84 85 86... payload görüldü. Yeni kart görseli ve pinout arayüzü ekranda kontrol edildi.

# Wirevo 0.112.1

- SuperMini siyah PCB görselindeki gömülü fotoğraf kaldırıldı. Referansa göre çizilmiş SVG; USB-C, işlemci, pasifler, okunaklı pin etiketleri ve mevcut pad merkezleri korunur.
- C17 tact GPIO -> sanal USB HID / BLE HIDS klavye akışı dört nRF52840 kart profilinde doğrulandı: basma/bırakma, Shift, altı tuş, Caps Lock LED geri bildirimi, bağlantı kesme ve bildirim aboneliği.
- Yalnız yeni 112 klavye ve görsel doğrulamaları çalıştırıldı: `node --test tests/nrf52-keyboard112.test.mjs tests/nrf52-art112.test.mjs` (7/7).
- Gerçek RF/USB, SoftDevice, Zephyr/ZMK ve TinyUSB firmware uyumluluğu iddia edilmez. Alıcılar Wirevo içinde sanaldır.

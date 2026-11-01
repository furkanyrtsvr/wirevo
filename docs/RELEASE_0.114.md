# Wirevo 0.114.0 — gerçek NimBLE C17 güvenli BLE klavye

- Gerçek Apache NimBLE 1.8.0 host + TinyCrypt C kaynakları, tarayıcı Clang’ından tekrar üretilebilir ARM kütüphanesi, gerçek C merkezi alıcı firmware’i.
- SMP LE Secure Connections / Numeric Comparison, açık kabul/ret, 16 bayt anahtar, gerçek P-256 ECDH, AES-CMAC/AES-CCM ve MIC/sayaç doğrulaması. Onaysız HID erişimi ve bozuk/replay/şifresize düşürme reddedilir.
- Dört nRF52840 profiline ayrı GPIO eşlemesiyle yeni örnek; gerçek ATT/GATT/HIDS/CCCD, tuş/release/modifier, Caps output ve LED, RAM bond yeniden bağlantısı.
- TinyCrypt’te karşılaşılan wide REV/REV16/REVSH tanımsız komut hatası ARM motorunda giderildi; yeni firmware doğrulaması eklendi.
- Eski Wirevo sanal BLE API örneği korunur. Yeni destek sanal HCI portudur; Nordic RF/CCM donanımı, fiziksel BLE, SoftDevice, Zephyr/ZMK veya bütün klavye firmware’leri desteklenmiş sayılmaz. Bond reset/yenilemeyle silinir.
- Yalnız yeni `tests/nrf52-nimble114.test.mjs` ve yeni tarayıcı akışı doğrulanır; eski testler yeniden çalıştırılmaz. Ayrıntılı kaynak/lisans/sınırlar: `dist/notices/NRF52-NIMBLE.md`.

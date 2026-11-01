# Wirevo 0.113.0 — özgün TinyUSB C17 klavye profili

- TinyUSB 0.18.0 core, device/control, HID ve FIFO C kaynakları tarayıcıda gerçek ARM firmware olarak derlenir.
- Ayrı Wirevo sanal DCD portu ve USB host kontrol akışı; C descriptor ve HID callback'leri, gerçek GPIO/tact tuşları, LED geri bildirimi, suspend/resume, boot protokolü ve yeniden bağlantı.
- Dört nRF52840 profili için yeni TinyUSB örneği. Mevcut devre/kaynaklar korunur. Yalnız yeni `tests/nrf52-tinyusb113.test.mjs` doğrulanır.
- Bu Nordic USBD/RADIO, fiziksel USB veya tam SDK değildir. Bluetooth özgün firmware/radyo/SoftDevice/Zephyr/ZMK, eşleştirme ve güvenlik eksikleri bu sürümde tamamlanmamıştır.
- [Kullanım ve kesin sınırlar](../dist/notices/NRF52-TINYUSB.md).

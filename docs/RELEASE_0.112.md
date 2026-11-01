# Wirevo 0.112.0 — nRF52840 sanal USB/BLE klavye

Dört kartta C17 firmware’den SRAM klavye raporları, USB/BLE sanal alıcıları, modifier/6 tuş/release, Caps Lock geri bildirimi ve BLE bildirim aboneliği. Yeni üç tact örneği ve alıcı panelindeki tuşlar aynı GPIO devresini değiştirir. Kart görselleri korunur.

Wirevo’ya özgü taşıma API’sidir; tam nRF USBD/RADIO, SoftDevice, ZMK/Zephyr veya TinyUSB uyumluluğu değildir. İşletim sistemine gerçek tuş gönderilmez. Eski testler çalıştırılmaz; yalnız yeni `tests/nrf52-keyboard112.test.mjs` doğrulamaları.

[API ve sınırlar](../dist/notices/NRF52-KEYBOARD.md).

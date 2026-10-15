# Bluetooth · destek ve sınırlar

## Sanal ağ

`Bluetooth UART · sanal BLE` CircuitForge'a ait öğretim bileşenidir; gerçek bir HC-05/HC-06 ürününün firmware/AT komut emülasyonu veya ESP32/STM32 radyo çevre birimi değildir. 3,0–3,6 V besleme, GND, 3,3 V RX giriş sınırı, TX/RX UART 8N1, dört seçilebilir baud hızı ve `STATE` çıkışı modellenir. UART verisi fiziksel DC neti üzerindeki bit kenarlarından örneklenir; besleme veya RX gerilimi geçersiz olduğunda bağlantı kopar. Sanal bilgisayar veya iki sanal modül arasında bağlantı ve veri aktarımı mümkündür. Simülasyon yeniden başlatıldığında bağlantı yeniden kurulur. RF yayını, parazit, Bluetooth güvenlik/eşleştirme profilleri, GATT servisleri ve gerçek yakındaki cihaz taraması modellenmez. Sanal tarama yalnızca açık devredeki beslenen modülleri listeler.

STM32 hazır örneği: `VCC → 3V3`, `GND → GND`, `PB8 → RX`, `PB9 ← TX`, `PB5 ← STATE`. 9600 baud için GPIO yazılım UART kullanır ve satır sonunu gördükten sonra mesajı geri yollar; sürekli veri veya DMA garantisi yoktur. USART1/2 terminal uyarlaması bağımsızdır. AVR/ESP için modül aynı kütüphanede mevcuttur; kendi firmware UART veya GPIO koduyla sürülür. 5 V AVR TX ucunu doğrudan modül RX ucuna bağlamayın; seviye dönüştürme gerekir.

## Gerçek bilgisayar BLE erişimi

Bluetooth panelinin alt kısmı [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) kullanır. Tarayıcı desteği, güvenli bağlam, kullanıcı tıklaması, sistemde Bluetooth ve cihazın uygun servis/karakteristik UUID'leri gerekir. Varsayılan UUID'ler [Nordic UART Service](https://nrfconnectdocs.nordicsemi.com/ncs/latest/nrf/libraries/bluetooth/services/nus.html) içindir: servis `6e400001…`, yazılabilir RX `6e400002…`, bildirim TX `6e400003…`. Arayüzdeki **Notify** cihazın TX, **Write** cihazın RX karakteristiğidir. Dilerseniz UUID'leri gerçek cihazınıza göre değiştirebilirsiniz. Tarayıcı yalnızca sizin seçtiğiniz izinli BLE GATT cihazını açar; tüm bilgisayar cihazlarını sessizce taramaz. Web Bluetooth Classic SPP/HC-05 seri bağlantısını sağlamaz. Gerçek BLE oturumu sanal ağ simülasyonuna veya MCU pinlerine otomatik köprü değildir. Gerçek cihaz bulunmadığı için bu sürümün fiziksel radyo uçtan uca kabulü yapılmamıştır.

## 0.52 görünüm

Özgün CC0 HC-05 esinli SVG: anten, metal ekran, LED ve pin etiketleri. Eski projelerdeki5pin koordinatları ve3.3V sanal UART/BLE modeli korunur. Gerçek HC-05 Classic SPP/AT firmware emülasyonu değildir; EN/KEY pini eklenmedi. Üretici görünüm referansı: https://www.deshide.com/product-details_HC-05.html

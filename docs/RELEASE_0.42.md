# CircuitForge 0.42 · STM32 bağlantıları ve Bluetooth

Altı STM32 Blue Pill/Nucleo kartının mevcut ARM C17 desteği üzerinde, hazır devrelerin bileşen yerleri kart boyutuna göre açılır. Köşeli kablolar kart ve bileşen gövdelerini engel sayarak kenarlardan dolaşır. Kullanıcının çizdiği düz ve elle düzenlenen kabloların seçimi korunur.

Temel kütüphanedeki **Net label** bileşeninin `NET` ucuna kablo bağlanır. Aynı projede adları birebir aynı etiketler elektriksel olarak birleşir. Bir kabloyu seçip **Net label kullan** ile iki kısa bağlantıya dönüştürmek mümkündür. Adlar proje içinde kalır; JSON/ZIP ve ölçüm/DC simülasyonu aynı ağı kullanır. STM32 başlangıç listesindeki **Net label LED** breadboard içermez.

**Bluetooth UART · sanal BLE** 3,3 V `VCC/GND`, çapraz `TX/RX` ve bağlantı durumunu veren `STATE` uçlarına sahiptir. Sanal ağ paneli güç verilmiş modülleri tarar; sanal bilgisayara veya başka modüle bağlar, 9600/19200/38400/115200 baud 8N1 UART üzerinden veri taşır. Hazır STM32 örneği PB8/PB9 yazılım UART ve PB5 STATE ile gerçek Cortex-M3/M4F kodunu kullanır. **Gerçek bilgisayar Bluetooth** bölümü, destekli HTTPS tarayıcısında kullanıcı eylemiyle BLE GATT cihaz seçici açar; varsayılan Nordic UART Service UUID değerleri düzenlenebilir. Bu bağlantı sanal devre ağından ayrı bir oturumdur.

Kapsam ve sınırlar [Bluetooth modeli](../dist/notices/BLUETOOTH-MODEL.md), [net label davranışı](../dist/notices/NET-LABELS.md) ve [STM32 devam planında](STM32_PLAN_0.42.md) kayıtlıdır.

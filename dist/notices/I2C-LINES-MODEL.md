# I²C hat modeli · 0.28

Uno donanım TWI master işlemleri gerçek AVR/Wire komutlarıyla başlar. `i2c-lines.js` START/repeated START/STOP, sekiz MSB-first bit ve dokuzuncu ACK/NACK saatini CPU clock olaylarıyla üretir. Denetleyici register/bellek modelleri korunur. GPIO ile yazılımsal I²C, slave MCU ve multi-master arbitration henüz desteklenmez.

SDA/SCL HIGH aktif kaynak değildir: sink kaldırılır. Master ve slave LOW çıkışları 50 Ω / GND sürücüleridir; bu direnç seçilmiş bounded model katsayısıdır, üretici RDS(on) fit'i değildir. Cihazın beslemesi, toprak, canonical net/pin eşleşmesi, fiziksel adres ve hız sınırı geçerlidir. Slave yalnız kendi SDA/SCL pinini sürer. Aynı adresteki okuyucular her bit için wired-AND birleşir. SDA, gerçek çözülen SCL yükselişinde örneklenir; adres/ACK/veri baytları bu seviyelere bağlıdır. 2.5 V Uno HIGH eşiği kullanılır. Kısa devre / güçlü yük / eksik pull-up sahte HIGH üretmez.

SCL serbest bırakıldığında HIGH olana kadar saat durur. Wire timeout verilmemiş firmware, sürekli LOW veya floating clock yüzünden gerçek kod gibi bekleyebilir. `Wire.setWireTimeout(25000,true)` önerilir. TWEN kapatılması, devre düzenlemesi ve dispose eski clock callbacklerini iptal eder ve tüm TWI sinklerini bırakır. Devre düzenlemesinde sürmekte olan işlem bus error olur. START sırasında LOW SDA bus error; düşük SDA veri biti bozabilir.

GPIO analizöründe A5=SCL / A4=SDA gerçek PIN register kenarları, cursor ve CSV vardır. Bus tablosu işlem logudur; gerçek bit dalgaları analizördedir. Clock eventleri AVR instruction sınırlarında işlendiği için yüksek hızlarda çevrim kuantizasyonu vardır. Nominal frekans TWBR/prescaler değeridir; ölçülen frekans bus beklemelerini ve firmware aralarını içerir. Analog RC rise-time, pin kapasitansı, noise/EMI ve slew-rate modeli yoktur; ek C/L devreleri mevcut bounded transient çözücünün sınırlamalarına tabidir.

## SHT31

Single-shot stretching: 0x2C06/2C0D/2C10, high/medium/low; mevcut 15/6/4 ms conversion (+ düşük besleme için 0.5 ms). Read header conversion sırasında ACK olur; ilk veri saatinden önce SCL düşük tutulur. Sonra T/RH altı bayt + CRC döner. 0x2400/240B/2416 no-stretch early read hâlâ NACK olur. `sht31-stretch` örneği gecikme koymadan read yapar, ölçülen WAIT_US ve CRC sonucunu terminale yazar.

ALERT threshold yazma/okuma, hysteresis ve aktif HIGH ALERT driver henüz yoktur. ALERT bağlanabilir fakat sürülmez; `alertSupported:false` snapshot'ta açıkça bulunur. ART ve heater ısıl etkisi de kapsam dışıdır. Stretch desteği bu özelliklerin tamamlandığı anlamına gelmez.

Kaynak: [Sensirion SHT3x-DIS v7, §4.3–4.4 ve §3.5](https://sensirion.com/media/documents/213E6A3B/63A5A569/Datasheet_SHT3x_DIS.pdf). Tam üretici cihazı veya SPICE modeli iddiası yoktur.

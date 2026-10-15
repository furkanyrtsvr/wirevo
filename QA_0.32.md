# CircuitForge 0.32 kabul kaydı

## Elektrik / regresyon

395 test, 0 hata (npm test). Yeni yedi kabul: diyot Vf=1.2V ve zener Vz=7.5V canonical ölçüm; zener negatif parametre JSON reddi; röle 100Ω bobin 5V→50mA/NO ve 2V→20mA/NC; 12V izole yükte 12/1000.05 A; anahtar açılınca sıfır akım; rheostat 50→100% ile gerçek seri akım; pasif ohmmetre 1500.05Ω ve açık kontak OL; MOSFET RDS=10Ω yükte 5/110A; NPN beta10→20 ile IC4.3→8.6mA; opamp gain10/ROUT10Ω/1kΩ yükte 1000/1010V.

Eski AVR firmware/protokol ve montaj kabulleri değişmeden koşuldu. Katalog sayısı beklentisi 68→71 (ek Nano/Pro Mini kart seçenekleriyle arayüz73). Mevcut75 firmware örneğinin kaynakları değiştirilmedi; bu aşama yeni MCU iddia etmez.

## Tarayıcı

Temiz localhost4177 origin. Katalog73; genel adlar ve yeni3parça. Devre + kütüphane: yalnız library/circuit görünür, devre1051px genişliğe açıldı. Kod + terminal: yalnız bu iki panel, center1250px; reload aynı düzen. Sol ayırıcı194→288px sürükleme/reload aynı genişlik. Zener örneğinde klavye ArrowUp/Down ile 7.6/7.5V değişikliği ve anlık7.60/7.50V ölçüm. Undo/redo7.60↔7.50. Röle ekleme: bobin V/R alanları, NC durumu, floating bobin Hi-Z. Sıfır tarayıcı JS hatası.

Panel tercihi elektrik projesinden ayrıdır; kullanıcının canlı devresi bu yerel kabul sırasında değiştirilmedi.

Tarayıcı GCC WebAssembly derlemesi başarılı; gerçek AVR çalıştırmada 7.5V zenerin 1:1 bölünmüş ADC girişinden ZENER_HALF ADC=768, ileri diyottan DIODE ADC=143 alındı. Simülasyon durduruldu.

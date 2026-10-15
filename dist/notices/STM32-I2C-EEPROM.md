# STM32 I²C1 repeated-start ve EEPROM · 0.48

14 Ekim 2026. Dokuz F103/F401/F411 kartında gerçek Clang C17 / Cortex-M3/M4F firmware ve elektriksel 24LC256 modeli. Veriler SCL/SDA darbeleri, ACK/POS/BTF ve DR üzerinden okunur.

## C API

```c
int cf_i2c1_write_read(unsigned address, const unsigned char *prefix,
                       unsigned prefix_count, unsigned char *data,
                       unsigned read_count);
int cf_i2c1_probe(unsigned address);
```

7-bit adres; prefix ve read uzunluğu ayrı ayrı 1..1024. write_read başarıda okunan bayt sayısını, hata/timeout −1 döndürür. Argümanlar bus başlamadan doğrulanır. TX BTF ardından repeated START ile yön değişir; arada STOP yoktur. Son okuma ACK/POS/NACK tail ve bir STOP ile tamamlanır. Eski write/read STOP davranışı değişmedi. probe yalnız write adresi ve STOP üretir, data baytı yazmaz; ACK başarı 0, NACK/timeout −1. Recovery nedeniyle başarısız probe sonrasında GPIO clock/STOP görülebilir. Her register beklemesi 5 ms sınırındadır; tüm transfer için toplam 5 ms sınırı değildir.

```c
unsigned char address[] = {0x12, 0x34}, result[6];
cf_i2c1_begin(100000, PB7, PB6);
int n = cf_i2c1_write_read(0x50, address, 2, result, 6);
```

Okuma ortasında hata oluşursa alınmış baytlar bufferı değiştirmiş olabilir; −1 sonucu başarılı tam kayıt değildir. CRC/checksum uygulamanın sorumluluğudur.

## 24LC256 devresi ve model

VCC 3,3 V/GND; SDA/SCL için haricî 4,7 kΩ pull-up. A0/A1/A2=0 ile adres 0x50; WP=GND yazılabilir, WP=VCC korumalı. 32 KiB EEPROM, 64 bayt page; pagewrite sınırı aşınca aynı sayfa içinde sarar. STOP sonrası modelde 5 ms yazma süresi; bu sırada adres NACK. ACK polling yazma bitişini bekler. Randomread iki adres baytı → repeated START → read. Sequentialread 32 KiB uçtan sarar. Endurance, analog brownout ve tüm vendor errata model değildir.

MCU reset haricî EEPROM belleğini, pointerını ve sürmekte olan commitin kalan süresini korur. EEPROM beslemesi kesilince bekleyen commit iptal olur; tamamlanmış bellek korunur. Bu state çalışan simülasyon içindir: uygulama yeniden yüklenmesi/yeni runtime başlatılması JSON'a kaydedilmiş kalıcı EEPROM içeriği anlamına gelmez.

## Çevre istasyonu

Yeni çevre projesinde SHT31/OLED/SPI ADC/PWM ile aynı I²C bus üzerinde EEPROM bulunur. İlk geçerli ölçüm ve her alarm değişiminde 8 bayt kayıt: CF magic, signed temperature×100, humidity×100, alarm, XOR checksum. Her örnekte yazmaz. ACK polling ve randomread ile kayıt doğrulanır; terminal MEM=0 başarı, −1 bus/timeout, −2 verify/invalid record. MCU reset sonrası EEPROM LAST satırı son alarm kaydını gösterir. Mevcut kullanıcı kaynakları/kabloları otomatik değiştirilmez; güncel örnek Yeni proje içinden açılır. EEPROM bulunmasa sensör ölçümü sürer, MEM hata verir.

## Kaynak ve kalan kapsam

[ST RM0008](https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [ST RM0368](https://www.st.com/resource/en/reference_manual/rm0368-stm32f401xbc-and-stm32f401xde-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), [ST RM0383](https://www.st.com/resource/en/reference_manual/dm00119316.pdf), [Microchip DS20001203X](https://ww1.microchip.com/downloads/aemDocuments/documents/MPD/ProductDocuments/DataSheets/24AA256-24LC256-24FC256-256-Kbit-I2C-Serial-EEPROM-20001203X.pdf).

Standard 7-bit single master; Fast/slave/multi-master/arbitration/DMA/PEC/SMBus/analog rise-time ve I²C2+ henüz yok. Ham repeated START yalnız byte sınırında; genel chained read/read veya slave biçimi yeni API değildir. [Tüm STM32 denetimi](STM32-AUDIT.md).
